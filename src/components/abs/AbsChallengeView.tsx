import React, { useState, useEffect } from 'react';
import { Shield, Flame, Check, Play, Lock, Award, Info } from 'lucide-react';
import { AbsChallengeDay } from '../../types';
import { generateAbsChallenge30Days, ABS_EXERCISES } from '../../data/absChallengeData';
import { AbsPlayerModal } from './AbsPlayerModal';
import { dbService } from '../../services/dbService';

export const AbsChallengeView: React.FC = () => {
  const [days, setDays] = useState<AbsChallengeDay[]>(() => generateAbsChallenge30Days());
  const [selectedDay, setSelectedDay] = useState<AbsChallengeDay | null>(null);
  const [activeTabLevel, setActiveTabLevel] = useState<1 | 2 | 3>(1);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const progressList = await dbService.getAbsProgress();
    setDays((prev) =>
      prev.map((d) => {
        const found = progressList.find((p) => p.day === d.day);
        return found ? { ...d, completed: found.completed, completedAt: found.completedAt } : d;
      })
    );
  };

  const handleCompleteDay = async (dayNumber: number) => {
    await dbService.setAbsDayCompleted(dayNumber, true);
    await loadProgress();
  };

  const completedCount = days.filter((d) => d.completed).length;
  const progressPercent = Math.round((completedCount / 30) * 100);

  // Group days by level
  const filteredDays = days.filter((d) => d.level === activeTabLevel);

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-industrial-950 via-industrial-900 to-industrial-950 border border-industrial-800 rounded-3xl p-5 sm:p-6 shadow-industrial relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-accent/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-accent animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-lime-accent">
                FASE 1 • RETO PROGRESIVO 30 DÍAS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100 font-mono tracking-tight uppercase">
              ABDOMINALES DE ACERO
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
              Sobrecarga metabólica y estabilización biomecánica. 30 días organizados en 3 bloques de 10 días para esculpir densidad y fuerza funcional.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-industrial-950/70 border border-industrial-800 px-4 py-3 rounded-2xl">
            <div className="text-right">
              <p className="text-[11px] font-mono uppercase text-slate-400">Progreso Total</p>
              <p className="text-xl font-black font-mono text-lime-accent">{completedCount} <span className="text-slate-500 text-sm">/ 30</span></p>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-lime-accent flex items-center justify-center font-mono font-bold text-xs text-lime-accent shadow-lime-glow">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full bg-industrial-950 h-2.5 rounded-full overflow-hidden mt-5 border border-industrial-800">
          <div
            className="h-full bg-gradient-to-r from-lime-dark via-lime-accent to-gold-accent transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Level Selection Tabs */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setActiveTabLevel(1)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTabLevel === 1
              ? 'bg-industrial-800/90 border-lime-accent text-slate-100 shadow-lime-glow'
              : 'bg-industrial-900 border-industrial-800 text-slate-400 hover:border-industrial-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-lime-accent">NIVEL 1</span>
            <span className="text-[10px] font-mono bg-industrial-950 px-1.5 py-0.5 rounded text-slate-400">D 1-10</span>
          </div>
          <p className="text-xs font-bold truncate">Base Fundamental</p>
        </button>

        <button
          onClick={() => setActiveTabLevel(2)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTabLevel === 2
              ? 'bg-industrial-800/90 border-gold-accent text-slate-100 shadow-gold-glow'
              : 'bg-industrial-900 border-industrial-800 text-slate-400 hover:border-industrial-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-gold-accent">NIVEL 2</span>
            <span className="text-[10px] font-mono bg-industrial-950 px-1.5 py-0.5 rounded text-slate-400">D 11-20</span>
          </div>
          <p className="text-xs font-bold truncate">Resistencia y Densidad</p>
        </button>

        <button
          onClick={() => setActiveTabLevel(3)}
          className={`p-3 rounded-2xl border text-left transition-all ${
            activeTabLevel === 3
              ? 'bg-industrial-800/90 border-red-500 text-slate-100 shadow-industrial'
              : 'bg-industrial-900 border-industrial-800 text-slate-400 hover:border-industrial-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-mono font-bold text-red-400">NIVEL 3</span>
            <span className="text-[10px] font-mono bg-industrial-950 px-1.5 py-0.5 rounded text-slate-400">D 21-30</span>
          </div>
          <p className="text-xs font-bold truncate">Fuerza & Estabilidad</p>
        </button>
      </div>

      {/* Routine Info Badge for Selected Level */}
      <div className="bg-industrial-950/60 border border-industrial-800 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-lime-accent shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300">
          <span className="font-bold text-slate-100 uppercase">
            Protocolo de Intervalos:
          </span>{' '}
          30 segundos de contracción biomecánica estricta + 15 segundos de descanso y descompresión. Se ejecutan 4 ejercicios sin pausas largas.
        </div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {filteredDays.map((day) => {
          return (
            <div
              key={day.day}
              className={`relative bg-industrial-900 border rounded-2xl p-4 flex flex-col justify-between transition-all hover:border-industrial-600 ${
                day.completed
                  ? 'border-lime-accent/50 bg-industrial-900/60'
                  : 'border-industrial-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-black text-slate-300">
                    DÍA {day.day}
                  </span>
                  {day.completed ? (
                    <span className="w-6 h-6 rounded-full bg-lime-accent/20 border border-lime-accent text-lime-accent flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono uppercase text-slate-500 bg-industrial-950 px-2 py-0.5 rounded">
                      Pendiente
                    </span>
                  )}
                </div>

                <div className="space-y-1 mb-4">
                  {day.exerciseIds.map((exId, idx) => {
                    const ex = ABS_EXERCISES[exId];
                    return (
                      <p key={exId} className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                        <span className="text-lime-accent text-[9px] font-mono">0{idx + 1}</span>
                        {ex?.name}
                      </p>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setSelectedDay(day)}
                className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                  day.completed
                    ? 'bg-industrial-800 hover:bg-industrial-700 text-lime-accent border border-industrial-700'
                    : 'bg-lime-accent hover:bg-lime-glow text-industrial-950 shadow-lime-glow font-black'
                }`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {day.completed ? 'Repetir Sesión' : 'Iniciar Rutina'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Routine Interactive Modal */}
      {selectedDay && (
        <AbsPlayerModal
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onComplete={handleCompleteDay}
        />
      )}
    </div>
  );
};
