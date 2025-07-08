// API client for communicating with UpCloud VM backend
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.tampereensaunalautat.fi';

export interface Saunalautta {
  id: string;
  name: string;
  location: string;
  capacity: number;
  pricemin: number;
  pricemax: number;
  equipment: string[];
  images: string[];
  mainImage: string;
  email: string;
  phone: string;
  url: string;
  notes?: string;
  url_name: string;
  eventLength: number;
  urlArray: string[];
  winter: boolean;
}

// Fetch all saunas from the API
export const fetchSaunas = async (): Promise<Saunalautta[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/sauna/list`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Transform backend format to frontend format
    return data.map((sauna: any) => ({
      ...sauna,
      pricemin: sauna.price_min,
      pricemax: sauna.price_max,
      eventLength: sauna.event_length,
      mainImage: sauna.main_image,
      urlArray: sauna.urlArray || [],
    }));
  } catch (error) {
    console.error('Error fetching saunas:', error);
    throw error;
  }
};

// Get image URL for a sauna image
export const getImageUrl = (filename: string): string => {
  return `${API_BASE}/images/${filename}`;
};

// Health check endpoint
export const healthCheck = async (): Promise<{
  status: string;
  timestamp: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/api/health`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const authToken =
    typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
  };
};

// Authentication API functions
export const authAPI = {
  // Get current user's saunas
  async getUserSaunas(): Promise<Saunalautta[]> {
    try {
      const response = await fetch(`${API_BASE}/api/user/saunas`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Transform backend format to frontend format
        return data.saunas.map((sauna: any) => ({
          ...sauna,
          pricemin: sauna.price_min,
          pricemax: sauna.price_max,
          eventLength: sauna.event_length,
          mainImage: sauna.main_image,
          urlArray: sauna.urlArray || [],
          equipment: Array.isArray(sauna.equipment)
            ? sauna.equipment
            : JSON.parse(sauna.equipment || '[]'),
        }));
      }

      throw new Error(data.message || 'Failed to fetch user saunas');
    } catch (error) {
      console.error('Error fetching user saunas:', error);
      throw error;
    }
  },

  // Update sauna information
  async updateSauna(
    saunaId: string,
    data: Partial<SaunaUpdateData>
  ): Promise<Saunalautta> {
    try {
      const response = await fetch(`${API_BASE}/api/sauna/${saunaId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        // Transform backend format to frontend format
        const sauna = result.sauna;
        return {
          ...sauna,
          pricemin: sauna.price_min,
          pricemax: sauna.price_max,
          eventLength: sauna.event_length,
          mainImage: sauna.main_image,
          urlArray: sauna.urlArray || [],
        };
      }

      throw new Error(result.message || 'Failed to update sauna');
    } catch (error) {
      console.error('Error updating sauna:', error);
      throw error;
    }
  },

  // Get all users (admin only)
  async getAllUsers(): Promise<UserWithStats[]> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.users;
      }

      throw new Error(data.message || 'Failed to fetch users');
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Get pending sauna registrations (admin only)
  async getPendingSaunas(): Promise<PendingSauna[]> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/pending-saunas`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.pendingSaunas;
      }

      throw new Error(data.message || 'Failed to fetch pending saunas');
    } catch (error) {
      console.error('Error fetching pending saunas:', error);
      throw error;
    }
  },
};

// Types for API functions
export interface SaunaUpdateData {
  name: string;
  location: string;
  capacity: number;
  event_length: number;
  price_min: number;
  price_max: number;
  equipment: string[];
  email: string;
  phone: string;
  url?: string;
  notes?: string;
  winter: boolean;
}

export interface UserWithStats {
  id: string;
  email: string;
  name: string;
  is_admin: boolean;
  status: string;
  created_at: string;
  sauna_count: number;
}

export interface PendingSauna {
  id: string;
  owner_email: string;
  name: string;
  location: string;
  capacity: number;
  event_length: number;
  price_min: number;
  price_max: number;
  equipment: string;
  email: string;
  phone: string;
  url?: string;
  notes?: string;
  winter: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}
