import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function DominosFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const total = items.reduce((s,i)=>s+i.price,0);

  useEffect(()=>{ speak(t(language, 'k_choose_food_app'), language); },[language]);

  if (step === 0) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Domino’s – Pizza Order</h2>
      <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12}}>
        {[
          {name:'Farmhouse (M)',price:299},
          {name:'Veggie Paradise (M)',price:279},
          {name:'Cheese Burst Add-on',price:80},
          {name:'Garlic Bread',price:129},
        ].map(p => (
          <button key={p.name} className="card" onClick={()=>setItems(l=>[...l,p])}>
            <div className="font-bold">{p.name}</div>
            <div>₹ {p.price}</div>
          </button>
        ))}
      </div>
      <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak(t(language, 'k_review_cart_checkout'), language); }}>Cart ({items.length})</button>
    </div>
  );

  if (step === 1) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Cart</h2>
      <div className="card">
        {items.length ? items.map((i,idx)=>(<div key={idx}>{i.name} – ₹ {i.price}</div>)) : 'No items yet'}
        <div className="font-bold" style={{marginTop:12}}>Total: ₹ {total}</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(2); speak(t(language, 'k_select_address_pay'), language); }}>Checkout</button>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Address & Payment</h2>
      <div className="card">
        <input placeholder="House no, street" style={{marginTop:12}} />
        <input placeholder="PIN code" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak(t(language, 'k_order_placed'), language); }}>Pay & Place Order</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Success</h2>
      <div className="card">Pizza ordered (simulated). Delivery tracking enabled.</div>
    </div>
  );
}

export default DominosFlow;



