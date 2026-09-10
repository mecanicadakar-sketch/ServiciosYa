import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, X, Lock, Eye, EyeOff, AlertTriangle, Clock, MessageSquare } from 'lucide-react';
import { api } from '../services/api';

interface AdminLoginModalProps {
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Security status state
  const [clientIp, setClientIp] = useState<string>('...');
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(3);
  const [blockedUntil, setBlockedUntil] = useState<number | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(0);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Fetch security status on mount
  useEffect(() => {
    let isMounted = true;
    api.checkAdminSecurity()
      .then((status) => {
        if (!isMounted) return;
        setClientIp(status.clientIp);
        setIsBlocked(status.isBlocked);
        setAttempts(status.attempts);
        setRemainingAttempts(status.remainingAttempts);
        setBlockedUntil(status.blockedUntil);
        if (status.isBlocked && status.blockedUntil) {
          const diffSec = Math.max(0, Math.floor((status.blockedUntil - Date.now()) / 1000));
          setCountdownSeconds(diffSec);
        }
      })
      .catch(() => {
        // Fallback silently if offline
      })
      .finally(() => {
        if (isMounted) setInitialCheckDone(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown timer when IP is blocked
  useEffect(() => {
    if (!isBlocked || countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsBlocked(false);
          setAttempts(0);
          setRemainingAttempts(3);
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isBlocked, countdownSeconds]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBlocked) return;

    setLoading(true);
    setError(null);
    try {
      const res = await api.login({ email: email.trim(), password, role: 'admin' });
      if (res.user.role !== 'admin') {
        setError('Esta cuenta no posee privilegios de Administrador.');
        return;
      }
      onSuccess(res.user);
      onClose();
    } catch (err: any) {
      // Capture detailed security payload
      if (err.clientIp) setClientIp(err.clientIp);
      if (err.isBlocked) {
        setIsBlocked(true);
        setAttempts(3);
        setRemainingAttempts(0);
        if (err.blockedUntil) {
          setBlockedUntil(err.blockedUntil);
          const diffSec = Math.max(0, Math.floor((err.blockedUntil - Date.now()) / 1000));
          setCountdownSeconds(diffSec || 3600);
        } else {
          setCountdownSeconds(3600);
        }
        setError(err.message || 'Tu dirección IP ha sido bloqueada tras 3 intentos fallidos.');
      } else {
        const newAttempts = err.attempts || attempts + 1;
        setAttempts(newAttempts);
        setRemainingAttempts(Math.max(0, 3 - newAttempts));
        setError(err.message || err.error || 'Credenciales de administrador incorrectas');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-xs">
      <div 
        id="admin-login-modal"
        className="bg-white rounded-2xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-150 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Anti-Hacker Shield Ribbon */}
        <div className={`-mx-6 sm:-mx-7 -mt-6 sm:-mt-7 px-6 py-2.5 flex items-center justify-between text-[11px] font-semibold border-b ${
          isBlocked 
            ? 'bg-rose-600 text-white border-rose-700' 
            : attempts > 0 
              ? 'bg-amber-50 text-amber-900 border-amber-200' 
              : 'bg-emerald-50 text-emerald-900 border-emerald-200'
        }`}>
          <div className="flex items-center gap-1.5">
            {isBlocked ? (
              <ShieldAlert className="w-3.5 h-3.5 text-white animate-pulse shrink-0" />
            ) : (
              <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${attempts > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
            )}
            <span>
              {isBlocked ? 'IP BLOQUEADA POR SISTEMA ANTI-HACKER' : 'Escudo Anti-Hacker Activo • Bloqueo tras 3 intentos'}
            </span>
          </div>
          <span className="font-mono text-[10px] opacity-80">
            IP: {clientIp}
          </span>
        </div>

        {/* Modal Header */}
        <div className="flex items-start justify-between pt-1">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${
              isBlocked 
                ? 'bg-rose-100 border-rose-300 text-rose-600' 
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}>
              {isBlocked ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isBlocked ? 'Acceso Denegado por Seguridad' : 'Acceso Exclusivo Administrador'}
              </h3>
              <p className="text-xs text-slate-500 font-normal">
                {isBlocked ? 'Protección contra intrusión y fuerza bruta' : 'Verificación de servicios, precios, sugerencias y sponsors'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Visual 3-Attempts Tracker */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Tolerancia de Intentos:
            </span>
            <span className={`font-bold ${isBlocked ? 'text-rose-600' : attempts === 2 ? 'text-amber-600' : 'text-slate-600'}`}>
              {isBlocked ? '3 de 3 (Bloqueado)' : `${attempts} de 3 intentos`}
            </span>
          </div>

          {/* 3 Step Indicator Pills */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className={`h-2 rounded-full transition-colors ${
              attempts >= 1 || isBlocked ? (isBlocked ? 'bg-rose-500' : 'bg-amber-500') : 'bg-slate-200'
            }`} title="Intento 1" />
            <div className={`h-2 rounded-full transition-colors ${
              attempts >= 2 || isBlocked ? (isBlocked ? 'bg-rose-500' : 'bg-amber-500') : 'bg-slate-200'
            }`} title="Intento 2" />
            <div className={`h-2 rounded-full transition-colors ${
              attempts >= 3 || isBlocked ? 'bg-rose-600 shadow-xs' : 'bg-slate-200'
            }`} title="Intento 3 (Bloqueo de IP)" />
          </div>

          <p className="text-[11px] text-slate-500 flex items-center justify-between pt-0.5">
            <span>Intento 1</span>
            <span className="font-medium text-amber-700">Intento 2 (Aviso)</span>
            <span className="font-bold text-rose-600">Intento 3 (Bloqueo IP)</span>
          </p>
        </div>

        {/* BLOCKED STATE VIEW */}
        {isBlocked ? (
          <div className="p-4 bg-rose-50/90 border-2 border-rose-300 rounded-2xl space-y-3 animate-in fade-in">
            <div className="flex items-start gap-3 text-rose-900">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-rose-700">
                  Dirección IP Bloqueada
                </p>
                <p className="text-xs leading-relaxed text-rose-950 font-normal">
                  Se registraron <strong>3 intentos no autorizados</strong> con credenciales erróneas. Para prevenir ataques de hackers a la base de datos de profesionales, el ingreso desde tu IP (<span className="font-mono font-bold">{clientIp}</span>) ha sido inhabilitado.
                </p>
              </div>
            </div>

            {/* Countdown Box */}
            <div className="bg-white/90 border border-rose-200 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                <Clock className="w-4 h-4 text-rose-600 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Tiempo de bloqueo restante:</span>
              </div>
              <span className="font-mono text-sm font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                {formatCountdown(countdownSeconds)}
              </span>
            </div>

            {/* WhatsApp Urgent Support Button */}
            <a
              href={`https://wa.me/595975635770?text=Hola%20ServiciosYa%20Paraguay,%20mi%20dirección%20IP%20(${encodeURIComponent(clientIp)})%20ha%20sido%20bloqueada%20en%20el%20panel%20administrador%20por%20error.%20Solicito%20verificación%20y%20desbloqueo.`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Solicitar Desbloqueo por WhatsApp Oficial</span>
            </a>
          </div>
        ) : (
          /* STANDARD / WARNING LOGIN FORM */
          <>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p>{error}</p>
                  {remainingAttempts > 0 && remainingAttempts < 3 && (
                    <p className="font-bold text-rose-800 text-[11px]">
                      ⚠️ ¡Atención! Te quedan {remainingAttempts} intento(s) antes de que tu IP sea bloqueada.
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Usuario Administrador
                </label>
                <input
                  id="admin-login-email"
                  type="text"
                  required
                  autoFocus
                  autoComplete="username"
                  value={email}
                  placeholder="Ingresá tu usuario administrador"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>

              <div>
                <label htmlFor="admin-login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="admin-login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    placeholder="Ingresá tu contraseña"
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs rounded-lg border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded transition-colors cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                id="btn-confirm-admin-login"
                type="submit"
                disabled={loading || isBlocked}
                className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-2"
              >
                <Lock className="w-3.5 h-3.5 text-white" />
                <span>{loading ? 'Verificando credenciales...' : 'Ingresar al Panel de Control'}</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

