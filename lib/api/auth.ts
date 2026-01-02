import { API_CONFIG, getHeaders, ApiResponse } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  email: string;
  token: string;
}

/**
 * Connexion d'un utilisateur
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la connexion');
    }

    // Sauvegarder les données utilisateur dans sessionStorage
    if (data.success && data.data) {
      sessionStorage.setItem('census_user', JSON.stringify({
        email: data.data.email,
        token: data.data.token,
        name: data.data.email.split('@')[0],
      }));
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de connexion:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};

/**
 * Inscription d'un nouvel utilisateur
 */
export const register = async (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'inscription');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur d\'inscription:', error);
    return {
      success: false,
      message: error.message || 'Erreur d\'inscription au serveur',
    };
  }
};

/**
 * Déconnexion de l'utilisateur
 */
export const logout = () => {
  sessionStorage.removeItem('census_user');
  localStorage.removeItem('census_form_draft');
};

/**
 * Vérifier si l'utilisateur est connecté
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  const user = sessionStorage.getItem('census_user');
  return !!user;
};

/**
 * Obtenir les informations de l'utilisateur connecté
 */
export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  const user = sessionStorage.getItem('census_user');
  return user ? JSON.parse(user) : null;
};
