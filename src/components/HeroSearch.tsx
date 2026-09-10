import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Sparkles, 
  MapPin, 
  Filter, 
  ChevronDown, 
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Lightbulb,
  Zap
} from 'lucide-react';
import heroBgImage from '../assets/images/hero_service_team_1788614260494.jpg';
import { ALL_TRADES } from '../data/seedData';
import { PARAGUAY_DEPARTMENTS } from '../data/paraguayData';

interface HeroSearchProps {
  // Support both prop naming styles
  searchQuery?: string;
  searchTerm?: string;
  onSearchChange?: (s: string) => void;
  setSearchTerm?: (s: string) => void;
  selectedTrade: string;
  onTradeChange?: (t: string) => void;
  setSelectedTrade?: (t: string) => void;
  selectedZone: string;
  onZoneChange?: (z: string) => void;
  setSelectedZone?: (z: string) => void;
  onTriggerAiSearch?: (queryText: string) => void;
  onOpenAiSearch?: (queryText: string) => void;
  onOpenMap?: () => void;
  onOpenJobs?: () => void;
  onOpenSuggestions?: (query?: string) => void;
  onOpenPricing?: () => void;
  totalProfessionalsCount?: number;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  searchQuery,
  searchTerm,
  onSearchChange,
  setSearchTerm,
  selectedTrade,
  onTradeChange,
  setSelectedTrade,
  selectedZone,
  onZoneChange,
  setSelectedZone,
  onTriggerAiSearch,
  onOpenAiSearch,
  onOpenMap,
  onOpenJobs,
  onOpenSuggestions,
  onOpenPricing,
  totalProfessionalsCount = 18,
}) => {
  const activeQuery = searchQuery !== undefined ? searchQuery : (searchTerm || '');
  const [localInput, setLocalInput] = useState(activeQuery);

  useEffect(() => {
    setLocalInput(activeQuery);
  }, [activeQuery]);

  const updateSearch = (val: string) => {
    if (onSearchChange) onSearchChange(val);
    if (setSearchTerm) setSearchTerm(val);
  };

  const updateTrade = (trade: string) => {
    if (onTradeChange) onTradeChange(trade);
    if (setSelectedTrade) setSelectedTrade(trade);
  };

  const updateZone = (zone: string) => {
    if (onZoneChange) onZoneChange(zone);
    if (setSelectedZone) setSelectedZone(zone);
  };

  const triggerAi = (queryText: string) => {
    if (onTriggerAiSearch) onTriggerAiSearch(queryText);
    else if (onOpenAiSearch) onOpenAiSearch(queryText);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearch(localInput);
  };

  const handleAiSearchTrigger = () => {
    if (localInput.trim()) {
      triggerAi(localInput);
    } else {
      triggerAi('Necesito un profesional de confianza para solucionar un problema en mi hogar en Paraguay');
    }
  };

  // Quick problem ideas for users to try with 1 click
  const quickIdeas = [
    { label: 'Pérdida de agua o canilla rota', trade: 'Plomero' },
    { label: 'Se corta la luz / Salta disyuntor ANDE', trade: 'Electricista' },
    { label: 'Corte de pasto y poda en quintas', trade: 'Jardinería' },
    { label: 'Cuidar nenes en Encarnación', trade: 'Niñeras' },
    { label: 'Comida casera para eventos', trade: 'Cocineras' },
    { label: 'Colocar cerámicos o quincho', trade: 'Albañiles' },
    { label: 'Mueble a medida para cocina', trade: 'Carpintero' },
    { label: 'Llave trabada / Cerrajero 24h', trade: 'Cerrajería' },
  ];

  return (
    <section className="relative overflow-hidden bg-slate-50 pt-7 pb-9 border-b border-slate-200">
      
      {/* Background with clearly visible yet soft muted visibility of the trade professionals */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
        <img
          src={heroBgImage}
          alt="Profesionales de oficios ServiciosYa"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center sm:object-[center_10%] md:object-[center_8%] sm:-translate-y-8 md:-translate-y-16 lg:-translate-y-20 scale-105 opacity-75 filter contrast-[1.08]"
        />
        {/* Soft fading overlay for crisp typography contrast while keeping the professionals group clearly visible */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/15 via-slate-50/45 to-slate-50/95" />
      </div>

      {/* Subtle background decorative shapes */}
      <div className="absolute top-0 right-1/4 -mt-12 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -mb-12 w-96 h-96 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title & Eyebrow */}
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2 shadow-2xs">
            <span className="text-sm">🇵🇾</span>
            <span>Todo el Paraguay • Contacto directo por WhatsApp en los 17 Departamentos</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Encontrá al profesional ideal para tu hogar en <span className="text-indigo-900">Servicios<span className="text-indigo-500">Ya</span></span> <span className="text-indigo-600 font-extrabold">Paraguay</span>
          </h1>

          <p className="mt-1.5 text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
            Plomeros, electricistas, carpinteros, jardineros, niñeras y más en Asunción, Central, Alto Paraná, Itapúa y todo el país.
          </p>

          <div className="mt-2.5 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Perfiles Verificados
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
              Presupuestos en Guaraníes vía WhatsApp
            </span>
            <span className="text-slate-300 hidden sm:inline">•</span>
            {onOpenMap && (
              <button
                type="button"
                onClick={onOpenMap}
                className="flex items-center gap-1.5 text-indigo-700 font-semibold hover:underline bg-indigo-50 border border-indigo-200/70 px-2.5 py-0.5 rounded-full"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Ver Mapa Nacional Interactivo</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Box Card - Compact and sleek to reveal background workers */}
        <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-xs rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-200/90">
          
          {/* Main search form */}
          <form onSubmit={handleFormSubmit} className="space-y-2.5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
              
              {/* Intelligent text input */}
              <div className="md:col-span-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="smart-search-input"
                  type="text"
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  placeholder="¿Qué oficio estás buscando? (ej. Plomero Urgente)"
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-800 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                />
              </div>

              {/* LISTA DESPLEGABLE PARA BUSCAR POR OFICIO */}
              <div className="md:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-indigo-600" />
                </div>
                <select
                  id="trade-dropdown-select"
                  value={selectedTrade}
                  onChange={(e) => updateTrade(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-800 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden appearance-none transition-all cursor-pointer"
                >
                  <option value="all">Todos los Oficios</option>
                  <option value="Todos">Todos los Oficios</option>
                  {ALL_TRADES.map((trade) => (
                    <option key={trade.category} value={trade.category}>
                      {trade.category}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Zona / Ubicación dropdown */}
              <div className="md:col-span-3 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-4 w-4 text-slate-400" />
                </div>
                <select
                  id="zone-dropdown-select"
                  value={selectedZone}
                  onChange={(e) => updateZone(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-800 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden appearance-none transition-all cursor-pointer"
                >
                  <option value="all">Todo el Paraguay (Todas las zonas)</option>
                  <option value="Todas las zonas">Todo el Paraguay (Todas las zonas)</option>
                  {PARAGUAY_DEPARTMENTS.map((dept) => (
                    <optgroup key={dept.id} label={`${dept.name} (${dept.badge})`}>
                      <option value={dept.name}>Todo {dept.name}</option>
                      {dept.cities.map((city) => (
                        <option key={city.id} value={city.name}>
                          {city.name} {city.isCapital ? '• Capital' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
              </div>

            </div>

            {/* Action buttons row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1.5">
              <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 w-full sm:w-auto">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>¿Dudas? Describí tu problema y consultá con IA:</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {/* AI diagnosis button */}
                <button
                  id="btn-ai-search-assistant"
                  type="button"
                  onClick={handleAiSearchTrigger}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Asistente IA
                </button>

                {/* Main Search apply button */}
                <button
                  id="btn-submit-search"
                  type="submit"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs shadow-indigo-100 transition-all hover:scale-[1.01]"
                >
                  <Search className="w-3.5 h-3.5 text-white" />
                  Buscar Profesionales
                </button>
              </div>
            </div>
          </form>

          {/* Quick problem chips */}
          <div className="mt-2.5 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Consultas frecuentes rápidas:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {onOpenPricing && (
                  <button
                    type="button"
                    id="hero-pricing-btn"
                    onClick={onOpenPricing}
                    className="text-[10px] sm:text-[11px] bg-indigo-50 hover:bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-md border border-indigo-200/80 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                    title="Ver tarifario oficial de planes y destacados"
                  >
                    <Zap className="w-3 h-3 text-amber-500 fill-amber-400" />
                    <span>Costes y Tarifas (Gs.)</span>
                  </button>
                )}
                {onOpenSuggestions && (
                  <button
                    type="button"
                    id="hero-suggest-service-btn"
                    onClick={() => onOpenSuggestions(localInput)}
                    className="text-[10px] sm:text-[11px] bg-amber-50 hover:bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md border border-amber-200/80 transition-colors font-semibold flex items-center gap-1 cursor-pointer"
                    title="¿Buscás un rubro que no figura en la web? Proponelo aquí"
                  >
                    <Lightbulb className="w-3 h-3 text-amber-600 fill-amber-500" />
                    <span>💡 ¿Falta algún oficio? Sugerilo aquí</span>
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {quickIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  id={`quick-idea-${idx}`}
                  type="button"
                  onClick={() => {
                    setLocalInput(idea.label);
                    updateSearch(idea.label);
                    updateTrade(idea.trade);
                  }}
                  className="text-[11px] bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors font-medium flex items-center gap-1"
                >
                  <span>{idea.label}</span>
                  <ArrowRight className="w-2.5 h-2.5 opacity-40" />
                </button>
              ))}
            </div>
          </div>

          {/* beBee style Job requests shortcut banner */}
          {onOpenJobs && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 text-[11px] sm:text-xs">
                <span className="p-1 rounded-md bg-emerald-100 text-emerald-700">
                  <Briefcase className="w-3.5 h-3.5" />
                </span>
                <span>¿Precisas un presupuesto a medida? Mirá la <strong>Bolsa de Pedidos de Trabajo en Paraguay</strong> o publicá el tuyo gratis.</span>
              </div>
              <button
                type="button"
                onClick={onOpenJobs}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <span>Ver Pedidos</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

        </div>

        {/* Category Icons Row */}
        <div className="mt-7 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Categorías Principales
            </h3>
            {selectedTrade !== 'all' && selectedTrade !== 'Todos' && (
              <button
                id="reset-category-filter"
                onClick={() => updateTrade('all')}
                className="text-xs text-indigo-600 font-semibold hover:underline"
              >
                Ver todos los oficios
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
            {ALL_TRADES.slice(0, 8).map((trade) => {
              const isSelected = selectedTrade === trade.category;
              return (
                <button
                  key={trade.category}
                  id={`trade-chip-${trade.category}`}
                  onClick={() => updateTrade(isSelected ? 'all' : trade.category)}
                  className={`p-2.5 rounded-lg flex flex-col items-center justify-center text-center transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold ring-2 ring-indigo-600'
                      : 'bg-white hover:bg-indigo-50/50 text-slate-700 border border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  <span className="text-xs font-medium leading-tight line-clamp-1">
                    {trade.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

