const API_URL = "http://localhost:3000/api";

// ✅ UPDATED - Added numeric id field
export interface Constellation {
  _id: string;              // MongoDB ObjectId
  id: number;               // ✅ Constellation ID (1-88) - MUST HAVE THIS
  name: string;
  latinName?: string;
  abbreviation: string;
  description?: string;
  mythology?: string;
  rightAscension?: string;
  declination?: string;
  area?: number;
  brightestStar?: string;
  visibility?: string;
  hemisphere?: string;
  season?: "Spring" | "Summer" | "Fall" | "Winter" | "Year-round";
  imageUrl?: string;
  numberOfStars?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ConstellationResponse {
  status: string;
  data: {
    constellations: Constellation[];
  };
}

interface SingleConstellationResponse {
  status: string;
  data: {
    constellation: Constellation;
  };
}

export const constellationService = {
  /**
   * Get all constellations
   */
  getAllConstellations: async (
    token: string,
    params?: {
      season?: string;
      hemisphere?: string;
      visibility?: string;
      searchQuery?: string;
    }
  ): Promise<ConstellationResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.season) {
      queryParams.append("season", params.season);
    }
    if (params?.hemisphere) {
      queryParams.append("hemisphere", params.hemisphere);
    }
    if (params?.visibility) {
      queryParams.append("visibility", params.visibility);
    }
    if (params?.searchQuery) {
      queryParams.append("search", params.searchQuery);
    }

    const queryString = queryParams.toString();
    const url = `${API_URL}/constellations${
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
      throw new Error(error.error || "Failed to fetch constellations");
    }

    return response.json();
  },

  /**
   * Get a single constellation by MongoDB _id
   */
  getConstellation: async (
    token: string,
    id: string
  ): Promise<SingleConstellationResponse> => {
    const response = await fetch(`${API_URL}/constellations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch constellation");
    }

    return response.json();
  },

  /**
   * Get a constellation by numeric ID (1-88)
   */
  getConstellationByNumericId: async (
    token: string,
    numericId: number
  ): Promise<SingleConstellationResponse> => {
    const response = await fetch(
      `${API_URL}/constellations/numeric/${numericId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to fetch constellation");
    }

    return response.json();
  },

  /**
   * Search constellations by name
   */
  searchConstellations: async (
    token: string,
    searchQuery: string
  ): Promise<ConstellationResponse> => {
    const response = await fetch(
      `${API_URL}/constellations/search?q=${encodeURIComponent(searchQuery)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Failed to search constellations");
    }

    return response.json();
  },
};

export default constellationService;