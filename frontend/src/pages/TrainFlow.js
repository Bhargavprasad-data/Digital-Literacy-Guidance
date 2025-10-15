import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function TrainFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState('HYD');
  const [to, setTo] = useState('BZA');
  const [date, setDate] = useState('Tomorrow');

  useEffect(()=>{ speak(t(language, 'k_search_trains'), language); },[language]);

  if (step === 0) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Train – IRCTC style</h2>
        <div className="card">
          <div className="text-xl font-bold">Search Trains</div>
          <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="From" style={{marginTop:12}} />
          <input value={to} onChange={e=>setTo(e.target.value)} placeholder="To" style={{marginTop:12}} />
          <input value={date} onChange={e=>setDate(e.target.value)} placeholder="Date" style={{marginTop:12}} />
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak(t(language, 'k_choose_seats'), language); }}>Search</button>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Select Train</h2>
        <div className="grid" style={{gridTemplateColumns:'1fr',gap:8}}>
          {['Hyderabad Express 12713 – 07:00','Godavari 12727 – 09:40','Vande Bharat – 16:10'].map(t => (
            <button key={t} className="card" onClick={()=>{ setStep(2); speak('Choose seats', language); }}>{t}</button>
          ))}
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Enter Passenger</h2>
        <div className="card">
          <input placeholder="Passenger name" style={{marginTop:12}} />
          <input placeholder="Age" style={{marginTop:12}} />
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak('Confirm and pay', language); }}>Continue</button>
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Summary</h2>
        <div className="card">{from} → {to} on {date}
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak('Booking confirmed', language); }}>Pay & Book</button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Success</h2>
      <div className="card">Your train ticket is booked (simulated)</div>
    </div>
  );
}

export default TrainFlow;


