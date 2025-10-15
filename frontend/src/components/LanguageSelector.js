import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
];

function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  return (
    <label className="inline-flex items-center gap-2" aria-label="Select language">
      <span className="text-sm font-semibold">Lang</span>
      <select
        className="border rounded-lg px-2 py-1 text-sm"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      >
        {languages.map((l) => (
          <option key={l.code} value={l.code}>{l.label}</option>
        ))}
      </select>
    </label>
  );
}

export default LanguageSelector;