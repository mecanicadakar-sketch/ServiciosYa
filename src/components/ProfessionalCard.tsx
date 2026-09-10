import React from 'react';
import { motion } from 'motion/react';
import { 
  Star, 
  MapPin, 
  Clock, 
  Award, 
  CheckCircle2, 
  MessageCircle, 
  Sparkles,
  Eye,
  Navigation
} from 'lucide-react';
import { ServiceProfessional } from '../types';
import { openWhatsAppDirect } from '../utils/whatsapp';
import { api } from '../services/api';
import { formatDistanceKm } from '../utils/geoUtils';

interface ProfessionalCardProps {
  professional: ServiceProfessional;
  onSelect: (p: ServiceProfessional) => void;
  distanceKm?: number;
  onDemoContact?: (name: string) => void;
  onOpenReviews?: (p: ServiceProfessional) => void;
}

export const ProfessionalCard: React.FC<ProfessionalCardProps> = ({
  professional,
  onSelect,
  distanceKm,
  onDemoContact,
  onOpenReviews,
}) => {
  const isGold = professional.featuredTier === 'gold';
  const isSilver = professional.featuredTier === 'silver';
  const isBronze = professional.featuredTier === 'bronze';
  const isFeatured = isGold || isSilver || isBronze;
  const isBusy = professional.workStatus === 'busy';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (professional.isDemo) {
      if (onDemoContact) {
        onDemoContact(professional.name);
      }
      return;
    }
    openWhatsAppDirect(
      professional.whatsapp,
      professional.name,
      professional.trade,
      undefined,
      () => api.trackWhatsAppClick(professional.id)
    );
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -10, transition: { duration: 0.2 } }}
      transition={{
        layout: { type: 'spring', damping: 28, stiffness: 300, mass: 0.8 },
        opacity: { duration: 0.25, ease: 'easeOut' },
        scale: { duration: 0.25, ease: 'easeOut' },
        y: { duration: 0.25, ease: 'easeOut' }
      }}
      id={`prof-card-${professional.id}`}
      onClick={() => onSelect(professional)}
      className={`group relative bg-white rounded-xl p-4 sm:p-5 transition-colors duration-150 cursor-pointer flex flex-col justify-between hover:shadow-md ${
        isFeatured
          ? 'border-2 border-indigo-100 shadow-sm'
          : 'border border-slate-200 shadow-sm hover:border-slate-300'
      }`}
    >
      {/* Featured Badge strictly matching the Design HTML */}
      {isFeatured && (
        <div className="absolute -top-3 -right-2 bg-amber-400 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-tighter shadow-xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 fill-white" />
          <span>Destacado</span>
        </div>
      )}

      {/* Card Body */}
      <div>
        <div className="flex items-start gap-3.5 mb-3">
          
          {/* Avatar with visual status dot */}
          <div className="relative w-16 h-16 rounded-xl shrink-0">
            <div className="w-full h-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <img
                src={professional.avatar}
                alt={professional.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Visual indicator (dot) */}
            <span
              title={isBusy ? 'Estado: Ocupado / En trabajo' : 'Estado: Disponible para nuevos trabajos'}
              className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-xs ${
                isBusy ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            >
              {!isBusy && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60"></span>
              )}
              <span className={`relative inline-flex h-2 w-2 rounded-full ${isBusy ? 'bg-amber-100' : 'bg-white'}`}></span>
            </span>
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                {professional.name}
              </h4>
              {professional.isDemo && (
                <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-amber-200 uppercase tracking-tight shrink-0">
                  Demo
                </span>
              )}
              {professional.isVerified && (
                <span className="text-indigo-600 bg-indigo-50 text-[10px] font-bold px-1.5 py-0.5 rounded border border-indigo-100 uppercase shrink-0">
                  Verificado
                </span>
              )}
              {/* Work Status Badge with visual indicator dot */}
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                  isBusy
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
                title={isBusy ? 'Profesional actualmente ocupado' : 'Profesional disponible para trabajos'}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isBusy ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span>{isBusy ? 'Ocupado' : 'Disponible'}</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-0.5 truncate font-medium">
              {professional.trade} {professional.hasMatricula && '• Matriculado'}
            </p>

            {/* Stars & Testimonials */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onOpenReviews) {
                  onOpenReviews(professional);
                } else {
                  onSelect(professional);
                }
              }}
              className="flex items-center gap-1.5 mt-1.5 cursor-pointer group text-left transition-colors"
              title="Ver calificaciones y testimonios o calificar"
            >
              <div className="flex text-amber-400 text-xs">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(professional.rating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-200 fill-slate-100'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-500 font-semibold group-hover:text-indigo-600 transition-colors">
                {professional.rating > 0 ? professional.rating.toFixed(1) : 'Nuevo'}
                <span className="font-normal text-slate-400 ml-1 group-hover:underline">
                  ({professional.reviewCount || 0} {(professional.reviewCount || 0) === 1 ? 'testimonio' : 'testimonios'})
                </span>
              </span>
            </button>
          </div>
        </div>

        {/* Bio summary */}
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
          {professional.bio}
        </p>

        {/* Location, distance & experience pills */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-3 font-medium flex-wrap">
          <span className="flex items-center gap-1 truncate">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {professional.zone}
          </span>
          {distanceKm !== undefined && (
            <>
              <span className="text-slate-300">•</span>
              <span 
                title={`Distancia calculada: ${formatDistanceKm(distanceKm)} desde tu ubicación`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200 shrink-0"
              >
                <Navigation className="w-2.5 h-2.5 text-indigo-600 rotate-45" />
                <span>a {formatDistanceKm(distanceKm)}</span>
              </span>
            </>
          )}
          <span className="text-slate-300">•</span>
          <span className="shrink-0">{professional.experienceYears} años exp.</span>
        </div>

        {/* Price & availability bar with status dot */}
        <div className="bg-slate-50 rounded-lg p-2 mb-2.5 border border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 truncate pr-2">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/80 px-1 py-0.5 rounded border border-emerald-200 shrink-0">
              Gs.
            </span>
            <span className="truncate font-medium text-[11px]">
              {professional.priceEstimate}
            </span>
          </div>
          <div className="text-[10px] font-medium text-slate-600 shrink-0 flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${isBusy ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></span>
            <span className={isBusy ? 'text-amber-700 font-semibold' : 'text-emerald-700 font-semibold'}>
              {isBusy ? 'Ocupado' : (professional.availability.includes('24') ? 'Inmediata 24hs' : 'Disponible')}
            </span>
          </div>
        </div>

        {/* Clicks & Views Counter Badge */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3 px-0.5">
          <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md text-[10px] border border-slate-200/60">
            <Eye className="w-3 h-3 text-indigo-600 shrink-0" />
            <span><strong>{professional.viewsCount || 0}</strong> miraron sus datos</span>
          </span>
          {Boolean(professional.whatsappClicks && professional.whatsappClicks > 0) && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[10px] border border-emerald-200/60">
              <MessageCircle className="w-3 h-3 text-emerald-600 shrink-0" />
              <span>{professional.whatsappClicks} contactaron</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons strictly matching the Design HTML */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
        {/* DIRECT WHATSAPP BUTTON */}
        <button
          id={`btn-whatsapp-${professional.id}`}
          type="button"
          onClick={handleWhatsAppClick}
          className={`flex-1 flex items-center justify-center gap-2 text-white py-2 px-3 rounded-lg font-bold text-sm shadow-xs transition-all hover:opacity-95 ${
            professional.isDemo
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-[#25D366] hover:bg-[#20ba5a]'
          }`}
        >
          <MessageCircle className="w-4 h-4 fill-white shrink-0" />
          <span>{professional.isDemo ? 'WhatsApp (Demo)' : 'WhatsApp'}</span>
        </button>

        {/* Perfil view trigger */}
        <button
          id={`btn-view-profile-${professional.id}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(professional);
          }}
          className="px-3 py-2 border border-slate-200 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          Perfil
        </button>
      </div>

    </motion.div>
  );
};

