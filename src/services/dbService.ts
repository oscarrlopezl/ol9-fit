import { RunSession, GymLogEntry, DailyHabit, HomeWorkoutLog } from '../types';
import { authService } from './authService';

const DB_NAME = 'OL9_FIT_DB';
const DB_VERSION = 2;

class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private isSupported = typeof window !== 'undefined' && 'indexedDB' in window;

  async init(): Promise<IDBDatabase | null> {
    if (!this.isSupported) return null;
    if (this.db) return this.db;

    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('runs')) {
          db.createObjectStore('runs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('gym_logs')) {
          db.createObjectStore('gym_logs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('abs_days')) {
          db.createObjectStore('abs_days', { keyPath: 'user_day_key' });
        }
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'user_date_key' });
        }
        if (!db.objectStoreNames.contains('home_workouts')) {
          db.createObjectStore('home_workouts', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onerror = (err) => {
        console.warn('Error opening IndexedDB, falling back to localStorage:', err);
        resolve(null);
      };
    });
  }

  // Generic getter
  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.init();
    if (!db) {
      const raw = localStorage.getItem(`ol9_${storeName}`);
      return raw ? JSON.parse(raw) : [];
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result as T[]);
        req.onerror = () => resolve([]);
      } catch (err) {
        console.warn(`IndexedDB getAll error on ${storeName}:`, err);
        resolve([]);
      }
    });
  }

  // Generic put
  async put<T>(storeName: string, item: T): Promise<void> {
    const db = await this.init();
    if (!db) {
      const items = await this.getAll<T>(storeName);
      const idKey = (item as any).id ?? (item as any).user_day_key ?? (item as any).user_date_key ?? (item as any).day ?? (item as any).date ?? (item as any).key;
      const index = items.findIndex((i: any) => {
        const k = i.id ?? i.user_day_key ?? i.user_date_key ?? i.day ?? i.date ?? i.key;
        return k === idKey;
      });
      if (index >= 0) {
        items[index] = item;
      } else {
        items.push(item);
      }
      localStorage.setItem(`ol9_${storeName}`, JSON.stringify(items));
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.put(item);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      } catch (err) {
        console.warn(`IndexedDB put error on ${storeName}:`, err);
        resolve();
      }
    });
  }

  // Generic delete
  async delete(storeName: string, key: string | number): Promise<void> {
    const db = await this.init();
    if (!db) {
      const items = await this.getAll<any>(storeName);
      const filtered = items.filter((i) => (i.id ?? i.user_day_key ?? i.user_date_key ?? i.day ?? i.date ?? i.key) !== key);
      localStorage.setItem(`ol9_${storeName}`, JSON.stringify(filtered));
      return;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        store.delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch (err) {
        console.warn(`IndexedDB delete error on ${storeName}:`, err);
        resolve();
      }
    });
  }
}

const storage = new IndexedDBStorage();

export const dbService = {
  getActiveUserId(): string {
    return authService.getActiveUser().id;
  },

  // 1. RUNS (Partitioned by user)
  async saveRun(run: RunSession): Promise<void> {
    const userId = this.getActiveUserId();
    const runWithUser: RunSession = {
      ...run,
      userId: run.userId || userId,
    };
    await storage.put('runs', runWithUser);
    const dateStr = run.date.split('T')[0];
    await this.recordRunInHabits(dateStr, run.distanceMeters / 1000);
  },

  async getRuns(): Promise<RunSession[]> {
    const activeUserId = this.getActiveUserId();
    const allRuns = await storage.getAll<RunSession>('runs');
    // Filter runs for the active user (unassigned runs default to owner usr_oscar)
    const userRuns = allRuns.filter((r) => r.userId === activeUserId || (!r.userId && activeUserId === 'usr_oscar'));
    return userRuns.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async deleteRun(id: string): Promise<void> {
    await storage.delete('runs', id);
  },

  // 2. GYM LOGS (Partitioned by user)
  async saveGymLog(log: GymLogEntry): Promise<void> {
    const userId = this.getActiveUserId();
    const logWithUser: GymLogEntry = {
      ...log,
      userId: log.userId || userId,
    };
    await storage.put('gym_logs', logWithUser);
    const dateStr = log.date.split('T')[0];
    await this.recordGymInHabits(dateStr, log.totalVolumeKg);
  },

  async getGymLogs(): Promise<GymLogEntry[]> {
    const activeUserId = this.getActiveUserId();
    const allLogs = await storage.getAll<GymLogEntry>('gym_logs');
    const userLogs = allLogs.filter((l) => l.userId === activeUserId || (!l.userId && activeUserId === 'usr_oscar'));
    return userLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // 3. HOME WORKOUTS (Partitioned by user)
  async saveHomeWorkout(log: HomeWorkoutLog): Promise<void> {
    const userId = this.getActiveUserId();
    const logWithUser = {
      ...log,
      userId: log.userId || userId,
    };
    await storage.put('home_workouts', logWithUser);
    const dateStr = log.date.split('T')[0];
    await this.recordHomeInHabits(dateStr);
  },

  async getHomeWorkouts(): Promise<HomeWorkoutLog[]> {
    const activeUserId = this.getActiveUserId();
    const all = await storage.getAll<HomeWorkoutLog>('home_workouts');
    return all
      .filter((h) => h.userId === activeUserId || (!h.userId && activeUserId === 'usr_oscar'))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // 4. ABS CHALLENGE (Partitioned by user)
  async setAbsDayCompleted(day: number, completed: boolean): Promise<void> {
    const userId = this.getActiveUserId();
    const today = new Date().toISOString().split('T')[0];
    const userDayKey = `${userId}_day_${day}`;

    await storage.put('abs_days', {
      user_day_key: userDayKey,
      userId,
      day,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined,
    });

    if (completed) {
      await this.recordAbsInHabits(today);
    }
  },

  async getAbsProgress(): Promise<{ day: number; completed: boolean; completedAt?: string }[]> {
    const userId = this.getActiveUserId();
    const all = await storage.getAll<any>('abs_days');
    const userProgress = all.filter((item) => item.userId === userId || (!item.userId && userId === 'usr_oscar'));
    return userProgress.map((item) => ({
      day: item.day,
      completed: item.completed,
      completedAt: item.completedAt,
    }));
  },

  // 5. HABITS & STATS (Partitioned by user)
  async getHabits(): Promise<DailyHabit[]> {
    const userId = this.getActiveUserId();
    const all = await storage.getAll<any>('habits');
    const userHabits = all.filter((h) => h.userId === userId || (!h.userId && userId === 'usr_oscar'));
    return userHabits.sort((a, b) => b.date.localeCompare(a.date));
  },

  async getHabitForDate(dateStr: string): Promise<DailyHabit> {
    const userId = this.getActiveUserId();
    const habits = await this.getHabits();
    const found = habits.find((h) => h.date === dateStr);
    return (
      found || {
        date: dateStr,
        userId,
        morningRunCompleted: false,
        absChallengeCompleted: false,
        gymSessionCompleted: false,
        homeWorkoutCompleted: false,
        totalRunKm: 0,
        totalLiftedVolumeKg: 0,
      }
    );
  },

  async saveHabit(habit: DailyHabit): Promise<void> {
    const userId = this.getActiveUserId();
    const userDateKey = `${userId}_date_${habit.date}`;
    const habitWithKey = {
      ...habit,
      userId,
      user_date_key: userDateKey,
    };
    await storage.put('habits', habitWithKey);
  },

  async recordRunInHabits(dateStr: string, distanceKm: number): Promise<void> {
    const habit = await this.getHabitForDate(dateStr);
    habit.morningRunCompleted = true;
    habit.totalRunKm = Number((habit.totalRunKm + distanceKm).toFixed(2));
    await this.saveHabit(habit);
  },

  async recordGymInHabits(dateStr: string, volumeKg: number): Promise<void> {
    const habit = await this.getHabitForDate(dateStr);
    habit.gymSessionCompleted = true;
    habit.totalLiftedVolumeKg = Number((habit.totalLiftedVolumeKg + volumeKg).toFixed(1));
    await this.saveHabit(habit);
  },

  async recordAbsInHabits(dateStr: string): Promise<void> {
    const habit = await this.getHabitForDate(dateStr);
    habit.absChallengeCompleted = true;
    await this.saveHabit(habit);
  },

  async recordHomeInHabits(dateStr: string): Promise<void> {
    const habit = await this.getHabitForDate(dateStr);
    habit.homeWorkoutCompleted = true;
    await this.saveHabit(habit);
  },
};
