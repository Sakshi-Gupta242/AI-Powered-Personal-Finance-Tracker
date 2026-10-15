/**
 * API Service Client for AI-Powered Personal Finance Tracker
 */

let rawApiUrl = ((import.meta as any).env?.VITE_API_URL) || '';

if (!rawApiUrl) {
  // In production (not localhost/127.0.0.1), use relative /api path so requests route seamlessly
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    rawApiUrl = '/api';
  } else {
    rawApiUrl = 'http://localhost:5000/api';
  }
}

// Remove any trailing slashes
rawApiUrl = rawApiUrl.replace(/\/+$/, '');
// Ensure it ends with /api
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}
const API_BASE_URL = rawApiUrl;

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
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

    const config: RequestInit = {
      ...options,
      headers,
    };

    let response: Response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (networkError: any) {
      console.error(`[API Network Error] Failed connecting to: ${API_BASE_URL}${endpoint}`, networkError);
      throw new Error(
        `Unable to connect to backend server (${API_BASE_URL}). If using Render, please allow 30-45s for the free server to wake up, or check VITE_API_URL in Vercel settings.`
      );
    }

    // Handle binary / PDF download responses directly
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/pdf')) {
      return (await response.blob()) as unknown as T;
    }

    let data: any = {};
    try {
      data = await response.json();
    } catch (parseError) {
      data = { message: `Server returned status ${response.status} ${response.statusText}` };
    }

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      // If 401 unauthorized, optionally clear invalid token
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error(errorMessage);
    }

    return data;
  }

  // --- Auth APIs ---
  async register(name: string, email: string, password: string, confirmPassword?: string) {
    return this.request<{ success: boolean; token: string; user: any; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });
  }

  async login(email: string, password: string) {
    return this.request<{ success: boolean; token: string; user: any; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  // --- Dashboard APIs ---
  async getDashboardSummary() {
    return this.request<{
      success: boolean;
      summary: any;
      recent_transactions: any[];
      warnings: any[];
      top_recommendations: any[];
      savings_tips: any[];
    }>('/dashboard/summary');
  }

  async getMonthlyChart() {
    return this.request<{ success: boolean; monthly_data: any[] }>('/dashboard/monthly');
  }

  async getCategoryBreakdown() {
    return this.request<{ success: boolean; categories: any[] }>('/dashboard/categories');
  }

  async getWeeklySpending() {
    return this.request<{ success: boolean; weekly_data: any[] }>('/dashboard/weekly');
  }

  // --- Transactions APIs ---
  async getTransactions(params?: {
    search?: string;
    category?: string;
    type?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{
      success: boolean;
      transactions: any[];
      pagination: { total: number; page: number; limit: number; total_pages: number };
    }>(`/transactions${queryString}`);
  }

  async createTransaction(payload: {
    type: 'Income' | 'Expense';
    amount: number;
    category: string;
    description: string;
    transaction_date: string;
  }) {
    return this.request<{ success: boolean; transaction: any; message: string }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateTransaction(id: number, payload: Partial<{
    type: 'Income' | 'Expense';
    amount: number;
    category: string;
    description: string;
    transaction_date: string;
  }>) {
    return this.request<{ success: boolean; transaction: any; message: string }>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteTransaction(id: number) {
    return this.request<{ success: boolean; message: string }>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Budgets APIs ---
  async getBudgets(month?: number, year?: number) {
    const query = new URLSearchParams();
    if (month) query.append('month', String(month));
    if (year) query.append('year', String(year));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; budgets: any[]; summary: any }>(`/budgets${queryString}`);
  }

  async setBudget(payload: { category: string; amount: number; month?: number; year?: number }) {
    return this.request<{ success: boolean; budget: any; message: string }>('/budgets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateBudget(id: number, payload: { amount?: number; category?: string }) {
    return this.request<{ success: boolean; budget: any; message: string }>(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  async deleteBudget(id: number) {
    return this.request<{ success: boolean; message: string }>(`/budgets/${id}`, {
      method: 'DELETE',
    });
  }

  // --- AI Insights APIs ---
  async getAIInsights() {
    return this.request<{ success: boolean; insights: any }>('/ai/insights');
  }

  async getExpensePrediction() {
    return this.request<{ success: boolean; prediction: any }>('/ai/prediction');
  }

  async predictCategory(description: string) {
    return this.request<{
      success: boolean;
      data: {
        predicted_category: string;
        confidence: number;
        alternatives: Array<{ category: string; confidence: number }>;
        explanation: string;
      };
    }>('/ai/predict-category', {
      method: 'POST',
      body: JSON.stringify({ description }),
    });
  }

  // --- Reports APIs ---
  async getMonthlyReport(month?: number, year?: number) {
    const query = new URLSearchParams();
    if (month) query.append('month', String(month));
    if (year) query.append('year', String(year));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; report: any }>(`/reports/monthly${queryString}`);
  }

  async downloadPdfReport(month?: number, year?: number): Promise<Blob> {
    const token = this.getToken();
    const query = new URLSearchParams();
    if (month) query.append('month', String(month));
    if (year) query.append('year', String(year));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    
    const response = await fetch(`${API_BASE_URL}/reports/export-pdf${queryString}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF report');
    }

    return await response.blob();
  }

  async sendEmailReport(month?: number, year?: number) {
    const query = new URLSearchParams();
    if (month) query.append('month', String(month));
    if (year) query.append('year', String(year));
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return this.request<{ success: boolean; message: string; simulated?: boolean }>(`/reports/send-email${queryString}`, {
      method: 'POST',
    });
  }

  // --- Demo Seeding APIs ---
  async seedDemoAccount() {
    return this.request<{ success: boolean; message: string; data: any }>('/seed/demo-account', {
      method: 'POST',
    });
  }

  async seedMyAccount() {
    return this.request<{ success: boolean; message: string; data: any }>('/seed/my-account', {
      method: 'POST',
    });
  }
}

export const api = new ApiService();
export default api;
