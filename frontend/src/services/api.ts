import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('bookleaf_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || `HTTP error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data as T;
  }

  // --- Auth Endpoints ---
  async login(email: string, password: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  async getDemoAccounts() {
    return this.request<{
      success: boolean;
      admin: { email: string; password: string; description: string };
      sampleAuthors: Array<{ id: string; name: string; email: string; password: string; books: any[] }>;
    }>('/auth/demo-accounts');
  }

  // --- File Upload ---
  async uploadFile(file: File) {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.error || `Upload failed with status ${response.status}`);
    }
    return data as {
      success: boolean;
      file: {
        url: string;
        name: string;
        mimetype: string;
        size: number;
      };
    };
  }

  // --- Author Endpoints ---
  async getAuthorBooks() {
    return this.request<{ success: boolean; summary: any; books: any[] }>('/author/books');
  }

  async getAuthorTickets() {
    return this.request<{ success: boolean; tickets: any[] }>('/author/tickets');
  }

  async submitAuthorTicket(payload: {
    book_id: string | null;
    subject: string;
    description: string;
    attachment_name?: string;
    attachment_url?: string;
  }) {
    return this.request<{ success: boolean; ticket: any }>('/author/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async replyAuthorTicket(
    ticketId: string,
    message: string,
    attachment_name?: string,
    attachment_url?: string
  ) {
    return this.request<{ success: boolean; message: any }>(`/author/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message, attachment_name, attachment_url }),
    });
  }

  // --- Admin Endpoints ---
  async getAdminTickets(filters: {
    status?: string;
    category?: string;
    priority?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const params = new URLSearchParams();
    if (filters.status && filters.status !== 'all') params.append('status', filters.status);
    if (filters.category && filters.category !== 'all') params.append('category', filters.category);
    if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; count: number; tickets: any[] }>(`/admin/tickets${queryStr}`);
  }

  async getAdminTicketById(ticketId: string) {
    return this.request<{ success: boolean; ticket: any; aiDraft: string }>(`/admin/tickets/${ticketId}`);
  }

  async updateAdminTicket(
    ticketId: string,
    updates: { status?: string; category?: string; priority?: string; assigned_to?: string }
  ) {
    return this.request<{ success: boolean; ticket: any }>(`/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async addAdminInternalNote(ticketId: string, note: string) {
    return this.request<{ success: boolean; note: any }>(`/admin/tickets/${ticketId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ note }),
    });
  }

  async sendAdminOfficialReply(
    ticketId: string,
    payload: {
      message: string;
      is_ai_drafted?: boolean;
      markResolved?: boolean;
      attachment_name?: string;
      attachment_url?: string;
    }
  ) {
    return this.request<{ success: boolean; sentMessage: any; ticketStatus: string }>(
      `/admin/tickets/${ticketId}/reply`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  async getAdminAnalytics() {
    return this.request<{
      success: boolean;
      analytics: {
        total: number;
        openCount: number;
        inProgressCount: number;
        resolvedCount: number;
        criticalCount: number;
        categoryBreakdown: Record<string, number>;
      };
    }>('/admin/analytics');
  }

  // --- AI Sandbox Endpoints ---
  async testAIClassification(subject: string, description: string, bookTitle?: string) {
    return this.request<{ success: boolean; result: any }>('/ai/classify', {
      method: 'POST',
      body: JSON.stringify({ subject, description, bookTitle }),
    });
  }

  async regenerateAIDraft(ticketId: string) {
    return this.request<{ success: boolean; draft: string; source: string }>(`/ai/tickets/${ticketId}/draft`, {
      method: 'POST',
    });
  }

  // --- Notification Endpoints ---
  async getNotifications(filters: { type?: string; unreadOnly?: boolean } = {}) {
    const params = new URLSearchParams();
    if (filters.type && filters.type !== 'all') params.append('type', filters.type);
    if (filters.unreadOnly) params.append('unreadOnly', 'true');
    const queryStr = params.toString() ? `?${params.toString()}` : '';
    return this.request<{ success: boolean; notifications: any[]; unreadCount: number }>(`/notifications${queryStr}`);
  }

  async markNotificationAsRead(id: string) {
    return this.request<{ success: boolean; notification: any }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request<{ success: boolean; message: string }>('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async clearNotifications() {
    return this.request<{ success: boolean; message: string }>('/notifications/clear', {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

