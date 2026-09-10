import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Camera, 
  Smartphone, 
  Award, 
  Lightbulb,
  FileText,
  MessageCircle,
  MapPin,
  ClipboardList
} from 'lucide-react';

interface ProfessionalFaqProps {
  onNavigateToProvider?: () => void;
  onGoToProvider?: () => void;
  onNavigateToPricing?: () => void;
  onOpenPricing?: () => void;
  onOpenRegister?: () => void;
}

type FaqCategory = 'all' | 'registration' | 'profile' | 'hours' | 'featured';

interface FaqItem {
  id: string;
  category: 'registration' | 'profile' | 'hours' | 'featured';
  question: string;
  answer: string | React.ReactNode;
  tags: string[];
}

export const ProfessionalFaq: React.FC<ProfessionalFaqProps> = ({
  onNavigateToProvider,
  onGoToProvider,
  onNavigateToPricing,
  onOpenPricing,
  onOpenRegister,
}) => {
  const handleGoToProvider = onNavigateToProvider || onGoToProvider || onOpenRegister || (() => {});
  const handleGoToPricing = onNavigateToPricing || onOpenPricing;

  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    'reg-step-by-step': true,
    'reg-no-videos': true,
    'profile-1': false,
    'hours-1': false,
  });

  const toggleItem = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const faqItems: FaqItem[] = [
    // --- CATEGORÍA: CÓMO CARGAR TUS DATOS (REGISTRO PASO A PASO) ---
    {
      id: 'reg-step-by-step',
      category: 'registration',
      question: '¿Cómo cargar mis datos para publicar mi servicio paso a paso?',
      answer: (
        <div className="space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            Publicar tu oficio en <strong>ServiciosYa</strong> es 100% gratuito y muy sencillo. No necesitás conocimientos informáticos; solo completás el formulario con tu información cotidiana:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">
                Paso 1: Datos Personales
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">Nombre, Oficio y WhatsApp</p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Escribí tu nombre (o nombre de tu taller), seleccioná tu oficio principal (Electricista, Plomero, etc.) y tu número de celular para que los clientes te escriban directo.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">
                Paso 2: Zonas de Cobertura
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">Municipio Base y Zonas</p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Elegí tu ciudad de residencia y marcá los distritos vecinos a los que podés desplazarte a trabajar (por ejemplo: Encarnación, Cambyretá, Hohenau, etc.).
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">
                Paso 3: Descripción y Horarios
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">¿Qué trabajos realizás?</p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Redactá en un párrafo claro tus especialidades, si hacés presupuestos a domicilio y tu horario de atención (o si cubrís urgencias 24 hs).
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">
                Paso 4: Fotos de Trabajos
              </span>
              <p className="font-bold text-slate-900 text-xs mt-1">Galería desde tu Celular</p>
              <p className="text-[11px] text-slate-600 leading-snug">
                Tocá el botón para adjuntar fotos de tus instalaciones o reparaciones ya realizadas para que los clientes comprueben la calidad de tu trabajo.
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-900">
              <strong>¡Publicación Inmediata!</strong> Al presionar <em>"Crear Perfil y Publicar Servicio"</em> tu aviso aparecerá disponible en el directorio para toda tu zona.
            </p>
          </div>
        </div>
      ),
      tags: ['registro', 'cargar datos', 'formulario', 'paso a paso', 'gratis', 'publicar']
    },
    {
      id: 'reg-no-videos',
      category: 'registration',
      question: '¿Tengo que crear o subir videos para poder publicar mi servicio?',
      answer: (
        <div className="space-y-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong>No, en lo absoluto.</strong> En ServiciosYa <strong>no es necesario generar ni subir ningún video</strong>.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <p className="text-xs text-amber-950 font-medium">
              Todo el proceso está pensado para ser rápido y claro para personas de cualquier edad u oficio:
            </p>
            <ul className="space-y-1 list-disc list-inside text-xs text-amber-900">
              <li>Solo completás texto escrito: tu nombre, tu teléfono, tus ciudades y una breve descripción.</li>
              <li>Podés adjuntar fotos comunes tomadas con la cámara de tu celular para mostrar tus obras.</li>
              <li>Los clientes se comunican directamente contigo por llamada normal o mensaje de WhatsApp.</li>
            </ul>
          </div>
          <p className="text-slate-500 text-xs">
            De esta manera ahorrás tiempo y no te preocupás por editar videos complicados.
          </p>
        </div>
      ),
      tags: ['videos', 'requisitos', 'facil', 'sin complicaciones', 'texto', 'fotos']
    },
    {
      id: 'reg-whatsapp-format',
      category: 'registration',
      question: '¿Cómo debo escribir mi número de WhatsApp en el formulario?',
      answer: (
        <div className="space-y-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            Podés escribir tu número con el formato habitual de Paraguay, por ejemplo: <strong>0985 123 456</strong>, <strong>0971 654 321</strong> o en formato internacional <strong>+595 985 123456</strong>.
          </p>
          <p>
            El sistema formatea automáticamente el enlace para que cuando un vecino o cliente pulse <strong>"Contactar por WhatsApp"</strong>, se le abra el chat directo contigo sin necesidad de agendarte previamente.
          </p>
          <p className="text-xs text-slate-500">
            💡 <em>Asegurate de que sea un número activo con WhatsApp instalado en tu teléfono para no perder ninguna consulta.</em>
          </p>
        </div>
      ),
      tags: ['whatsapp', 'telefono', 'numero', 'contacto directo', 'celular']
    },
    {
      id: 'reg-edit-profile',
      category: 'registration',
      question: '¿Puedo modificar mis datos, precios o teléfonos después de registrarme?',
      answer: (
        <div className="space-y-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            <strong>Sí, en cualquier momento.</strong> Tu cuenta te pertenece y podés actualizarla las veces que quieras:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-medium">
            <li>Hacé clic en <strong>"Publicar mi Servicio"</strong> o <strong>"Mi Panel Profesional"</strong> en el menú superior.</li>
            <li>Ingresá con tu correo electrónico y tu contraseña creada al registrarte.</li>
            <li>Podrás cambiar tu número de WhatsApp, agregar nuevas fotos, modificar tus horarios, agregar nuevas zonas o cambiar tu tarifa estimada.</li>
          </ol>
        </div>
      ),
      tags: ['editar', 'modificar', 'cambiar telefono', 'actualizar', 'perfil']
    },

    // --- CATEGORÍA: MEJORAR TU PERFIL ---
    {
      id: 'profile-1',
      category: 'profile',
      question: '¿Qué información debe tener mi perfil para generar más confianza?',
      answer: (
        <div className="space-y-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            Los clientes que buscan oficios en internet valoran especialmente tres cosas: <strong>seguridad, claridad en las tarifas y fotos reales</strong>.
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
            <li><strong>Foto de perfil clara:</strong> Una imagen donde se vea tu rostro con ropa de trabajo o el logo de tu empresa. Evitá fotos oscuras o borrosas.</li>
            <li><strong>Descripción honesta:</strong> Mencioná tus años de oficio, los tipos de trabajos que realizás con mayor frecuencia y si ofrecés garantía escrita.</li>
            <li><strong>Tarifa orientativa:</strong> Indicar un monto orientativo en Guaraníes (por ejemplo: <em>"Visita técnica desde Gs. 80.000 (se descuenta del trabajo)"</em>) reduce las dudas del cliente y agiliza el contacto.</li>
            <li><strong>Especialidades detalladas:</strong> No pongas solo "Electricista"; agregá etiquetas como <em>"Instalación de disyuntores ANDE"</em>, <em>"Puesta a tierra"</em> o <em>"Cableados comerciales"</em>.</li>
          </ul>
        </div>
      ),
      tags: ['perfil', 'confianza', 'foto', 'descripcion', 'especialidades', 'precio']
    },
    {
      id: 'profile-2',
      category: 'profile',
      question: '¿Cómo obtengo la insignia de Profesional Verificado?',
      answer: (
        <div className="space-y-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            La insignia azul <strong>Verificado</strong> destaca tu perfil sobre el resto y confirma que tus datos fueron revisados por el equipo de administración de ServiciosYa.
          </p>
          <p>
            Para solicitarla:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700 font-medium">
            <li>Ingresá a tu <strong>Panel Profesional</strong> con tu correo y contraseña.</li>
            <li>Completá tu número de Cédula de Identidad o Matrícula Profesional habilitante (ANDE, Obras Públicas, Refrigeración, etc.).</li>
            <li>El administrador valida los antecedentes y otorga el sello oficial en un plazo promedio de 24 horas hábiles.</li>
          </ol>
        </div>
      ),
      tags: ['verificado', 'insignia', 'matricula', 'cedula', 'confianza']
    },
    {
      id: 'profile-3',
      category: 'profile',
      question: '¿Por qué son tan importantes las fotos de mis trabajos y cómo subirlas?',
      answer: (
        <div className="space-y-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            Los perfiles que incluyen una galería de fotos reciben <strong>hasta 5 veces más clics en el botón de WhatsApp</strong>.
          </p>
          <p>
            Te recomendamos mostrar fotos del <strong>antes y el después</strong> de cada reparación o instalación (por ejemplo: un caño roto vs la cañería nueva reparada; un tablero eléctrico prolijo; un patio desmalezado).
          </p>
          <p className="text-xs text-slate-500">
            Podés subir tus fotos directamente desde tu celular o computadora en la pestaña <em>"Mis Trabajos / Galería"</em> dentro de tu Panel Profesional tocando el botón de seleccionar imagen.
          </p>
        </div>
      ),
      tags: ['fotos', 'galeria', 'antes y despues', 'trabajos']
    },

    // --- CATEGORÍA: CONFIGURACIÓN DE HORARIOS ---
    {
      id: 'hours-1',
      category: 'hours',
      question: '¿Cómo configuro y cambio mi horario de atención?',
      answer: (
        <div className="space-y-2.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            En tu Panel Profesional podés editar libremente tu disponibilidad horaria en cualquier momento:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
            <li><strong>Horario estándar comercial:</strong> Ej: <em>"Lunes a Viernes de 7:30 a 18:00 hs - Sábados 8:00 a 12:30 hs"</em>.</li>
            <li><strong>Guardia de Emergencia 24 Horas:</strong> Si ofrecés destapes de urgencia, cerrajería o auxilio eléctrico nocturno, colocá <em>"Urgencias 24 hs"</em>. Tu perfil mostrará una etiqueta destacada en color esmeralda.</li>
          </ul>
        </div>
      ),
      tags: ['horario', 'atencion', 'urgencias 24hs', 'disponibilidad', 'guardia']
    },
    {
      id: 'hours-2',
      category: 'hours',
      question: '¿Cómo funciona el estado "Disponible" vs "Ocupado"?',
      answer: (
        <div className="space-y-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            En la esquina superior de tu Panel Profesional disponés de un interruptor en tiempo real:
          </p>
          <div className="space-y-2 my-2">
            <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="font-bold text-emerald-950">Disponible:</span>
              <span className="text-emerald-800">Tu perfil muestra un punto verde activo indicando que estás listo para tomar nuevos pedidos de inmediato.</span>
            </div>
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0"></span>
              <span className="font-bold text-amber-950">Ocupado / En obra:</span>
              <span className="text-amber-800">Avisa a los clientes que te encontrás trabajando en una obra y que responderás mensajes ni bien finalices tu labor.</span>
            </div>
          </div>
        </div>
      ),
      tags: ['disponible', 'ocupado', 'punto verde', 'estado', 'en obra']
    },
    {
      id: 'hours-3',
      category: 'hours',
      question: '¿Cómo defino mis ciudades y zonas de cobertura?',
      answer: (
        <div className="space-y-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            ServiciosYa cuenta con cobertura en todo el Paraguay. Al editar tu perfil podés:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
            <li>Elegir tu <strong>Ciudad / Municipio Base</strong> (donde tenés tu taller o domicilio).</li>
            <li>Marcar tus <strong>Zonas y Ciudades Secundarias</strong> donde estés dispuesto a viajar (por ejemplo: Encarnación + Cambyretá + San Juan del Paraná + Capitán Miranda).</li>
          </ol>
          <p className="text-xs text-slate-500">
            Esto garantiza que cuando una persona filtre por su localidad en el buscador o en el mapa, tu perfil aparezca de forma prioritaria.
          </p>
        </div>
      ),
      tags: ['ciudades', 'zonas', 'cobertura', 'departamentos', 'itapua', 'asuncion']
    },

    // --- CATEGORÍA: CONSEJOS PARA SER DESTACADO ---
    {
      id: 'featured-1',
      category: 'featured',
      question: '¿Cuáles son los beneficios de ser un Profesional Destacado (Bronce, Plata, Oro)?',
      answer: (
        <div className="space-y-3 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            Los planes destacados posicionan tu perfil en los primeros lugares de búsqueda y en el mapa interactivo:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
              <span className="font-bold text-amber-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Destacado Bronce
              </span>
              <p className="text-[11px] text-amber-900 mt-1">
                Insignia de bronce, prioridad sobre perfiles estándar y acceso a estadísticas de personas que miran tu teléfono.
              </p>
            </div>
            <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-slate-600" />
                Destacado Plata
              </span>
              <p className="text-[11px] text-slate-700 mt-1">
                Todo lo de Bronce + carrusel destacado en la portada, botón de WhatsApp con llamado a la acción y hasta 8 fotos.
              </p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-xl">
              <span className="font-bold text-yellow-900 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-yellow-600" />
                Oro Premium
              </span>
              <p className="text-[11px] text-yellow-950 mt-1">
                <strong>Posición #1 asegurada</strong> en tu rubro, insignia dorada oficial y reenvío prioritario de pedidos urgentes de clientes.
              </p>
            </div>
          </div>
          {handleGoToPricing && (
            <button
              onClick={handleGoToPricing}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 mt-1 cursor-pointer"
            >
              <span>Ver tabla de precios y planes destacados</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
      tags: ['destacado', 'planes', 'oro', 'plata', 'bronce', 'posicionamiento']
    },
    {
      id: 'featured-2',
      category: 'featured',
      question: '¿Qué buenas prácticas debo seguir al responder consultas por WhatsApp?',
      answer: (
        <div className="space-y-2 text-slate-600 text-xs sm:text-sm leading-relaxed">
          <p>
            Cuando un cliente presiona el botón de WhatsApp en tu perfil, recibe un mensaje inicial predeterminado. Para cerrar más contratos:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-xs text-slate-700">
            <li><strong>Respondé rápido:</strong> Los clientes que reciben respuesta en los primeros 10-15 minutos tienen un 80% más de probabilidades de contratarte.</li>
            <li><strong>Presupuesto desglosado:</strong> Separá con claridad el costo de la mano de obra del costo estimado de los materiales o repuestos.</li>
            <li><strong>Pedile una reseña al terminar:</strong> Al finalizar con éxito tu labor, enviale el enlace de tu perfil de ServiciosYa y pedile que te deje una calificación de 5 estrellas.</li>
          </ul>
        </div>
      ),
      tags: ['whatsapp', 'consejos', 'ventas', 'clientes', 'presupuesto', 'atencion']
    }
  ];

  // Filter items
  const filteredFaqs = faqItems.filter(item => {
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    if (!matchesCat) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.question.toLowerCase().includes(q) ||
      item.tags.some(tag => tag.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden mb-8 border border-indigo-700/50">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-300" />
            <span>Centro de Ayuda & Guías para Profesionales</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-3">
            Preguntas Frecuentes y Consejos de Éxito
          </h1>
          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed mb-6 font-normal">
            Aprendé a cargar tus datos en simples pasos con texto y fotos, configurar tus horarios de atención y conseguir más clientes en tu WhatsApp.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGoToProvider}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-900 font-bold text-xs sm:text-sm hover:bg-indigo-50 transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Publicar mi Servicio Gratis</span>
            </button>
            {handleGoToPricing && (
              <button
                onClick={handleGoToPricing}
                className="px-5 py-2.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 text-white font-semibold text-xs sm:text-sm transition-colors border border-indigo-400/40 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Ver Planes y Tarifas</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick 3-Step Guide Callout (Clear text instructions) */}
      <div className="mb-8 bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-sky-500/10 border-2 border-indigo-200/80 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                Guía Rápida
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                ¿Cómo cargar tus datos para publicar tu oficio?
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              No necesitás saber computación ni crear videos. Solo completás tus datos cotidianos en el formulario:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white/80 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-indigo-600">1. Datos Básicos</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">Nombre y WhatsApp</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Tu nombre, rubro de trabajo y celular de Paraguay.</p>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-indigo-600">2. Zonas & Horario</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">Ciudades donde trabajás</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Elegí tu ciudad base y si atendés de día o 24 horas.</p>
              </div>
              <div className="bg-white/80 border border-slate-200 rounded-xl p-2.5">
                <span className="text-[10px] font-bold text-indigo-600">3. Fotos Reales</span>
                <p className="text-xs font-semibold text-slate-800 mt-0.5">Fotos desde tu celular</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Subí fotos de tus trabajos anteriores para dar confianza.</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleGoToProvider}
            className="w-full lg:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shrink-0 shadow-sm transition-colors cursor-pointer self-stretch lg:self-center"
          >
            <UserCheck className="w-4 h-4" />
            <span>Ir a Cargar mis Datos</span>
          </button>
        </div>
      </div>

      {/* Search & Category Pills */}
      <div className="space-y-4 mb-6">
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar en preguntas frecuentes (ej: fotos, horario, verificado, registro, tarifas, whatsapp)..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-hidden shadow-2xs font-medium placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>Todas las Preguntas</span>
            <span className="text-[10px] opacity-75">({faqItems.length})</span>
          </button>

          <button
            onClick={() => setSelectedCategory('registration')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'registration'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-indigo-500" />
            <span>Cómo Cargar tus Datos</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded-full">Paso a paso</span>
          </button>

          <button
            onClick={() => setSelectedCategory('profile')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'profile'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>Mejorar tu Perfil y Fotos</span>
          </button>

          <button
            onClick={() => setSelectedCategory('hours')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'hours'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Horarios y Disponibilidad</span>
          </button>

          <button
            onClick={() => setSelectedCategory('featured')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === 'featured'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>Consejos para Ser Destacado</span>
          </button>
        </div>
      </div>

      {/* Accordion Questions List */}
      <div id="faq-accordion-list" className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No encontramos respuestas para tu búsqueda</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Probá con otras palabras como "foto", "horario", "registro", "whatsapp", "verificado" o revisá todas las categorías.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
              className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              Ver todas las preguntas
            </button>
          </div>
        ) : (
          filteredFaqs.map((item) => {
            const isExpanded = Boolean(expandedItems[item.id]);
            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                  isExpanded ? 'border-indigo-300 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.category === 'registration'
                        ? 'bg-indigo-100 text-indigo-800'
                        : item.category === 'profile'
                        ? 'bg-blue-100 text-blue-800'
                        : item.category === 'hours'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.category === 'registration' && <ClipboardList className="w-4 h-4" />}
                      {item.category === 'profile' && <UserCheck className="w-4 h-4" />}
                      {item.category === 'hours' && <Clock className="w-4 h-4" />}
                      {item.category === 'featured' && <Sparkles className="w-4 h-4" />}
                    </span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <span className="p-1 rounded-lg text-slate-400 group-hover:text-slate-600 shrink-0">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support & Need More Help Footer Card */}
      <div className="mt-10 bg-slate-100 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-slate-900 text-sm">
            ¿Tenés alguna consulta adicional o necesitás asistencia para registrarte?
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            El equipo de soporte y moderación de ServiciosYa está a tu disposición para ayudarte a publicar tu oficio.
          </p>
        </div>

        <button
          onClick={handleGoToProvider}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-2 cursor-pointer"
        >
          <UserCheck className="w-4 h-4" />
          <span>Publicar mi Servicio Ahora</span>
        </button>
      </div>

    </div>
  );
};
