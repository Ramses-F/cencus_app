// Configuration de l'API Backend
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    
    // Census
    CENSUS: '/api/census',
    CENSUS_STATS: '/api/census/stats',
    CENSUS_IMPORT: '/api/census/import',
  },
};

// Configuration des headers par défaut
export const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Ajouter le token d'authentification si disponible
  if (typeof window !== 'undefined') {
    const user = sessionStorage.getItem('census_user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.token) {
        headers['Authorization'] = `Bearer ${userData.token}`;
      }
    }
  }
  
  return headers;
};

// Types de réponse API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  count: number;
  total: number;
  page: number;
  pages: number;
}
