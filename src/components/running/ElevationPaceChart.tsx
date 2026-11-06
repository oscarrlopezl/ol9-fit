import React from 'react';
import { GeoPoint, Split } from '../../types';

interface ElevationPaceChartProps {
  route: GeoPoint[];
  splits: Split[];
}

export const ElevationPaceChart: React.FC<ElevationPaceChartProps> = ({ route, splits }) => {
  if (route.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center bg-industrial-950 border border-industrial-800 rounded-2xl text-xs font-mono text-slate-500">
        Datos de ruta insuficientes para gráfica
      </div>
    );
  }

  // Sample points for elevation curve
  const elevations = route.map((p) => p.altitude ?? 800);
  const minEle = Math.min(...elevations);
  const maxEle = Math.max(...elevations);
  const eleSpan = Math.max(10, maxEle - minEle);

  const width = 360;
  const height = 110;
  const padding = 15;

  const pointsSvg = route
    .map((p, idx) => {
      const x = padding + (idx / (route.length - 1)) * (width - 2 * padding);
      const ele = p.altitude ?? minEle;
      const y = height - padding - ((ele - minEle) / eleSpan) * (height - 2 * padding);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const areaSvg = `${padding},${height - padding} ${pointsSvg} ${width - padding},${height - padding}`;

  return (
    <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-mono uppercase text-slate-400">Perfil de Altimetría y Ritmo</span>
        <span className="text-xs font-mono text-lime-accent">
          Desnivel: +{Math.round(eleSpan)}m
        </span>
      </div>

      <div className="relative w-full h-28">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="eleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#bdf200" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#bdf200" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />

          {/* Filled elevation area */}
          <polygon points={areaSvg} fill="url(#eleGrad)" />

          {/* Elevation line */}
          <polyline
            points={pointsSvg}
            fill="none"
            stroke="#bdf200"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
        <span>0 km</span>
        <span>Mín: {Math.round(minEle)}m</span>
        <span>Máx: {Math.round(maxEle)}m</span>
        <span>Final</span>
      </div>
    </div>
  );
};
