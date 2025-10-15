import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const LanguageContext = createContext({ language: 'en', setLanguage: () => {} });

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const { token } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem('dg_lang');
    if (saved) setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem('dg_lang', language);
    // Sync with backend if user is logged in
    if (token) {
      api.updatePrefs(token, { language }).catch(console.error);
    }
  }, [language, token]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}