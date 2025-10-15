import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useHistory } from 'react-router-dom';
import { speak, debugTeluguVoices, forceTeluguSpeech } from '../services/voice';

function ChooseLanguage() {
  const { language, setLanguage } = useLanguage();
  const history = useHistory();

  const choose = (code) => {
    setLanguage(code);
    const langCode = code === 'te' ? 'te-IN' : code === 'hi' ? 'hi-IN' : code === 'ta' ? 'ta-IN' : 'en-IN';
    
    // Debug Telugu voices if selecting Telugu
    if (code === 'te') {
      console.log('Telugu selected, debugging voices...');
      debugTeluguVoices();
    }
    
    // Small delay to allow voices to hydrate in some browsers
    setTimeout(() => {
      const message = code === 'te' ? 'భాష సేవ్ చేయబడింది' : 
                     code === 'hi' ? 'भाषा सहेजी गई' : 
                     code === 'ta' ? 'மொழி சேமிக்கப்பட்டது' : 
                     'Language saved';
      
      console.log(`Speaking message: "${message}" in language: ${langCode}`);
      
      if (code === 'te') {
        // For Telugu, try normal speech first, then force Telugu if needed
        speak(message, langCode);
        // Also try force Telugu speech as backup
        setTimeout(() => {
          console.log('Trying force Telugu speech as backup...');
          forceTeluguSpeech(message);
        }, 1000);
      } else {
        speak(message, langCode);
      }
    }, 150);
    
    history.push('/home');
  };

  return (
    <div className="p-4 max-w-md mx-auto fade-up">
      <h2 className="text-2xl font-bold text-center mb-6">Choose Language</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="btn" onClick={() => choose('en')}>English</button>
        <button className="btn" onClick={() => choose('hi')}>हिन्दी</button>
        <button className="btn" onClick={() => choose('te')}>తెలుగు</button>
        <button className="btn" onClick={() => choose('ta')}>தமிழ்</button>
      </div>
    </div>
  );
}

export default ChooseLanguage;


