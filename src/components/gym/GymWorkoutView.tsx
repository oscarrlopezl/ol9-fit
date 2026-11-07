import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, CheckCircle, Clock, Award, Shield, Plus, Sparkles, Coffee, Film, X } from 'lucide-react';
import { GYM_SPLIT } from '../../data/gymSplitData';
import { GymDailyRoutine, GymExercise, GymLogEntry } from '../../types';
import { Fst7EngineModal } from './Fst7EngineModal';
import { ExerciseGifVisualizer } from '../common/ExerciseGifVisualizer';
import { dbService } from '../../services/dbService';

export const GymWorkoutView: React.FC = () => {
  // Determine current day of week (0=domingo, 1=lunes, ..., 6=sabado)
  const currentDayIndex = new Date().getDay();
  const dayKeyMap: Record<number, string> = {
    0: 'domingo',
    1: 'lunes',
    2: 'martes',
    3: 'miercoles',
    4: 'jueves',
    5: 'viernes',
    6: 'sabado'
  };
  const initialKey = dayKeyMap[currentDayIndex] || 'lunes';

  const [activeDayKey, setActiveDayKey] = useState<string>(initialKey);
  const [routines, setRoutines] = useState<GymDailyRoutine[]>(GYM_SPLIT);
  const [selectedFst7Exercise, setSelectedFst7Exercise] = useState<GymExercise | null>(null);
  const [visualizingExercise, setVisualizingExercise] = useState<GymExercise | null>(null);
  const [savedNotification, setSavedNotification] = useState<string | null>(null);

  const activeRoutine = routines.find((r) => r.dayKey === activeDayKey) || routines[0];

  // Weight and reps state for regular sets
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, { weight: number; reps: number; completed: boolean }[]>>({});

  useEffect(() => {
    // Initialize default set logs
    const initialLogs: Record<string, { weight: number; reps: number; completed: boolean }[]> = {};
    activeRoutine.exercises.forEach((ex) => {
      initialLogs[ex.id] = ex.sets.map(() => ({
        weight: 50,
        reps: 10,
        completed: false
      }));
    });
    setExerciseLogs(initialLogs);
  }, [activeDayKey, activeRoutine]);

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] || [];
      const updated = [...currentSets];
      if (updated[setIndex]) {
        updated[setIndex] = {
          ...updated[setIndex],
          completed: !updated[setIndex].completed
        };
      }
      return { ...prev, [exerciseId]: updated };
    });
  };

  const updateSetWeight = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] || [];
      const updated = [...currentSets];
      if (updated[setIndex]) {
        updated[setIndex] = {
          ...updated[setIndex],
          weight: Math.max(0, updated[setIndex].weight + delta)
        };
      }
      return { ...prev, [exerciseId]: updated };
    });
  };

  const updateSetReps = (exerciseId: string, setIndex: number, delta: number) => {
    setExerciseLogs((prev) => {
      const currentSets = prev[exerciseId] || [];
      const updated = [...currentSets];
      if (updated[setIndex]) {
        updated[setIndex] = {
          ...updated[setIndex],
          reps: Math.max(1, updated[setIndex].reps + delta)
        };
      }
      return { ...prev, [exerciseId]: updated };
    });
  };

  // Calculate total volume lifted
  const totalVolumeKg = Object.entries(exerciseLogs).reduce((total, [, sets]) => {
    return total + sets.filter((s) => s.completed).reduce((sum, s) => sum + s.weight * s.reps, 0);
  }, 0);

  const completedSetsCount = Object.values(exerciseLogs).reduce((acc, sets) => {
    return acc + sets.filter((s) => s.completed).length;
  }, 0);

  const handleSaveWorkout = async () => {
    for (const ex of activeRoutine.exercises) {
      const sets = exerciseLogs[ex.id] || [];
      const completedSets = sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        const volume = completedSets.reduce((sum, s) => sum + s.weight * s.reps, 0);
        const logEntry: GymLogEntry = {
          id: 'gym_' + Date.now() + '_' + ex.id,
          date: new Date().toISOString(),
          dayKey: activeDayKey,
          exerciseName: ex.name,
          totalSets: completedSets.length,
          sets: completedSets.map((s, idx) => ({
            setNumber: idx + 1,
            weightKg: s.weight,
            reps: s.reps,
            completed: true
          })),
          totalVolumeKg: volume,
          isFst7: !!ex.isFst7Finisher
        };
        await dbService.saveGymLog(logEntry);
      }
    }

    setSavedNotification('¡Sesión registrada en la bitácora e IndexedDB!');
    setTimeout(() => setSavedNotification(null), 4000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-industrial-950 via-industrial-900 to-industrial-950 border border-industrial-800 rounded-3xl p-5 sm:p-6 shadow-industrial relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-accent animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-gold-accent">
                DIVISIÓN HIPERTROFIA + MOTOR FST-7
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight uppercase">
              GIMNASIO VESPERTINO
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
              Rutina Lunes a Viernes con aislamiento fascial FST-7. Registra cargas, repeticiones y activa el cronómetro de 30s.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-industrial-950/80 border border-industrial-800 px-4 py-3 rounded-2xl">
            <div className="text-right">
              <p className="text-[11px] font-mono uppercase text-slate-400">Volumen Hoy</p>
              <p className="text-xl font-black font-mono text-gold-accent">{totalVolumeKg} <span className="text-slate-500 text-sm">kg</span></p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-gold-accent flex items-center justify-center font-mono font-bold text-xs text-gold-accent shadow-gold-glow">
              {completedSetsCount}s
            </div>
          </div>
        </div>

        {/* Saved Toast Notification */}
        {savedNotification && (
          <div className="mt-4 p-3 bg-lime-accent/20 border border-lime-accent text-lime-accent rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce">
            <CheckCircle className="w-4 h-4" />
            {savedNotification}
          </div>
        )}
      </div>

      {/* Day Selector Ribbon */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {routines.map((routine) => {
          const isActive = routine.dayKey === activeDayKey;
          return (
            <button
              key={routine.dayKey}
              onClick={() => setActiveDayKey(routine.dayKey)}
              className={`px-4 py-2.5 rounded-2xl font-mono text-xs font-bold uppercase tracking-wider shrink-0 transition-all border ${
                isActive
                  ? 'bg-gradient-to-r from-gold-amber to-gold-accent text-industrial-950 border-gold-accent shadow-gold-glow font-black'
                  : 'bg-industrial-900 border-industrial-800 text-slate-400 hover:border-industrial-700'
              }`}
            >
              {routine.dayName}
              {routine.isRestDay && ' (Descanso)'}
            </button>
          );
        })}
      </div>

      {/* Active Day Card Header */}
      <div className="bg-industrial-900/90 border border-industrial-800 rounded-3xl p-5 shadow-inner">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-industrial-800 pb-3">
          <div>
            <h2 className="text-lg font-black text-slate-100 font-mono uppercase tracking-tight">
              {activeRoutine.title}
            </h2>
            <p className="text-xs text-lime-accent font-mono mt-0.5">
              Enfoque: {activeRoutine.focus}
            </p>
          </div>
          {activeRoutine.fst7RecommendedExercise && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-amber/20 border border-gold-accent/40 rounded-xl text-xs font-mono text-gold-accent">
              <Flame className="w-3.5 h-3.5 fill-current" />
              Remate FST-7: {activeRoutine.fst7RecommendedExercise}
            </div>
          )}
        </div>

        {/* REST DAY DISPLAY */}
        {activeRoutine.isRestDay ? (
          <div className="py-12 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-industrial-800 border border-industrial-700 flex items-center justify-center text-lime-accent mb-4">
              <Coffee className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-slate-100 font-mono uppercase">
              Descanso y Recuperación Activa
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              El tejido muscular se reconstruye durante el reposo. Recomendado: trote matutino suave de 20 minutos, movilidad articular, foam roller y recarga adecuada de proteínas e hidratación.
            </p>
          </div>
        ) : (
          /* WORKOUT EXERCISES LIST */
          <div className="space-y-4 mt-4">
            {activeRoutine.exercises.map((exercise, exIdx) => {
              const sets = exerciseLogs[exercise.id] || [];
              const isFinisher = exercise.isFst7Finisher;

              return (
                <div
                  key={exercise.id}
                  className={`bg-industrial-950/80 border rounded-2xl p-4 transition-all ${
                    isFinisher
                      ? 'border-gold-accent/50 bg-gradient-to-br from-industrial-950 to-gold-amber/10 shadow-gold-glow'
                      : 'border-industrial-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-industrial-900 border border-industrial-700 flex items-center justify-center font-mono font-bold text-xs text-lime-accent shrink-0">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 font-mono">
                          {exercise.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono">
                          {exercise.targetMuscle} • {exercise.setsCount} series × {exercise.targetReps}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* BOTÓN VER ANIMACIÓN / GIF */}
                      <button
                        onClick={() => setVisualizingExercise(exercise)}
                        className="px-2.5 py-1.5 rounded-xl bg-industrial-900 border border-industrial-700 hover:border-lime-accent/50 text-slate-300 hover:text-lime-accent text-xs font-mono font-bold flex items-center gap-1 transition-all"
                        title="Ver Demostración Animada / GIF"
                      >
                        <Film className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">GIF</span>
                      </button>

                      {/* INTERRUPTOR/BOTÓN: ACTIVAR MODO FST-7 */}
                      <button
                        onClick={() => setSelectedFst7Exercise(exercise)}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                          isFinisher
                            ? 'bg-gold-accent text-industrial-950 shadow-gold-glow animate-pulse font-black'
                            : 'bg-industrial-900 border border-gold-accent/40 text-gold-accent hover:bg-gold-amber/20'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        Activar Modo FST-7
                      </button>
                    </div>
                  </div>

                  {/* Regular Sets Tracker */}
                  <div className="space-y-2 mt-3 pt-3 border-t border-industrial-800/80">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-mono uppercase text-slate-400 px-1">
                      <span className="col-span-2">Serie</span>
                      <span className="col-span-4 text-center">Carga (kg)</span>
                      <span className="col-span-4 text-center">Reps</span>
                      <span className="col-span-2 text-right">Completar</span>
                    </div>

                    {sets.map((set, sIdx) => (
                      <div
                        key={sIdx}
                        className={`grid grid-cols-12 gap-2 items-center p-2 rounded-xl border transition-all ${
                          set.completed
                            ? 'bg-lime-accent/10 border-lime-accent/40'
                            : 'bg-industrial-900 border-industrial-800'
                        }`}
                      >
                        <span className="col-span-2 font-mono text-xs font-bold text-slate-300">
                          #{sIdx + 1}
                        </span>

                        <div className="col-span-4 flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateSetWeight(exercise.id, sIdx, -2.5)}
                            className="w-6 h-6 rounded bg-industrial-800 text-slate-300 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-slate-100 min-w-[3ch] text-center">
                            {set.weight}
                          </span>
                          <button
                            onClick={() => updateSetWeight(exercise.id, sIdx, 2.5)}
                            className="w-6 h-6 rounded bg-industrial-800 text-slate-300 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="col-span-4 flex items-center justify-center gap-1">
                          <button
                            onClick={() => updateSetReps(exercise.id, sIdx, -1)}
                            className="w-6 h-6 rounded bg-industrial-800 text-slate-300 text-xs font-bold"
                          >
                            -
                          </button>
                          <span className="font-mono text-xs font-bold text-slate-100 min-w-[3ch] text-center">
                            {set.reps}
                          </span>
                          <button
                            onClick={() => updateSetReps(exercise.id, sIdx, 1)}
                            className="w-6 h-6 rounded bg-industrial-800 text-slate-300 text-xs font-bold"
                          >
                            +
                          </button>
                        </div>

                        <div className="col-span-2 flex justify-end">
                          <button
                            onClick={() => toggleSetComplete(exercise.id, sIdx)}
                            className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all ${
                              set.completed
                                ? 'bg-lime-accent text-industrial-950 border-lime-accent shadow-lime-glow'
                                : 'border-industrial-700 hover:border-slate-400 text-transparent'
                            }`}
                          >
                            <CheckCircle className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Save Entire Workout Button */}
            <div className="pt-4">
              <button
                onClick={handleSaveWorkout}
                disabled={completedSetsCount === 0}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-lime-dark via-lime-accent to-lime-dark hover:opacity-95 text-industrial-950 font-black font-mono uppercase tracking-wider text-sm shadow-lime-glow disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Shield className="w-5 h-5" />
                Guardar Sesión en Bitácora ({completedSetsCount} series completadas)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FST-7 Interactive Modal Engine */}
      {selectedFst7Exercise && (
        <Fst7EngineModal
          exercise={selectedFst7Exercise}
          dayKey={activeDayKey}
          onClose={() => setSelectedFst7Exercise(null)}
          onFinish={() => {
            setSelectedFst7Exercise(null);
            setSavedNotification('¡Protocolo FST-7 de 7 series completado y guardado!');
            setTimeout(() => setSavedNotification(null), 4000);
          }}
        />
      )}

      {/* Exercise Demonstration / GIF Visualizer Modal */}
      {visualizingExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-md bg-industrial-900 border border-industrial-800 rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-industrial-800 mb-3">
              <div>
                <h3 className="text-sm font-black font-mono text-slate-100 uppercase tracking-tight">
                  {visualizingExercise.name}
                </h3>
                <p className="text-xs font-mono text-lime-accent">
                  {visualizingExercise.targetMuscle}
                </p>
              </div>
              <button
                onClick={() => setVisualizingExercise(null)}
                className="p-2 rounded-xl bg-industrial-950 border border-industrial-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ExerciseGifVisualizer
              exerciseName={visualizingExercise.name}
              animationType={
                visualizingExercise.targetMuscle.toLowerCase().includes('pecho') || visualizingExercise.name.toLowerCase().includes('press')
                  ? 'pushups'
                  : visualizingExercise.targetMuscle.toLowerCase().includes('cuádriceps') || visualizingExercise.name.toLowerCase().includes('sentadilla')
                  ? 'squats'
                  : visualizingExercise.targetMuscle.toLowerCase().includes('glúteo') || visualizingExercise.name.toLowerCase().includes('hip')
                  ? 'glute-bridge'
                  : visualizingExercise.targetMuscle.toLowerCase().includes('tríceps') || visualizingExercise.name.toLowerCase().includes('fondo')
                  ? 'dips'
                  : 'jumping-jacks'
              }
              targetMuscles={[visualizingExercise.targetMuscle]}
              customGifUrl={visualizingExercise.gifUrl}
            />

            <div className="mt-3 text-center">
              <span className="text-[11px] font-mono text-slate-400">
                {visualizingExercise.setsCount} series recomendadas × {visualizingExercise.targetReps}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
