import React, { useState, useEffect } from 'react';
import { X, Download, Check, Award, Flame, Heart, Compass, Trophy, Sparkles, ShieldCheck } from 'lucide-react';
import { RunSession } from '../../types';
import { ElevationPaceChart } from './ElevationPaceChart';
import { ol9RecordsService, PersonalRecord } from '../../services/ol9RecordsService';
import confetti from 'canvas-confetti';

interface PostRunSummaryModalProps {
  session: RunSession;
  onClose: () => void;
  onSaved?: () => void;
}

export const PostRunSummaryModal: React.FC<PostRunSummaryModalProps> = ({ session, onClose }) => {
  const [newRecords, setNewRecords] = useState<PersonalRecord[]>([]);

  const km = (session.distanceMeters / 1000).toFixed(2);
  const paceMin = Math.floor(session.avgPaceSecondsPerKm / 60);
  const paceSec = Math.round(session.avgPaceSecondsPerKm % 60).toString().padStart(2, '0');

  const hours = Math.floor(session.durationSeconds / 3600);
  const minutes = Math.floor((session.durationSeconds % 3600) / 60);
  const seconds = session.durationSeconds % 60;
  const timeFormatted = `${hours > 0 ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Evaluate Personal Records on Mount
  useEffect(() => {
    const { newRecords: records } = ol9RecordsService.evaluateRun(session);
    setNewRecords(records);
    if (records.length > 0) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, [session]);

  const handleExportGPX = () => {
    let gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OL9 fit - https://ol9-fit.vercel.app" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Trote Matutino Progresivo - OL9 fit</name>
    <time>${session.date}</time>
  </metadata>
  <trk>
    <name>Trote Matutino - ${km} km</name>
    <type>running</type>
    <trkseg>`;

    session.route.forEach((pt) => {
      gpx += `
      <trkpt lat="${pt.lat}" lon="${pt.lng}">
        ${pt.altitude ? `<ele>${pt.altitude}</ele>` : ''}
        <time>${new Date(pt.timestamp).toISOString()}</time>
      </trkpt>`;
    });

    gpx += `
    </trkseg>
  </trk>
</gpx>`;

    const blob = new Blob([gpx], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ol9_run_${new Date(session.date).toISOString().split('T')[0]}.gpx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(session, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `ol9_run_${session.id}.json`);
    downloadAnchor.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-industrial-950/95 flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-lime-accent/20 border border-lime-accent flex items-center justify-center text-lime-accent">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase text-lime-accent tracking-widest block">
              REGISTRO OFICIAL OL9 FIT
            </span>
            <h2 className="text-sm sm:text-base font-black text-slate-100 font-mono">
              Trote Matutino Progresivo
            </h2>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl bg-industrial-900 border border-industrial-700 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="max-w-2xl mx-auto w-full my-4 space-y-4">
        {/* NEW PERSONAL RECORDS BADGE BANNER */}
        {newRecords.length > 0 && (
          <div className="bg-gradient-to-r from-gold-amber/25 via-gold-accent/20 to-gold-amber/25 border-2 border-gold-accent rounded-3xl p-4 shadow-gold-glow animate-pulse">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-gold-accent fill-current" />
              <span className="text-xs font-mono font-black uppercase text-gold-accent tracking-wider">
                ¡NUEVO RÉCORD PERSONAL EN OL9 FIT!
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newRecords.map((rec) => (
                <div key={rec.type} className="bg-industrial-950/80 border border-gold-accent/40 rounded-xl p-2 text-center">
                  <span className="text-[10px] text-slate-400 font-mono block">{rec.title}</span>
                  <span className="text-sm font-black font-mono text-gold-accent">{rec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gradient-to-r from-industrial-900 via-industrial-850 to-industrial-900 border border-industrial-800 rounded-3xl p-5 shadow-industrial">
          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Distancia</p>
              <p className="text-3xl font-black font-mono text-lime-accent">{km} <span className="text-sm font-normal">km</span></p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Tiempo</p>
              <p className="text-3xl font-black font-mono text-slate-100">{timeFormatted}</p>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-slate-400">Ritmo Medio</p>
              <p className="text-3xl font-black font-mono text-gold-accent">{paceMin}:{paceSec} <span className="text-sm font-normal">/km</span></p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-industrial-800/80 pt-3 text-center text-xs font-mono">
            <div>
              <span className="text-slate-500 block">Calorías</span>
              <span className="text-slate-200 font-bold">{session.calories} kcal</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cadencia</span>
              <span className="text-slate-200 font-bold">{session.cadenceSpm} spm</span>
            </div>
            <div>
              <span className="text-slate-500 block">Desnivel</span>
              <span className="text-slate-200 font-bold">+{session.elevationGainMeters} m</span>
            </div>
          </div>
        </div>

        {/* Altimetry & Pace Chart */}
        <ElevationPaceChart route={session.route} splits={session.splits} />

        {/* Splits Table (Km a Km) */}
        <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
          <h3 className="text-xs font-mono uppercase text-slate-400 mb-3 flex items-center justify-between">
            <span>División por Kilómetros (Splits OL9)</span>
            <span className="text-slate-500">{session.splits.length} parciales</span>
          </h3>

          {session.splits.length > 0 ? (
            <div className="space-y-2">
              {session.splits.map((s) => {
                const sMin = Math.floor(s.paceSecondsPerKm / 60);
                const sSec = Math.round(s.paceSecondsPerKm % 60).toString().padStart(2, '0');
                const isFastest = s.paceSecondsPerKm === Math.min(...session.splits.map((sp) => sp.paceSecondsPerKm));

                return (
                  <div
                    key={s.km}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono ${
                      isFastest
                        ? 'bg-lime-accent/10 border-lime-accent/40 text-slate-100'
                        : 'bg-industrial-900 border-industrial-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-industrial-800 flex items-center justify-center font-bold text-slate-300">
                        {s.km}
                      </span>
                      <span>Kilómetro {s.km}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {isFastest && (
                        <span className="text-[10px] bg-lime-accent/20 text-lime-accent px-1.5 py-0.5 rounded font-bold uppercase">
                          Mejor Parcial
                        </span>
                      )}
                      <span className="font-bold text-sm text-slate-100">
                        {sMin}:{sSec} /km
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 font-mono text-center py-2">
              Sesión menor a 1 km; splits no disponibles.
            </p>
          )}
        </div>

        {/* OL9 FIT BITÁCORA & EXPORT ACTIONS */}
        <div className="bg-industrial-900 border border-industrial-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-accent/20 border border-lime-accent/40 flex items-center justify-center text-lime-accent font-black">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100 font-mono uppercase">
                  Guardado en tu Bitácora Local OL9
                </p>
                <p className="text-[11px] text-slate-400">
                  Carrera almacenada en tu base de datos IndexedDB y sumada a tus kilómetros acumulados.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-industrial-800">
            <button
              onClick={handleExportGPX}
              className="flex-1 py-2 rounded-xl bg-industrial-950 border border-industrial-700 hover:border-lime-accent text-slate-300 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-lime-accent" />
              Descargar .GPX
            </button>
            <button
              onClick={handleExportJSON}
              className="flex-1 py-2 rounded-xl bg-industrial-950 border border-industrial-700 hover:border-lime-accent text-slate-300 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-gold-accent" />
              Exportar JSON
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Save & Close */}
      <div className="max-w-2xl mx-auto w-full pt-2">
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black font-mono uppercase tracking-wider text-sm shadow-lime-glow flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
        >
          <Check className="w-5 h-5" />
          Finalizar y Volver al Dashboard
        </button>
      </div>
    </div>
  );
};
