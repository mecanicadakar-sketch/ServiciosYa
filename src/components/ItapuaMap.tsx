import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  Navigation, 
  Check, 
  ChevronRight, 
  Info, 
  RotateCcw,
  SlidersHorizontal,
  X,
  Users,
  Star,
  Building,
  Briefcase,
  PhoneCall,
  MessageCircle,
  Award
} from 'lucide-react';
import { 
  PARAGUAY_DEPARTMENTS, 
  ALL_PARAGUAY_CITIES, 
  PARAGUAY_CENTER, 
  PARAGUAY_DEFAULT_ZOOM, 
  ParaguayCity, 
  ParaguayDepartment 
} from '../data/paraguayData';
import { ServiceProfessional } from '../types';
import { api } from '../services/api';

interface ParaguayMapProps {
  professionals: ServiceProfessional[];
  selectedZone: string;
  onSelectZone: (zone: string) => void;
  onViewDirectory?: () => void;
  onSelectProfessional?: (prof: ServiceProfessional) => void;
  isCompact?: boolean;
}

export const ItapuaMap: React.FC<ParaguayMapProps> = (props) => <ParaguayMapComponent {...props} />;
export const ParaguayMap: React.FC<ParaguayMapProps> = (props) => <ParaguayMapComponent {...props} />;

const ParaguayMapComponent: React.FC<ParaguayMapProps> = ({
  professionals,
  selectedZone,
  onSelectZone,
  onViewDirectory,
  onSelectProfessional,
  isCompact = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const cityMarkersRef = useRef<{ [cityId: string]: L.Marker }>({});
  const featuredMarkersRef = useRef<{ [profId: string]: L.Marker }>({});

  // Active view tabs
  const [activeTab, setActiveTab] = useState<'departments' | 'cities' | 'featured'>('departments');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(!isCompact);
  const [showFeaturedLayer, setShowFeaturedLayer] = useState(true);

  // Match professionals to cities
  const cityProfsMap = useMemo(() => {
    const map: { [cityId: string]: { total: number; featured: number; profs: ServiceProfessional[] } } = {};
    ALL_PARAGUAY_CITIES.forEach(c => {
      map[c.id] = { total: 0, featured: 0, profs: [] };
    });

    professionals.forEach(p => {
      const pZone = p.zone.toLowerCase().trim();
      // Match with city
      const matchedCity = ALL_PARAGUAY_CITIES.find(c => {
        const cName = c.name.toLowerCase();
        return pZone.includes(cName) || cName.includes(pZone) || 
               (p.coverageAreas && p.coverageAreas.some(a => a.toLowerCase().includes(cName)));
      });

      if (matchedCity) {
        const entry = map[matchedCity.id];
        if (entry) {
          entry.total += 1;
          entry.profs.push(p);
          if (p.featuredTier && p.featuredTier !== 'none') {
            entry.featured += 1;
          }
        }
      }
    });

    return map;
  }, [professionals]);

  // Total professionals count per department
  const deptProfsCount = useMemo(() => {
    const map: { [deptId: string]: number } = {};
    PARAGUAY_DEPARTMENTS.forEach(d => {
      let total = 0;
      d.cities.forEach(c => {
        total += (cityProfsMap[c.id]?.total || 0);
      });
      map[d.id] = total;
    });
    return map;
  }, [cityProfsMap]);

  // Current selected department object
  const currentSelectedDept = useMemo(() => {
    if (selectedDeptId === 'all') return null;
    return PARAGUAY_DEPARTMENTS.find(d => d.id === selectedDeptId) || null;
  }, [selectedDeptId]);

  // Current selected city object
  const currentSelectedCity = useMemo(() => {
    if (selectedCityId === 'all') return null;
    return ALL_PARAGUAY_CITIES.find(c => c.id === selectedCityId) || null;
  }, [selectedCityId]);

  // Available cities for the city dropdown
  const availableCitiesForDropdown = useMemo(() => {
    if (selectedDeptId === 'all') {
      return ALL_PARAGUAY_CITIES;
    }
    return ALL_PARAGUAY_CITIES.filter(c => c.departmentId === selectedDeptId);
  }, [selectedDeptId]);

  // Synchronize incoming selectedZone prop with department & city selection
  useEffect(() => {
    if (!selectedZone || selectedZone === 'all' || selectedZone === 'Todas las zonas' || selectedZone === 'Todo el Paraguay (Todas las zonas)') {
      return;
    }

    const norm = selectedZone.toLowerCase().trim();

    // 1. Check if matches a city
    const matchedCity = ALL_PARAGUAY_CITIES.find(c => {
      const cName = c.name.toLowerCase();
      return cName === norm || cName.includes(norm) || norm.includes(cName);
    });

    if (matchedCity) {
      setSelectedDeptId(matchedCity.departmentId);
      setSelectedCityId(matchedCity.id);
      return;
    }

    // 2. Check if matches a department
    const matchedDept = PARAGUAY_DEPARTMENTS.find(d => {
      const dName = d.name.toLowerCase();
      return dName.includes(norm) || norm.includes(dName) || d.id.toLowerCase() === norm;
    });

    if (matchedDept) {
      setSelectedDeptId(matchedDept.id);
      setSelectedCityId('all');
    }
  }, [selectedZone]);

  // All featured professionals with assigned coordinates
  const featuredProfessionalsWithCoords = useMemo(() => {
    const list: { prof: ServiceProfessional; city: ParaguayCity; lat: number; lng: number }[] = [];
    const occurrences: { [cityId: string]: number } = {};

    professionals.forEach(p => {
      if (p.featuredTier && p.featuredTier !== 'none') {
        const pZone = p.zone.toLowerCase().trim();
        let matchedCity = ALL_PARAGUAY_CITIES.find(c => {
          const cName = c.name.toLowerCase();
          return pZone.includes(cName) || cName.includes(pZone);
        });

        if (!matchedCity) {
          matchedCity = ALL_PARAGUAY_CITIES.find(c => c.name.toLowerCase().includes('encarnación') || c.id === 'encarnacion');
        }

        if (matchedCity) {
          const count = occurrences[matchedCity.id] || 0;
          occurrences[matchedCity.id] = count + 1;
          
          // Slight natural coordinate offset so multiple featured in the same city don't completely overlap
          const angle = (count * 137.5) * (Math.PI / 180);
          const radius = count === 0 ? 0 : 0.008 + (count * 0.004);
          const lat = matchedCity.lat + (radius * Math.cos(angle));
          const lng = matchedCity.lng + (radius * Math.sin(angle));

          list.push({ prof: p, city: matchedCity, lat, lng });
        }
      }
    });

    return list;
  }, [professionals]);

  // Filtered departments
  const filteredDepartments = useMemo(() => {
    return PARAGUAY_DEPARTMENTS.filter(d => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return d.name.toLowerCase().includes(q) ||
             d.capital.toLowerCase().includes(q) ||
             d.description.toLowerCase().includes(q) ||
             d.cities.some(c => c.name.toLowerCase().includes(q));
    });
  }, [searchQuery]);

  // Filtered cities
  const filteredCities = useMemo(() => {
    return ALL_PARAGUAY_CITIES.filter(c => {
      const matchesDept = selectedDeptId === 'all' || c.departmentId === selectedDeptId;
      if (!matchesDept) return false;
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) ||
             c.departmentName.toLowerCase().includes(q) ||
             (c.nickname && c.nickname.toLowerCase().includes(q));
    });
  }, [selectedDeptId, searchQuery]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Create map centered on Paraguay
    const map = L.map(mapContainerRef.current, {
      center: [-25.30, -57.00], // Centered comfortably to view Central, Asunción, Itapúa, Alto Paraná
      zoom: 7,
      zoomControl: false,
      attributionControl: true,
      minZoom: 5.5,
      maxZoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> • ServiciosYa Paraguay',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    mapInstanceRef.current = map;

    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers: Cities & Featured Professionals with YELLOW STAR
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear city markers
    (Object.values(cityMarkersRef.current) as L.Marker[]).forEach(m => m.remove());
    cityMarkersRef.current = {};

    // Clear featured markers
    (Object.values(featuredMarkersRef.current) as L.Marker[]).forEach(m => m.remove());
    featuredMarkersRef.current = {};

    // 1. RENDER CITIES MARKERS
    const citiesToDisplay = selectedDeptId === 'all'
      ? ALL_PARAGUAY_CITIES
      : ALL_PARAGUAY_CITIES.filter(c => c.departmentId === selectedDeptId);

    citiesToDisplay.forEach(city => {
      const stats = cityProfsMap[city.id] || { total: 0, featured: 0, profs: [] };
      const isSelected = selectedCityId === city.id || selectedZone.toLowerCase() === city.name.toLowerCase();
      const isCap = city.isCapital;
      const hasFeatured = stats.featured > 0;

      const markerHtml = `
        <div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110" id="marker-city-${city.id}">
          <div class="flex items-center justify-center ${
            isCap
              ? 'w-8 h-8 bg-indigo-900 text-amber-300 ring-2 ring-amber-400 shadow-md'
              : isSelected
              ? 'w-8 h-8 bg-indigo-600 text-white ring-4 ring-indigo-300 shadow-md'
              : 'w-6 h-6 bg-slate-700 text-white ring-2 ring-white shadow-xs hover:bg-indigo-700'
          } rounded-full transition-all duration-150">
            ${
              isCap
                ? '<svg class="w-3.5 h-3.5 fill-amber-300 text-amber-300" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                : '<svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="6"/></svg>'
            }
          </div>
          
          ${
            hasFeatured ? `
              <span class="absolute -top-1.5 -left-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-[9px] shadow-sm ring-1 ring-white" title="Tiene ${stats.featured} destacados">
                ★
              </span>
            ` : ''
          }

          ${
            stats.total > 0 ? `
              <span class="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white shadow-2xs ring-1 ring-white">
                ${stats.total}
              </span>
            ` : ''
          }

          <div class="mt-1 px-1.5 py-0.5 rounded-md bg-slate-900/85 backdrop-blur-xs text-[10px] font-bold text-white whitespace-nowrap shadow-xs pointer-events-none border border-slate-700/50 flex items-center gap-1">
            ${city.name}
            ${hasFeatured ? '<span class="text-amber-300">★</span>' : ''}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-city-pin',
        html: markerHtml,
        iconSize: [60, 44],
        iconAnchor: [30, 22],
      });

      const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);

      // Popup
      const popupDiv = document.createElement('div');
      popupDiv.className = 'p-3 font-sans max-w-xs text-left text-slate-800';
      popupDiv.innerHTML = `
        <div class="border-b border-slate-100 pb-2 mb-2">
          <div class="text-[10px] font-bold uppercase tracking-wider text-indigo-600">${city.departmentName}</div>
          <h4 class="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            ${city.name}
            ${city.isCapital ? '<span class="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded-sm">CAPITAL</span>' : ''}
          </h4>
        </div>
        ${city.nickname ? `<p class="text-[11px] text-slate-500 mb-1.5 italic">${city.nickname}</p>` : ''}
        ${city.description ? `<p class="text-[11px] text-slate-600 leading-snug mb-2">${city.description}</p>` : ''}
        
        <div class="space-y-1 my-2">
          <div class="flex items-center justify-between text-xs font-semibold py-1 px-2 rounded-md bg-slate-50 border border-slate-200">
            <span class="text-slate-600">Profesionales registrados:</span>
            <span class="font-bold text-indigo-700">${stats.total}</span>
          </div>
          ${
            stats.featured > 0 ? `
              <div class="flex items-center justify-between text-xs font-semibold py-1 px-2 rounded-md bg-amber-50 border border-amber-200 text-amber-900">
                <span class="flex items-center gap-1">
                  <span class="text-amber-500">★</span> Profesionales Destacados:
                </span>
                <span class="font-bold text-amber-800">${stats.featured}</span>
              </div>
            ` : ''
          }
        </div>

        <div class="mt-2.5">
          <button id="btn-select-city-${city.id}" class="w-full py-1.5 px-3 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer">
            Ver profesionales de ${city.name}
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);
      marker.on('popupopen', () => {
        setActiveMarkerId(city.id);
        setSelectedDeptId(city.departmentId);
        setSelectedCityId(city.id);
        const btn = document.getElementById(`btn-select-city-${city.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectZone(city.name);
            if (onViewDirectory) onViewDirectory();
          };
        }
      });

      cityMarkersRef.current[city.id] = marker;
    });

    // 2. RENDER FEATURED PROFESSIONALS WITH YELLOW STAR (ESTRELLA AMARILLA)
    if (showFeaturedLayer) {
      const featuredToDisplay = selectedDeptId === 'all'
        ? featuredProfessionalsWithCoords
        : featuredProfessionalsWithCoords.filter(f => f.city.departmentId === selectedDeptId);

      featuredToDisplay.forEach(({ prof, city, lat, lng }) => {
        const tierBadge = prof.featuredTier === 'gold' ? 'ORO' : prof.featuredTier === 'silver' ? 'PLATA' : 'BRONCE';

        // High-contrast custom HTML marker with Yellow Star and pulse
        const featuredHtml = `
          <div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-125 z-30" id="marker-featured-${prof.id}">
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black shadow-lg ring-4 ring-amber-300/80 hover:ring-amber-400 animate-bounce duration-1000 border-2 border-white">
              <svg class="w-5 h-5 text-amber-950 fill-amber-900" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div class="mt-1 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black tracking-tight shadow-md border border-amber-300 whitespace-nowrap flex items-center gap-1">
              <span>★</span>
              <span>${prof.trade} • ${prof.name.split(' ')[0]}</span>
            </div>
          </div>
        `;

        const featuredIcon = L.divIcon({
          className: 'custom-featured-pin',
          html: featuredHtml,
          iconSize: [80, 52],
          iconAnchor: [40, 26],
        });

        const featMarker = L.marker([lat, lng], { icon: featuredIcon }).addTo(map);

        // Rich Popup for Featured Professional
        const featPopup = document.createElement('div');
        featPopup.className = 'p-3 font-sans max-w-xs text-left text-slate-800';
        featPopup.innerHTML = `
          <div class="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-black uppercase tracking-wider mb-2">
            <span class="text-amber-600 text-xs">★</span>
            <span>PROFESIONAL DESTACADO ${tierBadge}</span>
          </div>
          
          <div class="flex items-center gap-2.5 mb-2">
            <img 
              src="${prof.avatar}" 
              alt="${prof.name}" 
              class="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-2xs"
            />
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-bold text-slate-900 truncate flex items-center gap-1">
                ${prof.name}
              </h4>
              <p class="text-xs font-semibold text-indigo-700">${prof.trade}</p>
              <div class="flex items-center gap-1 text-[11px] text-slate-500">
                <span class="text-amber-500 font-bold">★ ${prof.rating.toFixed(1)}</span>
                <span>• ${city.name}</span>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between text-[10px] text-slate-600 py-1 px-2 mb-2 rounded bg-slate-50 border border-slate-200 font-medium">
            <span>👁️ <strong>${prof.viewsCount || 0}</strong> miraron sus datos</span>
            <span>💬 <strong>${prof.whatsappClicks || 0}</strong> contactos</span>
          </div>

          <p class="text-[11px] text-slate-600 leading-snug line-clamp-2 mb-2.5">
            ${prof.bio}
          </p>

          <div class="space-y-1.5 pt-1 border-t border-slate-100">
            <a 
              id="map-feat-whatsapp-${prof.id}"
              href="https://wa.me/${prof.whatsapp}?text=${encodeURIComponent(`Hola ${prof.name}, vi tu perfil Destacado en el mapa de ServiciosYa Paraguay y me gustaría pedirte presupuesto para un trabajo de ${prof.trade}.`)}"
              target="_blank"
              rel="noopener noreferrer"
              class="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <span>Contactar al WhatsApp</span>
            </a>
            <button
              id="btn-view-prof-${prof.id}"
              class="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Ver perfil completo
            </button>
          </div>
        `;

        featMarker.bindPopup(featPopup);
        featMarker.on('popupopen', () => {
          setActiveMarkerId(`feat-${prof.id}`);
          const waBtn = document.getElementById(`map-feat-whatsapp-${prof.id}`);
          if (waBtn) {
            waBtn.onclick = () => {
              api.trackWhatsAppClick(prof.id);
            };
          }
          const btn = document.getElementById(`btn-view-prof-${prof.id}`);
          if (btn && onSelectProfessional) {
            btn.onclick = () => onSelectProfessional(prof);
          }
        });

        featuredMarkersRef.current[prof.id] = featMarker;
      });
    }

  }, [cityProfsMap, featuredProfessionalsWithCoords, selectedZone, selectedDeptId, selectedCityId, showFeaturedLayer, onSelectZone, onViewDirectory, onSelectProfessional]);

  // Handle fly to department
  const handleFlyToDept = (dept: ParaguayDepartment) => {
    setSelectedDeptId(dept.id);
    setSelectedCityId('all');
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([dept.lat, dept.lng], dept.zoom, { duration: 1.2 });
    }
  };

  // Handle fly to city
  const handleFlyToCity = (city: ParaguayCity) => {
    setSelectedDeptId(city.departmentId);
    setSelectedCityId(city.id);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([city.lat, city.lng], 13, { duration: 1.2 });
      setTimeout(() => {
        const marker = cityMarkersRef.current[city.id];
        if (marker) marker.openPopup();
      }, 1250);
    }
  };

  // Handle department selector change
  const handleDepartmentChange = (deptId: string) => {
    setSelectedDeptId(deptId);
    setSelectedCityId('all');

    if (deptId === 'all') {
      onSelectZone('all');
      const map = mapInstanceRef.current;
      if (map) {
        map.flyTo([-23.60, -58.00], PARAGUAY_DEFAULT_ZOOM, { duration: 1.0 });
        map.closePopup();
      }
    } else {
      const dept = PARAGUAY_DEPARTMENTS.find(d => d.id === deptId);
      if (dept) {
        onSelectZone(dept.name);
        handleFlyToDept(dept);
      }
    }
  };

  // Handle city selector change
  const handleCityChange = (cityId: string) => {
    setSelectedCityId(cityId);

    if (cityId === 'all') {
      if (selectedDeptId !== 'all') {
        const dept = PARAGUAY_DEPARTMENTS.find(d => d.id === selectedDeptId);
        if (dept) {
          onSelectZone(dept.name);
          handleFlyToDept(dept);
        }
      } else {
        onSelectZone('all');
        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([-23.60, -58.00], PARAGUAY_DEFAULT_ZOOM, { duration: 1.0 });
          map.closePopup();
        }
      }
    } else {
      const city = ALL_PARAGUAY_CITIES.find(c => c.id === cityId);
      if (city) {
        setSelectedDeptId(city.departmentId);
        onSelectZone(city.name);
        handleFlyToCity(city);
      }
    }
  };

  // Handle fly to featured professional
  const handleFlyToFeatured = (feat: { prof: ServiceProfessional; lat: number; lng: number }) => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([feat.lat, feat.lng], 14, { duration: 1.2 });
      setTimeout(() => {
        const marker = featuredMarkersRef.current[feat.prof.id];
        if (marker) marker.openPopup();
      }, 1250);
    }
  };

  // Reset to full country view and clear filters
  const handleResetCountry = () => {
    setSelectedDeptId('all');
    setSelectedCityId('all');
    setSearchQuery('');
    onSelectZone('all');
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([-23.60, -58.00], PARAGUAY_DEFAULT_ZOOM, { duration: 1.0 });
      map.closePopup();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col" id="paraguay-map-container">
      
      {/* Top Header of Map Component */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Mapa Nacional de Servicios • Todo el Paraguay
              </h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                <span>🇵🇾</span> 17 Departamentos + Capital
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Visualizá profesionales por departamento o encontrá los que cuentan con <strong className="text-amber-700">Estrella Amarilla de Destacados ★</strong>.
            </p>
          </div>
        </div>

        {/* Quick Map Controls */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Toggle Yellow Star Layer */}
          <button
            type="button"
            onClick={() => setShowFeaturedLayer(!showFeaturedLayer)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer ${
              showFeaturedLayer
                ? 'bg-amber-100 border-amber-300 text-amber-950'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-600'
            }`}
            title="Mostrar u ocultar profesionales destacados con estrella amarilla en el mapa"
          >
            <Star className={`w-3.5 h-3.5 ${showFeaturedLayer ? 'text-amber-600 fill-amber-400' : 'text-slate-400'}`} />
            <span>Destacados ★ ({featuredProfessionalsWithCoords.length})</span>
          </button>

          {/* Reset country button */}
          <button
            type="button"
            onClick={handleResetCountry}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Centrar mapa en todo el territorio del Paraguay"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Ver Todo el Paraguay</span>
          </button>

          {/* Toggle sidebar button */}
          <button
            type="button"
            onClick={() => setShowSidebar(!showSidebar)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer ${
              showSidebar
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showSidebar ? 'Ocultar Panel' : 'Departamentos y Ciudades'}</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR: FILTRO POR DEPARTAMENTOS Y CIUDADES */}
      <div className="bg-slate-50/95 border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Filter by Department */}
            <div>
              <label htmlFor="map-filter-dept" className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Departamento:</span>
                </span>
                {selectedDeptId !== 'all' && (
                  <span className="text-[10px] font-semibold text-indigo-600">
                    {deptProfsCount[selectedDeptId] || 0} profesionales
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  id="map-filter-dept"
                  value={selectedDeptId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full bg-white text-xs font-semibold text-slate-800 py-2 pl-3 pr-8 rounded-lg border border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs outline-hidden transition-all cursor-pointer truncate"
                >
                  <option value="all">🇵🇾 Todos los Departamentos (17 + Asunción)</option>
                  {PARAGUAY_DEPARTMENTS.map(dept => {
                    const count = deptProfsCount[dept.id] || 0;
                    return (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} {count > 0 ? `(${count} prof.)` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Filter by City / District */}
            <div>
              <label htmlFor="map-filter-city" className="text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ciudad / Distrito:</span>
                </span>
                {selectedCityId !== 'all' && (
                  <span className="text-[10px] font-semibold text-rose-600">
                    {cityProfsMap[selectedCityId]?.total || 0} profesionales
                  </span>
                )}
              </label>
              <div className="relative">
                <select
                  id="map-filter-city"
                  value={selectedCityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full bg-white text-xs font-semibold text-slate-800 py-2 pl-3 pr-8 rounded-lg border border-slate-300 hover:border-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs outline-hidden transition-all cursor-pointer truncate"
                >
                  <option value="all">
                    {selectedDeptId === 'all' 
                      ? `📍 Todas las Ciudades (${ALL_PARAGUAY_CITIES.length})` 
                      : `📍 Todas las ciudades de ${currentSelectedDept?.name || ''}`}
                  </option>
                  {availableCitiesForDropdown.map(city => {
                    const stats = cityProfsMap[city.id];
                    const count = stats?.total || 0;
                    return (
                      <option key={city.id} value={city.id}>
                        {city.name} {count > 0 ? `(${count} prof.)` : ''} {city.isCapital ? '• Capital' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Quick shortcuts and clear button */}
          {(selectedDeptId !== 'all' || selectedCityId !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap md:self-end pt-1 md:pt-0">
              <button
                type="button"
                id="btn-reset-map-filters"
                onClick={handleResetCountry}
                className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Quitar filtros y centrar en todo el país"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Limpiar Filtros</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Department Shortcuts Row */}
        <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-200/80 overflow-x-auto no-scrollbar text-xs">
          <span className="text-[11px] font-bold text-slate-500 shrink-0 uppercase tracking-wider">
            Departamentos:
          </span>
          {[
            { id: 'central', name: 'Central' },
            { id: 'asuncion', name: 'Asunción' },
            { id: 'alto-parana', name: 'Alto Paraná' },
            { id: 'itapua', name: 'Itapúa' },
            { id: 'cordillera', name: 'Cordillera' },
            { id: 'guaira', name: 'Guairá' },
            { id: 'caaguazu', name: 'Caaguazú' }
          ].map(shortcut => {
            const isActive = selectedDeptId === shortcut.id;
            return (
              <button
                key={shortcut.id}
                type="button"
                onClick={() => handleDepartmentChange(shortcut.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium shrink-0 transition-all cursor-pointer border ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-bold'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                {shortcut.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map & Sidebar Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px] relative">
        
        {/* Leaflet Map Canvas */}
        <div className={`relative ${showSidebar ? 'lg:col-span-8' : 'lg:col-span-12'} h-[490px] sm:h-[620px] w-full bg-slate-100`}>
          <div 
            ref={mapContainerRef} 
            className="w-full h-full z-10" 
            style={{ minHeight: '490px' }}
          />

          {/* Floating Pill on top of map */}
          <div className="absolute top-3 left-3 z-20 bg-white/95 backdrop-blur-xs px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs max-w-xs sm:max-w-sm pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 truncate">
                <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="truncate">
                  {selectedCityId !== 'all' 
                    ? `Ciudad: ${currentSelectedCity?.name || selectedZone} (${currentSelectedDept?.name || ''})`
                    : selectedDeptId !== 'all' 
                    ? `Departamento: ${currentSelectedDept?.name || selectedZone}` 
                    : 'Explorando todo el Paraguay 🇵🇾'}
                </span>
              </div>
              {(selectedDeptId !== 'all' || selectedCityId !== 'all') && (
                <button
                  type="button"
                  onClick={handleResetCountry}
                  className="text-slate-400 hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                  title="Restablecer filtros"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-normal mt-0.5 flex items-center gap-1">
              <span>Hacé clic en los pines o en las</span>
              <span className="text-amber-600 font-bold">Estrellas Amarillas ★</span>
              <span>para ver datos directos.</span>
            </div>
          </div>

          {/* Quick jump shortcuts */}
          <div className="absolute bottom-4 left-3 z-20 hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1.5 rounded-xl border border-slate-200 shadow-sm text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Atajos:</span>
            <button
              onClick={() => handleDepartmentChange('asuncion')}
              className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-[11px] font-bold border border-indigo-200 transition-colors cursor-pointer"
            >
              Asunción (Capital)
            </button>
            <button
              onClick={() => handleDepartmentChange('central')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Central
            </button>
            <button
              onClick={() => handleDepartmentChange('alto-parana')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Alto Paraná
            </button>
            <button
              onClick={() => handleDepartmentChange('itapua')}
              className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-medium transition-colors cursor-pointer"
            >
              Itapúa (Encarnación)
            </button>
          </div>
        </div>

        {/* Sidebar: Tabs for DEPARTMENTS, CITIES, and FEATURED PROFESSIONALS */}
        {showSidebar && (
          <div className="lg:col-span-4 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white flex flex-col h-[520px] sm:h-[620px]">
            
            {/* Tab Navigation Header */}
            <div className="p-2 border-b border-slate-200 bg-slate-50 flex items-center gap-1 shrink-0">
              <button
                type="button"
                id="tab-departments-btn"
                onClick={() => setActiveTab('departments')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'departments'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-indigo-600" />
                <span>Departamentos ({PARAGUAY_DEPARTMENTS.length})</span>
              </button>

              <button
                type="button"
                id="tab-cities-btn"
                onClick={() => setActiveTab('cities')}
                className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'cities'
                    ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Ciudades</span>
              </button>

              <button
                type="button"
                id="tab-featured-btn"
                onClick={() => setActiveTab('featured')}
                className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'featured'
                    ? 'bg-amber-100 text-amber-950 shadow-2xs border border-amber-300'
                    : 'text-amber-800 hover:bg-amber-50'
                }`}
                title="Ver profesionales destacados con estrella amarilla"
              >
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-400" />
                <span>Destacados ★</span>
              </button>
            </div>

            {/* Filter Search Input */}
            <div className="p-3 border-b border-slate-200 bg-white space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    activeTab === 'departments'
                      ? 'Buscar departamento o capital...'
                      : activeTab === 'cities'
                      ? 'Buscar ciudad de Paraguay...'
                      : 'Buscar profesional destacado...'
                  }
                  className="w-full pl-8 pr-7 py-1.5 bg-slate-50 hover:bg-white focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-800 transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Department selector if in cities tab */}
              {activeTab === 'cities' && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 shrink-0">Filtrar por Depto:</span>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                    className="w-full text-xs py-1 px-2 rounded border border-slate-200 bg-slate-50 text-slate-700 font-medium outline-hidden cursor-pointer"
                  >
                    <option value="all">Todos los departamentos</option>
                    {PARAGUAY_DEPARTMENTS.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* TAB CONTENT 1: DEPARTAMENTOS */}
            {activeTab === 'departments' && (
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-1.5 space-y-1">
                {filteredDepartments.map((dept) => {
                  const isCurrent = selectedDeptId === dept.id;
                  
                  // Calculate total profs in this department
                  let totalProfs = 0;
                  let featuredProfs = 0;
                  dept.cities.forEach(c => {
                    const stats = cityProfsMap[c.id];
                    if (stats) {
                      totalProfs += stats.total;
                      featuredProfs += stats.featured;
                    }
                  });

                  return (
                    <div
                      key={dept.id}
                      onClick={() => handleDepartmentChange(dept.id)}
                      className={`p-3 rounded-xl transition-all cursor-pointer border ${
                        isCurrent
                          ? 'bg-indigo-50/80 border-indigo-200 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-slate-900">{dept.name}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {dept.badge}
                            </span>
                            {featuredProfs > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-0.5">
                                <span>★</span> {featuredProfs} Destacado{featuredProfs > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                            Capital: <strong className="text-slate-700">{dept.capital}</strong> • {dept.region}
                          </p>

                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                            {dept.description}
                          </p>
                        </div>

                        <div className="flex flex-col items-end shrink-0 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDepartmentChange(dept.id);
                              setActiveTab('cities');
                            }}
                            className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ver Ciudades</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                          <span className="text-[10px] text-slate-500 font-medium mt-1">
                            {dept.cities.length} ciudades
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT 2: CIUDADES */}
            {activeTab === 'cities' && (
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-1.5 space-y-1">
                {filteredCities.map((city) => {
                  const stats = cityProfsMap[city.id] || { total: 0, featured: 0, profs: [] };
                  const isSelected = selectedCityId === city.id || selectedZone.toLowerCase() === city.name.toLowerCase();

                  return (
                    <div
                      key={city.id}
                      className={`p-3 rounded-xl transition-all border flex items-start justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-300 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-slate-100'
                      }`}
                    >
                      <div 
                        onClick={() => handleCityChange(city.id)}
                        className="flex-1 cursor-pointer min-w-0"
                      >
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900">{city.name}</span>
                          {city.isCapital && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                              CAPITAL
                            </span>
                          )}
                          {stats.featured > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 flex items-center gap-0.5">
                              <span>★</span> {stats.featured} Destacado{stats.featured > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate mt-0.5 font-normal">
                          {city.departmentName} {city.nickname ? `• ${city.nickname}` : ''}
                        </p>

                        <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                          {stats.total > 0 ? `${stats.total} profesional${stats.total > 1 ? 'es' : ''}` : 'Sin profesionales aún'}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCityChange(city.id)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>Ubicar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            handleCityChange(city.id);
                            if (onViewDirectory) onViewDirectory();
                          }}
                          className={`px-2 py-1 rounded text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs'
                          }`}
                        >
                          {isSelected ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Activo</span>
                            </>
                          ) : (
                            <>
                              <span>Filtrar</span>
                              <ChevronRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredCities.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <Info className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      No se encontraron ciudades con el criterio actual.
                    </p>
                    <button 
                      onClick={() => { setSelectedDeptId('all'); setSearchQuery(''); }}
                      className="mt-2 text-xs text-indigo-600 font-bold hover:underline"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 3: PROFESIONALES DESTACADOS CON ESTRELLA AMARILLA */}
            {activeTab === 'featured' && (
              <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-1.5 space-y-1.5">
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-600 fill-amber-400 shrink-0" />
                  <span>
                    Estos profesionales han elegido figurar como <strong>Destacados</strong> y aparecen en el mapa con <strong>Estrella Amarilla ★</strong>.
                  </span>
                </div>

                {featuredProfessionalsWithCoords.map(({ prof, city, lat, lng }) => {
                  return (
                    <div
                      key={prof.id}
                      className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 transition-all flex items-start gap-3"
                    >
                      <div className="relative shrink-0">
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-2xs"
                        />
                        <span 
                          title={prof.workStatus === 'busy' ? 'Ocupado' : 'Disponible'}
                          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs ${prof.workStatus === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-slate-900 truncate">{prof.name}</span>
                          <span className="text-amber-500 font-black text-xs">★</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                            prof.workStatus === 'busy' 
                              ? 'bg-amber-100 text-amber-900 border-amber-300' 
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}>
                            {prof.workStatus === 'busy' ? 'Ocupado' : 'Disponible'}
                          </span>
                        </div>
                        
                        <p className="text-xs font-semibold text-indigo-700">{prof.trade}</p>
                        
                        <p className="text-[11px] text-slate-500 font-normal">
                          {city.name} ({city.departmentName})
                        </p>

                        <div className="flex items-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={() => handleFlyToFeatured({ prof, lat, lng })}
                            className="px-2 py-1 rounded bg-amber-200 hover:bg-amber-300 text-amber-950 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Ver en Mapa ★</span>
                          </button>

                          <a
                            href={`https://wa.me/${prof.whatsapp}?text=${encodeURIComponent(`Hola ${prof.name}, vi tu perfil Destacado en ServiciosYa Paraguay y me gustaría consultarte por un trabajo de ${prof.trade}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Footer with summary */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-normal shrink-0">
              República del Paraguay • 17 Departamentos + Asunción
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
