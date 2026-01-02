import { API_CONFIG, getHeaders, ApiResponse, PaginatedResponse } from './config';

export interface CensusRecord {
  _id?: string;
  lotNumber: string;
  familyName: string;
  responsibleName: string;
  contact: string;
  inhabitants: number;
  children: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CensusStats {
  totalRecords: number;
  totalHouseholds: number;
  totalInhabitants: number;
  totalChildren: number;
  totalAdults: number;
  averageHouseholdSize: string;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  familyName?: string;
  lotNumber?: string;
}

/**
 * Créer un nouvel enregistrement de recensement
 */
export const createRecord = async (record: CensusRecord): Promise<ApiResponse<CensusRecord>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(record),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la création');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de création:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};

/**
 * Récupérer tous les enregistrements avec pagination
 */
export const getAllRecords = async (params?: QueryParams): Promise<PaginatedResponse<CensusRecord>> => {
  try {
    const queryString = new URLSearchParams();
    if (params?.page) queryString.append('page', params.page.toString());
    if (params?.limit) queryString.append('limit', params.limit.toString());
    if (params?.familyName) queryString.append('familyName', params.familyName);
    if (params?.lotNumber) queryString.append('lotNumber', params.lotNumber);

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS}?${queryString.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de récupération:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
      count: 0,
      total: 0,
      page: 1,
      pages: 0,
    };
  }
};

/**
 * Récupérer un enregistrement par ID
 */
export const getRecordById = async (id: string): Promise<ApiResponse<CensusRecord>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS}/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de récupération:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};

/**
 * Mettre à jour un enregistrement
 */
export const updateRecord = async (id: string, record: Partial<CensusRecord>): Promise<ApiResponse<CensusRecord>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS}/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(record),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la mise à jour');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de mise à jour:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};

/**
 * Supprimer un enregistrement
 */
export const deleteRecord = async (id: string): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la suppression');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de suppression:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};

/**
 * Obtenir les statistiques
 */
export const getStats = async (): Promise<ApiResponse<CensusStats>> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS_STATS}`, {
      method: 'GET',
      headers: getHeaders(),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de la récupération des statistiques');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur de statistiques:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};

/**
 * Importer plusieurs enregistrements
 */
export const importRecords = async (records: CensusRecord[]): Promise<ApiResponse> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CENSUS_IMPORT}`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ records }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Erreur lors de l\'import');
    }

    return data;
  } catch (error: any) {
    console.error('Erreur d\'import:', error);
    return {
      success: false,
      message: error.message || 'Erreur de connexion au serveur',
    };
  }
};
