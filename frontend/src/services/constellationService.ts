const API_URL = "http://localhost:3000/api";

export interface Constellation {
  _id: string;
  name: string;
  abbreviation: string;
  hemisphere: "Northern" | "Southern" | "Both";
  rightAscension: string;
  declination: string;
  quadrant: string;
  area: number;
  mainStars: number;
  brightestStar: string;
  mythology?: string;
  visibility?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConstellationsResponse {
  status: string;
  data: {
    constellations: Constellation[];
  };
}
export const constellationService = {
  getAllConstellations: async (
    token: string
  ): Promise<ConstellationsResponse> => {
    const response = await fetch(`${API_URL}/constellations/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch constellations");
    }
    return response.json();
  },

  getConstellation: async (
    token: string,
    id: string
  ): Promise<{ constellation: Constellation }> => {
    const response = await fetch(`${API_URL}/constellations/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch constellation");
    }

    return response.json();
  },
};
