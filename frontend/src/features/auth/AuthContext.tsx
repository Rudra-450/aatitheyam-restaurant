import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchCurrentOwner, loginOwner, logoutOwner } from '../../services/api';
import { Owner } from '../../types';

interface AuthContextType {
  owner: Owner | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username_or_email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [owner, setOwner] = useState<Owner | null>(() => {
    const saved = localStorage.getItem('owner');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifyAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const currentOwner = await fetchCurrentOwner();
          setOwner(currentOwner);
          localStorage.setItem('owner', JSON.stringify(currentOwner));
        } catch {
          // Token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('owner');
          setOwner(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (username_or_email: string, password: string) => {
    const res = await loginOwner({ username_or_email, password });
    setToken(res.access_token);
    setOwner(res.owner);
    localStorage.setItem('token', res.access_token);
    localStorage.setItem('owner', JSON.stringify(res.owner));
  };

  const logout = async () => {
    try {
      await logoutOwner();
    } catch {
      // Ignore network errors on logout
    } finally {
      setToken(null);
      setOwner(null);
      localStorage.removeItem('token');
      localStorage.removeItem('owner');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        owner,
        token,
        isAuthenticated: !!owner && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
