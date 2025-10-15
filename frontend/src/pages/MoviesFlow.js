import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function MoviesFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [movie, setMovie] = useState('Jawan');
  const [city, setCity] = useState('Hyderabad');
  const [seats, setSeats] = useState(2);

  useEffect(()=>{ speak(t(language, 'k_choose_movie_city'), language); },[language]);

  if (step === 0) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Movies – BookMyShow style</h2>
        <div className="card">
          <div className="text-xl font-bold">Select Movie & City</div>
          <input value={movie} onChange={e=>setMovie(e.target.value)} placeholder="Movie name" style={{marginTop:12}} />
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder="City" style={{marginTop:12}} />
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak(t(language, 'k_pick_date_theatre'), language); }}>Next</button>
        </div>
      </div>
    );
  }
  if (step === 1) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">{movie} – {city}</h2>
        <div className="card">
          <div className="text-xl font-bold">Select Date & Theatre</div>
          <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:12}}>
            {['Today','Tomorrow','Fri','Sat','Sun','Mon'].map(d => <button key={d} className="card">{d}</button>)}
          </div>
          <div className="grid" style={{gridTemplateColumns:'1fr',gap:8,marginTop:12}}>
            {['PVR Icon Mall','INOX GVK','Asian Sree Ramulu'].map(t => <button key={t} className="card">{t}</button>)}
          </div>
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(2); speak(t(language, 'k_choose_seats'), language); }}>Continue</button>
        </div>
      </div>
    );
  }
  if (step === 2) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Seat Selection</h2>
        <div className="card">
          <div className="text-xl font-bold">Choose seats (mock)</div>
          <div className="grid" style={{gridTemplateColumns:'repeat(8,1fr)',gap:6,marginTop:12}}>
            {Array.from({length:40}).map((_,i)=> <button key={i} className="card" onClick={()=>setSeats(s=>Math.min(6,s+1))}>□</button>)}
          </div>
          <div className="mt-2">Seats: {seats}</div>
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak(t(language, 'k_confirm_pay'), language); }}>Proceed</button>
        </div>
      </div>
    );
  }
  if (step === 3) {
    return (
      <div className="p-4 space-y-4 fade-up">
        <h2 className="text-2xl font-bold">Summary</h2>
        <div className="card">
          <div className="mt-2">Movie: {movie}</div>
          <div>City: {city}</div>
          <div>Seats: {seats}</div>
          <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak(t(language, 'k_booking_confirmed'), language); }}>Pay & Book</button>
        </div>
      </div>
    );
  }
  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Success</h2>
      <div className="card">Your movie tickets are booked (simulated)</div>
    </div>
  );
}

export default MoviesFlow;


