import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMoneyBillWave, FaBus, FaUtensils, FaChalkboardTeacher, FaGlobe, FaExternalLinkAlt } from 'react-icons/fa';
import { speak, debugTeluguVoices, forceTeluguSpeech } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { messages } from '../i18n';

const BigButton = ({ to, icon: Icon, label, color }) => (
  <Link
    to={to}
    className={`rounded-2xl p-6 flex flex-col items-center justify-center text-white text-xl font-bold shadow-lg active:scale-95 transition-transform ${color}`}
    aria-label={label}
  >
    <Icon size={48} className="mb-2" />
    <span>{label}</span>
  </Link>
);

const ExternalButton = ({ href, icon: Icon, label, color }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`rounded-2xl p-6 flex flex-col items-center justify-center text-white text-xl font-bold shadow-lg active:scale-95 transition-transform ${color}`}
    aria-label={label}
  >
    <Icon size={48} className="mb-2" />
    <span>{label}</span>
  </a>
);

function Home() {
  const { language } = useLanguage();
  useEffect(() => {
    const welcome = messages[language]?.welcome || messages.en.welcome;
    const langCode = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    
    // Debug Telugu voices if language is Telugu
    if (language === 'te') {
      console.log('Home: Telugu language detected, debugging voices...');
      debugTeluguVoices();
    }
    
    // Ensure speech happens after the first paint and voices hydration
    const t = setTimeout(() => {
      console.log(`Home: Speaking welcome message: "${welcome}" in language: ${langCode}`);
      
      if (language === 'te') {
        // For Telugu, try normal speech first, then force Telugu if needed
        speak(welcome, langCode);
        // Also try force Telugu speech as backup
        setTimeout(() => {
          console.log('Home: Trying force Telugu speech as backup...');
          forceTeluguSpeech(welcome);
        }, 1000);
      } else {
        speak(welcome, langCode);
      }
    }, 200);
    return () => clearTimeout(t);
  }, [language]);

  return (
    <div className="p-4 space-y-4 app-shell fade-up">
      <h1 className="text-2xl font-extrabold text-gray-900">Digital Guide</h1>
      <div className="grid grid-cols-2 gap-4">
        <BigButton to="/send-money" icon={FaMoneyBillWave} label="Send Money" color="bg-primary pulse-glow" />
        {/* <BigButton to="/history" icon={FaMoneyBillWave} label="History" color="bg-gray-700" /> */}
        <BigButton to="/book-tickets" icon={FaBus} label="Book Tickets" color="bg-green-600" />
        <BigButton to="/order-food" icon={FaUtensils} label="Order Food" color="bg-rose-600" />
        <BigButton to="/practice" icon={FaChalkboardTeacher} label="Learn/Practice" color="bg-accent" />
        {/* External website shortcuts */}
        <ExternalButton href="https://untie-aloha-43705113.figma.site" icon={FaGlobe} label="Open Google" color="bg-indigo-600"/>
        <ExternalButton href="https://www.figma.com/make/E1oIqg1bsXtd1mz8zJZbmV/Create-SmartGuide-App?t=dIns9FPqJjZBNoxs-6" icon={FaExternalLinkAlt} label="Open YouTube" color="bg-amber-600" />
      </div>
    </div>
  );
}

export default Home;
