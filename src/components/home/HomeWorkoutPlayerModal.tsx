import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, X, Volume2, VolumeX, CheckCircle, Flame, Trophy, Award } from 'lucide-react';
import { HomeRoutine, HomeExercise } from '../../types';
import { ExerciseGifVisualizer } from '../common/ExerciseGifVisualizer';
import { audioService } from '../../services/audioService';
import { dbService } from '../../services/dbService';
import confetti from 'canvas-confetti';

interface HomeWorkoutPlayerModalProps {
  routine: HomeRoutine;
  onClose: () => void;
  onCompleted: () => void;
}

export const HomeWorkoutPlayerModal: React.FC<HomeWorkoutPlayerModalProps> = ({
  routine,
  onClose,
  onCompleted,
}) => {
  const exercises = routine.exercises;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRest, setIsRest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercises[0]?.durationSeconds || 40);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [muted, setMuted] = useState(audioService.getMuted());
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(0);

  const currentExercise: HomeExercise = exercises[currentIndex];
  const nextExercise: HomeExercise | undefined = exercises[currentIndex + 1];

  const totalTimeForPhase = isRest
    ? currentExercise?.restSeconds || 20
    : currentExercise?.durationSeconds || 40;

  const progressPercent = Math.min(
    100,
    Math.max(0, ((totalTimeForPhase - timeLeft) / totalTimeForPhase) * 100)
  );

  const lastBeepRef = useRef<number>(-1);

  // Sound on load
  useEffect(() => {
    audioService.playStartTone();
  }, []);

  // Timer loop
  useEffect(() => {
    if (!isRunning || isFinished) return;

    const timer = setInterval(() => {
      setTotalElapsedSeconds((s) => s + 1);

      setTimeLeft((prev) => {
        // Countdown sound cues at 3, 2, 1s
        if (prev <= 4 && prev > 1 && lastBeepRef.current !== prev) {
          lastBeepRef.current = prev;
          audioService.playCountdownBeep(false);
        } else if (prev === 1 && lastBeepRef.current !== prev) {
          lastBeepRef.current = prev;
          audioService.playCountdownBeep(true);
        }

        if (prev <= 1) {
          if (!isRest) {
            // Work finished -> rest or complete
            if (currentIndex < exercises.length - 1) {
              setIsRest(true);
              audioService.playRestTone();
              return currentExercise.restSeconds || 20;
            } else {
              // Entire routine finished!
              finishWorkout();
              return 0;
            }
          } else {
            // Rest finished -> next exercise
            setIsRest(false);
            const nextIdx = currentIndex + 1;
            setCurrentIndex(nextIdx);
            audioService.playStartTone();
            return exercises[nextIdx]?.durationSeconds || 40;
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isFinished, isRest, currentIndex, exercises, currentExercise]);

  const finishWorkout = async () => {
    setIsFinished(true);
    setIsRunning(false);
    audioService.playFanfare();
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
    });

    const elapsedMinutes = Math.max(1, Math.round(totalElapsedSeconds / 60));
    const estimatedCalories = Math.round(elapsedMinutes * 9.5); // ~9.5 kcal/min for HIIT/calisthenics

    await dbService.saveHomeWorkout({
      id: 'hw_' + Date.now(),
      routineId: routine.id,
      routineTitle: routine.title,
      date: new Date().toISOString(),
      durationSeconds: totalElapsedSeconds,
      caloriesBurned: estimatedCalories,
      completedExercisesCount: exercises.length,
    });
  };

  const handleSkipNext = () => {
    if (currentIndex < exercises.length - 1) {
      setIsRest(false);
      setCurrentIndex((prev) => prev + 1);
      setTimeLeft(exercises[currentIndex + 1]?.durationSeconds || 40);
      lastBeepRef.current = -1;
    } else {
      finishWorkout();
    }
  };

  const handleSkipPrev = () => {
    if (currentIndex > 0) {
      setIsRest(false);
      setCurrentIndex((prev) => prev - 1);
      setTimeLeft(exercises[currentIndex - 1]?.durationSeconds || 40);
      lastBeepRef.current = -1;
    }
  };

  const handleResetCurrent = () => {
    setTimeLeft(
      isRest
        ? currentExercise.restSeconds || 20
        : currentExercise.durationSeconds || 40
    );
    lastBeepRef.current = -1;
  };

  const toggleSound = () => {
    const isNowMuted = audioService.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-industrial-950 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto font-industrial">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-industrial-900 border border-lime-accent/40 flex items-center justify-center font-bold text-lime-accent font-mono text-sm">
            {currentIndex + 1}/{exercises.length}
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-100 uppercase tracking-wider font-mono truncate max-w-[200px] sm:max-w-md">
              {routine.title}
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              {isRest ? 'En recuperación' : currentExercise.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className="p-2.5 rounded-xl bg-industrial-900 border border-industrial-700 text-slate-300 hover:text-lime-accent transition-colors"
            title={muted ? 'Activar Sonido' : 'Silenciar'}
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-lime-accent" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-industrial-900 border border-industrial-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Player Display */}
      {!isFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center my-3 max-w-lg mx-auto w-full">
          {/* Phase Badge */}
          <div className="mb-2 text-center">
            {isRest ? (
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-gold-amber/20 text-gold-accent border border-gold-accent/40 animate-pulse">
                Pausa de Recuperación ({timeLeft}s)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-lime-accent/20 text-lime-accent border border-lime-accent/40">
                Serie Activa: {currentExercise.name}
              </span>
            )}
          </div>

          {/* Exercise Visualizer (GIF / Vector Loop) */}
          <div className="w-full mb-3">
            <ExerciseGifVisualizer
              exerciseName={isRest && nextExercise ? `Próximo: ${nextExercise.name}` : currentExercise.name}
              animationType={isRest && nextExercise ? nextExercise.animationType : currentExercise.animationType}
              targetMuscles={isRest && nextExercise ? nextExercise.targetMuscles : currentExercise.targetMuscles}
              isRest={isRest}
              customGifUrl={isRest && nextExercise ? nextExercise.gifUrl : currentExercise.gifUrl}
            />
          </div>

          {/* Circular Countdown Timer */}
          <div className="relative w-40 h-40 flex items-center justify-center my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="#1e293b"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke={isRest ? '#eab308' : '#bdf200'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black font-mono tracking-tighter ${isRest ? 'text-gold-accent' : 'text-slate-100'}`}>
                {timeLeft}
              </span>
              <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
                segundos
              </span>
            </div>
          </div>

          {/* Exercise Coaching Instruction Cue */}
          <div className="text-center px-4 max-w-sm mt-1">
            <p className="text-xs text-lime-accent font-mono font-semibold">
              💡 {currentExercise.coachingCue}
            </p>
            {currentExercise.repsGuide && !isRest && (
              <span className="inline-block mt-1 text-[11px] font-mono bg-industrial-900 border border-industrial-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                Objetivo: {currentExercise.repsGuide}
              </span>
            )}
            {isRest && nextExercise && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Prepárate para: <strong className="text-slate-200">{nextExercise.name}</strong>
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Workout Complete Celebration Screen */
        <div className="flex-1 flex flex-col items-center justify-center my-6 max-w-md mx-auto text-center p-6 bg-industrial-900/90 border border-lime-accent/40 rounded-3xl shadow-lime-glow">
          <div className="w-20 h-20 rounded-3xl bg-lime-accent/20 border-2 border-lime-accent flex items-center justify-center text-lime-accent mb-4 animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <span className="text-xs font-mono font-bold text-lime-accent tracking-widest uppercase bg-lime-accent/10 px-3 py-1 rounded-full border border-lime-accent/30 mb-2">
            ¡Rutina en Casa Completada!
          </span>

          <h3 className="text-2xl font-black text-slate-100 font-mono uppercase tracking-tight">
            {routine.title}
          </h3>

          <p className="text-xs text-slate-400 mt-2">
            Excelente rendimiento. Tu esfuerzo ha quedado guardado automáticamente en tu bitácora de OL9 fit.
          </p>

          <div className="grid grid-cols-3 gap-3 w-full my-6">
            <div className="bg-industrial-950 p-3 rounded-2xl border border-industrial-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Tiempo</span>
              <p className="text-base font-black font-mono text-slate-100">
                {Math.floor(totalElapsedSeconds / 60)}m {totalElapsedSeconds % 60}s
              </p>
            </div>
            <div className="bg-industrial-950 p-3 rounded-2xl border border-industrial-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Calorías</span>
              <p className="text-base font-black font-mono text-lime-accent">
                ~{Math.round(Math.max(1, totalElapsedSeconds / 60) * 9.5)} kcal
              </p>
            </div>
            <div className="bg-industrial-950 p-3 rounded-2xl border border-industrial-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Ejercicios</span>
              <p className="text-base font-black font-mono text-gold-accent">
                {exercises.length}/{exercises.length}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              onCompleted();
              onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-lime-accent to-lime-glow text-industrial-950 font-black font-mono text-sm rounded-2xl shadow-lime-glow hover:brightness-110 active:scale-95 transition-all uppercase tracking-wider"
          >
            Guardar y Volver a En Casa
          </button>
        </div>
      )}

      {/* Bottom Tactical Player Controls */}
      {!isFinished && (
        <div className="max-w-md mx-auto w-full pt-3 border-t border-industrial-800 flex items-center justify-between gap-3">
          <button
            onClick={handleSkipPrev}
            disabled={currentIndex === 0}
            className="p-3 rounded-2xl bg-industrial-900 border border-industrial-800 text-slate-300 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-colors"
            title="Ejercicio anterior"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={handleResetCurrent}
            className="p-3 rounded-2xl bg-industrial-900 border border-industrial-800 text-slate-400 hover:text-white transition-colors"
            title="Reiniciar ejercicio actual"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Huge Primary Play / Pause Toggle Button */}
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex-1 py-3 px-6 rounded-2xl font-mono font-black text-sm flex items-center justify-center gap-2 transition-all ${
              isRunning
                ? 'bg-industrial-900 border border-lime-accent/50 text-lime-accent'
                : 'bg-lime-accent text-industrial-950 shadow-lime-glow'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" /> PAUSAR
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" /> REANUDAR
              </>
            )}
          </button>

          <button
            onClick={handleSkipNext}
            className="p-3 rounded-2xl bg-industrial-900 border border-industrial-800 text-slate-300 hover:text-white transition-colors"
            title="Saltar ejercicio"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
