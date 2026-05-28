import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { SCOPE_MAP_DATA, PROVIDERS, COUNTRIES } from '../../data/constants';

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
    if (center) {
      const current = map.getCenter();
      // Only fly if the map is significantly far from the target center (e.g. country change)
      const dist = Math.sqrt(Math.pow(current.lat - center[0], 2) + Math.pow(current.lng - center[1], 2));
      if (dist > 0.01) {
        map.flyTo(center, 14, { animate: true, duration: 1.5 });
      }
    }
  }, [center, map]);
  return null;
};

// Custom DivIcon for User Location (Pulsing Blue Dot - No labels)
export const createUserIcon = () => {
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <!-- Outer pulsing halo -->
        <div class="absolute w-8 h-8 bg-blue-500/35 rounded-full animate-ping opacity-75"></div>
        <!-- Inner pulsing halo -->
        <div class="absolute w-5 h-5 bg-blue-500/45 rounded-full animate-pulse opacity-50"></div>
        <!-- Center solid core with premium white border -->
        <div class="w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white shadow-[0_2px_6px_rgba(37,99,235,0.6)] relative z-10"></div>
      </div>
    `,
    className: 'custom-user-icon-container',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });
};

// Custom DivIcon for labeled markers with dual-ring pulsing radar effect
const createLabeledIcon = (emoji, label, color = 'indigo') => {
  const activeColorMap = {
    indigo: 'from-indigo-500 to-indigo-600',
    emerald: 'from-emerald-500 to-emerald-600',
    amber: 'from-amber-500 to-amber-600'
  };
  const activeGrad = activeColorMap[color] || 'from-indigo-500 to-indigo-600';
  return L.divIcon({
    html: `
      <div class="flex flex-col items-center group animate-fade-in">
        <div class="relative flex items-center justify-center">
          <!-- Outer pulse circle -->
          <div class="absolute w-12 h-12 bg-${color}-500/25 rounded-full animate-ping opacity-75"></div>
          <!-- Inner pulse circle -->
          <div class="absolute w-8 h-8 bg-${color}-500/35 rounded-full animate-[ping_1.5s_infinite_750ms] opacity-50"></div>
          <!-- Premium Gradient Border Wrapping Emoji -->
          <div class="w-10 h-10 bg-gradient-to-tr ${activeGrad} rounded-2xl shadow-[0_8px_16px_rgba(99,102,241,0.2)] p-[2px] flex items-center justify-center relative z-10 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-0.5">
            <div class="w-full h-full bg-white dark:bg-slate-900 rounded-[0.9rem] flex items-center justify-center text-xl">
              ${emoji}
            </div>
          </div>
        </div>
        <div class="mt-1.5 bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-full shadow-lg border border-white/10 whitespace-nowrap">
          <p class="text-[8px] font-black text-white uppercase tracking-wider font-mono">${label}</p>
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
const LocalMap = ({ isDarkMode, countryCenter, selectedCountry, customProviders = [] }) => {
  const navigate = useNavigate();
  // Live driver position relative to current center
  const [driverPos, setDriverPos] = useState([countryCenter[0] + 0.0018, countryCenter[1] + 0.0012]);
  const [userPos, setUserPos] = useState(() => {
    const saved = localStorage.getItem('earthgram_user_gps');
    return saved ? [JSON.parse(saved).lat, JSON.parse(saved).lng] : null;
  });
  const activeCenter = (selectedCountry === 'in' && userPos) ? userPos : countryCenter;
  const [mapCenter, setMapCenter] = useState(activeCenter);
  const [isLocating, setIsLocating] = useState(false);

  // Listen for background auto-location updates
  useEffect(() => {
    const updateLocation = () => {
      const saved = localStorage.getItem('earthgram_user_gps');
      if (saved) {
        const parsed = [JSON.parse(saved).lat, JSON.parse(saved).lng];
        setUserPos(parsed);
        setMapCenter(parsed);
      }
    };
    window.addEventListener('earthgram_location_updated', updateLocation);
    return () => window.removeEventListener('earthgram_location_updated', updateLocation);
  }, []);

  // Update center when country changes or GPS updates
  useEffect(() => {
    const newCenter = (selectedCountry === 'in' && userPos) ? userPos : countryCenter;
    setMapCenter(newCenter);
    setDriverPos([newCenter[0] + 0.0018, newCenter[1] + 0.0012]);
  }, [countryCenter, userPos, selectedCountry]);
  
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
    const center = (selectedCountry === 'in' && userPos) ? userPos : countryCenter;
    const baseMarkers = PROVIDERS.slice(0, 10).map((p, i) => ({
      ...p,
      pos: [
        center[0] + (Math.sin(i * 2.1) * 0.007),
        center[1] + (Math.cos(i * 2.1) * 0.007)
      ]
    }));
    
    // Add real custom providers that have location data
    const customMarkers = customProviders.filter(p => p.location).map(p => ({
      ...p,
      pos: p.location
    }));
    
    return [...customMarkers, ...baseMarkers];
  }, [userPos, countryCenter, selectedCountry, customProviders]);

  return (
    <div className="map-local relative w-full h-[340px] rounded-[3.5rem] overflow-hidden shadow-premium-2xl border-4 border-white dark:border-slate-800 animate-fade-in group">
      <MapContainer center={mapCenter} zoom={14} className="h-full w-full z-0" scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={isDarkMode ? "dark-map-tiles" : ""}
          attribution='&copy; OpenStreetMap'
        />
        <MapAutoCenter center={mapCenter} />
        
        {/* Default / User Location */}
        <Marker 
          position={(selectedCountry === 'in' && userPos) ? userPos : countryCenter}
          icon={createUserIcon()}
        >
          <Popup>
             <div className="text-center p-1">
                <p className="font-bold text-xs">{(selectedCountry === 'in' && userPos) ? 'Your Live Location' : 'Capital Center'}</p>
                <p className="text-[10px] text-slate-500 mt-1">{(selectedCountry === 'in' && userPos) ? 'Saved to Profile' : 'Default Location'}</p>
             </div>
          </Popup>
        </Marker>

        {/* Live Moving Service (Ravi) */}
        <Marker 
          position={driverPos} 
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
        <Marker position={[countryCenter[0] - 0.0042, countryCenter[1] - 0.0038]}>
          <Popup>
            <div className="p-2">
              <p className="font-black text-xs mb-1">🏢 Central Mandi</p>
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
          className={`px-4 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-xl border ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700 text-indigo-400' 
              : 'bg-white border-gray-100 text-indigo-600'
          }`}>
          <span className={isLocating ? 'animate-spin' : ''}>📡</span>
          <span>{isLocating ? 'Locating...' : 'GPS Radar'}</span>
        </button>
      </div>

      {/* Stats overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-10">
        <div className={`p-4 rounded-[2rem] shadow-2xl backdrop-blur-xl border ${isDarkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-gray-100'} flex justify-between items-center`}>
          <div>
            <h3 className={`text-sm font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Local Radar</h3>
            <p className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>
              Found 10 providers in scope
            </p>
          </div>
          <button 
            onClick={() => navigate('/explore')}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-md ${
              isDarkMode ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
            }`}>
            Full View
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== NATIONAL MAP ====================
const getCountryNationalData = (countryId, countryName) => {
  const countryCities = {
    in: [
      { id: 'c1', name: 'Delhi NCR', providers: 2400, x: 48, y: 22, size: 'lg', glow: 'indigo' },
      { id: 'c2', name: 'Mumbai', providers: 3100, x: 30, y: 58, size: 'lg', glow: 'pink' },
      { id: 'c3', name: 'Bangalore', providers: 1800, x: 40, y: 78, size: 'md', glow: 'green' },
      { id: 'c4', name: 'Chennai', providers: 950, x: 52, y: 82, size: 'md', glow: 'amber' },
      { id: 'c5', name: 'Kolkata', providers: 720, x: 68, y: 38, size: 'sm', glow: 'blue' },
      { id: 'c6', name: 'Hyderabad', providers: 1100, x: 42, y: 65, size: 'md', glow: 'violet' },
    ],
    np: [
      { id: 'c1', name: 'Kathmandu', providers: 850, x: 52, y: 45, size: 'lg', glow: 'indigo' },
      { id: 'c2', name: 'Pokhara', providers: 620, x: 38, y: 40, size: 'md', glow: 'green' },
      { id: 'c3', name: 'Lalitpur', providers: 320, x: 54, y: 48, size: 'sm', glow: 'pink' },
      { id: 'c4', name: 'Biratnagar', providers: 240, x: 80, y: 55, size: 'sm', glow: 'amber' },
      { id: 'c5', name: 'Bharatpur', providers: 180, x: 46, y: 48, size: 'sm', glow: 'blue' },
      { id: 'c6', name: 'Janakpur', providers: 150, x: 65, y: 52, size: 'sm', glow: 'violet' },
    ],
    bd: [
      { id: 'c1', name: 'Dhaka', providers: 1200, x: 50, y: 45, size: 'lg', glow: 'indigo' },
      { id: 'c2', name: 'Chittagong', providers: 750, x: 70, y: 75, size: 'md', glow: 'green' },
      { id: 'c3', name: 'Khulna', providers: 480, x: 35, y: 68, size: 'sm', glow: 'pink' },
      { id: 'c4', name: 'Sylhet', providers: 350, x: 75, y: 25, size: 'sm', glow: 'amber' },
      { id: 'c5', name: 'Rajshahi', providers: 280, x: 25, y: 35, size: 'sm', glow: 'blue' },
      { id: 'c6', name: 'Barisal', providers: 190, x: 48, y: 68, size: 'sm', glow: 'violet' },
    ],
    pk: [
      { id: 'c1', name: 'Islamabad', providers: 980, x: 45, y: 25, size: 'lg', glow: 'indigo' },
      { id: 'c2', name: 'Karachi', providers: 1600, x: 20, y: 80, size: 'lg', glow: 'green' },
      { id: 'c3', name: 'Lahore', providers: 1200, x: 55, y: 42, size: 'md', glow: 'pink' },
      { id: 'c4', name: 'Faisalabad', providers: 520, x: 48, y: 44, size: 'sm', glow: 'amber' },
      { id: 'c5', name: 'Rawalpindi', providers: 450, x: 43, y: 28, size: 'sm', glow: 'blue' },
      { id: 'c6', name: 'Multan', providers: 320, x: 38, y: 52, size: 'sm', glow: 'violet' },
    ],
    us: [
      { id: 'c1', name: 'Washington D.C.', providers: 1500, x: 80, y: 42, size: 'lg', glow: 'indigo' },
      { id: 'c2', name: 'New York', providers: 3200, x: 85, y: 35, size: 'lg', glow: 'pink' },
      { id: 'c3', name: 'Los Angeles', providers: 2800, x: 15, y: 65, size: 'lg', glow: 'green' },
      { id: 'c4', name: 'Chicago', providers: 1800, x: 62, y: 38, size: 'md', glow: 'amber' },
      { id: 'c5', name: 'Houston', providers: 1400, x: 52, y: 82, size: 'md', glow: 'blue' },
      { id: 'c6', name: 'San Francisco', providers: 950, x: 10, y: 48, size: 'sm', glow: 'violet' },
    ],
    uk: [
      { id: 'c1', name: 'London', providers: 2900, x: 65, y: 75, size: 'lg', glow: 'indigo' },
      { id: 'c2', name: 'Birmingham', providers: 1100, x: 50, y: 62, size: 'md', glow: 'green' },
      { id: 'c3', name: 'Manchester', providers: 950, x: 48, y: 50, size: 'md', glow: 'pink' },
      { id: 'c4', name: 'Glasgow', providers: 620, x: 38, y: 25, size: 'sm', glow: 'amber' },
      { id: 'c5', name: 'Edinburgh', providers: 480, x: 45, y: 22, size: 'sm', glow: 'blue' },
      { id: 'c6', name: 'Belfast', providers: 350, x: 20, y: 40, size: 'sm', glow: 'violet' },
    ],
  };

  const name = countryName || 'Local';
  const cities = countryCities[countryId] || [
    { id: 'c1', name: `${name} Hub A`, providers: 850, x: 50, y: 50, size: 'lg', glow: 'indigo' },
    { id: 'c2', name: `${name} Hub B`, providers: 620, x: 50, y: 20, size: 'md', glow: 'green' },
    { id: 'c3', name: `${name} Hub C`, providers: 480, x: 50, y: 80, size: 'md', glow: 'pink' },
    { id: 'c4', name: `${name} Hub D`, providers: 350, x: 80, y: 50, size: 'sm', glow: 'amber' },
    { id: 'c5', name: `${name} Hub E`, providers: 290, x: 20, y: 50, size: 'sm', glow: 'blue' },
  ];

  const connections = [];
  for (let i = 1; i < cities.length; i++) {
    connections.push({ from: cities[0].id, to: cities[i].id });
  }
  if (cities.length >= 4) {
    connections.push({ from: cities[1].id, to: cities[2].id });
    connections.push({ from: cities[2].id, to: cities[3].id });
    if (cities[4]) connections.push({ from: cities[3].id, to: cities[4].id });
  }

  const totalProviders = cities.reduce((sum, c) => sum + c.providers, 0);

  return {
    cities,
    connections,
    stats: {
      cities: cities.length,
      providers: totalProviders,
      growing: '📈 Expanding Rapidly',
    }
  };
};

const NationalMap = ({ selectedCountry = 'in' }) => {
  const country = COUNTRIES.find(c => c.id === selectedCountry);
  const data = getCountryNationalData(selectedCountry, country?.name);
  
  const cityMap = {};
  data.cities.forEach(c => { cityMap[c.id] = c; });

  return (
    <div className="map-national relative w-full h-[340px] rounded-[3.5rem] overflow-hidden shadow-premium-2xl border-4 border-white dark:border-slate-800 animate-fade-in group">
      {/* Dynamic connection lines SVG */}
      <svg className="absolute inset-0 w-full h-full z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
        {data.connections.map((conn, i) => {
          const from = cityMap[conn.from]; const to = cityMap[conn.to];
          if (!from || !to) return null;
          return <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
            stroke="rgba(99,102,241,0.25)" strokeWidth="0.4" className="connection-line" />;
        })}
      </svg>

      {/* Dynamic City Node Dots */}
      {data.cities.map((city, i) => (
        <div key={city.id} className="absolute z-20 flex flex-col items-center animate-fade-in group cursor-pointer"
          style={{ left: `${city.x}%`, top: `${city.y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.08}s`, opacity: 0 }}>
          <div className="relative">
            <div className="absolute inset-[-4px] rounded-full pin-ring" style={{ background: GLOW_COLORS[city.glow] }}></div>
            <div className="rounded-full relative z-10 border-2 border-white/30 flex items-center justify-center shadow-md"
              style={{ width: SIZE_MAP[city.size], height: SIZE_MAP[city.size], background: SOLID_COLORS[city.glow] }}>
            </div>
          </div>
          <div className="mt-1 opacity-90 group-hover:opacity-100 transition-opacity text-center bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/10 shadow-lg">
            <p className="text-[8px] font-black text-white whitespace-nowrap uppercase tracking-wider">{city.name}</p>
            <p className="text-[7px] font-bold text-indigo-300 tracking-wider font-mono">{city.providers.toLocaleString()} Hubs</p>
          </div>
        </div>
      ))}

      {/* Abstract Glowing Orbit Network Core Background (Universal Shape) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-indigo-500/10 rounded-full z-0 animate-spin-slow"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-dashed border-purple-500/10 rounded-[40%_60%_55%_45%/60%_40%_60%_40%] z-0 rotate-45 animate-float-slow"></div>

      {/* Dynamic Stats overlay */}
      <div className="absolute bottom-6 left-6 right-6 z-30">
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-[2.2rem] px-5 py-3.5 flex justify-between items-center shadow-2xl border border-white/50 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-black text-slate-800 dark:text-white uppercase tracking-wider">{data.stats.cities} Active Regions</span>
            <span className="text-gray-400 font-bold">•</span>
            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 tracking-wider font-mono">{data.stats.providers.toLocaleString()} Providers</span>
          </div>
          <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 px-2 py-1 rounded-full">{data.stats.growing}</span>
        </div>
      </div>

      {/* Dynamic Header Badge */}
      <div className="absolute top-6 left-6 z-30">
        <span className="bg-slate-950/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black text-white flex items-center space-x-2 shadow-lg">
          <span>{country?.flag || '🇮🇳'}</span>
          <span className="uppercase tracking-widest text-[9px]">{country?.name || 'India'} Virtual Network</span>
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
const ScopeMap = ({ scope, isDarkMode, selectedCountry = 'in', customProviders = [] }) => {
  const country = COUNTRIES.find(c => c.id === selectedCountry);
  const countryCenter = country?.gps || DEFAULT_CENTER;

  if (scope === 'national') return <NationalMap selectedCountry={selectedCountry} />;
  if (scope === 'global') return <GlobalMap />;
  return <LocalMap isDarkMode={isDarkMode} countryCenter={countryCenter} selectedCountry={selectedCountry} customProviders={customProviders} />;
};

export default ScopeMap;
