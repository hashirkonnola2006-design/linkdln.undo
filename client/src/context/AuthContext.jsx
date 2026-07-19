import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config.js';

const API = import.meta.env.VITE_API_URL || API_BASE_URL;

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        setLoading(false);
        return;
      }
    } catch (_) {
      // Backend server unreachable (e.g. standalone Vercel preview)
    }

    // Fallback: check local storage session
    const localUser = localStorage.getItem('session_user');
    if (localUser) {
      try {
        setUser(JSON.parse(localUser));
      } catch (_) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (name) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('session_user', JSON.stringify(data));
        return data;
      }
    } catch (_) {
      console.warn('Backend server unreachable, falling back to local session mode.');
    }

    // Fallback local session creation when backend API is unreachable
    const fallbackUser = {
      _id: 'user_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: '',
      bio: '',
      role: '',
      company: '',
      location: '',
      avatar: `https://api.dicebear.com/7.x/open-peeps/svg?seed=${encodeURIComponent(name.trim())}`,
      createdAt: new Date().toISOString()
    };
    setUser(fallbackUser);
    localStorage.setItem('session_user', JSON.stringify(fallbackUser));
    return fallbackUser;
  };

  const logout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (_) {}
    localStorage.removeItem('session_user');
    setUser(null);
  };

  const updateProfile = async (fields) => {
    try {
      const res = await fetch(`${API}/api/auth/me`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        localStorage.setItem('session_user', JSON.stringify(data));
        return data;
      }
    } catch (_) {
      console.warn('Backend server unreachable, updating local session.');
    }

    // Fallback profile update
    const updatedUser = { ...user, ...fields };
    setUser(updatedUser);
    localStorage.setItem('session_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, checkSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

export default AuthContext;
