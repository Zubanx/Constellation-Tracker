const API_URL = "http://localhost:3000/api";

// ✅ UPDATED - constellationId is now a number (1-88)
export interface Observation {
  _id: string;
  userId: string;
  constellationId: number;  // ✅ Changed from object to number (1-88)
  photoUrl: string; // Required in backend
  cloudinaryPublicId?: string;
  location: string; // Simple string like "Orlando, FL"
  notes?: string;
  observationDate: string;
  createdAt: string;
  updatedAt: string;
}

// Internal response format (what backend actually returns)
interface BackendObservationsResponse {
  observations: Observation[];
}

interface BackendAddObservationResponse {
  observation: Observation;
  firstTime: boolean;
}

interface BackendSingleObservationResponse {
  observation: Observation;
}

interface BackendDeleteObservationResponse {
  message: string;
}

// Public response format (consistent with constellation service)
export interface ObservationsResponse {
  status: string;
  data: {
    observations: Observation[];
  };
}

export interface AddObservationResponse {
  status: string;
  data: {
    observation: Observation;
    firstTime: boolean;
  };
}

export interface SingleObservationResponse {
  status: string;
  data: {
    observation: Observation;
  };
}

export interface DeleteObservationResponse {
  status: string;
  data: {
    message: string;
  };
}

export const observationService = {
  /**
   * Get all observations for the logged-in user
   */
  getAllObservations: async (
    token: string,
    params?: {
      constellationId?: number;  // ✅ Changed from string to number
      sortBy?: string;
      order?: "asc" | "desc";
    }
  ): Promise<ObservationsResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.constellationId) {
      queryParams.append("constellationId", params.constellationId.toString());  // ✅ Convert to string for URL
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }
    if (params?.order) {
      queryParams.append("order", params.order);
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/observations${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch observations");
    }

    const data: BackendObservationsResponse = await response.json();
    
    // Transform to consistent format
    return {
      status: 'success',
      data: {
        observations: data.observations
      }
    };
  },

  /**
   * Get a single observation by ID
   */
  getObservation: async (
    token: string,
    id: string
  ): Promise<SingleObservationResponse> => {
    const response = await fetch(`${API_URL}/observations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch observation");
    }

    const data: BackendSingleObservationResponse = await response.json();
    
    // Transform to consistent format
    return {
      status: 'success',
      data: {
        observation: data.observation
      }
    };
  },

  /**
   * Add a new observation
   */
  addObservation: async (
    token: string,
    data: {
      constellationId: number;  // ✅ Changed from string to number
      photoUrl: string; 
      cloudinaryPublicId?: string;
      location: string; 
      notes?: string;
      observationDate?: string;
    }
  ): Promise<AddObservationResponse> => {
    console.log('🔵 observationService sending:', data);
    
    const response = await fetch(`${API_URL}/observations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to add observation");
    }

    const backendData: BackendAddObservationResponse = await response.json();
    
    // Transform to consistent format
    return {
      status: 'success',
      data: {
        observation: backendData.observation,
        firstTime: backendData.firstTime
      }
    };
  },

  /**
   * Update an existing observation
   */
  updateObservation: async (
    token: string,
    id: string,
    data: {
      notes?: string;
      location?: string; // Simple string like "Orlando, FL"
    }
  ): Promise<SingleObservationResponse> => {
    const response = await fetch(`${API_URL}/observations/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to update observation");
    }

    const backendData: BackendSingleObservationResponse = await response.json();
    
    // Transform to consistent format
    return {
      status: 'success',
      data: {
        observation: backendData.observation
      }
    };
  },

  /**
   * Delete an observation
   */
  deleteObservation: async (
    token: string,
    id: string
  ): Promise<DeleteObservationResponse> => {
    const response = await fetch(`${API_URL}/observations/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to delete observation");
    }

    const backendData: BackendDeleteObservationResponse = await response.json();
    
    // Transform to consistent format
    return {
      status: 'success',
      data: {
        message: backendData.message
      }
    };
  },

  /**
   * Get observations for a specific constellation
   */
  getObservationsByConstellation: async (
    token: string,
    constellationId: number  // ✅ Changed from string to number
  ): Promise<ObservationsResponse> => {
    return observationService.getAllObservations(token, {
      constellationId,
      sortBy: "observationDate",
      order: "desc",
    });
  },

  /**
   * Get recent observations (limited number)
   */
  getRecentObservations: async (
    token: string,
    limit: number = 5
  ): Promise<Observation[]> => {
    const response = await observationService.getAllObservations(
      token,
      {
        sortBy: "observationDate",
        order: "desc",
      }
    );

    return response.data.observations.slice(0, limit);
  },
};

export default observationService;