import React, { useState, useEffect } from 'react';
import { Home, Flame, Clock, Dumbbell, Shield, Play, History, CheckCircle, ChevronRight, Sparkles, Award } from 'lucide-react';
import { HOME_ROUTINES } from '../../data/homeWorkoutData';
import { HomeRoutine, HomeWorkoutLog } from '../../types';
import { HomeWorkoutPlayerModal } from './HomeWorkoutPlayerModal';
import { dbService } from '../../services/dbService';

export const HomeWorkoutView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeRoutine, setActiveRoutine] = useState<HomeRoutine | null>(null);
  const [workoutHistory, setWorkoutHistory] = useState<HomeWorkoutLog[]>([]);
  const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null);

  const loadHistory = async () => {
    const logs = await dbService.getHomeWorkouts();
    setWorkoutHistory(logs);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const filteredRoutines = selectedCategory === 'all'
    ? HOME_ROUTINES
    : HOME_ROUTINES.filter((r) => r.category === selectedCategory);

  const totalHomeWorkoutsCompleted = workoutHistory.length;
  const totalCaloriesBurned = workoutHistory.reduce((sum, item) => sum + item.caloriesBurned, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-industrial">
      {/* Top Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-industrial-900 via-industrial-950 to-industrial-900 border border-industrial-800 p-6 shadow-2xl">
        <div
          className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-lime-accent/10 blur-3xl pointer-events-none"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-accent/15 border border-lime-accent/30 text-lime-accent text-xs font-mono font-bold mb-3 uppercase tracking-wider">
              <Home className="w-3.5 h-3.5" />
              Entrenamiento en Casa • Calistenia
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-slate-100 uppercase">
              RUTINAS <span className="text-lime-accent">BODYWEIGHT</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl font-mono">
              Entrena en cualquier lugar sin necesidad de equipamiento de gimnasio. Rutinas guiadas con animaciones paso a paso, cronómetro inteligente y conteo calórico.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex sm:flex-col gap-2 shrink-0">
            <div className="bg-industrial-950/90 border border-industrial-800 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
              <Award className="w-4 h-4 text-lime-accent" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block leading-none">Completadas</span>
                <span className="text-base font-black font-mono text-slate-100 leading-tight">
                  {totalHomeWorkoutsCompleted} <span className="text-[10px] text-slate-500">sesiones</span>
                </span>
              </div>
            </div>
            <div className="bg-industrial-950/90 border border-industrial-800 px-3.5 py-2 rounded-2xl flex items-center gap-2.5">
              <Flame className="w-4 h-4 text-gold-accent" />
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block leading-none">Calorías</span>
                <span className="text-base font-black font-mono text-gold-accent leading-tight">
                  {totalCaloriesBurned} <span className="text-[10px] text-slate-500">kcal</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex gap-2 overflow-x-auto mt-6 pt-4 border-t border-industrial-800/80 scrollbar-none">
          {[
            { id: 'all', label: 'Todas las Rutinas' },
            { id: 'hiit', label: '🔥 Cardio HIIT' },
            { id: 'upper', label: '💪 Calistenia Superior' },
            { id: 'lower', label: '🦵 Pierna & Glúteo' },
            { id: 'fullbody', label: '⚡ Full Body Express' },
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider shrink-0 transition-all border ${
                  isActive
                    ? 'bg-lime-accent text-industrial-950 border-lime-accent shadow-lime-glow font-black'
                    : 'bg-industrial-900 border-industrial-800 text-slate-400 hover:text-slate-200 hover:border-industrial-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredRoutines.map((routine) => {
          const isExpanded = expandedRoutineId === routine.id;

          return (
            <div
              key={routine.id}
              className="bg-industrial-900/90 border border-industrial-800 rounded-3xl p-5 hover:border-lime-accent/40 transition-all shadow-lg flex flex-col justify-between"
            >
              <div>
                {/* Header Tag Bar */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border"
                    style={{
                      backgroundColor: `${routine.color}15`,
                      borderColor: `${routine.color}40`,
                      color: routine.color,
                    }}
                  >
                    {routine.level}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-lime-accent" />
                    <span>{routine.durationMinutes} min</span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-black font-mono text-slate-100 uppercase tracking-tight">
                  {routine.title}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                  {routine.subtitle}
                </p>

                {/* Equipment details */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] font-mono text-slate-300 bg-industrial-950/70 px-3 py-1.5 rounded-xl border border-industrial-800">
                  <Shield className="w-3.5 h-3.5 text-gold-accent shrink-0" />
                  <span>Equipo: {routine.equipment}</span>
                </div>

                {/* Exercise Pills Preview */}
                <div className="mt-4">
                  <button
                    onClick={() => setExpandedRoutineId(isExpanded ? null : routine.id)}
                    className="flex items-center justify-between w-full text-xs font-mono text-slate-400 hover:text-slate-200 py-1"
                  >
                    <span>{routine.exercises.length} Ejercicios incluidos</span>
                    <span className="text-lime-accent text-[11px] font-bold">
                      {isExpanded ? 'Ocultar ▲' : 'Ver lista ▼'}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="mt-2 space-y-2 bg-industrial-950/90 p-3 rounded-2xl border border-industrial-800 animate-fadeIn">
                      {routine.exercises.map((ex, idx) => (
                        <div
                          key={ex.id}
                          className="flex items-center justify-between text-xs font-mono py-1 border-b border-industrial-800/60 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-center text-[10px] text-lime-accent font-bold">
                              {idx + 1}
                            </span>
                            <span className="text-slate-200 font-bold">{ex.name}</span>
                          </div>
                          <span className="text-slate-400 text-[10px]">
                            {ex.durationSeconds}s / {ex.restSeconds}s
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-5 pt-4 border-t border-industrial-800/80">
                <button
                  onClick={() => setActiveRoutine(routine)}
                  className="w-full py-3 bg-gradient-to-r from-lime-accent to-lime-glow text-industrial-950 font-black font-mono text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center gap-2 shadow-lime-glow hover:brightness-110 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" /> INICIAR RUTINA ({routine.durationMinutes} MIN)
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History Log Section */}
      {workoutHistory.length > 0 && (
        <div className="bg-industrial-900/90 border border-industrial-800 rounded-3xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-industrial-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-lime-accent" />
              <h3 className="text-sm font-black font-mono uppercase text-slate-100 tracking-wider">
                Historial de Sesiones en Casa
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {workoutHistory.length} registros
            </span>
          </div>

          <div className="space-y-2.5">
            {workoutHistory.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="bg-industrial-950/80 border border-industrial-800 p-3 rounded-2xl flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-mono font-bold text-slate-100">
                    {log.routineTitle}
                  </h4>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                    {new Date(log.date).toLocaleDateString('es-ES', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <span className="text-xs font-black font-mono text-lime-accent">
                      ~{log.caloriesBurned} kcal
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {Math.floor(log.durationSeconds / 60)} min {log.durationSeconds % 60}s
                    </span>
                  </div>
                  <CheckCircle className="w-4 h-4 text-lime-accent" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Routine Interactive Player Modal */}
      {activeRoutine && (
        <HomeWorkoutPlayerModal
          routine={activeRoutine}
          onClose={() => setActiveRoutine(null)}
          onCompleted={() => {
            loadHistory();
          }}
        />
      )}
    </div>
  );
};
