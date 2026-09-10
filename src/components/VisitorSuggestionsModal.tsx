import React, { useState, useEffect } from 'react';
import { 
  X, 
  Lightbulb, 
  ThumbsUp, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  MapPin, 
  MessageSquarePlus, 
  Clock, 
  Check, 
  Filter, 
  Search,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Mail,
  PhoneCall
} from 'lucide-react';
import { VisitorSuggestion, SuggestionType, SuggestionStatus } from '../types';
import { api } from '../services/api';
import { ITAPUA_CITY_NAMES } from '../data/itapuaData';

interface VisitorSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminWhatsApp?: string;
  adminEmail?: string;
  initialQuery?: string;
  suggestionsNotice?: string;
}

const PARAGUAY_ZONES = [
  'Todo el Paraguay',
  'Asunción (Capital)',
  'Central (San Lorenzo, Luque, Lambaré, etc.)',
  'Itapúa (Encarnación y 30 distritos)',
  'Alto Paraná (Ciudad del Este, Pdte. Franco, Hernandarias)',
  'Cordillera (San Bernardino, Caacupé)',
  'Caaguazú (Coronel Oviedo, Caaguazú)',
  'Guairá (Villarrica)',
  'Paraguarí',
  'Misiones',
  'Concepción',
  'San Pedro',
  'Canindeyú',
  'Amambay (Pedro Juan Caballero)',
  'Chaco Paraguayo (Boquerón, Pdte. Hayes, Alto Paraguay)',
  ...ITAPUA_CITY_NAMES.slice(0, 10).map(c => `Itapúa - ${c}`)
];

export const VisitorSuggestionsModal: React.FC<VisitorSuggestionsModalProps> = ({
  isOpen,
  onClose,
  adminWhatsApp = '595975635770',
  adminEmail = 'serviciosyaparaguay@gmail.com',
  initialQuery = '',
  suggestionsNotice,
}) => {
  const cleanWhatsApp = adminWhatsApp.replace(/\D/g, '');
  const formattedWhatsApp = cleanWhatsApp.startsWith('595') && cleanWhatsApp.length >= 11
    ? `+${cleanWhatsApp.slice(0, 3)} ${cleanWhatsApp.slice(3, 6)} ${cleanWhatsApp.slice(6)}`
    : adminWhatsApp;
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('create');
  const [suggestions, setSuggestions] = useState<VisitorSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Local voted tracking
  const [votedIds, setVotedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('serviciosya_voted_suggestions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Form state
  const [formData, setFormData] = useState({
    title: initialQuery || '',
    type: 'oficio' as SuggestionType,
    suggestedZone: 'Todo el Paraguay',
    description: '',
    visitorName: '',
    visitorContact: ''
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Update initial query when prop changes
  useEffect(() => {
    if (initialQuery) {
      setFormData(prev => ({ ...prev, title: initialQuery }));
      setActiveTab('create');
    }
  }, [initialQuery]);

  // Load suggestions on modal open or tab change
  const loadSuggestions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getSuggestions();
      setSuggestions(data);
    } catch (err) {
      console.error('Error al cargar sugerencias:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSuggestions();
      setSubmitSuccess(false);
      setFormError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Por favor indicá el nombre del oficio o servicio que querés sugerir.');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setFormError('Por favor describí brevemente por qué es necesario o qué tareas incluiría (mínimo 10 caracteres).');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const newSug = await api.createSuggestion(formData);
      setSuggestions(prev => [newSug, ...prev]);
      setSubmitSuccess(true);
      // Automatically record as voted by creator
      const updatedVoted = [...votedIds, newSug.id];
      setVotedIds(updatedVoted);
      localStorage.setItem('serviciosya_voted_suggestions', JSON.stringify(updatedVoted));

      // Reset form
      setFormData({
        title: '',
        type: 'oficio',
        suggestedZone: 'Todo el Paraguay',
        description: '',
        visitorName: '',
        visitorContact: ''
      });
    } catch (err: any) {
      setFormError(err.message || 'Error al enviar la sugerencia');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string) => {
    if (votedIds.includes(id)) return;

    try {
      const res = await api.voteSuggestion(id);
      if (res.success) {
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, votesCount: res.votesCount } : s));
        const updatedVoted = [...votedIds, id];
        setVotedIds(updatedVoted);
        localStorage.setItem('serviciosya_voted_suggestions', JSON.stringify(updatedVoted));
      }
    } catch (err) {
      console.error('Error al votar:', err);
    }
  };

  // Filtered suggestions for the wall
  const filteredSuggestions = suggestions.filter(s => {
    if (filterType !== 'all' && s.type !== filterType) return false;
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = s.title.toLowerCase().includes(q);
      const inDesc = s.description.toLowerCase().includes(q);
      const inZone = s.suggestedZone?.toLowerCase().includes(q);
      return inTitle || inDesc || inZone;
    }
    return true;
  });

  const getStatusBadge = (status: SuggestionStatus) => {
    switch (status) {
      case 'implemented':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            ¡Incorporado a ServiciosYa! 🎉
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-3 h-3 text-indigo-600" />
            Aprobado para sumar
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            En Evaluación
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <Lightbulb className="w-3 h-3 text-slate-500" />
            Propuesto
          </span>
        );
    }
  };

  const getTypeLabel = (type: SuggestionType) => {
    switch (type) {
      case 'oficio': return 'Oficio / Profesión';
      case 'servicio': return 'Servicio del Hogar';
      case 'ciudad': return 'Nueva Ciudad / Zona';
      case 'rubro': return 'Rubro Comercial';
      default: return 'Otra Sugerencia';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  Buzón de Sugerencias de la Comunidad
                </h2>
                <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tu Opinión Cuenta
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal">
                ¿Buscás un oficio o servicio que todavía no está en la web? Proponelo y ayudanos a seguir expandiendo ServiciosYa en todo Paraguay.
              </p>
            </div>
          </div>

          {/* Quick Notice: WhatsApp & Email for suggestions or complaints */}
          <div className="mt-4 p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex flex-col gap-0.5 text-amber-200">
              <div className="flex items-center gap-2">
                <span className="font-bold text-amber-300">Sugerencias o Quejas:</span>
                <span className="text-[11px] text-slate-200">Atención personalizada por WhatsApp o Correo</span>
              </div>
              {suggestionsNotice && (
                <p className="text-[11px] text-amber-200/90 italic mt-0.5">{suggestionsNotice}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Hola ServiciosYa! Me comunico para enviar una sugerencia / queja sobre la plataforma.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp: {formattedWhatsApp}</span>
              </a>
              <a
                href={`mailto:${adminEmail}?subject=${encodeURIComponent('Sugerencia o Queja - ServiciosYa')}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors border border-slate-700"
              >
                <Mail className="w-3 h-3 text-amber-400" />
                <span>{adminEmail}</span>
              </a>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-800">
            <button
              onClick={() => { setActiveTab('create'); setSubmitSuccess(false); }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>Proponer Nuevo Servicio u Oficio</span>
            </button>

            <button
              onClick={() => setActiveTab('browse')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'browse'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Ver y Votar Sugerencias ({suggestions.length})</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50">
          
          {/* TAB 1: FORM TO PROPOSE A SERVICE OR TRADE */}
          {activeTab === 'create' && (
            <div className="max-w-xl mx-auto space-y-4">
              {submitSuccess ? (
                <div className="bg-white rounded-xl p-6 text-center border border-emerald-200 shadow-xs space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    ¡Muchas gracias por tu sugerencia!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-normal leading-relaxed">
                    Tu propuesta fue registrada en el buzón comunitario y ya está visible para que otros visitantes puedan votarla. Nuestro equipo de administración la revisará para sumar profesionales de ese rubro.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-3">
                    <button
                      type="button"
                      onClick={() => setActiveTab('browse')}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      Ver Sugerencias y Votos
                    </button>
                    <button
                      type="button"
                      onClick={() => setSubmitSuccess(false)}
                      className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Proponer otro servicio
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                  {formError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Title of the trade/service */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ¿Qué oficio, profesión o servicio sugerís agregar? <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ej: Instalador de Paneles Solares, Técnico de Piscinas, Tapicero, etc."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>

                  {/* Type and Zone in grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Tipo de Propuesta
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as SuggestionType })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                      >
                        <option value="oficio">Oficio Técnico / Tradicional</option>
                        <option value="servicio">Servicio del Hogar o Mantenimiento</option>
                        <option value="ciudad">Nueva Ciudad / Departamento</option>
                        <option value="rubro">Rubro Comercial / Independiente</option>
                        <option value="otro">Otra Sugerencia General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1">
                        Zona donde lo necesitas
                      </label>
                      <select
                        value={formData.suggestedZone}
                        onChange={(e) => setFormData({ ...formData, suggestedZone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                      >
                        {PARAGUAY_ZONES.map((zone, idx) => (
                          <option key={idx} value={zone}>{zone}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Description / Reasoning */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      ¿Por qué es necesario o qué tareas abarcaría? <span className="text-rose-500">*</span>
                    </label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Ej: En mi zona hay mucha demanda para limpiar y mantener piscinas en verano, o instalar calefones solares. Sería muy útil poder contactar a profesionales calificados con referencias por WhatsApp."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all"
                    />
                  </div>

                  {/* Optional user contact */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tu nombre o apodo (opcional)
                      </label>
                      <input 
                        type="text"
                        placeholder="Ej: Marcelo R."
                        value={formData.visitorName}
                        onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        Tu WhatsApp (opcional, para avisarte)
                      </label>
                      <input 
                        type="tel"
                        placeholder="Ej: 0981 123 456"
                        value={formData.visitorContact}
                        onChange={(e) => setFormData({ ...formData, visitorContact: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 font-normal">
                    🔒 Tus datos de contacto son opcionales y se utilizarán únicamente para notificarte cuando el oficio sea incorporado.
                  </p>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Enviando propuesta...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar Sugerencia al Directorio</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* Direct WhatsApp and Email Contact Card for suggestions or complaints */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 rounded-xl p-4 border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0 shadow-xs">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs sm:text-sm font-bold text-slate-900">
                      Contacto para Sugerencias, Dudas o Quejas
                    </div>
                    <div className="text-xs text-slate-600 font-normal mt-0.5 leading-relaxed">
                      ¿Querés comunicarte de forma directa con nosotros para hacernos llegar una sugerencia de oficio, consulta o queja? Ponemos a tu disposición nuestros canales oficiales de atención:
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-emerald-200/60">
                  <a 
                    href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Hola ServiciosYa Paraguay! Me comunico para enviar una sugerencia / queja / consulta sobre la plataforma.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp: {formattedWhatsApp}</span>
                  </a>

                  <a 
                    href={`mailto:${adminEmail}?subject=${encodeURIComponent('Sugerencia o Queja - ServiciosYa Paraguay')}`}
                    className="p-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-amber-400" />
                    <span>{adminEmail}</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROWSE & VOTE ON SUGGESTIONS */}
          {activeTab === 'browse' && (
            <div className="space-y-4">
              
              {/* Controls bar: search & filters */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input 
                      type="text"
                      placeholder="Buscar entre sugerencias de la gente..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="pending">Propuestos</option>
                      <option value="reviewing">En Evaluación</option>
                      <option value="approved">Aprobados</option>
                      <option value="implemented">¡Incorporados!</option>
                    </select>

                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
                    >
                      <option value="all">Todos los Tipos</option>
                      <option value="oficio">Oficios</option>
                      <option value="servicio">Servicios</option>
                      <option value="ciudad">Zonas / Ciudades</option>
                      <option value="rubro">Rubros</option>
                    </select>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Mostrando <strong>{filteredSuggestions.length}</strong> sugerencias de la comunidad</span>
                  <button 
                    onClick={() => { setActiveTab('create'); setSubmitSuccess(false); }}
                    className="text-indigo-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>+ Proponer otra sugerencia</span>
                  </button>
                </div>
              </div>

              {/* Suggestions Cards List */}
              {isLoading ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Cargando sugerencias de la comunidad...
                </div>
              ) : filteredSuggestions.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center border border-slate-200 space-y-3">
                  <Lightbulb className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-800">
                    No se encontraron sugerencias con los filtros aplicados
                  </div>
                  <p className="text-xs text-slate-500 font-normal">
                    Sé el primero en proponer este rubro para que nuestra comunidad lo vote.
                  </p>
                  <button
                    onClick={() => { setActiveTab('create'); setSubmitSuccess(false); }}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Proponer este Oficio o Servicio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredSuggestions.map((sug) => {
                    const hasVoted = votedIds.includes(sug.id);
                    return (
                      <div 
                        key={sug.id}
                        className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-extrabold text-slate-900">
                                {sug.title}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                {getTypeLabel(sug.type)}
                              </span>
                              {getStatusBadge(sug.status)}
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-rose-500" />
                                {sug.suggestedZone}
                              </span>
                              <span>•</span>
                              <span>Propuesto por {sug.visitorName || 'Visitante de la web'}</span>
                            </div>
                          </div>

                          {/* Upvote button */}
                          <button
                            onClick={() => handleVote(sug.id)}
                            disabled={hasVoted}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                              hasVoted
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs cursor-default'
                                : 'bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 hover:scale-102 active:scale-95'
                            }`}
                            title={hasVoted ? 'Ya apoyaste esta sugerencia' : 'Votar y apoyar esta sugerencia'}
                          >
                            <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-indigo-600 text-indigo-600' : ''}`} />
                            <span>{sug.votesCount}</span>
                            <span className="hidden sm:inline">{hasVoted ? 'Apoyado' : 'Apoyar'}</span>
                          </button>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
                          {sug.description}
                        </p>

                        {/* Admin Feedback note if available */}
                        {sug.adminNotes && (
                          <div className="bg-indigo-50/60 rounded-lg p-2.5 border border-indigo-100 flex items-start gap-2 text-[11px]">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-indigo-950">Respuesta de ServiciosYa: </span>
                              <span className="text-indigo-800 font-normal">{sug.adminNotes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-white border-t border-slate-200 p-3.5 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Las sugerencias más votadas son priorizadas para incorporar profesionales.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
