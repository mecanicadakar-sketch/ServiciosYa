import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Star, 
  Search,
  Loader2,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { SmartSearchResult, ServiceProfessional } from '../types';
import { api } from '../services/api';
import { openWhatsAppDirect } from '../utils/whatsapp';

interface AiSearchModalProps {
  initialQuery: string;
  allProfessionals: ServiceProfessional[];
  onClose: () => void;
  onSelectProfessional: (p: ServiceProfessional) => void;
}

export const AiSearchModal: React.FC<AiSearchModalProps> = ({
  initialQuery,
  allProfessionals,
  onClose,
  onSelectProfessional,
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SmartSearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.smartAiSearch(text);
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError('No se pudo completar el análisis inteligente. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      runSearch(initialQuery);
    }
  }, [initialQuery]);

  const matchedProfs = allProfessionals.filter(p => 
    p.verificationStatus === 'approved' &&
    (result?.tradeSuggestions || []).some(t => t.toLowerCase() === p.trade.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="ai-search-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-amber-300/60 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-900 text-white flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-800 rounded-lg">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Buscador Inteligente con IA
              </h3>
              <p className="text-[11px] text-indigo-200 font-normal">
                Diagnóstico del problema y recomendación de oficio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal content */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Query input inside modal */}
          <form 
            onSubmit={(e) => { e.preventDefault(); runSearch(query); }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="ai-modal-input"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Describí con tus palabras lo que pasó o necesitás..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-100 hover:bg-slate-100/90 focus:bg-white text-slate-900 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium transition-all"
              />
            </div>
            <button
              id="ai-modal-submit"
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-white" />}
              <span>Analizar</span>
            </button>
          </form>

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Analizando necesidad, detectando oficio y buscando profesionales disponibles...
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Results display */}
          {!loading && result && (
            <div className="space-y-4">
              
              {/* Urgency and diagnosis card */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      Oficios Sugeridos:
                    </span>
                    {result.tradeSuggestions.map((trade, idx) => (
                      <span 
                        key={idx}
                        className="text-xs font-semibold uppercase px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800"
                      >
                        {trade}
                      </span>
                    ))}
                  </div>

                  {/* Urgency pill */}
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    result.urgencyLevel === 'alta'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {result.urgencyLevel === 'alta' ? (
                      <>
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        Urgencia Alta (24hs)
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Prioridad Normal
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal mb-2">
                  {result.problemAnalysis}
                </p>

                <div className="text-[11px] text-indigo-950 bg-indigo-100/70 p-2.5 rounded-lg border border-indigo-200/70 flex items-start gap-1.5">
                  <span className="font-semibold text-indigo-900">Consejo:</span>
                  <span>{result.recommendedAction}</span>
                </div>
              </div>

              {/* Matched professionals list */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                  Profesionales recomendados para tu problema ({matchedProfs.length})
                </h4>

                {matchedProfs.length > 0 ? (
                  <div className="space-y-2.5">
                    {matchedProfs.map((prof) => (
                      <div
                        key={prof.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-xs transition-all flex items-center justify-between gap-3"
                      >
                        <div 
                          className="flex items-center gap-3 cursor-pointer min-w-0"
                          onClick={() => onSelectProfessional(prof)}
                        >
                          <img
                            src={prof.avatar}
                            alt={prof.name}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-slate-900 truncate">
                                {prof.name}
                              </span>
                              {prof.isVerified && (
                                <CheckCircle2 className="w-3 h-3 text-indigo-600 shrink-0" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                              <span className="text-indigo-700 font-semibold">{prof.trade}</span>
                              <span>•</span>
                              <span>{prof.zone}</span>
                              <span>•</span>
                              <span className="text-amber-500 font-semibold flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {prof.rating}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => onSelectProfessional(prof)}
                            className="text-xs text-slate-600 hover:text-slate-900 font-semibold px-2 py-1.5 rounded-md hover:bg-slate-100 hidden sm:inline"
                          >
                            Ver Perfil
                          </button>
                          <button
                            type="button"
                            onClick={() => openWhatsAppDirect(
                              prof.whatsapp,
                              prof.name,
                              prof.trade,
                              query,
                              () => api.trackWhatsAppClick(prof.id)
                            )}
                            className="px-3 py-1.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-all hover:opacity-95"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs text-slate-500">
                      No encontramos profesionales activos de ese oficio en este momento. Te invitamos a revisar todos los servicios disponibles.
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
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
