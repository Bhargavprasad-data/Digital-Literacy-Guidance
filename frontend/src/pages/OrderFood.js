import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { speak } from '../services/voice';

const steps = [
  { id: 1, title: 'Open Swiggy', desc: 'Allow location and browse restaurants.' },
  { id: 2, title: 'Pick restaurant', desc: 'Choose a restaurant you like.' },
  { id: 3, title: 'Add items', desc: 'Tap items to add to cart.' },
  { id: 4, title: 'Checkout', desc: 'Review cart and tap Checkout.' },
  { id: 5, title: 'Pay', desc: 'Select payment method and confirm.' },
];

const localizedSteps = {
  en: steps.map(s => `${s.title}. ${s.desc}`),
  hi: [
    'Swiggy खोलें। लोकेशन ऑन करें और रेस्टोरेंट देखें।',
    'रेस्टोरेंट चुनें। जो पसंद हो उसे चुनें।',
    'आइटम जोड़ें। कार्ट में आइटम ऐड करें।',
    'चेकआउट करें। कार्ट देखें और Checkout पर टैप करें।',
    'भुगतान करें। भुगतान का तरीका चुनें और कन्फर्म करें।',
  ],
  te: [
    'Swiggy ఓపెన్ చేయండి. లోకేషన్ అనుమతించి రెస్టారెంట్లు చూడండి.',
    'రెస్టారెంట్ ఎంచుకోండి. మీకు నచ్చినది ఎంచుకోండి.',
    'ఐటమ్స్ జోడించండి. కార్ట్‌లో ఐటమ్స్ యాడ్ చేయండి.',
    'చెకౌట్ చేయండి. కార్ట్ చూసి Checkout పై ట్యాప్ చేయండి.',
    'చెల్లించండి. పేమెంట్ విధానం ఎంచుకొని కన్ఫర్మ్ చేయండి.',
  ],
  ta: [
    'Swiggy திறக்கவும். இடத்தை அனுமதித்து உணவகங்களைப் பாருங்கள்.',
    'உணவகத்தைத் தேர்ந்தெடுக்கவும். உங்களுக்கு பிடித்ததைத் தேர்ந்தெடுக்கவும்.',
    'உணவுப் பொருட்களைச் சேர்க்கவும். கார்டில் சேர்க்கவும்.',
    'Checkout செய்யவும். கார்டைப் பார்வையிட்டு Checkout தட்டவும்.',
    'செலுத்தவும். கட்டண முறையைத் தேர்ந்தெடுத்து உறுதிசெய்க.',
  ],
};

function OrderFood() {
  const { language } = useLanguage();
  const [current, setCurrent] = useState(0);
  const step = steps[current];

  useEffect(() => {
    const langCode = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : language === 'ta' ? 'ta-IN' : 'en-IN';
    const text = (localizedSteps[language] || localizedSteps.en)[current];
    speak(text, langCode);
  }, [current, language]);

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Order Food Tutorial</h2>
      <div className="card">
        <div className="text-xl font-semibold">Step {step.id}: {step.title}</div>
        <div className="text-gray-700 mt-2 text-lg">{step.desc}</div>
        <div className="flex justify-between mt-4">
          <button onClick={() => setCurrent(c => Math.max(c-1, 0))} className="px-4 py-2 bg-gray-200 rounded-xl text-gray-900 font-semibold" disabled={current===0}>Back</button>
          <button onClick={() => setCurrent(c => Math.min(c+1, steps.length-1))} className="px-4 py-2 btn" disabled={current===steps.length-1}>Next</button>
        </div>
      </div>
    </div>
  );
}

export default OrderFood;



