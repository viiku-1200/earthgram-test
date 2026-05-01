import React from 'react';
import { SCOPE_MAP_DATA } from '../../data/constants';

const GLOW_COLORS = {
  indigo: 'rgba(99,102,241,0.6)', pink: 'rgba(236,72,153,0.6)', green: 'rgba(16,185,129,0.6)',
  amber: 'rgba(245,158,11,0.6)', blue: 'rgba(59,130,246,0.6)', violet: 'rgba(139,92,246,0.6)',
  cyan: 'rgba(6,182,212,0.6)', orange: 'rgba(249,115,22,0.6)', emerald: 'rgba(16,185,129,0.6)',
  yellow: 'rgba(234,179,8,0.6)', red: 'rgba(239,68,68,0.6)',
};
const SOLID_COLORS = {
  indigo: '#6366f1', pink: '#ec4899', green: '#10b981', amber: '#f59e0b', blue: '#3b82f6',
  violet: '#8b5cf6', cyan: '#06b6d4', orange: '#f97316', emerald: '#10b981', yellow: '#eab308', red: '#ef4444',
};
const SIZE_MAP = { lg: 14, md: 10, sm: 7 };

// ==================== LOCAL MAP ====================
const LocalMap = () => {
  const data = SCOPE_MAP_DATA.local;
  return (
    <div className="map-local relative w-full h-72 rounded-2xl overflow-hidden shadow-premium-lg">
      {/* Center pin (YOU) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500 rounded-full pin-ring opacity-40"></div>
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full border-[3px] border-white shadow-glow-indigo flex items-center justify-center text-white text-sm font-black z-10 relative">
            📍
          </div>
        </div>
        <span className="mt-1.5 text-[9px] font-black text-indigo-700 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm">YOU</span>
      </div>

      {/* Provider pins */}
      {data.pins.map((pin, i) => (
        <div key={pin.id} className="absolute z-10 animate-fade-in flex flex-col items-center group cursor-pointer"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, animationDelay: `${i * 0.1}s`, opacity: 0 }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full pin-ring" style={{ background: GLOW_COLORS[pin.color], animationDelay: `${i * 0.3}s` }}></div>
            <div className="w-10 h-10 bg-white rounded-full shadow-premium flex items-center justify-center text-lg relative z-10 border border-gray-100 group-hover:scale-110 transition-transform">
              {pin.emoji}
            </div>
          </div>
          <div className="glass mt-1 px-2 py-0.5 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            <p className="text-[8px] font-bold text-gray-800">{pin.label}</p>
            <p className="text-[7px] text-gray-500">{pin.dist}</p>
          </div>
        </div>
      ))}

      {/* Radius circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-dashed border-indigo-200 opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-dashed border-indigo-200 opacity-25"></div>

      {/* Stats bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="glass rounded-xl px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full online-dot"></span>
            <span className="text-[10px] font-bold text-gray-700">{data.stats.available} available now</span>
          </div>
          <span className="text-[9px] font-medium text-gray-500">Avg. {data.stats.avgResponse}</span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="absolute top-3 left-3 z-20 flex space-x-1.5">
        <span className="glass px-2.5 py-1 rounded-full text-[9px] font-bold text-gray-700 flex items-center space-x-1">
          <span>⚙️</span><span>Filter</span>
        </span>
        <span className="glass px-2.5 py-1 rounded-full text-[9px] font-bold text-gray-700 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span><span>Electric</span>
        </span>
        <span className="glass px-2.5 py-1 rounded-full text-[9px] font-bold text-gray-700 flex items-center space-x-1">
          <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span><span>Plumber</span>
        </span>
      </div>
    </div>
  );
};

// ==================== NATIONAL MAP ====================
const NationalMap = () => {
  const data = SCOPE_MAP_DATA.national;
  const cityMap = {};
  data.cities.forEach(c => { cityMap[c.id] = c; });

  return (
    <div className="map-national relative w-full h-72 rounded-2xl overflow-hidden shadow-premium-lg">
      {/* Connection lines SVG */}
      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        {data.connections.map((conn, i) => {
          const from = cityMap[conn.from]; const to = cityMap[conn.to];
          if (!from || !to) return null;
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="rgba(99,102,241,0.2)" strokeWidth="0.3" className="connection-line" />;
        })}
      </svg>

      {/* City dots */}
      {data.cities.map((city, i) => (
        <div key={city.id} className="absolute z-10 flex flex-col items-center animate-fade-in group cursor-pointer"
          style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.08}s`, opacity: 0 }}>
          <div className="relative">
            <div className="absolute inset-[-4px] rounded-full pin-ring" style={{ background: GLOW_COLORS[city.glow] }}></div>
            <div className="rounded-full relative z-10 border-2 border-white/30 flex items-center justify-center"
              style={{ width: SIZE_MAP[city.size], height: SIZE_MAP[city.size], background: SOLID_COLORS[city.glow] }}>
            </div>
          </div>
          <div className="mt-1 opacity-80 group-hover:opacity-100 transition-opacity text-center">
            <p className="text-[8px] font-bold text-white whitespace-nowrap">{city.name}</p>
            <p className="text-[7px] text-indigo-300">{city.providers.toLocaleString()}</p>
          </div>
        </div>
      ))}

      {/* India outline hint */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-56 border border-indigo-500/10 rounded-[40%_60%_55%_45%/60%_40%_60%_40%] rotate-3 z-0"></div>

      {/* Stats bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="glass-dark rounded-xl px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-white">{data.stats.cities} Cities</span>
            <span className="text-gray-500">•</span>
            <span className="text-[10px] font-bold text-indigo-300">{data.stats.providers} Providers</span>
          </div>
          <span className="text-[9px] font-medium text-green-400">{data.stats.growing}</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-3 left-3 z-20">
        <span className="glass-dark px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center space-x-1.5">
          <span>🇮🇳</span><span>India Network</span>
        </span>
      </div>
    </div>
  );
};

// ==================== GLOBAL MAP ====================
const GlobalMap = () => {
  const data = SCOPE_MAP_DATA.global;
  const regionMap = {};
  data.regions.forEach(r => { regionMap[r.id] = r; });

  return (
    <div className="map-global relative w-full h-72 rounded-2xl overflow-hidden shadow-premium-lg">
      {/* Connection arcs SVG */}
      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
        {data.connections.map((conn, i) => {
          const from = regionMap[conn.from]; const to = regionMap[conn.to];
          if (!from || !to) return null;
          const mx = (from.x + to.x) / 2; const my = Math.min(from.y, to.y) - 8;
          return <path key={i} d={`M${from.x},${from.y} Q${mx},${my} ${to.x},${to.y}`}
            fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="0.3" className="connection-line" />;
        })}
      </svg>

      {/* Region dots */}
      {data.regions.map((region, i) => (
        <div key={region.id} className="absolute z-10 flex flex-col items-center animate-fade-in group cursor-pointer"
          style={{ left: `${region.x}%`, top: `${region.y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.1}s`, opacity: 0 }}>
          <div className="relative">
            {region.pulse && <div className="absolute inset-[-6px] rounded-full pin-ring" style={{ background: GLOW_COLORS[region.glow] }}></div>}
            <div className="absolute inset-[-3px] rounded-full opacity-40" style={{ background: GLOW_COLORS[region.glow], filter: 'blur(4px)' }}></div>
            <div className="rounded-full relative z-10 border-2 border-white/20"
              style={{ width: SIZE_MAP[region.size], height: SIZE_MAP[region.size], background: SOLID_COLORS[region.glow] }}>
            </div>
          </div>
          <div className="mt-1 opacity-70 group-hover:opacity-100 transition-opacity text-center">
            <p className="text-[8px] font-bold text-white whitespace-nowrap">{region.name}</p>
            <p className="text-[7px] text-purple-300">{region.providers}</p>
          </div>
        </div>
      ))}

      {/* Stats bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20">
        <div className="glass-dark rounded-xl px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-white">{data.stats.countries} Countries</span>
            <span className="text-gray-600">•</span>
            <span className="text-[10px] font-bold text-purple-300">{data.stats.providers} Providers</span>
          </div>
          <span className="text-[9px] font-medium text-cyan-400">🌍 Expanding</span>
        </div>
      </div>

      {/* Title */}
      <div className="absolute top-3 left-3 z-20">
        <span className="glass-dark px-3 py-1.5 rounded-full text-[10px] font-bold text-white flex items-center space-x-1.5">
          <span>🌍</span><span>Global Network</span>
        </span>
      </div>
    </div>
  );
};

// ==================== MAIN EXPORT ====================
const ScopeMap = ({ scope }) => {
  if (scope === 'national') return <NationalMap />;
  if (scope === 'global') return <GlobalMap />;
  return <LocalMap />;
};

export default ScopeMap;
