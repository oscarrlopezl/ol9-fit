import React, { useState, useEffect } from 'react';
import { Flame, Dumbbell, Compass, Award, Calendar as CalendarIcon, CheckCircle2, Circle, ChevronLeft, ChevronRight, Activity, ArrowUpRight, TrendingUp, Home } from 'lucide-react';
import { dbService } from '../../services/dbService';
import { DailyHabit, RunSession, GymLogEntry } from '../../types';

interface DashboardViewProps {
  onNavigateTab: (tab: 'dashboard' | 'running' | 'home' | 'abs' | 'gym' | 'sync') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const [habits, setHabits] = useState<DailyHabit[]>([]);
  const [runs, setRuns] = useState<RunSession[]>([]);
  const [gymLogs, setGymLogs] = useState<GymLogEntry[]>([]);
  const [absCompletedDays, setAbsCompletedDays] = useState<number>(0);

  // Selected date in calendar (defaults to today YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Calendar month/year navigation
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const loadedHabits = await dbService.getHabits();
    const loadedRuns = await dbService.getRuns();
    const loadedGymLogs = await dbService.getGymLogs();
    const absProg = await dbService.getAbsProgress();

    setHabits(loadedHabits);
    setRuns(loadedRuns);
    setGymLogs(loadedGymLogs);
    setAbsCompletedDays(absProg.filter((p) => p.completed).length);
  };

  // Toggle habit on selected date
  const handleToggleHabit = async (habitKey: 'morningRunCompleted' | 'absChallengeCompleted' | 'gymSessionCompleted' | 'homeWorkoutCompleted') => {
    const habit = await dbService.getHabitForDate(selectedDate);
    habit[habitKey] = !habit[habitKey];
    await dbService.saveHabit(habit);
    await loadData();
  };

  // Compute active streak (consecutive days with at least 1 completed habit ending today or yesterday)
  const computeActiveStreak = (): number => {
    if (habits.length === 0) return 0;
    const sorted = [...habits].sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const habit = sorted.find((h) => h.date === dateStr);

      if (habit && (habit.morningRunCompleted || habit.absChallengeCompleted || habit.gymSessionCompleted || habit.homeWorkoutCompleted)) {
        streak++;
      } else if (i === 0) {
        // Today hasn't been completed yet, continue checking yesterday
        continue;
      } else {
        break;
      }
    }
    return Math.max(streak, habits.filter((h) => h.morningRunCompleted || h.gymSessionCompleted || h.homeWorkoutCompleted).length > 0 ? 1 : 0);
  };

  // Compute Totals
  const totalKmRun = habits.reduce((sum, h) => sum + h.totalRunKm, 0) +
    runs.reduce((sum, r) => sum + r.distanceMeters / 1000, 0);

  const totalVolumeLifted = habits.reduce((sum, h) => sum + h.totalLiftedVolumeKg, 0) +
    gymLogs.reduce((sum, g) => sum + g.totalVolumeKg, 0);

  const activeStreak = computeActiveStreak();

  // Selected date's habit object
  const currentHabit = habits.find((h) => h.date === selectedDate) || {
    date: selectedDate,
    morningRunCompleted: false,
    absChallengeCompleted: false,
    gymSessionCompleted: false,
    totalRunKm: 0,
    totalLiftedVolumeKg: 0
  };

  // Calendar Days calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Shift Monday to start (0 = Monday, 6 = Sunday)
  const startOffset = (firstDayIndex + 6) % 7;

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* 1. HERO METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Streak */}
        <div className="bg-gradient-to-br from-industrial-900 to-industrial-950 border border-industrial-800 rounded-3xl p-4 shadow-industrial">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Racha Activa</span>
            <div className="w-8 h-8 rounded-xl bg-gold-amber/20 flex items-center justify-center text-gold-accent">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-gold-accent">{activeStreak}</p>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Días consecutivos</p>
        </div>

        {/* Total Km */}
        <div className="bg-gradient-to-br from-industrial-900 to-industrial-950 border border-industrial-800 rounded-3xl p-4 shadow-industrial">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Trote Acumulado</span>
            <div className="w-8 h-8 rounded-xl bg-lime-accent/20 flex items-center justify-center text-lime-accent">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-lime-accent">
            {totalKmRun.toFixed(1)} <span className="text-sm font-normal">km</span>
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-1">{runs.length} sesiones registradas</p>
        </div>

        {/* Total Volume */}
        <div className="bg-gradient-to-br from-industrial-900 to-industrial-950 border border-industrial-800 rounded-3xl p-4 shadow-industrial">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Volumen Gimnasio</span>
            <div className="w-8 h-8 rounded-xl bg-industrial-800 flex items-center justify-center text-slate-300">
              <Dumbbell className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-slate-100">
            {Math.round(totalVolumeLifted)} <span className="text-sm font-normal">kg</span>
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-1">FST-7 & Hipertrofia</p>
        </div>

        {/* Abs Progress */}
        <div className="bg-gradient-to-br from-industrial-900 to-industrial-950 border border-industrial-800 rounded-3xl p-4 shadow-industrial">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Reto Abdominal</span>
            <div className="w-8 h-8 rounded-xl bg-lime-accent/20 flex items-center justify-center text-lime-accent">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-mono text-lime-accent">
            {absCompletedDays} <span className="text-sm font-normal text-slate-500">/ 30</span>
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-1">Fase 1 Progresiva</p>
        </div>
      </div>

      {/* 2. QUICK ACCESS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateTab('running')}
          className="group bg-industrial-900 hover:bg-industrial-850 border border-industrial-800 hover:border-lime-accent/60 p-4 rounded-2xl text-left transition-all flex items-center justify-between shadow-industrial"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-slate-200 uppercase">Trote Matutino</p>
              <p className="text-[11px] text-slate-400">Telemetría GPS Propia OL9</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-lime-accent transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('abs')}
          className="group bg-industrial-900 hover:bg-industrial-850 border border-industrial-800 hover:border-lime-accent/60 p-4 rounded-2xl text-left transition-all flex items-center justify-between shadow-industrial"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-slate-200 uppercase">Reto 30 Días</p>
              <p className="text-[11px] text-slate-400">Biomecánica & Audio</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-lime-accent transition-colors" />
        </button>

        <button
          onClick={() => onNavigateTab('gym')}
          className="group bg-industrial-900 hover:bg-industrial-850 border border-industrial-800 hover:border-gold-accent/60 p-4 rounded-2xl text-left transition-all flex items-center justify-between shadow-industrial"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gold-amber/20 border border-gold-accent/40 flex items-center justify-center text-gold-accent">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-slate-200 uppercase">Gimnasio Vespertino</p>
              <p className="text-[11px] text-slate-400">Modo FST-7 con 30s</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-gold-accent transition-colors" />
        </button>
      </div>

      {/* 3. INTERACTIVE MONTHLY CALENDAR & DAILY HABIT TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-7 bg-industrial-900/90 border border-industrial-800 rounded-3xl p-5 shadow-industrial">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-lime-accent" />
              <h2 className="text-sm font-black font-mono text-slate-100 uppercase tracking-wider">
                {monthNames[month]} {year}
              </h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg bg-industrial-800 text-slate-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date())}
                className="px-2 py-1 rounded-lg bg-industrial-800 text-xs font-mono text-slate-300 hover:text-white"
              >
                Hoy
              </button>
              <button
                onClick={() => setCurrentMonthDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg bg-industrial-800 text-slate-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold uppercase text-slate-500 mb-2">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
            <span>Dom</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty offset days */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-12 rounded-xl bg-industrial-950/40 opacity-20" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === todayStr;

              const dayHabit = habits.find((h) => h.date === dateStr);
              const hasRun = dayHabit?.morningRunCompleted || runs.some((r) => r.date.startsWith(dateStr));
              const hasAbs = dayHabit?.absChallengeCompleted;
              const hasGym = dayHabit?.gymSessionCompleted || gymLogs.some((g) => g.date.startsWith(dateStr));
              const hasHome = dayHabit?.homeWorkoutCompleted;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-12 rounded-xl p-1 flex flex-col justify-between items-center transition-all border ${
                    isSelected
                      ? 'border-lime-accent bg-industrial-800 shadow-lime-glow'
                      : isToday
                      ? 'border-slate-500 bg-industrial-950'
                      : 'border-industrial-800/80 bg-industrial-950/70 hover:border-industrial-700'
                  }`}
                >
                  <span className={`text-[11px] font-mono font-bold ${isToday ? 'text-lime-accent' : 'text-slate-300'}`}>
                    {dayNum}
                  </span>

                  {/* Habit Activity Dots */}
                  <div className="flex gap-1 items-center">
                    {hasRun && <span className="w-1.5 h-1.5 rounded-full bg-lime-accent shadow-sm" title="Trote" />}
                    {hasAbs && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm" title="Abdomen" />}
                    {hasGym && <span className="w-1.5 h-1.5 rounded-full bg-gold-accent shadow-sm" title="Gimnasio" />}
                    {hasHome && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-sm" title="En Casa" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[10px] font-mono text-slate-400 mt-4 pt-3 border-t border-industrial-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-lime-accent" /> Trote
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Abdomen
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gold-accent" /> Gimnasio
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> En Casa
            </span>
          </div>
        </div>

        {/* Daily Habits Checklist for Selected Date (5 cols) */}
        <div className="lg:col-span-5 bg-industrial-900/90 border border-industrial-800 rounded-3xl p-5 shadow-industrial flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-industrial-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Seguimiento de Hábitos
                </span>
                <h3 className="text-sm font-black font-mono text-slate-100">
                  {selectedDate === todayStr ? 'Hoy, ' : ''}{selectedDate}
                </h3>
              </div>
              <span className="text-xs font-mono bg-industrial-950 px-2.5 py-1 rounded-lg border border-industrial-800 text-lime-accent font-bold">
                {selectedDate === todayStr ? 'DÍA EN CURSO' : 'HISTORIAL'}
              </span>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              {/* 1. Morning Run */}
              <div
                onClick={() => handleToggleHabit('morningRunCompleted')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentHabit.morningRunCompleted
                    ? 'bg-lime-accent/10 border-lime-accent/50'
                    : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentHabit.morningRunCompleted ? 'bg-lime-accent text-industrial-950' : 'bg-industrial-850 text-slate-400'}`}>
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-100">Trote Matutino Progresivo</p>
                    <p className="text-[10px] text-slate-400">
                      {currentHabit.totalRunKm > 0 ? `${currentHabit.totalRunKm} km registrados` : 'Telemetría GPS OL9 Track'}
                    </p>
                  </div>
                </div>
                {currentHabit.morningRunCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-lime-accent" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              {/* 2. Abs Challenge */}
              <div
                onClick={() => handleToggleHabit('absChallengeCompleted')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentHabit.absChallengeCompleted
                    ? 'bg-cyan-500/10 border-cyan-500/50'
                    : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentHabit.absChallengeCompleted ? 'bg-cyan-400 text-industrial-950' : 'bg-industrial-850 text-slate-400'}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-100">Reto 30 Días Abdominales</p>
                    <p className="text-[10px] text-slate-400">Protocolo 30s trabajo / 15s descanso</p>
                  </div>
                </div>
                {currentHabit.absChallengeCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              {/* 3. Gym Session */}
              <div
                onClick={() => handleToggleHabit('gymSessionCompleted')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentHabit.gymSessionCompleted
                    ? 'bg-gold-amber/10 border-gold-accent/50'
                    : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentHabit.gymSessionCompleted ? 'bg-gold-accent text-industrial-950' : 'bg-industrial-850 text-slate-400'}`}>
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-100">Sesión de Gimnasio Vespertino</p>
                    <p className="text-[10px] text-slate-400">
                      {currentHabit.totalLiftedVolumeKg > 0 ? `${currentHabit.totalLiftedVolumeKg} kg levantados` : 'División semanal + Remate FST-7'}
                    </p>
                  </div>
                </div>
                {currentHabit.gymSessionCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-gold-accent" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>

              {/* 4. Home Workout (Calisthenics) */}
              <div
                onClick={() => handleToggleHabit('homeWorkoutCompleted')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  currentHabit.homeWorkoutCompleted
                    ? 'bg-purple-500/10 border-purple-500/50'
                    : 'bg-industrial-950 border-industrial-800 hover:border-industrial-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${currentHabit.homeWorkoutCompleted ? 'bg-purple-400 text-industrial-950' : 'bg-industrial-850 text-slate-400'}`}>
                    <Home className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-100">Entrenamiento en Casa</p>
                    <p className="text-[10px] text-slate-400">HIIT, Calistenia & Peso Corporal</p>
                  </div>
                </div>
                {currentHabit.homeWorkoutCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-purple-400" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600" />
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-industrial-800 text-center">
            <p className="text-[11px] text-slate-400 font-mono">
              Persistencia offline en IndexedDB. Los hábitos completados alimentan automáticamente tu racha activa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
