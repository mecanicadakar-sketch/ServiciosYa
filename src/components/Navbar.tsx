import React from 'react';
import { 
  Wrench, 
  ShieldCheck, 
  UserCheck, 
  Sparkles, 
  PlusCircle, 
  LogIn, 
  LogOut, 
  Menu, 
  X,
  Search,
  CheckCircle2,
  MapPin,
  Briefcase,
  HelpCircle,
  Lightbulb,
  Zap
} from 'lucide-react';

interface NavbarProps {
  currentView: 'directory' | 'map' | 'jobs' | 'provider' | 'admin' | 'faq';
  setCurrentView?: (view: 'directory' | 'map' | 'jobs' | 'provider' | 'admin' | 'faq') => void;
  onNavigate?: (view: 'directory' | 'map' | 'jobs' | 'provider' | 'admin' | 'faq') => void;
  currentUser: { role: 'guest' | 'provider' | 'admin'; name?: string; email?: string } | null;
  onLogout: () => void;
  onOpenAdminLogin?: () => void;
  onOpenSuggestions?: () => void;
  onOpenPricing?: () => void;
  pendingCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  onNavigate,
  currentUser,
  onLogout,
  onOpenAdminLogin,
  onOpenSuggestions,
  onOpenPricing,
  pendingCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navigateTo = (view: 'directory' | 'map' | 'jobs' | 'provider' | 'admin' | 'faq') => {
    if (onNavigate) {
      onNavigate(view);
    } else if (setCurrentView) {
      setCurrentView(view);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo - Official Hormiguita Mascot */}
          <div 
            id="brand-logo"
            onClick={() => { navigateTo('directory'); setMobileMenuOpen(false); }}
            className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-sky-500 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center bg-slate-900 shrink-0">
              <img 
                src="/favicon.svg" 
                alt="ServiciosYa Logo Mascot" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-slate-900">
                  Servicios<span className="text-sky-600 font-black italic">YA</span>
                </span>
                <span className="text-sky-700 bg-sky-50 text-[10px] font-bold px-1.5 py-0.5 rounded border border-sky-200 uppercase tracking-tight hidden sm:inline-block">
                  Paraguay
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium -mt-0.5 hidden lg:block">
                Directorio Inteligente de Oficios
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
            <button
              id="nav-directory-btn"
              onClick={() => navigateTo('directory')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'directory'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              Explorar Directorio
            </button>

            {/* Paraguay Map View Button */}
            <button
              id="nav-map-btn"
              onClick={() => navigateTo('map')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'map'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Mapa Nacional</span>
            </button>

            {/* Pedidos de Trabajo (beBee Marketplace) */}
            <button
              id="nav-jobs-btn"
              onClick={() => navigateTo('jobs')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'jobs'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Pedidos de Trabajo</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full hidden lg:inline">
                Nuevo
              </span>
            </button>

            {/* Provider Section */}
            <button
              id="nav-provider-btn"
              onClick={() => navigateTo('provider')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'provider'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-indigo-500" />
              <span>{currentUser?.role === 'provider' ? 'Mi Panel Profesional' : 'Publicar mi Servicio'}</span>
            </button>

            {/* FAQ & Guias Profesionales */}
            <button
              id="nav-faq-btn"
              onClick={() => navigateTo('faq')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'faq'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Guía & FAQ</span>
            </button>

            {/* Tarifas y Costes Oficiales */}
            {onOpenPricing && (
              <button
                id="nav-pricing-btn"
                type="button"
                onClick={onOpenPricing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-indigo-900 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                title="Consultar costos de publicación, planes destacados y auspicios oficiales"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>Costes y Tarifas</span>
              </button>
            )}

            {/* Buzón de Sugerencias de la Comunidad */}
            <button
              id="nav-suggestions-btn"
              onClick={() => {
                if (onOpenSuggestions) onOpenSuggestions();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs lg:text-sm font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
              title="Sugerir un nuevo oficio o servicio para agregar a ServiciosYa"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span>Sugerir Oficio</span>
            </button>

            {/* Admin Exclusive Panel */}
            <button
              id="nav-admin-btn"
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  navigateTo('admin');
                } else if (onOpenAdminLogin) {
                  onOpenAdminLogin();
                } else {
                  navigateTo('admin');
                }
              }}
              className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                currentView === 'admin'
                  ? 'bg-indigo-900 text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Admin Panel</span>
              {pendingCount > 0 && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold leading-none text-white bg-rose-600 rounded-full">
                  {pendingCount}
                </span>
              )}
            </button>
          </nav>

          {/* User Auth Status / Quick Action according to Design HTML */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser?.role ? (
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-800 leading-tight">
                    {currentUser.name || (currentUser.role === 'admin' ? 'Administrador' : 'Mi Perfil')}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-indigo-600">
                    {currentUser.role === 'admin' ? 'Administrador' : 'Profesional'}
                  </span>
                </div>
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  id="btn-login-quick"
                  onClick={() => {
                    if (onOpenAdminLogin) {
                      onOpenAdminLogin();
                    } else {
                      navigateTo('provider');
                    }
                  }}
                  className="bg-white border border-indigo-600 text-indigo-600 px-4 py-1.5 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors"
                >
                  Ingresar
                </button>
                <button
                  id="btn-cta-post"
                  onClick={() => navigateTo('provider')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg font-medium text-sm shadow-md shadow-indigo-100 transition-all hover:scale-[1.01]"
                >
                  Registrarse
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center md:hidden gap-2">
            {pendingCount > 0 && currentView !== 'admin' && (
              <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold text-white bg-rose-600 rounded-full">
                {pendingCount}
              </span>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <button
            id="mobile-nav-directory"
            onClick={() => { navigateTo('directory'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2.5 ${
              currentView === 'directory' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            Explorar Directorio
          </button>

          <button
            id="mobile-nav-map"
            onClick={() => { navigateTo('map'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
              currentView === 'map' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Mapa Nacional (Departamentos)</span>
            </div>
            <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-medium">17 Deptos</span>
          </button>

          <button
            id="mobile-nav-jobs"
            onClick={() => { navigateTo('jobs'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
              currentView === 'jobs' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              <span>Pedidos de Trabajo</span>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Nuevo</span>
          </button>

          <button
            id="mobile-nav-provider"
            onClick={() => { navigateTo('provider'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
              currentView === 'provider' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>{currentUser?.role === 'provider' ? 'Mi Panel Profesional' : 'Publicar mi Servicio'}</span>
            </div>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Gratis</span>
          </button>

          <button
            id="mobile-nav-faq"
            onClick={() => { navigateTo('faq'); setMobileMenuOpen(false); }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
              currentView === 'faq' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>Guía & FAQ Profesionales</span>
            </div>
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold">Paso a Paso</span>
          </button>

          {onOpenPricing && (
            <button
              id="mobile-nav-pricing"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPricing();
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between text-indigo-950 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="font-semibold">Costes y Tarifas</span>
              </div>
              <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Gs.</span>
            </button>
          )}

          <button
            id="mobile-nav-suggestions"
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenSuggestions) onOpenSuggestions();
            }}
            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between text-amber-950 bg-amber-50/80 hover:bg-amber-100 border border-amber-200"
          >
            <div className="flex items-center gap-2.5">
              <Lightbulb className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span className="font-semibold">Sugerir Oficio o Servicio</span>
            </div>
            <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-bold">Buzón</span>
          </button>

          <button
            id="mobile-nav-admin"
            onClick={() => {
              setMobileMenuOpen(false);
              if (currentUser?.role === 'admin') {
                navigateTo('admin');
              } else if (onOpenAdminLogin) {
                onOpenAdminLogin();
              } else {
                navigateTo('admin');
              }
            }}
            className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex items-center justify-between ${
              currentView === 'admin' ? 'bg-indigo-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Admin Panel</span>
            </div>
            {pendingCount > 0 && (
              <span className="bg-rose-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            {!currentUser ? (
              <>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAdminLogin) onOpenAdminLogin();
                    else navigateTo('provider');
                  }}
                  className="flex-1 py-2 rounded-lg border border-indigo-600 text-indigo-600 text-xs font-semibold hover:bg-indigo-50"
                >
                  Ingresar
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateTo('provider');
                  }}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-sm"
                >
                  Registrarse
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between py-1">
                <span className="text-xs font-bold text-slate-800">
                  {currentUser.name || (currentUser.role === 'admin' ? 'Administrador' : 'Mi Perfil')}
                </span>
                <button
                  onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                  className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

