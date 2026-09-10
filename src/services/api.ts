import { ServiceProfessional, SponsorBanner, AdminSettings, SmartSearchResult, ServiceJobRequest, VisitorSuggestion, Review, SecurityStatusResponse, BlockedIpRecord, SecurityAuditLog } from '../types';

export const api = {
  // Professionals
  async getProfessionals(params?: {
    trade?: string;
    zone?: string;
    q?: string;
    status?: string;
    featuredOnly?: boolean;
  }): Promise<ServiceProfessional[]> {
    const query = new URLSearchParams();
    if (params?.trade) query.append('trade', params.trade);
    if (params?.zone) query.append('zone', params.zone);
    if (params?.q) query.append('q', params.q);
    if (params?.status) query.append('status', params.status);
    if (params?.featuredOnly) query.append('featuredOnly', 'true');

    const res = await fetch(`/api/professionals?${query.toString()}`);
    if (!res.ok) throw new Error('Error al cargar profesionales');
    return res.json();
  },

  async getProfessionalById(id: string): Promise<ServiceProfessional> {
    const res = await fetch(`/api/professionals/${id}`);
    if (!res.ok) throw new Error('Profesional no encontrado');
    return res.json();
  },

  async registerProfessional(data: Partial<ServiceProfessional>): Promise<ServiceProfessional> {
    const res = await fetch('/api/professionals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al registrar profesional');
    }
    return res.json();
  },

  async updateProfessional(id: string, updates: Partial<ServiceProfessional>): Promise<ServiceProfessional> {
    const res = await fetch(`/api/professionals/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar profesional');
    return res.json();
  },

  async verifyProfessional(id: string, status: 'approved' | 'rejected' | 'pending', adminNotes?: string): Promise<{ success: boolean; professional: ServiceProfessional }> {
    const res = await fetch(`/api/professionals/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    if (!res.ok) throw new Error('Error al actualizar verificación');
    return res.json();
  },

  async setFeaturedPlan(id: string, tier: string, durationMonths = 1): Promise<{ success: boolean; professional: ServiceProfessional }> {
    const res = await fetch(`/api/professionals/${id}/feature`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier, durationMonths }),
    });
    if (!res.ok) throw new Error('Error al actualizar plan destacado');
    return res.json();
  },

  async trackWhatsAppClick(id: string): Promise<{ clicks: number; viewsCount: number } | null> {
    try {
      const res = await fetch(`/api/professionals/${id}/whatsapp-click`, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Non-blocking telemetry
    }
    return null;
  },

  async trackProfileView(id: string): Promise<{ viewsCount: number; whatsappClicks: number } | null> {
    try {
      const res = await fetch(`/api/professionals/${id}/view`, { method: 'POST' });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Non-blocking telemetry
    }
    return null;
  },

  async addReview(
    professionalId: string,
    review: { author: string; rating: number; comment: string; serviceType?: string }
  ): Promise<{ success: boolean; review: Review; professional: ServiceProfessional }> {
    const res = await fetch(`/api/professionals/${professionalId}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(review),
    });
    if (!res.ok) throw new Error('Error al agregar testimonio');
    return res.json();
  },

  // Auth
  async login(credentials: { email: string; password?: string; role?: 'admin' | 'provider' }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      let err: any;
      try {
        err = await res.json();
      } catch {
        err = { error: 'Error en la conexión con el servidor' };
      }
      const errorObj: any = new Error(err.message || err.error || 'Credenciales incorrectas');
      errorObj.status = res.status;
      errorObj.isBlocked = err.isBlocked;
      errorObj.attempts = err.attempts;
      errorObj.remainingAttempts = err.remainingAttempts;
      errorObj.blockedUntil = err.blockedUntil;
      errorObj.remainingMinutes = err.remainingMinutes;
      errorObj.clientIp = err.clientIp;
      errorObj.data = err;
      throw errorObj;
    }
    return res.json();
  },

  // Anti-Hacker & Security System
  async checkAdminSecurity(): Promise<{
    clientIp: string;
    isBlocked: boolean;
    attempts: number;
    remainingAttempts: number;
    blockedUntil: number | null;
    remainingMinutes: number;
    firewallActive: boolean;
  }> {
    const res = await fetch('/api/auth/admin-security-status');
    if (!res.ok) throw new Error('Error al verificar estado de seguridad');
    return res.json();
  },

  async getSecurityDashboard(): Promise<SecurityStatusResponse> {
    const res = await fetch('/api/admin/security');
    if (!res.ok) throw new Error('Error al cargar panel de seguridad');
    return res.json();
  },

  async unblockIp(ip: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/security/unblock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al desbloquear IP');
    }
    return res.json();
  },

  async manualBlockIp(ip: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/admin/security/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al bloquear IP');
    }
    return res.json();
  },

  async clearSecurityLogs(): Promise<{ success: boolean }> {
    const res = await fetch('/api/admin/security/clear-logs', {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al limpiar registros de auditoría');
    return res.json();
  },

  // Admin Settings & Sponsors
  async getSettings(): Promise<AdminSettings> {
    const res = await fetch('/api/admin/settings');
    if (!res.ok) throw new Error('Error al cargar configuraciones');
    return res.json();
  },

  async updateSettings(settings: Partial<AdminSettings>): Promise<AdminSettings> {
    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Error al guardar configuraciones');
    const data = await res.json();
    return data.settings;
  },

  async getSponsors(): Promise<SponsorBanner[]> {
    const res = await fetch('/api/admin/sponsors');
    if (!res.ok) throw new Error('Error al cargar auspiciantes');
    return res.json();
  },

  async addSponsor(sponsor: Partial<SponsorBanner>): Promise<SponsorBanner> {
    const res = await fetch('/api/admin/sponsors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sponsor),
    });
    if (!res.ok) throw new Error('Error al crear auspiciante');
    return res.json();
  },

  async updateSponsor(id: string, updates: Partial<SponsorBanner>): Promise<SponsorBanner> {
    const res = await fetch(`/api/admin/sponsors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Error al actualizar auspiciante');
    return res.json();
  },

  async deleteSponsor(id: string): Promise<void> {
    const res = await fetch(`/api/admin/sponsors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar auspiciante');
  },

  async trackSponsorClick(id: string): Promise<void> {
    try {
      await fetch(`/api/admin/sponsors/${id}/click`, { method: 'POST' });
    } catch {
      // Ignore
    }
  },

  // Smart AI Search
  async smartAiSearch(query: string): Promise<SmartSearchResult> {
    const res = await fetch('/api/ai-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    if (!res.ok) throw new Error('Error en búsqueda inteligente');
    return res.json();
  },

  // Job Requests (beBee style marketplace)
  async getJobs(params?: { trade?: string; zone?: string; urgency?: string }): Promise<ServiceJobRequest[]> {
    const query = new URLSearchParams();
    if (params?.trade) query.append('trade', params.trade);
    if (params?.zone) query.append('zone', params.zone);
    if (params?.urgency) query.append('urgency', params.urgency);

    const res = await fetch(`/api/jobs?${query.toString()}`);
    if (!res.ok) throw new Error('Error al cargar pedidos de trabajo');
    return res.json();
  },

  async createJob(job: Partial<ServiceJobRequest>): Promise<ServiceJobRequest> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al publicar pedido');
    }
    return res.json();
  },

  async respondJob(id: string): Promise<void> {
    try {
      await fetch(`/api/jobs/${id}/respond`, { method: 'POST' });
    } catch {
      // Non-blocking
    }
  },

  // Visitor Suggestions (Buzón de la Comunidad)
  async getSuggestions(params?: { status?: string; type?: string }): Promise<VisitorSuggestion[]> {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.type) query.append('type', params.type);

    const res = await fetch(`/api/suggestions?${query.toString()}`);
    if (!res.ok) throw new Error('Error al cargar sugerencias');
    return res.json();
  },

  async createSuggestion(data: Partial<VisitorSuggestion>): Promise<VisitorSuggestion> {
    const res = await fetch('/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Error al enviar la sugerencia');
    }
    return res.json();
  },

  async voteSuggestion(id: string): Promise<{ success: boolean; votesCount: number; suggestion: VisitorSuggestion }> {
    const res = await fetch(`/api/suggestions/${id}/vote`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Error al registrar voto');
    return res.json();
  },

  async updateSuggestionStatus(id: string, status: string, adminNotes?: string): Promise<{ success: boolean; suggestion: VisitorSuggestion }> {
    const res = await fetch(`/api/suggestions/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado de la sugerencia');
    return res.json();
  },

  async deleteSuggestion(id: string): Promise<void> {
    const res = await fetch(`/api/suggestions/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Error al eliminar sugerencia');
  }
};
