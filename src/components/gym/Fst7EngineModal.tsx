import React, { useState, useEffect, useRef } from 'react';
import { X, Flame, CheckCircle, Volume2, VolumeX, Shield, Play, Pause, RotateCcw } from 'lucide-react';
import { GymExercise, GymLogEntry } from '../../types';
import { audioService } from '../../services/audioService';
import { dbService } from '../../services/dbService';
import confetti from 'canvas-confetti';

interface Fst7EngineModalProps {
  exercise: GymExercise;
  dayKey: string;
  onClose: () => void;
  onFinish?: () => void;
}

export const Fst7EngineModal: React.FC<Fst7EngineModalProps> = ({ exercise, dayKey, onClose, onFinish }) => {
  const [currentSet, setCurrentSet] = useState(1);
  const [completedSets, setCompletedSets] = useState<number[]>([]);
  const [weightKg, setWeightKg] = useState<number>(40);
  const [repsDone, setRepsDone] = useState<number>(10);
  const [setsData, setSetsData] = useState<{ setNumber: number; weightKg: number; reps: number; completed: boolean }[]>([]);

  // 30s countdown state
  const [isResting, setIsResting] = useState(false);
  const [restSecondsLeft, setRestSecondsLeft] = useState(30);
  const [isRestPaused, setIsRestPaused] = useState(false);
  const [isCompletedFst7, setIsCompletedFst7] = useState(false);
  const [muted, setMuted] = useState(audioService.getMuted());

  const lastBeepRef = useRef<number>(-1);

  // Play start sound
  useEffect(() => {
    audioService.playStartTone();
  }, []);

  // 30s Countdown timer effect
  useEffect(() => {
    if (!isResting || isRestPaused || isCompletedFst7) return;

    const timer = setInterval(() => {
      setRestSecondsLeft((prev) => {
        // Sound alerts at 3, 2, 1
        if (prev <= 4 && prev > 1 && lastBeepRef.current !== prev) {
          lastBeepRef.current = prev;
          audioService.playCountdownBeep(false);
        } else if (prev === 1 && lastBeepRef.current !== prev) {
          lastBeepRef.current = prev;
          audioService.playCountdownBeep(true);
        }

        if (prev <= 1) {
          // Rest finished -> prompt next set
          setIsResting(false);
          audioService.playStartTone();
          if (currentSet < 7) {
            setCurrentSet((s) => s + 1);
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isResting, isRestPaused, currentSet, isCompletedFst7]);

  // Handle set completion
  const handleCompleteCurrentSet = async () => {
    const updatedSets = [
      ...setsData,
      {
        setNumber: currentSet,
        weightKg,
        reps: repsDone,
        completed: true
      }
    ];
    setSetsData(updatedSets);
    setCompletedSets((prev) => [...prev, currentSet]);

    if (currentSet === 7) {
      // Completed all 7 rounds!
      setIsCompletedFst7(true);
      setIsResting(false);
      audioService.playFanfare();
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Save to IndexedDB
      const totalVolume = updatedSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
      const logEntry: GymLogEntry = {
        id: 'gym_' + Date.now(),
        date: new Date().toISOString(),
        dayKey,
        exerciseName: exercise.name,
        totalSets: 7,
        sets: updatedSets,
        totalVolumeKg: totalVolume,
        isFst7: true,
        notes: 'Protocolo FST-7 (Fascia Stretch Training 7) completado con 30s de descanso e isometría.'
      };
      await dbService.saveGymLog(logEntry);
      if (onFinish) onFinish();
    } else {
      // Trigger 30s rest countdown automatically
      setIsResting(true);
      setRestSecondsLeft(30);
      audioService.playRestTone();
    }
  };

  const progressPercent = ((30 - restSecondsLeft) / 30) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-industrial-950 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gold-amber/20 border border-gold-accent flex items-center justify-center text-gold-accent font-black shadow-gold-glow">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-gold-accent tracking-widest uppercase">
                MOTOR FST-7 ACTIVO
              </span>
              <span className="text-[10px] font-mono bg-industrial-900 border border-industrial-700 px-1.5 py-0.5 rounded text-slate-300">
                Fascia Stretch
              </span>
            </div>
            <h2 className="text-sm font-bold text-slate-100 truncate max-w-xs font-mono">
              {exercise.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const m = audioService.toggleMute();
              setMuted(m);
            }}
            className="p-2.5 rounded-xl bg-industrial-900 border border-industrial-700 text-slate-300 hover:text-gold-accent transition-colors"
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-gold-accent" />}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-industrial-900 border border-industrial-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      {!isCompletedFst7 ? (
        <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-lg mx-auto w-full">
          {/* Visualizador de Series (1 a 7) */}
          <div className="w-full bg-industrial-900/90 border border-industrial-800 rounded-2xl p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono uppercase text-slate-400">Progreso FST-7</span>
              <span className="text-xs font-mono font-black text-gold-accent">
                [ SERIE {currentSet} / 7 ]
              </span>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 7 }, (_, i) => i + 1).map((setNum) => {
                const isDone = completedSets.includes(setNum);
                const isCurrent = setNum === currentSet;
                return (
                  <div
                    key={setNum}
                    className={`h-11 rounded-xl flex flex-col items-center justify-center font-mono font-bold text-xs border transition-all ${
                      isDone
                        ? 'bg-gold-accent text-industrial-950 border-gold-accent shadow-gold-glow'
                        : isCurrent
                        ? 'bg-industrial-800 border-gold-accent text-slate-100 animate-pulse'
                        : 'bg-industrial-950 border-industrial-800 text-slate-500'
                    }`}
                  >
                    <span>#{setNum}</span>
                    {isDone && <span className="text-[9px] font-black leading-none">OK</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resting State vs Active Set State */}
          {isResting ? (
            /* 30s COUNTDOWN & ISOMETRIC CONTRACTION DISPLAY */
            <div className="w-full flex flex-col items-center justify-center my-2">
              {/* Circular countdown */}
              <div className="relative w-48 h-48 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#1e293b"
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    stroke="#eab308"
                    strokeWidth="12"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - progressPercent / 100)}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black font-mono tracking-tighter text-gold-accent animate-pulse">
                    {restSecondsLeft}
                  </span>
                  <span className="text-xs uppercase font-mono text-slate-400 mt-1">
                    Segundos
                  </span>
                </div>
              </div>

              {/* MODO ISOMETRÍA / ESTIRAMIENTO FASCIAL INDICATOR */}
              <div className="w-full bg-gradient-to-r from-gold-amber/20 via-gold-accent/15 to-gold-amber/20 border-2 border-gold-accent/60 rounded-2xl p-4 mt-3 text-center shadow-gold-glow">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-accent animate-ping" />
                  <span className="text-xs font-mono font-black uppercase text-gold-accent tracking-widest">
                    MODO ISOMETRÍA / ESTIRAMIENTO FASCIAL
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-200">
                  Músculo diana en máxima tensión durante el descanso:
                </p>
                <p className="text-sm font-black font-mono text-lime-accent mt-0.5 uppercase tracking-wide">
                  {exercise.targetMuscle}
                </p>
                <p className="text-[11px] text-slate-300 mt-1 italic">
                  Aprieta y mantén la contracción isométrica para expandir la fascia muscular antes del siguiente round.
                </p>
              </div>

              {/* Pause/Skip Rest controls */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setIsRestPaused(!isRestPaused)}
                  className="px-4 py-2 rounded-xl bg-industrial-900 border border-industrial-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5"
                >
                  {isRestPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  {isRestPaused ? 'Reanudar' : 'Pausar Reloj'}
                </button>
                <button
                  onClick={() => {
                    setIsResting(false);
                    if (currentSet < 7) setCurrentSet((s) => s + 1);
                    audioService.playStartTone();
                  }}
                  className="px-4 py-2 rounded-xl bg-industrial-800 border border-gold-accent/50 text-xs font-mono font-bold text-gold-accent hover:bg-industrial-700"
                >
                  Saltar Descanso
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE SET EXECUTION */
            <div className="w-full space-y-4">
              <div className="bg-industrial-900 border border-industrial-800 rounded-2xl p-4 text-center">
                <p className="text-xs font-mono uppercase text-slate-400">Objetivo por Serie</p>
                <p className="text-2xl font-black font-mono text-slate-100 mt-1">
                  10 - 12 REPETICIONES
                </p>
                <p className="text-xs text-lime-accent font-mono mt-1">
                  Enfoque: Bombeo masivo y cadencia estricta 2-0-1
                </p>
              </div>

              {/* Weight and Reps inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-industrial-900 border border-industrial-800 rounded-2xl p-3">
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Carga (kg)
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setWeightKg((w) => Math.max(0, w - 2.5))}
                      className="w-8 h-8 rounded-lg bg-industrial-800 text-slate-200 font-bold hover:bg-industrial-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="2.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                      className="w-full bg-industrial-950 border border-industrial-700 rounded-lg py-1 px-2 text-center font-mono font-bold text-slate-100 text-base"
                    />
                    <button
                      onClick={() => setWeightKg((w) => w + 2.5)}
                      className="w-8 h-8 rounded-lg bg-industrial-800 text-slate-200 font-bold hover:bg-industrial-700"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-industrial-900 border border-industrial-800 rounded-2xl p-3">
                  <label className="text-[11px] font-mono uppercase text-slate-400 block mb-1">
                    Reps Logradas
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setRepsDone((r) => Math.max(1, r - 1))}
                      className="w-8 h-8 rounded-lg bg-industrial-800 text-slate-200 font-bold hover:bg-industrial-700"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={repsDone}
                      onChange={(e) => setRepsDone(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-industrial-950 border border-industrial-700 rounded-lg py-1 px-2 text-center font-mono font-bold text-slate-100 text-base"
                    />
                    <button
                      onClick={() => setRepsDone((r) => r + 1)}
                      className="w-8 h-8 rounded-lg bg-industrial-800 text-slate-200 font-bold hover:bg-industrial-700"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón de Acción "Serie Completada" */}
              <button
                onClick={handleCompleteCurrentSet}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-gold-accent via-lime-accent to-gold-accent hover:opacity-95 text-industrial-950 font-black font-mono uppercase tracking-wider text-base shadow-gold-glow flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <CheckCircle className="w-6 h-6 fill-industrial-950 text-gold-accent" />
                SERIE {currentSet} COMPLETADA → DESCANSO 30S
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Celebration & Summary */
        <div className="flex-1 flex flex-col items-center justify-center text-center my-6 max-w-md mx-auto w-full">
          <div className="w-24 h-24 rounded-full bg-gold-accent/20 border-2 border-gold-accent flex items-center justify-center mb-6 shadow-gold-glow animate-bounce">
            <Flame className="w-12 h-12 text-gold-accent fill-current" />
          </div>
          <h2 className="text-3xl font-black text-slate-100 font-mono tracking-tight uppercase mb-1">
            ¡FST-7 PROTOCOLO SUPERADO!
          </h2>
          <p className="text-xs text-gold-accent font-mono uppercase tracking-widest mb-4">
            7 SERIES CONGESTIÓN FASCIAL COMPLETA
          </p>
          <p className="text-xs text-slate-300 mb-6">
            Has completado las 7 series de choque con pausas estrictas de 30 segundos. Registro guardado en IndexedDB.
          </p>

          <div className="w-full bg-industrial-900 border border-industrial-800 rounded-2xl p-4 mb-6 grid grid-cols-3 gap-2">
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Series</p>
              <p className="text-xl font-bold font-mono text-slate-100">7 / 7</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Carga Media</p>
              <p className="text-xl font-bold font-mono text-gold-accent">{weightKg} kg</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-mono uppercase">Volumen</p>
              <p className="text-xl font-bold font-mono text-lime-accent">
                {setsData.reduce((sum, s) => sum + s.weightKg * s.reps, 0)} kg
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black font-mono uppercase tracking-wider text-sm shadow-lime-glow flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Finalizar y Guardar en Bitácora
          </button>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="border-t border-industrial-800 pt-3 text-center">
        <p className="text-[11px] text-slate-500 font-mono">
          Protocolo FST-7 desarrollado por Hany Rambod: 7 series con descanso corto de 30s para estirar la membrana fascial e inducir hipertrofia miofibrilar.
        </p>
      </div>
    </div>
  );
};
