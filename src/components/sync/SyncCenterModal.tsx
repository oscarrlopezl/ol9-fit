import React, { useState, useEffect } from 'react';
import { Bluetooth, UploadCloud, Watch, Check, AlertCircle, FileText, Heart, X, Smartphone, ArrowRight, Zap } from 'lucide-react';
import { wearableSyncService, BleHeartRateData, getHeartRateZone } from '../../services/wearableSyncService';
import { dbService } from '../../services/dbService';
import { RunSession } from '../../types';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunImported?: (run: RunSession) => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({ isOpen, onClose, onRunImported }) => {
  // Tab state: 'bluetooth' | 'quick' | 'files'
  const [activeSyncTab, setActiveSyncTab] = useState<'bluetooth' | 'quick' | 'files'>('bluetooth');

  // Bluetooth state
  const [isBleConnecting, setIsBleConnecting] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(wearableSyncService.getConnectedDeviceName());
  const [liveBpm, setLiveBpm] = useState<number | null>(wearableSyncService.getLastBpm());
  const [bleError, setBleError] = useState<string | null>(null);

  // File import state
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Quick Watch Manual Sync State
  const [watchKm, setWatchKm] = useState('5.00');
  const [watchMinutes, setWatchMinutes] = useState('28');
  const [watchSeconds, setWatchSeconds] = useState('30');
  const [watchAvgBpm, setWatchAvgBpm] = useState('148');
  const [watchSteps, setWatchSteps] = useState('5800');
  const [watchSuccessMsg, setWatchSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setBleDeviceName(wearableSyncService.getConnectedDeviceName());
      setLiveBpm(wearableSyncService.getLastBpm());
    }
  }, [isOpen]);

  const handleConnectWatchBluetooth = async () => {
    setIsBleConnecting(true);
    setBleError(null);
    try {
      const res = await wearableSyncService.connectGloryFitWatch(
        (data: BleHeartRateData) => {
          setLiveBpm(data.bpm);
        },
        () => {
          setBleDeviceName(null);
          setLiveBpm(null);
        }
      );

      if (res.success) {
        setBleDeviceName(res.deviceName);
      } else {
        setBleError(res.error || 'No se pudo conectar al reloj.');
      }
    } catch (e: any) {
      setBleError(e.message);
    } finally {
      setIsBleConnecting(false);
    }
  };

  const handleDisconnectBluetooth = () => {
    wearableSyncService.disconnectDevice();
    setBleDeviceName(null);
    setLiveBpm(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportStatus('Leyendo y convirtiendo track del reloj...');
    try {
      const session = await wearableSyncService.parseActivityFile(file);
      await dbService.saveRun(session);
      setImportStatus(`✓ ¡Carrera importada con éxito! ${(session.distanceMeters / 1000).toFixed(2)} km`);
      if (onRunImported) onRunImported(session);
    } catch (err: any) {
      setImportStatus(`✕ Error al importar archivo: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Quick save from watch screen
  const handleSaveWatchQuickSync = async () => {
    const kmNum = parseFloat(watchKm) || 5;
    const durSec = (parseInt(watchMinutes, 10) || 0) * 60 + (parseInt(watchSeconds, 10) || 0);
    const bpmNum = parseInt(watchAvgBpm, 10) || 145;
    const stepsNum = parseInt(watchSteps, 10) || 6000;

    const payload = {
      distance: kmNum * 1000,
      duration: Math.max(60, durSec),
      heartRate: bpmNum,
      steps: stepsNum,
      cadence: Math.round(stepsNum / (Math.max(1, durSec) / 60)),
      date: new Date().toISOString()
    };

    const res = await wearableSyncService.syncWatchData('gloryfit', payload);
    if (res.success && res.session) {
      await dbService.saveRun(res.session);
      setWatchSuccessMsg(`¡Entrenamiento guardado! ${kmNum.toFixed(2)} km añadidos a la bitácora.`);
      if (onRunImported) onRunImported(res.session);
      setTimeout(() => setWatchSuccessMsg(null), 4000);
    }
  };

  const currentZone = liveBpm ? getHeartRateZone(liveBpm) : null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-industrial-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-industrial-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-lime-accent/20 border border-lime-accent flex items-center justify-center text-lime-accent">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono uppercase text-lime-accent tracking-widest block">
                  ENLACE DEL RELOJ
                </span>
                <span className="text-[9px] font-mono bg-industrial-950 text-gold-accent px-1.5 py-0.2 rounded border border-gold-accent/40 font-bold">
                  CONEXIÓN DIRECTA
                </span>
              </div>
              <h2 className="text-base font-black text-slate-100 font-mono">
                Conectar Reloj Inteligente
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-industrial-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sync Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1 bg-industrial-950 p-1 rounded-2xl border border-industrial-800 mb-4 text-center">
          <button
            onClick={() => setActiveSyncTab('bluetooth')}
            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSyncTab === 'bluetooth'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bluetooth (En Vivo)
          </button>
          <button
            onClick={() => setActiveSyncTab('quick')}
            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSyncTab === 'quick'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Carga Rápida
          </button>
          <button
            onClick={() => setActiveSyncTab('files')}
            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSyncTab === 'files'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Subir Archivo
          </button>
        </div>

        {/* TAB 1: BLUETOOTH WATCH LINK */}
        {activeSyncTab === 'bluetooth' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bluetooth className={`w-4 h-4 ${bleDeviceName ? 'text-lime-accent' : 'text-slate-400'}`} />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Telemetría Cardíaca en Tiempo Real
                  </span>
                </div>
                {bleDeviceName && (
                  <span className="text-[10px] font-mono bg-lime-accent/20 text-lime-accent px-2 py-0.5 rounded font-bold">
                    CONECTADO
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                Conecta tu reloj directamente por Bluetooth. Transmite tu pulso cardíaco en tiempo real a la pantalla de carrera de OL9 fit.
              </p>

              {bleDeviceName ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-industrial-900 p-3.5 rounded-xl border border-industrial-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500">
                        <Heart className="w-5 h-5 fill-current animate-pulse" />
                      </div>
                      <div>
                        <p className="text-xs font-bold font-mono text-slate-100">{bleDeviceName}</p>
                        <p className="text-base font-black font-mono text-red-400">
                          {liveBpm ? `${liveBpm} BPM` : 'Midiendo pulso...'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleDisconnectBluetooth}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 border border-red-500/50 text-red-400 text-xs font-mono hover:bg-red-900/50"
                    >
                      Desconectar
                    </button>
                  </div>

                  {/* Heart Rate Zone Gauge */}
                  {currentZone && (
                    <div className="bg-industrial-900 p-3 rounded-xl border border-industrial-800">
                      <div className="flex justify-between items-center text-xs font-mono mb-1">
                        <span className="text-slate-400">Zona de Entrenamiento</span>
                        <span className="font-bold" style={{ color: currentZone.color }}>
                          {currentZone.zone} • {currentZone.label}
                        </span>
                      </div>
                      <div className="w-full bg-industrial-950 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.max(10, ((liveBpm || 100) / 190) * 100))}%`,
                            backgroundColor: currentZone.color
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleConnectWatchBluetooth}
                    disabled={isBleConnecting}
                    className="w-full py-3.5 rounded-xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lime-glow transition-all active:scale-[0.98]"
                  >
                    <Bluetooth className="w-4 h-4" />
                    {isBleConnecting ? 'Buscando Reloj Bluetooth...' : 'Conectar Reloj'}
                  </button>
                  {bleError && (
                    <p className="text-[10px] text-red-400 font-mono mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {bleError}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="bg-industrial-950/60 border border-industrial-800 rounded-2xl p-3 text-[11px] text-slate-400 font-mono flex items-start gap-2">
              <Zap className="w-4 h-4 text-lime-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-bold mb-0.5">Enlace Directo:</p>
                <p>Compatible con cualquier smartwatch o banda deportiva con sensor de ritmo cardíaco por Bluetooth.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUICK WATCH SYNC */}
        {activeSyncTab === 'quick' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Watch className="w-4 h-4 text-lime-accent" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Registro Directo de Pantalla
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                ¿Corriste con el reloj? Mira el resumen en su pantalla e ingresa los valores aquí para agregarlos al instante a tu historial en OL9 fit.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={watchKm}
                    onChange={(e) => setWatchKm(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-lime-accent"
                    placeholder="5.20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Pulso Medio (BPM)
                  </label>
                  <input
                    type="number"
                    value={watchAvgBpm}
                    onChange={(e) => setWatchAvgBpm(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-red-400"
                    placeholder="148"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Minutos : Segundos
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={watchMinutes}
                      onChange={(e) => setWatchMinutes(e.target.value)}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-2 py-2 text-sm font-mono font-bold text-slate-100 text-center"
                      placeholder="28"
                    />
                    <span className="text-slate-500 font-bold">:</span>
                    <input
                      type="number"
                      value={watchSeconds}
                      onChange={(e) => setWatchSeconds(e.target.value)}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-2 py-2 text-sm font-mono font-bold text-slate-100 text-center"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Pasos Registrados
                  </label>
                  <input
                    type="number"
                    value={watchSteps}
                    onChange={(e) => setWatchSteps(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gold-accent"
                    placeholder="5800"
                  />
                </div>
              </div>

              {watchSuccessMsg && (
                <div className="p-2.5 bg-lime-accent/20 border border-lime-accent text-lime-accent rounded-xl text-xs font-mono font-bold mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> {watchSuccessMsg}
                </div>
              )}

              <button
                onClick={handleSaveWatchQuickSync}
                className="w-full py-3 rounded-xl bg-gold-accent hover:bg-gold-amber text-industrial-950 font-black font-mono text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar Carrera en Bitácora OL9 fit
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FILE IMPORTER (.GPX, .TCX, .FIT) */}
        {activeSyncTab === 'files' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UploadCloud className="w-4 h-4 text-gold-accent" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Importar Archivo del Reloj
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                Si exportaste tu ruta desde la aplicación de tu reloj en formato .GPX o .TCX, súbela aquí para ver el mapa, ritmo y splits en OL9 fit.
              </p>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-industrial-700 hover:border-lime-accent rounded-xl p-5 cursor-pointer bg-industrial-900/50 transition-colors">
                <FileText className="w-7 h-7 text-lime-accent mb-2" />
                <span className="text-xs font-mono font-bold text-slate-200 text-center">
                  {isImporting ? 'Procesando archivo...' : 'Selecciona o arrastra archivo .GPX, .TCX o .FIT'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  Formatos compatibles de smartwatches
                </span>
                <input
                  type="file"
                  accept=".gpx,.tcx,.fit,.json"
                  onChange={handleFileUpload}
                  disabled={isImporting}
                  className="hidden"
                />
              </label>

              {importStatus && (
                <p className="text-xs font-mono text-lime-accent mt-3 p-2 bg-industrial-900 rounded-lg border border-industrial-800">
                  {importStatus}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
