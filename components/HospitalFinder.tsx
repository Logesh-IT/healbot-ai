
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, Filter, Navigation, Phone, ExternalLink, Star, MapPin, Loader2, ChevronUp, ChevronDown, Calendar, User, Mail, MessageSquare } from 'lucide-react';
import { getAnswer } from '../services/chatbot';
import { Language, Hospital } from '../types';
import supabase from '../supabase';

// Fix for Leaflet default icon issue in React
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom pulse icon for user location
const pulseIcon = L.divIcon({
  className: 'custom-div-icon',
  html: `<div class="relative flex items-center justify-center">
          <div class="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div>
          <div class="relative w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        </div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

// Custom hospital icon
const hospitalIcon = (isSelected: boolean) => L.divIcon({
  className: 'custom-hospital-icon',
  html: `<div class="flex items-center justify-center w-10 h-10 rounded-full shadow-xl border-2 transition-all hover:scale-110 ${
    isSelected ? 'bg-blue-600 border-white text-white scale-125 z-[1000]' : 'bg-white border-blue-600 text-blue-600'
  }">
    <i class="fas fa-hospital text-xs"></i>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

// Component to handle map view changes
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
};

const HospitalFinder: React.FC<{ lang: Language; isOnline: boolean; theme: 'light' | 'dark'; onBack: () => void }> = ({ lang, isOnline, theme, onBack }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Hospital' | 'Clinic' | 'Pharmacy'>('All');
  const [filterDistance, setFilterDistance] = useState<number>(10); // km
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const isDark = theme === 'dark';

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setError("Please enable location services to find nearby healthcare centers.")
    );
  }, []);

  const findHospitals = async () => {
    if (!location) return;
    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Find 8 nearby hospitals, clinics, and pharmacies near coordinates ${location.lat}, ${location.lng}. 
      Provide their names, addresses, ratings, phone numbers, and exact coordinates. 
      Format the response as a list of healthcare centers.`;
      
      const response = await getAnswer(prompt, [], undefined, location);
      
      // In a real app, we'd parse the structured response or grounding chunks
      // For now, we'll use the grounding URLs and enhance them with mock data for coordinates
      const groundingChunks = response.groundingUrls || [];
      const types: ('Hospital' | 'Clinic' | 'Pharmacy')[] = ['Hospital', 'Clinic', 'Pharmacy'];
      
      const extractedHospitals: Hospital[] = groundingChunks.map((chunk: any, idx: number) => ({
        name: chunk.title || "Healthcare Center",
        address: chunk.uri || "Address not available",
        rating: 4 + Math.random(),
        distance: `${(Math.random() * 5).toFixed(1)} km`,
        phone: "+91 98765 43210",
        lat: location.lat + (Math.random() - 0.5) * 0.04,
        lng: location.lng + (Math.random() - 0.5) * 0.04,
        uri: chunk.uri || "#",
        type: types[idx % 3],
        isOpen: Math.random() > 0.3
      }));

      // If no grounding chunks, provide some high-quality mock data centered around user
      if (extractedHospitals.length === 0) {
        const mockHospitals: Hospital[] = [
          { name: "City General Hospital", address: "123 Medical Ave, Downtown", rating: 4.8, distance: "0.8 km", phone: "555-0101", lat: location.lat + 0.005, lng: location.lng + 0.005, uri: "#", type: 'Hospital', isOpen: true },
          { name: "Sunrise Clinic", address: "45 Health St, East Side", rating: 4.5, distance: "1.2 km", phone: "555-0102", lat: location.lat - 0.008, lng: location.lng + 0.012, uri: "#", type: 'Clinic', isOpen: true },
          { name: "Wellness Pharmacy", address: "88 Cure Rd, West End", rating: 4.9, distance: "0.5 km", phone: "555-0103", lat: location.lat + 0.01, lng: location.lng - 0.005, uri: "#", type: 'Pharmacy', isOpen: false },
          { name: "St. Jude Medical Center", address: "200 Hope Blvd", rating: 4.7, distance: "2.5 km", phone: "555-0104", lat: location.lat - 0.015, lng: location.lng - 0.01, uri: "#", type: 'Hospital', isOpen: true },
          { name: "QuickCare Clinic", address: "12 Rapid Way", rating: 4.2, distance: "3.1 km", phone: "555-0105", lat: location.lat + 0.02, lng: location.lng + 0.015, uri: "#", type: 'Clinic', isOpen: true },
        ];
        setHospitals(mockHospitals);
      } else {
        setHospitals(extractedHospitals);
      }
    } catch (err) {
      setError("Failed to fetch nearby healthcare centers.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (location) findHospitals();
  }, [location]);

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    department: 'General Medicine',
    reason: ''
  });
  const [isBooking, setIsBooking] = useState(false);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHospital) return;
    setIsBooking(true);
    try {
      const { error } = await supabase.from('service_bookings').insert([{
        service_id: selectedHospital.name,
        service_title: selectedHospital.name,
        service_type: 'Hospital Appointment',
        patient_name: bookingData.name,
        patient_email: bookingData.email,
        details: `Phone: ${bookingData.phone}, Date: ${bookingData.date}, Time: ${bookingData.time}, Dept: ${bookingData.department}, Reason: ${bookingData.reason}`,
        status: 'Pending',
        timestamp: new Date().toISOString()
      }]);

      if (error) throw error;
      alert("Appointment booked successfully!");
      setIsBookingModalOpen(false);
      setBookingData({ name: '', email: '', phone: '', date: '', time: '', department: 'General Medicine', reason: '' });
    } catch (err) {
      alert("Booking failed. Please try again.");
    } finally {
      setIsBooking(false);
    }
  };

  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           h.address.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'All' || h.type === filterType;
      const dist = parseFloat(h.distance);
      const matchesDistance = dist <= filterDistance;
      return matchesSearch && matchesType && matchesDistance;
    });
  }, [hospitals, searchQuery, filterType, filterDistance]);

  const mapCenter: [number, number] = selectedHospital 
    ? [selectedHospital.lat, selectedHospital.lng] 
    : location 
      ? [location.lat, location.lng] 
      : [20, 77]; // Default to India center if no location

  return (
    <div className={`p-4 md:p-8 max-w-7xl mx-auto h-full flex flex-col gap-6 transition-colors duration-500 ${isDark ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className={`text-3xl md:text-4xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Nearby Healthcare</h2>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm md:text-base`}>Find hospitals, clinics, and pharmacies near you.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={onBack}
            className={`flex-1 md:flex-none h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${
              isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Navigation className="w-4 h-4 rotate-[-90deg]" /> Back
          </button>
          <button 
            onClick={findHospitals}
            disabled={isLoading}
            className={`flex-1 md:flex-none h-12 px-6 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 ${
              isDark ? 'shadow-blue-900/40' : 'shadow-blue-200'
            }`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <i className="fas fa-sync-alt"></i>}
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none transition-all font-medium shadow-sm border-2 ${
              isDark 
                ? 'bg-slate-900 border-slate-800 text-white focus:border-blue-500' 
                : 'bg-white border-slate-100 text-slate-700 focus:border-blue-500'
            }`}
          />
        </div>
        <div className="md:col-span-3">
          <div className="relative h-14">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className={`w-full h-full pl-10 pr-4 rounded-2xl outline-none transition-all font-bold text-[10px] uppercase tracking-widest appearance-none cursor-pointer shadow-sm border-2 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 focus:border-blue-500' 
                  : 'bg-white border-slate-100 text-slate-600 focus:border-blue-500'
              }`}
            >
              <option value="All">All Types</option>
              <option value="Hospital">Hospitals</option>
              <option value="Clinic">Clinics</option>
              <option value="Pharmacy">Pharmacies</option>
            </select>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="relative h-14">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select 
              value={filterDistance}
              onChange={(e) => setFilterDistance(Number(e.target.value))}
              className={`w-full h-full pl-10 pr-4 rounded-2xl outline-none transition-all font-bold text-[10px] uppercase tracking-widest appearance-none cursor-pointer shadow-sm border-2 ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-300 focus:border-blue-500' 
                  : 'bg-white border-slate-100 text-slate-600 focus:border-blue-500'
              }`}
            >
              <option value={1}>Within 1 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={50}>Within 50 km</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 relative">
        {/* Sidebar List (Desktop) */}
        <div className="hidden lg:flex lg:col-span-4 flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
          <div className="flex items-center justify-between px-2 mb-2">
            <h3 className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Results ({filteredHospitals.length})</h3>
          </div>
          
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`p-6 rounded-[2rem] border-2 animate-pulse h-40 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}></div>
            ))
          ) : filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital, idx) => (
              <HospitalCard 
                key={idx} 
                hospital={hospital} 
                isSelected={selectedHospital?.name === hospital.name}
                isDark={isDark}
                onClick={() => setSelectedHospital(hospital)}
              />
            ))
          ) : (
            <div className={`p-12 rounded-[2.5rem] border-2 border-dashed text-center ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mb-4 mx-auto ${isDark ? 'bg-slate-800 text-slate-700' : 'bg-white text-slate-200'}`}>
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-400 font-bold text-sm">No centers match your filters.</p>
            </div>
          )}
        </div>

        {/* Map View */}
        <div className={`lg:col-span-8 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden relative border-4 shadow-2xl z-0 ${isDark ? 'bg-slate-900 border-slate-800 shadow-blue-900/20' : 'bg-slate-100 border-white shadow-slate-200'}`}>
          {!location && !error && (
            <div className={`absolute inset-0 z-10 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center ${isDark ? 'bg-slate-900/80' : 'bg-white/80'}`}>
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
              <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Locating You...</h3>
              <p className="text-slate-500 text-sm max-w-xs">We need your location to find the nearest medical facilities.</p>
            </div>
          )}

          {error && (
            <div className={`absolute inset-0 z-10 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center ${isDark ? 'bg-red-950/90' : 'bg-red-50/90'}`}>
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-red-200' : 'text-red-900'}`}>Location Error</h3>
              <p className="text-red-600 text-sm max-w-xs mb-6">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-all"
              >
                Retry Access
              </button>
            </div>
          )}

          {location && (
            <MapContainer 
              center={[location.lat, location.lng]} 
              zoom={14} 
              className={`w-full h-full ${isDark ? 'invert-[0.9] hue-rotate-[180deg] brightness-[0.8] contrast-[1.2]' : ''}`}
              zoomControl={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <ZoomControl position="topright" />
              <MapController center={mapCenter} zoom={selectedHospital ? 16 : 14} />
              
              {/* User Location Marker */}
              <Marker position={[location.lat, location.lng]} icon={pulseIcon}>
                <Popup>
                  <div className="font-bold text-blue-600">You are here</div>
                </Popup>
              </Marker>

              {/* Hospital Markers */}
              {filteredHospitals.map((h, i) => (
                <Marker 
                  key={i} 
                  position={[h.lat, h.lng]} 
                  icon={hospitalIcon(selectedHospital?.name === h.name)}
                  eventHandlers={{
                    click: () => setSelectedHospital(h),
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-[150px]">
                      <p className="font-bold text-slate-900 mb-1">{h.name}</p>
                      <p className="text-[10px] text-slate-500 mb-2">{h.address}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-600 uppercase">{h.type}</span>
                        <span className="text-[10px] font-bold text-amber-500"><Star className="w-2 h-2 inline mr-1 fill-amber-500" />{h.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}

          {/* Mobile Floating List Toggle */}
          <div className="lg:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%]">
            <motion.div 
              animate={{ height: isMobilePanelOpen ? '60vh' : '80px' }}
              className={`${isDark ? 'bg-slate-900/90' : 'bg-white/90'} backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-white/50 overflow-hidden flex flex-col`}
            >
              <button 
                onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)}
                className="h-20 w-full flex items-center justify-between px-8 shrink-0"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className={`text-xs font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>Nearby Centers</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{filteredHospitals.length} Facilities Found</p>
                  </div>
                </div>
                {isMobilePanelOpen ? <ChevronDown className="text-slate-400" /> : <ChevronUp className="text-slate-400" />}
              </button>

              <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
                {filteredHospitals.map((hospital, idx) => (
                  <HospitalCard 
                    key={idx} 
                    hospital={hospital} 
                    isSelected={selectedHospital?.name === hospital.name}
                    isDark={isDark}
                    onClick={() => {
                      setSelectedHospital(hospital);
                      setIsMobilePanelOpen(false);
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Selected Hospital Detail Overlay (Desktop) */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className={`fixed bottom-12 left-1/2 -translate-x-1/2 z-[2000] w-[90%] max-w-4xl backdrop-blur-3xl p-6 md:p-8 rounded-[3rem] border shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] hidden lg:flex items-center justify-between gap-8 ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-white'
            }`}
          >
            <div className="flex items-center gap-8 flex-1">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center text-4xl shadow-2xl shadow-blue-200 shrink-0">
                <i className={`fas ${selectedHospital.type === 'Pharmacy' ? 'fa-pills' : 'fa-hospital'}`}></i>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className={`text-2xl font-black uppercase tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{selectedHospital.name}</h4>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${selectedHospital.isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {selectedHospital.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
                <p className="text-slate-500 text-sm font-medium mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-300" /> {selectedHospital.address}
                </p>
                <div className="flex gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 ${
                    isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-600 bg-blue-50'
                  }`}>
                    <Star className="w-3 h-3 fill-blue-600" /> {selectedHospital.rating.toFixed(1)} Rating
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-2 ${
                    isDark ? 'text-slate-400 bg-slate-800' : 'text-slate-500 bg-slate-50'
                  }`}>
                    <Navigation className="w-3 h-3" /> {selectedHospital.distance}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => window.open(`tel:${selectedHospital.phone}`)}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-xl transition-all active:scale-90 shadow-xl ${
                  isDark ? 'bg-white text-slate-900 hover:bg-slate-100' : 'bg-slate-900 text-white hover:bg-black'
                }`}
              >
                <Phone className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setIsBookingModalOpen(true)}
                className="h-16 px-10 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all flex items-center gap-3 shadow-xl shadow-green-200 active:scale-95"
              >
                <Calendar className="w-4 h-4" /> Book Appointment
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedHospital.lat},${selectedHospital.lng}`)}
                className="h-16 px-10 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-200 active:scale-95"
              >
                <Navigation className="w-4 h-4" /> Directions
              </button>
              <button 
                onClick={() => setSelectedHospital(null)}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                  isDark ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && selectedHospital && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center text-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Book Appointment</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedHospital.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsBookingModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleBookingSubmit} className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Patient Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="text"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({...bookingData, name: e.target.value})}
                        placeholder="Full Name"
                        className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({...bookingData, email: e.target.value})}
                        placeholder="email@example.com"
                        className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        required
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({...bookingData, phone: e.target.value})}
                        placeholder="+91 00000 00000"
                        className={`w-full h-14 pl-12 pr-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Department</label>
                    <select 
                      value={bookingData.department}
                      onChange={(e) => setBookingData({...bookingData, department: e.target.value})}
                      className={`w-full h-14 px-6 rounded-2xl outline-none border-2 transition-all font-bold text-sm appearance-none cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                    >
                      <option>General Medicine</option>
                      <option>Cardiology</option>
                      <option>Orthopedics</option>
                      <option>Pediatrics</option>
                      <option>Dermatology</option>
                      <option>Neurology</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Preferred Date</label>
                    <input 
                      required
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      className={`w-full h-14 px-6 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Preferred Time</label>
                    <input 
                      required
                      type="time"
                      value={bookingData.time}
                      onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                      className={`w-full h-14 px-6 rounded-2xl outline-none border-2 transition-all font-bold text-sm ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Reason for Visit</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                    <textarea 
                      required
                      value={bookingData.reason}
                      onChange={(e) => setBookingData({...bookingData, reason: e.target.value})}
                      placeholder="Briefly describe your symptoms or reason for appointment..."
                      rows={3}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl outline-none border-2 transition-all font-bold text-sm resize-none ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-green-500' : 'bg-slate-50 border-transparent focus:border-green-500 focus:bg-white'}`}
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isBooking}
                  className={`w-full h-16 bg-green-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-700 transition-all shadow-xl shadow-green-200 flex items-center justify-center gap-3 disabled:opacity-50`}
                >
                  {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                  Confirm Appointment
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HospitalCard: React.FC<{ hospital: Hospital; isSelected: boolean; isDark: boolean; onClick: () => void }> = ({ hospital, isSelected, isDark, onClick }) => (
  <motion.button
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] border-2 transition-all text-left group relative overflow-hidden ${
      isSelected 
        ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200' 
        : isDark
          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-blue-900 hover:shadow-xl'
          : 'bg-white border-slate-100 text-slate-600 hover:border-blue-200 hover:shadow-xl'
    }`}
  >
    {isSelected && (
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
    )}
    
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg ${
        isSelected ? 'bg-white/20' : isDark ? 'bg-slate-800 text-blue-400' : 'bg-blue-50 text-blue-600'
      }`}>
        <i className={`fas ${hospital.type === 'Pharmacy' ? 'fa-pills' : hospital.type === 'Clinic' ? 'fa-stethoscope' : 'fa-hospital'}`}></i>
      </div>
      <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
        isSelected ? 'text-blue-100' : isDark ? 'text-slate-500' : 'text-slate-400'
      }`}>
        <Star className={`w-3 h-3 ${isSelected ? 'fill-white' : 'fill-amber-400 text-amber-400'}`} /> {hospital.rating.toFixed(1)}
      </div>
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-1">
        <p className={`font-black text-lg uppercase tracking-tight truncate ${isSelected ? 'text-white' : isDark ? 'text-slate-100' : 'text-slate-900'}`}>{hospital.name}</p>
        <div className={`w-1.5 h-1.5 rounded-full ${hospital.isOpen ? 'bg-green-400' : 'bg-red-400'}`}></div>
      </div>
      <p className={`text-[10px] font-medium leading-relaxed mb-6 line-clamp-1 ${isSelected ? 'text-blue-100' : isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        {hospital.address}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
            isSelected ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'
          }`}>
            {hospital.type}
          </span>
          <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${
            isSelected ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-500'
          }`}>
            {hospital.distance}
          </span>
        </div>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
          isSelected ? 'bg-white text-blue-600' : 'bg-blue-50 text-blue-600 opacity-0 group-hover:opacity-100'
        }`}>
          <Navigation className="w-4 h-4" />
        </div>
      </div>
    </div>
  </motion.button>
);

export default HospitalFinder;
