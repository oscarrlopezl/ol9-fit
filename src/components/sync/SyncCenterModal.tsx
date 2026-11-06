import React, { useState, useEffect } from 'react';
import { Bluetooth, UploadCloud, Watch, Flame, Check, AlertCircle, FileText, Heart, RefreshCw, X, Radio, Smartphone, Compass, ArrowRight, Activity } from 'lucide-react';
import { wearableSyncService, BleHeartRateData, WearableProvider, getHeartRateZone } from '../../services/wearableSyncService';
import { stravaService } from '../../services/stravaService';
import { dbService } from '../../services/dbService';
import { RunSession } from '../../types';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunImported?: (run: RunSession) => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({ isOpen, onClose, onRunImported }) => {
  // Tab state: 'gloryfit' | 'files' | 'strava' | 'quick'
  const [activeSyncTab, setActiveSyncTab] = useState<'gloryfit' | 'quick' | 'files' | 'strava'>('gloryfit');

  // Bluetooth state
  const [isBleConnecting, setIsBleConnecting] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(wearableSyncService.getConnectedDeviceName());
  const [liveBpm, setLiveBpm] = useState<number | null>(wearableSyncService.getLastBpm());
  const [bleError, setBleError] = useState<string | null>(null);

  // Strava state
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [stravaAthlete, setStravaAthlete] = useState<any>(null);

  // File import state
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Quick GloryFit Watch Manual Sync State
  const [gloryKm, setGloryKm] = useState('5.00');
  const [gloryMinutes, setGloryMinutes] = useState('28');
  const [glorySeconds, setGlorySeconds] = useState('30');
  const [gloryAvgBpm, setGloryAvgBpm] = useState('148');
  const [glorySteps, setGlorySteps] = useState('5800');
  const [glorySuccessMsg, setGlorySuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkStravaStatus();
      setBleDeviceName(wearableSyncService.getConnectedDeviceName());
      setLiveBpm(wearableSyncService.getLastBpm());
    }
  }, [isOpen]);

  const checkStravaStatus = async () => {
    const isAuth = await stravaService.isAuthenticated();
    setIsStravaConnected(isAuth);
    if (isAuth) {
      const token = await dbService.getStravaToken();
      setStravaAthlete(token?.athlete || null);
    }
  };

  const handleConnectGloryFitBluetooth = async () => {
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
        setBleError(res.error || 'No se pudo conectar al reloj GloryFit.');
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
    setImportStatus('Leyendo y convirtiendo track de GloryFit...');
    try {
      const session = await wearableSyncService.parseActivityFile(file);
      await dbService.saveRun(session);
      setImportStatus(`✓ ¡Carrera de GloryFit importada exitosamente! ${(session.distanceMeters / 1000).toFixed(2)} km`);
      if (onRunImported) onRunImported(session);
    } catch (err: any) {
      setImportStatus(`✕ Error al importar archivo: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleToggleStrava = async () => {
    if (isStravaConnected) {
      await stravaService.disconnect();
      setIsStravaConnected(false);
      setStravaAthlete(null);
    } else {
      const token = await stravaService.connectDemoAccount();
      setIsStravaConnected(true);
      setStravaAthlete(token.athlete);
    }
  };

  // Quick save from GloryFit watch screen
  const handleSaveGloryFitQuickSync = async () => {
    const kmNum = parseFloat(gloryKm) || 5;
    const durSec = (parseInt(gloryMinutes, 10) || 0) * 60 + (parseInt(glorySeconds, 10) || 0);
    const bpmNum = parseInt(gloryAvgBpm, 10) || 145;
    const stepsNum = parseInt(glorySteps, 10) || 6000;

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
      setGlorySuccessMsg(`¡Entrenamiento GloryFit guardado! ${kmNum.toFixed(2)} km añadidos a la bitácora.`);
      if (onRunImported) onRunImported(res.session);
      setTimeout(() => setGlorySuccessMsg(null), 4000);
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
                  ECOSISTEMA WEARABLE
                </span>
                <span className="text-[9px] font-mono bg-industrial-950 text-gold-accent px-1.5 py-0.2 rounded border border-gold-accent/40 font-bold">
                  GLORYFIT READY
                </span>
              </div>
              <h2 className="text-base font-black text-slate-100 font-mono">
                Conectividad Reloj GloryFit
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
        <div className="grid grid-cols-4 gap-1 bg-industrial-950 p-1 rounded-2xl border border-industrial-800 mb-4 text-center">
          <button
            onClick={() => setActiveSyncTab('gloryfit')}
            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSyncTab === 'gloryfit'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bluetooth
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
            Archivos
          </button>
          <button
            onClick={() => setActiveSyncTab('strava')}
            className={`py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              activeSyncTab === 'strava'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Strava
          </button>
        </div>

        {/* TAB 1: BLUETOOTH GLORYFIT LINK */}
        {activeSyncTab === 'gloryfit' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bluetooth className={`w-4 h-4 ${bleDeviceName ? 'text-lime-accent' : 'text-slate-400'}`} />
                  <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Telemetría en Vivo GloryFit (GATT BLE)
                  </span>
                </div>
                {bleDeviceName && (
                  <span className="text-[10px] font-mono bg-lime-accent/20 text-lime-accent px-2 py-0.5 rounded font-bold">
                    ENLAZADO
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-400 mb-3">
                Conecta tu reloj GloryFit directamente mediante Web Bluetooth. Detecta chipsets Realtek / Linwear y transmite tu ritmo cardíaco en tiempo real a OL9 fit.
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
                    onClick={handleConnectGloryFitBluetooth}
                    disabled={isBleConnecting}
                    className="w-full py-3.5 rounded-xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lime-glow transition-all active:scale-[0.98]"
                  >
                    <Bluetooth className="w-4 h-4" />
                    {isBleConnecting ? 'Buscando Reloj GloryFit...' : 'Vincular Reloj GloryFit'}
                  </button>
                  {bleError && (
                    <p className="text-[10px] text-red-400 font-mono mt-2 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {bleError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* GloryFit Compatibility Notice */}
            <div className="bg-industrial-950/60 border border-industrial-800 rounded-2xl p-3 text-[11px] text-slate-400 font-mono flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-gold-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-200 font-bold mb-0.5">Modelos Compatibles GloryFit:</p>
                <p>Relojes con chip Realtek/Linwear (Q18, Q21, G20, G35, T80, LW07, SW022, marcas como Haylou, Cubot, Blackview, KOSPET, Zeblaze que usan GloryFit).</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: QUICK GLORYFIT SYNC (Ingreso instantáneo desde la pantalla del reloj) */}
        {activeSyncTab === 'quick' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Watch className="w-4 h-4 text-lime-accent" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Registro Rápido de Pantalla GloryFit
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                ¿Acabas de trotar? Mira la pantalla de resumen en tu reloj GloryFit e introduce los números aquí para sincronizar de inmediato.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Distancia (km)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={gloryKm}
                    onChange={(e) => setGloryKm(e.target.value)}
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
                    value={gloryAvgBpm}
                    onChange={(e) => setGloryAvgBpm(e.target.value)}
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
                      value={gloryMinutes}
                      onChange={(e) => setGloryMinutes(e.target.value)}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-2 py-2 text-sm font-mono font-bold text-slate-100 text-center"
                      placeholder="28"
                    />
                    <span className="text-slate-500 font-bold">:</span>
                    <input
                      type="number"
                      value={glorySeconds}
                      onChange={(e) => setGlorySeconds(e.target.value)}
                      className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-2 py-2 text-sm font-mono font-bold text-slate-100 text-center"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Pasos GloryFit
                  </label>
                  <input
                    type="number"
                    value={glorySteps}
                    onChange={(e) => setGlorySteps(e.target.value)}
                    className="w-full bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-gold-accent"
                    placeholder="5800"
                  />
                </div>
              </div>

              {glorySuccessMsg && (
                <div className="p-2.5 bg-lime-accent/20 border border-lime-accent text-lime-accent rounded-xl text-xs font-mono font-bold mb-3 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> {glorySuccessMsg}
                </div>
              )}

              <button
                onClick={handleSaveGloryFitQuickSync}
                className="w-full py-3 rounded-xl bg-gold-accent hover:bg-gold-amber text-industrial-950 font-black font-mono text-xs uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar Carrera GloryFit en Bitácora
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: FILE IMPORTER (.GPX, .TCX, .FIT, .JSON) */}
        {activeSyncTab === 'files' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <UploadCloud className="w-4 h-4 text-gold-accent" />
                <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                  Importador de Rutas GloryFit
                </span>
              </div>

              <div className="bg-industrial-900/60 border border-industrial-800 rounded-xl p-3 mb-3 text-[11px] text-slate-300 font-mono space-y-1">
                <p className="font-bold text-lime-accent">¿Cómo exportar desde la app GloryFit?</p>
                <p>1. Abre <span className="text-slate-100 font-bold">GloryFit</span> en tu móvil.</p>
                <p>2. Ve a <span className="text-slate-100 font-bold">Deporte &gt; Historial</span>.</p>
                <p>3. Selecciona la carrera y toca <span className="text-slate-100 font-bold">Compartir / Exportar (.GPX o .TCX)</span>.</p>
                <p>4. Sube el archivo aquí abajo.</p>
              </div>

              <label className="flex flex-col items-center justify-center border-2 border-dashed border-industrial-700 hover:border-lime-accent rounded-xl p-5 cursor-pointer bg-industrial-900/50 transition-colors">
                <FileText className="w-7 h-7 text-lime-accent mb-2" />
                <span className="text-xs font-mono font-bold text-slate-200 text-center">
                  {isImporting ? 'Parseando telemetría de GloryFit...' : 'Selecciona o arrastra archivo .GPX, .TCX o .FIT'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-1">
                  Formatos compatibles de GloryFit
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

        {/* TAB 4: STRAVA API OAUTH */}
        {activeSyncTab === 'strava' && (
          <div className="space-y-4">
            <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FC4C02]/20 flex items-center justify-center text-[#FC4C02] font-black">
                    <Flame className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <span className="text-xs font-mono font-bold text-slate-100 uppercase block">
                      Strava API OAuth 2.0
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {isStravaConnected ? `Conectado como ${stravaAthlete?.firstname || 'Atleta'}` : 'Sin vincular'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleToggleStrava}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                    isStravaConnected
                      ? 'bg-industrial-800 border border-industrial-700 text-slate-400 hover:text-white'
                      : 'bg-[#FC4C02] hover:bg-[#e04300] text-white'
                  }`}
                >
                  {isStravaConnected ? 'Desconectar' : 'Vincular Strava'}
                </button>
              </div>

              <p className="text-[11px] text-slate-400">
                Al terminar una carrera en OL9 fit, puedes publicarla automáticamente en tu feed de Strava con distancia, mapa, splits y calorías.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
