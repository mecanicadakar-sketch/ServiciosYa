import { ServiceProfessional, SponsorBanner, AdminSettings, TradeCategory, VisitorSuggestion } from '../types';
import { ITAPUA_CITY_NAMES } from './itapuaData';

export const ALL_TRADES: { category: TradeCategory; icon: string; description: string }[] = [
  { category: 'Plomero', icon: 'Wrench', description: 'Reparaciones, destapes, cañerías y griferías' },
  { category: 'Electricista', icon: 'Zap', description: 'Instalaciones domiciliarias, tableros y cortocircuitos' },
  { category: 'Jardinería', icon: 'Trees', description: 'Corte de pasto, poda de árboles, parquizaciones' },
  { category: 'Carpintero', icon: 'Hammer', description: 'Muebles a medida, aberturas, decks y reparaciones' },
  { category: 'Albañiles', icon: 'BrickWall', description: 'Construcción, refacciones, revoques y contrapisos' },
  { category: 'Niñeras', icon: 'Baby', description: 'Cuidado responsable y estimulación infantil' },
  { category: 'Cocineras', icon: 'Utensils', description: 'Comida casera para eventos, viandas y servicio por hora' },
  { category: 'Pintor', icon: 'Paintbrush', description: 'Pintura interior, exterior, látex y esmaltes' },
  { category: 'Gasista', icon: 'Flame', description: 'Instalación de cocinas, termotanques y matriculado' },
  { category: 'Cerrajería', icon: 'Key', description: 'Aperturas urgentes 24hs, cambio de combinación' },
  { category: 'Aire Acondicionado', icon: 'Snowflake', description: 'Instalación, carga de gas y mantenimiento' },
  { category: 'Mecánico', icon: 'Car', description: 'Mecánica ligera, auxilio y diagnóstico computarizado' },
  { category: 'Limpieza', icon: 'Sparkles', description: 'Limpieza profunda de hogares, oficinas y final de obra' },
  { category: 'Fletes y Mudanzas', icon: 'Truck', description: 'Traslados locales, cargas con peones' },
  { category: 'Herrería', icon: 'Shield', description: 'Rejas, portones automáticos, estructuras metálicas' },
  { category: 'Cuidado de Adultos', icon: 'HeartHandshake', description: 'Acompañamiento, medicación y asistencia calificada' },
];

export const INITIAL_ZONES = [
  'Todas las zonas',
  ...ITAPUA_CITY_NAMES
];

export const INITIAL_PROFESSIONALS: ServiceProfessional[] = [
  {
    id: 'prof-demo-1',
    name: 'Carlos Mendoza (Demo)',
    email: 'carlos.plomero.demo@serviciosya.com',
    password: 'password123',
    trade: 'Plomero',
    specialties: ['Destape de cañerías con máquina', 'Reparación de termotanques y calefones', 'Urgencias 24hs', 'Cambio de griferías'],
    bio: 'Perfil de Demostración: Más de 18 años de experiencia en plomería integral para hogares y comercios. Ejemplo ilustrativo de ServiciosYa Paraguay.',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80',
    phone: '+595 980 000 000 (Muestra Demo)',
    whatsapp: '595980000000',
    zone: 'Encarnación',
    coverageAreas: ['Encarnación', 'Cambyretá', 'San Juan del Paraná', 'Capitán Miranda'],
    experienceYears: 18,
    priceEstimate: 'Gs. 80.000 visita técnica diagnóstico (Demo)',
    availability: 'Lunes a Domingos - Urgencias 24 hs',
    matricula: 'REG-DEMO-8924',
    hasMatricula: true,
    gallery: [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 12,
    reviews: [
      {
        id: 'rev-demo-1',
        author: 'Martín R. (Cliente Demo)',
        rating: 5,
        date: '2026-08-20',
        comment: 'Excelente profesional de ejemplo. Trabajo impecable y puntual.'
      }
    ],
    verificationStatus: 'approved',
    isVerified: true,
    featuredTier: 'gold',
    featuredExpiresAt: '2026-12-31',
    viewsCount: 340,
    whatsappClicks: 0,
    workStatus: 'available',
    isDemo: true,
    createdAt: '2026-01-15'
  },
  {
    id: 'prof-demo-2',
    name: 'Esteban Lucero (Demo)',
    email: 'esteban.electricidad.demo@serviciosya.com',
    password: 'password123',
    trade: 'Electricista',
    specialties: ['Instalaciones completas', 'Tableros eléctricos y disyuntores', 'Puesta a tierra', 'Luces LED'],
    bio: 'Perfil de Demostración: Electricista con certificación técnica en Itapúa. Conexiones monofásicas y trifásicas ANDE, recableados.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    phone: '+595 980 000 000 (Muestra Demo)',
    whatsapp: '595980000000',
    zone: 'Cambyretá',
    coverageAreas: ['Cambyretá', 'Encarnación', 'San Juan del Paraná'],
    experienceYears: 14,
    priceEstimate: 'Gs. 100.000 visita técnica (Demo)',
    availability: 'Lunes a Sábado de 7:30 a 19:00 hs',
    matricula: 'ANDE-REG-DEMO',
    hasMatricula: true,
    gallery: [
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewCount: 9,
    reviews: [
      {
        id: 'rev-demo-2',
        author: 'Laura F. (Cliente Demo)',
        rating: 5,
        date: '2026-08-11',
        comment: 'Muy prolijo en la instalación del tablero eléctrico.'
      }
    ],
    verificationStatus: 'approved',
    isVerified: true,
    featuredTier: 'silver',
    featuredExpiresAt: '2026-12-31',
    viewsCount: 220,
    whatsappClicks: 0,
    workStatus: 'available',
    isDemo: true,
    createdAt: '2026-02-10'
  },
  {
    id: 'prof-demo-3',
    name: 'Ing. Andrés Ruiz (Demo)',
    email: 'andres.clima.demo@serviciosya.com',
    password: 'password123',
    trade: 'Aire Acondicionado',
    specialties: ['Instalación split Inverter', 'Carga de gas ecológico R410A', 'Limpieza profunda y service'],
    bio: 'Perfil de Demostración: Técnico matriculado en refrigeración y climatización en Capitán Miranda y Encarnación.',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    phone: '+595 980 000 000 (Muestra Demo)',
    whatsapp: '595980000000',
    zone: 'Capitán Miranda',
    coverageAreas: ['Capitán Miranda', 'Encarnación', 'Cambyretá', 'Trinidad'],
    experienceYears: 8,
    priceEstimate: 'Gs. 280.000 instalación split (Demo)',
    availability: 'Lunes a Sábados 7:30 a 18:30 hs',
    hasMatricula: true,
    matricula: 'CLIMA-ITAPUA-DEMO',
    gallery: [
      'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewCount: 8,
    reviews: [
      {
        id: 'rev-demo-3',
        author: 'Rodrigo B. (Cliente Demo)',
        rating: 5,
        date: '2026-08-15',
        comment: 'Instaló 2 acondicionadores split en el día, muy prolijo.'
      }
    ],
    verificationStatus: 'approved',
    isVerified: true,
    featuredTier: 'gold',
    featuredExpiresAt: '2026-12-31',
    viewsCount: 195,
    whatsappClicks: 0,
    workStatus: 'available',
    isDemo: true,
    createdAt: '2026-03-01'
  },
  {
    id: 'prof-demo-4',
    name: 'Marcos Maidana (Demo)',
    email: 'marcos.jardines.demo@serviciosya.com',
    password: 'password123',
    trade: 'Jardinería',
    specialties: ['Mantenimiento integral de quintas', 'Poda en altura', 'Sistemas de riego', 'Colocación de césped esmeralda'],
    bio: 'Perfil de Demostración: Servicios profesionales de parquización y jardinería en Colonias Unidas y Encarnación.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    phone: '+595 980 000 000 (Muestra Demo)',
    whatsapp: '595980000000',
    zone: 'Hohenau',
    coverageAreas: ['Hohenau', 'Obligado', 'Bella Vista', 'Pirapó', 'Encarnación'],
    experienceYears: 10,
    priceEstimate: 'Desde Gs. 120.000 corte básico de terreno (Demo)',
    availability: 'Lunes a Viernes 7:00 a 17:00 hs',
    hasMatricula: false,
    gallery: [
      'https://images.unsplash.com/photo-1592417817098-8f3d69109853?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewCount: 6,
    reviews: [],
    verificationStatus: 'approved',
    isVerified: true,
    featuredTier: 'bronze',
    featuredExpiresAt: '2026-12-31',
    viewsCount: 140,
    whatsappClicks: 0,
    workStatus: 'available',
    isDemo: true,
    createdAt: '2026-03-20'
  },
  {
    id: 'prof-pending-1',
    name: 'Miguel Ávalos (Demo Pendiente)',
    email: 'miguel.gasista.demo@serviciosya.com',
    password: 'password123',
    trade: 'Gasista',
    specialties: ['Instalación de cocinas y hornos', 'Pruebas de hermeticidad', 'Termotanques a gas'],
    bio: 'Perfil de Demostración en Revisión: Técnico en instalaciones de gas en Bella Vista.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    phone: '+595 980 000 000 (Muestra Demo)',
    whatsapp: '595980000000',
    zone: 'Bella Vista',
    coverageAreas: ['Bella Vista', 'Hohenau', 'Obligado'],
    experienceYears: 7,
    priceEstimate: 'Gs. 120.000 visita técnica (Demo)',
    availability: 'Lunes a Viernes 8:00 a 17:00 hs',
    hasMatricula: true,
    matricula: 'GAS-PARAGUAY-DEMO',
    gallery: [],
    rating: 0,
    reviewCount: 0,
    reviews: [],
    verificationStatus: 'pending',
    adminNotes: 'Documento de identidad adjunto verificado. Ejemplo de perfil pendiente de revisión en el panel de administrador.',
    isVerified: false,
    featuredTier: 'none',
    viewsCount: 15,
    whatsappClicks: 0,
    workStatus: 'available',
    isDemo: true,
    createdAt: '2026-09-02'
  }
];

export const INITIAL_SPONSORS: SponsorBanner[] = [
  {
    id: 'spon-1',
    title: 'Ferretería & Materiales San Roque (Auspiciante Demo)',
    sponsorName: 'San Roque Ferreterías',
    description: 'Anuncio de Demostración: Espacio publicitario oficial para empresas y comercios del rubro de la construcción y ferretería.',
    imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=80',
    targetUrl: '',
    whatsapp: '595980000000',
    placement: 'top_hero',
    monthlyFee: 350000,
    active: true,
    isDemo: true,
    impressions: 420,
    clicks: 0,
    startDate: '2026-08-01',
    endDate: '2026-12-31'
  }
];

export const INITIAL_SETTINGS: AdminSettings = {
  contactWhatsApp: '595975635770',
  contactEmail: 'serviciosyaparaguay@gmail.com',
  paymentsPhone: '595975635770',
  suggestionsPhone: '595975635770',
  supportPhone: '595975635770',
  paymentBankName: 'Banco Continental / SIPAP-SPI',
  paymentAccountHolder: 'ServiciosYa Paraguay',
  paymentAccountNumber: '01-4589201-09',
  paymentRuc: '80012345-6',
  paymentAliasSipap: 'serviciosya.sipap',
  paymentTigoMoneyNumber: '0975 635770',
  paymentInstructions: 'Una vez realizada la transferencia o giro, remití el comprobante a nuestro WhatsApp de pagos con tu nombre o razón social para activación inmediata y envío de factura legal electrónica.',
  suggestionsNotice: 'Revisamos diariamente todas las sugerencias de la comunidad para habilitar nuevos oficios, ciudades y funciones en todo el Paraguay.',
  heroHeadline: 'Encontrá al profesional ideal para tu hogar en minutos',
  heroSubtitle: 'Directorio verificado de oficios: Plomeros, Electricistas, Jardineros, Albañiles, Niñeras y más. Contacto directo por WhatsApp en todo el Paraguay.',
  autoApproval: false,
  requireMatriculaForGasElectricity: true,
  featuredPrices: [
    {
      tier: 'bronze',
      name: 'Destacado Bronce',
      badgeColor: 'amber',
      monthlyPrice: 50000,
      quarterlyPrice: 135000,
      description: 'Ideal para empezar a recibir más consultas en tu zona.',
      features: [
        'Insignia de Profesional Destacado',
        'Prioridad en búsquedas de tu oficio',
        'Acceso a estadísticas de visitas',
        'Soporte por WhatsApp'
      ],
      active: true
    },
    {
      tier: 'silver',
      name: 'Destacado Plata',
      badgeColor: 'slate',
      monthlyPrice: 95000,
      quarterlyPrice: 250000,
      description: 'El plan más elegido: duplica las consultas directas.',
      features: [
        'Todo lo de Bronce',
        'Aparición en el Carrusel Destacado de portada',
        'Etiqueta "Recomendado por ServiciosYa"',
        'Botón WhatsApp destacado con llamada a la acción',
        'Hasta 8 fotos en tu galería de trabajos'
      ],
      active: true
    },
    {
      tier: 'gold',
      name: 'Destacado Oro Premium',
      badgeColor: 'yellow',
      monthlyPrice: 180000,
      quarterlyPrice: 480000,
      description: 'Máxima exposición: primeros puestos garantizados en búsquedas.',
      features: [
        'Todo lo de Plata',
        'Posición #1 en tu oficio y zona',
        'Insignia Dorada Oficial',
        'Reenvío de pedidos de presupuesto urgentes',
        'Banner promocional rotativo en categorías afines',
        'Galería ilimitada y verificación prioritaria en 2 horas'
      ],
      active: true
    }
  ]
};

export const INITIAL_JOB_REQUESTS: {
  id: string;
  title: string;
  trade: TradeCategory;
  zone: string;
  clientName: string;
  clientPhone: string;
  budgetGs?: number | string;
  description: string;
  urgency: 'urgente' | 'hoy' | 'esta_semana' | 'flexible';
  status: 'open' | 'assigned' | 'completed';
  createdAt: string;
  responsesCount: number;
  isDemo?: boolean;
}[] = [
  {
    id: 'job-demo-1',
    title: 'Instalación de 2 Acondicionadores Split de 12.000 BTU (Demo)',
    trade: 'Aire Acondicionado' as const,
    zone: 'Encarnación',
    clientName: 'Rodrigo B. (Solicitud Demo)',
    clientPhone: '595980000000',
    budgetGs: 'Gs. 350.000',
    description: 'Solicitud de Ejemplo: Necesito instalador con bomba de vacío para colocar dos equipos nuevos en casa particular Barrio San Roque.',
    urgency: 'urgente' as const,
    status: 'open' as const,
    isDemo: true,
    createdAt: '2026-09-06T08:30:00Z',
    responsesCount: 1
  },
  {
    id: 'job-demo-2',
    title: 'Reparación de pérdida de agua en baño y canilla monocomando (Demo)',
    trade: 'Plomero' as const,
    zone: 'Cambyretá',
    clientName: 'María Elena V. (Solicitud Demo)',
    clientPhone: '595980000000',
    budgetGs: 'Gs. 120.000',
    description: 'Solicitud de Ejemplo: Gotea debajo de la bacha del baño y pierde agua la llave de paso del patio. Barrio San Miguel.',
    urgency: 'hoy' as const,
    status: 'open' as const,
    isDemo: true,
    createdAt: '2026-09-06T07:15:00Z',
    responsesCount: 1
  }
];

export const INITIAL_SUGGESTIONS: VisitorSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Instalador y Mantenimiento de Paneles Solares',
    type: 'oficio',
    suggestedZone: 'Itapúa y Alto Paraná',
    description: 'En el interior y zonas rurales de Itapúa y Alto Paraná hay mucha demanda de técnicos solares fotovoltaicos para fincas, pozos artesianos y hogares con cortes de luz.',
    visitorName: 'Ing. Fernando G.',
    visitorContact: '595981000001',
    votesCount: 28,
    status: 'approved',
    adminNotes: 'Excelente propuesta. En proceso de contactar técnicos matriculados en energía solar.',
    createdAt: '2026-09-04T10:20:00Z',
    isDemo: true
  },
  {
    id: 'sug-2',
    title: 'Mantenimiento y Tratamiento Químico de Piscinas',
    type: 'servicio',
    suggestedZone: 'Encarnación, San Bernardino y Asunción',
    description: 'En temporada alta y todo el verano se necesitan especialistas en limpieza de filtros, aspirado de fondo y dosificación de cloro/alguicidas para casas particulares.',
    visitorName: 'Valeria M.',
    visitorContact: '595982000002',
    votesCount: 22,
    status: 'reviewing',
    adminNotes: 'Categoría estacional de alta demanda en verano. En evaluación para incorporación inmediata.',
    createdAt: '2026-09-05T14:10:00Z',
    isDemo: true
  },
  {
    id: 'sug-3',
    title: 'Tapicería y Restauración de Muebles y Automóviles',
    type: 'oficio',
    suggestedZone: 'Central y Asunción',
    description: 'Retapizado de sofás, sillones de oficina, techos de autos y asientos de cuero o tela con retiro a domicilio.',
    visitorName: 'Marcos Benítez',
    visitorContact: '595983000003',
    votesCount: 17,
    status: 'pending',
    adminNotes: 'Registrado en el buzón. Buscando talleres con referencias.',
    createdAt: '2026-09-06T09:45:00Z',
    isDemo: true
  },
  {
    id: 'sug-4',
    title: 'Técnico en Cámaras de Seguridad y Alarmas Residenciales',
    type: 'oficio',
    suggestedZone: 'Todo el país',
    description: 'Configuración de cámaras IP, DVR, enlaces inalámbricos y cercos eléctricos perimetrales para viviendas y comercios.',
    visitorName: 'Esteban R.',
    visitorContact: '595984000004',
    votesCount: 35,
    status: 'implemented',
    adminNotes: '¡Incorporado! Ya se pueden registrar técnicos instaladores de seguridad electrónica en el sistema.',
    createdAt: '2026-09-01T16:00:00Z',
    isDemo: true
  },
  {
    id: 'sug-5',
    title: 'Adiestramiento Canino y Paseador de Mascotas',
    type: 'servicio',
    suggestedZone: 'Asunción y Gran Asunción',
    description: 'Adiestramiento de conducta básica, paseo diario y cuidado responsable para familias con jornadas laborales extendidas.',
    visitorName: 'Camila S.',
    visitorContact: '595985000005',
    votesCount: 14,
    status: 'reviewing',
    adminNotes: 'Rubro de servicios para mascotas en crecimiento.',
    createdAt: '2026-09-07T11:30:00Z',
    isDemo: true
  }
];

