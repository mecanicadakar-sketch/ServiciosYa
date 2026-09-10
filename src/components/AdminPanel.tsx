import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Coins, 
  Megaphone, 
  Users, 
  Eye, 
  MessageCircle, 
  Sparkles, 
  Save, 
  Plus, 
  Trash2, 
  Edit3, 
  Award, 
  Star, 
  MapPin, 
  Phone,
  PhoneCall,
  Settings,
  BarChart3,
  ExternalLink,
  Search,
  Check,
  Lightbulb,
  ThumbsUp,
  Send,
  CreditCard,
  Landmark,
  QrCode,
  Smartphone,
  Mail,
  FileText,
  Copy,
  RotateCcw,
  ShieldAlert,
  Lock,
  Unlock,
  Ban,
  Activity,
  RefreshCw
} from 'lucide-react';
import { ServiceProfessional, AdminSettings, SponsorBanner, FeaturedTier, VisitorSuggestion, SuggestionStatus, SecurityStatusResponse, BlockedIpRecord, SecurityAuditLog } from '../types';
import { api } from '../services/api';

interface AdminPanelProps {
  professionals: ServiceProfessional[];
  settings: AdminSettings;
  sponsors: SponsorBanner[];
  onRefreshData: () => void;
  onSelectProfessional: (p: ServiceProfessional) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  professionals,
  settings,
  sponsors,
  onRefreshData,
  onSelectProfessional,
}) => {
  const [activeTab, setActiveTab] = useState<'verifications' | 'pricing' | 'contacts' | 'sponsors' | 'stats' | 'suggestions' | 'security'>('verifications');
  
  // Anti-Hacker Security tab state
  const [securityData, setSecurityData] = useState<SecurityStatusResponse | null>(null);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [manualIpToBlock, setManualIpToBlock] = useState('');
  const [manualBlockReason, setManualBlockReason] = useState('');
  const [securityActionMsg, setSecurityActionMsg] = useState<string | null>(null);

  const fetchSecurityData = async () => {
    try {
      setLoadingSecurity(true);
      const data = await api.getSecurityDashboard();
      setSecurityData(data);
    } catch (err) {
      console.error('Error al cargar panel de seguridad:', err);
    } finally {
      setLoadingSecurity(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
    const interval = setInterval(fetchSecurityData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUnblockIp = async (ip: string) => {
    try {
      const res = await api.unblockIp(ip);
      setSecurityActionMsg(res.message);
      setTimeout(() => setSecurityActionMsg(null), 3500);
      await fetchSecurityData();
    } catch (err: any) {
      alert(err.message || 'Error al desbloquear IP');
    }
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIpToBlock.trim()) return;
    try {
      const res = await api.manualBlockIp(manualIpToBlock.trim(), manualBlockReason.trim() || undefined);
      setSecurityActionMsg(res.message);
      setManualIpToBlock('');
      setManualBlockReason('');
      setTimeout(() => setSecurityActionMsg(null), 3500);
      await fetchSecurityData();
    } catch (err: any) {
      alert(err.message || 'Error al bloquear IP');
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('¿Seguro que deseas reiniciar el historial de auditoría de seguridad?')) return;
    try {
      await api.clearSecurityLogs();
      setSecurityActionMsg('Historial de eventos de seguridad limpiado.');
      setTimeout(() => setSecurityActionMsg(null), 3000);
      await fetchSecurityData();
    } catch (err: any) {
      alert(err.message || 'Error al limpiar registros');
    }
  };

  // Suggestions tab state
  const [suggestions, setSuggestions] = useState<VisitorSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestionFilter, setSuggestionFilter] = useState<string>('all');
  const [editingSuggestionNotes, setEditingSuggestionNotes] = useState<{ [id: string]: string }>({});
  const [suggestionSearch, setSuggestionSearch] = useState('');
  
  // Verifications tab state
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNoteInput, setAdminNoteInput] = useState<{ [id: string]: string }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Settings & Contact state
  const [editableSettings, setEditableSettings] = useState<AdminSettings>({ ...settings });
  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    setEditableSettings({ ...settings });
  }, [settings]);

  const handleCopyText = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAllSettings = async () => {
    setSavingSettings(true);
    try {
      await api.updateSettings(editableSettings);
      setSaveSuccess(true);
      onRefreshData();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al guardar las configuraciones de contacto y pagos');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePrices = handleSaveAllSettings;

  const handleResetDefaultContacts = () => {
    setEditableSettings(prev => ({
      ...prev,
      contactWhatsApp: '595975635770',
      paymentsPhone: '595975635770',
      suggestionsPhone: '595975635770',
      supportPhone: '595975635770',
      contactEmail: 'serviciosyaparaguay@gmail.com',
      paymentBankName: 'Banco Continental / SIPAP-SPI',
      paymentAccountHolder: 'ServiciosYa Paraguay',
      paymentAccountNumber: '01-4589201-09',
      paymentRuc: '80012345-6',
      paymentAliasSipap: 'serviciosya.sipap',
      paymentTigoMoneyNumber: '0975 635770',
      paymentInstructions: 'Una vez realizada la transferencia o giro, remití el comprobante a nuestro WhatsApp de pagos con tu nombre o razón social para activación inmediata y envío de factura legal electrónica.',
      suggestionsNotice: 'Revisamos diariamente todas las sugerencias de la comunidad para habilitar nuevos oficios, ciudades y funciones en todo el Paraguay.'
    }));
  };

  // Assign featured tier modal/state
  const [selectedProfForFeature, setSelectedProfForFeature] = useState<ServiceProfessional | null>(null);
  const [targetTier, setTargetTier] = useState<FeaturedTier>('gold');
  const [targetDuration, setTargetDuration] = useState<number>(1);

  // Sponsor form state
  const [showAddSponsor, setShowAddSponsor] = useState(false);
  const [newSponsor, setNewSponsor] = useState<Partial<SponsorBanner>>({
    title: '',
    sponsorName: '',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '',
    whatsapp: '',
    placement: 'top_hero',
    monthlyFee: 35000,
    active: true,
  });
  const [addingSponsor, setAddingSponsor] = useState(false);

  // Stats
  const pendingList = professionals.filter(p => p.verificationStatus === 'pending');
  const approvedList = professionals.filter(p => p.verificationStatus === 'approved');
  const rejectedList = professionals.filter(p => p.verificationStatus === 'rejected');
  const totalWhatsappClicks = professionals.reduce((acc, p) => acc + (p.whatsappClicks || 0), 0);
  const totalFeatured = professionals.filter(p => p.featuredTier !== 'none');
  const totalSponsorRevenue = sponsors
    .filter(s => s.active)
    .reduce((acc, s) => acc + (s.monthlyFee || 0), 0);

  // Handlers for verification
  const handleVerifyAction = async (id: string, status: 'approved' | 'rejected') => {
    setActionLoading(id);
    try {
      const note = adminNoteInput[id] || (status === 'approved' ? 'Datos y matricula verificados correctamente.' : 'Documentación incompleta o datos no verificables.');
      await api.verifyProfessional(id, status, note);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApplyFeatured = async () => {
    if (!selectedProfForFeature) return;
    setActionLoading(selectedProfForFeature.id);
    try {
      await api.setFeaturedPlan(selectedProfForFeature.id, targetTier, targetDuration);
      setSelectedProfForFeature(null);
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  // Handlers for sponsors
  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsor.title || !newSponsor.sponsorName) return;
    setAddingSponsor(true);
    try {
      await api.addSponsor(newSponsor);
      setShowAddSponsor(false);
      setNewSponsor({
        title: '',
        sponsorName: '',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=80',
        targetUrl: '',
        whatsapp: '',
        placement: 'top_hero',
        monthlyFee: 35000,
        active: true,
      });
      onRefreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingSponsor(false);
    }
  };

  const handleToggleSponsor = async (sponsor: SponsorBanner) => {
    try {
      await api.updateSponsor(sponsor.id, { active: !sponsor.active });
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSponsor = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar este auspiciante?')) return;
    try {
      await api.deleteSponsor(id);
      onRefreshData();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered list for verifications
  const filteredProfessionals = professionals.filter(p => {
    if (filterStatus !== 'all' && p.verificationStatus !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.trade.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.zone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Suggestions logic
  const loadAdminSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const list = await api.getSuggestions();
      setSuggestions(list);
    } catch (err) {
      console.error('Error cargando sugerencias en admin:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  React.useEffect(() => {
    loadAdminSuggestions();
  }, []);

  const handleUpdateSuggestionStatus = async (id: string, newStatus: SuggestionStatus) => {
    try {
      const note = editingSuggestionNotes[id];
      await api.updateSuggestionStatus(id, newStatus, note);
      await loadAdminSuggestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSuggestionNote = async (id: string) => {
    const sug = suggestions.find(s => s.id === id);
    if (!sug) return;
    try {
      const note = editingSuggestionNotes[id] ?? sug.adminNotes ?? '';
      await api.updateSuggestionStatus(id, sug.status, note);
      await loadAdminSuggestions();
      alert('Nota administrativa guardada.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSuggestion = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta sugerencia?')) return;
    try {
      await api.deleteSuggestion(id);
      setSuggestions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const pendingSuggestionsCount = suggestions.filter(s => s.status === 'pending').length;

  const filteredAdminSuggestions = suggestions.filter(s => {
    if (suggestionFilter !== 'all' && s.status !== suggestionFilter) return false;
    if (suggestionSearch.trim()) {
      const q = suggestionSearch.toLowerCase();
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.suggestedZone.toLowerCase().includes(q) ||
        (s.visitorName && s.visitorName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                  Panel de Administración Exclusivo
                </h1>
                <span className="bg-indigo-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
                  Super Admin
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal">
                Aprobación y verificación de datos, tarifas de publicaciones destacadas y gestión de auspiciantes.
              </p>
            </div>
          </div>

          {/* Quick summary badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="block text-xl font-bold text-amber-400">{pendingList.length}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-300">Pendientes</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="block text-xl font-bold text-emerald-400">{approvedList.length}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-300">Activos</span>
            </div>
            <div className="bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 text-center">
              <span className="block text-xl font-bold text-indigo-300">{totalWhatsappClicks}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-300">Contactos WA</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-7 pt-4 border-t border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            id="tab-verifications"
            onClick={() => setActiveTab('verifications')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'verifications'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Verificación de Profesionales</span>
            {pendingList.length > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {pendingList.length}
              </span>
            )}
          </button>

          <button
            id="tab-pricing"
            onClick={() => setActiveTab('pricing')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'pricing'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Tarifas y Costos de Destacados (Gs.)</span>
          </button>

          <button
            id="tab-contacts"
            onClick={() => setActiveTab('contacts')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'contacts'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <PhoneCall className="w-4 h-4 text-emerald-400" />
            <span>Contacto, Pagos y Sugerencias</span>
          </button>

          <button
            id="tab-sponsors"
            onClick={() => setActiveTab('sponsors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'sponsors'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-4 h-4" />
            <span>Auspiciantes y Publicidad ({sponsors.length})</span>
          </button>

          <button
            id="tab-stats"
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'stats'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Métricas del Directorio</span>
          </button>

          <button
            id="tab-suggestions"
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'suggestions'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-300" />
            <span>Buzón Sugerencias ({suggestions.length})</span>
            {pendingSuggestionsCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingSuggestionsCount} nuevos
              </span>
            )}
          </button>

          <button
            id="tab-security"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'security'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rose-400" />
            <span>Seguridad Anti-Hacker & IPs</span>
            {securityData && securityData.totalBlockedIps > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                {securityData.totalBlockedIps} bloqueadas
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ================= TAB 1: VERIFICACIONES ================= */}
      {activeTab === 'verifications' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Filter & search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Filtrar estado:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/80">
                {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                  <button
                    key={status}
                    id={`filter-status-${status}`}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                      filterStatus === status
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status === 'pending' && `Pendientes (${pendingList.length})`}
                    {status === 'approved' && `Aprobados (${approvedList.length})`}
                    {status === 'rejected' && `Rechazados (${rejectedList.length})`}
                    {status === 'all' && `Todos (${professionals.length})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="admin-search-prof"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, email..."
                className="w-full pl-9 pr-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
              />
            </div>
          </div>

          {/* List of professionals to verify */}
          {filteredProfessionals.length > 0 ? (
            <div className="space-y-4">
              {filteredProfessionals.map((prof) => {
                const isPending = prof.verificationStatus === 'pending';
                const isApproved = prof.verificationStatus === 'approved';
                const isRejected = prof.verificationStatus === 'rejected';

                return (
                  <div
                    key={prof.id}
                    id={`admin-prof-item-${prof.id}`}
                    className={`bg-white rounded-xl p-5 border transition-all shadow-2xs ${
                      isPending
                        ? 'border-amber-300 bg-amber-50/20 ring-1 ring-amber-300/40'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start justify-between gap-5">
                      
                      {/* Left: Prof Information */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <img
                          src={prof.avatar}
                          alt={prof.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {prof.name}
                            </h3>
                            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-800 border border-indigo-200">
                              {prof.trade}
                            </span>
                            
                            {/* Verification badge status */}
                            {isPending && (
                              <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-600" /> Pendiente de Verificación
                              </span>
                            )}
                            {isApproved && (
                              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-600" /> Aprobado y Publicado
                              </span>
                            )}
                            {isRejected && (
                              <span className="text-[11px] font-semibold text-rose-800 bg-rose-100 border border-rose-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <XCircle className="w-3 h-3 text-rose-600" /> Rechazado
                              </span>
                            )}

                            {prof.featuredTier !== 'none' && (
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-400 text-slate-950 flex items-center gap-0.5 shadow-2xs">
                                <Sparkles className="w-2.5 h-2.5" /> Plan {prof.featuredTier}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-500 mt-1.5 font-normal">
                            <span className="text-slate-700 font-semibold">{prof.email}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" /> WA: {prof.whatsapp}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" /> {prof.zone}
                            </span>
                            <span>•</span>
                            <span>{prof.experienceYears} años experiencia</span>
                          </div>

                          {/* Matrícula check */}
                          {prof.hasMatricula && (
                            <div className="mt-2 text-xs font-medium text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Matrícula declarada: <strong>{prof.matricula || 'Presenta matrícula oficial'}</strong></span>
                            </div>
                          )}

                          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed font-normal">
                            {prof.bio}
                          </p>

                          {/* Admin internal notes */}
                          {prof.adminNotes && (
                            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 font-normal">
                              <span className="font-semibold text-slate-700">Observaciones del Admin:</span> {prof.adminNotes}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-2 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        
                        {/* Note input for verification */}
                        <div>
                          <input
                            id={`admin-note-${prof.id}`}
                            type="text"
                            placeholder="Observación / motivo..."
                            value={adminNoteInput[prof.id] ?? ''}
                            onChange={(e) => setAdminNoteInput({ ...adminNoteInput, [prof.id]: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 rounded-lg border border-slate-200 focus:border-indigo-500 outline-hidden font-medium transition-all"
                          />
                        </div>

                        {/* Approve and reject action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-approve-${prof.id}`}
                            type="button"
                            disabled={actionLoading === prof.id}
                            onClick={() => handleVerifyAction(prof.id, 'approved')}
                            className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors shadow-2xs disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Aprobar y Publicar</span>
                          </button>

                          <button
                            id={`btn-reject-${prof.id}`}
                            type="button"
                            disabled={actionLoading === prof.id}
                            onClick={() => handleVerifyAction(prof.id, 'rejected')}
                            className="py-2 px-3 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Rechazar</span>
                          </button>
                        </div>

                        {/* Secondary utilities */}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => onSelectProfessional(prof)}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors"
                          >
                            Ver Perfil Completo
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedProfForFeature(prof);
                              setTargetTier(prof.featuredTier !== 'none' ? prof.featuredTier : 'gold');
                            }}
                            className="py-1.5 px-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            Destacar
                          </button>
                        </div>

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">
                No hay profesionales en este estado ({filterStatus}).
              </p>
              <p className="text-xs text-slate-500 mt-1 font-normal">
                Todas las solicitudes de registro han sido procesadas.
              </p>
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 2: COSTOS DE DESTACADOS ================= */}
      {activeTab === 'pricing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-indigo-600" />
                  Tarifas y Costos de Publicaciones Destacadas (Gs.)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Establecé el precio mensual y trimestral en Guaraníes (Gs.) para los profesionales de Itapúa.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {saveSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ¡Precios guardados con éxito!
                  </span>
                )}
                <button
                  id="btn-save-admin-pricing"
                  onClick={handleSavePrices}
                  disabled={savingSettings}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>Guardar Tarifas</span>
                </button>
              </div>
            </div>

            {/* Banner: Canales de Cobro y Cuentas Bancarias */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-emerald-950">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Canales de Pago y Cuentas Bancarias:</strong> El WhatsApp para recepción de comprobantes (<strong>{editableSettings.paymentsPhone || editableSettings.contactWhatsApp || '595975635770'}</strong>) y las cuentas SIPAP/SPI oficiales se configuran en la pestaña de Contacto y Pagos.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('contacts')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shrink-0 cursor-pointer text-[11px] transition-colors"
              >
                Editar WhatsApp de Pagos & SIPAP
              </button>
            </div>

            {/* Pricing tiers grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {editableSettings.featuredPrices.map((plan, idx) => (
                <div
                  key={plan.tier}
                  className={`rounded-xl p-5 border flex flex-col justify-between ${
                    plan.tier === 'gold'
                      ? 'border-amber-300 bg-amber-50/20 shadow-xs ring-1 ring-amber-300/60'
                      : plan.tier === 'silver'
                      ? 'border-slate-300 bg-slate-50/60'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                        {plan.tier === 'gold' && <Sparkles className="w-4 h-4 text-amber-600" />}
                        {plan.tier === 'silver' && <Award className="w-4 h-4 text-slate-600" />}
                        {plan.tier === 'bronze' && <Star className="w-4 h-4 text-amber-800" />}
                        {plan.name}
                      </h4>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {plan.tier}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mb-4 font-normal">
                      {plan.description}
                    </p>

                    {/* Inputs for pricing */}
                    <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200 mb-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Precio Mensual (Gs.)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-bold">Gs.</span>
                          <input
                            type="number"
                            value={plan.monthlyPrice}
                            onChange={(e) => {
                              const updated = [...editableSettings.featuredPrices];
                              updated[idx].monthlyPrice = Number(e.target.value);
                              setEditableSettings({ ...editableSettings, featuredPrices: updated });
                            }}
                            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden text-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Precio Trimestral (Gs. - con descuento)
                        </label>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-500 font-bold">Gs.</span>
                          <input
                            type="number"
                            value={plan.quarterlyPrice}
                            onChange={(e) => {
                              const updated = [...editableSettings.featuredPrices];
                              updated[idx].quarterlyPrice = Number(e.target.value);
                              setEditableSettings({ ...editableSettings, featuredPrices: updated });
                            }}
                            className="w-full pl-9 pr-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden text-slate-900"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Beneficios incluidos:
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center gap-1.5 text-xs text-slate-600 font-normal">
                          <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Currently featured professionals table */}
            <div className="pt-6 border-t border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Profesionales con Destacado Activo ({totalFeatured.length})</span>
              </h4>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border border-slate-200 rounded-lg overflow-hidden">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Profesional</th>
                      <th className="p-3">Oficio</th>
                      <th className="p-3">Plan Actual</th>
                      <th className="p-3">Vence</th>
                      <th className="p-3">Contactos WA</th>
                      <th className="p-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {totalFeatured.map((prof) => (
                      <tr key={prof.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{prof.name}</td>
                        <td className="p-3 text-slate-600">{prof.trade}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                            {prof.featuredTier}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-normal">
                          {prof.featuredExpiresAt || 'Indefinido'}
                        </td>
                        <td className="p-3 font-semibold text-emerald-600">
                          {prof.whatsappClicks} consultas
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedProfForFeature(prof);
                              setTargetTier('none');
                            }}
                            className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
                          >
                            Quitar Destacado
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB CONTACTOS, PAGOS Y SUGERENCIAS ================= */}
      {activeTab === 'contacts' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      Datos de Contacto, Pagos y Buzón de Sugerencias
                    </h3>
                    <p className="text-xs text-slate-500 font-normal">
                      Configurá los números telefónicos de WhatsApp, cuentas bancarias SIPAP y correos oficiales que ven los usuarios y profesionales al realizar pagos o enviar sugerencias.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleResetDefaultContacts}
                  className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                  title="Restablecer números sugeridos de Paraguay"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Valores Sugeridos</span>
                </button>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <Check className="w-4 h-4" /> ¡Datos guardados con éxito!
                  </span>
                )}

                <button
                  id="btn-save-admin-contacts"
                  onClick={handleSaveAllSettings}
                  disabled={savingSettings}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>{savingSettings ? 'Guardando...' : 'Guardar Todos los Cambios'}</span>
                </button>
              </div>
            </div>

            {/* Quick Live Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* Card 1: WhatsApp Pagos */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                      WhatsApp Pagos
                    </span>
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="font-mono text-sm font-black text-slate-800 tracking-tight">
                    {editableSettings.paymentsPhone || editableSettings.contactWhatsApp || 'No configurado'}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Recibe comprobantes de planes y contratación de auspicios.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${(editableSettings.paymentsPhone || editableSettings.contactWhatsApp || '595975635770').replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Esta es una prueba de contacto de pagos desde ServiciosYa.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Probar enlace wa.me</span>
                </a>
              </div>

              {/* Card 2: WhatsApp Sugerencias */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                      WhatsApp Sugerencias
                    </span>
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="font-mono text-sm font-black text-slate-800 tracking-tight">
                    {editableSettings.suggestionsPhone || editableSettings.contactWhatsApp || 'No configurado'}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Atención directa a visitantes del buzón de ideas y oficios.
                  </p>
                </div>
                <a
                  href={`https://wa.me/${(editableSettings.suggestionsPhone || editableSettings.contactWhatsApp || '595975635770').replace(/\D/g, '')}?text=${encodeURIComponent('Hola! Esta es una prueba de mensaje de sugerencias.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Probar enlace wa.me</span>
                </a>
              </div>

              {/* Card 3: SIPAP / SPI */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded">
                      Cuenta SIPAP / SPI
                    </span>
                    <Landmark className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-xs font-bold text-slate-800 truncate">
                    {editableSettings.paymentBankName || 'Sin banco'}
                  </div>
                  <div className="font-mono text-xs font-semibold text-slate-600 mt-0.5 truncate">
                    Nº: {editableSettings.paymentAccountNumber || '---'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(
                    `Banco: ${editableSettings.paymentBankName || ''}\nCuenta: ${editableSettings.paymentAccountNumber || ''}\nTitular: ${editableSettings.paymentAccountHolder || ''}\nRUC: ${editableSettings.paymentRuc || ''}\nAlias SIPAP: ${editableSettings.paymentAliasSipap || ''}`,
                    'sipap-quick'
                  )}
                  className="mt-3 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedField === 'sipap-quick' ? '¡Copiado!' : 'Copiar formato SIPAP'}</span>
                </button>
              </div>

              {/* Card 4: Giros Tigo / Billeteras */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded">
                      Giros / Billeteras
                    </span>
                    <Smartphone className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="font-mono text-sm font-black text-slate-800 tracking-tight">
                    {editableSettings.paymentTigoMoneyNumber || 'No configurado'}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tigo Money, Billetera Personal y Zimple en Guaraníes.
                  </p>
                </div>
                <span className="mt-3 text-[11px] font-semibold text-slate-400">
                  Habilitado en toda la República
                </span>
              </div>
            </div>

            {/* SECCIÓN 1: CANAL TELEFÓNICO Y WHATSAPP PARA PAGOS */}
            <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-emerald-50/30 to-slate-50/50 space-y-4">
              <div className="flex items-center gap-2 text-emerald-950 pb-2 border-b border-slate-200/80">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm">
                  1. Canales Telefónicos y WhatsApp para Cobros y Pagos
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de WhatsApp para Pagos & Comprobantes:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <input
                      id="input-payments-phone"
                      type="text"
                      value={editableSettings.paymentsPhone || ''}
                      onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentsPhone: e.target.value }))}
                      placeholder="595975635770 ó 0975 635770"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    A este número se derivan automáticamente los profesionales que tocan el botón <strong>"Contactar por WhatsApp"</strong> en la ventana de tarifas y comprobantes.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número para Giros Móviles y Billeteras (Tigo Money / Personal / Zimple):
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-purple-600">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <input
                      id="input-tigo-money"
                      type="text"
                      value={editableSettings.paymentTigoMoneyNumber || ''}
                      onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentTigoMoneyNumber: e.target.value }))}
                      placeholder="0975 635770"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Número telefónico habilitado para recepcionar giros de profesionales sin cuenta bancaria.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Instrucciones personalizadas para pagos y facturación legal:
                </label>
                <textarea
                  id="input-payment-instructions"
                  rows={2}
                  value={editableSettings.paymentInstructions || ''}
                  onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentInstructions: e.target.value }))}
                  placeholder="Ej: Una vez realizada la transferencia o giro, remití el comprobante a nuestro WhatsApp de pagos con tu nombre o razón social..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white leading-relaxed"
                />
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Este texto se muestra en el panel de pagos para guiar a los profesionales al enviar comprobantes y solicitar factura con RUC.
                </p>
              </div>
            </div>

            {/* SECCIÓN 2: DATOS BANCARIOS OFICIALES PARA TRANSFERENCIAS (SIPAP / SPI) */}
            <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-indigo-50/30 to-slate-50/50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2 text-indigo-950">
                  <Landmark className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-sm">
                    2. Datos Oficiales de Cuenta Bancaria para Transferencias (SIPAP / SPI)
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded">
                  Visible en ventana de planes
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Entidad Bancaria o Cooperativa:
                  </label>
                  <input
                    id="input-bank-name"
                    type="text"
                    value={editableSettings.paymentBankName || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentBankName: e.target.value }))}
                    placeholder="Ej: Banco Continental / SPI, ueno bank, Banco Itaú"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Titular de la Cuenta:
                  </label>
                  <input
                    id="input-account-holder"
                    type="text"
                    value={editableSettings.paymentAccountHolder || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentAccountHolder: e.target.value }))}
                    placeholder="Nombre o Razón Social"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RUC o C.I. del Titular:
                  </label>
                  <input
                    id="input-payment-ruc"
                    type="text"
                    value={editableSettings.paymentRuc || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentRuc: e.target.value }))}
                    placeholder="Ej: 80012345-6"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de Cuenta Bancaria:
                  </label>
                  <input
                    id="input-account-number"
                    type="text"
                    value={editableSettings.paymentAccountNumber || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentAccountNumber: e.target.value }))}
                    placeholder="Ej: 01-4589201-09"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Alias SIPAP / SPI (Opcional):
                  </label>
                  <input
                    id="input-alias-sipap"
                    type="text"
                    value={editableSettings.paymentAliasSipap || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, paymentAliasSipap: e.target.value }))}
                    placeholder="Ej: serviciosya.sipap"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => handleCopyText(
                      `Banco: ${editableSettings.paymentBankName || ''}\nCuenta: ${editableSettings.paymentAccountNumber || ''}\nTitular: ${editableSettings.paymentAccountHolder || ''}\nRUC: ${editableSettings.paymentRuc || ''}\nAlias: ${editableSettings.paymentAliasSipap || ''}`,
                      'sipap-full'
                    )}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedField === 'sipap-full' ? '¡Formato Copiado!' : 'Copiar Texto para Enviar a Clientes'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CANAL TELEFÓNICO Y WHATSAPP PARA BUZÓN DE SUGERENCIAS */}
            <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-amber-50/30 to-slate-50/50 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <div className="flex items-center gap-2 text-amber-950">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  <h4 className="font-bold text-sm">
                    3. Canal Telefónico y WhatsApp para Buzón de Sugerencias y Quejas
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                  Buzón de la comunidad
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de WhatsApp para Sugerencias & Quejas de la Comunidad:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-500">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <input
                      id="input-suggestions-phone"
                      type="text"
                      value={editableSettings.suggestionsPhone || ''}
                      onChange={(e) => setEditableSettings(prev => ({ ...prev, suggestionsPhone: e.target.value }))}
                      placeholder="595975635770 ó 0975 635770"
                      className="w-full pl-9 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Aparece con acceso directo en el modal de sugerencias para que los visitantes puedan proponer oficios o formular reclamos rápidamente.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico para Sugerencias / Mesa de Entrada:
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="input-contact-email"
                      type="email"
                      value={editableSettings.contactEmail || ''}
                      onChange={(e) => setEditableSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                      placeholder="serviciosyaparaguay@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white font-medium"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Email oficial mostrado como canal alternativo en el buzón y pie de página.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Aviso o Mensaje Institucional que leen los vecinos en el Buzón:
                </label>
                <textarea
                  id="input-suggestions-notice"
                  rows={2}
                  value={editableSettings.suggestionsNotice || ''}
                  onChange={(e) => setEditableSettings(prev => ({ ...prev, suggestionsNotice: e.target.value }))}
                  placeholder="Ej: Revisamos diariamente todas las sugerencias de la comunidad para habilitar nuevos oficios, ciudades y funciones..."
                  className="w-full p-2.5 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-500 bg-white leading-relaxed"
                />
              </div>
            </div>

            {/* SECCIÓN 4: CONTACTO GENERAL Y PARÁMETROS DEL DIRECTORIO */}
            <div className="border border-slate-200 rounded-xl p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 space-y-4">
              <div className="flex items-center gap-2 text-slate-900 pb-2 border-b border-slate-200/80">
                <Settings className="w-5 h-5 text-slate-700" />
                <h4 className="font-bold text-sm">
                  4. Contacto General de la Plataforma y Parámetros del Sistema
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Número de WhatsApp General / Atención al Usuario:
                  </label>
                  <input
                    id="input-general-whatsapp"
                    type="text"
                    value={editableSettings.contactWhatsApp || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, contactWhatsApp: e.target.value }))}
                    placeholder="595975635770"
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Número base por defecto si no se especifican números individuales para pagos o sugerencias.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Línea Telefónica de Soporte Técnico:
                  </label>
                  <input
                    id="input-support-phone"
                    type="text"
                    value={editableSettings.supportPhone || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, supportPhone: e.target.value }))}
                    placeholder="595975635770"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Título Principal en Portada (Hero Headline):
                  </label>
                  <input
                    id="input-hero-headline"
                    type="text"
                    value={editableSettings.heroHeadline || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, heroHeadline: e.target.value }))}
                    placeholder="Encontrá al profesional ideal para tu hogar en minutos"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtítulo en Portada (Hero Subtitle):
                  </label>
                  <input
                    id="input-hero-subtitle"
                    type="text"
                    value={editableSettings.heroSubtitle || ''}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, heroSubtitle: e.target.value }))}
                    placeholder="Directorio verificado de oficios en Paraguay..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>
              </div>

              {/* Toggles del sistema */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editableSettings.autoApproval}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, autoApproval: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Aprobación automática de profesionales
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Si está activo, los registros se publican sin esperar validación manual del administrador.
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={editableSettings.requireMatriculaForGasElectricity}
                    onChange={(e) => setEditableSettings(prev => ({ ...prev, requireMatriculaForGasElectricity: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded-sm border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      Exigir matrícula obligatoria (Gas / Electricidad)
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Exige registro ANDE / INTN para profesionales de alto riesgo antes de verificarlos.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-200">
              <div className="text-xs text-slate-500">
                Los cambios en números de teléfono y cuentas bancarias se aplicarán inmediatamente en toda la plataforma.
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ¡Guardado con éxito!
                  </span>
                )}
                <button
                  id="btn-bottom-save-admin-contacts"
                  onClick={handleSaveAllSettings}
                  disabled={savingSettings}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-white" />
                  <span>{savingSettings ? 'Guardando...' : 'Guardar Todo'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
      {activeTab === 'sponsors' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                Gestión de Auspiciantes y Banners Comerciales
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-normal">
                Publicitá ferreterías, marcas de herramientas, corralones y empresas afines en la plataforma.
              </p>
            </div>

            <button
              id="btn-add-sponsor-modal"
              onClick={() => setShowAddSponsor(!showAddSponsor)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddSponsor ? 'Cerrar Formulario' : 'Nuevo Auspiciante'}</span>
            </button>
          </div>

          {/* Form to add sponsor */}
          {showAddSponsor && (
            <form onSubmit={handleAddSponsor} className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4 animate-in slide-in-from-top-2">
              <h4 className="text-sm font-bold text-slate-900">
                Crear Nuevo Espacio Publicitario
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Empresa Auspiciante</label>
                  <input
                    id="input-sponsor-name"
                    type="text"
                    required
                    value={newSponsor.sponsorName}
                    onChange={(e) => setNewSponsor({ ...newSponsor, sponsorName: e.target.value })}
                    placeholder="Ej: Ferreterías San Martín"
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Título del Banner</label>
                  <input
                    id="input-sponsor-title"
                    type="text"
                    required
                    value={newSponsor.title}
                    onChange={(e) => setNewSponsor({ ...newSponsor, title: e.target.value })}
                    placeholder="Ej: 15% Descuento en herramientas Bosch"
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción de la oferta</label>
                <textarea
                  id="input-sponsor-desc"
                  rows={2}
                  value={newSponsor.description}
                  onChange={(e) => setNewSponsor({ ...newSponsor, description: e.target.value })}
                  placeholder="Detalles de la promoción, código de descuento o condiciones..."
                  className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Imagen URL (Unsplash o CDN)</label>
                  <input
                    id="input-sponsor-img"
                    type="url"
                    value={newSponsor.imageUrl}
                    onChange={(e) => setNewSponsor({ ...newSponsor, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp del Auspiciante</label>
                  <input
                    id="input-sponsor-wa"
                    type="text"
                    placeholder="54911..."
                    value={newSponsor.whatsapp}
                    onChange={(e) => setNewSponsor({ ...newSponsor, whatsapp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Abono Mensual (Gs.)</label>
                  <input
                    id="input-sponsor-fee"
                    type="number"
                    value={newSponsor.monthlyFee}
                    onChange={(e) => setNewSponsor({ ...newSponsor, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSponsor(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  id="btn-submit-sponsor"
                  type="submit"
                  disabled={addingSponsor}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                >
                  Crear Auspiciante
                </button>
              </div>
            </form>
          )}

          {/* Sponsors list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className={`bg-white rounded-xl p-5 border flex flex-col justify-between shadow-2xs ${
                  sponsor.active ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        {sponsor.sponsorName}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        sponsor.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {sponsor.active ? 'Activo' : 'Pausado'}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-900">
                      Gs. {sponsor.monthlyFee?.toLocaleString('es-PY')} / mes
                    </span>
                  </div>

                  <div className="flex items-start gap-3 mb-3">
                    <img
                      src={sponsor.imageUrl}
                      alt={sponsor.sponsorName}
                      className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        {sponsor.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-normal">
                        {sponsor.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-2.5 flex items-center justify-between text-[11px] text-slate-600 mb-3 border border-slate-200/60 font-normal">
                    <span>Impresiones: <strong className="font-semibold text-slate-900">{sponsor.impressions?.toLocaleString('es-AR') || 0}</strong></span>
                    <span>Clicks directos: <strong className="font-semibold text-slate-900">{sponsor.clicks || 0}</strong></span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleSponsor(sponsor)}
                    className="text-xs font-semibold text-slate-700 hover:text-slate-900"
                  >
                    {sponsor.active ? 'Pausar Publicidad' : 'Reanudar'}
                  </button>
                  <button
                    onClick={() => handleDeleteSponsor(sponsor.id)}
                    className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= TAB 4: MÉTRICAS ================= */}
      {activeTab === 'stats' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Profesionales</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">{professionals.length}</div>
              <div className="text-xs text-slate-500 mt-1 font-normal">
                {approvedList.length} activos en directorio
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contactos WhatsApp</span>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{totalWhatsappClicks}</div>
              <div className="text-xs text-slate-500 mt-1 font-normal">
                Leads directos generados
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Publicaciones Destacadas</span>
              <div className="text-3xl font-bold text-indigo-600 mt-1">{totalFeatured.length}</div>
              <div className="text-xs text-slate-500 mt-1 font-normal">
                Oro, Plata y Bronce activos
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Facturación Auspiciantes</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">
                Gs. {totalSponsorRevenue.toLocaleString('es-PY')}
              </div>
              <div className="text-xs text-slate-500 mt-1 font-normal">
                Ingreso mensual estimado
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4">
              Distribución de Oficios en ServiciosYa
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                'Plomero', 'Electricista', 'Jardinería', 'Carpintero', 
                'Albañiles', 'Niñeras', 'Cocineras', 'Cerrajería', 
                'Pintor', 'Aire Acondicionado'
              ].map(trade => {
                const count = professionals.filter(p => p.trade === trade).length;
                return (
                  <div key={trade} className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    <div className="text-xs font-medium text-slate-600">{trade}</div>
                    <div className="text-lg font-bold text-slate-900">{count} perfiles</div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* ================= TAB 5: SUGERENCIAS DE VISITANTES ================= */}
      {activeTab === 'suggestions' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Propuestas</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">{suggestions.length}</div>
              <div className="text-xs text-slate-500 mt-1">Sugeridas por visitantes</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes de Revisión</span>
              <div className="text-3xl font-bold text-amber-600 mt-1">{pendingSuggestionsCount}</div>
              <div className="text-xs text-slate-500 mt-1">Requieren atención</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aprobadas / Listas</span>
              <div className="text-3xl font-bold text-indigo-600 mt-1">
                {suggestions.filter(s => s.status === 'approved' || s.status === 'implemented').length}
              </div>
              <div className="text-xs text-slate-500 mt-1">En proceso o incorporadas</div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interés Comunitario</span>
              <div className="text-3xl font-bold text-emerald-600 mt-1">
                {suggestions.reduce((acc, s) => acc + (s.votesCount || 0), 0)}
              </div>
              <div className="text-xs text-slate-500 mt-1">Votos de apoyo totales</div>
            </div>
          </div>

          {/* Banner: Canales de Sugerencias */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 text-amber-950">
              <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Atención por WhatsApp para Sugerencias:</strong> El número asignado al buzón de la comunidad es <strong>{editableSettings.suggestionsPhone || editableSettings.contactWhatsApp || '595975635770'}</strong> y el correo es <strong>{editableSettings.contactEmail || 'serviciosyaparaguay@gmail.com'}</strong>.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('contacts')}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0 cursor-pointer text-[11px] transition-colors"
            >
              Modificar Teléfono de Sugerencias
            </button>
          </div>

          {/* Filter and search bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Estado:
              </span>
              <select
                value={suggestionFilter}
                onChange={(e) => setSuggestionFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-hidden cursor-pointer"
              >
                <option value="all">Todas ({suggestions.length})</option>
                <option value="pending">Pendientes ({pendingSuggestionsCount})</option>
                <option value="reviewing">En Evaluación ({suggestions.filter(s => s.status === 'reviewing').length})</option>
                <option value="approved">Aprobadas ({suggestions.filter(s => s.status === 'approved').length})</option>
                <option value="implemented">Incorporadas ({suggestions.filter(s => s.status === 'implemented').length})</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por oficio, zona o persona..."
                  value={suggestionSearch}
                  onChange={(e) => setSuggestionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:border-indigo-500 outline-hidden"
                />
              </div>

              <button
                onClick={loadAdminSuggestions}
                disabled={loadingSuggestions}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                {loadingSuggestions ? 'Actualizando...' : 'Refrescar'}
              </button>
            </div>
          </div>

          {/* Suggestions List */}
          {filteredAdminSuggestions.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-3">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                No hay sugerencias con los filtros seleccionados
              </h3>
              <p className="text-xs text-slate-500 font-normal max-w-md mx-auto">
                Los visitantes de la web pueden proponer oficios desde el botón "Sugerir Oficio" en la barra superior o en el buscador.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAdminSuggestions.map((sug) => {
                const currentNote = editingSuggestionNotes[sug.id] !== undefined ? editingSuggestionNotes[sug.id] : (sug.adminNotes || '');
                return (
                  <div
                    key={sug.id}
                    className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs hover:border-indigo-200 transition-all space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900">
                            {sug.title}
                          </h3>
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {sug.type}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            sug.status === 'implemented'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sug.status === 'approved'
                              ? 'bg-indigo-100 text-indigo-800'
                              : sug.status === 'reviewing'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {sug.status === 'implemented' && '¡Ya Incorporado! 🎉'}
                            {sug.status === 'approved' && 'Aprobado'}
                            {sug.status === 'reviewing' && 'En Evaluación'}
                            {sug.status === 'pending' && 'Pendiente de Revisión'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            Zona: {sug.suggestedZone}
                          </span>
                          <span>•</span>
                          <span>Propuesto por: <strong>{sug.visitorName || 'Anónimo'}</strong></span>
                          <span>•</span>
                          <span>{new Date(sug.createdAt).toLocaleDateString('es-PY')}</span>
                        </div>
                      </div>

                      {/* Community Votes & Direct WhatsApp Contact */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs font-bold shadow-2xs">
                          <ThumbsUp className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                          <span>{sug.votesCount} votos</span>
                        </div>

                        {sug.visitorContact && (
                          <a
                            href={`https://wa.me/${sug.visitorContact.startsWith('595') ? sug.visitorContact : `595${sug.visitorContact.replace(/^0+/, '')}`}?text=${encodeURIComponent(`Hola ${sug.visitorName || ''}, te escribimos desde ServiciosYa respecto a tu sugerencia para sumar '${sug.title}' a la plataforma.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
                            title="Contactar al visitante por WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Contactar ({sug.visitorContact})</span>
                          </a>
                        )}

                        <button
                          onClick={() => handleDeleteSuggestion(sug.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar sugerencia"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Motivo / Tareas sugeridas:
                      </span>
                      <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed font-normal">
                        {sug.description}
                      </p>
                    </div>

                    {/* Admin Actions: Change Status & Add Public Feedback */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                          Cambiar Estado de la Propuesta:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => handleUpdateSuggestionStatus(sug.id, 'reviewing')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              sug.status === 'reviewing'
                                ? 'bg-amber-500 text-slate-950 font-bold shadow-2xs'
                                : 'bg-slate-100 hover:bg-amber-50 text-slate-700'
                            }`}
                          >
                            En Evaluación
                          </button>

                          <button
                            onClick={() => handleUpdateSuggestionStatus(sug.id, 'approved')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              sug.status === 'approved'
                                ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                                : 'bg-slate-100 hover:bg-indigo-50 text-slate-700'
                            }`}
                          >
                            Aprobar
                          </button>

                          <button
                            onClick={() => handleUpdateSuggestionStatus(sug.id, 'implemented')}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              sug.status === 'implemented'
                                ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                                : 'bg-slate-100 hover:bg-emerald-50 text-slate-700'
                            }`}
                          >
                            ¡Ya Incorporado! 🎉
                          </button>

                          {sug.status !== 'pending' && (
                            <button
                              onClick={() => handleUpdateSuggestionStatus(sug.id, 'pending')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100 cursor-pointer"
                            >
                              Volver a Pendiente
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Admin Note / Public feedback */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                          Nota o Respuesta Pública (visible para la comunidad):
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ej: Aprobado. Estamos convocando técnicos matriculados en esta área."
                            value={currentNote}
                            onChange={(e) => setEditingSuggestionNotes({
                              ...editingSuggestionNotes,
                              [sug.id]: e.target.value
                            })}
                            className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-indigo-500 outline-hidden"
                          />
                          <button
                            onClick={() => handleSaveSuggestionNote(sug.id)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
                          >
                            Guardar Nota
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ================= TAB 7: SEGURIDAD ANTI-HACKER ================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Header Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">
                    Escudo Anti-Hacker, Firewall WAF & Control de IPs
                  </h3>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ACTIVO Y VIGILANDO
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  Sistema de defensa perimetral en tiempo real. Bloquea ataques de fuerza bruta al panel administrador al <strong>tercer (3°) intento fallido consecutivo</strong> por dirección IP, neutraliza inyecciones SQL/XSS y restringe el escaneo malicioso de archivos del servidor.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
              <button
                type="button"
                onClick={fetchSecurityData}
                disabled={loadingSecurity}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border border-white/10"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSecurity ? 'animate-spin' : ''}`} />
                <span>Actualizar Métricas</span>
              </button>
              <button
                type="button"
                onClick={handleClearLogs}
                className="px-3.5 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpiar Registros</span>
              </button>
            </div>
          </div>

          {/* Action Success Alert */}
          {securityActionMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{securityActionMsg}</span>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Metric 1 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Regla de Fuerza Bruta
                </span>
                <Lock className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                3 Intentos
              </div>
              <p className="text-[11px] text-slate-500">
                Bloqueo automático de IP por 60 min al 3er error consecutivo
              </p>
            </div>

            {/* Metric 2 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  IPs Bloqueadas Activas
                </span>
                <Ban className="w-4 h-4 text-rose-600" />
              </div>
              <div className={`text-2xl font-black ${securityData && securityData.totalBlockedIps > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                {securityData?.totalBlockedIps || 0}
              </div>
              <p className="text-[11px] text-slate-500">
                Direcciones restringidas actualmente para ingreso administrativo
              </p>
            </div>

            {/* Metric 3 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Ataques / Sondas Neutralizadas
                </span>
                <Activity className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {securityData?.totalAttacksBlocked || 0}
              </div>
              <p className="text-[11px] text-slate-500">
                Escaneos (.env, .git, bot kits, SQLi) detenidos por el WAF
              </p>
            </div>

            {/* Metric 4 */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Tu Dirección IP Actual
                </span>
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base font-mono font-bold text-slate-900 truncate">
                {securityData?.clientIp || '127.0.0.1'}
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Conexión actual autorizada
              </p>
            </div>

          </div>

          {/* Section: Blocked IPs Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Ban className="w-5 h-5 text-rose-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Direcciones IP Bloqueadas por Seguridad ({securityData?.blockedIps?.length || 0})
                  </h4>
                  <p className="text-xs text-slate-500">
                    IPs inhabilitadas tras superar el umbral de 3 intentos fallidos de acceso al panel
                  </p>
                </div>
              </div>
            </div>

            {(!securityData?.blockedIps || securityData.blockedIps.length === 0) ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h5 className="text-sm font-bold text-slate-800">
                  No hay direcciones IP bloqueadas actualmente
                </h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  El sistema no registra bloqueos activos por fuerza bruta. Si un usuario o atacante comete 3 intentos erróneos, su IP aparecerá listada en esta tabla de inmediato con opción de desbloqueo.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Dirección IP</th>
                      <th className="py-3 px-4">Motivo / Causa</th>
                      <th className="py-3 px-4">Intentos Registrados</th>
                      <th className="py-3 px-4">Fecha Bloqueo</th>
                      <th className="py-3 px-4">Tiempo Restante</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
                    {securityData.blockedIps.map((record) => {
                      const remainingMin = Math.max(0, Math.ceil((record.blockedUntil - Date.now()) / 60000));
                      return (
                        <tr key={record.ip} className="hover:bg-rose-50/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-rose-700">
                            {record.ip}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-block bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-md">
                              {record.reason || '3 intentos fallidos consecutivos'}
                            </span>
                            {record.lastAttemptedUser && (
                              <span className="block text-[11px] text-slate-500 mt-0.5">
                                Intentó con: "{record.lastAttemptedUser}"
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-rose-600">
                              {record.failedAttempts} de 3 intentos
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {new Date(record.blockedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({new Date(record.blockedAt).toLocaleDateString()})
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {remainingMin} min
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleUnblockIp(record.ip)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer shadow-2xs"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Desbloquear IP</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Manual IP Block Form */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Ban className="w-5 h-5 text-slate-700" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">
                  Bloquear Dirección IP Sospechosa Manualmente
                </h4>
                <p className="text-xs text-slate-500">
                  Permite inhabilitar de manera preventiva una IP identificada en ataques o tráfico anómalo.
                </p>
              </div>
            </div>

            <form onSubmit={handleManualBlock} className="flex flex-col sm:flex-row items-end gap-3 pt-1">
              <div className="w-full sm:w-1/3">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Dirección IP
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: 190.128.45.12"
                  value={manualIpToBlock}
                  onChange={(e) => setManualIpToBlock(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <div className="w-full sm:flex-1">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Motivo o Justificación
                </label>
                <input
                  type="text"
                  placeholder="Ej: Tráfico malicioso detectado en registros de red"
                  value={manualBlockReason}
                  onChange={(e) => setManualBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-2xs"
              >
                <Ban className="w-4 h-4" />
                <span>Bloquear IP por 24h</span>
              </button>
            </form>
          </div>

          {/* Section: Live Security Audit Log */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-0">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-indigo-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Registro de Auditoría de Ciberseguridad en Tiempo Real ({securityData?.auditLogs?.length || 0})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Historial de eventos: bloqueos de IP, intentos fallidos, escaneos interceptados y accesos válidos
                  </p>
                </div>
              </div>
            </div>

            {(!securityData?.auditLogs || securityData.auditLogs.length === 0) ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No hay eventos registrados en la sesión actual.
              </div>
            ) : (
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider z-10">
                    <tr>
                      <th className="py-2.5 px-4">Hora</th>
                      <th className="py-2.5 px-4">Severidad</th>
                      <th className="py-2.5 px-4">Tipo de Evento</th>
                      <th className="py-2.5 px-4">IP Origen</th>
                      <th className="py-2.5 px-4">Detalle del Suceso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium">
                    {securityData.auditLogs.map((log) => {
                      const severityBadge = {
                        critical: 'bg-rose-100 text-rose-800 border-rose-200',
                        high: 'bg-amber-100 text-amber-800 border-amber-200',
                        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                        low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      }[log.severity || 'medium'];

                      const typeLabel = {
                        ip_blocked: 'IP BLOQUEADA (3 INTENTOS)',
                        failed_login: 'INTENTO FALLIDO ADMIN',
                        successful_login: 'ACCESO CORRECTO ADMIN',
                        exploit_probe: 'ESCANEO WAF DETENIDO',
                        manual_unblock: 'DESBLOQUEO MANUAL IP',
                        manual_block: 'BLOQUEO MANUAL IP',
                      }[log.type] || log.type;

                      return (
                        <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="py-2.5 px-4 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${severityBadge}`}>
                              {log.severity}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-800 whitespace-nowrap text-[11px]">
                            {typeLabel}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-indigo-700 whitespace-nowrap">
                            {log.ip}
                          </td>
                          <td className="py-2.5 px-4 text-slate-700 leading-relaxed">
                            {log.details}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Quick assign feature modal */}
      {selectedProfForFeature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>Gestionar Destacado para {selectedProfForFeature.name}</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seleccionar Plan</label>
              <select
                value={targetTier}
                onChange={(e) => setTargetTier(e.target.value as FeaturedTier)}
                className="w-full p-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-900 outline-hidden transition-all"
              >
                <option value="none">Sin Destacado (Estándar)</option>
                <option value="bronze">Destacado Bronce</option>
                <option value="silver">Destacado Plata</option>
                <option value="gold">Destacado Oro Premium</option>
              </select>
            </div>

            {targetTier !== 'none' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duración (Meses)</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={targetDuration}
                  onChange={(e) => setTargetDuration(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-900 outline-hidden transition-all"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedProfForFeature(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleApplyFeatured}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Aplicar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
