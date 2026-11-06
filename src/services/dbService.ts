import { RunSession, GymLogEntry, DailyHabit, StravaTokenData } from '../types';

const DB_NAME = 'OL9_FIT_DB';
const DB_VERSION = 1;

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
          db.createObjectStore('abs_days', { keyPath: 'day' });
        }
        if (!db.objectStoreNames.contains('habits')) {
          db.createObjectStore('habits', { keyPath: 'date' });
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
      // Key can be id, day, date, or key
      const idKey = (item as any).id ?? (item as any).day ?? (item as any).date ?? (item as any).key;
      const index = items.findIndex((i: any) => {
        const k = i.id ?? i.day ?? i.date ?? i.key;
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
      const filtered = items.filter((i) => (i.id ?? i.day ?? i.date ?? i.key) !== key);
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
  // RUNS
  async saveRun(run: RunSession): Promise<void> {
    await storage.put('runs', run);
    // Automatically update daily habits
    const dateStr = run.date.split('T')[0];
    await this.recordRunInHabits(dateStr, run.distanceMeters / 1000);
  },

  async getRuns(): Promise<RunSession[]> {
    const runs = await storage.getAll<RunSession>('runs');
    return runs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async deleteRun(id: string): Promise<void> {
    await storage.delete('runs', id);
  },

  // GYM LOGS
  async saveGymLog(log: GymLogEntry): Promise<void> {
    await storage.put('gym_logs', log);
    const dateStr = log.date.split('T')[0];
    await this.recordGymInHabits(dateStr, log.totalVolumeKg);
  },

  async getGymLogs(): Promise<GymLogEntry[]> {
    const logs = await storage.getAll<GymLogEntry>('gym_logs');
    return logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  // ABS CHALLENGE
  async setAbsDayCompleted(day: number, completed: boolean): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    await storage.put('abs_days', {
      day,
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    });
    if (completed) {
      await this.recordAbsInHabits(today);
    }
  },

  async getAbsProgress(): Promise<{ day: number; completed: boolean; completedAt?: string }[]> {
    return await storage.getAll<{ day: number; completed: boolean; completedAt?: string }>('abs_days');
  },

  // HABITS & STATS
  async getHabits(): Promise<DailyHabit[]> {
    const habits = await storage.getAll<DailyHabit>('habits');
    return habits.sort((a, b) => b.date.localeCompare(a.date));
  },

  async getHabitForDate(dateStr: string): Promise<DailyHabit> {
    const habits = await this.getHabits();
    const found = habits.find((h) => h.date === dateStr);
    return found || {
      date: dateStr,
      morningRunCompleted: false,
      absChallengeCompleted: false,
      gymSessionCompleted: false,
      totalRunKm: 0,
      totalLiftedVolumeKg: 0
    };
  },

  async saveHabit(habit: DailyHabit): Promise<void> {
    await storage.put('habits', habit);
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

  // STRAVA TOKENS
  async getStravaToken(): Promise<StravaTokenData | null> {
    const raw = localStorage.getItem('ol9_strava_auth');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StravaTokenData;
    } catch {
      return null;
    }
  },

  async saveStravaToken(token: StravaTokenData): Promise<void> {
    localStorage.setItem('ol9_strava_auth', JSON.stringify(token));
  },

  async removeStravaToken(): Promise<void> {
    localStorage.removeItem('ol9_strava_auth');
  }
};
