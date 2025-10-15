import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { speak } from '../services/voice';

const steps = [
  { id: 1, title: 'Open RedBus', desc: 'Search your route: From and To.' },
  { id: 2, title: 'Pick date', desc: 'Choose travel date from the calendar.' },
  { id: 3, title: 'Select bus', desc: 'Compare buses and tap Select Seats.' },
  { id: 4, title: 'Choose seat', desc: 'Tap a seat and confirm boarding point.' },
  { id: 5, title: 'Pay', desc: 'Enter details and pay securely.' },
];

const localizedSteps = {
  en: steps.map(s => `${s.title}. ${s.desc}`),
  hi: [
    'RedBus खोलें। अपना रूट खोजें: From और To।',
    'तारीख चुनें। कैलेंडर से यात्रा की तारीख चुनें।',
    'बस चुनें। तुलना करें और Select Seats पर टैप करें।',
    'सीट चुनें। सीट टैप करें और बोर्डिंग पॉइंट कन्फर्म करें।',
    'भुगतान करें। विवरण भरें और सुरक्षित भुगतान करें।',
  ],
  te: [
    'RedBus ఓపెన్ చేయండి. From మరియు To రూట్ సెర్చ్ చేయండి.',
    'తేదీ ఎంచుకోండి. కాలెండర్ నుండి ట్రావెల్ డేట్ ఎంపిక చేయండి.',
    'బస్ ఎంచుకోండి. పోల్చి Select Seats పై ట్యాప్ చేయండి.',
    'సీటు ఎంచుకోండి. సీటు ట్యాప్ చేసి బోర్డింగ్ పాయింట్ కన్ఫర్మ్ చేయండి.',
    'పేమెంట్ చేయండి. వివరాలు ఇచ్చి సురక్షితంగా చెల్లించండి.',
  ],
  ta: [
    'RedBus திறக்கவும். From மற்றும் To பாதையைத் தேடவும்.',
    'தேதியைத் தேர்ந்தெடுக்கவும். காலெண்டரில் இருந்து தேதி தேர்ந்தெடுக்கவும்.',
    'பஸ்ஸைத் தேர்ந்தெடுக்கவும். ஒப்பிட்டு Select Seats தட்டவும்.',
    'இருக்கையைத் தேர்ந்தெடுக்கவும். இருக்கை தட்டி, போர்டிங் பாயின்டை உறுதிசெய்க.',
    'செலுத்தவும். விவரங்களை நிரப்பி பாதுகாப்பாக பணம் செலுத்தவும்.',
  ],
};

function BookTickets() {
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
      <h2 className="text-2xl font-bold">Book Tickets Tutorial</h2>
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

export default BookTickets;



