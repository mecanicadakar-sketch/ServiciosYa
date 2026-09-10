import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Star, 
  ShieldCheck, 
  Sparkles, 
  Award, 
  Send, 
  Share2,
  Calendar,
  Image as ImageIcon,
  Eye,
  AlertCircle,
  MessageSquareQuote,
  ThumbsUp,
  UserCheck,
  PenLine,
  Filter
} from 'lucide-react';
import { ServiceProfessional, Review } from '../types';
import { openWhatsAppDirect } from '../utils/whatsapp';
import { api } from '../services/api';

interface ProfessionalDetailModalProps {
  professional: ServiceProfessional;
  onClose: () => void;
  onReviewAdded?: (updatedProfessional?: ServiceProfessional) => void;
  onDemoContact?: (name: string) => void;
  initialShowReviewForm?: boolean;
}

export const ProfessionalDetailModal: React.FC<ProfessionalDetailModalProps> = ({
  professional,
  onClose,
  onReviewAdded,
  onDemoContact,
  initialShowReviewForm = false,
}) => {
  const [customMsg, setCustomMsg] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewsCount, setViewsCount] = useState<number>(professional.viewsCount || 0);
  const [whatsappClicks, setWhatsappClicks] = useState<number>(professional.whatsappClicks || 0);

  // Track view of this professional's data on mount
  const isBusy = professional.workStatus === 'busy';

  useEffect(() => {
    api.trackProfileView(professional.id).then(res => {
      if (res?.viewsCount) {
        setViewsCount(res.viewsCount);
        if (res.whatsappClicks !== undefined) {
          setWhatsappClicks(res.whatsappClicks);
        }
      } else {
        setViewsCount(prev => prev + 1);
      }
    });
  }, [professional.id]);

  // Local review state for instant reactive UI updates
  const [localReviews, setLocalReviews] = useState<Review[]>(professional.reviews || []);
  const [localRating, setLocalRating] = useState<number>(professional.rating || 5);
  const [localReviewCount, setLocalReviewCount] = useState<number>(professional.reviewCount || (professional.reviews?.length || 0));

  // Review & Testimonial submission state
  const [showReviewForm, setShowReviewForm] = useState(initialShowReviewForm);
  const [newAuthor, setNewAuthor] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [newServiceType, setNewServiceType] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [recentTestimonialId, setRecentTestimonialId] = useState<string | null>(null);
  const [testimonialFilter, setTestimonialFilter] = useState<'all' | '5stars'>('all');

  useEffect(() => {
    setLocalReviews(professional.reviews || []);
    setLocalRating(professional.rating || 5);
    setLocalReviewCount(professional.reviewCount || (professional.reviews?.length || 0));
  }, [professional]);

  const ratingCounts = React.useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    localReviews.forEach(r => {
      const star = Math.max(1, Math.min(5, Math.round(r.rating || 5)));
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [localReviews]);

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return '¡Excelente! (5/5) • Muy recomendado';
      case 4:
        return 'Muy bueno (4/5) • Gran calidad de trabajo';
      case 3:
        return 'Bueno (3/5) • Cumplió con lo acordado';
      case 2:
        return 'Regular (2/5) • Tuvo detalles a mejorar';
      case 1:
        return 'Insatisfecho (1/5) • No recomendado';
      default:
        return 'Selecciona tu calificación';
    }
  };

  const handleWhatsAppSend = () => {
    if (professional.isDemo) {
      if (onDemoContact) {
        onDemoContact(professional.name);
      }
      return;
    }
    setWhatsappClicks(prev => prev + 1);
    openWhatsAppDirect(
      professional.whatsapp,
      professional.name,
      professional.trade,
      customMsg,
      () => {
        api.trackWhatsAppClick(professional.id).then(res => {
          if (res?.clicks) setWhatsappClicks(res.clicks);
        });
      }
    );
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthor.trim()) {
      setReviewError('Por favor ingresa tu nombre.');
      return;
    }
    if (!newComment.trim()) {
      setReviewError('Por favor escribe una pequeña descripción de tu experiencia con el profesional.');
      return;
    }
    if (newComment.trim().length < 8) {
      setReviewError('Por favor incluye al menos unas palabras sobre el trabajo o la atención recibida.');
      return;
    }

    setReviewError(null);
    setSubmittingReview(true);
    try {
      const res = await api.addReview(professional.id, {
        author: newAuthor.trim(),
        rating: newRating,
        comment: newComment.trim(),
        serviceType: newServiceType.trim() || undefined,
      });

      if (res?.review) {
        setLocalReviews(prev => [res.review, ...prev.filter(r => r.id !== res.review.id)]);
        setRecentTestimonialId(res.review.id);
        if (res.professional) {
          setLocalRating(res.professional.rating);
          setLocalReviewCount(res.professional.reviewCount);
        }
      }

      setReviewSuccess(true);
      setNewAuthor('');
      setNewComment('');
      setNewServiceType('');
      setNewRating(5);
      
      if (onReviewAdded) {
        onReviewAdded(res?.professional);
      }

      setTimeout(() => {
        setReviewSuccess(false);
      }, 4000);
    } catch (err: any) {
      console.error(err);
      setReviewError(err.message || 'Error al publicar tu testimonio. Por favor intenta de nuevo.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="professional-detail-modal"
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
              {professional.trade}
            </span>
            {professional.isVerified && (
              <span className="flex items-center gap-1 text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />
                Verificado
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              id="btn-share-profile"
              onClick={handleShare}
              title="Compartir perfil"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors text-xs font-semibold flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? '¡Copiado!' : 'Compartir'}</span>
            </button>
            <button
              id="btn-close-modal"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body with scroll */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Demo profile disclaimer banner */}
          {professional.isDemo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-950">Perfil de Demostración (Datos de Muestra)</p>
                <p className="mt-0.5 text-amber-800 leading-relaxed">
                  Este perfil fue creado con fines ilustrativos para mostrar el funcionamiento y estética de ServiciosYa Paraguay. Los datos y fotos son de ejemplo y los contactos reales están deshabilitados para evitar molestias a terceros.
                </p>
              </div>
            </div>
          )}

          {/* Profile Hero Block */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover border border-slate-200 shadow-sm"
                referrerPolicy="no-referrer"
              />
              {/* Visual status dot on avatar */}
              <span
                title={isBusy ? 'Estado: Ocupado / No disponible' : 'Estado: Disponible para nuevos trabajos'}
                className={`absolute -bottom-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-xs ${
                  isBusy ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              >
                {!isBusy && (
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
                )}
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isBusy ? 'bg-amber-100' : 'bg-white'}`}></span>
              </span>

              {professional.featuredTier === 'gold' && (
                <span className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-xs">
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {professional.name}
                </h2>
                {professional.isDemo && (
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md">
                    Muestra Demo
                  </span>
                )}
                {professional.hasMatricula && (
                  <span className="text-xs font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    {professional.matricula ? `Matrícula: ${professional.matricula}` : 'Matriculado Oficial'}
                  </span>
                )}
                {/* Visual Status Badge with Dot */}
                <span 
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1.5 ${
                    isBusy
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isBusy ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                  <span>{isBusy ? 'Ocupado actualmente' : 'Disponible para trabajos'}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {professional.zone}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  {professional.experienceYears} años de experiencia
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(true);
                    const el = document.getElementById('seccion-testimonios');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2 py-0.5 rounded font-bold transition-colors cursor-pointer"
                  title="Ver testimonios o dejar tu opinión"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{localRating > 0 ? localRating.toFixed(1) : 'Nuevo'}</span>
                  <span className="text-slate-500 font-normal">({localReviewCount} {localReviewCount === 1 ? 'testimonio' : 'testimonios'})</span>
                </button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 p-2 rounded-lg border border-slate-200">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0">
                  Gs.
                </span>
                <span>Tarifa Estimada: <strong>{professional.priceEstimate}</strong></span>
              </div>

              {/* Real-time Clicks & Views indicator */}
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                  <Eye className="w-3.5 h-3.5 text-indigo-600" />
                  <span><strong>{viewsCount}</strong> personas miraron estos datos</span>
                </div>
                {whatsappClicks > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span><strong>{whatsappClicks}</strong> contactos generados</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* WhatsApp Direct Contact Box */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
              <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
              <span>Contactar directamente por WhatsApp</span>
            </div>
            <p className="text-xs text-emerald-800/80 mb-3">
              Enviá un mensaje directo sin intermediarios. Podés personalizar tu consulta a continuación:
            </p>

            <div className="space-y-2">
              <input
                id="whatsapp-custom-inquiry"
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Ej: Hola, se me rompió la cañería del termotanque en Caballito, ¿podés pasar hoy?"
                className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-xs rounded-lg border border-emerald-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-hidden font-medium"
              />

              <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                <button
                  id="btn-modal-open-whatsapp"
                  onClick={handleWhatsAppSend}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:opacity-95"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Abrir WhatsApp con {professional.name.split(' ')[0]}</span>
                </button>

                {professional.phone && (
                  <button
                    id="btn-modal-call-phone"
                    type="button"
                    onClick={(e) => {
                      if (professional.isDemo) {
                        e.preventDefault();
                        if (onDemoContact) onDemoContact(professional.name);
                        return;
                      }
                      window.location.href = `tel:${professional.phone.replace(/\D/g, '')}`;
                    }}
                    className="w-full sm:w-auto py-2.5 px-4 rounded-lg bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{professional.isDemo ? 'Teléfono (Demo)' : 'Llamar por teléfono'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Bio & Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-2">
              Sobre el profesional
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {professional.bio}
            </p>
          </div>

          {/* Specialties pills */}
          {professional.specialties && professional.specialties.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">
                Especialidades y Servicios incluidos
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {professional.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-indigo-50 text-indigo-800 border border-indigo-100 px-3 py-1 rounded-md font-medium flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability & Zones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Horarios y Disponibilidad</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {professional.availability}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Zonas de Cobertura</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {professional.coverageAreas && professional.coverageAreas.length > 0 ? (
                  professional.coverageAreas.map((area, i) => (
                    <span key={i} className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                      {area}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-600">{professional.zone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Work Gallery */}
          {professional.gallery && professional.gallery.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>Galería de Trabajos Realizados</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {professional.gallery.map((imgUrl, i) => (
                  <div key={i} className="aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group">
                    <img
                      src={imgUrl}
                      alt={`Trabajo realizado ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Testimonials and Reviews Section */}
          <div id="seccion-testimonios" className="pt-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquareQuote className="w-5 h-5 text-indigo-600" />
                  <span>Testimonios y Calificaciones</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {localReviewCount} {localReviewCount === 1 ? 'testimonio' : 'testimonios'}
                  </span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Experiencias reales compartidas por clientes que contrataron a {professional.name}.
                </p>
              </div>

              <button
                id="btn-toggle-review-form"
                onClick={() => {
                  setShowReviewForm(!showReviewForm);
                  setReviewError(null);
                }}
                className={`text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-2xs self-start sm:self-auto ${
                  showReviewForm
                    ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                }`}
              >
                <PenLine className="w-3.5 h-3.5" />
                <span>{showReviewForm ? 'Cerrar Formulario' : 'Dejar mi Testimonio'}</span>
              </button>
            </div>

            {/* Rating Summary Breakdown Box */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 mb-5">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Score badge */}
                <div className="md:col-span-4 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-100 shadow-2xs text-center">
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {localRating > 0 ? localRating.toFixed(1) : '5.0'}
                  </span>
                  <div className="flex items-center text-amber-400 my-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(localRating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {localReviewCount} {localReviewCount === 1 ? 'opinión de cliente' : 'opiniones de clientes'}
                  </span>
                </div>

                {/* Rating bars distribution */}
                <div className="md:col-span-8 space-y-1.5 px-1">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star] || 0;
                    const pct = localReviewCount > 0 ? Math.round((count / localReviewCount) * 100) : (star === 5 ? 100 : 0);
                    return (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-5 text-right font-bold text-slate-600 flex items-center justify-end gap-0.5">
                          {star} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </span>
                        <div className="flex-1 h-2 bg-slate-200/80 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              star >= 4 ? 'bg-amber-400' : star === 3 ? 'bg-amber-300' : 'bg-slate-300'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-10 text-[11px] text-slate-400 text-right font-medium">
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Testimonial Submission Form */}
            {showReviewForm && (
              <form onSubmit={handleReviewSubmit} className="bg-gradient-to-b from-indigo-50/40 to-slate-50 rounded-2xl p-5 border border-indigo-100 shadow-sm mb-6 space-y-4">
                <div className="flex items-center justify-between border-b border-indigo-100/60 pb-3">
                  <div>
                    <h5 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <PenLine className="w-4 h-4 text-indigo-600" />
                      <span>Escribir Testimonio sobre {professional.name}</span>
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tu testimonio y calificación se publican al instante para orientar a otros vecinos.
                    </p>
                  </div>
                </div>

                {/* Rating selection with interactive hover */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    1. Tu Calificación General <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => {
                        const activeStar = hoverRating > 0 ? hoverRating : newRating;
                        return (
                          <button
                            key={s}
                            type="button"
                            onMouseEnter={() => setHoverRating(s)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setNewRating(s)}
                            className="p-1.5 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                            title={`Calificar con ${s} estrella${s > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                s <= activeStar
                                  ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                  : 'text-slate-200 fill-slate-50'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-slate-700 px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200/70">
                      {getRatingLabel(hoverRating || newRating)}
                    </span>
                  </div>
                </div>

                {/* Author & Service Type inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      2. Tu Nombre o Apellido <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="input-review-author"
                      type="text"
                      required
                      value={newAuthor}
                      onChange={(e) => setNewAuthor(e.target.value)}
                      placeholder="Ej: Laura Caballero o Carlos R."
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      3. Trabajo o servicio realizado <span className="text-slate-400 font-normal">(opcional)</span>
                    </label>
                    <input
                      id="input-review-servicetype"
                      type="text"
                      value={newServiceType}
                      onChange={(e) => setNewServiceType(e.target.value)}
                      placeholder="Ej: Reparación de canilla, Arreglo de portón..."
                      className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all shadow-2xs"
                    />
                    {/* Preset suggestion chips */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="text-[10px] text-slate-400 font-medium">Sugerencias:</span>
                      {['Reparación', 'Instalación', 'Mantenimiento', 'Urgencia'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setNewServiceType(tag)}
                          className="text-[10px] font-semibold bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Testimonial Description / Comment */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      4. Tu Testimonio / Pequeña Descripción <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {newComment.length}/500
                    </span>
                  </div>
                  <textarea
                    id="input-review-comment"
                    required
                    maxLength={500}
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe una pequeña descripción de tu experiencia: cómo te atendió, puntualidad, calidad del trabajo, precio y si lo recomendarías..."
                    className="w-full px-3.5 py-2.5 bg-white text-slate-900 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-hidden transition-all shadow-2xs leading-relaxed resize-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sé honesto y respetuoso. Tu testimonio ayuda a miles de familias a elegir con tranquilidad.
                  </p>
                </div>

                {/* Error message */}
                {reviewError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{reviewError}</span>
                  </div>
                )}

                {/* Success alert */}
                {reviewSuccess && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span>¡Muchísimas gracias! Tu testimonio y calificación han sido publicados exitosamente.</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-submit-review"
                    type="submit"
                    disabled={submittingReview}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-sm shadow-indigo-200 cursor-pointer"
                  >
                    {submittingReview ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Publicando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Publicar Testimonio</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Testimonials Filters (if multiple reviews) */}
            {localReviews.length > 2 && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Filter className="w-3.5 h-3.5" /> Filtrar:
                </span>
                <button
                  type="button"
                  onClick={() => setTestimonialFilter('all')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    testimonialFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos ({localReviews.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTestimonialFilter('5stars')}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                    testimonialFilter === '5stars'
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" /> 5 Estrellas ({ratingCounts[5] || 0})
                </button>
              </div>
            )}

            {/* Testimonials Cards List */}
            {localReviews && localReviews.length > 0 ? (
              <div className="space-y-3">
                {(testimonialFilter === '5stars' ? localReviews.filter(r => r.rating === 5) : localReviews).map((rev, idx) => {
                  const initial = rev.author ? rev.author.charAt(0).toUpperCase() : 'C';
                  const avatarBgs = [
                    'bg-indigo-100 text-indigo-700',
                    'bg-emerald-100 text-emerald-700',
                    'bg-amber-100 text-amber-800',
                    'bg-violet-100 text-violet-700',
                    'bg-sky-100 text-sky-700'
                  ];
                  const avatarBg = avatarBgs[idx % avatarBgs.length];
                  const isRecent = rev.id === recentTestimonialId;

                  return (
                    <div
                      key={rev.id}
                      className={`bg-white rounded-2xl p-4 border transition-all ${
                        isRecent
                          ? 'border-emerald-300 ring-2 ring-emerald-100 shadow-sm'
                          : 'border-slate-200/90 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5">
                          {/* Avatar initial circle */}
                          <div className={`w-8 h-8 rounded-full ${avatarBg} font-bold text-xs flex items-center justify-center shrink-0 border border-black/5`}>
                            {initial}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-slate-900">
                                {rev.author}
                              </span>
                              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                <UserCheck className="w-3 h-3 text-emerald-600" />
                                Cliente Verificado
                              </span>
                              {isRecent && (
                                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 animate-pulse">
                                  ¡Recién publicado!
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {rev.date || 'Reciente'}
                            </span>
                          </div>
                        </div>

                        {/* Rating Stars */}
                        <div className="flex items-center gap-1 bg-amber-50/80 px-2 py-1 rounded-lg border border-amber-200/60">
                          <div className="flex items-center text-amber-400">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < rev.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-200 fill-slate-100'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-black text-amber-900 ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </div>

                      {/* Service rendered tag if present */}
                      {rev.serviceType && (
                        <div className="mb-2">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                            🔧 Trabajo: {rev.serviceType}
                          </span>
                        </div>
                      )}

                      {/* Testimonial description text */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100 italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <MessageSquareQuote className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">
                  Aún no hay testimonios registrados para este profesional.
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                  ¿Contrataste a {professional.name}? Comparte tu calificación y una pequeña descripción para ayudar a otros usuarios.
                </p>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(true)}
                  className="mt-3.5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-white hover:bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Escribir el primer testimonio</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-medium">
            ServiciosYa • Plataforma libre de comisiones
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
