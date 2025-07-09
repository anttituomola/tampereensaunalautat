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

      // Check if response is ok (2xx status)
      if (!response.ok) {
        // 401/403 means refresh token is invalid
        if (response.status === 401 || response.status === 403) {
          console.log('Refresh token is invalid or expired');
          return false;
        }
        // Other errors (5xx, network issues) should be treated as temporary
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.authToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Re-throw to let caller handle appropriately
      throw error;
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

      // Check if response is ok (2xx status)
      if (!response.ok) {
        // 401/403 means token is invalid
        if (response.status === 401 || response.status === 403) {
          console.log('Token is invalid or expired');
          return null;
        }
        // Other errors (5xx, network issues) should be treated as temporary
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Re-throw to let caller handle appropriately
      throw error;
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
      const refreshToken = localStorage.getItem('refreshToken');

      if (storedUser && authToken) {
        const parsedUser = JSON.parse(storedUser);
        const userWithAlias = { ...parsedUser, isAdmin: parsedUser.is_admin };

        // Set user immediately (optimistic authentication)
        setUser(userWithAlias);

        // Try to verify token is still valid in background
        try {
          const currentUser = await authAPI.getCurrentUser();
          if (currentUser) {
            // Token is valid, update with fresh user data
            const userWithAlias = {
              ...currentUser,
              isAdmin: currentUser.is_admin,
            };
            setUser(userWithAlias);
            localStorage.setItem('user', JSON.stringify(userWithAlias));
          }
        } catch (error) {
          // getCurrentUser threw an error
          console.warn('Token verification failed:', error);

          // If it's a network/server error, try to refresh token
          // If getCurrentUser returned null (meaning 401/403), try to refresh
          try {
            const refreshed = await authAPI.refreshToken();
            if (refreshed) {
              // Get user info with new token
              try {
                const refreshedUser = await authAPI.getCurrentUser();
                if (refreshedUser) {
                  const userWithAlias = {
                    ...refreshedUser,
                    isAdmin: refreshedUser.is_admin,
                  };
                  setUser(userWithAlias);
                  localStorage.setItem('user', JSON.stringify(userWithAlias));
                }
              } catch (userError) {
                // Even if we can't get user info, we refreshed successfully
                console.warn(
                  'Token refreshed but could not get user info:',
                  userError
                );
              }
            } else {
              // Refresh failed, logout
              console.log('Token refresh failed, logging out');
              handleLogout();
            }
          } catch (refreshError) {
            // If refresh failed due to network issues, keep user logged in
            // but log the error for debugging
            console.warn(
              'Failed to refresh token on initialization, keeping user logged in:',
              refreshError
            );

            // Check if it's an authentication error (401/403)
            if (
              refreshError instanceof Error &&
              (refreshError.message.includes('401') ||
                refreshError.message.includes('403'))
            ) {
              console.log('Refresh token is invalid, logging out');
              handleLogout();
            } else if (!refreshToken) {
              console.log('No refresh token available, logging out');
              handleLogout();
            }
          }
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      // Only logout if we can't parse stored data (corruption)
      if (error instanceof SyntaxError) {
        console.log('Corrupted stored auth data, logging out');
        handleLogout();
      }
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
        // Refresh token is invalid, logout
        handleLogout();
      }
      return success;
    } catch (error) {
      console.error('Refresh token error:', error);
      // Check if it's a network error or authentication error
      if (
        error instanceof Error &&
        (error.message.includes('401') || error.message.includes('403'))
      ) {
        // Authentication error - refresh token is invalid
        handleLogout();
      } else {
        // Network error - don't logout, just log the error
        console.warn(
          'Network error during token refresh, keeping user logged in'
        );
      }
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
