import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function SwiggyFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [restaurant, setRestaurant] = useState('Biryani Place');
  const [items, setItems] = useState([]);

  useEffect(()=>{ speak(t(language, 'k_choose_food_app'), language); },[language]);

  const addItem = (name, price) => setItems(list => [...list, { name, price }]);
  const total = items.reduce((s,i)=>s+i.price,0);

  if (step === 0) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Swiggy – Order Food</h2>
      <div className="card">
        <div className="text-xl font-bold">Choose Restaurant</div>
        <input value={restaurant} onChange={e=>setRestaurant(e.target.value)} placeholder="Search restaurant" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak(t(language, 'k_review_cart_checkout'), language); }}>Open</button>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">{restaurant}</h2>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[
          {name:'Chicken Biryani',price:180},
          {name:'Paneer Butter',price:160},
          {name:'Veg Thali',price:140},
          {name:'Roti x2',price:40},
        ].map(m => (
          <button key={m.name} className="card" onClick={()=>addItem(m.name,m.price)}>
            <div className="font-bold">{m.name}</div>
            <div>₹ {m.price}</div>
          </button>
        ))}
      </div>
      <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(2); speak(t(language, 'k_review_cart_checkout'), language); }}>View Cart ({items.length})</button>
    </div>
  );

  if (step === 2) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Cart</h2>
      <div className="card">
        {items.length ? items.map((i,idx)=>(<div key={idx}>{i.name} – ₹ {i.price}</div>)) : 'No items yet'}
        <div className="font-bold" style={{marginTop:12}}>Total: ₹ {total}</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak(t(language, 'k_select_address_pay'), language); }}>Checkout</button>
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Address & Payment</h2>
      <div className="card">
        <input placeholder="House no, street" style={{marginTop:12}} />
        <input placeholder="PIN code" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak(t(language, 'k_order_placed'), language); }}>Pay & Place Order</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Success</h2>
      <div className="card">Order placed (simulated). Delivery tracking available.</div>
    </div>
  );
}

export default SwiggyFlow;


