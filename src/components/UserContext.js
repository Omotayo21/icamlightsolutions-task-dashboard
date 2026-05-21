'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext({
  user: null,
  login: () => {},
  logout: () => {},
  loading: true
});

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('icam_user');
      if (storedUser) {
        setUser(storedUser);
      }
    } catch (e) {
      console.error('Failed to read from localStorage', e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (name) => {
    setUser(name);
    try {
      localStorage.setItem('icam_user', name);
    } catch (e) {
      console.error('Failed to write to localStorage', e);
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('icam_user');
    } catch (e) {
      console.error('Failed to remove from localStorage', e);
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
