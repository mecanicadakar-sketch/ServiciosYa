import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  MessageCircle, 
  Plus, 
  Bell, 
  Search, 
  Filter, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  X,
  Send,
  Building2,
  Calendar
} from 'lucide-react';
import { ServiceJobRequest, TradeCategory } from '../types';
import { ALL_TRADES, INITIAL_ZONES } from '../data/seedData';
import { api } from '../services/api';

interface JobRequestsBoardProps {
  jobs: ServiceJobRequest[];
  onRefreshJobs: () => void;
  onOpenCreateJobModal?: () => void;
  onDemoContact?: (title: string) => void;
}

export const JobRequestsBoard: React.FC<JobRequestsBoardProps> = ({
  jobs,
  onRefreshJobs,
  onOpenCreateJobModal,
  onDemoContact,
}) => {
  const [selectedTrade, setSelectedTrade] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);

  // Form State for creating job
  const [formTitle, setFormTitle] = useState('');
  const [formTrade, setFormTrade] = useState<TradeCategory>('Plomero');
  const [formZone, setFormZone] = useState('Encarnación');
  const [formClientName, setFormClientName] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formBudget, setFormBudget] = useState('');
  const [formUrgency, setFormUrgency] = useState<'hoy' | 'esta_semana' | 'flexible'>('hoy');
  const [formDescription, setFormDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Form State for beBee style alert
  const [alertTrade, setAlertTrade] = useState<TradeCategory>('Electricista');
  const [alertZone, setAlertZone] = useState('Encarnación');
  const [alertPhone, setAlertPhone] = useState('');
  const [alertSaved, setAlertSaved] = useState(false);

  // Filtered jobs
  const filteredJobs = jobs.filter((job) => {
    if (selectedTrade !== 'all' && job.trade.toLowerCase() !== selectedTrade.toLowerCase()) {
      return false;
    }
    if (selectedZone !== 'all' && !job.zone.toLowerCase().includes(selectedZone.toLowerCase())) {
      return false;
    }
    if (selectedUrgency !== 'all' && job.urgency !== selectedUrgency) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchDesc = job.description.toLowerCase().includes(q);
      const matchZone = job.zone.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchZone) return false;
    }
    return true;
  });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formClientPhone.trim() || !formClientName.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createJob({
        title: formTitle.trim(),
        trade: formTrade,
        zone: formZone,
        clientName: formClientName.trim(),
        clientPhone: formClientPhone.trim(),
        budgetGs: formBudget.trim() ? (formBudget.startsWith('Gs.') ? formBudget : `Gs. ${formBudget}`) : 'A convenir',
        urgency: formUrgency,
        description: formDescription.trim() || 'Sin detalles adicionales'
      });

      setSubmitSuccess(true);
      onRefreshJobs();
      setTimeout(() => {
        setSubmitSuccess(false);
        setShowCreateModal(false);
        setFormTitle('');
        setFormDescription('');
        setFormBudget('');
        setFormClientPhone('');
      }, 1500);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppContact = (job: ServiceJobRequest) => {
    if (job.isDemo || job.title.includes('(Demo)')) {
      if (onDemoContact) {
        onDemoContact(job.title);
      }
      return;
    }
    api.respondJob(job.id);
    const cleanPhone = job.clientPhone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `¡Hola ${job.clientName}! Vi tu solicitud en ServiciosYa Itapúa: "${job.title}". Te escribo porque realizo trabajos de ${job.trade} en ${job.zone} y me gustaría pasarte presupuesto. ¿Sigue disponible?`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const getUrgencyBadge = (urgency: 'hoy' | 'esta_semana' | 'flexible') => {
    switch (urgency) {
      case 'hoy':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
            🚨 Urgente Hoy
          </span>
        );
      case 'esta_semana':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            ⏰ Esta semana
          </span>
        );
      case 'flexible':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            🗓️ Sin apuro
          </span>
        );
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 1) return 'Hace unos minutos';
      if (diffHours === 1) return 'Hace 1 hora';
      if (diffHours < 24) return `Hace ${diffHours} horas`;
      const diffDays = Math.floor(diffHours / 24);
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } catch {
      return 'Reciente';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - beBee inspired */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold mb-3 backdrop-blur-xs border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Mercado de Trabajo Local • Todo el Paraguay</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Bolsa de Pedidos de Trabajo y Servicios en Paraguay
            </h2>
            <p className="mt-2 text-slate-300 text-xs sm:text-sm leading-relaxed">
              Vecinos y empresas publican lo que necesitan en Asunción, Central, Alto Paraná, Itapúa y todo el país. Los profesionales responden con presupuestos en Gs. de forma directa vía WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <button
              id="btn-open-create-job"
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Publicar Pedido (Gratis)</span>
            </button>
            <button
              id="btn-open-job-alert"
              onClick={() => setShowAlertModal(true)}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
            >
              <Bell className="w-4 h-4 text-amber-300" />
              <span>Crear Alerta WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Briefcase className="w-4 h-4 text-indigo-400 shrink-0" />
            <span><strong>{jobs.length}</strong> pedidos activos</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Presupuestos en Gs.</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <span>17 Departamentos + Asunción</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <MessageCircle className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Contacto directo WhatsApp</span>
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search bar */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar pedido (ej. aire, pérdida de agua, pintura)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all text-slate-800"
            />
          </div>

          {/* Trade filter */}
          <div className="md:col-span-3">
            <select
              value={selectedTrade}
              onChange={(e) => setSelectedTrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all text-slate-800 cursor-pointer"
            >
              <option value="all">Todos los Oficios</option>
              {ALL_TRADES.map((t) => (
                <option key={t.category} value={t.category}>{t.category}</option>
              ))}
            </select>
          </div>

          {/* Zone filter */}
          <div className="md:col-span-3">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all text-slate-800 cursor-pointer"
            >
              <option value="all">Todas las Zonas de Itapúa</option>
              {INITIAL_ZONES.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Urgency filter */}
          <div className="md:col-span-2">
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all text-slate-800 cursor-pointer"
            >
              <option value="all">Cualquier Urgencia</option>
              <option value="hoy">🚨 Urgente Hoy</option>
              <option value="esta_semana">⏰ Esta semana</option>
              <option value="flexible">🗓️ Sin apuro</option>
            </select>
          </div>

        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
          <span>Mostrando <strong>{filteredJobs.length}</strong> solicitudes de clientes en Itapúa</span>
          <span>Actualización en tiempo real</span>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-dashed border-slate-300">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No se encontraron pedidos con estos filtros</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Probá seleccionando "Todos los Oficios" o publicá una nueva solicitud para que profesionales te contacten.
            </p>
            <button
              onClick={() => { setSelectedTrade('all'); setSelectedZone('all'); setSelectedUrgency('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:shadow-sm hover:border-indigo-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with trade badge, urgency and time */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {job.trade}
                      </span>
                      {(job.isDemo || job.title.includes('(Demo)')) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300 uppercase">
                          Muestra Demo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getUrgencyBadge(job.urgency)}
                      <span className="text-[11px] text-slate-400 font-normal">
                        {formatRelativeTime(job.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                    {job.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4 font-normal">
                    {job.description}
                  </p>

                  {/* Location & Client */}
                  <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs mb-4">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="flex items-center gap-1 text-[11px] text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <strong>Zona:</strong> {job.zone}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Cliente: <strong>{job.clientName}</strong>
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-[11px] text-slate-500">Presupuesto estimado:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-200">
                        {job.budgetGs}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                  <span className="text-[11px] text-slate-400">
                    {job.responsesCount ? `${job.responsesCount} profesionales respondieron` : 'Sé el primero en contactar'}
                  </span>

                  <button
                    id={`btn-contact-job-${job.id}`}
                    onClick={() => handleWhatsAppContact(job)}
                    className={`px-3.5 py-2 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                      (job.isDemo || job.title.includes('(Demo)'))
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{(job.isDemo || job.title.includes('(Demo)')) ? 'Pasar Presupuesto (Demo)' : 'Pasar Presupuesto WhatsApp'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Publicar Pedido de Trabajo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl border border-slate-200 p-6 overflow-hidden relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Sin comisiones • Contacto 100% directo</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                Publicar Pedido de Trabajo en Itapúa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Describí qué necesitas para que los trabajadores de tu zona te escriban con presupuesto en Gs.
              </p>
            </div>

            {submitSuccess ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900">¡Pedido publicado con éxito!</h4>
                <p className="text-xs text-slate-500">
                  Tu solicitud ya está visible en el muro de Itapúa. Los profesionales te contactarán al WhatsApp indicado.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateJob} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ¿Qué trabajo necesitas? *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Ej: Cambio de caño de agua en baño principal"
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Oficio requerido *
                    </label>
                    <select
                      value={formTrade}
                      onChange={(e) => setFormTrade(e.target.value as TradeCategory)}
                      className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all cursor-pointer"
                    >
                      {ALL_TRADES.map((t) => (
                        <option key={t.category} value={t.category}>{t.category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Ciudad / Barrio *
                    </label>
                    <select
                      value={formZone}
                      onChange={(e) => setFormZone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all cursor-pointer"
                    >
                      {INITIAL_ZONES.map((z) => (
                        <option key={z} value={z}>{z}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tu Nombre o Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      placeholder="Ej: Lic. Carlos Bogado"
                      className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      WhatsApp para recibir presupuestos *
                    </label>
                    <input
                      type="text"
                      required
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      placeholder="0985 123456"
                      className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Presupuesto Estimado (Gs.)
                    </label>
                    <input
                      type="text"
                      value={formBudget}
                      onChange={(e) => setFormBudget(e.target.value)}
                      placeholder="Ej: Gs. 250.000 (o vacío: A convenir)"
                      className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ¿Para cuándo lo precisas?
                    </label>
                    <select
                      value={formUrgency}
                      onChange={(e) => setFormUrgency(e.target.value as 'hoy' | 'esta_semana' | 'flexible')}
                      className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all cursor-pointer"
                    >
                      <option value="hoy">🚨 Urgente Hoy mismo</option>
                      <option value="esta_semana">⏰ En estos días / Esta semana</option>
                      <option value="flexible">🗓️ Sin apuro / Consulta</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detalles y especificaciones adicionales
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Contá brevemente qué materiales se necesitan o si el profesional debe traer repuestos..."
                    className="w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Publicando...' : 'Publicar Solicitud'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Alerta de Empleo/Trabajo (beBee style) */}
      {showAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-200 p-6 overflow-hidden relative">
            <button
              onClick={() => setShowAlertModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2">
                <Bell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Alerta de Trabajos • Todo el Paraguay
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Recibí un aviso directo en tu WhatsApp cuando un vecino o empresa publique un pedido de tu oficio.
              </p>
            </div>

            {alertSaved ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">¡Alerta Activada!</h4>
                <p className="text-xs text-slate-500">
                  Te avisaremos al WhatsApp cuando se publiquen nuevos pedidos de <strong>{alertTrade}</strong> en <strong>{alertZone}</strong>.
                </p>
                <button
                  onClick={() => { setAlertSaved(false); setShowAlertModal(false); }}
                  className="mt-3 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                >
                  Entendido
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tu Oficio / Profesión</label>
                  <select
                    value={alertTrade}
                    onChange={(e) => setAlertTrade(e.target.value as TradeCategory)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 font-medium text-slate-900"
                  >
                    {ALL_TRADES.map((t) => (
                      <option key={t.category} value={t.category}>{t.category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Zona / Ciudad preferida</label>
                  <select
                    value={alertZone}
                    onChange={(e) => setAlertZone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 font-medium text-slate-900"
                  >
                    {INITIAL_ZONES.map((z) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tu Número de WhatsApp</label>
                  <input
                    type="text"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    placeholder="Ej: 0985 123456"
                    className="w-full px-3 py-2 bg-slate-50 text-xs rounded-lg border border-slate-200 font-medium text-slate-900"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAlertModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlertSaved(true)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Activar Alerta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
