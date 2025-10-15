import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function BusFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [from, setFrom] = useState('Hyderabad');
  const [to, setTo] = useState('Vijayawada');

  useEffect(()=>{ speak(t(language, 'k_search_trains'), language); },[language]);

  if (step === 0) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Bus – redBus style</h2>
      <div className="card">
        <div className="text-xl font-bold">Search Buses</div>
        <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="From" style={{marginTop:12}} />
        <input value={to} onChange={e=>setTo(e.target.value)} placeholder="To" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak(t(language, 'k_pick_bus_seat'), language); }}>Search</button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Select Bus</h2>
      <div className="grid" style={{gridTemplateColumns:'1fr',gap:8}}>
        {['Morning Express – 8:00 AM','Super Deluxe – 9:30 AM','Night Rider – 10:30 PM'].map(b => (
          <button key={b} className="card" onClick={()=>{ setStep(2); speak(t(language, 'k_choose_seats'), language); }}>{b}</button>
        ))}
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Seat Selection</h2>
      <div className="grid" style={{gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
        {Array.from({length:25}).map((_,i)=> <button key={i} className="card">□</button>)}
      </div>
      <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak(t(language, 'k_confirm_pay'), language); }}>Continue</button>
    </div>
  );

  if (step === 3) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Summary</h2>
      <div className="card">{from} → {to}
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak(t(language, 'k_booking_confirmed'), language); }}>Pay & Book</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Success</h2>
      <div className="card">Your bus ticket is booked (simulated)</div>
    </div>
  );
}

export default BusFlow;



