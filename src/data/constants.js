// --- PROTOTYPE DATA ---

export const SCOPES = [
  { id: 'local', label: 'Local', icon: '📍', desc: 'Your Neighborhood', radius: '5 km' },
  { id: 'national', label: 'National', icon: '🇮🇳', desc: 'Across India', radius: 'Nationwide' },
  { id: 'global', label: 'Global', icon: '🌍', desc: 'Worldwide', radius: 'Planet Earth' },
];

// --- SCOPE MAP DATA ---
export const SCOPE_MAP_DATA = {
  local: {
    centerLabel: 'YOU',
    pins: [
      { id: 'lp1', emoji: '⚡', label: 'Ravi Electric', dist: '0.5 km', x: 22, y: 25, color: 'yellow' },
      { id: 'lp2', emoji: '🔧', label: 'Amit Plumber', dist: '0.8 km', x: 72, y: 65, color: 'blue' },
      { id: 'lp3', emoji: '✨', label: 'ShineX Clean', dist: '1.2 km', x: 80, y: 20, color: 'green' },
      { id: 'lp4', emoji: '❄️', label: 'Kumar AC', dist: '1.5 km', x: 15, y: 75, color: 'cyan' },
      { id: 'lp5', emoji: '💄', label: 'Sunita Makeup', dist: '0.7 km', x: 60, y: 38, color: 'pink' },
    ],
    stats: { providers: 48, available: 12, avgResponse: '18 min' },
  },
  national: {
    cities: [
      { id: 'nc1', name: 'Delhi NCR', providers: 2400, x: 48, y: 22, size: 'lg', glow: 'indigo' },
      { id: 'nc2', name: 'Mumbai', providers: 3100, x: 30, y: 58, size: 'lg', glow: 'pink' },
      { id: 'nc3', name: 'Bangalore', providers: 1800, x: 40, y: 78, size: 'md', glow: 'green' },
      { id: 'nc4', name: 'Chennai', providers: 950, x: 52, y: 82, size: 'md', glow: 'amber' },
      { id: 'nc5', name: 'Kolkata', providers: 720, x: 68, y: 38, size: 'sm', glow: 'blue' },
      { id: 'nc6', name: 'Hyderabad', providers: 1100, x: 42, y: 65, size: 'md', glow: 'violet' },
      { id: 'nc7', name: 'Pune', providers: 680, x: 32, y: 62, size: 'sm', glow: 'cyan' },
      { id: 'nc8', name: 'Jaipur', providers: 420, x: 38, y: 30, size: 'sm', glow: 'orange' },
      { id: 'nc9', name: 'Lucknow', providers: 350, x: 52, y: 28, size: 'sm', glow: 'emerald' },
    ],
    connections: [
      { from: 'nc1', to: 'nc2' }, { from: 'nc1', to: 'nc3' }, { from: 'nc2', to: 'nc3' },
      { from: 'nc2', to: 'nc6' }, { from: 'nc3', to: 'nc4' }, { from: 'nc1', to: 'nc5' },
    ],
    stats: { cities: 28, providers: '12.4k', growing: '+340 this week' },
  },
  global: {
    regions: [
      { id: 'gr1', name: 'India', providers: '12.4k', x: 62, y: 48, size: 'lg', glow: 'indigo', pulse: true },
      { id: 'gr2', name: 'UAE', providers: '1.2k', x: 52, y: 42, size: 'md', glow: 'amber' },
      { id: 'gr3', name: 'USA', providers: '680', x: 18, y: 32, size: 'md', glow: 'blue' },
      { id: 'gr4', name: 'UK', providers: '430', x: 40, y: 22, size: 'sm', glow: 'green' },
      { id: 'gr5', name: 'Singapore', providers: '310', x: 72, y: 58, size: 'sm', glow: 'pink' },
      { id: 'gr6', name: 'Australia', providers: '180', x: 78, y: 78, size: 'sm', glow: 'cyan' },
      { id: 'gr7', name: 'Canada', providers: '220', x: 20, y: 18, size: 'sm', glow: 'violet' },
    ],
    connections: [
      { from: 'gr1', to: 'gr2' }, { from: 'gr1', to: 'gr5' }, { from: 'gr1', to: 'gr3' },
      { from: 'gr3', to: 'gr4' }, { from: 'gr3', to: 'gr7' }, { from: 'gr1', to: 'gr6' },
    ],
    stats: { countries: 12, providers: '15.2k', newCountry: 'Germany (Coming Soon)' },
  },
};

// National-scope featured providers
export const NATIONAL_PROVIDERS = [
  { id: 'np1', name: 'UrbanClap Pro', city: 'Delhi NCR', distance: 'Delhi', rating: '4.8', reviews: '5.2k', price: '₹299 start', tag: '🏆 Top National', category: 'Multi-Service', avatar: '🏢', available: true },
  { id: 'np2', name: 'Bombay Sparkle', city: 'Mumbai', distance: 'Mumbai', rating: '4.9', reviews: '3.1k', price: '₹499 start', tag: '✨ Premium', category: 'Deep Cleaning', avatar: '✨', available: true },
  { id: 'np3', name: 'TechFix India', city: 'Bangalore', distance: 'Bangalore', rating: '4.7', reviews: '1.8k', price: '₹350 visit', tag: '💻 Tech Expert', category: 'Electronics', avatar: '💻', available: true },
  { id: 'np4', name: 'Chennai Cooks', city: 'Chennai', distance: 'Chennai', rating: '4.8', reviews: '2.4k', price: '₹3,000/mo', tag: '🍛 Authentic', category: 'Home Chef', avatar: '🍛', available: true },
  { id: 'np5', name: 'CodeCrafters Hub', city: 'Bangalore', distance: 'Bangalore', rating: '4.9', reviews: '320', price: '₹2000/hr', tag: '🚀 Top Devs', category: 'Software', avatar: '💻', available: true },
  { id: 'np6', name: 'National Tax Assocs', city: 'Mumbai', distance: 'Mumbai', rating: '4.8', reviews: '410', price: '₹5000/session', tag: '📊 CA Expert', category: 'Consultancy', avatar: '📊', available: true },
];

// Global-scope featured providers
export const GLOBAL_PROVIDERS = [
  { id: 'gp1', name: 'EarthServe UAE', city: 'Dubai', distance: 'UAE', rating: '4.9', reviews: '1.2k', price: '$45 start', tag: '🌟 International', category: 'Home Services', avatar: '🏙️', available: true },
  { id: 'gp2', name: 'CleanStar USA', city: 'New York', distance: 'USA', rating: '4.7', reviews: '680', price: '$89 start', tag: '🇺🇸 Verified', category: 'Professional Cleaning', avatar: '🧹', available: true },
  { id: 'gp3', name: 'HandyHub UK', city: 'London', distance: 'UK', rating: '4.8', reviews: '430', price: '£35 start', tag: '🇬🇧 Trusted', category: 'Handyman', avatar: '🔨', available: true },
  { id: 'gp4', name: 'Global Tech Cloud', city: 'Silicon Valley', distance: 'USA', rating: '4.9', reviews: '890', price: '$150/hr', tag: '🌐 Remote', category: 'Software', avatar: '💻', available: true },
  { id: 'gp5', name: 'Global MediConsult', city: 'London', distance: 'UK', rating: '4.8', reviews: '510', price: '£100/visit', tag: '⚕️ Specialist', category: 'Doctor', avatar: '⚕️', available: true },
];

// --- 8 SERVICE CATEGORIES WITH SUB-TABS ---

export const CATEGORIES = [
  {
    id: '1', name: 'Emergency', icon: '⚡', color: 'from-red-500 to-red-700', badge: '20m', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Electric', icon: '⚡', bg: 'bg-yellow-100' },
      { name: 'Plumber', icon: '🔧', bg: 'bg-blue-100' },
      { name: 'Meds', icon: '💊', bg: 'bg-red-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 'e1', name: 'Quick Fix Electric', sub: 'Electric', distance: '0.3 km', rating: '4.9', reviews: 200, price: '₹200 visit', tag: '⚡ 8 min away', available: true },
      { id: 'e2', name: 'Pipe Master', sub: 'Plumber', distance: '0.5 km', rating: '4.7', reviews: 150, price: '₹180 visit', tag: '🔧 12 min away', available: true },
      { id: 'e3', name: '24/7 Meds', sub: 'Meds', distance: '1.0 km', rating: '4.8', reviews: 320, price: '₹50 delivery', tag: '💊 15 min delivery', available: true },
    ],
  },
  {
    id: '2', name: 'Repair', icon: '🔧', color: 'from-blue-500 to-blue-700', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Fan', icon: '🌀', bg: 'bg-blue-100' },
      { name: 'AC', icon: '❄️', bg: 'bg-cyan-100' },
      { name: 'Tap/Plumb', icon: '🚰', bg: 'bg-purple-100' },
      { name: 'Fridge', icon: '🧊', bg: 'bg-gray-100' },
      { name: 'Clean', icon: '🧹', bg: 'bg-green-100' },
      { name: 'All', icon: '📋', bg: 'bg-yellow-100' },
    ],
    providers: [
      { id: 'r1', name: 'Ravi Electric', sub: 'Fan', distance: '0.5 km', rating: '4.9', reviews: 120, price: '₹200 visit', tag: 'Available Just Now', available: true },
      { id: 'r2', name: 'Cool Breeze AC', sub: 'AC', distance: '1.0 km', rating: '4.6', reviews: 95, price: '₹350 visit', tag: 'Top Rated', available: true },
      { id: 'r3', name: 'Amit Plumber', sub: 'Tap/Plumb', distance: '0.8 km', rating: '4.5', reviews: 85, price: '₹150 visit', tag: 'Fastest', available: true },
      { id: 'r4', name: 'FrostFix Fridge', sub: 'Fridge', distance: '2.0 km', rating: '4.4', reviews: 60, price: '₹400 visit', tag: 'Trusted', available: false },
      { id: 'r5', name: 'ShineX Clean', sub: 'Clean', distance: '1.2 km', rating: '4.8', reviews: 300, price: '₹499 start', tag: 'Popular', available: true },
      { id: 'r6', name: 'Total Home Solutions', sub: 'Fan', distance: '1.5 km', rating: '4.7', reviews: 180, price: '₹Var', tag: 'Multi-Service', available: true },
    ],
  },
  {
    id: '3', name: 'Beauty', icon: '💅', color: 'from-pink-500 to-pink-700', visibility: ['default', 'city', 'town'],
    subTabs: [
      { name: 'Makeup', icon: '💄', bg: 'bg-pink-100' },
      { name: 'Massage', icon: '💆', bg: 'bg-purple-100' },
      { name: 'Haircut', icon: '✂️', bg: 'bg-orange-100' },
      { name: 'Facial', icon: '✨', bg: 'bg-yellow-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 'b1', name: 'Sunita\'s Artistry', sub: 'Makeup', distance: '0.7 km', rating: '4.9', reviews: 210, price: '₹800 start', tag: 'Top Artist', available: true },
      { id: 'b2', name: 'RelaxZone Spa', sub: 'Massage', distance: '1.5 km', rating: '4.6', reviews: 75, price: '₹600/hr', tag: 'Premium', available: true },
      { id: 'b3', name: 'StyleCut Salon', sub: 'Haircut', distance: '0.4 km', rating: '4.7', reviews: 180, price: '₹150 start', tag: 'Nearby', available: true },
      { id: 'b4', name: 'GlowUp Facial', sub: 'Facial', distance: '1.0 km', rating: '4.5', reviews: 90, price: '₹500 start', tag: '✨ New', available: true },
    ],
  },
  {
    id: '4', name: 'Staff', icon: '👨‍🍳', color: 'from-orange-500 to-orange-700', visibility: ['default', 'city', 'town'],
    subTabs: [
      { name: 'Maid', icon: '🧹', bg: 'bg-green-100' },
      { name: 'Driver', icon: '🚗', bg: 'bg-blue-100' },
      { name: 'Cook', icon: '🍳', bg: 'bg-orange-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 's1', name: 'HomeHelp Maids', sub: 'Maid', distance: '0.3 km', rating: '4.8', reviews: 250, price: '₹4,000/mo', tag: 'Verified', available: true },
      { id: 's2', name: 'SafeDrive', sub: 'Driver', distance: '1.0 km', rating: '4.6', reviews: 100, price: '₹12,000/mo', tag: 'Licensed', available: true },
      { id: 's3', name: 'Sharma Tiffin', sub: 'Cook', distance: '0.6 km', rating: '4.9', reviews: 400, price: '₹3,500/mo', tag: '🔥 Popular', available: true },
    ],
  },
  {
    id: '5', name: 'Tutors', icon: '📚', color: 'from-purple-500 to-purple-700', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Math', icon: '🔢', bg: 'bg-blue-100' },
      { name: 'Science', icon: '🔬', bg: 'bg-green-100' },
      { name: 'Music', icon: '🎵', bg: 'bg-purple-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 't1', name: 'Math Wizard', sub: 'Math', distance: '0.4 km', rating: '4.9', reviews: 150, price: '₹500/hr', tag: 'Grade 10-12', available: true },
      { id: 't2', name: 'ScienceLab Pro', sub: 'Science', distance: '0.8 km', rating: '4.7', reviews: 90, price: '₹450/hr', tag: 'IIT Qualified', available: true },
      { id: 't3', name: 'Melody Music', sub: 'Music', distance: '1.2 km', rating: '4.8', reviews: 60, price: '₹600/hr', tag: 'Guitar / Piano', available: true },
    ],
  },
  {
    id: '6', name: 'Events', icon: '🎉', color: 'from-yellow-500 to-yellow-700', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Birthday', icon: '🎂', bg: 'bg-pink-100' },
      { name: 'Wedding', icon: '💒', bg: 'bg-red-100' },
      { name: 'DJ', icon: '🎧', bg: 'bg-purple-100' },
      { name: 'Photo', icon: '📸', bg: 'bg-blue-100' },
      { name: 'All', icon: '📋', bg: 'bg-yellow-100' },
    ],
    providers: [
      { id: 'ev1', name: 'PartyPro Events', sub: 'Birthday', distance: '1.0 km', rating: '4.8', reviews: 130, price: '₹5,000 start', tag: 'Full Package', available: true },
      { id: 'ev2', name: 'WedBliss Planners', sub: 'Wedding', distance: '2.0 km', rating: '4.9', reviews: 80, price: '₹25,000 start', tag: 'Premium', available: true },
      { id: 'ev3', name: 'DJ Rohit', sub: 'DJ', distance: '1.5 km', rating: '4.6', reviews: 110, price: '₹3,000/event', tag: '🎵 Trending', available: true },
    ],
  },
  {
    id: '7', name: 'Consultancy', icon: '💼', color: 'from-gray-600 to-gray-800', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Software', icon: '💻', bg: 'bg-blue-100' },
      { name: 'Doctor', icon: '⚕️', bg: 'bg-green-100' },
      { name: 'CA', icon: '📊', bg: 'bg-yellow-100' },
      { name: 'Legal', icon: '⚖️', bg: 'bg-gray-100' },
      { name: 'All', icon: '📋', bg: 'bg-purple-100' },
    ],
    providers: [
      { id: 'c1', name: 'TechSolutions Pro', sub: 'Software', distance: 'Remote', rating: '4.9', reviews: 120, price: '₹1500/hr', tag: 'Expert', available: true },
      { id: 'c2', name: 'Dr. Sharma Clinic', sub: 'Doctor', distance: '1.2 km', rating: '4.8', reviews: 340, price: '₹800/visit', tag: 'MD General', available: true },
      { id: 'c3', name: 'Verma & Associates CA', sub: 'CA', distance: '2.5 km', rating: '4.7', reviews: 85, price: '₹2000/session', tag: 'Tax Expert', available: true },
      { id: 'c4', name: 'Legal Hub', sub: 'Legal', distance: '3.0 km', rating: '4.6', reviews: 60, price: '₹1000/hr', tag: 'Corporate', available: true }
    ],
  },
  {
    id: '8', name: 'ItzRunner', icon: '🏃', color: 'from-red-600 to-orange-600', label: 'Chotu', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Pick & Drop', icon: '📦', bg: 'bg-orange-100' },
      { name: 'Buy from Store', icon: '🛒', bg: 'bg-green-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    services: [
      { id: 'ir1', name: 'Pick up & Drop', desc: 'Keys, lunch boxes, documents', icon: '📦', price: '₹30 start' },
      { id: 'ir2', name: 'Buy from Store', desc: 'Groceries, paan, medicine', icon: '🛒', price: '₹40 start' },
    ],
  },
  {
    id: '9', name: 'Lifestyle', icon: '🌿', color: 'from-emerald-400 to-teal-500', visibility: ['default', 'city', 'town'],
    subTabs: [
      { name: 'Fitness', icon: '🏋️', bg: 'bg-blue-100' },
      { name: 'Pets', icon: '🐕', bg: 'bg-orange-100' },
      { name: 'Wellness', icon: '🧘‍♀️', bg: 'bg-pink-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 'o1', name: 'Happy Paws Walker', sub: 'Pets', distance: '0.5 km', rating: '4.9', reviews: 45, price: '₹200/walk', tag: 'Animal Lover', available: true },
      { id: 'o2', name: 'Wellness with Neha', sub: 'Wellness', distance: '1.2 km', rating: '4.8', reviews: 110, price: '₹1500/mo', tag: 'Certified', available: true }
    ],
  },
  {
    id: '10', name: 'Local Produce & Crafts', icon: '🧺', color: 'from-green-600 to-emerald-800', visibility: ['default', 'city', 'town', 'village'],
    subTabs: [
      { name: 'Farmers', icon: '🌾', bg: 'bg-green-100' },
      { name: 'Artisans', icon: '🏺', bg: 'bg-orange-100' },
      { name: 'Home Chefs', icon: '🍲', bg: 'bg-rose-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 'f1', name: 'Green Valley Farms', sub: 'Farmers', distance: '3.0 km', rating: '4.9', reviews: 150, price: '₹50/kg avg', tag: 'Organic', available: true },
      { id: 'a1', name: 'Rani Handmade Pots', sub: 'Artisans', distance: '1.5 km', rating: '4.8', reviews: 85, price: '₹200/item', tag: 'Terracotta', available: true },
      { id: 'c1', name: 'Aunty Kitchen Sweets', sub: 'Home Chefs', distance: '0.8 km', rating: '4.9', reviews: 320, price: '₹300/box', tag: 'Fresh', available: true }
    ],
  },
  {
    id: '11', name: 'Agri & Farm', icon: '🚜', color: 'from-yellow-600 to-green-700', visibility: ['village'],
    subTabs: [
      { name: 'Tractors', icon: '🚜', bg: 'bg-yellow-100' },
      { name: 'Seeds', icon: '🌱', bg: 'bg-green-100' },
      { name: 'Vet', icon: '🐄', bg: 'bg-blue-100' },
      { name: 'All', icon: '📋', bg: 'bg-gray-100' },
    ],
    providers: [
      { id: 'ag1', name: 'Raju Tractors', sub: 'Tractors', distance: '2.0 km', rating: '4.8', reviews: 45, price: '₹500/hr', tag: 'Available', available: true },
      { id: 'ag2', name: 'Kisan Seeds', sub: 'Seeds', distance: '4.5 km', rating: '4.9', reviews: 120, price: 'Wholesale', tag: 'Organic', available: true },
      { id: 'ag3', name: 'Dr. Singh Vet', sub: 'Vet', distance: '8.0 km', rating: '4.7', reviews: 88, price: '₹300/visit', tag: 'Cattle Expert', available: true },
    ]
  }
];

// --- HOMEPAGE PROVIDERS (for "Services Near You" section) ---
export const PROVIDERS = [
  { id: '1', name: 'Ravi Electric', distance: '0.5 km', rating: '4.9', reviews: 120, price: '₹200 visit', tag: 'Available Just Now', category: 'Electrician', avatar: '⚡' },
  { id: '2', name: 'Amit Plumber', distance: '0.8 km', rating: '4.5', reviews: 85, price: '₹150 visit', tag: 'Fastest', category: 'Plumber', avatar: '🔧' },
  { id: '3', name: 'ShineX Clean', distance: '1.2 km', rating: '4.8', reviews: '300+', price: '₹499 start', tag: 'Trusted', category: 'Cleaning', avatar: '✨' },
  { id: '4', name: 'Kumar AC', distance: '1.5 km', rating: '4.6', reviews: 95, price: '₹300 visit', tag: 'Expert', category: 'AC Repair', avatar: '❄️' },
];

// --- TOP EXPERTS ---
export const TOP_EXPERTS = [
  { id: '1', name: 'ShineX Cleaning', service: 'Deep Home Cleaning', price: '₹1,200/visit', rating: '4.8', reviews: '300+', image: '🧹', gradient: 'from-blue-500 to-cyan-400' },
  { id: '2', name: 'Sunita\'s Artistry', service: 'Bridal Makeup', price: '₹5,000/session', rating: '4.9', reviews: '210', image: '💄', gradient: 'from-pink-500 to-rose-400' },
];

// --- HERO BANNERS (3 rotating) ---
export const HERO_BANNERS = [
  {
    id: 'emergency',
    badge: '⚡ FASTEST',
    title: 'Service in',
    highlight: '20 Mins',
    desc: 'Electrician, Plumber & Meds. We arrive before your pizza.',
    cta: 'Book Now',
    gradient: 'from-gray-900 to-black',
    icon: '⚡',
  },
  {
    id: 'virtual',
    badge: '🚀 JOIN US',
    title: 'Start Your',
    highlight: 'Virtual Company',
    desc: 'Keep 100% of earnings. Plans start @ ₹150/mo.',
    cta: 'Create Profile',
    gradient: 'from-blue-600 via-purple-600 to-blue-700',
    icon: '🏢',
  },
  {
    id: 'itzpass',
    badge: '👑 GOLD',
    title: 'ItzPass',
    highlight: 'Membership',
    desc: 'Get 0% Commission rates & Priority Booking.',
    cta: 'Get Pass',
    gradient: 'from-purple-600 to-pink-600',
    icon: '👑',
  },
];

// --- EXPLORE DATA ---
export const EXPLORE_CATEGORIES = [
  { id: '1', name: 'Dance Studio', icon: '💃', color: 'bg-pink-100 text-pink-600' },
  { id: '2', name: 'Gyms', icon: '🏋️', color: 'bg-gray-800 text-white' },
  { id: '3', name: 'Music', icon: '🎸', color: 'bg-purple-100 text-purple-600' },
  { id: '4', name: 'Local Food', icon: '🍔', color: 'bg-orange-100 text-orange-600' },
  { id: '5', name: 'Empty Rooms', icon: '🏠', color: 'bg-teal-100 text-teal-600' },
  { id: '6', name: 'Barber', icon: '💈', color: 'bg-blue-100 text-blue-600' },
];

export const LOCAL_SPOTS = [
  { id: '1', title: 'Rhythm Dance Academy', type: 'Dance Studio', distance: '300m away', image: '🎶', status: 'Open Now', desc: 'Hip-Hop batch starting at 6 PM.' },
  { id: '2', title: '1 BHK in Gaur City', type: 'Empty Room', distance: '800m away', image: '🛏️', status: 'Available', desc: 'No broker. Direct owner chat.' },
  { id: '3', title: 'Sharma Ji Fresh Tiffin', type: 'Local Food', distance: '1.1km away', image: '🍱', status: 'Hot', desc: 'Fresh samosas just prepared!' },
  { id: '4', title: 'Iron Core Gym', type: 'Gym', distance: '500m away', image: '💪', status: 'Crowded', desc: 'Monthly pass ₹800.' },
];

export const COMMUNITY_GROUPS = [
  {
    id: '1', type: 'alert', name: 'Sector 4 Quality Control', members: '3.2k Local Residents',
    title: '🚨 Active Vote: Suspend Provider?',
    desc: 'User @rahul_verma posted 3 photos of incomplete AC wiring left by Amit AC Repair. Vote to suspend his Virtual Company for 7 days?',
    icon: '⚖️', bg: 'bg-red-50', border: 'border-red-200'
  },
  {
    id: '2', type: 'vendor', name: 'Sharma Tiffin VIPs', members: '450 Subscribers',
    title: '📢 Vendor Broadcast',
    desc: 'Owner: "Fresh batch of hot Jalebis just prepared right now! Come fast, 10% off for group members today." 😋',
    icon: '🥘', bg: 'bg-blue-50', border: 'border-blue-200'
  },
];

export const REELS_DATA = [
  { id: '1', creator: '@sharma_tiffin', role: 'Home Chef', location: 'Ghaziabad, IN', desc: 'Making fresh Paneer Tikka for tonight\'s orders! 😋', likes: '1.2k', comments: '45', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cta: 'Order Food', scope: 'local', language: 'Hindi', isHyped: false, views: '5k' },
  { id: '2', creator: '@rhythm_dance', role: 'Dance Studio', location: 'Delhi NCR, IN', desc: 'Evening Hip-Hop batch killing the new routine 🔥', likes: '890', comments: '12', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4', cta: 'Join Batch', scope: 'local', language: 'English', isHyped: false, views: '3.2k' },
  { id: '3', creator: '@tech_guru_india', role: 'Software Consultant', location: 'Bangalore, IN', desc: 'How I landed 3 international clients this week 💻✨', likes: '12.5k', comments: '340', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', cta: 'View Profile', scope: 'national', language: 'Hindi', isHyped: true, views: '150k' },
  { id: '4', creator: '@style_by_priya', role: 'Makeup Artist', location: 'Mumbai, IN', desc: 'Bridal transformation! Wait for the final look 👰💄', likes: '45k', comments: '1.2k', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cta: 'Book Now', scope: 'national', language: 'English', isHyped: true, views: '800k' },
  { id: '5', creator: '@global_nomad', role: 'Photographer', location: 'Dubai, UAE', desc: 'Shooting the Burj Khalifa at sunset. Book me for your next trip! 📸🏙️', likes: '8.2k', comments: '120', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4', cta: 'Hire Me', scope: 'global', language: 'English', isHyped: false, views: '50k' },
  { id: '6', creator: '@chef_marco', role: 'Italian Chef', location: 'Rome, IT', desc: 'Authentic carbonara masterclass 🍝🇮🇹', likes: '120k', comments: '4.5k', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', cta: 'Learn More', scope: 'global', language: 'Italian', isHyped: true, views: '2.1M' },
  { id: '7', creator: '@tamil_tutor', role: 'Education', location: 'Chennai, IN', desc: 'Learn spoken Tamil in 30 days! Day 1 📚', likes: '5.6k', comments: '89', videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4', cta: 'Join Class', scope: 'national', language: 'Tamil', isHyped: false, views: '25k' },
];

// --- VIRTUAL COMPANY REGISTRATION ---

export const REGISTRATION_PLANS = [
  {
    id: 'solo',
    name: 'Solo Expert',
    price: '₹150',
    period: '/mo',
    icon: '🧑‍💼',
    desc: 'Perfect for individual electricians, plumbers, tutors.',
    features: ['Own brand profile', 'Customer group', 'Service catalog', 'Customer reviews', 'Allows customers to follow you or join your update group'],
    color: 'from-blue-500 to-blue-700',
  },
  {
    id: 'agency',
    name: 'Company / Agency',
    price: '₹250',
    period: '/mo',
    icon: '🏢',
    desc: 'Best for contractors with multiple team members.',
    features: ['Everything in Solo', 'Add team members', 'Group discussions', 'Priority listing', 'Build a community around your brand'],
    color: 'from-gray-800 to-black',
  },
];

export const SERVICE_CATEGORY_OPTIONS = [
  'Electrician', 'Plumber', 'AC Repair', 'Carpenter', 'Painter',
  'Beauty & Salon', 'Home Cleaning', 'Pest Control', 'Tutor',
  'Cook / Tiffin', 'Driver', 'Delivery / Runner', 'Event Planner',
  'Fitness Trainer', 'Photographer', 'Consultancy', 
  'Doctor / Healthcare', 'Local Produce & Crafts', 'Other',
];

export const SUBCATEGORIES_MAP = {
  'Local Produce & Crafts': [
    { id: 'farmer', name: 'Farmer / Grower', icon: '🌾' },
    { id: 'artisan', name: 'Handicraft Artisan', icon: '🏺' },
    { id: 'homechef', name: 'Home Chef / Baker', icon: '🍲' },
    { id: 'florist', name: 'Local Florist', icon: '🌸' }
  ],
  'Consultancy': [
    { id: 'software', name: 'Software / IT', icon: '💻' },
    { id: 'doctor', name: 'Doctor / Healthcare', icon: '⚕️' },
    { id: 'ca', name: 'Chartered Accountant', icon: '📊' },
    { id: 'legal', name: 'Legal Consultant', icon: '⚖️' }
  ],
  'Beauty & Salon': [
    { id: 'makeup', name: 'Makeup Artist', icon: '💄' },
    { id: 'massage', name: 'Massage Therapist', icon: '💆' },
    { id: 'hair', name: 'Hair Stylist', icon: '✂️' },
    { id: 'beautician', name: 'Beautician', icon: '✨' }
  ]
};

export const LAUNCH_SCALE_OPTIONS = ['Surrounding', 'City', 'National', 'International'];

export const REVENUE_MODELS = ['Fixed Price', 'Hourly'];

// --- PROVIDER PROFILE DETAILS ---
export const PROVIDER_PROFILES = {
  'r1': {
    id: 'r1', name: 'Ravi Electric', tagline: 'Fast & reliable electrical solutions since 2018',
    category: 'Electrician', location: 'Sector 4, Ghaziabad', distance: '0.5 km',
    rating: 4.9, reviews: 120, jobsDone: 850, yearsExp: 6,
    badges: ['verified', 'vaccinated', 'top-rated'],
    neighborhoodTrust: { count: 18, area: 'Sector 4' },
    about: 'Professional electrician with 6 years of experience. Specializing in wiring, MCB fixing, fan installation, and emergency repairs. Available 24/7 for urgent calls in Ghaziabad area.',
    services: [
      { id: 's1', name: 'Fan Installation', desc: 'Ceiling, wall, exhaust fan fitting', price: '₹200', time: '30 min' },
      { id: 's2', name: 'Wiring Repair', desc: 'Short circuit fix, new line wiring', price: '₹300', time: '45 min' },
      { id: 's3', name: 'MCB / Switchboard', desc: 'MCB change, switch repair, board fitting', price: '₹250', time: '30 min' },
      { id: 's4', name: 'Full House Wiring', desc: 'Complete new house wiring with materials', price: '₹5,000+', time: '2-3 days' },
    ],
    gallery: ['🔌', '💡', '⚡', '🔧', '🏠', '📸'],
    reviewsList: [
      { id: 'rev1', name: 'Amit Sharma', rating: 5, date: '2 days ago', text: 'Ravi fixed my AC wiring in 20 mins. Very professional and clean work. Will recommend! 👍' },
      { id: 'rev2', name: 'Priya Verma', rating: 5, date: '1 week ago', text: 'Best electrician in the area. Fair pricing and comes on time. He installed 3 fans in my new flat.' },
      { id: 'rev3', name: 'Rahul Gupta', rating: 4, date: '2 weeks ago', text: 'Good work but was 15 mins late. Otherwise quality is top notch.' },
    ],
  },
  'r3': {
    id: 'r3', name: 'Amit Plumber', tagline: 'Your neighborhood plumbing expert',
    category: 'Plumber', location: 'Gaur City, Ghaziabad', distance: '0.8 km',
    rating: 4.5, reviews: 85, jobsDone: 420, yearsExp: 4,
    badges: ['verified'],
    neighborhoodTrust: { count: 12, area: 'Gaur City' },
    about: 'Experienced plumber handling all types of pipe work, tap fitting, bathroom renovation, and water leakage solutions. Quick response guaranteed.',
    services: [
      { id: 's1', name: 'Tap Fitting', desc: 'New tap install, old tap replacement', price: '₹150', time: '20 min' },
      { id: 's2', name: 'Pipe Leakage', desc: 'Leak detection and pipe repair', price: '₹200', time: '30 min' },
      { id: 's3', name: 'Bathroom Renovation', desc: 'Full bathroom pipe and fixture work', price: '₹3,000+', time: '1-2 days' },
    ],
    gallery: ['🔧', '🚿', '💧', '🪠'],
    reviewsList: [
      { id: 'rev1', name: 'Neha Singh', rating: 5, date: '3 days ago', text: 'Fixed my kitchen pipe leak instantly. Very reasonable price!' },
      { id: 'rev2', name: 'Kabir Patel', rating: 4, date: '1 week ago', text: 'Good work. Had to call twice but finished properly.' },
    ],
  },
  'b1': {
    id: 'b1', name: 'Sunita\'s Artistry', tagline: 'Premium bridal & party makeup artist',
    category: 'Makeup Artist', location: 'Sector 12, Ghaziabad', distance: '0.7 km',
    rating: 4.9, reviews: 210, jobsDone: 600, yearsExp: 8,
    badges: ['verified', 'top-rated'],
    neighborhoodTrust: { count: 25, area: 'Sector 12' },
    about: 'Award-winning makeup artist with 8+ years experience. Bridal, party, engagement, and corporate event looks. Using premium MAC and Huda Beauty products.',
    services: [
      { id: 's1', name: 'Bridal Makeup', desc: 'HD airbrush complete bridal look', price: '₹8,000', time: '3 hrs' },
      { id: 's2', name: 'Party Makeup', desc: 'Glam look for parties and events', price: '₹2,500', time: '1.5 hrs' },
      { id: 's3', name: 'Engagement Look', desc: 'Elegant engagement styling', price: '₹4,000', time: '2 hrs' },
      { id: 's4', name: 'Mehendi Ceremony', desc: 'Simple elegant mehendi look', price: '₹1,500', time: '1 hr' },
    ],
    gallery: ['💄', '👰', '💅', '✨', '🌸', '📷'],
    reviewsList: [
      { id: 'rev1', name: 'Ritu Mehta', rating: 5, date: '1 week ago', text: 'Sunita made me look like a dream on my wedding day! Every guest was asking about the makeup artist. ❤️' },
      { id: 'rev2', name: 'Anita Joshi', rating: 5, date: '2 weeks ago', text: 'Amazing work for my engagement. She uses only premium products and the look lasted all night.' },
    ],
  },
  'r5': {
    id: 'r5', name: 'ShineX Clean', tagline: 'Deep cleaning experts for spotless homes',
    category: 'Home Cleaning', location: 'Sector 6, Ghaziabad', distance: '1.2 km',
    rating: 4.8, reviews: 300, jobsDone: 1200, yearsExp: 5,
    badges: ['verified', 'vaccinated', 'top-rated'],
    neighborhoodTrust: { count: 35, area: 'Multiple sectors' },
    about: 'Professional deep cleaning agency with trained staff. We use eco-friendly products and advanced equipment. Serving 500+ happy families in Ghaziabad.',
    services: [
      { id: 's1', name: 'Full Home Deep Clean', desc: '2BHK/3BHK complete deep cleaning', price: '₹1,200', time: '4-5 hrs' },
      { id: 's2', name: 'Kitchen Deep Clean', desc: 'Chimney, counter, appliance cleaning', price: '₹499', time: '2 hrs' },
      { id: 's3', name: 'Bathroom Deep Clean', desc: 'Tiles, fixtures, drain cleaning', price: '₹399', time: '1.5 hrs' },
      { id: 's4', name: 'Sofa & Carpet', desc: 'Professional shampooing', price: '₹600', time: '2 hrs' },
    ],
    gallery: ['🧹', '🧽', '🏠', '✨', '🪣', '🧴'],
    reviewsList: [
      { id: 'rev1', name: 'Vikram Reddy', rating: 5, date: '1 day ago', text: 'ShineX team cleaned my entire 3BHK. It looks brand new! Absolutely worth every rupee.' },
      { id: 'rev2', name: 'Meera Chopra', rating: 5, date: '5 days ago', text: 'Regular monthly service. Always on time, always perfect. Best cleaning agency in Ghaziabad.' },
      { id: 'rev3', name: 'Raj Malhotra', rating: 4, date: '2 weeks ago', text: 'Great cleaning but took longer than estimated. Quality is undeniable though.' },
    ],
  },
};

// Fallback profile generator for providers without detailed data
export const generateFallbackProfile = (provider) => ({
  id: provider.id, name: provider.name, tagline: `Professional ${provider.sub || 'service'} provider`,
  category: provider.sub || 'Service', location: 'Ghaziabad', distance: provider.distance,
  rating: parseFloat(provider.rating), reviews: typeof provider.reviews === 'string' ? parseInt(provider.reviews) : provider.reviews,
  jobsDone: Math.floor(Math.random() * 500) + 50, yearsExp: Math.floor(Math.random() * 8) + 1,
  badges: ['verified'], neighborhoodTrust: { count: Math.floor(Math.random() * 20) + 5, area: 'Ghaziabad' },
  about: `Experienced ${provider.sub || 'service'} professional. Available for bookings.`,
  services: [{ id: 's1', name: `${provider.sub || 'General'} Service`, desc: 'Professional service', price: provider.price, time: '30-60 min' }],
  gallery: ['🔧', '⭐', '📸', '✅'],
  reviewsList: [{ id: 'rev1', name: 'Happy Customer', rating: 5, date: 'Recently', text: 'Great service! Highly recommended.' }],
});

// --- BOOKING SYSTEM ---
export const TIME_SLOTS = [
  { id: 't1', time: '9:00 AM', available: true },
  { id: 't2', time: '9:30 AM', available: false },
  { id: 't3', time: '10:00 AM', available: true },
  { id: 't4', time: '10:30 AM', available: true },
  { id: 't5', time: '11:00 AM', available: false },
  { id: 't6', time: '11:30 AM', available: true },
  { id: 't7', time: '12:00 PM', available: true },
  { id: 't8', time: '2:00 PM', available: true },
  { id: 't9', time: '2:30 PM', available: false },
  { id: 't10', time: '3:00 PM', available: true },
  { id: 't11', time: '4:00 PM', available: true },
  { id: 't12', time: '5:00 PM', available: true },
];

export const BOOKING_DATES = [
  { id: 'd1', day: 'Today', date: '29 Apr', available: true },
  { id: 'd2', day: 'Tomorrow', date: '30 Apr', available: true },
  { id: 'd3', day: 'Wed', date: '1 May', available: true },
  { id: 'd4', day: 'Thu', date: '2 May', available: true },
  { id: 'd5', day: 'Fri', date: '3 May', available: false },
];

export const MY_BOOKINGS = [
  {
    id: 'bk1', provider: 'Ravi Electric', service: 'Fan Installation', price: '₹200',
    date: 'Today, 2:00 PM', status: 'upcoming', icon: '⚡',
    address: 'Flat 302, Tower B, Gaur City 2',
  },
  {
    id: 'bk2', provider: 'ShineX Clean', service: 'Full Home Deep Clean', price: '₹1,200',
    date: 'Yesterday, 10:00 AM', status: 'completed', icon: '🧹', rating: 5,
    address: 'Flat 302, Tower B, Gaur City 2',
  },
  {
    id: 'bk3', provider: 'Amit Plumber', service: 'Tap Fitting', price: '₹150',
    date: '25 Apr, 3:00 PM', status: 'completed', icon: '🔧', rating: 4,
    address: 'Flat 302, Tower B, Gaur City 2',
  },
  {
    id: 'bk4', provider: 'Cool Breeze AC', service: 'AC Gas Refill', price: '₹800',
    date: '20 Apr, 11:00 AM', status: 'cancelled', icon: '❄️',
    address: 'Office, Sector 62, Noida',
  },
];

// --- WALLET & TRANSACTIONS ---
export const WALLET_TRANSACTIONS = [
  { id: 'w1', type: 'credit', title: 'Added Money', amount: '+₹500', date: 'Today, 10:30 AM', method: 'UPI', icon: '💳' },
  { id: 'w2', type: 'debit', title: 'ShineX Clean', amount: '-₹1,200', date: 'Yesterday', method: 'Wallet', icon: '🧹' },
  { id: 'w3', type: 'credit', title: 'Cashback Reward', amount: '+₹50', date: '27 Apr', method: 'Reward', icon: '🎁' },
  { id: 'w4', type: 'credit', title: 'Referral Bonus', amount: '+₹100', date: '25 Apr', method: 'Referral', icon: '🤝' },
  { id: 'w5', type: 'debit', title: 'Amit Plumber', amount: '-₹150', date: '25 Apr', method: 'Wallet', icon: '🔧' },
  { id: 'w6', type: 'debit', title: 'ItzPass Monthly', amount: '-₹99', date: '22 Apr', method: 'Auto-pay', icon: '👑' },
  { id: 'w7', type: 'credit', title: 'Added Money', amount: '+₹1,000', date: '20 Apr', method: 'UPI', icon: '💳' },
];

export const TOPUP_AMOUNTS = [100, 200, 500, 1000, 2000, 5000];

// --- ITZPASS MEMBERSHIP ---
export const ITZPASS_PLANS = [
  {
    id: 'basic', name: 'ItzPass Basic', price: '₹49', period: '/month', color: 'from-gray-600 to-gray-800', icon: '🥈',
    features: ['Priority booking', '5% cashback on all services', 'No convenience fees', 'Basic badge on profile'],
  },
  {
    id: 'gold', name: 'ItzPass Gold', price: '₹99', period: '/month', color: 'from-yellow-500 to-amber-600', icon: '👑', popular: true,
    features: ['Everything in Basic', '10% cashback on all services', '0% commission for providers', 'Gold badge', 'Priority customer support', 'Exclusive provider access'],
  },
  {
    id: 'platinum', name: 'ItzPass Platinum', price: '₹199', period: '/month', color: 'from-purple-600 to-indigo-700', icon: '💎',
    features: ['Everything in Gold', '15% cashback', 'Free rescheduling', 'Platinum badge', 'Dedicated support agent', 'Early access to new features', 'Free ItzRunner delivery (2/mo)'],
  },
];

// --- MESSAGING ---
export const CONVERSATIONS = [
  {
    id: 'conv1', provider: 'Ravi Electric', avatar: '⚡', lastMessage: 'I\'ll be there in 10 minutes!',
    time: '2 min ago', unread: 2, online: true, service: 'Fan Installation',
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi, I booked fan installation for 2 PM today', time: '1:30 PM' },
      { id: 'm2', sender: 'provider', text: 'Yes, I can see the booking. I\'ll bring all the tools needed.', time: '1:32 PM' },
      { id: 'm3', sender: 'user', text: 'Great! It\'s a ceiling fan, standard size', time: '1:33 PM' },
      { id: 'm4', sender: 'provider', text: 'Perfect. Do you have the fan already or need me to bring one?', time: '1:35 PM' },
      { id: 'm5', sender: 'user', text: 'I have it, just need installation', time: '1:36 PM' },
      { id: 'm6', sender: 'provider', text: 'I\'ll be there in 10 minutes!', time: '1:50 PM' },
    ],
  },
  {
    id: 'conv2', provider: 'ShineX Clean', avatar: '🧹', lastMessage: 'Thank you for the 5-star rating! 🙏',
    time: 'Yesterday', unread: 0, online: false, service: 'Deep Clean',
    messages: [
      { id: 'm1', sender: 'provider', text: 'Good morning! We\'re on our way for the deep cleaning service.', time: '9:45 AM' },
      { id: 'm2', sender: 'user', text: 'Great, door is open. Please ring the bell.', time: '9:50 AM' },
      { id: 'm3', sender: 'provider', text: 'We\'ve completed the cleaning. Please check and let us know!', time: '2:00 PM' },
      { id: 'm4', sender: 'user', text: 'Amazing work! The house looks brand new. Gave 5 stars ⭐', time: '2:15 PM' },
      { id: 'm5', sender: 'provider', text: 'Thank you for the 5-star rating! 🙏', time: '2:20 PM' },
    ],
  },
  {
    id: 'conv3', provider: 'Sunita\'s Artistry', avatar: '💄', lastMessage: 'See you at your engagement! 💕',
    time: '3 days ago', unread: 0, online: true, service: 'Engagement Makeup',
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi Sunita, I want to book engagement makeup for May 5th', time: '10:00 AM' },
      { id: 'm2', sender: 'provider', text: 'Hi! Congratulations! 🎉 I\'d love to do your engagement look. Do you have a preference — glam or subtle?', time: '10:05 AM' },
      { id: 'm3', sender: 'user', text: 'I want a glam look, something like the HD airbrush', time: '10:08 AM' },
      { id: 'm4', sender: 'provider', text: 'Perfect! That would be ₹4,000 for the full engagement look. I\'ll need about 2 hours. Should I come to your home?', time: '10:12 AM' },
      { id: 'm5', sender: 'user', text: 'Yes please! I\'ll send the address later', time: '10:15 AM' },
      { id: 'm6', sender: 'provider', text: 'See you at your engagement! 💕', time: '10:18 AM' },
    ],
  },
];

// --- QUALITY CHECK POSTS ---
export const QUALITY_CHECK_POSTS = [
  {
    id: 'qc1',
    author: 'Rahul Verma', authorAvatar: '👨‍💻', location: 'Sector 4, Gaur City',
    provider: 'Amit AC Repair', providerCategory: 'AC Repair',
    title: 'Is this AC wiring okay? 🤔',
    desc: 'Got my AC serviced by Amit AC Repair. He left these wires exposed near the outdoor unit. Is this normal or should I be worried?',
    images: ['📸', '📸', '📸'],
    reactions: { helpful: 23, notHelpful: 2 },
    comments: 15, timeAgo: '3 hours ago',
    verdict: 'unsafe',
    votes: { suspend: 78, forgive: 22 },
  },
  {
    id: 'qc2',
    author: 'Meera Chopra', authorAvatar: '👩‍🦰', location: 'Sector 12',
    provider: 'ShineX Clean', providerCategory: 'Home Cleaning',
    title: 'Before & After — Deep Clean Result ✨',
    desc: 'ShineX team did an amazing job on my kitchen! Sharing before and after photos. This is what quality looks like.',
    images: ['📸', '📸'],
    reactions: { helpful: 45, notHelpful: 0 },
    comments: 8, timeAgo: '1 day ago',
    verdict: 'approved',
    votes: { suspend: 0, forgive: 100 },
  },
  {
    id: 'qc3',
    author: 'Vikram Singh', authorAvatar: '🧑', location: 'Gaur City 2',
    provider: 'Quick Fix Plumber', providerCategory: 'Plumber',
    title: 'Pipe fitting quality check 🔧',
    desc: 'Got bathroom pipe work done. The joints look a bit rough to me. Can any plumbing expert here tell me if this is acceptable?',
    images: ['📸', '📸', '📸', '📸'],
    reactions: { helpful: 12, notHelpful: 5 },
    comments: 22, timeAgo: '2 days ago',
    verdict: 'pending',
    votes: { suspend: 35, forgive: 65 },
  },
];

// --- SEARCH RESULTS ---
export const ALL_SEARCHABLE_PROVIDERS = [
  { id: 'sp1', name: 'Ravi Electric', category: 'Electrician', sub: 'Electric', rating: 4.9, reviews: 120, price: '₹200/visit', distance: '0.5 km', avatar: '⚡', available: true, tag: 'Available Now' },
  { id: 'sp2', name: 'Amit Plumber', category: 'Plumber', sub: 'Plumber', rating: 4.5, reviews: 85, price: '₹150/visit', distance: '0.8 km', avatar: '🔧', available: true, tag: 'Fastest' },
  { id: 'sp3', name: 'ShineX Clean', category: 'Home Cleaning', sub: 'Clean', rating: 4.8, reviews: 300, price: '₹499/start', distance: '1.2 km', avatar: '✨', available: true, tag: 'Popular' },
  { id: 'sp4', name: 'Cool Breeze AC', category: 'AC Repair', sub: 'AC', rating: 4.6, reviews: 95, price: '₹350/visit', distance: '1.0 km', avatar: '❄️', available: true, tag: 'Top Rated' },
  { id: 'sp5', name: 'Sunita\'s Artistry', category: 'Makeup Artist', sub: 'Makeup', rating: 4.9, reviews: 210, price: '₹800/start', distance: '0.7 km', avatar: '💄', available: true, tag: 'Premium' },
  { id: 'sp6', name: 'Math Wizard', category: 'Tutor', sub: 'Math', rating: 4.9, reviews: 150, price: '₹500/hr', distance: '0.4 km', avatar: '📚', available: true, tag: 'Grade 10-12' },
  { id: 'sp7', name: 'HomeHelp Maids', category: 'Maid', sub: 'Maid', rating: 4.8, reviews: 250, price: '₹4,000/mo', distance: '0.3 km', avatar: '🏠', available: true, tag: 'Verified' },
  { id: 'sp8', name: 'Sharma Tiffin', category: 'Cook', sub: 'Cook', rating: 4.9, reviews: 400, price: '₹3,500/mo', distance: '0.6 km', avatar: '🍳', available: true, tag: '🔥 Popular' },
  { id: 'sp9', name: 'PartyPro Events', category: 'Event Planner', sub: 'Birthday', rating: 4.8, reviews: 130, price: '₹5,000/start', distance: '1.0 km', avatar: '🎉', available: true, tag: 'Full Package' },
  { id: 'sp10', name: 'DJ Rohit', category: 'DJ', sub: 'DJ', rating: 4.6, reviews: 110, price: '₹3,000/event', distance: '1.5 km', avatar: '🎧', available: false, tag: 'Trending' },
  { id: 'sp11', name: 'FrostFix Fridge', category: 'Fridge Repair', sub: 'Fridge', rating: 4.4, reviews: 60, price: '₹400/visit', distance: '2.0 km', avatar: '🧊', available: false, tag: 'Trusted' },
  { id: 'sp12', name: 'SafeDrive', category: 'Driver', sub: 'Driver', rating: 4.6, reviews: 100, price: '₹12,000/mo', distance: '1.0 km', avatar: '🚗', available: true, tag: 'Licensed' },
  { id: 'sp13', name: 'Melody Music', category: 'Music Tutor', sub: 'Music', rating: 4.8, reviews: 60, price: '₹600/hr', distance: '1.2 km', avatar: '🎵', available: true, tag: 'Guitar / Piano' },
  { id: 'sp14', name: 'WedBliss Planners', category: 'Wedding Planner', sub: 'Wedding', rating: 4.9, reviews: 80, price: '₹25,000/start', distance: '2.0 km', avatar: '💒', available: true, tag: 'Premium' },
  { id: 'sp15', name: 'GlowUp Facial', category: 'Beautician', sub: 'Facial', rating: 4.5, reviews: 90, price: '₹500/start', distance: '1.0 km', avatar: '✨', available: true, tag: 'New' },
  { id: 'sp16', name: 'TechSolutions Pro', category: 'Consultancy', sub: 'Software', rating: 4.9, reviews: 120, price: '₹1500/hr', distance: 'Remote', avatar: '💻', available: true, tag: 'Expert' },
  { id: 'sp17', name: 'Dr. Sharma Clinic', category: 'Healthcare', sub: 'Doctor', rating: 4.8, reviews: 340, price: '₹800/visit', distance: '1.2 km', avatar: '⚕️', available: true, tag: 'MD General' },
  { id: 'sp18', name: 'Verma & Associates CA', category: 'Consultancy', sub: 'CA', rating: 4.7, reviews: 85, price: '₹2000/session', distance: '2.5 km', avatar: '📊', available: true, tag: 'Tax Expert' },
  { id: 'sp19', name: 'Legal Hub', category: 'Legal', sub: 'Legal', rating: 4.6, reviews: 60, price: '₹1000/hr', distance: '3.0 km', avatar: '⚖️', available: true, tag: 'Corporate' },
];
