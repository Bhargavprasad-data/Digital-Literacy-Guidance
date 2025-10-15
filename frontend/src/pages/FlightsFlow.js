import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function FlightsFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState('HYD');
  const [to, setTo] = useState('BLR');
  const [date, setDate] = useState('Next Fri');
  const [pax, setPax] = useState(1);

  useEffect(()=>{ speak(t(language, 'k_search_trains'), language); },[language]);

  if (step === 0) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Flights – MakeMyTrip style</h2>
      <div className="card">
        <div className="text-xl font-bold">Search Flights</div>
        <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="From airport" style={{marginTop:12}} />
        <input value={to} onChange={e=>setTo(e.target.value)} placeholder="To airport" style={{marginTop:12}} />
        <input value={date} onChange={e=>setDate(e.target.value)} placeholder="Date" style={{marginTop:12}} />
        <input value={pax} onChange={e=>setPax(e.target.value)} placeholder="Passengers" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak(t(language, 'k_choose_seats'), language); }}>Search</button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Select Flight</h2>
      <div className="grid" style={{gridTemplateColumns:'1fr',gap:8}}>
        {['IndiGo 6E-123 – 07:10','Air India AI-567 – 10:40','Vistara UK-888 – 18:30'].map(f => (
          <button key={f} className="card" onClick={()=>{ setStep(2); speak(t(language, 'k_choose_seats'), language); }}>{f}</button>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Passenger Details</h2>
      <div className="card">
        <input placeholder="Full name" style={{marginTop:12}} />
        <input placeholder="Age" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak(t(language, 'k_confirm_pay'), language); }}>Continue</button>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Summary</h2>
      <div className="card">{from} → {to} on {date} • Pax: {pax}
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak(t(language, 'k_booking_confirmed'), language); }}>Pay & Book</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Success</h2>
      <div className="card">Your flight is booked (simulated)</div>
    </div>
  );
}

export default FlightsFlow;



