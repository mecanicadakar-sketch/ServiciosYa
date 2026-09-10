import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  Building2, 
  Crown, 
  Award, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  HelpCircle,
  CreditCard,
  Zap,
  Mail,
  PhoneCall,
  QrCode,
  Landmark,
  Smartphone,
  Receipt,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { AdminSettings } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings?: AdminSettings | null;
  contactNumber?: string;
  contactEmail?: string;
  initialTab?: 'featured' | 'sponsor' | 'payments';
  onSelectPlan?: (tier: 'bronze' | 'silver' | 'gold') => void;
  onSelectSponsor?: (type: 'hero' | 'feed') => void;
  isLoggedIn?: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  settings,
  contactNumber,
  contactEmail,
  initialTab = 'featured',
  onSelectPlan,
  onSelectSponsor,
  isLoggedIn = false
}) => {
  const [activeTab, setActiveTab] = useState<'featured' | 'sponsor' | 'payments'>(initialTab);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'quarterly'>('monthly');

  // Keep activeTab in sync with initialTab prop whenever modal is opened
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const effectiveContactNumber = settings?.paymentsPhone || contactNumber || settings?.contactWhatsApp || '595975635770';
  const cleanContactNumber = effectiveContactNumber.replace(/\D/g, '');
  const effectiveEmail = contactEmail || settings?.contactEmail || 'serviciosyaparaguay@gmail.com';

  const getWhatsAppPaymentUrl = () => {
    const text = encodeURIComponent('Hola ServiciosYa Paraguay! Tengo una consulta sobre los métodos de pago disponibles (SIPAP, QR, Billeteras Móviles) para abonar mi suscripción o plan publicitario.');
    return `https://wa.me/${cleanContactNumber}?text=${text}`;
  };

  const getWhatsAppPlanUrl = (tier: 'bronze' | 'silver' | 'gold') => {
    const tierName = tier === 'gold' ? 'Oro Premium' : tier === 'silver' ? 'Plata' : 'Bronce';
    const priceText = tier === 'gold' 
      ? (billingPeriod === 'monthly' ? 'Gs. 180.000/mes' : 'Gs. 480.000/trimestre')
      : tier === 'silver'
      ? (billingPeriod === 'monthly' ? 'Gs. 95.000/mes' : 'Gs. 250.000/trimestre')
      : (billingPeriod === 'monthly' ? 'Gs. 50.000/mes' : 'Gs. 135.000/trimestre');
    const text = encodeURIComponent(`Hola ServiciosYa Paraguay! Quiero consultar y activar el Plan Destacado ${tierName} (${priceText}) para mi perfil profesional.`);
    return `https://wa.me/${cleanContactNumber}?text=${text}`;
  };

  const getWhatsAppSponsorUrl = (type: 'hero' | 'feed') => {
    const typeName = type === 'hero' ? 'Banner Portada Principal' : 'Banner Feed Directorio';
    const text = encodeURIComponent(`Hola ServiciosYa Paraguay! Me interesa contratar el espacio publicitario como Auspiciante (${typeName}) para mi empresa.`);
    return `https://wa.me/${cleanContactNumber}?text=${text}`;
  };

  const handleSelectFeatured = (tier: 'bronze' | 'silver' | 'gold') => {
    if (onSelectPlan) {
      onSelectPlan(tier);
      onClose();
    } else {
      window.open(getWhatsAppPlanUrl(tier), '_blank', 'noopener,noreferrer');
    }
  };

  const handleSelectSponsorOption = (type: 'hero' | 'feed') => {
    if (onSelectSponsor) {
      onSelectSponsor(type);
      onClose();
    } else {
      window.open(getWhatsAppSponsorUrl(type), '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 shrink-0">
          <button
            onClick={onClose}
            aria-label="Cerrar ventana"
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-2.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Tarifario Oficial en Guaraníes (Gs.)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Panel de Costos y Planes Comerciales
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 font-normal">
              Inversión transparente para multiplicar tus consultas y dar visibilidad a tu oficio o empresa en todo el Paraguay.
            </p>
          </div>

          {/* Quick Notice: Official contact channels for assistance */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-amber-400/15 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-amber-200">
              <span className="font-bold text-amber-300">Atención y Consultas Comerciales:</span>
              <span className="text-[11px] text-slate-200">Asesoramiento directo sin costo</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`https://wa.me/${effectiveContactNumber}?text=${encodeURIComponent('Hola ServiciosYa Paraguay! Tengo una consulta sobre los planes destacados y tarifas.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
              >
                <MessageCircle className="w-3 h-3" />
                <span>WhatsApp: +595 975 635770</span>
              </a>
              <a
                href={`mailto:${effectiveEmail}?subject=${encodeURIComponent('Consulta de Tarifas y Planes - ServiciosYa Paraguay')}`}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition-colors border border-slate-700"
              >
                <Mail className="w-3 h-3 text-amber-400" />
                <span>{effectiveEmail}</span>
              </a>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <button
              id="pricing-tab-featured"
              type="button"
              onClick={() => setActiveTab('featured')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Profesionales Destacados</span>
            </button>

            <button
              id="pricing-tab-sponsor"
              type="button"
              onClick={() => setActiveTab('sponsor')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sponsor'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Auspiciantes Oficiales (Banners)</span>
            </button>

            <button
              id="pricing-tab-payments"
              type="button"
              onClick={() => setActiveTab('payments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'payments'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Métodos de Pago</span>
            </button>

            {activeTab === 'featured' && (
              <div className="sm:ml-auto flex items-center bg-white/10 p-0.5 rounded-lg border border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    billingPeriod === 'monthly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Mensual
                </button>
                <button
                  type="button"
                  onClick={() => setBillingPeriod('quarterly')}
                  className={`px-3 py-1 rounded-md font-semibold flex items-center gap-1 transition-all ${
                    billingPeriod === 'quarterly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>Trimestral</span>
                  <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-1 rounded-sm">15% OFF</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">

          {/* TAB 1: PROFESIONALES DESTACADOS */}
          {activeTab === 'featured' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* PLAN BRONCE */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-amber-300 shadow-xs flex flex-col justify-between transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                        <Award className="w-3.5 h-3.5 text-amber-600" />
                        <span>Destacado Bronce</span>
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-slate-900">
                        Gs. {billingPeriod === 'monthly' ? '50.000' : '135.000'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {billingPeriod === 'monthly' ? 'por mes (Gs. 1.660 / día)' : 'por trimestre (Gs. 45.000 / mes)'}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 pb-3 border-b border-slate-100">
                      Ideal para profesionales que recién inician y quieren destacar por sobre los perfiles estándar.
                    </p>

                    <ul className="mt-3 space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Insignia oficial de <strong>Profesional Destacado</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Mayor prioridad en búsquedas por oficio y zona</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Estadísticas de visualizaciones y clics a WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Soporte prioritario del equipo de ServiciosYa</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <a
                      href={getWhatsAppPlanUrl('bronze')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Solicitar por WhatsApp</span>
                    </a>

                    {onSelectPlan && (
                      <button
                        type="button"
                        onClick={() => handleSelectFeatured('bronze')}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>Elegir en Registro Profesional</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PLAN PLATA (MÁS POPULAR) */}
                <div className="bg-white rounded-2xl p-5 border-2 border-indigo-600 shadow-md flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    El Más Elegido en Paraguay
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3 mt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Destacado Plata</span>
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-indigo-700">
                        Gs. {billingPeriod === 'monthly' ? '95.000' : '250.000'}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {billingPeriod === 'monthly' ? 'por mes (Gs. 3.160 / día)' : 'por trimestre (Gs. 83.330 / mes)'}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 pb-3 border-b border-slate-100">
                      Duplica las consultas directas en Encarnación y alrededores con alta exposición.
                    </p>

                    <ul className="mt-3 space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2 font-medium text-indigo-950">
                        <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>Todo lo incluido en el Plan Bronce</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Aparición en Carrusel Destacado</strong> en portada</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Insignia <strong>"Recomendado por ServiciosYa"</strong></span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Botón de WhatsApp grande con llamada de acción directa</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Hasta 8 fotos de trabajos realizados en tu ficha</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <a
                      href={getWhatsAppPlanUrl('silver')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Solicitar por WhatsApp</span>
                    </a>

                    {onSelectPlan && (
                      <button
                        type="button"
                        onClick={() => handleSelectFeatured('silver')}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Elegir en Registro Profesional</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* PLAN ORO PREMIUM */}
                <div className="bg-gradient-to-b from-amber-50/70 to-white rounded-2xl p-5 border-2 border-amber-400 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/30 text-amber-900 text-[11px] font-black border border-amber-400/50">
                        <Crown className="w-3.5 h-3.5 text-amber-600" />
                        <span>Oro Premium VIP</span>
                      </span>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">Top #1</span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-amber-900">
                        Gs. {billingPeriod === 'monthly' ? '180.000' : '480.000'}
                      </div>
                      <div className="text-[11px] text-amber-800/80 font-medium">
                        {billingPeriod === 'monthly' ? 'por mes (Gs. 6.000 / día)' : 'por trimestre (Gs. 160.000 / mes)'}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 pb-3 border-b border-amber-100">
                      Máxima exposición garantizada para liderar tu rubro y ser la primera opción del cliente.
                    </p>

                    <ul className="mt-3 space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2 font-semibold text-amber-950">
                        <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Todo lo incluido en el Plan Plata</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Posición #1 asegurada</strong> en búsquedas de tu oficio</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Insignia Dorada Oficial y Verificación en 2 horas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Reenvío prioritario de pedidos urgentes de la zona</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Galería completa de fotos de tus trabajos</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-amber-100 space-y-2">
                    <a
                      href={getWhatsAppPlanUrl('gold')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Solicitar por WhatsApp</span>
                    </a>

                    {onSelectPlan && (
                      <button
                        type="button"
                        onClick={() => handleSelectFeatured('gold')}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Elegir en Registro Profesional</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Free Plan Note */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    <span>¿Prefieres comenzar con el Registro Gratuito?</span>
                  </h4>
                  <p className="text-slate-600 mt-0.5">
                    El registro básico en ServiciosYa es <strong>100% gratis</strong> para siempre. Tendrás ficha de contacto con WhatsApp y aparecerás en las búsquedas estándar. Podés ascender a Destacado cuando quieras.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="shrink-0 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Continuar con Plan Básico
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: AUSPICIANTE OFICIAL (BANNERS Y EMPRESAS) */}
          {activeTab === 'sponsor' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-5 text-emerald-950">
                <div className="flex items-center gap-2 font-bold text-sm mb-1">
                  <Building2 className="w-5 h-5 text-emerald-700" />
                  <span>Publicidad de Alto Rendimiento para Empresas en Itapúa</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed font-normal">
                  Ideal para <strong>ferreterías, corralones, aseguradoras, casas de repuestos, pinturerías y constructoras</strong> que quieren llegar directamente a vecinos y profesionales en el momento justo que compran materiales o contratan servicios.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Banner Hero Portada */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 shadow-xs flex flex-col justify-between transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold">
                        <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Banner Portada Principal (Top Hero)</span>
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Máximo Impacto
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-slate-900">
                        Gs. 380.000 <span className="text-xs text-slate-400 font-normal">/ mes</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        O Gs. 950.000 por trimestre (Ahorro Gs. 190.000)
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 pb-3 border-b border-slate-100">
                      Ubicación privilegiada en la cabecera del portal. Lo primero que ven miles de visitantes diarios de Encarnación y las 30 ciudades de Itapúa.
                    </p>

                    <ul className="mt-3 space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Formato gráfico publicitario (1200 x 400 px y responsive móvil)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Enlace directo con botón a tu <strong>WhatsApp comercial</strong> o sitio web</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>+6.000 impresiones mensuales estimadas</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Reporte mensual de clics y visualizaciones</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <a
                      href={getWhatsAppSponsorUrl('hero')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Consultar por WhatsApp</span>
                    </a>

                    {onSelectSponsor && (
                      <button
                        type="button"
                        onClick={() => handleSelectSponsorOption('hero')}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span>Elegir en Solicitud</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Banner Feed Intermedio */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-emerald-400 shadow-xs flex flex-col justify-between transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold">
                        <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                        <span>Banner Feed Directorio</span>
                      </span>
                    </div>

                    <div className="my-2">
                      <div className="text-2xl font-black text-slate-900">
                        Gs. 250.000 <span className="text-xs text-slate-400 font-normal">/ mes</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        O Gs. 650.000 por trimestre (Ahorro Gs. 100.000)
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 pb-3 border-b border-slate-100">
                      Ubicación nativa intercalada en el listado de resultados de búsqueda del directorio cuando el usuario busca prestadores.
                    </p>

                    <ul className="mt-3 space-y-2 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Banner horizontal de ancho completo con diseño adaptativo</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Botón directo de consulta comercial a tu WhatsApp</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Alta afinidad para venta de materiales, herramientas y servicios</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Rotación controlada para máxima recordación de marca</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 space-y-2">
                    <a
                      href={getWhatsAppSponsorUrl('feed')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Consultar por WhatsApp</span>
                    </a>

                    {onSelectSponsor && (
                      <button
                        type="button"
                        onClick={() => handleSelectSponsorOption('feed')}
                        className="w-full py-2 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Elegir en Solicitud</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Direct WhatsApp Contact for Companies */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">¿Necesitas una propuesta personalizada para tu empresa?</h5>
                    <p className="text-[11px] text-slate-600">Hablamos directamente con gerencia o marketing para armar un paquete a medida.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://wa.me/${effectiveContactNumber}?text=${encodeURIComponent('Hola ServiciosYa Paraguay! Quiero consultar sobre opciones de auspicio y publicidad para mi empresa.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp: +595 975 635770</span>
                  </a>
                  <a
                    href={`mailto:${effectiveEmail}?subject=${encodeURIComponent('Propuesta Comercial Publicidad - ServiciosYa Paraguay')}`}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEDICATED PAYMENTS TAB VIEW */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              {/* Payment Overview Banner */}
              <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-sm border border-emerald-800/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2.5 border border-emerald-500/30">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Pago Seguro y Transparente en Paraguay</span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      Métodos de Pago Disponibles
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      Aceptamos los principales medios de pago en Guaraníes (Gs.) para profesionales y empresas en todo el país. Activación ágil y emisión de factura legal con RUC.
                    </p>
                  </div>

                  <a
                    href={getWhatsAppPaymentUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Pagos: +595 975 635770</span>
                  </a>
                </div>
              </div>

              {/* Steps to Pay & Activate */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>¿Cómo abonar y activar tu plan en 3 sencillos pasos?</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-3">
                        1
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mb-1">Elegí tu Plan o Banner</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Seleccioná el plan que mejor se adapte a tu actividad (Bronce Gs. 50.000, Plata Gs. 95.000, Oro Gs. 180.000 o Auspicio).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('featured')}
                      className="mt-3 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver planes disponibles</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center mb-3">
                        2
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mb-1">Pagá por SIPAP, QR o Giros</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Realizá el abono mediante transferencia bancaria SIPAP, escaneando el código QR o a través de Giros Tigo / Billeteras.
                      </p>
                    </div>
                    <span className="mt-3 text-[11px] font-semibold text-emerald-700">
                      Sin cobros ni comisiones extra
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col justify-between">
                    <div>
                      <div className="w-8 h-8 rounded-lg bg-amber-600 text-white font-black text-xs flex items-center justify-center mb-3">
                        3
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 mb-1">Enviá Comprobante a WhatsApp</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        Envianos la captura o comprobante al WhatsApp {effectiveContactNumber.startsWith('595') ? `+${effectiveContactNumber.slice(0,3)} ${effectiveContactNumber.slice(3,6)} ${effectiveContactNumber.slice(6)}` : effectiveContactNumber} junto con tus datos para emisión de factura legal.
                      </p>
                    </div>
                    <a
                      href={getWhatsAppPaymentUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Contactar ahora</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN EXPLÍCITA: MÉTODOS DE PAGO (Visible en todas las pestañas) */}
          <div id="seccion-metodos-pago" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
            {/* Header de la sección */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      Métodos de Pago
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" />
                      Opciones Habilitadas en Paraguay
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Facilidades de pago en Guaraníes (Gs.) para activar tus planes destacados y espacios publicitarios.
                  </p>
                </div>
              </div>

              {/* Botón directo de contacto a WhatsApp */}
              <a
                id="btn-whatsapp-metodos-pago-header"
                href={getWhatsAppPaymentUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>

            {/* Datos Oficiales de Cuenta Bancaria para Transferencias (SIPAP / SPI) */}
            {(settings?.paymentBankName || settings?.paymentAccountNumber || settings?.paymentTigoMoneyNumber) && (
              <div className="p-4 rounded-xl bg-slate-50/90 border border-slate-200 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-indigo-600" />
                    Datos Oficiales para Transferencias (SIPAP / SPI) y Billeteras
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Acreditación en Guaraníes (Gs.)
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mt-2.5">
                  {settings?.paymentBankName && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Banco / Entidad:</span>
                      <span className="font-semibold text-slate-800">{settings.paymentBankName}</span>
                    </div>
                  )}
                  {settings?.paymentAccountNumber && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Nº de Cuenta:</span>
                      <span className="font-mono font-bold text-slate-800">{settings.paymentAccountNumber}</span>
                    </div>
                  )}
                  {settings?.paymentAccountHolder && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Titular:</span>
                      <span className="font-semibold text-slate-800">{settings.paymentAccountHolder}</span>
                    </div>
                  )}
                  {settings?.paymentRuc && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">RUC / C.I.:</span>
                      <span className="font-mono font-bold text-slate-800">{settings.paymentRuc}</span>
                    </div>
                  )}
                  {settings?.paymentAliasSipap && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Alias SIPAP / SPI:</span>
                      <span className="font-mono font-semibold text-indigo-700">{settings.paymentAliasSipap}</span>
                    </div>
                  )}
                  {settings?.paymentTigoMoneyNumber && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">Giros Tigo / Billeteras:</span>
                      <span className="font-mono font-bold text-amber-800">{settings.paymentTigoMoneyNumber}</span>
                    </div>
                  )}
                </div>
                {settings?.paymentInstructions && (
                  <p className="mt-2.5 text-[11px] text-slate-600 bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/60 leading-relaxed">
                    ℹ️ <strong className="text-amber-950">Instrucciones:</strong> {settings.paymentInstructions}
                  </p>
                )}
              </div>
            )}

            {/* Grid de opciones disponibles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Opción 1: Transferencia Bancaria SIPAP */}
              <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/40 border border-slate-200/80 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                      SIPAP / SPI
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Transferencia Bancaria
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Desde cualquier banco o cooperativa de Paraguay (Itaú, Continental, BNF, ueno, Sudameris, Visión, etc.).
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-2.5 block pt-2 border-t border-slate-200/50">
                  Acreditación directa
                </span>
              </div>

              {/* Opción 2: QR Bancario */}
              <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-emerald-50/40 border border-slate-200/80 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                      <QrCode className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      QR Simple
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Pago con Código QR
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Escaneá el código QR interoperable desde la aplicación de tu banco o billetera digital favorita.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-2.5 block pt-2 border-t border-slate-200/50">
                  Sin recargos ni esperas
                </span>
              </div>

              {/* Opción 3: Giros Tigo y Billeteras */}
              <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-amber-50/40 border border-slate-200/80 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100/80 text-amber-700 flex items-center justify-center">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      Billeteras
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Giros y Billeteras Móviles
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Giros Tigo, Billetera Personal y Zimple habilitados para pagos al instante desde cualquier punto del país.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-2.5 block pt-2 border-t border-slate-200/50">
                  Práctico y 100% móvil
                </span>
              </div>

              {/* Opción 4: Factura Legal con RUC */}
              <div className="p-3.5 rounded-xl bg-slate-50 hover:bg-purple-50/40 border border-slate-200/80 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100/80 text-purple-700 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      DNIT
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mb-1">
                    Factura Legal con RUC
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Emitimos factura legal electrónica con RUC para deducir IVA de profesionales independientes o empresas.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 mt-2.5 block pt-2 border-t border-slate-200/50">
                  IVA 10% incluido
                </span>
              </div>
            </div>

            {/* Banner de contacto directo a WhatsApp específico para pagos */}
            <div className="rounded-xl p-4 sm:p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-emerald-950">
                    ¿Deseas pagar tu plan o consultar los datos de cuenta?
                  </h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Contactanos al número oficial de pagos <span className="font-extrabold">{effectiveContactNumber.startsWith('595') ? `+${effectiveContactNumber.slice(0,3)} ${effectiveContactNumber.slice(3,6)} ${effectiveContactNumber.slice(6)}` : effectiveContactNumber}</span> para recibir los datos de transferencia, código QR o solicitar tu factura legal.
                  </p>
                </div>
              </div>

              <a
                id="btn-whatsapp-consultar-pagos"
                href={getWhatsAppPaymentUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contactar por WhatsApp ({effectiveContactNumber.startsWith('595') ? `+${effectiveContactNumber.slice(0,3)} ${effectiveContactNumber.slice(3,6)}` : effectiveContactNumber})</span>
              </a>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600">
            <span>Contacto soporte tarifas:</span>
            <a
              href={`https://wa.me/${effectiveContactNumber}?text=${encodeURIComponent('Hola ServiciosYa Paraguay! Tengo una consulta sobre los costos y planes de la plataforma.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp: +595 975 635770</span>
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <a
              href={`mailto:${effectiveEmail}?subject=${encodeURIComponent('Consulta de Tarifas - ServiciosYa Paraguay')}`}
              className="text-xs font-semibold text-slate-700 hover:text-indigo-600 flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5 text-amber-500" />
              <span>{effectiveEmail}</span>
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer self-stretch sm:self-auto text-center"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
