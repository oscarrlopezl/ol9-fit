export interface GeoPoint {
  lat: number;
  lng: number;
  altitude?: number;
  speed?: number; // m/s
  timestamp: number;
}

export interface Split {
  km: number;
  timeSeconds: number;
  paceSecondsPerKm: number;
  elevationDelta?: number;
}

export interface RunSession {
  id: string;
  date: string; // ISO
  durationSeconds: number;
  distanceMeters: number;
  calories: number;
  avgPaceSecondsPerKm: number;
  avgSpeedKmh: number;
  currentPaceSecondsPerKm?: number;
  cadenceSpm: number;
  avgHeartRate?: number;
  route: GeoPoint[];
  splits: Split[];
  elevationGainMeters: number;
  stravaSynced?: boolean;
  stravaActivityId?: string;
  source?: 'live' | 'gpx' | 'tcx' | 'fit' | 'demo';
  notes?: string;
}

export type AbsDifficultyLevel = 1 | 2 | 3;

export interface AbsExercise {
  id: string;
  name: string;
  targetMuscles: string[]; // e.g. ["Recto Abdominal", "Oblicuos"]
  level: AbsDifficultyLevel;
  durationSeconds: number; // usually 30s
  restSeconds: number; // usually 15s
  repsGuide?: string;
  instructions: string[];
  coachingCue: string;
  svgType: string;
}

export interface AbsChallengeDay {
  day: number; // 1 to 30
  level: AbsDifficultyLevel;
  levelName: string;
  exerciseIds: string[];
  completed: boolean;
  completedAt?: string;
  durationSecondsTotal: number;
}

export interface GymExerciseSet {
  setNumber: number;
  targetReps: string;
  repsDone?: number;
  weightKg?: number;
  completed: boolean;
  isFst7?: boolean;
}

export interface GymExercise {
  id: string;
  name: string;
  targetMuscle: string;
  setsCount: number;
  targetReps: string;
  isFst7Eligible?: boolean;
  isFst7Finisher?: boolean;
  isFst7Active?: boolean;
  notes?: string;
  sets: GymExerciseSet[];
}

export interface GymDailyRoutine {
  dayKey: 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
  dayName: string;
  title: string;
  focus: string;
  isRestDay: boolean;
  exercises: GymExercise[];
  fst7RecommendedExercise?: string;
}

export interface GymLogEntry {
  id: string;
  date: string;
  dayKey: string;
  exerciseName: string;
  totalSets: number;
  sets: { setNumber: number; weightKg: number; reps: number; completed: boolean }[];
  totalVolumeKg: number;
  isFst7: boolean;
  notes?: string;
}

export interface DailyHabit {
  date: string; // YYYY-MM-DD
  morningRunCompleted: boolean;
  absChallengeCompleted: boolean;
  gymSessionCompleted: boolean;
  totalRunKm: number;
  totalLiftedVolumeKg: number;
  notes?: string;
}

export interface WearableDeviceState {
  connected: boolean;
  deviceName: string | null;
  heartRate: number | null;
  batteryLevel?: number | null;
  lastSyncTimestamp?: number;
}

export interface StravaTokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athlete?: {
    id: number;
    username: string;
    firstname: string;
    lastname: string;
  };
}
