import React from 'react';

interface AbsExerciseSvgProps {
  svgType: string;
  name: string;
  isRest?: boolean;
}

export const AbsExerciseSvg: React.FC<AbsExerciseSvgProps> = ({ svgType, name, isRest = false }) => {
  return (
    <div className="relative w-full h-56 sm:h-64 flex items-center justify-center bg-industrial-950/80 rounded-2xl border border-industrial-800 p-4 overflow-hidden shadow-inner">
      {/* Background industrial grid pattern */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#334155 1px, transparent 1px)`,
          backgroundSize: '16px 16px'
        }}
      />

      {/* Target Muscle Glow Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        <span className="w-2.5 h-2.5 rounded-full bg-lime-accent animate-ping" />
        <span className="text-[11px] font-mono uppercase tracking-wider text-lime-accent bg-industrial-900/90 px-2 py-0.5 rounded border border-lime-accent/30">
          {isRest ? 'RECUPERACIÓN' : 'ACTIVACIÓN BIOMECÁNICA'}
        </span>
      </div>

      {/* Dynamic SVG depending on exercise type */}
      <svg
        viewBox="0 0 400 240"
        className="w-full h-full max-h-56 transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="neonGlowLime" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neonGlowGold" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="absGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#bdf200" />
            <stop offset="100%" stop-color="#eab308" />
          </linearGradient>
        </defs>

        {/* Floor baseline */}
        <line x1="20" y1="200" x2="380" y2="200" stroke="#334155" stroke-width="2" stroke-dasharray="4 4" />

        {/* 1. CRUNCH */}
        {svgType === 'crunch' && (
          <g transform="translate(40, 20)">
            {/* Mat */}
            <line x1="0" y1="180" x2="300" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Legs bent */}
            <polyline points="230,178 260,110 200,110 170,178" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
            {/* Pelvis & Lower Back */}
            <circle cx="170" cy="170" r="14" fill="#334155" stroke="#64748b" stroke-width="4" />
            {/* Torso curled up */}
            <path d="M 170,170 Q 145,150 115,130" fill="none" stroke="#64748b" stroke-width="14" stroke-linecap="round" />
            {/* Active Upper Rectus Abdominal Glow */}
            <path d="M 165,160 Q 140,145 125,135" fill="none" stroke="url(#absGradient)" stroke-width="8" filter="url(#neonGlowLime)" stroke-linecap="round" />
            {/* Head and hands at ears */}
            <circle cx="95" cy="115" r="16" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            <path d="M 125,135 L 105,115" stroke="#475569" stroke-width="8" stroke-linecap="round" />
            {/* Biomechanical contraction curve */}
            <path d="M 140,120 A 25 25 0 0 1 120,165" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="3 3" />
          </g>
        )}

        {/* 2. LEG RAISE */}
        {svgType === 'leg-raise' && (
          <g transform="translate(50, 10)">
            <line x1="0" y1="190" x2="300" y2="190" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Flat Torso & Head */}
            <line x1="80" y1="185" x2="180" y2="185" stroke="#64748b" stroke-width="14" stroke-linecap="round" />
            <circle cx="65" cy="183" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Hands under hips */}
            <line x1="130" y1="185" x2="180" y2="185" stroke="#334155" stroke-width="8" stroke-linecap="round" />
            {/* Pelvis Pivot */}
            <circle cx="180" cy="180" r="14" fill="#334155" stroke="#64748b" stroke-width="4" />
            {/* Legs Elevated 80 degrees */}
            <polyline points="180,180 205,80 215,35" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
            {/* Lower Abs Glow Core */}
            <circle cx="175" cy="172" r="12" fill="#bdf200" filter="url(#neonGlowLime)" opacity="0.9" />
            <line x1="150" y1="180" x2="185" y2="180" stroke="url(#absGradient)" stroke-width="8" filter="url(#neonGlowLime)" />
            {/* Biomechanical 90° angle mark */}
            <path d="M 180,150 A 30 30 0 0 0 200,180" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="3 3" />
          </g>
        )}

        {/* 3. STATIC PLANK */}
        {svgType === 'plank' && (
          <g transform="translate(30, 30)">
            <line x1="10" y1="170" x2="330" y2="170" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Forearm on ground */}
            <line x1="80" y1="168" x2="110" y2="168" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" />
            {/* Upper arm vertical */}
            <line x1="80" y1="168" x2="80" y2="115" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
            {/* Head */}
            <circle cx="55" cy="100" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Straight spine line */}
            <line x1="80" y1="115" x2="280" y2="145" stroke="#64748b" stroke-width="14" stroke-linecap="round" />
            {/* Feet toes */}
            <circle cx="285" cy="165" r="8" fill="#475569" />
            <line x1="280" y1="145" x2="285" y2="165" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
            {/* Transverse Core Armor Glow */}
            <rect x="140" y="118" width="70" height="18" rx="6" fill="url(#absGradient)" filter="url(#neonGlowLime)" opacity="0.85" />
            {/* Alignment laser guide */}
            <line x1="40" y1="105" x2="300" y2="150" stroke="#bdf200" stroke-width="1" stroke-dasharray="4 4" opacity="0.6" />
          </g>
        )}

        {/* 4. HEEL TOUCHES */}
        {svgType === 'heel-touches' && (
          <g transform="translate(50, 20)">
            <line x1="0" y1="180" x2="300" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Knees bent */}
            <polyline points="200,175 230,115 170,115 145,175" fill="none" stroke="#64748b" stroke-width="12" stroke-linecap="round" />
            {/* Torso curved sideways */}
            <line x1="90" y1="150" x2="145" y2="175" stroke="#64748b" stroke-width="14" stroke-linecap="round" />
            <circle cx="75" cy="140" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Arm reaching for heel */}
            <polyline points="90,145 130,155 185,170" fill="none" stroke="#bdf200" stroke-width="7" stroke-linecap="round" />
            {/* Lateral Oblique Glow */}
            <path d="M 105,155 Q 130,165 145,170" stroke="url(#absGradient)" stroke-width="8" filter="url(#neonGlowGold)" stroke-linecap="round" />
            {/* Touch target ripple */}
            <circle cx="190" cy="172" r="10" fill="none" stroke="#bdf200" stroke-width="2" className="animate-ping" />
          </g>
        )}

        {/* 5. MOUNTAIN CLIMBERS */}
        {svgType === 'climber' && (
          <g transform="translate(30, 25)">
            <line x1="10" y1="175" x2="330" y2="175" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Arms extended in pushup position */}
            <line x1="85" y1="170" x2="85" y2="95" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
            <circle cx="65" cy="80" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Torso */}
            <line x1="85" y1="95" x2="200" y2="125" stroke="#64748b" stroke-width="13" stroke-linecap="round" />
            {/* Leg 1: Tucked dynamic knee */}
            <polyline points="200,125 150,145 130,110" fill="none" stroke="#bdf200" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
            {/* Leg 2: Extended back */}
            <polyline points="200,125 255,145 295,170" fill="none" stroke="#475569" stroke-width="10" stroke-linecap="round" />
            {/* Core & Hip flexor glow */}
            <circle cx="160" cy="130" r="12" fill="url(#absGradient)" filter="url(#neonGlowLime)" />
            {/* Dynamic motion arrows */}
            <path d="M 120,135 L 140,115" stroke="#eab308" stroke-width="3" stroke-linecap="round" marker-end="url(#arrow)" />
          </g>
        )}

        {/* 6. SIDE PLANK */}
        {svgType === 'side-plank' && (
          <g transform="translate(40, 30)">
            <line x1="10" y1="170" x2="310" y2="170" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Support forearm */}
            <line x1="70" y1="168" x2="100" y2="168" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" />
            <line x1="70" y1="168" x2="80" y2="110" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
            {/* Straight body angled upward */}
            <line x1="80" y1="110" x2="270" y2="165" stroke="#64748b" stroke-width="14" stroke-linecap="round" />
            {/* Top arm reaching up */}
            <line x1="85" y1="105" x2="85" y2="40" stroke="#94a3b8" stroke-width="7" stroke-linecap="round" />
            <circle cx="55" cy="95" r="14" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Under-Oblique Glow Anchor */}
            <path d="M 120,125 Q 160,135 190,145" stroke="url(#absGradient)" stroke-width="9" filter="url(#neonGlowGold)" stroke-linecap="round" />
            {/* Upward force vector */}
            <line x1="160" y1="150" x2="160" y2="115" stroke="#bdf200" stroke-width="3" stroke-linecap="round" />
          </g>
        )}

        {/* 7. SCISSORS */}
        {svgType === 'scissors' && (
          <g transform="translate(40, 20)">
            <line x1="10" y1="180" x2="310" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Flat torso */}
            <line x1="60" y1="175" x2="160" y2="175" stroke="#64748b" stroke-width="13" stroke-linecap="round" />
            <circle cx="45" cy="173" r="14" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Upper Scissor Leg */}
            <line x1="160" y1="175" x2="260" y2="110" stroke="#64748b" stroke-width="11" stroke-linecap="round" />
            {/* Lower Scissor Leg hovering */}
            <line x1="160" y1="175" x2="270" y2="160" stroke="#64748b" stroke-width="11" stroke-linecap="round" />
            {/* Lower Abs Glow */}
            <ellipse cx="150" cy="172" rx="20" ry="10" fill="url(#absGradient)" filter="url(#neonGlowLime)" />
            {/* Scissor switch indicators */}
            <path d="M 240,115 A 15 15 0 0 1 240,155" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="3 3" />
          </g>
        )}

        {/* 8. BICYCLE CRUNCH */}
        {svgType === 'bicycle' && (
          <g transform="translate(40, 20)">
            <line x1="10" y1="180" x2="310" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Torso diagonal rotation */}
            <line x1="90" y1="140" x2="160" y2="165" stroke="#64748b" stroke-width="13" stroke-linecap="round" />
            <circle cx="75" cy="128" r="14" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Elbow driving to opposite knee */}
            <polyline points="75,128 115,125 140,135" fill="none" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" />
            {/* Knee drawn in */}
            <polyline points="160,165 145,135 185,130" fill="none" stroke="#bdf200" stroke-width="11" stroke-linecap="round" />
            {/* Leg 2 extended out */}
            <line x1="160" y1="165" x2="265" y2="155" stroke="#475569" stroke-width="10" stroke-linecap="round" />
            {/* Oblique rotational twist glow */}
            <circle cx="130" cy="148" r="14" fill="url(#absGradient)" filter="url(#neonGlowGold)" opacity="0.9" />
          </g>
        )}

        {/* 9. V-UPS */}
        {svgType === 'v-ups' && (
          <g transform="translate(45, 15)">
            <line x1="10" y1="185" x2="300" y2="185" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Pivot Glute */}
            <circle cx="155" cy="175" r="15" fill="#334155" stroke="#64748b" stroke-width="4" />
            {/* Torso in V wing */}
            <line x1="155" y1="175" x2="80" y2="80" stroke="#64748b" stroke-width="13" stroke-linecap="round" />
            <circle cx="65" cy="65" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Arms reaching toes */}
            <line x1="80" y1="80" x2="160" y2="45" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" />
            {/* Legs in V wing */}
            <line x1="155" y1="175" x2="225" y2="60" stroke="#64748b" stroke-width="12" stroke-linecap="round" />
            {/* Total Core Ignition Center */}
            <circle cx="155" cy="160" r="18" fill="url(#absGradient)" filter="url(#neonGlowLime)" />
            {/* V Angle highlight */}
            <path d="M 115,125 Q 155,160 195,115" fill="none" stroke="#eab308" stroke-width="2" stroke-dasharray="3 3" />
          </g>
        )}

        {/* 10. RUSSIAN TWIST */}
        {svgType === 'russian-twist' && (
          <g transform="translate(50, 20)">
            <line x1="0" y1="180" x2="300" y2="180" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Hip pivot */}
            <circle cx="130" cy="170" r="14" fill="#334155" stroke="#64748b" stroke-width="4" />
            {/* Inclined back 45 deg */}
            <line x1="130" y1="170" x2="75" y2="110" stroke="#64748b" stroke-width="13" stroke-linecap="round" />
            <circle cx="60" cy="95" r="14" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Elevated knees and hovering feet */}
            <polyline points="130,170 185,125 235,145" fill="none" stroke="#64748b" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" />
            {/* Arms clasped rotating */}
            <polyline points="75,110 110,135 150,165" fill="none" stroke="#bdf200" stroke-width="8" stroke-linecap="round" />
            {/* Core Rotational Torus Glow */}
            <ellipse cx="115" cy="140" rx="18" ry="12" fill="url(#absGradient)" filter="url(#neonGlowGold)" />
            {/* Rotation trajectory indicator */}
            <path d="M 90,140 Q 120,170 145,140" fill="none" stroke="#bdf200" stroke-width="2" stroke-dasharray="2 3" />
          </g>
        )}

        {/* 11. SHOULDER TAPS */}
        {svgType === 'shoulder-taps' && (
          <g transform="translate(40, 25)">
            <line x1="10" y1="175" x2="310" y2="175" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Standing support arm */}
            <line x1="90" y1="170" x2="90" y2="95" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
            {/* Tapping hand reaching to opposite shoulder */}
            <polyline points="90,95 110,95 90,105" stroke="#bdf200" stroke-width="7" stroke-linecap="round" />
            <circle cx="70" cy="80" r="15" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            {/* Flat rigid plank trunk */}
            <line x1="90" y1="95" x2="260" y2="135" stroke="#64748b" stroke-width="14" stroke-linecap="round" />
            <line x1="260" y1="135" x2="265" y2="170" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
            {/* Anti-rotation lock glow */}
            <rect x="140" y="105" width="60" height="18" rx="6" fill="url(#absGradient)" filter="url(#neonGlowLime)" />
            {/* Balance level indicator */}
            <line x1="130" y1="98" x2="210" y2="98" stroke="#eab308" stroke-width="2" stroke-dasharray="3 3" />
          </g>
        )}

        {/* 12. HOLLOW BODY */}
        {svgType === 'hollow-body' && (
          <g transform="translate(40, 30)">
            <line x1="10" y1="175" x2="310" y2="175" stroke="#475569" stroke-width="6" stroke-linecap="round" />
            {/* Banana curved body touching ground only at lumbar */}
            <path d="M 50,110 Q 155,168 270,110" fill="none" stroke="#64748b" stroke-width="13" stroke-linecap="round" />
            {/* Head and extended arms */}
            <circle cx="50" cy="110" r="14" fill="#1e293b" stroke="#94a3b8" stroke-width="4" />
            <line x1="50" y1="110" x2="25" y2="95" stroke="#94a3b8" stroke-width="8" stroke-linecap="round" />
            {/* Ground pressure point anchor */}
            <circle cx="155" cy="165" r="14" fill="#334155" />
            {/* Maximum Isometric Core Compression Glow */}
            <ellipse cx="155" cy="150" rx="35" ry="12" fill="url(#absGradient)" filter="url(#neonGlowLime)" />
            {/* Downward compression force vectors */}
            <line x1="155" y1="125" x2="155" y2="148" stroke="#eab308" stroke-width="3" stroke-linecap="round" />
          </g>
        )}

        {/* Fallback generic */}
        {!['crunch', 'leg-raise', 'plank', 'heel-touches', 'climber', 'side-plank', 'scissors', 'bicycle', 'v-ups', 'russian-twist', 'shoulder-taps', 'hollow-body'].includes(svgType) && (
          <g transform="translate(100, 40)">
            <circle cx="100" cy="60" r="25" fill="#334155" stroke="url(#absGradient)" stroke-width="4" />
            <line x1="100" y1="85" x2="100" y2="150" stroke="#64748b" stroke-width="12" stroke-linecap="round" />
            <circle cx="100" cy="115" r="16" fill="url(#absGradient)" filter="url(#neonGlowLime)" />
          </g>
        )}
      </svg>

      {/* Exercise name bottom bar */}
      <div className="absolute bottom-2 inset-x-4 flex justify-between items-center text-xs text-slate-400 font-mono">
        <span className="truncate">{name}</span>
        <span className="text-lime-accent font-bold">BIO-METRIC OK</span>
      </div>
    </div>
  );
};
