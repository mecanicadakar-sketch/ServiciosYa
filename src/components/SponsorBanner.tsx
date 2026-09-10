import React from 'react';
import { SponsorBanner as SponsorBannerType } from '../types';
import { ExternalLink, MessageCircle, Megaphone, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface SponsorBannerProps {
  sponsor: SponsorBannerType;
}

export const SponsorBanner: React.FC<SponsorBannerProps> = ({ sponsor }) => {
  if (!sponsor.active) return null;

  const handleClick = () => {
    api.trackSponsorClick(sponsor.id);
    if (sponsor.whatsapp) {
      window.open(`https://wa.me/${sponsor.whatsapp.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(sponsor.sponsorName)}%20los%20contacto%20desde%20ServiciosYa`, '_blank');
    } else if (sponsor.targetUrl) {
      window.open(sponsor.targetUrl, '_blank');
    }
  };

  return (
    <div 
      id={`sponsor-banner-${sponsor.id}`}
      onClick={handleClick}
      className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 text-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all border border-slate-800 my-6"
    >
      <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-48 h-48 bg-indigo-600/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Left: Sponsor badge & info */}
        <div className="flex items-center gap-4 w-full md:w-auto">
          {sponsor.imageUrl && (
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-slate-800">
              <img 
                src={sponsor.imageUrl} 
                alt={sponsor.sponsorName} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-2xs">
                <Megaphone className="w-2.5 h-2.5" />
                Auspiciante Oficial
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {sponsor.sponsorName}
              </span>
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              {sponsor.title}
            </h4>
            <p className="text-xs text-slate-300 line-clamp-2 max-w-xl mt-0.5 font-normal">
              {sponsor.description}
            </p>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="shrink-0 w-full md:w-auto flex items-center justify-end">
          <button
            type="button"
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
          >
            {sponsor.whatsapp ? (
              <>
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Contactar Auspiciante</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Ver Promoción</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
