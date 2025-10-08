"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

// Typ för användardata
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLoginAt?: string;
}

// Typ för autentiseringskontext
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

// Skapa autentiseringskontext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook för att använda autentisering
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
}

// AuthProvider komponent
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Kontrollera autentisering vid första laddningen
  useEffect(() => {
    checkAuth();
  }, []);

  // Funktion för att kontrollera om användaren är autentiserad
  const checkAuth = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include', // Inkludera cookies
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Fel vid kontroll av autentisering:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Registrera ny användare
  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Registrering misslyckades');
      }
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Ett oväntat fel uppstod vid registrering');
    } finally {
      setLoading(false);
    }
  };

  // Logga in användare
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        throw new Error(data.error || 'Inloggning misslyckades');
      }
    } catch (error) {
      setLoading(false);
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Ett oväntat fel uppstod vid inloggning');
    } finally {
      setLoading(false);
    }
  };

  // Logga ut användare
  const logout = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      // Sätt användare till null oavsett response (för säkerhet)
      setUser(null);

      if (!response.ok) {
        console.warn('Varning vid utloggning:', await response.text());
      }
    } catch (error) {
      console.error('Fel vid utloggning:', error);
      // Sätt användare till null ändå
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook för att kontrollera om användaren är inloggad
export function useAuthRequired() {
  const { user, loading } = useAuth();
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect till login eller visa error
      window.location.href = '/login';
    }
  }, [user, loading]);

  return { user, loading, isAuthenticated: !!user };
}