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
