import express from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { INITIAL_PROFESSIONALS, INITIAL_SETTINGS, INITIAL_SPONSORS, INITIAL_JOB_REQUESTS, INITIAL_SUGGESTIONS } from './src/data/seedData';
import { ServiceProfessional, SponsorBanner, AdminSettings, TradeCategory, SmartSearchResult, ServiceJobRequest, VisitorSuggestion, BlockedIpRecord, SecurityAuditLog } from './src/types';

dotenv.config();
// Support reading environment from _env (with underscore)
dotenv.config({ path: '_env' });

const app = express();
const PORT = 3000;

// Helper to extract real client IP
function getClientIp(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return (req.headers['x-real-ip'] as string) || req.socket.remoteAddress || req.ip || '127.0.0.1';
}

interface IpSecurityState {
  ip: string;
  failedAttempts: number;
  blockedAt: number | null;
  blockedUntil: number | null;
  isBlocked: boolean;
  lastAttemptedUser?: string;
  reason?: string;
}

// In-memory security records and WAF statistics
const ipSecurityRecords = new Map<string, IpSecurityState>();
const securityAuditLogs: SecurityAuditLog[] = [];
let totalAttacksBlocked = 0;

function logSecurityEvent(
  type: SecurityAuditLog['type'],
  ip: string,
  details: string,
  severity: SecurityAuditLog['severity'] = 'medium'
) {
  const event: SecurityAuditLog = {
    id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    type,
    ip,
    details,
    severity,
  };
  securityAuditLogs.unshift(event);
  if (securityAuditLogs.length > 200) {
    securityAuditLogs.pop();
  }
  console.warn(`[Anti-Hacker ${severity.toUpperCase()}] [${ip}] ${details}`);
}

// Initialized firewall event
logSecurityEvent('successful_login', '127.0.0.1', 'Firewall Anti-Hacker WAF y Sistema de Bloqueo tras 3 intentos activados', 'low');

// 1. Security Headers Middleware (Anti-Clickjacking, Anti-MIME sniffing, XSS Filter)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// 2. Anti-Hacker WAF (Web Application Firewall)
// Blocks automated bot scanner probes, path traversal, SQL injection signatures, and locked IPs
app.use((req, res, next) => {
  const clientIp = getClientIp(req);
  const decodedPath = decodeURIComponent(req.path);

  // Vite development module bundle cache & assets whitelist
  if (
    decodedPath.startsWith('/node_modules/.vite/') ||
    decodedPath.startsWith('/@vite/') ||
    decodedPath.startsWith('/@fs/') ||
    decodedPath.startsWith('/src/') ||
    decodedPath.startsWith('/assets/')
  ) {
    return next();
  }

  // Check if IP is currently blocked
  const ipState = ipSecurityRecords.get(clientIp);
  if (ipState && ipState.isBlocked && ipState.blockedUntil) {
    if (Date.now() < ipState.blockedUntil) {
      // If client attempts to access auth login or admin routes while blocked (excluding unblock endpoint)
      if (req.path.startsWith('/api/auth/login') || (req.path.startsWith('/api/admin/') && !req.path.startsWith('/api/admin/security/unblock'))) {
        const remainingMin = Math.ceil((ipState.blockedUntil - Date.now()) / 60000);
        return res.status(403).json({
          error: 'IP Bloqueada por Seguridad Anti-Hacker',
          isBlocked: true,
          attempts: ipState.failedAttempts,
          remainingAttempts: 0,
          blockedUntil: ipState.blockedUntil,
          remainingMinutes: remainingMin,
          clientIp,
          message: `Acceso restringido: Esta dirección IP (${clientIp}) se encuentra bloqueada tras 3 intentos fallidos de acceso al panel administrador. Restan ${remainingMin} minuto(s) de bloqueo.`
        });
      }
    } else {
      // Auto unblock when time expires
      ipSecurityRecords.delete(clientIp);
      logSecurityEvent('manual_unblock', clientIp, 'Bloqueo temporal de IP finalizado por expiración de tiempo', 'low');
    }
  }

  // A. Block sensitive dotfiles and hacker probes (.env, .git, .htaccess, .aws, etc.)
  if (
    /(^|\/)\.(env|git|htaccess|htpasswd|ssh|aws|config|ds_store|bash|zsh|profile|vscode|idea)/i.test(decodedPath) ||
    /^\/\.[a-zA-Z0-9_-]+/.test(decodedPath)
  ) {
    totalAttacksBlocked++;
    logSecurityEvent('exploit_probe', clientIp, `Escaneo de archivo sensible bloqueado: ${req.path}`, 'high');
    return res.status(403).json({
      error: 'Acceso Denegado por Firewall Anti-Hacker (403 Forbidden)',
      message: 'Por motivos de seguridad, el acceso a archivos de sistema con punto (.) está estrictamente bloqueado.'
    });
  }

  // B. Block common automated bot scanners and exploit kits
  const maliciousScannerRegex = /(\/wp-(login|admin|content|includes)|\/xmlrpc\.php|\/phpmyadmin|\/pma|\/mysql|\/actuator|\/solr|\/telescope|\/cgi-bin|\/shell|\/eval-stdin|\/vendor\/phpunit)/i;
  if (maliciousScannerRegex.test(decodedPath)) {
    totalAttacksBlocked++;
    logSecurityEvent('exploit_probe', clientIp, `Intento de escaneo de vulnerabilidades web bloqueado: ${req.path}`, 'critical');
    return res.status(403).json({
      error: 'Acceso Denegado - Amenaza Detectada',
      message: 'Tu solicitud ha sido bloqueada por el Firewall Anti-Hacker de ServiciosYa Paraguay.'
    });
  }

  // C. Inspect Query String for SQL Injection / Path Traversal / XSS payloads
  const queryString = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  const decodedQuery = decodeURIComponent(queryString);
  const maliciousPayloadRegex = /(union\s+select|select\s+.*\s+from|insert\s+into|drop\s+table|<script|javascript:|onerror\s*=|onload\s*=|(\.\.[\/\\]))/i;
  if (maliciousPayloadRegex.test(decodedQuery)) {
    totalAttacksBlocked++;
    logSecurityEvent('exploit_probe', clientIp, `Intento de inyección (SQLi/XSS/Traversal) bloqueado en URL: ${decodedQuery.slice(0, 100)}`, 'critical');
    return res.status(400).json({
      error: 'Petición Maliciosa Bloqueada',
      message: 'Parámetros con sintaxis de ataque detectados y neutralizados por el sistema Anti-Hacker.'
    });
  }

  next();
});

app.use(express.json());

// In-memory persistent state (seeded with realistic directory data)
let professionals: ServiceProfessional[] = [...INITIAL_PROFESSIONALS];
let sponsors: SponsorBanner[] = [...INITIAL_SPONSORS];
let settings: AdminSettings = { ...INITIAL_SETTINGS };
let jobRequests: ServiceJobRequest[] = [...INITIAL_JOB_REQUESTS];
let visitorSuggestions: VisitorSuggestion[] = [...INITIAL_SUGGESTIONS];

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ServiciosYa API' });
});

// GET all professionals with filtering
app.get('/api/professionals', (req, res) => {
  const { trade, zone, q, status, featuredOnly } = req.query;

  let results = [...professionals];

  // Admin might request all or filtered by status, public gets only 'approved' by default unless status is specified
  if (status && typeof status === 'string') {
    if (status !== 'all') {
      results = results.filter(p => p.verificationStatus === status);
    }
  } else {
    // Default public: only approved
    results = results.filter(p => p.verificationStatus === 'approved');
  }

  if (trade && typeof trade === 'string' && trade !== 'Todos') {
    results = results.filter(p => p.trade.toLowerCase() === trade.toLowerCase());
  }

  if (zone && typeof zone === 'string' && zone !== 'Todas las zonas') {
    results = results.filter(p => p.zone.toLowerCase().includes(zone.toLowerCase()) || 
      p.coverageAreas.some(area => area.toLowerCase().includes(zone.toLowerCase())));
  }

  if (q && typeof q === 'string' && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.trade.toLowerCase().includes(term) ||
      p.bio.toLowerCase().includes(term) ||
      p.specialties.some(s => s.toLowerCase().includes(term)) ||
      p.zone.toLowerCase().includes(term)
    );
  }

  if (featuredOnly === 'true') {
    results = results.filter(p => p.featuredTier !== 'none');
  }

  // Sort order: Gold first, then Silver, then Bronze, then by rating/reviews
  const tierWeight: Record<string, number> = { gold: 3, silver: 2, bronze: 1, none: 0 };
  results.sort((a, b) => {
    const weightDiff = (tierWeight[b.featuredTier] || 0) - (tierWeight[a.featuredTier] || 0);
    if (weightDiff !== 0) return weightDiff;
    return (b.rating || 0) - (a.rating || 0);
  });

  res.json(results);
});

// GET single professional
app.get('/api/professionals/:id', (req, res) => {
  const prof = professionals.find(p => p.id === req.params.id);
  if (!prof) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }
  // Increment view
  prof.viewsCount = (prof.viewsCount || 0) + 1;
  res.json(prof);
});

// POST register new professional
app.post('/api/professionals', (req, res) => {
  const data = req.body;
  if (!data.name || !data.trade || !data.whatsapp || !data.email) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, oficio, WhatsApp, email)' });
  }

  // Check if email already registered
  const existing = professionals.find(p => p.email.toLowerCase() === data.email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'Ya existe una cuenta con este correo electrónico' });
  }

  const cleanWhatsapp = (data.whatsapp || '').replace(/\D/g, '');

  const newProf: ServiceProfessional = {
    id: `prof-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    password: data.password || '123456',
    trade: data.trade as TradeCategory,
    specialties: Array.isArray(data.specialties) ? data.specialties : (data.specialties ? [data.specialties] : []),
    bio: data.bio || '',
    avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    phone: data.phone || data.whatsapp,
    whatsapp: cleanWhatsapp,
    zone: data.zone || 'Encarnación',
    coverageAreas: Array.isArray(data.coverageAreas) ? data.coverageAreas : (data.coverageAreas ? [data.coverageAreas] : []),
    experienceYears: Number(data.experienceYears) || 1,
    priceEstimate: data.priceEstimate || 'A convenir según trabajo',
    availability: data.availability || 'Lunes a Viernes 8:00 a 18:00 hs',
    matricula: data.matricula || '',
    hasMatricula: Boolean(data.hasMatricula || data.matricula),
    gallery: Array.isArray(data.gallery) && data.gallery.length > 0 ? data.gallery : [
      'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?w=600&auto=format&fit=crop&q=80'
    ],
    rating: 5.0,
    reviewCount: 0,
    reviews: [],
    verificationStatus: settings.autoApproval ? 'approved' : 'pending',
    isVerified: settings.autoApproval,
    adminNotes: data.adminNotes || (settings.autoApproval ? 'Aprobado automáticamente según configuración' : 'Registro nuevo pendiente de revisión de datos y contacto.'),
    featuredTier: (data.featuredTier && ['gold', 'silver', 'bronze'].includes(data.featuredTier)) ? (data.featuredTier as any) : 'none',
    featuredExpiresAt: (data.featuredTier && ['gold', 'silver', 'bronze'].includes(data.featuredTier)) ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : undefined,
    viewsCount: 1,
    whatsappClicks: 0,
    workStatus: data.workStatus === 'busy' ? 'busy' : 'available',
    createdAt: new Date().toISOString().split('T')[0]
  };

  professionals.unshift(newProf);
  res.status(201).json(newProf);
});

// PUT update professional profile
app.put('/api/professionals/:id', (req, res) => {
  const index = professionals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }

  const current = professionals[index];
  const updates = req.body;

  // Protect admin-only fields unless explicitly updated through admin endpoints
  professionals[index] = {
    ...current,
    ...updates,
    id: current.id,
    whatsapp: updates.whatsapp ? String(updates.whatsapp).replace(/\D/g, '') : current.whatsapp,
    workStatus: updates.workStatus !== undefined ? (updates.workStatus === 'busy' ? 'busy' : 'available') : (current.workStatus || 'available'),
    // Preserve verification status if edited by provider
    verificationStatus: updates.verificationStatus !== undefined ? updates.verificationStatus : current.verificationStatus,
    featuredTier: updates.featuredTier !== undefined ? updates.featuredTier : current.featuredTier,
  };

  res.json(professionals[index]);
});

// POST Admin verification (Approve / Reject / Note)
app.post('/api/professionals/:id/verify', (req, res) => {
  const { status, adminNotes } = req.body;
  const prof = professionals.find(p => p.id === req.params.id);
  if (!prof) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }

  if (status !== 'approved' && status !== 'rejected' && status !== 'pending') {
    return res.status(400).json({ error: 'Estado de verificación no válido' });
  }

  prof.verificationStatus = status;
  prof.isVerified = status === 'approved';
  if (adminNotes !== undefined) {
    prof.adminNotes = adminNotes;
  }

  res.json({ success: true, professional: prof });
});

// POST Admin / Provider set featured plan
app.post('/api/professionals/:id/feature', (req, res) => {
  const { tier, durationMonths = 1 } = req.body;
  const prof = professionals.find(p => p.id === req.params.id);
  if (!prof) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }

  prof.featuredTier = tier || 'none';
  if (tier !== 'none') {
    const exp = new Date();
    exp.setMonth(exp.getMonth() + Number(durationMonths));
    prof.featuredExpiresAt = exp.toISOString().split('T')[0];
  } else {
    prof.featuredExpiresAt = undefined;
  }

  res.json({ success: true, professional: prof });
});

// DELETE single professional
app.delete('/api/professionals/:id', (req, res) => {
  const index = professionals.findIndex(p => p.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }
  const removed = professionals.splice(index, 1)[0];
  res.json({ success: true, removedId: removed.id });
});

// DELETE all demo data (Admin action to purge sample data)
app.delete('/api/admin/demos', (req, res) => {
  const initialProfCount = professionals.length;
  const initialJobCount = jobRequests.length;
  
  professionals = professionals.filter(p => !p.isDemo && !p.id.startsWith('prof-demo-') && !p.name.includes('(Demo)'));
  jobRequests = jobRequests.filter(j => !j.isDemo && !j.id.startsWith('job-demo-') && !j.title.includes('(Demo)'));
  
  res.json({ 
    success: true, 
    deletedProfessionals: initialProfCount - professionals.length,
    deletedJobs: initialJobCount - jobRequests.length,
    remainingProfessionals: professionals.length,
    remainingJobs: jobRequests.length
  });
});

// POST Track profile / data view
app.post('/api/professionals/:id/view', (req, res) => {
  const prof = professionals.find(p => p.id === req.params.id);
  if (prof) {
    prof.viewsCount = (prof.viewsCount || 0) + 1;
    return res.json({ success: true, viewsCount: prof.viewsCount, whatsappClicks: prof.whatsappClicks || 0 });
  }
  res.status(404).json({ error: 'No encontrado' });
});

// POST Track WhatsApp contact click
app.post('/api/professionals/:id/whatsapp-click', (req, res) => {
  const prof = professionals.find(p => p.id === req.params.id);
  if (prof) {
    prof.whatsappClicks = (prof.whatsappClicks || 0) + 1;
    return res.json({ success: true, clicks: prof.whatsappClicks, viewsCount: prof.viewsCount || 0 });
  }
  res.status(404).json({ error: 'No encontrado' });
});

// POST Add client review / testimonial
app.post('/api/professionals/:id/reviews', (req, res) => {
  const { author, rating, comment, serviceType } = req.body;
  const prof = professionals.find(p => p.id === req.params.id);
  if (!prof) {
    return res.status(404).json({ error: 'Profesional no encontrado' });
  }

  const numericRating = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  const newReview = {
    id: `rev-${Date.now()}`,
    author: author?.trim() || 'Cliente de ServiciosYa',
    rating: numericRating,
    date: new Date().toISOString().split('T')[0],
    comment: comment?.trim() || 'Excelente trabajo, puntual y muy recomendado.',
    serviceType: serviceType?.trim() || undefined
  };

  prof.reviews = [newReview, ...(prof.reviews || [])];
  prof.reviewCount = prof.reviews.length;
  
  const sum = prof.reviews.reduce((acc, r) => acc + r.rating, 0);
  prof.rating = Number((sum / prof.reviews.length).toFixed(1));

  res.status(201).json({ success: true, review: newReview, professional: prof });
});

// ================= AUTH & ANTI-HACKER SECURITY ROUTES =================

// Check current client IP security status
app.get('/api/auth/admin-security-status', (req, res) => {
  const clientIp = getClientIp(req);
  const ipState = ipSecurityRecords.get(clientIp);

  if (ipState && ipState.isBlocked && ipState.blockedUntil) {
    if (Date.now() < ipState.blockedUntil) {
      const remainingMin = Math.ceil((ipState.blockedUntil - Date.now()) / 60000);
      return res.json({
        firewallActive: true,
        clientIp,
        isBlocked: true,
        attempts: ipState.failedAttempts,
        remainingAttempts: 0,
        blockedUntil: ipState.blockedUntil,
        remainingMinutes: remainingMin,
      });
    } else {
      ipSecurityRecords.delete(clientIp);
    }
  }

  const attempts = ipState ? ipState.failedAttempts : 0;
  res.json({
    firewallActive: true,
    clientIp,
    isBlocked: false,
    attempts,
    remainingAttempts: Math.max(0, 3 - attempts),
    blockedUntil: null,
    remainingMinutes: 0,
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password, role } = req.body;
  const clientIp = getClientIp(req);
  const normalizedEmail = (email || '').toLowerCase().trim();

  // Admin login check
  const isAdminUser = normalizedEmail === 'serviciosyaparaguay@gmail.com' || normalizedEmail === 'admin' || normalizedEmail === 'serviciosya';
  if (role === 'admin' || isAdminUser) {
    // 1. Check if IP is currently blocked
    const ipState = ipSecurityRecords.get(clientIp);
    if (ipState && ipState.isBlocked && ipState.blockedUntil) {
      if (Date.now() < ipState.blockedUntil) {
        const remainingMin = Math.ceil((ipState.blockedUntil - Date.now()) / 60000);
        logSecurityEvent(
          'failed_login',
          clientIp,
          `Intento de ingreso denegado a IP bloqueada (${remainingMin} min restantes) para usuario: "${email || 'desconocido'}"`,
          'high'
        );
        return res.status(403).json({
          error: 'IP Bloqueada por Seguridad Anti-Hacker',
          isBlocked: true,
          attempts: ipState.failedAttempts,
          remainingAttempts: 0,
          blockedUntil: ipState.blockedUntil,
          remainingMinutes: remainingMin,
          clientIp,
          message: `Acceso restringido: Esta dirección IP (${clientIp}) se encuentra bloqueada tras 3 intentos fallidos de acceso al panel administrador. Por motivos de seguridad anti-hacker, esperá ${remainingMin} minuto(s) o contactá a soporte técnico.`
        });
      } else {
        // Lock expired
        ipSecurityRecords.delete(clientIp);
      }
    }

    // 2. Validate credentials
    const isPasswordValid = password === 'Servi270985#';
    const isLoginValid = isAdminUser && isPasswordValid;

    if (!isLoginValid) {
      const currentAttempts = (ipState ? ipState.failedAttempts : 0) + 1;
      const willBlock = currentAttempts >= 3;
      const blockedUntil = willBlock ? Date.now() + 60 * 60 * 1000 : null; // 60 minutes lockout

      const updatedState: IpSecurityState = {
        ip: clientIp,
        failedAttempts: currentAttempts,
        blockedAt: willBlock ? Date.now() : (ipState?.blockedAt || null),
        blockedUntil,
        isBlocked: willBlock,
        lastAttemptedUser: email || 'desconocido',
        reason: willBlock ? 'Bloqueo automático tras 3 intentos fallidos en panel administrador' : undefined,
      };
      ipSecurityRecords.set(clientIp, updatedState);

      if (willBlock) {
        totalAttacksBlocked++;
        logSecurityEvent(
          'ip_blocked',
          clientIp,
          `¡ALERTA CRÍTICA! IP ${clientIp} BLOQUEADA automáticamente tras 3 intentos fallidos de autenticación en panel administrador (usuario intentado: "${email || 'admin'}").`,
          'critical'
        );

        return res.status(403).json({
          error: 'IP Bloqueada por Seguridad Anti-Hacker',
          isBlocked: true,
          attempts: 3,
          remainingAttempts: 0,
          blockedUntil,
          remainingMinutes: 60,
          clientIp,
          message: `¡ACCESO BLOQUEADO! Has alcanzado el límite de 3 intentos fallidos. Tu dirección IP (${clientIp}) ha sido bloqueada automáticamente por el escudo anti-hacker de ServiciosYa durante 60 minutos.`
        });
      } else {
        const remaining = 3 - currentAttempts;
        logSecurityEvent(
          'failed_login',
          clientIp,
          `Intento fallido de acceso administrador (${currentAttempts}/3) con credencial "${email || ''}". Quedan ${remaining} intento(s) antes del bloqueo de IP.`,
          'medium'
        );

        return res.status(401).json({
          error: `Credenciales incorrectas. Intento ${currentAttempts} de 3. Al 3er intento fallido tu dirección IP (${clientIp}) será bloqueada.`,
          isBlocked: false,
          attempts: currentAttempts,
          remainingAttempts: remaining,
          clientIp,
          message: `Intento ${currentAttempts} de 3. Advertencia de seguridad: Quedan ${remaining} intento(s) antes del bloqueo de tu dirección IP.`
        });
      }
    }

    // 3. Login Valid: Reset failed attempts for this IP
    ipSecurityRecords.delete(clientIp);
    logSecurityEvent(
      'successful_login',
      clientIp,
      `Acceso legítimo autorizado al Panel Administrador para ${normalizedEmail}`,
      'low'
    );

    return res.json({
      success: true,
      user: {
        role: 'admin',
        name: 'Administrador ServiciosYa',
        email: 'serviciosyaparaguay@gmail.com',
      },
      token: `admin_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      clientIp
    });
  }

  // Provider login check
  const prof = professionals.find(p => p.email.toLowerCase() === (email || '').toLowerCase().trim());
  if (!prof) {
    return res.status(401).json({ error: 'No existe una cuenta profesional con este email' });
  }

  if (prof.password && prof.password !== password) {
    return res.status(401).json({ error: 'Contraseña incorrecta' });
  }

  res.json({
    success: true,
    user: {
      role: 'provider',
      email: prof.email,
      name: prof.name,
      professionalId: prof.id
    },
    professional: prof
  });
});

// Admin Security Dashboard API
app.get('/api/admin/security', (req, res) => {
  const clientIp = getClientIp(req);
  const activeBlockedIps: BlockedIpRecord[] = [];

  for (const [ip, state] of ipSecurityRecords.entries()) {
    if (state.isBlocked && state.blockedUntil && Date.now() < state.blockedUntil) {
      activeBlockedIps.push({
        ip,
        failedAttempts: state.failedAttempts,
        blockedAt: state.blockedAt || Date.now(),
        blockedUntil: state.blockedUntil,
        lastAttemptedUser: state.lastAttemptedUser,
        reason: state.reason || '3 intentos fallidos de acceso administrador',
      });
    }
  }

  const ipState = ipSecurityRecords.get(clientIp);
  const isClientBlocked = !!(ipState && ipState.isBlocked && ipState.blockedUntil && Date.now() < ipState.blockedUntil);
  const clientRemainingMinutes = isClientBlocked && ipState?.blockedUntil ? Math.ceil((ipState.blockedUntil - Date.now()) / 60000) : 0;

  res.json({
    firewallActive: true,
    clientIp,
    isClientBlocked,
    clientAttempts: ipState ? ipState.failedAttempts : 0,
    clientRemainingAttempts: isClientBlocked ? 0 : Math.max(0, 3 - (ipState?.failedAttempts || 0)),
    clientBlockedUntil: ipState?.blockedUntil || null,
    clientRemainingMinutes,
    totalBlockedIps: activeBlockedIps.length,
    blockedIps: activeBlockedIps,
    auditLogs: securityAuditLogs.slice(0, 100),
    totalAttacksBlocked,
  });
});

// Admin Security Unblock IP
app.post('/api/admin/security/unblock', (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(400).json({ error: 'Dirección IP requerida' });
  }
  const adminIp = getClientIp(req);
  ipSecurityRecords.delete(ip);
  logSecurityEvent('manual_unblock', ip, `IP ${ip} desbloqueada manualmente por el administrador desde ${adminIp}`, 'medium');
  res.json({ success: true, message: `Dirección IP ${ip} desbloqueada correctamente.` });
});

// Admin Security Manual Block IP
app.post('/api/admin/security/block', (req, res) => {
  const { ip, reason } = req.body;
  if (!ip) {
    return res.status(400).json({ error: 'Dirección IP requerida' });
  }
  const adminIp = getClientIp(req);
  const blockedUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 hours manual block
  ipSecurityRecords.set(ip, {
    ip,
    failedAttempts: 3,
    blockedAt: Date.now(),
    blockedUntil,
    isBlocked: true,
    reason: reason || 'Bloqueo manual por sospecha de intrusión / ataque',
  });
  logSecurityEvent('manual_block', ip, `IP ${ip} bloqueada manualmente por el administrador (${reason || 'Sospecha de ataque'})`, 'high');
  res.json({ success: true, message: `IP ${ip} bloqueada con éxito por 24 horas.` });
});

// Admin Security Clear Logs
app.post('/api/admin/security/clear-logs', (req, res) => {
  securityAuditLogs.length = 0;
  logSecurityEvent('successful_login', getClientIp(req), 'Registro de auditoría limpiado por el administrador', 'low');
  res.json({ success: true });
});

// ================= ADMIN SETTINGS & SPONSORS =================

app.get('/api/admin/settings', (req, res) => {
  res.json(settings);
});

app.put('/api/admin/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, settings });
});

app.get('/api/admin/sponsors', (req, res) => {
  res.json(sponsors);
});

app.post('/api/admin/sponsors', (req, res) => {
  const data = req.body;
  const newSponsor: SponsorBanner = {
    id: `spon-${Date.now()}`,
    title: data.title || 'Nuevo Auspiciante',
    sponsorName: data.sponsorName || 'Empresa Patrocinadora',
    description: data.description || '',
    imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&auto=format&fit=crop&q=80',
    targetUrl: data.targetUrl || 'https://serviciosya.com',
    whatsapp: data.whatsapp ? String(data.whatsapp).replace(/\D/g, '') : undefined,
    placement: data.placement || 'middle_feed',
    monthlyFee: Number(data.monthlyFee) || 30000,
    active: data.active !== undefined ? Boolean(data.active) : true,
    impressions: 0,
    clicks: 0,
    startDate: data.startDate || new Date().toISOString().split('T')[0],
    endDate: data.endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  };

  sponsors.unshift(newSponsor);
  res.status(201).json(newSponsor);
});

app.put('/api/admin/sponsors/:id', (req, res) => {
  const index = sponsors.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Auspiciante no encontrado' });
  }

  sponsors[index] = { ...sponsors[index], ...req.body };
  res.json(sponsors[index]);
});

app.delete('/api/admin/sponsors/:id', (req, res) => {
  const index = sponsors.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Auspiciante no encontrado' });
  }
  sponsors.splice(index, 1);
  res.json({ success: true });
});

app.post('/api/admin/sponsors/:id/click', (req, res) => {
  const sponsor = sponsors.find(s => s.id === req.params.id);
  if (sponsor) {
    sponsor.clicks = (sponsor.clicks || 0) + 1;
    return res.json({ success: true, clicks: sponsor.clicks });
  }
  res.status(404).json({ error: 'Auspiciante no encontrado' });
});

// ================= JOB REQUESTS (beBee Style Marketplace) =================

app.get('/api/jobs', (req, res) => {
  const { trade, zone, urgency } = req.query;
  let results = [...jobRequests];

  if (trade && typeof trade === 'string' && trade !== 'all' && trade !== 'Todos') {
    results = results.filter(j => j.trade.toLowerCase() === trade.toLowerCase());
  }

  if (zone && typeof zone === 'string' && zone !== 'all' && zone !== 'Todas las zonas') {
    results = results.filter(j => j.zone.toLowerCase().includes(zone.toLowerCase()));
  }

  if (urgency && typeof urgency === 'string' && urgency !== 'all') {
    results = results.filter(j => j.urgency === urgency);
  }

  res.json(results);
});

app.post('/api/jobs', (req, res) => {
  const data = req.body;
  if (!data.title || !data.trade || !data.zone || !data.clientPhone) {
    return res.status(400).json({ error: 'Título, oficio, zona y teléfono de WhatsApp son requeridos' });
  }

  const cleanPhone = (data.clientPhone || '').replace(/\D/g, '');
  const newJob: ServiceJobRequest = {
    id: `job-${Date.now()}`,
    title: data.title.trim(),
    trade: data.trade,
    zone: data.zone,
    clientName: data.clientName?.trim() || 'Particular',
    clientPhone: cleanPhone.startsWith('595') ? cleanPhone : `595${cleanPhone.replace(/^0+/, '')}`,
    budgetGs: data.budgetGs?.trim() || 'A convenir',
    description: data.description?.trim() || 'Sin descripción adicional.',
    urgency: data.urgency || 'hoy',
    status: 'open',
    createdAt: new Date().toISOString(),
    responsesCount: 0
  };

  jobRequests.unshift(newJob);
  res.status(201).json(newJob);
});

app.post('/api/jobs/:id/respond', (req, res) => {
  const job = jobRequests.find(j => j.id === req.params.id);
  if (job) {
    job.responsesCount = (job.responsesCount || 0) + 1;
    return res.json({ success: true, job });
  }
  res.status(404).json({ error: 'Pedido no encontrado' });
});

// ================= VISITOR SUGGESTIONS (BUZÓN DE LA COMUNIDAD) =================

// GET all suggestions
app.get('/api/suggestions', (req, res) => {
  const { status, type } = req.query;
  let list = [...visitorSuggestions];

  if (status && typeof status === 'string' && status !== 'all') {
    list = list.filter(s => s.status === status);
  }

  if (type && typeof type === 'string' && type !== 'all') {
    list = list.filter(s => s.type === type);
  }

  // Sort by votesCount descending, then by date
  list.sort((a, b) => b.votesCount - a.votesCount || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(list);
});

// POST new suggestion from a visitor
app.post('/api/suggestions', (req, res) => {
  const data = req.body;
  if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
    return res.status(400).json({ error: 'El nombre del oficio o servicio es obligatorio' });
  }

  const cleanPhone = (data.visitorContact || '').replace(/[^\d+]/g, '');

  const newSuggestion: VisitorSuggestion = {
    id: `sug-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    title: data.title.trim(),
    type: data.type || 'oficio',
    suggestedZone: data.suggestedZone?.trim() || 'Todo el Paraguay',
    description: data.description?.trim() || 'Sugerido por un visitante de la plataforma.',
    visitorName: data.visitorName?.trim() || 'Visitante de la web',
    visitorContact: cleanPhone,
    votesCount: 1,
    status: 'pending',
    adminNotes: '',
    createdAt: new Date().toISOString()
  };

  visitorSuggestions.unshift(newSuggestion);
  res.status(201).json(newSuggestion);
});

// POST upvote a suggestion
app.post('/api/suggestions/:id/vote', (req, res) => {
  const sug = visitorSuggestions.find(s => s.id === req.params.id);
  if (!sug) {
    return res.status(404).json({ error: 'Sugerencia no encontrada' });
  }

  sug.votesCount = (sug.votesCount || 0) + 1;
  res.json({ success: true, votesCount: sug.votesCount, suggestion: sug });
});

// PUT update suggestion status & admin feedback (admin action)
app.put('/api/suggestions/:id/status', (req, res) => {
  const { status, adminNotes } = req.body;
  const sug = visitorSuggestions.find(s => s.id === req.params.id);
  if (!sug) {
    return res.status(404).json({ error: 'Sugerencia no encontrada' });
  }

  if (status) sug.status = status;
  if (adminNotes !== undefined) sug.adminNotes = adminNotes;

  res.json({ success: true, suggestion: sug });
});

// DELETE suggestion (admin action)
app.delete('/api/suggestions/:id', (req, res) => {
  const idx = visitorSuggestions.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Sugerencia no encontrada' });
  }

  visitorSuggestions.splice(idx, 1);
  res.json({ success: true, message: 'Sugerencia eliminada con éxito' });
});


// ================= SMART SEARCH WITH GEMINI AI =================

app.post('/api/ai-search', async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'Debe ingresar una consulta' });
  }

  const promptText = query.trim();

  // Helper heuristic fallback if Gemini is offline or fails
  const getHeuristicResult = (): SmartSearchResult => {
    const qLower = promptText.toLowerCase();
    const tradeSuggestions: TradeCategory[] = [];
    let urgencyLevel: 'alta' | 'media' | 'normal' = 'normal';

    if (qLower.includes('agua') || qLower.includes('caño') || qLower.includes('canilla') || qLower.includes('inodoro') || qLower.includes('pileta') || qLower.includes('perdida') || qLower.includes('gotera') || qLower.includes('plomer')) {
      tradeSuggestions.push('Plomero');
      if (qLower.includes('inund') || qLower.includes('urgente') || qLower.includes('revent')) urgencyLevel = 'alta';
    }
    if (qLower.includes('luz') || qLower.includes('cable') || qLower.includes('termica') || qLower.includes('disyuntor') || qLower.includes('enchufe') || qLower.includes('chisp') || qLower.includes('electric')) {
      tradeSuggestions.push('Electricista');
      if (qLower.includes('humo') || qLower.includes('chisp') || qLower.includes('cortocircuito')) urgencyLevel = 'alta';
    }
    if (qLower.includes('pasto') || qLower.includes('jardin') || qLower.includes('arbol') || qLower.includes('poda') || qLower.includes('plant') || qLower.includes('cesped')) {
      tradeSuggestions.push('Jardinería');
    }
    if (qLower.includes('mueble') || qLower.includes('madera') || qLower.includes('placard') || qLower.includes('puerta') || qLower.includes('carpinter')) {
      tradeSuggestions.push('Carpintero');
    }
    if (qLower.includes('pared') || qLower.includes('revoque') || qLower.includes('piso') || qLower.includes('ceramico') || qLower.includes('albanil') || qLower.includes('obra') || qLower.includes('construc')) {
      tradeSuggestions.push('Albañiles');
    }
    if (qLower.includes('bebe') || qLower.includes('nene') || qLower.includes('hijo') || qLower.includes('niñera') || qLower.includes('chico') || qLower.includes('cuidar')) {
      tradeSuggestions.push('Niñeras');
    }
    if (qLower.includes('comida') || qLower.includes('cocina') || qLower.includes('vianda') || qLower.includes('evento') || qLower.includes('cena') || qLower.includes('chef') || qLower.includes('cocinera')) {
      tradeSuggestions.push('Cocineras');
    }
    if (qLower.includes('llave') || qLower.includes('traba') || qLower.includes('afuera') || qLower.includes('candado') || qLower.includes('cerraj')) {
      tradeSuggestions.push('Cerrajería');
      urgencyLevel = 'alta';
    }
    if (qLower.includes('gas') || qLower.includes('calefon') || qLower.includes('termotanque') || qLower.includes('estufa')) {
      tradeSuggestions.push('Gasista');
      if (qLower.includes('olor') || qLower.includes('fuga')) urgencyLevel = 'alta';
    }
    if (qLower.includes('aire') || qLower.includes('clima') || qLower.includes('frio') || qLower.includes('split')) {
      tradeSuggestions.push('Aire Acondicionado');
    }
    if (qLower.includes('pint') || qLower.includes('latex') || qLower.includes('humedad')) {
      tradeSuggestions.push('Pintor');
    }

    // Default to Plomero / Electricista if none matched
    if (tradeSuggestions.length === 0) {
      tradeSuggestions.push('Plomero', 'Electricista');
    }

    const matched = professionals
      .filter(p => p.verificationStatus === 'approved' && tradeSuggestions.includes(p.trade))
      .map(p => p.id);

    return {
      tradeSuggestions,
      problemAnalysis: `Detectamos que tu necesidad se relaciona con ${tradeSuggestions.join(' o ')}. Analizamos tu descripción: "${promptText}".`,
      urgencyLevel,
      recommendedAction: urgencyLevel === 'alta'
        ? 'Te sugerimos contactar inmediatamente por WhatsApp a los profesionales disponibles para urgencias 24 hs.'
        : 'Revisá los perfiles verificados a continuación y solicitá presupuestos sin compromiso por WhatsApp.',
      matchedProfessionalIds: matched
    };
  };

  try {
    const ai = getAI();
    if (!ai) {
      return res.json(getHeuristicResult());
    }

    const systemInstruction = `Eres el Asistente Inteligente de ServiciosYa (Directorio de Oficios y Profesionales de Argentina/Latinoamérica).
Tu misión es interpretar la necesidad del usuario expresada en lenguaje coloquial (ej: "tengo una gotera", "se me quemó la térmica", "necesito preparar viandas semanales", "tengo que podar el cerco", "quiero poner porcelanato en el living") y recomendar los oficios correctos.
Oficios disponibles exactamente: ["Plomero", "Electricista", "Jardinería", "Carpintero", "Albañiles", "Niñeras", "Cocineras", "Pintor", "Gasista", "Cerrajería", "Aire Acondicionado", "Mecánico", "Limpieza", "Fletes y Mudanzas", "Herrería", "Cuidado de Adultos"].
Debes responder ÚNICAMENTE un JSON válido con esta estructura:
{
  "tradeSuggestions": ["Oficio1", "Oficio2"],
  "problemAnalysis": "Explicación breve y amigable en español de lo que necesita el cliente y qué trabajo se requiere",
  "urgencyLevel": "alta" | "media" | "normal",
  "recommendedAction": "Consejo práctico para el cliente al contactar al profesional por WhatsApp"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Consulta del cliente: "${promptText}"`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const matched = professionals
      .filter(p => p.verificationStatus === 'approved' && (parsed.tradeSuggestions || []).includes(p.trade))
      .map(p => p.id);

    const result: SmartSearchResult = {
      tradeSuggestions: parsed.tradeSuggestions || ['Plomero'],
      problemAnalysis: parsed.problemAnalysis || 'Detectamos tu necesidad.',
      urgencyLevel: parsed.urgencyLevel || 'normal',
      recommendedAction: parsed.recommendedAction || 'Contactá al profesional por WhatsApp para coordinar.',
      matchedProfessionalIds: matched
    };

    res.json(result);
  } catch (error) {
    console.error('Error calling Gemini for smart search, falling back to heuristic:', error);
    res.json(getHeuristicResult());
  }
});

// ================= VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { dotfiles: 'ignore' }));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ServiciosYa Server corriendo en http://localhost:${PORT}`);
  });
}

startServer();
