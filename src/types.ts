export type TradeCategory =
  | 'Jardinería'
  | 'Plomero'
  | 'Electricista'
  | 'Carpintero'
  | 'Albañiles'
  | 'Niñeras'
  | 'Cocineras'
  | 'Pintor'
  | 'Gasista'
  | 'Cerrajería'
  | 'Aire Acondicionado'
  | 'Mecánico'
  | 'Limpieza'
  | 'Fletes y Mudanzas'
  | 'Herrería'
  | 'Cuidado de Adultos';

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  serviceType?: string;
}

export type VerificationStatus = 'pending' | 'approved' | 'rejected';
export type FeaturedTier = 'none' | 'bronze' | 'silver' | 'gold';

export interface ServiceProfessional {
  id: string;
  name: string;
  email: string;
  password?: string;
  trade: TradeCategory;
  specialties: string[];
  bio: string;
  avatar: string;
  phone: string;
  whatsapp: string; // international digits only for wa.me e.g. 5491144445555
  zone: string;
  coverageAreas: string[];
  lat?: number;
  lng?: number;
  experienceYears: number;
  priceEstimate: string;
  availability: string;
  matricula?: string;
  hasMatricula: boolean;
  gallery: string[];
  rating: number;
  reviewCount: number;
  reviews: Review[];
  verificationStatus: VerificationStatus;
  adminNotes?: string;
  isVerified: boolean;
  featuredTier: FeaturedTier;
  featuredExpiresAt?: string;
  viewsCount: number;
  whatsappClicks: number;
  workStatus?: 'available' | 'busy';
  isDemo?: boolean;
  createdAt: string;
}

export interface SponsorBanner {
  id: string;
  title: string;
  sponsorName: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  whatsapp?: string;
  placement: 'top_hero' | 'middle_feed' | 'sidebar';
  monthlyFee: number;
  active: boolean;
  isDemo?: boolean;
  impressions: number;
  clicks: number;
  startDate: string;
  endDate: string;
}

export interface FeaturedPlanPrice {
  tier: FeaturedTier;
  name: string;
  badgeColor: string;
  monthlyPrice: number;
  quarterlyPrice: number;
  description: string;
  features: string[];
  active: boolean;
}

export interface AdminSettings {
  contactWhatsApp: string;
  contactEmail?: string;
  paymentsPhone?: string;
  suggestionsPhone?: string;
  supportPhone?: string;
  paymentBankName?: string;
  paymentAccountHolder?: string;
  paymentAccountNumber?: string;
  paymentRuc?: string;
  paymentAliasSipap?: string;
  paymentTigoMoneyNumber?: string;
  paymentInstructions?: string;
  suggestionsNotice?: string;
  featuredPrices: FeaturedPlanPrice[];
  autoApproval: boolean;
  requireMatriculaForGasElectricity: boolean;
  heroHeadline: string;
  heroSubtitle: string;
}

export interface SmartSearchResult {
  tradeSuggestions: TradeCategory[];
  problemAnalysis: string;
  urgencyLevel: 'alta' | 'media' | 'normal';
  recommendedAction: string;
  matchedProfessionalIds: string[];
}

export interface AppUser {
  role: 'guest' | 'provider' | 'admin';
  email?: string;
  name?: string;
  professionalId?: string;
}

export interface ServiceJobRequest {
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
  isDemo?: boolean;
  createdAt: string;
  responsesCount: number;
}

export type SuggestionType = 'oficio' | 'servicio' | 'rubro' | 'ciudad' | 'otro';
export type SuggestionStatus = 'pending' | 'reviewing' | 'approved' | 'implemented' | 'rejected';

export interface VisitorSuggestion {
  id: string;
  title: string;
  type: SuggestionType;
  suggestedZone: string;
  description: string;
  visitorName?: string;
  visitorContact?: string;
  votesCount: number;
  status: SuggestionStatus;
  adminNotes?: string;
  createdAt: string;
  isDemo?: boolean;
}

// Anti-Hacker Security & IP Lockout Types
export interface BlockedIpRecord {
  ip: string;
  failedAttempts: number;
  blockedAt: number;
  blockedUntil: number;
  lastAttemptedUser?: string;
  reason: string;
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  type: 'ip_blocked' | 'failed_login' | 'successful_login' | 'exploit_probe' | 'manual_unblock' | 'manual_block';
  ip: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface SecurityStatusResponse {
  firewallActive: boolean;
  clientIp: string;
  isClientBlocked: boolean;
  clientAttempts: number;
  clientRemainingAttempts: number;
  clientBlockedUntil: number | null;
  clientRemainingMinutes: number;
  totalBlockedIps: number;
  blockedIps: BlockedIpRecord[];
  auditLogs: SecurityAuditLog[];
  totalAttacksBlocked: number;
}


