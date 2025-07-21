// API client for communicating with UpCloud VM backend
import { Saunalautta, SaunaEquipment } from '../types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.tampereensaunalautat.fi';

// Add logging for environment debugging
if (typeof window !== 'undefined') {
  console.log('🌍 Frontend Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    API_BASE,
    hostname: window.location.hostname,
  });
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
  // Use the same API_BASE as all other functions for consistency
  // This ensures uploads and displays use the same backend
  const imageUrl = `${API_BASE}/images/${filename}`;

  // Add debug logging to track URL construction
  console.log('🖼️ Image URL constructed:', {
    filename,
    API_BASE,
    imageUrl,
    environment: process.env.NODE_ENV,
  });

  return imageUrl;
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
          equipment: Array.isArray(sauna.equipment)
            ? sauna.equipment
            : JSON.parse(sauna.equipment || '[]'),
        };
      }

      throw new Error(result.message || 'Failed to update sauna');
    } catch (error) {
      console.error('Error updating sauna:', error);
      throw error;
    }
  },

  // Get all saunas including hidden ones (admin only)
  async getAllSaunas(): Promise<Saunalautta[]> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/saunas`, {
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

      throw new Error(data.message || 'Failed to fetch admin saunas');
    } catch (error) {
      console.error('Error fetching admin saunas:', error);
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

  // Approve pending sauna registration (admin only)
  async approvePendingSauna(
    id: string
  ): Promise<{ saunaId: string; urlName: string }> {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/pending/${id}/approve`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          saunaId: data.saunaId,
          urlName: data.urlName,
        };
      }

      throw new Error(data.message || 'Failed to approve sauna registration');
    } catch (error) {
      console.error('Error approving sauna registration:', error);
      throw error;
    }
  },

  // Reject pending sauna registration (admin only)
  async rejectPendingSauna(id: string, reason?: string): Promise<void> {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/pending/${id}/reject`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({ reason }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to reject sauna registration');
      }
    } catch (error) {
      console.error('Error rejecting sauna registration:', error);
      throw error;
    }
  },

  // Create new sauna (admin only)
  async createSauna(
    saunaData: any
  ): Promise<{ saunaId: string; urlName: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/sauna`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(saunaData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          saunaId: data.saunaId,
          urlName: data.urlName,
        };
      }

      throw new Error(data.message || 'Failed to create sauna');
    } catch (error) {
      console.error('Error creating sauna:', error);
      throw error;
    }
  },

  // Toggle sauna visibility (admin only)
  async toggleSaunaVisibility(id: string, visible: boolean): Promise<string> {
    try {
      const response = await fetch(
        `${API_BASE}/api/admin/sauna/${id}/visibility`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ visible }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.message;
      }

      throw new Error(data.message || 'Failed to toggle sauna visibility');
    } catch (error) {
      console.error('Error toggling sauna visibility:', error);
      throw error;
    }
  },

  // Delete sauna (admin only)
  async deleteSauna(id: string): Promise<string> {
    try {
      const response = await fetch(`${API_BASE}/api/admin/sauna/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.message;
      }

      throw new Error(data.message || 'Failed to delete sauna');
    } catch (error) {
      console.error('Error deleting sauna:', error);
      throw error;
    }
  },

  // Image management functions

  // Upload images for a sauna
  async uploadImages(saunaId: string, files: File[]): Promise<string[]> {
    try {
      console.log('🔧 API: Creating FormData for', files.length, 'files');
      console.log('🌍 Upload using API_BASE:', API_BASE);
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(
          `📎 Adding file ${index + 1}: ${file.name} (${file.size} bytes)`
        );
        formData.append('images', file);
      });

      const authToken =
        typeof window !== 'undefined'
          ? localStorage.getItem('authToken')
          : null;

      console.log('🔑 Auth token available:', !!authToken);

      const url = `${API_BASE}/api/sauna/${saunaId}/images/upload`;
      console.log('📡 Making POST request to:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(authToken && { Authorization: `Bearer ${authToken}` }),
        },
        body: formData,
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('📊 Response data:', data);

      if (data.success) {
        console.log(
          '✅ API: Upload successful, returning images:',
          data.images
        );
        // Show what URLs will be generated for these images
        const imageUrls = data.images.map((filename: string) =>
          getImageUrl(filename)
        );
        console.log('🔗 Image URLs that will be generated:', imageUrls);

        return data.images;
      }

      throw new Error(data.message || 'Failed to upload images');
    } catch (error) {
      console.error('❌ API: Error uploading images:', error);
      throw error;
    }
  },

  // Delete an image from a sauna
  async deleteImage(
    saunaId: string,
    filename: string
  ): Promise<{ deletedImage: string; newMainImage: string | null }> {
    try {
      const response = await fetch(
        `${API_BASE}/api/sauna/${saunaId}/images/${filename}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          deletedImage: data.deletedImage,
          newMainImage: data.newMainImage,
        };
      }

      throw new Error(data.message || 'Failed to delete image');
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  },

  // Reorder images for a sauna
  async reorderImages(saunaId: string, images: string[]): Promise<string[]> {
    try {
      const response = await fetch(
        `${API_BASE}/api/sauna/${saunaId}/images/reorder`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ images }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.images;
      }

      throw new Error(data.message || 'Failed to reorder images');
    } catch (error) {
      console.error('Error reordering images:', error);
      throw error;
    }
  },

  // Set main image for a sauna
  async setMainImage(saunaId: string, mainImage: string): Promise<string> {
    try {
      const response = await fetch(
        `${API_BASE}/api/sauna/${saunaId}/images/main`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify({ mainImage }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.mainImage;
      }

      throw new Error(data.message || 'Failed to set main image');
    } catch (error) {
      console.error('Error setting main image:', error);
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
  equipment: SaunaEquipment[];
  email: string;
  phone: string;
  url?: string;
  url_array?: string[];
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
