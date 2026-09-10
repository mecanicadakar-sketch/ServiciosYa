import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Wrench, 
  CheckCircle2, 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  MapPin, 
  MessageCircle,
  Briefcase
} from 'lucide-react';

interface WelcomeRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterProfessional: () => void;
  onOpenPricing: () => void;
  onOpenMap: () => void;
}

export const WelcomeRegistrationModal: React.FC<WelcomeRegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegisterProfessional,
  onOpenPricing,
  onOpenMap,
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    if (dontShowAgain) {
      try {
        localStorage.setItem('serviciosya_welcome_dismissed_permanent', 'true');
      } catch {
        // ignore storage errors
      }
    }
    try {
      sessionStorage.setItem('serviciosya_welcome_shown', 'true');
    } catch {
      // ignore
    }
    onClose();
  };

  const handleRegister = () => {
    handleClose();
    onRegisterProfessional();
  };

  const handlePricing = () => {
    handleClose();
    onOpenPricing();
  };

  const handleExploreMap = () => {
    handleClose();
    onOpenMap();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      id="welcome-registration-overlay"
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        id="welcome-registration-card"
      >
        {/* Decorative Top Accent Bar with Paraguay Colors (Red, White, Blue) */}
        <div className="h-2 w-full flex">
          <div className="h-full w-1/3 bg-red-600" />
          <div className="h-full w-1/3 bg-white border-y border-slate-200" />
          <div className="h-full w-1/3 bg-blue-700" />
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          id="btn-close-welcome-modal"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors z-20 cursor-pointer"
          title="Cerrar bienvenida"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-5 sm:p-7 overflow-y-auto space-y-5">
          {/* Header */}
          <div className="text-center max-w-lg mx-auto">
            <div className="mx-auto w-16 h-16 rounded-full overflow-hidden border-2 border-sky-500 shadow-xs mb-3 bg-slate-900 flex items-center justify-center">
              <img src="/favicon.svg" alt="ServiciosYa Mascota" className="w-full h-full object-contain" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2 shadow-2xs">
              <span className="text-sm">🇵🇾</span>
              <span>Directorio Nacional • Todo el Paraguay</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ¡Bienvenido a <span className="text-slate-900">Servicios<span className="text-sky-600 italic">YA</span></span> Paraguay!
            </h2>
            
            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              La plataforma que conecta a familias, comercios y obras de los <strong>17 departamentos y Asunción</strong> con los mejores profesionales y técnicos del país.
            </p>
          </div>

          {/* Action Boxes: Professional vs Client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Box 1: For Professionals (Invitation to Register) */}
            <div className="relative rounded-xl p-5 border-2 border-indigo-500/80 bg-gradient-to-br from-indigo-50/70 via-white to-white flex flex-col justify-between shadow-sm">
              <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-2xs">
                Recomendado
              </div>

              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-xs">
                  <Wrench className="w-5 h-5" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  ¿Tenés un oficio o servicio?
                </h3>
                
                <p className="text-xs text-slate-600 mb-3.5 leading-snug">
                  Registrate gratis y recibí pedidos directos de clientes a tu WhatsApp en tu ciudad y departamento.
                </p>

                <ul className="space-y-1.5 mb-4 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Registro inicial <strong>100% gratuito</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    <span>Opción a <strong>Estrella Amarilla en el Mapa</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sin intermediarios ni comisiones</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-indigo-100">
                <button
                  id="btn-welcome-register-now"
                  onClick={handleRegister}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] cursor-pointer"
                >
                  <span>Registrarme como Profesional</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-welcome-view-pricing"
                  onClick={handlePricing}
                  className="w-full py-1.5 px-3 rounded-lg text-indigo-700 hover:bg-indigo-100/60 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Ver Planes y Tarifas en Guaraníes (Gs.)</span>
                </button>
              </div>
            </div>

            {/* Box 2: For Clients (Explore Directory or Map) */}
            <div className="rounded-xl p-5 border border-slate-200 bg-slate-50/60 flex flex-col justify-between hover:border-slate-300 transition-colors">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-3 shadow-xs">
                  <MapPin className="w-5 h-5 text-rose-400" />
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  ¿Buscás contratar a alguien?
                </h3>
                
                <p className="text-xs text-slate-600 mb-3.5 leading-snug">
                  Encontrá electricistas, plomeros, mecánicos, albañiles, niñeras y jardineros verificados en todo Paraguay.
                </p>

                <ul className="space-y-1.5 mb-4 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Profesionales verificados con reseñas</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Exploración por <strong>17 departamentos</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Publicá tu pedido de trabajo gratis</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <button
                  id="btn-welcome-explore-directory"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <span>Explorar Directorio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-welcome-explore-map"
                  onClick={handleExploreMap}
                  className="w-full py-1.5 px-3 rounded-lg text-slate-700 hover:bg-slate-200/60 font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <MapPin className="w-3 h-3 text-rose-500" />
                  <span>Ver Mapa Nacional Interactivo</span>
                </button>
              </div>
            </div>

          </div>

          {/* Footer check: Don't show again */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100 text-xs text-slate-500">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <span>No volver a mostrar esta invitación</span>
            </label>

            <button
              onClick={handleClose}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              Continuar al sitio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
