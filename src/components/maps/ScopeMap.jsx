import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { SCOPE_MAP_DATA, PROVIDERS } from '../../data/constants';

// Fix Leaflet marker icon issue in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to handle map flying
const MapAutoCenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 15, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
};

// Custom DivIcon for labeled markers
const createLabeledIcon = (emoji, label, color = 'indigo') => {
  return L.divIcon({
    html: `
      <div class="flex flex-col items-center group animate-fade-in">
        <div class="relative">
          <div class="absolute inset-0 bg-${color}-500 rounded-full animate-ping opacity-20 scale-150"></div>
          <div class="w-10 h-10 bg-white rounded-2xl shadow-premium border-2 border-white flex items-center justify-center text-xl relative z-10 transition-transform group-hover:scale-110">
            ${emoji}
          </div>
        </div>
        <div class="mt-1 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-lg shadow-xl border border-white/20 whitespace-nowrap">
          <p class="text-[8px] font-black text-white uppercase tracking-tighter">${label}</p>
        </div>
      </div>
    `,
    className: 'custom-div-icon',
    iconSize: [40, 56],
    iconAnchor: [20, 40]
  });
};

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

const DEFAULT_CENTER = [28.6692, 77.4538]; // Sector 4, Ghaziabad

// ==================== LOCAL MAP (REAL-TIME) ====================
const LocalMap = ({ isDarkMode }) => {
  const navigate = useNavigate();
  const [driverPos, setDriverPos] = useState([28.6710, 77.4550]);
  const [userPos, setUserPos] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [isLocating, setIsLocating] = useState(false);
  
  // Real-Time Movement Simulation for Ravi (Tractor)
  useEffect(() => {
    const interval = setInterval(() => {
      setDriverPos(prev => [
        prev[0] + (Math.random() - 0.5) * 0.0004,
        prev[1] + (Math.random() - 0.5) * 0.0004
      ]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // GPS Location Request + Reverse Geocoding
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newPos = [latitude, longitude];
        setUserPos(newPos);
        setMapCenter(newPos);
        
        // 1. Save Raw GPS to LocalStorage
        localStorage.setItem('earthgram_user_gps', JSON.stringify({
          lat: latitude,
          lng: longitude,
          timestamp: new Date().toISOString()
        }));

        // 2. Reverse Geocoding (Convert Lat/Lng to Address)
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const shortAddress = `${addr.suburb || addr.neighbourhood || addr.road || ''}, ${addr.city || addr.town || addr.state || ''}`.trim().replace(/^, |, $/, '');
            localStorage.setItem('earthgram_user_address', shortAddress || data.display_name);
          }
        } catch (err) {
          console.error("Geocoding failed:", err);
          localStorage.setItem('earthgram_user_address', "Location found (Address pending)");
        }

        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setIsLocating(false);
        alert("Unable to retrieve your location. Using default center.");
      },
      { enableHighAccuracy: true }
    );
  };

  // Map providers to simulated coordinates around the current center
  const serviceMarkers = useMemo(() => {
    const center = userPos || DEFAULT_CENTER;
    return PROVIDERS.slice(0, 10).map((p, i) => ({
      ...p,
      pos: [
        center[0] + (Math.sin(i * 2.1) * 0.007),
        center[1] + (Math.cos(i * 2.1) * 0.007)
      ]
    }));
  }, [userPos]);

  return (
    <div className="map-local relative w-full h-[520px] rounded-[3.5rem] overflow-hidden shadow-premium-2xl border-4 border-white animate-fade-in group">
      <MapContainer center={mapCenter} zoom={15} className="h-full w-full z-0" scrollWheelZoom={false}>
        <TileLayer
          url={isDarkMode 
            ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          attribution='&copy; OpenStreetMap'
        />
        <MapAutoCenter center={mapCenter} />
        
        {/* User Location */}
        <Marker position={userPos || DEFAULT_CENTER} icon={createLabeledIcon('📍', 'YOU', 'indigo')}>
          <Popup>
             <div className="text-center p-1">
                <p className="font-black text-xs">Your Live Location</p>
                <p className="text-[8px] text-slate-500 uppercase font-bold mt-1">Saved to Profile</p>
             </div>
          </Popup>
        </Marker>

        {/* Live Moving Service (Ravi) */}
        <Marker 
          position={driverPos} 
          icon={createLabeledIcon('🚜', 'RAVI', 'emerald')}
          eventHandlers={{ click: () => navigate('/book') }}
        >
          <Popup>
            <div className="p-2 min-w-[140px]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white text-xl shadow-glow-indigo">🚜</div>
                <div>
                  <p className="font-black text-xs">Ravi (Tractor)</p>
                  <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest animate-pulse">Live • Moving</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/book')}
                className="w-full bg-slate-900 text-white text-[9px] font-black py-2 rounded-xl uppercase tracking-widest">
                Book Now
              </button>
            </div>
          </Popup>
        </Marker>

        {/* All Other Neighborhood Services */}
        {serviceMarkers.map((p) => (
          <Marker 
            key={p.id} 
            position={p.pos} 
            icon={createLabeledIcon(p.avatar, p.name.split(' ')[0], 'indigo')}
            eventHandlers={{ click: () => navigate('/provider', { state: { profile: p } }) }}
          >
            <Popup>
              <div className="p-2 min-w-[150px]">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl border border-slate-200">
                    {p.avatar}
                  </div>
                  <div>
                    <p className="font-black text-xs leading-tight">{p.name}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">{p.category}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mb-3 bg-slate-50 p-2 rounded-lg">
                   <div className="flex items-center space-x-1">
                      <span className="text-amber-500 text-[10px]">★</span>
                      <span className="text-[10px] font-black">{p.rating}</span>
                   </div>
                   <span className="text-[9px] font-bold text-slate-500">📍 {p.distance}</span>
                </div>
                <button 
                  onClick={() => navigate('/provider', { state: { profile: p } })}
                  className="w-full bg-indigo-600 text-white text-[9px] font-black py-2 rounded-xl uppercase tracking-widest active:scale-95 transition-transform">
                  View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Mandi Service Point */}
        <Marker position={[28.6650, 77.4500]} icon={createLabeledIcon('🏢', 'MANDI', 'amber')}>
          <Popup>
            <div className="p-2">
              <p className="font-black text-xs mb-1">🏢 Sector 4 Mandi</p>
              <p className="text-[9px] text-slate-500 mb-2">Wheat: ₹2,100 | Rice: ₹3,450</p>
              <button className="w-full bg-emerald-600 text-white text-[9px] font-black py-1.5 rounded-xl uppercase">Check Live Rates</button>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating GPS Button */}
      <div className="absolute top-6 right-6 z-10">
        <button 
          onClick={handleLocateMe}
          disabled={isLocating}
          className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-2xl transition-all active:scale-95 ${
            isLocating ? 'bg-slate-400 text-white cursor-not-allowed' : 'bg-white text-indigo-600 border-2 border-indigo-500'
          }`}>
          <span className={isLocating ? 'animate-spin' : ''}>📡</span>
          <span>{isLocating ? 'Locating...' : 'Real GPS Radar'}</span>
        </button>
      </div>

      {/* Floating Radar Tag */}
      <div className="absolute top-6 left-6 z-10">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white/20 shadow-xl">
           <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
           <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Radar</span>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className="glass rounded-[2rem] px-5 py-4 flex justify-between items-center shadow-2xl border border-white/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-glow-indigo">🛰️</div>
            <div>
              <p className="text-[11px] font-black text-gray-900 uppercase leading-none">Scanning Neighborhood</p>
              <p className="text-[9px] font-bold text-gray-500 mt-1">Found 4 providers within 2km</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/explore')}
            className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg">
            Full View
          </button>
        </div>
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
