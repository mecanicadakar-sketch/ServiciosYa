import {
  ServiceProfessional,
  SponsorBanner,
  AdminSettings,
  ServiceJobRequest,
  VisitorSuggestion,
  Review,
  SecurityAuditLog,
  BlockedIpRecord,
  SecurityStatusResponse
} from '../types';
import {
  INITIAL_PROFESSIONALS,
  INITIAL_SETTINGS,
  INITIAL_SPONSORS,
  INITIAL_JOB_REQUESTS,
  INITIAL_SUGGESTIONS
} from '../data/seedData';

const KEYS = {
  PROFESSIONALS: 'serviciosya_db_professionals',
  SETTINGS: 'serviciosya_db_settings',
  SPONSORS: 'serviciosya_db_sponsors',
  JOBS: 'serviciosya_db_jobs',
  SUGGESTIONS: 'serviciosya_db_suggestions',
  SECURITY: 'serviciosya_db_security',
  SECURITY_LOGS: 'serviciosya_db_security_logs',
  BLOCKED_IPS: 'serviciosya_db_blocked_ips'
};

// Cached client public IP
let cachedClientIp: string | null = null;

export async function detectClientIp(): Promise<string> {
  if (cachedClientIp) return cachedClientIp;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1500);
    const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        cachedClientIp = data.ip;
        return data.ip;
      }
    }
  } catch {
    // Fallback silently
  }
  cachedClientIp = 'Vercel Online';
  return cachedClientIp;
}

export const localStore = {
  getProfessionals(): ServiceProfessional[] {
    try {
      const raw = localStorage.getItem(KEYS.PROFESSIONALS);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.PROFESSIONALS, JSON.stringify(INITIAL_PROFESSIONALS));
    return [...INITIAL_PROFESSIONALS];
  },

  saveProfessionals(profs: ServiceProfessional[]): void {
    try {
      localStorage.setItem(KEYS.PROFESSIONALS, JSON.stringify(profs));
    } catch {}
  },

  getSettings(): AdminSettings {
    try {
      const raw = localStorage.getItem(KEYS.SETTINGS);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(INITIAL_SETTINGS));
    return { ...INITIAL_SETTINGS };
  },

  saveSettings(settings: AdminSettings): void {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  getSponsors(): SponsorBanner[] {
    try {
      const raw = localStorage.getItem(KEYS.SPONSORS);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.SPONSORS, JSON.stringify(INITIAL_SPONSORS));
    return [...INITIAL_SPONSORS];
  },

  saveSponsors(sponsors: SponsorBanner[]): void {
    try {
      localStorage.setItem(KEYS.SPONSORS, JSON.stringify(sponsors));
    } catch {}
  },

  getJobs(): ServiceJobRequest[] {
    try {
      const raw = localStorage.getItem(KEYS.JOBS);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.JOBS, JSON.stringify(INITIAL_JOB_REQUESTS as ServiceJobRequest[]));
    return [...INITIAL_JOB_REQUESTS as ServiceJobRequest[]];
  },

  saveJobs(jobs: ServiceJobRequest[]): void {
    try {
      localStorage.setItem(KEYS.JOBS, JSON.stringify(jobs));
    } catch {}
  },

  getSuggestions(): VisitorSuggestion[] {
    try {
      const raw = localStorage.getItem(KEYS.SUGGESTIONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(KEYS.SUGGESTIONS, JSON.stringify(INITIAL_SUGGESTIONS));
    return [...INITIAL_SUGGESTIONS];
  },

  saveSuggestions(sugs: VisitorSuggestion[]): void {
    try {
      localStorage.setItem(KEYS.SUGGESTIONS, JSON.stringify(sugs));
    } catch {}
  },

  getSecurityState(): {
    attempts: number;
    isBlocked: boolean;
    blockedUntil: number | null;
    clientIp: string;
  } {
    try {
      const raw = localStorage.getItem(KEYS.SECURITY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.isBlocked && parsed.blockedUntil) {
          if (Date.now() >= parsed.blockedUntil) {
            // Lock expired
            parsed.isBlocked = false;
            parsed.attempts = 0;
            parsed.blockedUntil = null;
            localStorage.setItem(KEYS.SECURITY, JSON.stringify(parsed));
          }
        }
        return parsed;
      }
    } catch {}
    const initial = {
      attempts: 0,
      isBlocked: false,
      blockedUntil: null,
      clientIp: cachedClientIp || 'Vercel Online'
    };
    return initial;
  },

  saveSecurityState(state: {
    attempts: number;
    isBlocked: boolean;
    blockedUntil: number | null;
    clientIp: string;
  }): void {
    try {
      localStorage.setItem(KEYS.SECURITY, JSON.stringify(state));
    } catch {}
  },

  getSecurityLogs(): SecurityAuditLog[] {
    try {
      const raw = localStorage.getItem(KEYS.SECURITY_LOGS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: `sec_init_${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: 'successful_login',
        ip: cachedClientIp || 'Vercel Online',
        details: 'Escudo Anti-Hacker y cortafuegos inicializado en modo resiliente.',
        severity: 'low'
      }
    ];
  },

  logSecurityEvent(
    type: SecurityAuditLog['type'],
    ip: string,
    details: string,
    severity: SecurityAuditLog['severity'] = 'medium'
  ): void {
    const logs = this.getSecurityLogs();
    const newLog: SecurityAuditLog = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      type,
      ip,
      details,
      severity
    };
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    try {
      localStorage.setItem(KEYS.SECURITY_LOGS, JSON.stringify(logs));
    } catch {}
  },

  clearSecurityLogs(): void {
    try {
      localStorage.removeItem(KEYS.SECURITY_LOGS);
    } catch {}
  },

  getBlockedIps(): BlockedIpRecord[] {
    try {
      const raw = localStorage.getItem(KEYS.BLOCKED_IPS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  },

  saveBlockedIps(records: BlockedIpRecord[]): void {
    try {
      localStorage.setItem(KEYS.BLOCKED_IPS, JSON.stringify(records));
    } catch {}
  }
};
