import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Search, 
  Sparkles, 
  MapPin, 
  SlidersHorizontal, 
  CheckCircle2, 
  Award, 
  HelpCircle, 
  ArrowUpDown, 
  Plus, 
  MessageCircle, 
  Star,
  Users,
  Building,
  RefreshCw,
  PhoneCall,
  Flame,
  LayoutGrid,
  Navigation,
  Compass,
  ArrowUp,
  X,
  Lightbulb
} from 'lucide-react';
import { 
  ServiceProfessional, 
  AdminSettings, 
  SponsorBanner as SponsorBannerType, 
  TradeCategory, 
  AppUser,
  ServiceJobRequest
} from './types';
import { api } from './services/api';
import { ALL_TRADES, INITIAL_ZONES } from './data/seedData';
import { 
  calculateHaversineDistanceKm, 
  getProfessionalCoordinates, 
  getNearestCityName, 
  SAMPLE_USER_LOCATIONS,
  matchesLocationFilter
} from './utils/geoUtils';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { ProfessionalCard } from './components/ProfessionalCard';
import { ProfessionalDetailModal } from './components/ProfessionalDetailModal';
import { SponsorBanner } from './components/SponsorBanner';
import { AiSearchModal } from './components/AiSearchModal';
import { AdminPanel } from './components/AdminPanel';
import { ProviderDashboard } from './components/ProviderDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ParaguayMap } from './components/ParaguayMap';
import { JobRequestsBoard } from './components/JobRequestsBoard';
import { WelcomeRegistrationModal } from './components/WelcomeRegistrationModal';
import { PricingModal } from './components/PricingModal';
import { ProfessionalFaq } from './components/ProfessionalFaq';
import { DemoNoticeModal } from './components/DemoNoticeModal';
import { VisitorSuggestionsModal } from './components/VisitorSuggestionsModal';

export default function App() {
  // Navigation view
  const [currentView, setCurrentView] = useState<'directory' | 'map' | 'jobs' | 'provider' | 'admin' | 'faq'>('directory');
  
  // Layout mode inside directory view (cards grid vs interactive map)
  const [directoryLayoutMode, setDirectoryLayoutMode] = useState<'grid' | 'map'>('grid');

  // Current logged in user session
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // Demo contact interception modal state
  const [demoNotice, setDemoNotice] = useState<{
    isOpen: boolean;
    name: string;
    itemType: 'profesional' | 'trabajo' | 'auspiciante';
  }>({
    isOpen: false,
    name: '',
    itemType: 'profesional'
  });

  const handleDemoContact = (name: string, itemType: 'profesional' | 'trabajo' | 'auspiciante' = 'profesional') => {
    setDemoNotice({
      isOpen: true,
      name,
      itemType
    });
  };

  // Data states
  const [professionals, setProfessionals] = useState<ServiceProfessional[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [sponsors, setSponsors] = useState<SponsorBannerType[]>([]);
  const [jobs, setJobs] = useState<ServiceJobRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state for public directory
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'busy'>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'distance' | 'rating' | 'experience'>('recommended');

  // Geolocation & Proximity Filter state
  interface UserLocation {
    lat: number;
    lng: number;
    cityName?: string;
    source: 'gps' | 'manual';
  }

  const [userLocation, setUserLocation] = useState<UserLocation | null>(() => {
    try {
      const saved = localStorage.getItem('serviciosya_user_location');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });
  const [isLocating, setIsLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // Request browser geolocation
  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Tu navegador no soporta geolocalización GPS. Puedes elegir una ciudad de referencia en Paraguay:');
      setShowLocationPicker(true);
      return;
    }

    setIsLocating(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const cityName = getNearestCityName(lat, lng);
        const loc: UserLocation = { lat, lng, cityName, source: 'gps' };
        setUserLocation(loc);
        try {
          localStorage.setItem('serviciosya_user_location', JSON.stringify(loc));
        } catch (e) {}
        setIsLocating(false);
        setSortBy('distance');
        setShowLocationPicker(false);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'No se pudo acceder a tu ubicación GPS.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Acceso a geolocalización no permitido en el navegador. Puedes activarlo o elegir una ciudad de referencia:';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = 'Información de ubicación no disponible. Elige una ciudad para calcular distancias:';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Tiempo de espera agotado al consultar GPS. Elige una ciudad para continuar:';
        }
        setGeoError(msg);
        setShowLocationPicker(true);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Toggle proximity sort mode
  const handleToggleNearMe = () => {
    if (sortBy === 'distance') {
      setSortBy('recommended');
    } else {
      if (userLocation) {
        setSortBy('distance');
      } else {
        requestUserLocation();
      }
    }
  };

  // Set manual reference location (e.g. if GPS is denied or in iframe)
  const handleSelectManualLocation = (sample: { name: string; dept: string; lat: number; lng: number }) => {
    const loc: UserLocation = {
      lat: sample.lat,
      lng: sample.lng,
      cityName: `${sample.name} (${sample.dept})`,
      source: 'manual'
    };
    setUserLocation(loc);
    try {
      localStorage.setItem('serviciosya_user_location', JSON.stringify(loc));
    } catch (e) {}
    setGeoError(null);
    setShowLocationPicker(false);
    setSortBy('distance');
  };

  // Clear user location
  const handleClearLocation = () => {
    setUserLocation(null);
    try {
      localStorage.removeItem('serviciosya_user_location');
    } catch (e) {}
    if (sortBy === 'distance') {
      setSortBy('recommended');
    }
    setGeoError(null);
    setShowLocationPicker(false);
  };

  // Modals state
  const [selectedProfessional, setSelectedProfessional] = useState<ServiceProfessional | null>(null);
  const [modalInitialReviews, setModalInitialReviews] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingInitialTab, setPricingInitialTab] = useState<'featured' | 'sponsor'>('featured');
  const [targetFeaturedTier, setTargetFeaturedTier] = useState<'bronze' | 'silver' | 'gold' | undefined>(undefined);
  const [targetSponsorType, setTargetSponsorType] = useState<'hero' | 'feed' | undefined>(undefined);

  const handleOpenPricing = (tab: 'featured' | 'sponsor' = 'featured') => {
    setPricingInitialTab(tab);
    setShowPricingModal(true);
  };
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [suggestionsInitialQuery, setSuggestionsInitialQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);

  const handleOpenSuggestions = (query?: string) => {
    setSuggestionsInitialQuery(query || searchQuery || '');
    setShowSuggestionsModal(true);
  };

  // Scroll to top handler
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Detect when user scrolls down or reaches near the bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // Becomes active when scrolled past 350px or when nearing the bottom of the page
      const isScrolledDown = scrollY > 350;
      const isNearBottom = windowHeight + scrollY >= docHeight - 700;

      setShowScrollTop(isScrolledDown || isNearBottom);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load initial data
  const loadData = async () => {
    try {
      setLoading(true);
      const [profsData, settingsData, sponsorsData, jobsData] = await Promise.all([
        api.getProfessionals(),
        api.getSettings(),
        api.getSponsors(),
        api.getJobs(),
      ]);
      setProfessionals(profsData);
      setSettings(settingsData);
      setSponsors(sponsorsData);
      setJobs(jobsData);
    } catch (err) {
      console.error('Error fetching ServiciosYa data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const data = await api.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  };

  useEffect(() => {
    loadData();

    // Trigger welcome registration popup on entering the site
    try {
      const permDismissed = localStorage.getItem('serviciosya_welcome_dismissed_permanent');
      const sessionShown = sessionStorage.getItem('serviciosya_welcome_shown');
      if (!permDismissed && !sessionShown) {
        const timer = setTimeout(() => {
          setShowWelcomeModal(true);
        }, 700);
        return () => clearTimeout(timer);
      }
    } catch {
      setShowWelcomeModal(true);
    }
  }, []);

  // Filtered professionals for Directory view
  // Note: ONLY approved professionals appear in public directory
  const approvedProfessionals = useMemo(() => {
    return professionals.filter(p => p.verificationStatus === 'approved');
  }, [professionals]);

  // Precompute distances when user location is available
  const profDistancesMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!userLocation) return map;
    approvedProfessionals.forEach(p => {
      const coords = getProfessionalCoordinates(p);
      const dist = calculateHaversineDistanceKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng);
      map.set(p.id, dist);
    });
    return map;
  }, [approvedProfessionals, userLocation]);

  const filteredProfessionals = useMemo(() => {
    return approvedProfessionals.filter(p => {
      // Trade filter
      if (selectedTrade !== 'all' && p.trade.toLowerCase() !== selectedTrade.toLowerCase()) {
        return false;
      }

      // Zone filter (Department or City matching)
      if (!matchesLocationFilter(p.zone, p.coverageAreas, selectedZone)) {
        return false;
      }

      // Verified filter
      if (onlyVerified && !p.isVerified) {
        return false;
      }

      // Featured filter
      if (onlyFeatured && p.featuredTier === 'none') {
        return false;
      }

      // Work Status filter (available / busy)
      if (statusFilter === 'available' && p.workStatus === 'busy') {
        return false;
      }
      if (statusFilter === 'busy' && p.workStatus !== 'busy') {
        return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inName = p.name.toLowerCase().includes(q);
        const inTrade = p.trade.toLowerCase().includes(q);
        const inBio = p.bio.toLowerCase().includes(q);
        const inZone = p.zone.toLowerCase().includes(q);
        const inSpecs = p.specialties?.some(s => s.toLowerCase().includes(q));
        if (!inName && !inTrade && !inBio && !inZone && !inSpecs) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'distance' && userLocation) {
        const distA = profDistancesMap.get(a.id) ?? 99999;
        const distB = profDistancesMap.get(b.id) ?? 99999;
        if (Math.abs(distA - distB) < 0.1) {
          return (b.rating || 0) - (a.rating || 0);
        }
        return distA - distB;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      if (sortBy === 'experience') {
        return b.experienceYears - a.experienceYears;
      }
      // 'recommended': Gold featured first, then Silver, then Bronze, then rating
      const tierScore = (t: string) => {
        if (t === 'gold') return 30;
        if (t === 'silver') return 20;
        if (t === 'bronze') return 10;
        return 0;
      };
      const scoreA = tierScore(a.featuredTier) + a.rating * 2;
      const scoreB = tierScore(b.featuredTier) + b.rating * 2;
      return scoreB - scoreA;
    });
  }, [approvedProfessionals, selectedTrade, selectedZone, onlyVerified, onlyFeatured, statusFilter, searchQuery, sortBy, profDistancesMap, userLocation]);

  // Featured Gold & Silver professionals for the top carousel
  const featuredProfs = useMemo(() => {
    return approvedProfessionals.filter(p => p.featuredTier === 'gold' || p.featuredTier === 'silver');
  }, [approvedProfessionals]);

  // My professional profile if logged in
  const myProfessional = useMemo(() => {
    if (!currentUser?.professionalId) return null;
    return professionals.find(p => p.id === currentUser.professionalId) || null;
  }, [currentUser, professionals]);

  // Handle professional selection and track profile view in real-time
  const handleSelectProfessional = (prof: ServiceProfessional) => {
    setModalInitialReviews(false);
    const updatedViews = (prof.viewsCount || 0) + 1;
    setProfessionals(prev => prev.map(p => p.id === prof.id ? { ...p, viewsCount: updatedViews } : p));
    setSelectedProfessional({ ...prof, viewsCount: updatedViews });

    api.trackProfileView(prof.id).then(res => {
      if (res?.viewsCount) {
        setProfessionals(prev => prev.map(p => p.id === prof.id ? { ...p, viewsCount: res.viewsCount, whatsappClicks: res.whatsappClicks } : p));
        setSelectedProfessional(prev => prev && prev.id === prof.id ? { ...prev, viewsCount: res.viewsCount, whatsappClicks: res.whatsappClicks } : prev);
      }
    });
  };

  // Handle direct opening of the reviews / testimonial view
  const handleOpenReviews = (prof: ServiceProfessional) => {
    handleSelectProfessional(prof);
    setModalInitialReviews(true);
  };

  // Handle smart search invocation
  const handleSmartSearchTrigger = (query: string) => {
    setAiInitialQuery(query);
    setShowAiModal(true);
  };

  // Sponsor banners
  const topSponsor = sponsors.find(s => s.active && s.placement === 'top_hero') || sponsors[0];
  const middleSponsor = sponsors.find(s => s.active && s.placement === 'middle_feed');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && currentUser?.role !== 'admin') {
            setShowAdminLoginModal(true);
          } else {
            setCurrentView(view);
          }
        }}
        currentUser={currentUser}
        onLogout={() => {
          setCurrentUser(null);
          setCurrentView('directory');
        }}
        onOpenAdminLogin={() => setShowAdminLoginModal(true)}
        onOpenSuggestions={() => handleOpenSuggestions()}
        onOpenPricing={() => handleOpenPricing('featured')}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        
        {/* VIEW 1: PUBLIC DIRECTORY */}
        {currentView === 'directory' && (
          <div className="animate-in fade-in duration-200">
            
            {/* Hero search with intelligent search & category dropdown */}
            <HeroSearch
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedTrade={selectedTrade}
              onTradeChange={setSelectedTrade}
              selectedZone={selectedZone}
              onZoneChange={setSelectedZone}
              onTriggerAiSearch={handleSmartSearchTrigger}
              onOpenMap={() => {
                setCurrentView('map');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenJobs={() => {
                setCurrentView('jobs');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenSuggestions={handleOpenSuggestions}
              onOpenPricing={() => handleOpenPricing('featured')}
            />

            {/* Main container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
              
              {/* Top Sponsor Banner (if active) */}
              {topSponsor && (
                <SponsorBanner sponsor={topSponsor} />
              )}

              {/* Featured Professionals Showcase Bar (Gold & Silver tiers) */}
              {featuredProfs.length > 0 && selectedTrade === 'all' && !searchQuery && (
                <div className="mb-8 bg-gradient-to-r from-indigo-50/60 via-slate-50/80 to-white p-4 sm:p-5 rounded-xl border border-indigo-100 shadow-2xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                          Profesionales Destacados del Mes en Paraguay
                        </h3>
                        <p className="text-xs text-slate-500 font-normal">
                          Recomendados por su puntualidad, matrícula verificada y atención inmediata vía WhatsApp.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {featuredProfs.slice(0, 4).map((prof) => (
                      <div
                        key={prof.id}
                        onClick={() => handleSelectProfessional(prof)}
                        className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-xs hover:border-indigo-300 transition-all cursor-pointer flex items-center gap-3 group"
                      >
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 group-hover:scale-105 transition-transform shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold uppercase text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md">
                            {prof.trade}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 truncate mt-1 group-hover:text-indigo-600 transition-colors">
                            {prof.name}
                          </h4>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-700">{prof.rating}</span>
                            <span>•</span>
                            <span className="truncate font-normal">{prof.zone.split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Controls Bar */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
                
                {/* Result count & active criteria */}
                <div className="flex items-center gap-2 text-xs font-medium text-slate-600 w-full md:w-auto">
                  <span className="text-sm font-bold text-slate-900">
                    {filteredProfessionals.length}
                  </span>
                  <span>servicios encontrados</span>
                  {selectedTrade !== 'all' && (
                    <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold">
                      {selectedTrade}
                    </span>
                  )}
                  {selectedZone !== 'all' && (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-rose-600" />
                      {selectedZone}
                    </span>
                  )}
                </div>

                {/* Filter switches, view toggle & sort */}
                <div className="flex items-center gap-3 flex-wrap justify-end w-full md:w-auto">
                  
                  {/* View Mode Switcher: Cards vs Itapua Map */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      id="view-toggle-grid"
                      type="button"
                      onClick={() => setDirectoryLayoutMode('grid')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        directoryLayoutMode === 'grid'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Vista Cuadrícula de Servicios"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Cuadrícula</span>
                    </button>
                    <button
                      id="view-toggle-map"
                      type="button"
                      onClick={() => setDirectoryLayoutMode('map')}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                        directoryLayoutMode === 'map'
                          ? 'bg-white text-indigo-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      title="Vista Mapa de Itapúa (30 distritos)"
                    >
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>Mapa Itapúa (30)</span>
                    </button>
                  </div>

                  {/* Verified only checkbox */}
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-100 hover:bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                    <input
                      id="filter-verified-only"
                      type="checkbox"
                      checked={onlyVerified}
                      onChange={(e) => setOnlyVerified(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Solo Verificados</span>
                  </label>

                  {/* Featured only checkbox */}
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer select-none bg-slate-100 hover:bg-slate-100/90 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                    <input
                      id="filter-featured-only"
                      type="checkbox"
                      checked={onlyFeatured}
                      onChange={(e) => setOnlyFeatured(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Solo Destacados</span>
                  </label>

                  {/* Availability / Work Status Filter */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                    <button
                      id="filter-status-all"
                      type="button"
                      onClick={() => setStatusFilter('all')}
                      className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                        statusFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      id="filter-status-available"
                      type="button"
                      onClick={() => setStatusFilter('available')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        statusFilter === 'available'
                          ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                          : 'text-emerald-700 hover:text-emerald-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      <span>Disponibles</span>
                    </button>
                    <button
                      id="filter-status-busy"
                      type="button"
                      onClick={() => setStatusFilter('busy')}
                      className={`px-2 py-1 rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                        statusFilter === 'busy'
                          ? 'bg-amber-500 text-slate-950 shadow-2xs font-bold'
                          : 'text-amber-700 hover:text-amber-900'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>Ocupados</span>
                    </button>
                  </div>

                  {/* Proximity / Cercanía GPS Filter Button */}
                  <button
                    id="filter-proximity-btn"
                    type="button"
                    onClick={handleToggleNearMe}
                    disabled={isLocating}
                    title={
                      sortBy === 'distance'
                        ? 'Filtro de cercanía activo. Clic para desactivar.'
                        : 'Ordenar profesionales por cercanía a tu ubicación GPS'
                    }
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer select-none ${
                      sortBy === 'distance'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                    }`}
                  >
                    {isLocating ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
                        <span>Detectando...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className={`w-3.5 h-3.5 ${sortBy === 'distance' ? 'text-amber-300 fill-amber-300 rotate-45' : 'text-slate-500'}`} />
                        <span>Cercanía</span>
                        {sortBy === 'distance' && userLocation && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
                        )}
                      </>
                    )}
                  </button>

                  {/* Sort dropdown */}
                  <div className="flex items-center gap-1.5 text-xs">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      id="select-sort-directory"
                      value={sortBy}
                      onChange={(e) => {
                        const val = e.target.value as any;
                        setSortBy(val);
                        if (val === 'distance' && !userLocation) {
                          requestUserLocation();
                        }
                      }}
                      className="bg-slate-100 hover:bg-slate-100/90 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-hidden focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    >
                      <option value="recommended">Orden Recomendado</option>
                      <option value="distance">📍 Cercanía (Más próximos)</option>
                      <option value="rating">Mejor Calificados</option>
                      <option value="experience">Mayor Experiencia</option>
                    </select>
                  </div>

                </div>

              </div>

              {/* Contextual Proximity Status & Quick Location Bar */}
              {(sortBy === 'distance' || showLocationPicker || geoError) && (
                <div 
                  id="proximity-status-bar"
                  className="bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-indigo-50/90 border border-indigo-200/80 rounded-xl p-3.5 text-xs text-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs mb-6 animate-in fade-in duration-200"
                >
                  <div className="flex items-start sm:items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Navigation className="w-3.5 h-3.5 rotate-45 text-amber-300" />
                    </div>
                    <div>
                      {userLocation ? (
                        <div className="leading-snug">
                          <span className="font-bold text-slate-900">Ordenando por proximidad a: </span>
                          <span className="text-indigo-900 font-bold bg-white/90 px-2 py-0.5 rounded-md border border-indigo-200 shadow-2xs">
                            {userLocation.cityName || `${userLocation.lat.toFixed(3)}, ${userLocation.lng.toFixed(3)}`}
                          </span>
                          <span className="text-slate-500 ml-2 text-[11px]">
                            ({userLocation.source === 'gps' ? 'GPS detectado' : 'Punto de referencia manual'})
                          </span>
                        </div>
                      ) : isLocating ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                          <span className="font-semibold text-slate-800">
                            Detectando tu geolocalización GPS...
                          </span>
                        </div>
                      ) : geoError ? (
                        <div className="text-slate-800 font-medium">
                          <span className="text-amber-900 font-semibold">{geoError}</span>
                        </div>
                      ) : (
                        <span className="font-semibold text-slate-800">
                          Filtro de cercanía activo. Selecciona tu ubicación para ordenar profesionales por distancia.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions: Refresh GPS / Change city / Dismiss */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => requestUserLocation()}
                      disabled={isLocating}
                      title="Volver a consultar tu GPS"
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-indigo-700 border border-indigo-200 font-bold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>Actualizar GPS</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowLocationPicker(!showLocationPicker)}
                      className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-[11px] flex items-center gap-1 shadow-2xs cursor-pointer transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-rose-500" />
                      <span>{showLocationPicker ? 'Ocultar ciudades' : 'Elegir ciudad'}</span>
                    </button>

                    {userLocation && (
                      <button
                        type="button"
                        onClick={handleClearLocation}
                        title="Quitar filtro de proximidad y volver a orden recomendado"
                        className="px-2 py-1 rounded-md hover:bg-indigo-100/70 text-slate-500 hover:text-slate-800 font-medium text-[11px] flex items-center gap-0.5 cursor-pointer transition-colors"
                      >
                        <X className="w-3 h-3" />
                        <span>Quitar</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Manual City Selector Pills when picker is active */}
              {showLocationPicker && (
                <div className="w-full bg-white border border-indigo-200 rounded-xl p-3.5 shadow-xs space-y-2 mb-6 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      <span>Selecciona tu ciudad o punto de referencia en Paraguay:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLocationPicker(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_USER_LOCATIONS.map((city) => (
                      <button
                        key={city.name}
                        type="button"
                        onClick={() => handleSelectManualLocation(city)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          userLocation?.cityName?.startsWith(city.name)
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                            : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                        }`}
                      >
                        {city.name} <span className="text-[10px] opacity-75 font-normal">({city.dept})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Content area based on layout mode */}
              {directoryLayoutMode === 'map' ? (
                /* INLINE MAP MODE IN DIRECTORY */
                <div className="space-y-6">
                  <ParaguayMap
                    professionals={approvedProfessionals}
                    selectedZone={selectedZone}
                    onSelectZone={(zone) => setSelectedZone(zone)}
                  />

                  {/* Filtered cards under the map */}
                  {filteredProfessionals.length > 0 && (
                    <div className="pt-4 border-t border-slate-200">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          <span>
                            Profesionales disponibles en {selectedZone === 'all' || selectedZone === 'Todas las zonas' ? 'Todo el Paraguay (17 Departamentos)' : selectedZone} ({filteredProfessionals.length})
                          </span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => setDirectoryLayoutMode('grid')}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Ver en cuadrícula completa →
                        </button>
                      </div>
                      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence mode="popLayout">
                          {filteredProfessionals.map((prof) => (
                            <ProfessionalCard
                              key={prof.id}
                              professional={prof}
                              onSelect={handleSelectProfessional}
                              onOpenReviews={handleOpenReviews}
                              distanceKm={profDistancesMap.get(prof.id)}
                              onDemoContact={(name) => handleDemoContact(name, 'profesional')}
                            />
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  )}
                </div>
              ) : (
                /* STANDARD GRID OF PROFESSIONAL CARDS */
                <>
                  {loading ? (
                    <div className="py-20 text-center space-y-3">
                      <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                      <p className="text-xs font-semibold text-slate-600">
                        Cargando directorio de profesionales de ServiciosYa Itapúa...
                      </p>
                    </div>
                  ) : filteredProfessionals.length > 0 ? (
                    <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      <AnimatePresence mode="popLayout">
                        {filteredProfessionals.flatMap((prof, index) => [
                          <ProfessionalCard
                            key={prof.id}
                            professional={prof}
                            onSelect={handleSelectProfessional}
                            onOpenReviews={handleOpenReviews}
                            distanceKm={profDistancesMap.get(prof.id)}
                            onDemoContact={(name) => handleDemoContact(name, 'profesional')}
                          />,
                          ...(index === 3 && middleSponsor ? [
                            <motion.div
                              layout
                              key={`middle-sponsor-${middleSponsor.id || index}`}
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.25 }}
                              className="col-span-full"
                            >
                              <SponsorBanner sponsor={middleSponsor} />
                            </motion.div>
                          ] : [])
                        ])}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty-professionals-state"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="text-center py-16 bg-white rounded-xl border border-slate-200 p-8 space-y-4 shadow-2xs"
                    >
                      <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
                        <Search className="w-8 h-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900">
                        No se encontraron servicios con estos filtros
                      </h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto font-normal">
                        Probá cambiando el departamento o distrito seleccionado, el oficio o quitando el filtro de búsqueda.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          onClick={() => {
                            setSelectedTrade('all');
                            setSelectedZone('all');
                            setSearchQuery('');
                            setOnlyVerified(false);
                            setOnlyFeatured(false);
                            setStatusFilter('all');
                            setSortBy('recommended');
                          }}
                          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                        >
                          Restablecer todos los filtros
                        </button>
                        <button
                          onClick={() => handleOpenSuggestions(searchQuery)}
                          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Lightbulb className="w-4 h-4 fill-slate-950 text-slate-950" />
                          <span>💡 Proponer oficio para sumarlo</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              {/* Community Suggestion Banner */}
              <div className="mt-8 bg-gradient-to-r from-amber-50 via-white to-amber-50 rounded-xl p-5 border border-amber-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-xs font-bold">
                    <Lightbulb className="w-5 h-5 fill-slate-950 text-slate-950" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span>¿Buscás un oficio o profesión que aún no figura en la web?</span>
                      <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Buzón Ciudadano
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 font-normal mt-0.5">
                      Proponé el servicio que necesitás en tu departamento o ciudad. Convocamos a profesionales calificados del rubro.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-community-suggestion"
                  onClick={() => handleOpenSuggestions()}
                  className="w-full sm:w-auto px-4 py-2 bg-slate-950 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-lg shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Lightbulb className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>Sugerir Oficio o Servicio</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: DEDICATED FULL PARAGUAY MAP VIEW */}
        {currentView === 'map' && (
          <div className="animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="bg-white border-b border-slate-200 py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 mb-1">
                      <span className="bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-full">
                        República del Paraguay
                      </span>
                      <span>•</span>
                      <span>17 Departamentos + Asunción</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                      <MapPin className="w-7 h-7 text-rose-600 shrink-0" />
                      <span>Mapa Interactivo de Departamentos y Ciudades de Paraguay</span>
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal max-w-3xl">
                      Visualizá por solapas de Departamentos, Ciudades y Profesionales Destacados con <strong>estrella dorada ★</strong> en el mapa interactivo de todo el Paraguay.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => {
                        setDirectoryLayoutMode('grid');
                        setCurrentView('directory');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
                    >
                      <LayoutGrid className="w-3.5 h-3.5" />
                      <span>Ver Directorio General</span>
                      <span className="text-indigo-200">({approvedProfessionals.length})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Map container */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
              {/* Interactive Map Component */}
              <ParaguayMap
                professionals={approvedProfessionals}
                selectedZone={selectedZone}
                onSelectZone={(zone) => setSelectedZone(zone)}
                onSelectProfessional={handleSelectProfessional}
              />

              {/* Matching Professionals Section */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <span>
                        Profesionales verificados en {selectedZone === 'all' || selectedZone === 'Todas las zonas' ? 'todo el Paraguay' : selectedZone}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {filteredProfessionals.length} disponibles
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {selectedZone !== 'all' && selectedZone !== 'Todas las zonas'
                        ? `Mostrando especialistas con cobertura en ${selectedZone}. Contacto directo por WhatsApp.`
                        : 'Seleccioná un departamento o ciudad en las solapas del mapa para acotar la búsqueda.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedZone !== 'all' && selectedZone !== 'Todas las zonas' && (
                      <button
                        onClick={() => setSelectedZone('all')}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
                      >
                        Ver todo el país
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setDirectoryLayoutMode('grid');
                        setCurrentView('directory');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                    >
                      Abrir en Directorio Completo
                    </button>
                  </div>
                </div>

                {filteredProfessionals.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    <AnimatePresence mode="popLayout">
                      {filteredProfessionals.map((prof) => (
                        <ProfessionalCard
                          key={prof.id}
                          professional={prof}
                          onSelect={handleSelectProfessional}
                          onDemoContact={(name) => handleDemoContact(name, 'profesional')}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 p-6">
                    <p className="text-sm font-semibold text-slate-700">
                      Aún no hay profesionales registrados con sede exclusiva en {selectedZone}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Muchos profesionales de Encarnación, Cambyretá y Colonias Unidas tienen cobertura en todos los distritos de Itapúa.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-3">
                      <button
                        onClick={() => setSelectedZone('all')}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs"
                      >
                        Ver todos en Itapúa
                      </button>
                      <button
                        onClick={() => setCurrentView('provider')}
                        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs"
                      >
                        ¿Sos profesional en {selectedZone}? Registrate gratis
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PROVIDER PORTAL & DASHBOARD */}
        {currentView === 'provider' && settings && (
          <ProviderDashboard
            currentUser={currentUser}
            onLoginSuccess={(user, prof) => {
              setCurrentUser(user);
              if (prof) {
                setProfessionals(prev => {
                  const exists = prev.some(p => p.id === prof.id);
                  if (exists) {
                    return prev.map(p => p.id === prof.id ? prof : p);
                  }
                  return [prof, ...prev];
                });
              }
            }}
            settings={settings}
            myProfessional={myProfessional}
            professionals={professionals}
            onRefreshData={loadData}
            onViewAsClient={(p) => {
              setSelectedProfessional(p);
              setCurrentView('directory');
            }}
            onOpenFaq={() => {
              setCurrentView('faq');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            initialWantsFeatured={targetFeaturedTier ? true : undefined}
            initialFeaturedTier={targetFeaturedTier}
            initialWantsSponsor={targetSponsorType ? true : undefined}
            initialSponsorType={targetSponsorType}
            onOpenPricing={() => handleOpenPricing('featured')}
          />
        )}

        {/* VIEW 3: ADMIN EXCLUSIVE PANEL */}
        {currentView === 'admin' && settings && currentUser?.role === 'admin' && (
          <AdminPanel
            professionals={professionals}
            settings={settings}
            sponsors={sponsors}
            onRefreshData={loadData}
            onSelectProfessional={setSelectedProfessional}
          />
        )}

        {/* VIEW 4: JOB REQUESTS & MARKETPLACE */}
        {currentView === 'jobs' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <JobRequestsBoard
              jobs={jobs}
              onRefreshJobs={loadJobs}
              onDemoContact={(title) => handleDemoContact(title, 'trabajo')}
            />
          </div>
        )}

        {/* VIEW 5: GUÍAS, FAQ Y AYUDA PARA PROFESIONALES */}
        {currentView === 'faq' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
            <ProfessionalFaq
              onGoToProvider={() => {
                setCurrentView('provider');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenPricing={() => handleOpenPricing('featured')}
            />
          </div>
        )}

      </main>

      {/* Floating Action Controls: Scroll To Top & AI Assistant */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-2.5">
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 15 }}
              transition={{ duration: 0.2 }}
              onClick={scrollToTop}
              id="btn-scroll-to-top"
              aria-label="Subir al inicio de la página"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-900/95 hover:bg-slate-950 text-white text-xs font-bold shadow-xl border border-slate-700/80 backdrop-blur-xs transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer group"
              title="Subir al inicio de la página"
            >
              <ArrowUp className="w-4 h-4 text-sky-400 group-hover:-translate-y-0.5 transition-transform" />
              <span>Subir</span>
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={() => {
            setAiInitialQuery('');
            setShowAiModal(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-full shadow-lg border border-indigo-400/30 text-xs font-semibold flex items-center gap-2 transition-transform hover:scale-102"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">¿No sabés qué oficio necesitas? Consultar a la IA</span>
          <span className="sm:hidden">Buscar con IA</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 text-xs font-normal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-sky-400/60 bg-slate-950 flex items-center justify-center shrink-0">
                  <img src="/favicon.svg" alt="ServiciosYa" className="w-full h-full object-contain" />
                </div>
                <span className="text-lg font-black text-white">Servicios<span className="text-sky-400 italic">YA</span></span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px] font-normal mb-3">
                Directorio inteligente de profesionales y oficios del hogar en todo el Paraguay. Cobertura en los 17 departamentos y Asunción. Comunicación directa y gratuita por WhatsApp sin comisiones.
              </p>
              <button
                onClick={() => {
                  setCurrentView('map');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors border border-slate-700 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Mapa Nacional (17 Departamentos)</span>
              </button>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
                Oficios Principales
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                {ALL_TRADES.slice(0, 6).map(t => (
                  <li key={t.category}>
                    <button 
                      onClick={() => { setSelectedTrade(t.category); setCurrentView('directory'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      className="hover:text-indigo-300 transition-colors"
                    >
                      {t.category}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
                Para Profesionales
              </h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button 
                    onClick={() => { setCurrentView('provider'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-indigo-300 transition-colors"
                  >
                    Registrar mi servicio gratis
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setCurrentView('faq'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="hover:text-amber-300 transition-colors text-amber-400 font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Guía & FAQ Profesionales (Paso a Paso)</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleOpenPricing('featured')}
                    className="hover:text-indigo-300 transition-colors text-amber-300 font-medium cursor-pointer flex items-center gap-1"
                  >
                    <span>⭐ Panel de Costos y Planes Destacados</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setShowWelcomeModal(true); }}
                    className="hover:text-indigo-300 transition-colors text-slate-400"
                  >
                    Invitación a Registro de Profesionales
                  </button>
                </li>
                <li>
                  <span className="text-slate-500">Validación de Matrícula Oficial</span>
                </li>
                <li>
                  <button 
                    onClick={() => handleOpenSuggestions()}
                    className="hover:text-amber-300 transition-colors text-amber-400 font-semibold cursor-pointer flex items-center gap-1.5"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Buzón de Sugerencias de Oficios</span>
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
                Administración y Seguridad
              </h4>
              <p className="text-[11px] leading-relaxed mb-3 text-slate-400 font-normal">
                Todos los profesionales son verificados antes de aparecer en las búsquedas públicas de Paraguay.
              </p>
              <button
                onClick={() => {
                  if (currentUser?.role === 'admin') {
                    setCurrentView('admin');
                  } else {
                    setShowAdminLoginModal(true);
                  }
                }}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panel Exclusivo de Administrador</span>
              </button>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px] font-normal">
            <div>
              © {new Date().getFullYear()} ServiciosYa Paraguay. Directorio nacional de oficios y servicios profesionales con cobertura en los 17 departamentos y Asunción, Paraguay.
            </div>
            <button
              onClick={scrollToTop}
              id="footer-scroll-to-top"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700 cursor-pointer shrink-0"
              title="Volver al inicio de la página"
            >
              <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Subir al inicio</span>
            </button>
          </div>
        </div>
      </footer>

      {/* MODAL 1: Professional Detail Modal with WhatsApp Direct */}
      {selectedProfessional && (
        <ProfessionalDetailModal
          professional={selectedProfessional}
          onClose={() => {
            setSelectedProfessional(null);
            setModalInitialReviews(false);
          }}
          initialShowReviewForm={modalInitialReviews}
          onReviewAdded={(updated) => {
            if (updated) {
              setProfessionals(prev => prev.map(p => p.id === updated.id ? updated : p));
              setSelectedProfessional(updated);
            }
            loadData();
          }}
          onDemoContact={(name) => handleDemoContact(name, 'profesional')}
        />
      )}

      {/* MODAL 2: AI Smart Search Modal */}
      {showAiModal && (
        <AiSearchModal
          initialQuery={aiInitialQuery}
          allProfessionals={professionals}
          onClose={() => setShowAiModal(false)}
          onSelectProfessional={(prof) => {
            setShowAiModal(false);
            handleSelectProfessional(prof);
          }}
        />
      )}

      {/* MODAL 3: Admin Login Modal */}
      {showAdminLoginModal && (
        <AdminLoginModal
          onClose={() => setShowAdminLoginModal(false)}
          onSuccess={(adminUser) => {
            setCurrentUser(adminUser);
            setCurrentView('admin');
          }}
        />
      )}

      {/* MODAL 4: Welcome Registration Modal (Pop-up on entering site) */}
      <WelcomeRegistrationModal
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onRegisterProfessional={() => {
          setCurrentView('provider');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPricing={() => handleOpenPricing('featured')}
        onOpenMap={() => {
          setCurrentView('map');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODAL 5: Pricing & Cost Panel Modal */}
      {showPricingModal && (
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          settings={settings}
          initialTab={pricingInitialTab}
          contactNumber={settings?.paymentsPhone || settings?.contactWhatsApp || '595975635770'}
          contactEmail={settings?.contactEmail || 'serviciosyaparaguay@gmail.com'}
          onSelectPlan={(tier) => {
            setTargetFeaturedTier(tier);
            setShowPricingModal(false);
            setCurrentView('provider');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSelectSponsor={(type) => {
            setTargetSponsorType(type);
            setShowPricingModal(false);
            setCurrentView('provider');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isLoggedIn={Boolean(myProfessional)}
        />
      )}

      {/* MODAL 6: Demo Notice Modal */}
      <DemoNoticeModal
        isOpen={demoNotice.isOpen}
        onClose={() => setDemoNotice(prev => ({ ...prev, isOpen: false }))}
        itemName={demoNotice.name}
        itemType={demoNotice.itemType}
        onOpenRegister={() => {
          setCurrentView('provider');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* MODAL 7: Visitor Suggestions Modal */}
      <VisitorSuggestionsModal
        isOpen={showSuggestionsModal}
        onClose={() => setShowSuggestionsModal(false)}
        adminWhatsApp={settings?.suggestionsPhone || settings?.contactWhatsApp || '595975635770'}
        adminEmail={settings?.contactEmail || 'serviciosyaparaguay@gmail.com'}
        suggestionsNotice={settings?.suggestionsNotice}
        initialQuery={suggestionsInitialQuery}
      />

    </div>
  );
}
