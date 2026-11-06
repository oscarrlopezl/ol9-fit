import React, { useState } from 'react';
import { Volume2, VolumeX, Watch, Shield, Wifi, WifiOff, Download } from 'lucide-react';
import { audioService } from '../../services/audioService';

interface HeaderProps {
  onOpenSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSync }) => {
  const [muted, setMuted] = useState(audioService.getMuted());
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleToggleMute = () => {
    const isNowMuted = audioService.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <header className="sticky top-0 z-40 bg-industrial-950/90 backdrop-blur-md border-b border-industrial-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* BRAND LOGO & OFFICIAL TITLE */}
        <div className="flex items-center gap-3">
          {/* Industrial Hexagon Logo */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-industrial-800 via-industrial-900 to-industrial-950 border-2 border-lime-accent/50 flex items-center justify-center shadow-lime-glow overflow-hidden">
            <span className="font-mono font-black text-sm tracking-tighter text-lime-accent">
              OL9
            </span>
            <div className="absolute inset-0 bg-lime-accent/10 opacity-30 pointer-events-none" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono tracking-tight text-slate-100 uppercase">
                OL9 <span className="text-lime-accent font-extrabold">fit</span>
              </span>
              <span className="text-[9px] font-mono bg-lime-accent/20 text-lime-accent px-1.5 py-0.5 rounded border border-lime-accent/40 font-bold tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wider uppercase -mt-1 hidden sm:block">
              High Performance Training • Mobile PWA
            </p>
          </div>
        </div>

        {/* TOP CONTROLS & ICONS */}
        <div className="flex items-center gap-2">
          {/* Connectivity Status */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-industrial-900 border border-industrial-800 text-[10px] font-mono">
            {isOnline ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-lime-accent animate-pulse" />
                <span className="text-slate-300">PWA LISTA</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-400">OFFLINE (IDB)</span>
              </>
            )}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={handleToggleMute}
            className="p-2.5 rounded-xl bg-industrial-900 border border-industrial-800 hover:border-lime-accent/40 text-slate-300 hover:text-lime-accent transition-colors"
            title={muted ? 'Activar Efectos Sonoros' : 'Silenciar'}
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-lime-accent" />
            )}
          </button>

          {/* Wearables & Strava Sync Center Button */}
          <button
            onClick={onOpenSync}
            className="px-3 py-2 rounded-xl bg-industrial-900 hover:bg-industrial-800 border border-industrial-700 hover:border-gold-accent/50 text-slate-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Watch className="w-4 h-4 text-gold-accent" />
            <span className="hidden sm:inline">Sincronizar</span>
          </button>
        </div>
      </div>
    </header>
  );
};
