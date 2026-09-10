import React from 'react';
import { ShieldAlert, X, UserPlus, Mail, AlertTriangle, Check } from 'lucide-react';

interface DemoNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  itemType?: 'profesional' | 'trabajo' | 'auspiciante';
  name?: string;
  onOpenRegister?: () => void;
}

export const DemoNoticeModal: React.FC<DemoNoticeModalProps> = ({
  isOpen,
  onClose,
  title = 'Perfil de Demostración (Datos de Muestra)',
  itemType = 'profesional',
  name,
  onOpenRegister,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="demo-notice-modal"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Amber Header Ribbon */}
        <div className="bg-amber-500 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-white shrink-0" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-amber-600/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-3.5 bg-amber-50 border border-amber-200/80 p-3.5 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <p className="font-bold text-amber-950 mb-1">
                Contacto no disponible en perfiles demo
              </p>
              {itemType === 'profesional' ? (
                <p>
                  El perfil de <strong>{name || 'este profesional'}</strong> es un ejemplo ilustrativo cargado para mostrar las funciones de la plataforma. Para proteger a terceros y no contactar números inexistentes o no autorizados, los enlaces de WhatsApp y llamadas directas están deshabilitados.
                </p>
              ) : itemType === 'trabajo' ? (
                <p>
                  Esta solicitud es un <strong>ejemplo de demostración</strong>. No corresponde a un cliente particular real activo.
                </p>
              ) : (
                <p>
                  Este anuncio es una muestra institucional ilustrativa para auspiciantes de ServiciosYa.
                </p>
              )}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              ¿Querés recibir clientes reales en tu WhatsApp?
            </p>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Si ofrecés servicios de plomería, electricidad, aire acondicionado, limpieza o cualquier oficio en Paraguay, registrate gratis para que los clientes te contacten directamente a tu número real.
            </p>
          </div>

          <div className="space-y-2 pt-1">
            {onOpenRegister && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRegister();
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Registrar mi Perfil Profesional Gratis</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Entendido, volver al directorio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
