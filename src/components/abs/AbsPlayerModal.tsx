import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, RotateCcw, X, Volume2, VolumeX, CheckCircle, ShieldCheck } from 'lucide-react';
import { AbsChallengeDay, AbsExercise } from '../../types';
import { ABS_EXERCISES } from '../../data/absChallengeData';
import { AbsExerciseSvg } from './AbsExerciseSvg';
import { audioService } from '../../services/audioService';
import confetti from 'canvas-confetti';

interface AbsPlayerModalProps {
  day: AbsChallengeDay;
  onClose: () => void;
  onComplete: (dayNumber: number) => void;
}

export const AbsPlayerModal: React.FC<AbsPlayerModalProps> = ({ day, onClose, onComplete }) => {
  const exercises: AbsExercise[] = day.exerciseIds.map((id) => ABS_EXERCISES[id]).filter(Boolean);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRest, setIsRest] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercises[0]?.durationSeconds || 30);
  const [isRunning, setIsRunning] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [muted, setMuted] = useState(audioService.getMuted());

  const currentExercise = exercises[currentIndex];
  const nextExercise = exercises[currentIndex + 1];

  const totalTime = isRest ? (currentExercise?.restSeconds || 15) : (currentExercise?.durationSeconds || 30);
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  // Sound and countdown tick ref
  const lastTickTime = useRef<number>(-1);

  // Play start tone on open
  useEffect(() => {
    audioService.playStartTone();
  }, []);

  // Timer interval effect
  useEffect(() => {
    if (!isRunning || isFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        // Sound cue at 3, 2, 1 seconds
        if (prev <= 4 && prev > 1 && lastTickTime.current !== prev) {
          lastTickTime.current = prev;
          audioService.playCountdownBeep(false);
        } else if (prev === 1 && lastTickTime.current !== prev) {
          lastTickTime.current = prev;
          audioService.playCountdownBeep(true);
        }

        if (prev <= 1) {
          // Transition logic
          if (!isRest) {
            // Finished work -> Go to rest if more exercises remain
            if (currentIndex < exercises.length - 1) {
              setIsRest(true);
              audioService.playRestTone();
              return currentExercise.restSeconds || 15;
            } else {
              // Workout Complete!
              setIsFinished(true);
              audioService.playFanfare();
              confetti({
                particleCount: 120,
                spread: 70,
                origin: { y: 0.6 }
              });
              onComplete(day.day);
              return 0;
            }
          } else {
            // Finished rest -> Go to next exercise
            setIsRest(false);
            setCurrentIndex((idx) => idx + 1);
            audioService.playStartTone();
            return exercises[currentIndex + 1]?.durationSeconds || 30;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, isRest, currentIndex, exercises, currentExercise, isFinished, day.day, onComplete]);

  const handleSkipNext = () => {
    if (currentIndex < exercises.length - 1) {
      setIsRest(false);
      setCurrentIndex((idx) => idx + 1);
      setTimeLeft(exercises[currentIndex + 1]?.durationSeconds || 30);
      audioService.playStartTone();
    } else {
      setIsFinished(true);
      audioService.playFanfare();
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      onComplete(day.day);
    }
  };

  const handleSkipPrev = () => {
    if (currentIndex > 0) {
      setIsRest(false);
      setCurrentIndex((idx) => idx - 1);
      setTimeLeft(exercises[currentIndex - 1]?.durationSeconds || 30);
      audioService.playStartTone();
    } else {
      setTimeLeft(currentExercise?.durationSeconds || 30);
    }
  };

  const handleRestartExercise = () => {
    setTimeLeft(isRest ? currentExercise.restSeconds : currentExercise.durationSeconds);
  };

  const toggleSound = () => {
    const isNowMuted = audioService.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <div className="fixed inset-0 z-50 bg-industrial-950 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-industrial-900 border border-lime-accent/40 flex items-center justify-center font-bold text-lime-accent font-mono">
            D{day.day}
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">
              {day.levelName}
            </h2>
            <p className="text-xs text-slate-400">
              Ejercicio {currentIndex + 1} de {exercises.length}
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

      {/* Main Content Area */}
      {!isFinished ? (
        <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-xl mx-auto w-full">
          {/* Phase Badge */}
          <div className="mb-3 text-center">
            {isRest ? (
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold-amber/20 text-gold-accent border border-gold-accent/40 animate-pulse">
                Recuperación Fascial ({timeLeft}s)
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-lime-accent/20 text-lime-accent border border-lime-accent/40">
                Serie Activa - {currentExercise?.name}
              </span>
            )}
          </div>

          {/* Biomechanical SVG Illustration */}
          <div className="w-full mb-4">
            <AbsExerciseSvg
              svgType={isRest && nextExercise ? nextExercise.svgType : currentExercise?.svgType || 'crunch'}
              name={isRest && nextExercise ? `Próximo: ${nextExercise.name}` : currentExercise?.name || ''}
              isRest={isRest}
            />
          </div>

          {/* Huge Industrial Timer with Circular Accent */}
          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="78"
                stroke="#1e293b"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="88"
                cy="88"
                r="78"
                stroke={isRest ? '#eab308' : '#bdf200'}
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 78}
                strokeDashoffset={2 * Math.PI * 78 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="none"
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black font-mono tracking-tighter text-slate-100">
                {timeLeft.toString().padStart(2, '0')}
              </span>
              <span className="text-xs uppercase font-mono text-slate-400">
                {isRest ? 'Descanso' : 'Segundos'}
              </span>
            </div>
          </div>

          {/* Coaching Cue & Target Muscles */}
          <div className="w-full bg-industrial-900/90 border border-industrial-800 rounded-2xl p-4 mt-2">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {currentExercise?.targetMuscles.map((muscle) => (
                <span key={muscle} className="text-[10px] font-mono uppercase bg-industrial-800 text-lime-accent px-2 py-0.5 rounded border border-industrial-700">
                  {muscle}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-300 italic border-l-2 border-lime-accent pl-2.5">
              "{currentExercise?.coachingCue}"
            </p>
          </div>
        </div>
      ) : (
        /* Completion View */
        <div className="flex-1 flex flex-col items-center justify-center text-center my-6 max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-lime-accent/20 border-2 border-lime-accent flex items-center justify-center mb-6 shadow-lime-glow animate-bounce">
            <CheckCircle className="w-12 h-12 text-lime-accent" />
          </div>
          <h2 className="text-3xl font-black text-slate-100 font-mono tracking-tight uppercase mb-2">
            ¡DÍA {day.day} COMPLETADO!
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Has finalizado la sesión de abdomen con postura biomecánica estricta. Racha actualizada y persistida en tu bitácora local.
          </p>
          <div className="w-full bg-industrial-900 border border-industrial-800 rounded-2xl p-4 mb-6 flex justify-around">
            <div>
              <p className="text-xs text-slate-400">Ejercicios</p>
              <p className="text-xl font-bold font-mono text-slate-100">{exercises.length} de {exercises.length}</p>
            </div>
            <div className="w-px bg-industrial-800" />
            <div>
              <p className="text-xs text-slate-400">Tiempo Total</p>
              <p className="text-xl font-bold font-mono text-lime-accent">{Math.round(day.durationSecondsTotal / 60)} min</p>
            </div>
            <div className="w-px bg-industrial-800" />
            <div>
              <p className="text-xs text-slate-400">Nivel</p>
              <p className="text-xl font-bold font-mono text-gold-accent">{day.level}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black font-mono uppercase tracking-wider text-sm transition-all shadow-lime-glow flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5" />
            Cerrar y Registrar en Calendario
          </button>
        </div>
      )}

      {/* Control Action Buttons */}
      {!isFinished && (
        <div className="max-w-xl mx-auto w-full pt-2">
          {/* Progress indicators for exercises */}
          <div className="flex gap-1.5 mb-4">
            {exercises.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  idx < currentIndex
                    ? 'bg-lime-accent'
                    : idx === currentIndex
                    ? isRest
                      ? 'bg-gold-accent animate-pulse'
                      : 'bg-lime-accent animate-pulse'
                    : 'bg-industrial-800'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={handleSkipPrev}
              disabled={currentIndex === 0}
              className="p-3.5 rounded-2xl bg-industrial-900 border border-industrial-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Anterior"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={handleRestartExercise}
              className="p-3.5 rounded-2xl bg-industrial-900 border border-industrial-700 text-slate-300 hover:text-lime-accent transition-colors"
              title="Reiniciar ejercicio"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-4 rounded-2xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black shadow-lime-glow transition-all flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Pause className="w-6 h-6 fill-industrial-950" />
                  <span className="font-mono text-sm tracking-wider">PAUSAR</span>
                </>
              ) : (
                <>
                  <Play className="w-6 h-6 fill-industrial-950" />
                  <span className="font-mono text-sm tracking-wider">REANUDAR</span>
                </>
              )}
            </button>

            <button
              onClick={handleSkipNext}
              className="p-3.5 rounded-2xl bg-industrial-900 border border-industrial-700 text-slate-300 hover:text-white transition-colors"
              title="Saltar"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
