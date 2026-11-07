import React, { useState } from 'react';
import { Film, Zap, Eye, Activity } from 'lucide-react';

interface ExerciseGifVisualizerProps {
  exerciseName: string;
  animationType: string;
  targetMuscles: string[];
  isRest?: boolean;
  customGifUrl?: string;
}

export const ExerciseGifVisualizer: React.FC<ExerciseGifVisualizerProps> = ({
  exerciseName,
  animationType,
  targetMuscles,
  isRest = false,
  customGifUrl,
}) => {
  const [viewMode, setViewMode] = useState<'gif' | 'anatomy'>('gif');

  return (
    <div className="relative w-full h-64 sm:h-72 flex flex-col justify-between bg-industrial-950 rounded-2xl border border-industrial-800 p-3 overflow-hidden shadow-inner">
      {/* Background industrial pattern */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Top Bar with Tags & Mode Switcher */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-lime-accent animate-ping" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-lime-accent bg-industrial-900/90 px-2 py-0.5 rounded border border-lime-accent/30 font-bold">
            {isRest ? 'PAUSA DE RECUPERACIÓN' : 'DEMOSTRACIÓN ANIMADA'}
          </span>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-industrial-900 border border-industrial-800 p-0.5 rounded-xl">
          <button
            onClick={() => setViewMode('gif')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              viewMode === 'gif'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3 h-3" /> GIF
          </button>
          <button
            onClick={() => setViewMode('anatomy')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold flex items-center gap-1 transition-all ${
              viewMode === 'anatomy'
                ? 'bg-lime-accent text-industrial-950 shadow-lime-glow font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3 h-3" /> Foco
          </button>
        </div>
      </div>

      {/* Central Visual Area: Animated GIF Frame Loop */}
      <div className="relative flex-1 flex items-center justify-center my-1 overflow-hidden">
        {customGifUrl && viewMode === 'gif' ? (
          <img
            src={customGifUrl}
            alt={exerciseName}
            className="max-h-52 w-auto object-contain rounded-xl shadow-lg"
          />
        ) : (
          /* High Frame-Rate Industrial Vector Animated GIF Loop */
          <svg
            viewBox="0 0 320 200"
            className="w-full h-full max-h-52 transition-all duration-300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="neonGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#bdf200" />
                <stop offset="100%" stopColor="#eab308" />
              </linearGradient>
              <filter id="bodyGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Floor Marker */}
            <line x1="20" y1="170" x2="300" y2="170" stroke="#334155" strokeWidth="2" strokeDasharray="4 4" />

            {/* 1. JUMPING JACKS ANIMATION */}
            {animationType === 'jumping-jacks' && (
              <g className="animate-pulse">
                <circle cx="160" cy="50" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <line x1="160" y1="64" x2="160" y2="120" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Arms expanding upwards */}
                <line x1="160" y1="75" x2="110" y2="40" stroke="#bdf200" strokeWidth="9" strokeLinecap="round" filter="url(#bodyGlow)" />
                <line x1="160" y1="75" x2="210" y2="40" stroke="#bdf200" strokeWidth="9" strokeLinecap="round" filter="url(#bodyGlow)" />
                {/* Legs hopping out */}
                <line x1="160" y1="120" x2="115" y2="170" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                <line x1="160" y1="120" x2="205" y2="170" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                {/* Motion vectors */}
                <path d="M 120,60 Q 110,40 100,50" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="2 2" />
                <path d="M 200,60 Q 210,40 220,50" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="2 2" />
              </g>
            )}

            {/* 2. PUSH-UPS / FLEXIONES ANIMATION */}
            {animationType === 'pushups' && (
              <g>
                <circle cx="80" cy="115" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                {/* Torso straight */}
                <line x1="90" y1="120" x2="220" y2="140" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Arms pushing from floor */}
                <polyline points="105,125 105,170" stroke="#bdf200" strokeWidth="9" strokeLinecap="round" filter="url(#bodyGlow)" />
                {/* Pectoral & Tricep Activation glow */}
                <circle cx="115" cy="125" r="14" fill="url(#neonGlow)" filter="url(#bodyGlow)" opacity="0.8" />
                {/* Feet */}
                <circle cx="225" cy="165" r="7" fill="#475569" />
                <line x1="220" y1="140" x2="225" y2="165" stroke="#64748b" strokeWidth="9" strokeLinecap="round" />
                {/* Repetition arrows */}
                <path d="M 105,100 L 105,115" stroke="#eab308" strokeWidth="3" markerEnd="url(#arrow)" />
              </g>
            )}

            {/* 3. SQUATS / SENTADILLAS ANIMATION */}
            {animationType === 'squats' && (
              <g>
                <circle cx="160" cy="65" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <line x1="160" y1="79" x2="150" y2="120" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Thighs 90 degrees parallel */}
                <line x1="150" y1="120" x2="190" y2="125" stroke="#bdf200" strokeWidth="11" strokeLinecap="round" filter="url(#bodyGlow)" />
                <line x1="190" y1="125" x2="185" y2="170" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                {/* Arms outstretched forward */}
                <line x1="160" y1="85" x2="210" y2="85" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
                {/* Quads & Glutes Ignition glow */}
                <circle cx="165" cy="122" r="15" fill="url(#neonGlow)" filter="url(#bodyGlow)" opacity="0.85" />
                {/* Angle 90° guide */}
                <path d="M 150,115 A 20 20 0 0 1 185,120" stroke="#eab308" strokeWidth="2" fill="none" strokeDasharray="3 3" />
              </g>
            )}

            {/* 4. DIPS / FONDOS EN SILLA ANIMATION */}
            {animationType === 'dips' && (
              <g>
                {/* Chair outline */}
                <rect x="70" y="110" width="40" height="60" fill="#1e293b" stroke="#475569" strokeWidth="3" rx="4" />
                <circle cx="130" cy="85" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <line x1="130" y1="99" x2="135" y2="135" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Arm bending behind on chair */}
                <polyline points="130,105 105,108 105,112" stroke="#bdf200" strokeWidth="8" strokeLinecap="round" filter="url(#bodyGlow)" />
                {/* Triceps glow */}
                <circle cx="115" cy="106" r="10" fill="url(#neonGlow)" filter="url(#bodyGlow)" />
                {/* Legs extended forward */}
                <polyline points="135,135 180,140 190,170" stroke="#64748b" strokeWidth="9" strokeLinecap="round" fill="none" />
              </g>
            )}

            {/* 5. GLUTE BRIDGE / PUENTE DE GLÚTEO */}
            {animationType === 'glute-bridge' && (
              <g>
                <circle cx="70" cy="165" r="13" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                {/* Flat upper back */}
                <line x1="75" y1="165" x2="110" y2="165" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Hips elevated high in bridge */}
                <line x1="110" y1="165" x2="160" y2="120" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Knees bent 90° to floor */}
                <line x1="160" y1="120" x2="200" y2="168" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                {/* Glute & Hamstring Apex glow */}
                <circle cx="150" cy="125" r="16" fill="url(#neonGlow)" filter="url(#bodyGlow)" opacity="0.9" />
                {/* Upward force arrows */}
                <line x1="150" y1="145" x2="150" y2="115" stroke="#bdf200" strokeWidth="3" strokeLinecap="round" />
              </g>
            )}

            {/* 6. WALL SIT / SENTADILLA EN PARED */}
            {animationType === 'wall-sit' && (
              <g>
                {/* Wall vertical line */}
                <line x1="100" y1="40" x2="100" y2="175" stroke="#475569" strokeWidth="6" />
                <circle cx="115" cy="75" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <line x1="110" y1="89" x2="110" y2="125" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                {/* Thighs horizontal */}
                <line x1="110" y1="125" x2="165" y2="125" stroke="#bdf200" strokeWidth="11" strokeLinecap="round" filter="url(#bodyGlow)" />
                {/* Lower legs vertical to floor */}
                <line x1="165" y1="125" x2="165" y2="170" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                {/* Quadriceps isometric tension */}
                <circle cx="140" cy="125" r="14" fill="url(#neonGlow)" filter="url(#bodyGlow)" opacity="0.9" />
              </g>
            )}

            {/* 7. BURPEES / CALISTENIA DINÁMICA */}
            {animationType === 'burpees' && (
              <g className="animate-pulse">
                <circle cx="160" cy="55" r="14" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <line x1="160" y1="69" x2="160" y2="125" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <line x1="160" y1="80" x2="110" y2="45" stroke="#bdf200" strokeWidth="8" strokeLinecap="round" filter="url(#bodyGlow)" />
                <line x1="160" y1="80" x2="210" y2="45" stroke="#bdf200" strokeWidth="8" strokeLinecap="round" filter="url(#bodyGlow)" />
                <line x1="160" y1="125" x2="140" y2="168" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                <line x1="160" y1="125" x2="180" y2="168" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                <circle cx="160" cy="95" r="20" fill="url(#neonGlow)" filter="url(#bodyGlow)" opacity="0.75" />
              </g>
            )}

            {/* Fallback general motion */}
            {!['jumping-jacks', 'pushups', 'squats', 'dips', 'glute-bridge', 'wall-sit', 'burpees'].includes(animationType) && (
              <g>
                <circle cx="160" cy="70" r="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="4" />
                <line x1="160" y1="86" x2="160" y2="135" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
                <line x1="160" y1="100" x2="115" y2="85" stroke="#bdf200" strokeWidth="8" strokeLinecap="round" filter="url(#bodyGlow)" />
                <line x1="160" y1="100" x2="205" y2="85" stroke="#bdf200" strokeWidth="8" strokeLinecap="round" filter="url(#bodyGlow)" />
                <line x1="160" y1="135" x2="140" y2="170" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                <line x1="160" y1="135" x2="180" y2="170" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
                <circle cx="160" cy="115" r="16" fill="url(#neonGlow)" filter="url(#bodyGlow)" opacity="0.8" />
              </g>
            )}
          </svg>
        )}
      </div>

      {/* Bottom Bar: Target Muscle Groups */}
      <div className="relative z-10 flex items-center justify-between pt-2 border-t border-industrial-800 text-[11px] font-mono">
        <span className="text-slate-300 truncate max-w-[200px] font-bold">
          {exerciseName}
        </span>
        <div className="flex gap-1">
          {targetMuscles.slice(0, 2).map((m) => (
            <span key={m} className="bg-industrial-900 text-gold-accent px-2 py-0.5 rounded text-[10px] font-mono border border-industrial-700">
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
