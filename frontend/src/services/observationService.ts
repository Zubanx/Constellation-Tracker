const API_URL = 'http://localhost:3000/api';

export interface Observation {
  _id: string;
  userId: string;
  constellationId: {
    _id: string;
    name: string;
    abbreviation: string;
    hemisphere?: string;
  };
  photoUrl?: string;
  cloudinaryPublicId?: string;
  location: string;
  notes?: string;
  observationDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ObservationsResponse {
  observations: Observation[];
}

export interface AddObservationResponse {
  observation: Observation;
  firstTime: boolean;
}

export interface SingleObservationResponse {
  observation: Observation;
}

export interface DeleteObservationResponse {
  message: string;
}

export const observationService = {
  /**
   * Get all observations for the logged-in user
   */
  getAllObservations: async (
    token: string,
    params?: {
      constellationId?: string;
      sortBy?: string;
      order?: 'asc' | 'desc';
    }
  ): Promise<ObservationsResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.constellationId) {
      queryParams.append('constellationId', params.constellationId);
    }
    if (params?.sortBy) {
      queryParams.append('sortBy', params.sortBy);
    }
    if (params?.order) {
      queryParams.append('order', params.order);
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/observations${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch observations');
    }

    return response.json();
  },

  /**
   * Get a single observation by ID
   */
  getObservation: async (
    token: string,
    id: string
  ): Promise<SingleObservationResponse> => {
    const response = await fetch(`${API_URL}/observations/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to fetch observation');
    }

    return response.json();
  },

  /**
   * Add a new observation
   */
  addObservation: async (
    token: string,
    data: {
      constellationId: string;
      photoUrl?: string;
      cloudinaryPublicId?: string;
      location: string;
      notes?: string;
      observationDate?: string;
    }
  ): Promise<AddObservationResponse> => {
    const response = await fetch(`${API_URL}/observations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to add observation');
    }

    return response.json();
  },

  /**
   * Update an existing observation
   */
  updateObservation: async (
    token: string,
    id: string,
    data: {
      notes?: string;
      location?: string;
    }
  ): Promise<SingleObservationResponse> => {
    const response = await fetch(`${API_URL}/observations/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to update observation');
    }

    return response.json();
  },

  /**
   * Delete an observation
   */
  deleteObservation: async (
    token: string,
    id: string
  ): Promise<DeleteObservationResponse> => {
    const response = await fetch(`${API_URL}/observations/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Failed to delete observation');
    }

    return response.json();
  },

  /**
   * Get observations for a specific constellation
   */
  getObservationsByConstellation: async (
    token: string,
    constellationId: string
  ): Promise<ObservationsResponse> => {
    return observationService.getAllObservations(token, {
      constellationId,
      sortBy: 'observationDate',
      order: 'desc',
    });
  },

  /**
   * Get recent observations (limited number)
   */
  getRecentObservations: async (
    token: string,
    limit: number = 5
  ): Promise<Observation[]> => {
    const { observations } = await observationService.getAllObservations(token, {
      sortBy: 'observationDate',
      order: 'desc',
    });
    
    return observations.slice(0, limit);
  },
};

export default observationService;