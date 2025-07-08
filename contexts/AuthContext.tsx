import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import {
  AuthContextType,
  User,
  LoginResponse,
  VerifyTokenResponse,
} from '../types';

// Authentication API functions
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.tampereensaunalautat.fi';

interface AuthAPI {
  login: (email: string) => Promise<LoginResponse>;
  verifyToken: (token: string) => Promise<VerifyTokenResponse>;
  refreshToken: () => Promise<boolean>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
}

const authAPI: AuthAPI = {
  async login(email: string): Promise<LoginResponse> {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  },

  async verifyToken(token: string): Promise<VerifyTokenResponse> {
    const response = await fetch(`${API_BASE}/api/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();
    return data;
  },

  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE}/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.authToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        console.error('Error during logout:', error);
      }
    }

    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  async getCurrentUser(): Promise<User | null> {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) return null;

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Try to get user from localStorage first
      const storedUser = localStorage.getItem('user');
      const authToken = localStorage.getItem('authToken');

      if (storedUser && authToken) {
        const parsedUser = JSON.parse(storedUser);
        const userWithAlias = { ...parsedUser, isAdmin: parsedUser.is_admin };
        setUser(userWithAlias);

        // Verify token is still valid
        const currentUser = await authAPI.getCurrentUser();
        if (currentUser) {
          const userWithAlias = {
            ...currentUser,
            isAdmin: currentUser.is_admin,
          };
          setUser(userWithAlias);
          localStorage.setItem('user', JSON.stringify(userWithAlias));
        } else {
          // Token invalid, try to refresh
          const refreshed = await authAPI.refreshToken();
          if (!refreshed) {
            // Refresh failed, clear auth state
            handleLogout();
          } else {
            // Get user info with new token
            const refreshedUser = await authAPI.getCurrentUser();
            if (refreshedUser) {
              const userWithAlias = {
                ...refreshedUser,
                isAdmin: refreshedUser.is_admin,
              };
              setUser(userWithAlias);
              localStorage.setItem('user', JSON.stringify(userWithAlias));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string): Promise<LoginResponse> => {
    try {
      const response = await authAPI.login(email);
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const verifyToken = async (token: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.verifyToken(token);

      if (response.success && response.user && response.authToken) {
        // Store authentication data
        localStorage.setItem('authToken', response.authToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.user));

        // Update state - add isAdmin alias for frontend convenience
        const userWithAlias = {
          ...response.user,
          isAdmin: response.user.is_admin,
        };
        setUser(userWithAlias);

        toast.success('Kirjautuminen onnistui!');
        return true;
      } else {
        toast.error(response.message || 'Kirjautuminen epäonnistui');
        return false;
      }
    } catch (error) {
      console.error('Token verification error:', error);
      toast.error('Virhe kirjautumisessa');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await authAPI.logout();
      setUser(null);
      toast.success('Kirjauduttu ulos onnistuneesti');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Virhe uloskirjautumisessa');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authAPI.refreshToken();
      if (!success) {
        handleLogout();
      }
      return success;
    } catch (error) {
      console.error('Refresh token error:', error);
      handleLogout();
      return false;
    }
  };

  // Auto-refresh token periodically
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await refreshToken();
    }, 20 * 60 * 1000); // Refresh every 20 minutes

    return () => clearInterval(interval);
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    verifyToken,
    logout: handleLogout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
