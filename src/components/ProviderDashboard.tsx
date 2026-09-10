import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserPlus, 
  LogIn, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Eye, 
  MessageCircle, 
  Save, 
  ShieldCheck, 
  DollarSign,
  Plus,
  Image as ImageIcon,
  Check,
  Star,
  ExternalLink,
  Award,
  Crown,
  Building2,
  Megaphone,
  Zap,
  MousePointerClick,
  TrendingUp,
  BarChart3,
  Radio,
  Power,
  HelpCircle,
  Calendar,
  Activity,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { ServiceProfessional, TradeCategory, AdminSettings } from '../types';
import { ALL_TRADES, INITIAL_ZONES } from '../data/seedData';
import { PARAGUAY_DEPARTMENTS } from '../data/paraguayData';
import { api } from '../services/api';
import { PricingModal } from './PricingModal';
import { ProviderPerformanceDashboard } from './ProviderPerformanceDashboard';

export interface DailyClicksHistory {
  dateKey: string;
  dateLabel: string;
  dayName: string;
  fullLabel: string;
  clics: number;
  vistas: number;
  isToday: boolean;
}

export const generate7DayClicksHistory = (
  professionalId: string,
  totalClicks: number,
  totalViews: number
): DailyClicksHistory[] => {
  const result: DailyClicksHistory[] = [];
  const now = new Date();

  // Deterministic relative weights for the past 7 days (index 0 = 6 days ago, index 6 = today)
  const baseWeights = [0.09, 0.12, 0.11, 0.17, 0.13, 0.16, 0.22];

  const storageKey = `serviciosya_wa_7d_${professionalId}`;
  let stored: Record<string, { clics: number; vistas: number }> = {};
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) stored = JSON.parse(raw);
  } catch {
    // fallback
  }

  // Pre-calculate integer distributed clicks
  let allocatedClicks = 0;
  const distributedClicks: number[] = [];
  for (let i = 0; i < 7; i++) {
    if (totalClicks <= 0) {
      distributedClicks.push(0);
    } else {
      const share = Math.round(totalClicks * baseWeights[i]);
      distributedClicks.push(share);
      allocatedClicks += share;
    }
  }

  // Ensure total sum matches totalClicks
  if (totalClicks > 0 && distributedClicks.length === 7) {
    const diff = totalClicks - allocatedClicks;
    distributedClicks[6] = Math.max(0, distributedClicks[6] + diff);
  }

  const updatedStorage: Record<string, { clics: number; vistas: number }> = { ...stored };

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);

    const dayIndex = 6 - i;
    const dateKey = d.toISOString().slice(0, 10);
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    const dayName = dayNames[d.getDay()];
    const dayNum = String(d.getDate()).padStart(2, '0');
    const monthName = monthNames[d.getMonth()];
    const isToday = i === 0;

    let clics = distributedClicks[dayIndex];
    let vistas = Math.max(clics * 2 + 1, Math.round((totalViews || Math.max(totalClicks * 3, 10)) * baseWeights[dayIndex]));

    if (stored[dateKey]) {
      clics = stored[dateKey].clics;
      vistas = stored[dateKey].vistas;
      if (isToday && totalClicks > clics) {
        clics = totalClicks;
      }
    }

    updatedStorage[dateKey] = { clics, vistas };

    result.push({
      dateKey,
      dateLabel: isToday ? `${dayNum} ${monthName} (Hoy)` : `${dayNum} ${monthName}`,
      dayName,
      fullLabel: `${dayName} ${dayNum} de ${monthName}`,
      clics,
      vistas,
      isToday,
    });
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(updatedStorage));
  } catch {
    // Ignore storage errors
  }

  return result;
};

interface ProviderDashboardProps {
  currentUser: { role: 'guest' | 'provider' | 'admin'; name?: string; email?: string; professionalId?: string } | null;
  onLoginSuccess: (user: any, prof?: ServiceProfessional) => void;
  settings: AdminSettings;
  myProfessional?: ServiceProfessional | null;
  professionals?: ServiceProfessional[];
  onRefreshData: () => void;
  onViewAsClient: (p: ServiceProfessional) => void;
  onOpenFaq?: () => void;
  initialWantsFeatured?: boolean;
  initialFeaturedTier?: 'bronze' | 'silver' | 'gold';
  initialWantsSponsor?: boolean;
  initialSponsorType?: 'hero' | 'feed';
  onOpenPricing?: (tab?: 'featured' | 'sponsor') => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  currentUser,
  onLoginSuccess,
  settings,
  myProfessional,
  professionals = [],
  onRefreshData,
  onViewAsClient,
  onOpenFaq,
  initialWantsFeatured,
  initialFeaturedTier,
  initialWantsSponsor,
  initialSponsorType,
  onOpenPricing,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regTrade, setRegTrade] = useState<TradeCategory>('Plomero');
  const [regWhatsapp, setRegWhatsapp] = useState('');
  const [regZone, setRegZone] = useState('Encarnación');
  const [regExperience, setRegExperience] = useState('5');
  const [regPrice, setRegPrice] = useState('Visita diagnóstico desde Gs. 80.000');
  const [regAvailability, setRegAvailability] = useState('Lunes a Sábados 8:00 a 18:00 hs');
  const [regBio, setRegBio] = useState('');
  const [regSpecialties, setRegSpecialties] = useState('');
  const [regHasMatricula, setRegHasMatricula] = useState(false);
  const [regMatricula, setRegMatricula] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80');
  const [regGallery, setRegGallery] = useState('');
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Registro: Opciones de Destacado y Auspiciante
  const [regWantsFeatured, setRegWantsFeatured] = useState(initialWantsFeatured ?? false);
  const [regFeaturedTier, setRegFeaturedTier] = useState<'bronze' | 'silver' | 'gold'>(initialFeaturedTier ?? 'silver');
  const [regWantsSponsor, setRegWantsSponsor] = useState(initialWantsSponsor ?? false);
  const [regSponsorType, setRegSponsorType] = useState<'hero' | 'feed'>(initialSponsorType ?? 'hero');

  // Pricing Modal state
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricingActiveTab, setPricingActiveTab] = useState<'featured' | 'sponsor'>('featured');

  // 7-Day WhatsApp Clicks Trend Chart state (Recharts)
  const [waChartType, setWaChartType] = useState<'area' | 'bar'>('area');
  const [waChartShowViews, setWaChartShowViews] = useState<boolean>(true);

  const handleOpenPricingModal = (tab: 'featured' | 'sponsor' = 'featured') => {
    setPricingActiveTab(tab);
    setShowPricingModal(true);
  };

  // Synchronize when initial props change
  useEffect(() => {
    if (initialWantsFeatured !== undefined) {
      setRegWantsFeatured(initialWantsFeatured);
      setAuthMode('register');
    }
    if (initialFeaturedTier) {
      setRegFeaturedTier(initialFeaturedTier);
    }
  }, [initialWantsFeatured, initialFeaturedTier]);

  useEffect(() => {
    if (initialWantsSponsor !== undefined) {
      setRegWantsSponsor(initialWantsSponsor);
      setAuthMode('register');
    }
    if (initialSponsorType) {
      setRegSponsorType(initialSponsorType);
    }
  }, [initialWantsSponsor, initialSponsorType]);

  // Work Status Toggle (Busy / Available)
  const [workStatus, setWorkStatus] = useState<'available' | 'busy'>(
    myProfessional?.workStatus || 'available'
  );
  const [updatingWorkStatus, setUpdatingWorkStatus] = useState(false);
  const [workStatusSuccess, setWorkStatusSuccess] = useState<string | null>(null);

  // Sync with prop when myProfessional changes
  useEffect(() => {
    if (myProfessional?.workStatus) {
      setWorkStatus(myProfessional.workStatus);
    }
  }, [myProfessional?.workStatus]);

  // Sync edit form fields when myProfessional updates
  useEffect(() => {
    if (myProfessional) {
      setEditBio(myProfessional.bio || '');
      setEditPrice(myProfessional.priceEstimate || '');
      setEditAvailability(myProfessional.availability || '');
      setEditWhatsapp(myProfessional.whatsapp || '');
      setWorkStatus(myProfessional.workStatus || 'available');
    }
  }, [myProfessional?.id]);

  // Toggle status immediately (Busy / Available)
  const handleToggleStatus = async (forcedStatus?: 'available' | 'busy') => {
    if (!myProfessional) return;
    const nextStatus = forcedStatus || (workStatus === 'available' ? 'busy' : 'available');
    setUpdatingWorkStatus(true);
    setWorkStatus(nextStatus);
    try {
      await api.updateProfessional(myProfessional.id, {
        workStatus: nextStatus,
      });
      setWorkStatusSuccess(
        nextStatus === 'available'
          ? '¡Tu estado ahora es Disponible! Los clientes verán el punto verde luminoso en tu tarjeta.'
          : '¡Tu estado ahora es Ocupado! Los clientes verán el punto ámbar en tu tarjeta.'
      );
      onRefreshData();
      setTimeout(() => setWorkStatusSuccess(null), 3500);
    } catch (err) {
      console.error('Error al actualizar disponibilidad:', err);
      // Revert if error
      setWorkStatus(myProfessional.workStatus || 'available');
    } finally {
      setUpdatingWorkStatus(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await api.login({ email: 'carlos.plomero@gmail.com', password: 'password123' });
      onLoginSuccess(data.user, data.professional);
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión demo');
    } finally {
      setLoginLoading(false);
    }
  };

  // Profile Edit Form for logged-in provider
  const [editBio, setEditBio] = useState(myProfessional?.bio || '');
  const [editPrice, setEditPrice] = useState(myProfessional?.priceEstimate || '');
  const [editAvailability, setEditAvailability] = useState(myProfessional?.availability || '');
  const [editWhatsapp, setEditWhatsapp] = useState(myProfessional?.whatsapp || '');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Featured Request Modal / state
  const [requestTier, setRequestTier] = useState<string>('gold');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [requestUpgradeSuccess, setRequestUpgradeSuccess] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);
    try {
      const data = await api.login({ email: loginEmail.trim(), password: loginPassword });
      onLoginSuccess(data.user, data.professional);
    } catch (err: any) {
      setLoginError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError(null);
    try {
      const specs = regSpecialties.split(',').map(s => s.trim()).filter(Boolean);
      const galleryUrls = regGallery.split('\n').map(s => s.trim()).filter(Boolean);

      const notesParts: string[] = [];
      if (regWantsFeatured) {
        notesParts.push(`Solicitó Plan Destacado ${regFeaturedTier.toUpperCase()} en el registro`);
      }
      if (regWantsSponsor) {
        notesParts.push(`Interesado en ser Auspiciante Oficial (${regSponsorType === 'hero' ? 'Banner Portada Hero' : 'Banner Feed Directorio'})`);
      }

      const created = await api.registerProfessional({
        name: regName,
        email: regEmail,
        password: regPassword,
        trade: regTrade,
        whatsapp: regWhatsapp,
        zone: regZone,
        experienceYears: Number(regExperience) || 1,
        priceEstimate: regPrice,
        availability: regAvailability,
        bio: regBio,
        specialties: specs.length > 0 ? specs : ['Servicios generales de ' + regTrade],
        hasMatricula: regHasMatricula,
        matricula: regMatricula,
        avatar: regAvatar,
        gallery: galleryUrls.length > 0 ? galleryUrls : [
          'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80'
        ],
        featuredTier: regWantsFeatured ? regFeaturedTier : 'none',
        adminNotes: notesParts.length > 0 ? notesParts.join(' | ') : undefined,
      });

      onLoginSuccess({
        role: 'provider',
        email: created.email,
        name: created.name,
        professionalId: created.id
      }, created);
      onRefreshData();
    } catch (err: any) {
      setRegError(err.message || 'Error al registrar servicio');
    } finally {
      setRegLoading(false);
    }
  };

  const handleSaveProfileUpdates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myProfessional) return;
    setSavingEdit(true);
    try {
      await api.updateProfessional(myProfessional.id, {
        bio: editBio,
        priceEstimate: editPrice,
        availability: editAvailability,
        whatsapp: editWhatsapp,
        workStatus: workStatus,
      });
      setEditSuccess(true);
      onRefreshData();
      setTimeout(() => setEditSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRequestFeaturedPlan = async () => {
    if (!myProfessional) return;
    // Auto-activates demo plan or opens WhatsApp with admin
    try {
      await api.setFeaturedPlan(myProfessional.id, requestTier, 1);
      setRequestUpgradeSuccess(true);
      onRefreshData();
      setTimeout(() => {
        setShowUpgradeModal(false);
        setRequestUpgradeSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // If user is not logged in as provider, show Login / Register tabs
  if (!currentUser || currentUser.role !== 'provider' || !myProfessional) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-8 animate-in fade-in duration-200">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-semibold mb-3">
            <UserPlus className="w-4 h-4 text-indigo-600" />
            <span>Portal de Profesionales y Oficios</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Sumá tu servicio a <span className="text-indigo-600">ServiciosYa</span>
          </h1>
          <p className="text-sm text-slate-600 mt-2 font-normal">
            Recibí consultas de clientes directamente en tu WhatsApp. Un administrador revisará tus datos para asegurar la calidad de la plataforma.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center">
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200">
            <button
              id="tab-auth-register"
              type="button"
              onClick={() => setAuthMode('register')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registrar Nuevo Servicio (Gratis)
            </button>
            <button
              id="tab-auth-login"
              type="button"
              onClick={() => setAuthMode('login')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ya tengo cuenta / Iniciar Sesión
            </button>
          </div>
        </div>

        {/* REGISTER FORM */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Formulario de Registro Profesional
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-normal">
                  Completá tus datos con información real para publicar tu oficio en Itapúa.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                {onOpenFaq && (
                  <button
                    id="btn-open-faq-header"
                    type="button"
                    onClick={onOpenFaq}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Guía Paso a Paso (FAQ)</span>
                  </button>
                )}
                <button
                  id="btn-open-pricing-header"
                  type="button"
                  onClick={() => handleOpenPricingModal('featured')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-600" />
                  <span>Ver Panel de Costos y Tarifas (Gs.)</span>
                </button>
              </div>
            </div>

            {regError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {regError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tu Nombre o Nombre de Fantasía *</label>
                <input
                  id="reg-input-name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej: Marcelo Gomez o Plomería Total"
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Oficio o Rubro Principal *</label>
                <select
                  id="reg-select-trade"
                  value={regTrade}
                  onChange={(e) => setRegTrade(e.target.value as TradeCategory)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-semibold transition-all"
                >
                  {ALL_TRADES.map(t => (
                    <option key={t.category} value={t.category}>{t.category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico (Para tu cuenta) *</label>
                <input
                  id="reg-input-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nombre@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña *</label>
                <input
                  id="reg-input-password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Crea una contraseña segura"
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Número de WhatsApp *</label>
                <input
                  id="reg-input-whatsapp"
                  type="text"
                  required
                  value={regWhatsapp}
                  onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="Ej: +54 9 11 4455-6677"
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">Acá recibirás los mensajes de los clientes.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Zona Principal (Departamento y Ciudad) *</label>
                <select
                  id="reg-select-zone"
                  value={regZone}
                  onChange={(e) => setRegZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                >
                  {PARAGUAY_DEPARTMENTS.map(dept => (
                    <optgroup key={dept.id} label={`${dept.name} (${dept.badge})`}>
                      <option value={dept.name}>Todo {dept.name}</option>
                      {dept.cities.map(c => (
                        <option key={c.id} value={`${c.name} (${dept.name})`}>
                          {c.name} {c.isCapital ? '• Capital' : ''}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Años de Experiencia *</label>
                <input
                  id="reg-input-experience"
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={regExperience}
                  onChange={(e) => setRegExperience(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            {/* Matrícula check */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  id="reg-check-matricula"
                  type="checkbox"
                  checked={regHasMatricula}
                  onChange={(e) => setRegHasMatricula(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-semibold text-slate-800">
                  ¿Posees Matrícula o Certificación Oficial? (Gasistas, Electricistas, Técnicos de Clima, etc.)
                </span>
              </label>

              {regHasMatricula && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">
                    Número de Matrícula o Institución que certifica
                  </label>
                  <input
                    id="reg-input-matricula-num"
                    type="text"
                    value={regMatricula}
                    onChange={(e) => setRegMatricula(e.target.value)}
                    placeholder="Ej: COPIME #1234 / Metrogas #9822"
                    className="w-full px-3 py-2 bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium"
                  />
                </div>
              )}
            </div>

            {/* Price & availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Estimación de Tarifa / Costo de Visita</label>
                <input
                  id="reg-input-price"
                  type="text"
                  value={regPrice}
                  onChange={(e) => setRegPrice(e.target.value)}
                  placeholder="Ej: Desde Gs. 80.000 visita o Presupuesto sin cargo"
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Días y Horarios de Atención</label>
                <input
                  id="reg-input-availability"
                  type="text"
                  value={regAvailability}
                  onChange={(e) => setRegAvailability(e.target.value)}
                  placeholder="Ej: Lunes a Sábados 8 a 19hs / Urgencias 24hs"
                  className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
                />
              </div>
            </div>

            {/* Specialties & Bio */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Especialidades (Separadas por coma)
              </label>
              <input
                id="reg-input-specialties"
                type="text"
                value={regSpecialties}
                onChange={(e) => setRegSpecialties(e.target.value)}
                placeholder="Ej: Destapes con máquina, Reparación de termotanques, Griferías de cocina"
                className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Descripción de tu trabajo y experiencia *
              </label>
              <textarea
                id="reg-input-bio"
                required
                rows={3}
                value={regBio}
                onChange={(e) => setRegBio(e.target.value)}
                placeholder="Contale a los clientes quién sos, qué herramientas usás, tus garantías de trabajo y por qué deberían elegirte..."
                className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Foto de Perfil URL (opcional)
              </label>
              <input
                id="reg-input-avatar"
                type="url"
                value={regAvatar}
                onChange={(e) => setRegAvatar(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
              />
            </div>

            {/* SECCIÓN PLANES DESTACADOS Y AUSPICIANTE CON DERIVACIÓN A PANEL DE COSTOS */}
            <div className="pt-3 border-t border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Visibilidad Destacada y Auspicio Oficial (Opcional)</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 font-normal">
                    Podés publicar gratis o potenciar tus llamadas con un plan destacado o banner publicitario.
                  </p>
                </div>
                <button
                  id="btn-open-pricing-middle"
                  type="button"
                  onClick={() => handleOpenPricingModal('featured')}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Consultar Panel de Costos (Gs.)</span>
                  <ExternalLink className="w-3 h-3 text-indigo-500" />
                </button>
              </div>

              {/* BOX 1: ¿QUIERE SER DESTACADO? */}
              <div className={`p-4 rounded-xl border transition-all ${
                regWantsFeatured 
                  ? 'bg-amber-50/50 border-amber-300 ring-1 ring-amber-300' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      id="reg-check-wants-featured"
                      type="checkbox"
                      checked={regWantsFeatured}
                      onChange={(e) => setRegWantsFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Quiero ser Profesional Destacado en Paraguay</span>
                        <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.2 rounded-full flex items-center gap-1">
                          <span>★</span> Estrella Amarilla en Mapa
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Aparecé en las primeras posiciones de tu rubro en tu departamento y con <strong>Estrella de color amarillo en el Mapa Nacional</strong>.
                      </p>
                    </div>
                  </label>

                  <button
                    id="btn-see-featured-costs"
                    type="button"
                    onClick={() => handleOpenPricingModal('featured')}
                    className="text-[11px] font-bold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 shrink-0 transition-colors cursor-pointer"
                  >
                    Ver Costos Gs.
                  </button>
                </div>

                {/* Sub-opciones de plan cuando está marcado */}
                {regWantsFeatured && (
                  <div className="mt-4 pt-3 border-t border-amber-200/80 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-950">
                        Seleccioná el Plan Destacado que deseas activar:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenPricingModal('featured')}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                      >
                        Comparar beneficios completos
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      
                      {/* Bronce */}
                      <div
                        onClick={() => setRegFeaturedTier('bronze')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          regFeaturedTier === 'bronze'
                            ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-400'
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Bronce</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-800">Gs. 50.000/m</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Prioridad en búsquedas de tu oficio.
                        </p>
                      </div>

                      {/* Plata */}
                      <div
                        onClick={() => setRegFeaturedTier('silver')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all relative ${
                          regFeaturedTier === 'silver'
                            ? 'bg-white border-indigo-600 shadow-xs ring-2 ring-indigo-500'
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <span className="absolute -top-2 right-2 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.2 rounded-full">
                          Más Elegido
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-600" />
                            <span>Plata</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-indigo-700">Gs. 95.000/m</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Carrusel en portada + 2x consultas.
                        </p>
                      </div>

                      {/* Oro */}
                      <div
                        onClick={() => setRegFeaturedTier('gold')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          regFeaturedTier === 'gold'
                            ? 'bg-white border-amber-500 shadow-xs ring-2 ring-amber-500'
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>Oro VIP</span>
                          </span>
                          <span className="text-[10px] font-extrabold text-amber-900">Gs. 180.000/m</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Posición #1 absoluta en tu ciudad.
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* BOX 2: ¿QUIERE SER AUSPICIANTE? */}
              <div className={`p-4 rounded-xl border transition-all ${
                regWantsSponsor 
                  ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-300' 
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}>
                <div className="flex items-start justify-between gap-3">
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      id="reg-check-wants-sponsor"
                      type="checkbox"
                      checked={regWantsSponsor}
                      onChange={(e) => setRegWantsSponsor(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Quiero ser Auspiciante Oficial (Empresas y Comercios)</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.2 rounded-full">
                          Banners Publicitarios
                        </span>
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Para ferreterías, corralones, pinturerías, aseguradoras o empresas que deseen colocar un banner rotativo con enlace a su WhatsApp o catálogo comercial.
                      </p>
                    </div>
                  </label>

                  <button
                    id="btn-see-sponsor-spaces"
                    type="button"
                    onClick={() => handleOpenPricingModal('sponsor')}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 transition-colors cursor-pointer"
                  >
                    Ver Espacios Gs.
                  </button>
                </div>

                {/* Sub-opciones de auspiciante cuando está marcado */}
                {regWantsSponsor && (
                  <div className="mt-4 pt-3 border-t border-emerald-200/80 space-y-2.5 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-950">
                        Seleccioná el espacio publicitario que te interesa:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenPricingModal('sponsor')}
                        className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                      >
                        Ver detalles y especificaciones
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      
                      <div
                        onClick={() => setRegSponsorType('hero')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          regSponsorType === 'hero'
                            ? 'bg-white border-emerald-600 shadow-xs ring-2 ring-emerald-500'
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Banner Portada Principal (Top Hero)</span>
                          <span className="text-[10px] font-extrabold text-emerald-800">Gs. 380.000/m</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          En la cabecera principal del sitio. Máxima visibilidad ante +6.000 vecinos al mes.
                        </p>
                      </div>

                      <div
                        onClick={() => setRegSponsorType('feed')}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          regSponsorType === 'feed'
                            ? 'bg-white border-emerald-600 shadow-xs ring-2 ring-emerald-500'
                            : 'bg-white/80 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">Banner Feed Directorio</span>
                          <span className="text-[10px] font-extrabold text-emerald-800">Gs. 250.000/m</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                          Ubicado en el listado de resultados de búsqueda entre los profesionales.
                        </p>
                      </div>

                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-submit-registration"
                type="submit"
                disabled={regLoading}
                className="w-full py-3 px-6 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-white" />
                <span>{regLoading ? 'Registrando...' : 'Completar Registro y Enviar a Verificación'}</span>
              </button>
              <p className="text-center text-[11px] text-slate-500 mt-2 font-normal">
                Al registrarte aceptas las políticas de publicación de ServiciosYa. Tus datos serán verificados antes de aparecer en búsquedas.
              </p>
            </div>
          </form>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <div className="text-center pb-2">
              <h2 className="text-lg font-bold text-slate-900">
                Iniciar Sesión Profesional
              </h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                Ingresá con el correo y contraseña con los que te registraste.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
              <input
                id="login-input-email"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="nombre@gmail.com"
                className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
              <input
                id="login-input-password"
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all"
              />
            </div>

            <button
              id="btn-submit-login"
              type="submit"
              disabled={loginLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{loginLoading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            </button>

            <button
              id="btn-demo-login-provider"
              type="button"
              onClick={handleDemoLogin}
              disabled={loginLoading}
              className="w-full py-2.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-900 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-indigo-200 shadow-2xs cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Ingresar como Proveedor Demo (Carlos Mendoza - Plomero)</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">
                ¿No tenés cuenta aún?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-indigo-600 font-semibold hover:underline"
                >
                  Registrate gratis
                </button>
              </span>
            </div>
          </form>
        )}

        {/* Modal de Costes y Tarifas Oficiales (Disponible durante el registro) */}
        <PricingModal
          isOpen={showPricingModal}
          onClose={() => setShowPricingModal(false)}
          settings={settings}
          initialTab={pricingActiveTab}
          contactNumber={settings?.contactWhatsApp || '595975635770'}
          onSelectPlan={(tier) => {
            setRegWantsFeatured(true);
            setRegFeaturedTier(tier);
            setShowPricingModal(false);
          }}
          onSelectSponsor={(type) => {
            setRegWantsSponsor(true);
            setRegSponsorType(type);
            setShowPricingModal(false);
          }}
          isLoggedIn={false}
        />

      </div>
    );
  }

  // LOGGED-IN PROVIDER PORTAL VIEW
  const isApproved = myProfessional.verificationStatus === 'approved';
  const isPending = myProfessional.verificationStatus === 'pending';
  const isRejected = myProfessional.verificationStatus === 'rejected';

  // Matched listings for this provider (by ID, email, or WhatsApp)
  const matchedListings = useMemo(() => {
    if (!myProfessional) return [];
    if (!professionals || professionals.length === 0) return [myProfessional];

    const emailMatch = myProfessional.email?.toLowerCase().trim();
    const phoneDigits = myProfessional.whatsapp?.replace(/\D/g, '');

    const matches = professionals.filter(p => {
      if (p.id === myProfessional.id) return true;
      if (emailMatch && p.email && p.email.toLowerCase().trim() === emailMatch) return true;
      if (phoneDigits && phoneDigits.length >= 6 && p.whatsapp && p.whatsapp.replace(/\D/g, '').endsWith(phoneDigits.slice(-6))) return true;
      return false;
    });

    return matches.length > 0 ? matches : [myProfessional];
  }, [myProfessional, professionals]);

  // 7-day WhatsApp clicks trend dataset using recharts
  const wa7DayHistory = useMemo(() => {
    if (!myProfessional) return [];
    const totalClicks = matchedListings.reduce((sum, item) => sum + (Number(item.whatsappClicks) || 0), 0);
    const totalViews = matchedListings.reduce((sum, item) => sum + (Number(item.viewsCount) || 0), 0);
    return generate7DayClicksHistory(myProfessional.id, totalClicks, totalViews);
  }, [myProfessional, matchedListings]);

  const wa7DayTotalClicks = useMemo(() => {
    return wa7DayHistory.reduce((sum, d) => sum + d.clics, 0);
  }, [wa7DayHistory]);

  const wa7DayTotalViews = useMemo(() => {
    return wa7DayHistory.reduce((sum, d) => sum + d.vistas, 0);
  }, [wa7DayHistory]);

  const waPeakDay = useMemo(() => {
    if (wa7DayHistory.length === 0) return null;
    return [...wa7DayHistory].sort((a, b) => b.clics - a.clics)[0];
  }, [wa7DayHistory]);

  const waConversionRate = wa7DayTotalViews > 0 
    ? Math.min(100, (wa7DayTotalClicks / wa7DayTotalViews) * 100).toFixed(1)
    : (wa7DayTotalClicks > 0 ? '100' : '0.0');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with Verification Status */}
      <div className="rounded-2xl p-6 sm:p-7 border shadow-sm bg-slate-900 text-white border-slate-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={myProfessional.avatar}
                alt={myProfessional.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-700 shadow-sm"
                referrerPolicy="no-referrer"
              />
              {/* Visual indicator (dot) on Provider Avatar */}
              <span
                title={workStatus === 'busy' ? 'Estado: Ocupado' : 'Estado: Disponible'}
                className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-slate-900 shadow-xs ${
                  workStatus === 'busy' ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              >
                {workStatus === 'available' && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${workStatus === 'busy' ? 'bg-amber-100' : 'bg-white'}`}></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  {myProfessional.name}
                </h1>
                <span className="bg-indigo-600/80 text-white text-xs font-semibold px-2 py-0.5 rounded uppercase">
                  {myProfessional.trade}
                </span>
                {/* Live Status Pill in Banner */}
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border flex items-center gap-1.5 ${
                  workStatus === 'busy'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${workStatus === 'busy' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`}></span>
                  <span>{workStatus === 'busy' ? 'Ocupado' : 'Disponible'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-normal">
                {myProfessional.zone} • {myProfessional.experienceYears} años de experiencia
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Status Toggle Button in Banner */}
            <button
              id="btn-banner-quick-toggle"
              type="button"
              onClick={() => handleToggleStatus()}
              disabled={updatingWorkStatus}
              title="Alternar entre Disponible y Ocupado"
              className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all border shadow-xs cursor-pointer ${
                workStatus === 'available'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 border-amber-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${workStatus === 'available' ? 'bg-white animate-pulse' : 'bg-slate-950'}`}></span>
              <span>{workStatus === 'available' ? 'Disponible (Activo)' : 'Ocupado (Pausa)'}</span>
            </button>

            <button
              onClick={() => onViewAsClient(myProfessional)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver mi Perfil Público</span>
            </button>
            {onOpenFaq && (
              <button
                id="btn-provider-open-faq"
                type="button"
                onClick={onOpenFaq}
                className="px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 border border-amber-500/30 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Guía Paso a Paso</span>
              </button>
            )}
            <button
              id="btn-logged-in-pricing"
              type="button"
              onClick={() => handleOpenPricingModal('featured')}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ver Tarifas y Destacar</span>
            </button>
          </div>
        </div>

        {/* Verification Status Alert inside Banner */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          {isPending && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-400/20 p-3.5 rounded-xl">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-amber-300 block text-sm">
                  Perfil en Revisión por el Administrador
                </span>
                <p className="text-slate-300 mt-0.5 font-normal">
                  Estamos validando tus datos y matrícula. Te enviaremos una confirmación a {myProfessional.email} una vez publicado en el buscador de ServiciosYa.
                </p>
              </div>
            </div>
          )}

          {isApproved && (
            <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-400/20 p-3.5 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300 block text-sm">
                  ¡Tu Perfil está Verificado y Activo en el Directorio!
                </span>
                <p className="text-slate-300 mt-0.5 font-normal">
                  Los clientes pueden encontrarte y contactarte directamente a tu WhatsApp ({myProfessional.whatsapp}).
                </p>
              </div>
            </div>
          )}

          {isRejected && (
            <div className="flex items-start gap-3 bg-rose-500/10 border border-rose-400/20 p-3.5 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-rose-300 block text-sm">
                  Revisión Pendiente de Corrección
                </span>
                <p className="text-slate-300 mt-0.5 font-normal">
                  Observación del administrador: "{myProfessional.adminNotes || 'Por favor actualiza tus datos de contacto o matrícula.'}"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* REAL-TIME WORK STATUS TOGGLE CARD (DISPONIBLE / OCUPADO) */}
      <div 
        id="provider-status-toggle-card"
        className={`rounded-2xl p-5 sm:p-6 border shadow-xs transition-all duration-200 ${
          workStatus === 'available'
            ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 border-emerald-200'
            : 'bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 border-amber-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              workStatus === 'available'
                ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}>
              <Radio className={`w-5 h-5 ${workStatus === 'available' ? 'animate-pulse' : ''}`} />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Control de Disponibilidad Laboral (Disponible / Ocupado)
                </h2>
                {/* Visual indicator dot badge */}
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                  workStatus === 'available'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${workStatus === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                  <span>{workStatus === 'available' ? 'ESTADO: DISPONIBLE' : 'ESTADO: OCUPADO'}</span>
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl font-normal">
                {workStatus === 'available'
                  ? 'Actualmente tu tarjeta muestra el punto verde luminoso en el directorio y mapa. Los vecinos saben que podés tomar nuevos presupuestos y trabajos de inmediato.'
                  : 'Aparecés con el punto ámbar de ocupado. Ideal cuando estás en una obra, viaje o con la agenda completa para evitar consultas insistentes.'}
              </p>
            </div>
          </div>

          {/* Action Controls: Segmented Buttons + Visual Switch */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {/* Segmented Toggle Control */}
            <div className="bg-slate-200/80 p-1 rounded-xl flex items-center gap-1 border border-slate-300">
              <button
                id="btn-status-available"
                type="button"
                onClick={() => handleToggleStatus('available')}
                disabled={updatingWorkStatus}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  workStatus === 'available'
                    ? 'bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-500'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${workStatus === 'available' ? 'bg-white animate-pulse' : 'bg-emerald-600'}`}></span>
                <span>Disponible</span>
              </button>
              
              <button
                id="btn-status-busy"
                type="button"
                onClick={() => handleToggleStatus('busy')}
                disabled={updatingWorkStatus}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  workStatus === 'busy'
                    ? 'bg-amber-500 text-slate-950 shadow-sm ring-1 ring-amber-400'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${workStatus === 'busy' ? 'bg-slate-950' : 'bg-amber-500'}`}></span>
                <span>Ocupado</span>
              </button>
            </div>

            {/* Quick Switch Toggle */}
            <button 
              id="btn-status-switch-toggle"
              type="button"
              onClick={() => !updatingWorkStatus && handleToggleStatus()}
              title="Clic para cambiar entre Disponible y Ocupado"
              disabled={updatingWorkStatus}
              className="flex items-center gap-2 cursor-pointer select-none bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 transition-colors shadow-2xs"
            >
              <div 
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
                  workStatus === 'available' ? 'bg-emerald-500' : 'bg-amber-400'
                }`}
              >
                <div 
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                    workStatus === 'available' ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-800">
                {workStatus === 'available' ? 'Punto Verde' : 'Punto Ámbar'}
              </span>
            </button>
          </div>
        </div>

        {/* Live Feedback Notification */}
        {workStatusSuccess && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/70 flex items-center gap-2 text-xs font-bold text-slate-800 animate-in fade-in duration-150">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{workStatusSuccess}</span>
          </div>
        )}
      </div>

      {/* Provider WhatsApp Clicks & Performance Analytics Dashboard */}
      <ProviderPerformanceDashboard
        professional={myProfessional}
        allListings={matchedListings}
        onRefreshData={onRefreshData}
        onOpenPricing={(tab) => {
          setPricingActiveTab(tab || 'featured');
          setShowPricingModal(true);
        }}
        onViewAsClient={onViewAsClient}
      />

      {/* Gráfico Recharts: Tendencia Histórica de Clics de WhatsApp (Últimos 7 Días) */}
      <div 
        id="grafico-tendencia-whatsapp-7d"
        className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Tendencia Histórica de Clics de WhatsApp
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Calendar className="w-3 h-3 text-emerald-600" />
                <span>Últimos 7 Días</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Evolución diaria de consultas directas iniciadas por clientes en tu botón de WhatsApp para servicios de <strong className="text-slate-800 font-semibold">{myProfessional.trade}</strong>.
            </p>
          </div>

          {/* Controls: Chart Mode & Views Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              id="btn-toggle-chart-views"
              type="button"
              onClick={() => setWaChartShowViews(!waChartShowViews)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                waChartShowViews 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Comparar clics con aperturas de ficha"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{waChartShowViews ? 'Ocultar Vistas' : 'Comparar con Vistas'}</span>
            </button>

            <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
              <button
                id="btn-chart-mode-area"
                type="button"
                onClick={() => setWaChartType('area')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  waChartType === 'area'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Área Suave
              </button>
              <button
                id="btn-chart-mode-bar"
                type="button"
                onClick={() => setWaChartType('bar')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  waChartType === 'bar'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Barras Diarias
              </button>
            </div>
          </div>
        </div>

        {/* 4 Summary Stats for the 7-day window */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-100/90">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
              Total Clics (7 días)
            </span>
            <div className="text-2xl font-black text-emerald-950 mt-1 flex items-baseline gap-1.5">
              <span>{wa7DayTotalClicks}</span>
              <span className="text-xs font-semibold text-emerald-700">contactos</span>
            </div>
            <p className="text-[10px] text-emerald-700/90 mt-0.5">
              Consultas recibidas en la semana
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Promedio Diario
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
              <span>{(wa7DayTotalClicks / 7).toFixed(1)}</span>
              <span className="text-xs font-semibold text-slate-500">clics / día</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Ritmo promedio de consultas
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Día de Mayor Demanda
            </span>
            <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1 truncate">
              {waPeakDay && waPeakDay.clics > 0 ? (
                <span>{waPeakDay.dayName} <span className="text-xs font-bold text-emerald-600">({waPeakDay.clics} clics)</span></span>
              ) : (
                <span className="text-xs font-semibold text-slate-500">En observación</span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Pico semanal registrado
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Efectividad Semanal
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
              <span>{waConversionRate}%</span>
              <span className="text-xs font-semibold text-emerald-600">conversión</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Clics vs aperturas de ficha
            </p>
          </div>
        </div>

        {/* Recharts Container */}
        <div className="pt-2">
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              {waChartType === 'area' ? (
                <AreaChart
                  data={wa7DayHistory}
                  margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="waGradientClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="waGradientViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]?.payload as DailyClicksHistory;
                        return (
                          <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[170px] space-y-2 pointer-events-none">
                            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 font-bold">
                              <span className="text-slate-200">{item?.fullLabel || label}</span>
                              {item?.isToday && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                                  Hoy
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-emerald-400 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <span>Clics WhatsApp:</span>
                                </span>
                                <span className="text-sm font-black">{item?.clics ?? 0}</span>
                              </div>
                              {waChartShowViews && item?.vistas !== undefined && (
                                <div className="flex items-center justify-between text-indigo-300 font-medium">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                    <span>Visualizaciones:</span>
                                  </span>
                                  <span className="text-xs font-semibold">{item?.vistas ?? 0}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {waChartShowViews && (
                    <Area
                      type="monotone"
                      dataKey="vistas"
                      name="Visualizaciones"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#waGradientViews)"
                    />
                  )}
                  <Area
                    type="monotone"
                    dataKey="clics"
                    name="Clics a WhatsApp"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#waGradientClicks)"
                    activeDot={{ r: 6, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={wa7DayHistory}
                  margin={{ top: 10, right: 12, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="dateLabel" 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis 
                    allowDecimals={false} 
                    tickLine={false} 
                    axisLine={{ stroke: '#e2e8f0' }} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0]?.payload as DailyClicksHistory;
                        return (
                          <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[170px] space-y-2 pointer-events-none">
                            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 font-bold">
                              <span className="text-slate-200">{item?.fullLabel || label}</span>
                              {item?.isToday && (
                                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-bold">
                                  Hoy
                                </span>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-emerald-400 font-bold">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                  <span>Clics WhatsApp:</span>
                                </span>
                                <span className="text-sm font-black">{item?.clics ?? 0}</span>
                              </div>
                              {waChartShowViews && item?.vistas !== undefined && (
                                <div className="flex items-center justify-between text-indigo-300 font-medium">
                                  <span className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                                    <span>Visualizaciones:</span>
                                  </span>
                                  <span className="text-xs font-semibold">{item?.vistas ?? 0}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  {waChartShowViews && (
                    <Bar
                      dataKey="vistas"
                      name="Visualizaciones"
                      fill="#818cf8"
                      radius={[4, 4, 0, 0]}
                    />
                  )}
                  <Bar
                    dataKey="clics"
                    name="Clics a WhatsApp"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Legend and helpful diagnostic info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
              <span className="text-slate-700 font-semibold">Clics directos a WhatsApp</span>
            </div>
            {waChartShowViews && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-indigo-400"></span>
                <span className="text-slate-600 font-medium">Visualizaciones de ficha</span>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-600" />
            <span>Actualizado en vivo según interacciones reales del público</span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form */}
      <form onSubmit={handleSaveProfileUpdates} className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Actualizar Datos de mi Publicación
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              Mantené al día tus tarifas, horarios y teléfono de contacto.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {editSuccess && (
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                <Check className="w-4 h-4" /> ¡Guardado!
              </span>
            )}
            <button
              id="btn-save-provider-profile"
              type="submit"
              disabled={savingEdit}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Save className="w-3.5 h-3.5 text-white" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp de Contacto</label>
            <input
              type="text"
              value={editWhatsapp}
              onChange={(e) => setEditWhatsapp(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tarifa Estimada / Visita</label>
            <input
              type="text"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900 outline-hidden transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Horarios de Atención</label>
            <input
              type="text"
              value={editAvailability}
              onChange={(e) => setEditAvailability(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900 outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Work Status setting inside edit form */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-800">
              Estado de Disponibilidad Laboral (Punto Visual en Tarjeta)
            </label>
            <p className="text-[11px] text-slate-500 mt-0.5 font-normal">
              Elegí cómo querés que los clientes vean tu disponibilidad en el directorio público y mapa.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWorkStatus('available')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                workStatus === 'available'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${workStatus === 'available' ? 'bg-white animate-pulse' : 'bg-emerald-500'}`}></span>
              <span>Disponible</span>
            </button>
            <button
              type="button"
              onClick={() => setWorkStatus('busy')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border cursor-pointer ${
                workStatus === 'busy'
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${workStatus === 'busy' ? 'bg-slate-950' : 'bg-amber-500'}`}></span>
              <span>Ocupado</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción / Bio</label>
          <textarea
            rows={4}
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900 leading-relaxed outline-hidden transition-all"
          />
        </div>
      </form>

      {/* Upgrade to Featured Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-2xl w-full shadow-xl border border-slate-200 space-y-6">
            <div className="text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                Planes de Destacado Oficial
              </span>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">
                Multiplicá tus Consultas por WhatsApp
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto font-normal">
                Aparecé en los primeros lugares de las búsquedas de tu oficio y en el carrusel de portada.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {settings.featuredPrices.map((plan) => (
                <div
                  key={plan.tier}
                  onClick={() => setRequestTier(plan.tier)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    requestTier === plan.tier
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      {plan.name}
                    </span>
                    <div className="text-lg font-bold text-indigo-600 mt-1">
                      Gs. {plan.monthlyPrice.toLocaleString('es-PY')} <span className="text-[10px] text-slate-400 font-normal">/mes</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">
                      {plan.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>

              <div className="flex items-center gap-2">
                {requestUpgradeSuccess && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> ¡Plan activado con éxito!
                  </span>
                )}
                <button
                  id="btn-activate-featured-tier"
                  onClick={handleRequestFeaturedPlan}
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
                >
                  Activar Plan Destacado Ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Panel de Costos y Tarifas Oficiales Modal (Para prestador logueado) */}
      <PricingModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        settings={settings}
        initialTab={pricingActiveTab}
        contactNumber={settings?.paymentsPhone || settings?.contactWhatsApp || '595975635770'}
        onSelectPlan={(tier) => {
          setRequestTier(tier);
          setShowPricingModal(false);
          setShowUpgradeModal(true);
        }}
        onSelectSponsor={(type) => {
          setShowPricingModal(false);
          const contact = (settings?.paymentsPhone || settings?.contactWhatsApp || '595975635770').replace(/\D/g, '');
          const url = `https://wa.me/${contact}?text=${encodeURIComponent(`Hola ServiciosYa Paraguay! Me interesa contratar el espacio de auspicio oficial (${type === 'hero' ? 'Banner Portada Principal' : 'Banner Feed Directorio'}).`)}`;
          window.open(url, '_blank', 'noopener,noreferrer');
        }}
        isLoggedIn={true}
      />

    </div>
  );
};
