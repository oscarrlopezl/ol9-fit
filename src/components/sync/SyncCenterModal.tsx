import React, { useState, useEffect } from 'react';
import { Bluetooth, UploadCloud, Watch, Flame, Check, AlertCircle, FileText, Heart, RefreshCw, X, Radio } from 'lucide-react';
import { wearableSyncService, BleHeartRateData, WearableProvider } from '../../services/wearableSyncService';
import { stravaService } from '../../services/stravaService';
import { dbService } from '../../services/dbService';
import { RunSession } from '../../types';

interface SyncCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunImported?: (run: RunSession) => void;
}

export const SyncCenterModal: React.FC<SyncCenterModalProps> = ({ isOpen, onClose, onRunImported }) => {
  // Bluetooth state
  const [isBleConnecting, setIsBleConnecting] = useState(false);
  const [bleDeviceName, setBleDeviceName] = useState<string | null>(null);
  const [liveBpm, setLiveBpm] = useState<number | null>(null);
  const [bleError, setBleError] = useState<string | null>(null);

  // Strava state
  const [isStravaConnected, setIsStravaConnected] = useState(false);
  const [stravaAthlete, setStravaAthlete] = useState<any>(null);

  // File import state
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Watch Provider Hook test
  const [selectedProvider, setSelectedProvider] = useState<WearableProvider>('dafit');
  const [providerSyncStatus, setProviderSyncStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkStravaStatus();
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

  const handleConnectBluetooth = async () => {
    setIsBleConnecting(true);
    setBleError(null);
    try {
      const res = await wearableSyncService.connectHeartRateMonitor(
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
        setBleError(res.error || 'No se pudo vincular sensor BLE');
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
    setImportStatus('Procesando y parseando telemetría...');
    try {
      const session = await wearableSyncService.parseActivityFile(file);
      await dbService.saveRun(session);
      setImportStatus(`¡Actividad importada con éxito! (${(session.distanceMeters / 1000).toFixed(2)} km)`);
      if (onRunImported) onRunImported(session);
    } catch (err: any) {
      setImportStatus(`Error al importar archivo: ${err.message}`);
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
      // Connect demo / mock account for local testing
      const token = await stravaService.connectDemoAccount();
      setIsStravaConnected(true);
      setStravaAthlete(token.athlete);
    }
  };

  const handleTestWatchProviderSync = async () => {
    setProviderSyncStatus(`Sincronizando con API de ${selectedProvider.toUpperCase()}...`);
    // Sample raw payload from smartwatch
    const samplePayload = {
      steps: 7420,
      distance: 5500,
      duration: 1920,
      calories: 380,
      heartRate: 154,
      date: new Date().toISOString(),
    };

    const res = await wearableSyncService.syncWatchData(selectedProvider, samplePayload);
    if (res.success && res.session) {
      await dbService.saveRun(res.session);
      setProviderSyncStatus(`✓ ${res.message} - 5.50 km guardados en la bitácora`);
      if (onRunImported) onRunImported(res.session);
    } else {
      setProviderSyncStatus(`✕ ${res.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-industrial-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-industrial-900 border border-industrial-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-industrial-800 pb-3 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-lime-accent/20 border border-lime-accent flex items-center justify-center text-lime-accent">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase text-lime-accent tracking-widest block">
                CONECTIVIDAD & IOT
              </span>
              <h2 className="text-base font-black text-slate-100 font-mono">
                Centro de Sincronización
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

        {/* 1. WEB BLUETOOTH SECTION */}
        <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bluetooth className={`w-4 h-4 ${bleDeviceName ? 'text-lime-accent' : 'text-slate-400'}`} />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase">
                Sensor Cardíaco Bluetooth (0x180D)
              </span>
            </div>
            {bleDeviceName && (
              <span className="text-[10px] font-mono bg-lime-accent/20 text-lime-accent px-2 py-0.5 rounded font-bold">
                CONECTADO
              </span>
            )}
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Vincula bandas de pecho o relojes compatibles con el perfil estándar GATT Heart Rate (Polar, Garmin, CooSpo, etc.).
          </p>

          {bleDeviceName ? (
            <div className="flex items-center justify-between bg-industrial-900 p-3 rounded-xl border border-industrial-700">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-red-500 fill-current animate-pulse" />
                <div>
                  <p className="text-xs font-bold font-mono text-slate-100">{bleDeviceName}</p>
                  <p className="text-sm font-black font-mono text-red-400">
                    {liveBpm ? `${liveBpm} BPM` : 'Esperando lectura...'}
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
          ) : (
            <div>
              <button
                onClick={handleConnectBluetooth}
                disabled={isBleConnecting}
                className="w-full py-2.5 rounded-xl bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 text-slate-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <Bluetooth className="w-4 h-4 text-lime-accent" />
                {isBleConnecting ? 'Buscando dispositivos BLE...' : 'Escanear Sensor Bluetooth'}
              </button>
              {bleError && (
                <p className="text-[10px] text-red-400 font-mono mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {bleError}
                </p>
              )}
            </div>
          )}
        </div>

        {/* 2. CHINESE WATCH APPS FILE IMPORTER (.GPX, .TCX, .FIT) */}
        <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <UploadCloud className="w-4 h-4 text-gold-accent" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
              Importador Directo (.GPX, .TCX, .FIT)
            </span>
          </div>

          <p className="text-[11px] text-slate-400 mb-3">
            Sube tracks generados por aplicaciones chinas: <span className="text-slate-300 font-mono">DaFit, FitCloudPro, GloryFit, Zepp, VeryFit</span>.
          </p>

          <label className="flex flex-col items-center justify-center border-2 border-dashed border-industrial-700 hover:border-gold-accent rounded-xl p-4 cursor-pointer bg-industrial-900/50 transition-colors">
            <FileText className="w-6 h-6 text-gold-accent mb-1" />
            <span className="text-xs font-mono font-bold text-slate-200">
              {isImporting ? 'Procesando archivo...' : 'Seleccionar archivo .GPX, .TCX o .FIT'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              Arrastra o haz clic aquí
            </span>
            <input
              type="file"
              accept=".gpx,.tcx,.fit"
              onChange={handleFileUpload}
              disabled={isImporting}
              className="hidden"
            />
          </label>

          {importStatus && (
            <p className="text-xs font-mono text-lime-accent mt-2 p-2 bg-industrial-900 rounded-lg border border-industrial-800">
              {importStatus}
            </p>
          )}
        </div>

        {/* 3. EXTENSIBLE WATCH API DISPATCHER */}
        <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Radio className="w-4 h-4 text-lime-accent" />
            <span className="text-xs font-mono font-bold text-slate-200 uppercase">
              Hook Watch API (syncWatchData)
            </span>
          </div>

          <div className="flex gap-2 mb-2">
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as WearableProvider)}
              className="flex-1 bg-industrial-900 border border-industrial-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200"
            >
              <option value="dafit">DaFit Ecosystem</option>
              <option value="fitcloudpro">FitCloudPro Health</option>
              <option value="gloryfit">GloryFit Sports</option>
              <option value="zepp">Zepp Life / Amazfit</option>
              <option value="veryfit">VeryFit Smartwatch</option>
            </select>

            <button
              onClick={handleTestWatchProviderSync}
              className="px-4 py-2 bg-industrial-800 hover:bg-industrial-700 border border-lime-accent/40 rounded-xl text-xs font-mono font-bold text-lime-accent"
            >
              Test Sync
            </button>
          </div>

          {providerSyncStatus && (
            <p className="text-[11px] font-mono text-slate-300 bg-industrial-900 p-2 rounded-lg border border-industrial-800">
              {providerSyncStatus}
            </p>
          )}
        </div>

        {/* 4. STRAVA OAUTH INTEGRATION */}
        <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FC4C02]/20 flex items-center justify-center text-[#FC4C02] font-black">
                <Flame className="w-4 h-4 fill-current" />
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
        </div>
      </div>
    </div>
  );
};
