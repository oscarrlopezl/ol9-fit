import { RunSession } from '../types';

export interface PersonalRecord {
  type: 'fastest_1k' | 'fastest_5k' | 'longest_distance' | 'fastest_pace' | 'most_calories';
  title: string;
  value: string;
  rawValue: number;
  date: string;
  runId: string;
}

const STORAGE_KEY = 'ol9_personal_records';

class OL9RecordsService {
  // Get all saved personal records
  getRecords(): Record<string, PersonalRecord> {
    if (typeof window === 'undefined') return {};
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }

  // Check if a new run session breaks any personal records
  evaluateRun(session: RunSession): { newRecords: PersonalRecord[]; allRecords: Record<string, PersonalRecord> } {
    const current = this.getRecords();
    const newRecords: PersonalRecord[] = [];

    const distKm = session.distanceMeters / 1000;

    // 1. Longest Distance
    if (distKm > 0 && (!current.longest_distance || session.distanceMeters > current.longest_distance.rawValue)) {
      const rec: PersonalRecord = {
        type: 'longest_distance',
        title: 'Mayor Distancia',
        value: `${distKm.toFixed(2)} km`,
        rawValue: session.distanceMeters,
        date: session.date,
        runId: session.id,
      };
      current.longest_distance = rec;
      newRecords.push(rec);
    }

    // 2. Fastest Average Pace (only for runs >= 1 km)
    if (distKm >= 1 && session.avgPaceSecondsPerKm > 60) {
      if (!current.fastest_pace || session.avgPaceSecondsPerKm < current.fastest_pace.rawValue) {
        const min = Math.floor(session.avgPaceSecondsPerKm / 60);
        const sec = Math.round(session.avgPaceSecondsPerKm % 60).toString().padStart(2, '0');
        const rec: PersonalRecord = {
          type: 'fastest_pace',
          title: 'Mejor Ritmo Medio',
          value: `${min}:${sec} /km`,
          rawValue: session.avgPaceSecondsPerKm,
          date: session.date,
          runId: session.id,
        };
        current.fastest_pace = rec;
        newRecords.push(rec);
      }
    }

    // 3. Fastest 1K Split
    if (session.splits && session.splits.length > 0) {
      const fastestSplit = session.splits.reduce((fastest, s) =>
        s.paceSecondsPerKm < fastest.paceSecondsPerKm ? s : fastest
      , session.splits[0]);

      if (!current.fastest_1k || fastestSplit.paceSecondsPerKm < current.fastest_1k.rawValue) {
        const min = Math.floor(fastestSplit.paceSecondsPerKm / 60);
        const sec = Math.round(fastestSplit.paceSecondsPerKm % 60).toString().padStart(2, '0');
        const rec: PersonalRecord = {
          type: 'fastest_1k',
          title: 'Mejor Kilómetro (1K)',
          value: `${min}:${sec} min`,
          rawValue: fastestSplit.paceSecondsPerKm,
          date: session.date,
          runId: session.id,
        };
        current.fastest_1k = rec;
        newRecords.push(rec);
      }
    }

    // 4. Most Calories Burned
    if (session.calories > 0 && (!current.most_calories || session.calories > current.most_calories.rawValue)) {
      const rec: PersonalRecord = {
        type: 'most_calories',
        title: 'Mayor Gasto Calórico',
        value: `${session.calories} kcal`,
        rawValue: session.calories,
        date: session.date,
        runId: session.id,
      };
      current.most_calories = rec;
      newRecords.push(rec);
    }

    // Save updated records
    if (newRecords.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    }

    return { newRecords, allRecords: current };
  }
}

export const ol9RecordsService = new OL9RecordsService();
