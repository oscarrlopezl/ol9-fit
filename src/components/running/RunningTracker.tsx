import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Trash2, Heart, Flame, Compass, Zap, MapPin, Radio, Activity } from 'lucide-react';
import { GeoPoint, RunSession, Split } from '../../types';
import { calculateHaversineDistanceMeters, wearableSyncService } from '../../services/wearableSyncService';
import { dbService } from '../../services/dbService';
import { audioService } from '../../services/audioService';
import { PostRunSummaryModal } from './PostRunSummaryModal';

// We import Leaflet dynamically or from window.L to ensure compatibility with Vite SSR / bundle
declare const L: any;

export const RunningTracker: React.FC = () => {
  // Session State
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [distanceMeters, setDistanceMeters] = useState(0);
  const [currentPace, setCurrentPace] = useState(0); // seconds per km
  const [avgPace, setAvgPace] = useState(0); // seconds per km
  const [cadenceSpm, setCadenceSpm] = useState(165);
  const [calories, setCalories] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);
  const [route, setRoute] = useState<GeoPoint[]>([]);
  const [splits, setSplits] = useState<Split[]>([]);

  // Simulation mode toggle for indoor testing
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Wearable live heart rate
  const [heartRate, setHeartRate] = useState<number | null>(null);

  // Post Run Modal
  const [completedSession, setCompletedSession] = useState<RunSession | null>(null);

  // Map & Geolocation refs
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);
  const simIntervalRef = useRef<any>(null);
  const timerIntervalRef = useRef<any>(null);

  // Default coordinate (Caracas, Venezuela / or user current coordinate)
  const defaultCoords = { lat: 10.4806, lng: -66.9036 };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if Leaflet is loaded
    const initLeaflet = () => {
      if (typeof window === 'undefined' || !(window as any).L) {
        setTimeout(initLeaflet, 200);
        return;
      }

      if (mapInstanceRef.current) return;

      const L = (window as any).L;
      const initialLat = route.length > 0 ? route[route.length - 1].lat : defaultCoords.lat;
      const initialLng = route.length > 0 ? route[route.length - 1].lng : defaultCoords.lng;

      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([initialLat, initialLng], 16);

      // Dark theme CartoDB Basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Neon lime polyline for live route
      const polyline = L.polyline([], {
        color: '#bdf200',
        weight: 5,
        opacity: 0.9,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(map);

      // Pulsing custom runner marker
      const runnerIcon = L.divIcon({
        className: 'ol9-runner-pin',
        html: `<div style="width: 18px; height: 18px; background: #bdf200; border: 3px solid #0f172a; border-radius: 50%; box-shadow: 0 0 12px #ccff00; animation: pulse 1.5s infinite;"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const marker = L.marker([initialLat, initialLng], { icon: runnerIcon }).addTo(map);

      mapInstanceRef.current = map;
      polylineRef.current = polyline;
      markerRef.current = marker;

      // Center map on user location if geolocation is available
      if (navigator.geolocation && route.length === 0) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            map.setView([userLat, userLng], 16);
            marker.setLatLng([userLat, userLng]);
          },
          (err) => console.log('Location default notice:', err.message),
          { timeout: 5000 }
        );
      }
    };

    initLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Timer Tick
  useEffect(() => {
    if (isRunning && !isPaused) {
      timerIntervalRef.current = setInterval(() => {
        setDurationSeconds((d) => d + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, isPaused]);

  // Calories, Average Pace and Cadence computation
  useEffect(() => {
    const km = distanceMeters / 1000;
    if (km > 0 && durationSeconds > 0) {
      const avg = Math.round(durationSeconds / km);
      setAvgPace(avg);
      setCalories(Math.round(km * 65));
      // Cadence estimate between 162 and 178 spm
      const estimatedCadence = Math.min(182, Math.max(155, Math.round(160 + (1000 / Math.max(240, avg)) * 12)));
      setCadenceSpm(estimatedCadence);
    }
  }, [distanceMeters, durationSeconds]);

  // Handle new coordinate received (either live GPS or simulation)
  const handleNewCoordinate = (lat: number, lng: number, altitude?: number, speedMps?: number) => {
    const now = Date.now();
    const newPoint: GeoPoint = { lat, lng, altitude, speed: speedMps, timestamp: now };

    setRoute((prev) => {
      let additionalDist = 0;
      let newElevationDelta = 0;

      if (prev.length > 0) {
        const last = prev[prev.length - 1];
        additionalDist = calculateHaversineDistanceMeters(last.lat, last.lng, lat, lng);

        // Filter GPS jitter (less than 0.8 meters in 1 second is noise unless simulated)
        if (!isDemoMode && additionalDist < 0.8) {
          return prev;
        }

        if (altitude && last.altitude && altitude > last.altitude) {
          newElevationDelta = altitude - last.altitude;
        }
      }

      const updatedRoute = [...prev, newPoint];

      setDistanceMeters((d) => {
        const newTotal = d + additionalDist;
        // Check for km split
        const prevKm = Math.floor(d / 1000);
        const nextKm = Math.floor(newTotal / 1000);
        if (nextKm > prevKm && nextKm > 0) {
          audioService.playStartTone();
          setSplits((sp) => [
            ...sp,
            {
              km: nextKm,
              timeSeconds: durationSeconds,
              paceSecondsPerKm: currentPace > 0 ? currentPace : avgPace,
              elevationDelta: Math.round(elevationGain)
            }
          ]);
        }
        return newTotal;
      });

      if (newElevationDelta > 0) {
        setElevationGain((e) => e + newElevationDelta);
      }

      // Compute instantaneous pace
      if (speedMps && speedMps > 0.5) {
        const instantPace = Math.round(1000 / speedMps);
        setCurrentPace(instantPace);
      } else if (prev.length > 0 && additionalDist > 1) {
        const dt = (now - prev[prev.length - 1].timestamp) / 1000;
        if (dt > 0) {
          const pace = Math.round((dt / additionalDist) * 1000);
          if (pace > 120 && pace < 900) {
            setCurrentPace(pace);
          }
        }
      }

      // Update Map Polylines and Marker
      if (polylineRef.current && mapInstanceRef.current && markerRef.current) {
        const latLngs = updatedRoute.map((p) => [p.lat, p.lng]);
        polylineRef.current.setLatLngs(latLngs);
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.5 });
      }

      return updatedRoute;
    });
  };

  // Start Live Run
  const handleStartRun = () => {
    setIsRunning(true);
    setIsPaused(false);
    audioService.playStartTone();

    if (isDemoMode) {
      // Start Simulated GPS Run
      let simStep = 0;
      const baseLat = route.length > 0 ? route[route.length - 1].lat : defaultCoords.lat;
      const baseLng = route.length > 0 ? route[route.length - 1].lng : defaultCoords.lng;

      simIntervalRef.current = setInterval(() => {
        simStep++;
        const angle = simStep * 0.08;
        const radius = 0.0015 + (simStep * 0.00005);
        const nextLat = baseLat + Math.sin(angle) * radius;
        const nextLng = baseLng + Math.cos(angle) * radius;
        const nextAlt = 820 + Math.sin(simStep * 0.2) * 10;
        const simulatedSpeed = 2.8 + Math.sin(simStep * 0.3) * 0.4; // ~10 km/h (5:50 min/km)

        handleNewCoordinate(nextLat, nextLng, nextAlt, simulatedSpeed);
      }, 1000);
    } else {
      // Start Real Geolocation Watch
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, altitude, speed } = pos.coords;
            handleNewCoordinate(latitude, longitude, altitude || undefined, speed || undefined);
          },
          (err) => {
            console.warn('Geolocation error:', err.message);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 1000,
            timeout: 10000,
          }
        );
      }
    }
  };

  // Pause Run
  const handlePauseRun = () => {
    setIsPaused(true);
    audioService.playRestTone();
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
  };

  // Resume Run
  const handleResumeRun = () => {
    setIsPaused(false);
    audioService.playStartTone();

    if (isDemoMode) {
      let simStep = route.length;
      const baseLat = route.length > 0 ? route[0].lat : defaultCoords.lat;
      const baseLng = route.length > 0 ? route[0].lng : defaultCoords.lng;

      simIntervalRef.current = setInterval(() => {
        simStep++;
        const angle = simStep * 0.08;
        const radius = 0.0015 + (simStep * 0.00005);
        const nextLat = baseLat + Math.sin(angle) * radius;
        const nextLng = baseLng + Math.cos(angle) * radius;
        const nextAlt = 820 + Math.sin(simStep * 0.2) * 10;
        const simulatedSpeed = 2.8 + Math.sin(simStep * 0.3) * 0.4;

        handleNewCoordinate(nextLat, nextLng, nextAlt, simulatedSpeed);
      }, 1000);
    } else {
      if ('geolocation' in navigator) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude, longitude, altitude, speed } = pos.coords;
            handleNewCoordinate(latitude, longitude, altitude || undefined, speed || undefined);
          },
          (err) => console.warn(err),
          { enableHighAccuracy: true }
        );
      }
    }
  };

  // Finish and Save Run
  const handleSaveRun = async () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    setIsRunning(false);
    setIsPaused(false);
    audioService.playFanfare();

    const km = distanceMeters / 1000;
    const finalAvgPace = km > 0 && durationSeconds > 0 ? Math.round(durationSeconds / km) : avgPace;

    const runSession: RunSession = {
      id: 'run_' + Date.now(),
      date: new Date().toISOString(),
      durationSeconds,
      distanceMeters,
      calories,
      avgPaceSecondsPerKm: finalAvgPace,
      avgSpeedKmh: parseFloat((km / (Math.max(1, durationSeconds) / 3600)).toFixed(2)),
      cadenceSpm,
      avgHeartRate: heartRate || undefined,
      route,
      splits: splits.length > 0 ? splits : wearableSyncService.calculateSplitsFromRoute(route),
      elevationGainMeters: Math.round(elevationGain),
      source: isDemoMode ? 'demo' : 'live',
      notes: 'Trote Matutino Progresivo registrado con telemetría en vivo OL9 fit.'
    };

    await dbService.saveRun(runSession);
    setCompletedSession(runSession);
  };

  // Discard Run
  const handleDiscardRun = () => {
    if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
    if (simIntervalRef.current) clearInterval(simIntervalRef.current);

    setIsRunning(false);
    setIsPaused(false);
    setDurationSeconds(0);
    setDistanceMeters(0);
    setCurrentPace(0);
    setAvgPace(0);
    setCalories(0);
    setElevationGain(0);
    setRoute([]);
    setSplits([]);

    if (polylineRef.current) polylineRef.current.setLatLngs([]);
  };

  // Helper formatting for Pace
  const formatPace = (secPerKm: number) => {
    if (!secPerKm || secPerKm <= 0 || secPerKm > 1800) return '--:--';
    const min = Math.floor(secPerKm / 60);
    const sec = Math.round(secPerKm % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Helper formatting for Time
  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const distanceKmFormatted = (distanceMeters / 1000).toFixed(2);

  return (
    <div className="relative flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-industrial-950 rounded-3xl overflow-hidden border border-industrial-800 shadow-industrial">
      {/* 1. UPPER TELEMETRY HUD (Panel Superior) */}
      <div className="relative z-10 bg-industrial-950/90 backdrop-blur-md border-b border-industrial-800/90 p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning && !isPaused ? 'bg-lime-accent animate-ping' : 'bg-slate-500'}`} />
            <span className="text-[11px] font-mono font-bold tracking-widest uppercase text-lime-accent">
              TROTE MATUTINO PROGRESIVO
            </span>
          </div>

          {/* Simulation Toggle & Heart Rate Badge */}
          <div className="flex items-center gap-2">
            {heartRate && (
              <div className="flex items-center gap-1 bg-red-500/20 border border-red-500/40 px-2.5 py-0.5 rounded-full text-red-400 font-mono text-xs">
                <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
                <span>{heartRate} bpm</span>
              </div>
            )}
            <button
              onClick={() => !isRunning && setIsDemoMode(!isDemoMode)}
              disabled={isRunning}
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors ${
                isDemoMode
                  ? 'bg-gold-amber/20 border-gold-accent text-gold-accent font-bold'
                  : 'bg-industrial-900 border-industrial-700 text-slate-400'
              }`}
            >
              {isDemoMode ? 'SIMULACIÓN GPS ACTIVA' : 'GPS REAL'}
            </button>
          </div>
        </div>

        {/* Primary Metrics: Distance, Timer, Pace */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-industrial-900/80 border border-industrial-800/80 rounded-2xl p-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Distancia</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-lime-accent tracking-tight">
              {distanceKmFormatted}
            </span>
            <span className="text-[10px] font-mono text-slate-400 ml-1">km</span>
          </div>

          <div className="bg-industrial-900/80 border border-industrial-800/80 rounded-2xl p-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Tiempo</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-slate-100 tracking-tight">
              {formatTimer(durationSeconds)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 ml-1">hh:mm:ss</span>
          </div>

          <div className="bg-industrial-900/80 border border-industrial-800/80 rounded-2xl p-2.5">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Ritmo Actual</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-gold-accent tracking-tight">
              {formatPace(currentPace)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 ml-1">/km</span>
          </div>
        </div>

        {/* Secondary Metrics: Avg Pace, Cadence, Calories */}
        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-industrial-800/60 text-center text-xs font-mono">
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Ritmo Medio</span>
            <span className="text-slate-300 font-bold">{formatPace(avgPace)} /km</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Cadencia Est.</span>
            <span className="text-slate-300 font-bold">{cadenceSpm} spm</span>
          </div>
          <div>
            <span className="text-slate-500 text-[10px] uppercase block">Calorías</span>
            <span className="text-slate-300 font-bold">{calories} kcal</span>
          </div>
        </div>
      </div>

      {/* 2. LEAFLET INTERACTIVE DARK MAP */}
      <div className="relative flex-1 w-full bg-industrial-950">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Floating Route Badge */}
        <div className="absolute top-3 left-3 z-[400] bg-industrial-950/85 backdrop-blur-md border border-industrial-700/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono text-slate-300 shadow-industrial">
          <Activity className="w-4 h-4 text-lime-accent" />
          <span>Track: {route.length} pts</span>
          <span className="text-slate-500">|</span>
          <span className="text-lime-accent">+{Math.round(elevationGain)}m</span>
        </div>
      </div>

      {/* 3. LARGE TOUCH CONTROLS (Controles Táctiles Grandes) */}
      <div className="relative z-10 bg-industrial-950/95 backdrop-blur-md border-t border-industrial-800 p-4 sm:p-5">
        {!isRunning ? (
          /* START BUTTON */
          <button
            onClick={handleStartRun}
            className="w-full py-5 rounded-2xl bg-gradient-to-r from-lime-dark via-lime-accent to-lime-dark hover:opacity-95 text-industrial-950 font-black font-mono text-lg uppercase tracking-wider shadow-lime-glow flex items-center justify-center gap-3 transition-transform active:scale-[0.98]"
          >
            <Play className="w-7 h-7 fill-industrial-950" />
            INICIAR TROTE MATUTINO
          </button>
        ) : (
          /* ACTIVE / PAUSED RUN CONTROLS */
          <div className="flex items-center gap-3">
            {!isPaused ? (
              /* PAUSE */
              <button
                onClick={handlePauseRun}
                className="flex-1 py-5 rounded-2xl bg-gold-accent hover:bg-gold-amber text-industrial-950 font-black font-mono text-base uppercase tracking-wider shadow-gold-glow flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Pause className="w-6 h-6 fill-industrial-950" />
                PAUSAR
              </button>
            ) : (
              /* RESUME */
              <button
                onClick={handleResumeRun}
                className="flex-1 py-5 rounded-2xl bg-lime-accent hover:bg-lime-glow text-industrial-950 font-black font-mono text-base uppercase tracking-wider shadow-lime-glow flex items-center justify-center gap-2 transition-transform active:scale-[0.98]"
              >
                <Play className="w-6 h-6 fill-industrial-950" />
                REANUDAR
              </button>
            )}

            {/* SAVE BUTTON */}
            <button
              onClick={handleSaveRun}
              disabled={distanceMeters < 50 && durationSeconds < 10}
              className="px-6 py-5 rounded-2xl bg-industrial-850 hover:bg-industrial-800 border border-lime-accent/50 text-lime-accent font-black font-mono text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-40"
              title="Guardar Sesión"
            >
              <Square className="w-5 h-5 fill-lime-accent" />
              GUARDAR
            </button>

            {/* DISCARD BUTTON */}
            <button
              onClick={handleDiscardRun}
              className="p-5 rounded-2xl bg-industrial-900 hover:bg-red-950/40 border border-industrial-800 hover:border-red-500 text-slate-400 hover:text-red-400 transition-colors"
              title="Descartar Sesión"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 4. POST-RUN SUMMARY MODAL */}
      {completedSession && (
        <PostRunSummaryModal
          session={completedSession}
          onClose={() => {
            setCompletedSession(null);
            handleDiscardRun();
          }}
        />
      )}
    </div>
  );
};
