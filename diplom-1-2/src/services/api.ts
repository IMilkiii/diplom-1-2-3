const API_BASE_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000') + '/api';

// Типы для API
export interface User {
  id: number;
  email: string;
  name?: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

// Класс для работы с API
class ApiService {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Универсальный метод для запросов
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Важно для cookies
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Авторизация
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  // Проекты
  async getProjects(): Promise<{ projects: any[] }> {
    return this.request<{ projects: any[] }>('/projects');
  }

  // Получить проект по ID
  async getProject(id: number): Promise<{ project: any }> {
    return this.request<{ project: any }>(`/projects/${id}`);
  }

  // Получить все публичные проекты (для главной страницы)
  async getAllProjects(params?: { q?: string; sort?: 'created_at' | 'updated_at' | 'name' | 'author'; order?: 'asc' | 'desc' }): Promise<{ projects: any[] }> {
    const queryParams = new URLSearchParams();
    if (params?.q) queryParams.set('q', params.q);
    if (params?.sort) queryParams.set('sort', params.sort);
    if (params?.order) queryParams.set('order', params.order);
    const qs = queryParams.toString();
    const endpoint = `/projects/public${qs ? `?${qs}` : ''}`;
    return this.request<{ projects: any[] }>(endpoint);
  }

  async createProject(data: { name: string; description?: string; is_public?: boolean }): Promise<any> {
    return this.request<any>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: number, data: { name?: string; description?: string; is_public?: boolean; status?: string }): Promise<any> {
    return this.request<any>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // Загрузка файлов
  async uploadProjectImages(projectId: number, files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return this.request<any>(`/upload/project/${projectId}`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async uploadAvatar(file: File): Promise<{ message: string; avatarPath: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.request<{ message: string; avatarPath: string }>(`/upload/avatar`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  async generatePreview(file: File): Promise<{ message: string; previewUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);
    return this.request<{ message: string; previewUrl: string }>(`/upload/preview`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; version: string }> {
    return this.request<{ status: string; timestamp: string; version: string }>('/health');
  }

  // Профиль
  async updateProfile(data: { name?: string | null }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Построение абсолютной ссылки для файлов из /uploads
  getFileUrl(path: string | null | undefined): string {
    if (!path) return '';
    const base = this.baseURL.replace(/\/api$/, '');
    const normalized = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalized}`;
  }
}

// Экспортируем единственный экземпляр
export const apiService = new ApiService();
export default apiService;
