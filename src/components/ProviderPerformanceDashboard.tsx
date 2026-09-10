import React, { useState } from 'react';
import { 
  BarChart3, 
  MessageCircle, 
  MousePointerClick, 
  Eye, 
  TrendingUp, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Smartphone, 
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Info,
  Star,
  MessageSquareQuote,
  UserCheck
} from 'lucide-react';
import { ServiceProfessional, Review } from '../types';
import { formatWhatsAppUrl } from '../utils/whatsapp';

interface ProviderPerformanceDashboardProps {
  professional: ServiceProfessional;
  allListings?: ServiceProfessional[];
  onRefreshData: () => void;
  onOpenPricing?: (tab?: 'featured' | 'sponsor') => void;
  onViewAsClient: (p: ServiceProfessional) => void;
}

export const ProviderPerformanceDashboard: React.FC<ProviderPerformanceDashboardProps> = ({
  professional,
  allListings = [],
  onRefreshData,
  onOpenPricing,
  onViewAsClient,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Combine listings or fallback to the single professional profile
  const listings = allListings.length > 0 ? allListings : [professional];

  // Calculate total whatsappClicks across all listings
  const totalWhatsappClicks = listings.reduce((sum, item) => sum + (Number(item.whatsappClicks) || 0), 0);

  // Calculate total profile views
  const totalViews = listings.reduce((sum, item) => sum + (Number(item.viewsCount) || 0), 0);

  // Calculate conversion rate: (whatsappClicks / totalViews) * 100
  const conversionRate = totalViews > 0 
    ? Math.min(100, (totalWhatsappClicks / totalViews) * 100) 
    : (totalWhatsappClicks > 0 ? 100 : 0);

  // Gather all reviews / testimonials across listings
  const allReviews = React.useMemo(() => {
    const list: { review: Review; profName: string; trade: string }[] = [];
    listings.forEach(l => {
      (l.reviews || []).forEach(r => {
        list.push({ review: r, profName: l.name, trade: l.trade });
      });
    });
    return list.sort((a, b) => new Date(b.review.date).getTime() - new Date(a.review.date).getTime());
  }, [listings]);

  const avgScore = allReviews.length > 0
    ? (allReviews.reduce((sum, item) => sum + item.review.rating, 0) / allReviews.length).toFixed(1)
    : (professional.rating > 0 ? professional.rating.toFixed(1) : '5.0');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  const handleTestWhatsApp = (phone: string, name: string, trade: string) => {
    const url = formatWhatsAppUrl(
      phone,
      name,
      trade,
      'Hola! Estoy verificando la recepción de mensajes desde mi perfil en ServiciosYa Paraguay.'
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Performance status diagnostic
  const getPerformanceBadge = () => {
    if (totalWhatsappClicks >= 15 || conversionRate >= 20) {
      return {
        label: 'Alto Rendimiento Comercial',
        color: 'text-emerald-800 bg-emerald-100 border-emerald-300',
        dotColor: 'bg-emerald-500',
        tip: 'Tu perfil genera un excelente volumen de consultas directas. Mantén tus horarios y tarifas actualizados.'
      };
    }
    if (totalWhatsappClicks >= 3 || conversionRate >= 5) {
      return {
        label: 'Rendimiento Óptimo',
        color: 'text-indigo-800 bg-indigo-100 border-indigo-300',
        dotColor: 'bg-indigo-500',
        tip: 'Tus clientes potenciales avanzan hacia WhatsApp. Agregando más fotos de trabajos puedes aumentar la tasa de contacto.'
      };
    }
    return {
      label: 'Perfil en Crecimiento',
      color: 'text-amber-800 bg-amber-100 border-amber-300',
      dotColor: 'bg-amber-500',
      tip: 'Mantén tu estado en Punto Verde (Disponible) para aparecer en los primeros lugares de búsqueda.'
    };
  };

  const badge = getPerformanceBadge();

  return (
    <div id="dashboard-rendimiento-whatsapp" className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-xs space-y-6">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
              Dashboard de Rendimiento y Clics de WhatsApp
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Rastreo Activo</span>
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
            Medición oficial de las interacciones directas recibidas en el botón de WhatsApp de tu perfil en <strong className="text-slate-800 font-semibold">ServiciosYa Paraguay</strong>.
          </p>
        </div>

        <button
          id="btn-refresh-whatsapp-metrics"
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="self-start sm:self-auto px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer shadow-2xs shrink-0 disabled:opacity-50"
        >
          <Clock className={`w-3.5 h-3.5 text-slate-500 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
          <span>{isRefreshing ? 'Actualizando...' : 'Actualizar Clics'}</span>
        </button>
      </div>

      {/* Hero WhatsApp Clicks Highlight Card */}
      <div className="rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white border border-emerald-800/50 shadow-sm relative overflow-hidden">
        {/* Background visual motif */}
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contactos Directos al WhatsApp</span>
            </div>

            <div className="flex items-baseline gap-3">
              <div className="text-4xl sm:text-5xl font-black tracking-tight text-white">
                {totalWhatsappClicks.toLocaleString()}
              </div>
              <span className="text-sm sm:text-base font-semibold text-emerald-200">
                {totalWhatsappClicks === 1 ? 'clic registrado' : 'clics totales acumulados'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Cada clic corresponde a un cliente potencial que presionó el botón de WhatsApp en tu ficha o tarjeta del directorio para iniciar una conversación directa.
            </p>

            {listings.length > 1 && (
              <p className="text-[11px] text-emerald-300 font-medium pt-1">
                ✓ Suma consolidada de tus <strong>{listings.length} publicaciones</strong> activas bajo tu cuenta.
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              id="btn-test-my-whatsapp-link"
              type="button"
              onClick={() => handleTestWhatsApp(professional.whatsapp, professional.name, professional.trade)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Smartphone className="w-4 h-4 text-white" />
              <span>Probar mi Botón de WhatsApp</span>
              <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
            </button>

            <button
              type="button"
              onClick={() => onViewAsClient(professional)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-white/15 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
              <span>Ver mi Ficha en Directorio</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3 Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* KPI 1: Visualizaciones de Perfil */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Visualizaciones de Ficha
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Eye className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {totalViews.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              Veces que usuarios abrieron tu perfil detallado o tu punto geolocalizado en el mapa.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-200/60 text-[10px] text-slate-500 font-medium">
            Rastreo acumulado de visitas
          </div>
        </div>

        {/* KPI 2: Tasa de Conversión a Clic */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tasa de Conversión
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-slate-900 flex items-baseline gap-1">
              <span>{conversionRate.toFixed(1)}%</span>
            </div>
            
            {/* Visual progress bar */}
            <div className="w-full bg-slate-200 rounded-full h-2 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(conversionRate, 5))}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-600 mt-2 leading-relaxed">
              De cada 100 personas que vieron tus datos, cuántas tocaron el botón de WhatsApp.
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-slate-200/60 text-[10px] text-emerald-700 font-bold">
            {conversionRate >= 15 ? '✓ Alta efectividad' : 'Promedio regional: 5% a 15%'}
          </div>
        </div>

        {/* KPI 3: Diagnóstico y Nivel de Impacto */}
        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-700 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Diagnóstico de Perfil
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div className="mt-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                <span className={`w-2 h-2 rounded-full ${badge.dotColor}`}></span>
                <span>{badge.label}</span>
              </span>
            </div>

            <p className="text-[11px] text-slate-600 mt-2.5 leading-relaxed">
              {badge.tip}
            </p>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-200/60">
            {onOpenPricing && (
              <button
                type="button"
                onClick={() => onOpenPricing('featured')}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>¿Quieres más clics? Ver Planes Destacados</span>
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Breakdown per listing / service (if 1 or more) */}
      <div className="rounded-xl border border-slate-200/90 overflow-hidden">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MousePointerClick className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Desglose de Rendimiento por Publicación
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {listings.length} {listings.length === 1 ? 'servicio publicado' : 'servicios publicados'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {listings.map((item) => {
            const itemClicks = Number(item.whatsappClicks) || 0;
            const itemViews = Number(item.viewsCount) || 0;
            const itemRate = itemViews > 0 
              ? Math.min(100, (itemClicks / itemViews) * 100) 
              : (itemClicks > 0 ? 100 : 0);

            return (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{item.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                        {item.trade}
                      </span>
                      {item.featuredTier && item.featuredTier !== 'none' && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300">
                          ⭐ Destacado {item.featuredTier.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {item.zone} • WhatsApp: <span className="font-mono text-slate-700">{item.whatsapp}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6 justify-between sm:justify-end">
                  <div className="text-center sm:text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Vistas</span>
                    <span className="text-xs font-bold text-slate-800">{itemViews.toLocaleString()}</span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="block text-[10px] text-emerald-700 uppercase font-semibold">Clics WhatsApp</span>
                    <span className="text-xs font-black text-emerald-600">{itemClicks.toLocaleString()}</span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="block text-[10px] text-slate-500 uppercase font-semibold">Tasa</span>
                    <span className="text-xs font-bold text-slate-800">{itemRate.toFixed(1)}%</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => onViewAsClient(item)}
                      title="Ver Ficha Pública"
                      className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTestWhatsApp(item.whatsapp, item.name, item.trade)}
                      title="Probar WhatsApp"
                      className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Testimonials and Ratings Received */}
      <div className="rounded-xl border border-slate-200/90 overflow-hidden bg-white">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-indigo-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Testimonios y Calificaciones de Clientes ({allReviews.length})
            </h4>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">
              Promedio: {avgScore} / 5.0
            </span>
          </div>
        </div>

        <div className="p-4">
          {allReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {allReviews.map(({ review, profName, trade }) => (
                <div
                  key={review.id}
                  className="bg-slate-50/60 rounded-xl p-3.5 border border-slate-200/80 hover:border-indigo-200 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-900">
                          {review.author}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          <UserCheck className="w-2.5 h-2.5 text-emerald-600" /> Verificado
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {review.date} • {trade} ({profName})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      <span className="text-xs font-bold text-amber-900">{review.rating}.0</span>
                    </div>
                  </div>

                  {review.serviceType && (
                    <span className="inline-block text-[10px] font-medium bg-white text-slate-600 px-2 py-0.5 rounded border border-slate-200 mb-1.5">
                      🔧 {review.serviceType}
                    </span>
                  )}

                  <p className="text-xs text-slate-600 italic bg-white p-2.5 rounded-lg border border-slate-100">
                    "{review.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">
              <MessageSquareQuote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">
                Aún no has recibido testimonios registrados.
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 max-w-md mx-auto">
                Pide a tus clientes satisfechos que califiquen tu trabajo y escriban una pequeña descripción en tu perfil público para aumentar la confianza y tus clics de WhatsApp.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Practical Tips to Increase WhatsApp Clicks */}
      <div className="bg-slate-50/70 rounded-xl p-4 sm:p-5 border border-slate-200/80">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-indigo-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Recomendaciones para Multiplicar tus Clics de WhatsApp
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white rounded-lg border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-1">1. Mantén tu Punto Verde</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Los prestadores en estado <strong>Disponible</strong> se muestran arriba en los resultados y generan 3 veces más contactos.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-1">2. Tarifa y Horarios Claros</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Indicar tu costo aproximado o de visita en Guaraníes genera mayor confianza para que el vecino dé el paso de escribirte.
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-slate-200/70">
            <span className="font-bold text-slate-900 block mb-1">3. Respuesta Rápida</span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Responder los primeros 10-15 minutos incrementa drásticamente las chances de cerrar el presupuesto.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
