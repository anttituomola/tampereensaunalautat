export interface Saunalautta {
  id: string;
  name: string;
  location: string;
  capacity: number;
  pricemin: number;
  pricemax: number;
  equipment: SaunaEquipment[];
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

export type SaunaEquipment =
  | 'Kattoterassi'
  | 'Palju'
  | 'Äänentoisto'
  | 'Kahvinkeitin'
  | 'TV'
  | 'WC'
  | 'Suihku'
  | 'Grilli'
  | 'Kylmäsäilytys'
  | 'Pukuhuone'
  | 'Puulämmitteinen kiuas'
  | 'Jääkaappi'
  | 'Kaasugrilli'
  | 'Poreallas'
  | 'Jääpalakone'
  | 'Takka'
  | 'Ilmastointi'
  | 'Mikroaaltouuni'
  | 'Astiasto';

export interface EquipmentFilter {
  name: SaunaEquipment;
  checked: boolean;
}

export interface FilterState {
  location: string;
  capacity: number;
  sort: string;
  equipment: EquipmentFilter[];
  winter: boolean;
}

// Authentication Types
export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  isAdmin: boolean; // Frontend convenience alias
}

export interface UserWithSaunas extends User {
  saunas: Saunalautta[];
}

export interface MagicLink {
  token: string;
  email: string;
  expires_at: string;
  used: boolean;
}

export interface AuthToken {
  token: string;
  user: User;
  expires_at: string;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  message: string;
  success: boolean;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  success: boolean;
  user?: User;
  authToken?: string;
  refreshToken?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<LoginResponse>;
  verifyToken: (token: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
}

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
