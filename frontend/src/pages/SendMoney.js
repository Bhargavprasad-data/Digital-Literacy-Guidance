import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';

const APPS = [
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'gpay', name: 'Google Pay' },
  { id: 'paytm', name: 'Paytm' },
];

const NumericKeypad = ({ onKey, onBackspace, onDone }) => (
  <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
    {[1,2,3,4,5,6,7,8,9,'00',0,'.'].map(k => (
      <button key={k} className="card" onClick={() => onKey(String(k))} style={{padding:'16px 0',fontSize:22,fontWeight:800}}>{k}</button>
    ))}
    <button className="card" onClick={onBackspace}>⌫</button>
    <button className="btn" onClick={onDone} style={{gridColumn:'span 2'}}>Next</button>
  </div>
);

const UpiPinModal = ({ show, onClose }) => {
  const [pin, setPin] = useState('');
  if (!show) return null;
  return (
    <div className="fade-up" style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card" style={{width:320}}>
        <div className="text-xl font-bold">Enter UPI PIN</div>
        <input type="password" value={pin} onChange={e=>setPin(e.target.value)} maxLength={6} placeholder="****" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>onClose(pin)}>Done</button>
      </div>
    </div>
  );
};

const QRScannerMock = ({ onSimulate }) => (
  <div className="card" style={{height:260,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{width:220,height:220,border:'3px dashed #4F46E5',borderRadius:16}} />
    <div style={{position:'absolute',bottom:12,left:0,right:0,textAlign:'center',color:'#475569'}}>Align QR code inside the box</div>
    <button className="btn" style={{position:'absolute',bottom:12,right:12}} onClick={onSimulate}>Simulate Scan</button>
  </div>
);

const ContactsGridMock = ({ onPick }) => (
  <div className="grid" style={{gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
    {['S','D','N','V','A','K','P','R'].map(c => (
      <button key={c} className="card" onClick={()=>onPick(c)} style={{height:72,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:800,fontSize:22}}>{c}</button>
    ))}
  </div>
);

function SendMoney() {
  const { language } = useLanguage();
  const [app, setApp] = useState(null);
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);

  useEffect(() => { if (!app) speak('Choose an app for sending money', language); }, [app, language]);

  const startFlow = (selected) => { setApp(selected); setStep(0); speak(selected==='gpay'?'Tap Pay to begin':'Tap Send Money to start', language); };

  const phonepeUI = () => {
    if (step === 0) return (
      <div className="card">
        <div className="text-xl font-bold">Send Money</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak('Type the mobile or UPI ID', language); }}>Send Money</button>
      </div>
    );
    if (step === 1) return (
      <div className="card">
        <div className="text-xl font-bold">Enter mobile / UPI ID</div>
        <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="98765 43210 or name@upi" style={{marginTop:12}} />
        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded-xl text-gray-900 font-semibold" onClick={()=>setStep(0)}>Back</button>
          <button className="btn" onClick={()=>{ setStep(2); speak('Check the name. Tap Confirm', language); }}>Next</button>
        </div>
      </div>
    );
    if (step === 2) return (
      <div className="card">
        <div className="text-xl font-bold">Confirm recipient</div>
        <div className="text-lg mt-2">{recipient || 'John Kumar'}</div>
        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded-xl text-gray-900 font-semibold" onClick={()=>setStep(1)}>Edit</button>
          <button className="btn" onClick={()=>{ setStep(3); speak('Enter the amount', language); }}>Confirm</button>
        </div>
      </div>
    );
    if (step === 3) return (
      <div className="card">
        <div className="text-xl font-bold">Enter amount</div>
        <div className="text-2xl font-extrabold" style={{margin:'8px 0'}}>₹ {amount || '0'}</div>
        <NumericKeypad onKey={(k)=>setAmount(a=> (a+k).slice(0,7))} onBackspace={()=>setAmount(a=>a.slice(0,-1))} onDone={()=>{ setStep(4); speak('Review and tap Confirm', language); }} />
      </div>
    );
    if (step === 4) return (
      <div className="card">
        <div className="text-xl font-bold">Payment summary</div>
        <div className="mt-2">To: {recipient || 'John Kumar'}</div>
        <div>Amount: ₹ {amount || '0'}</div>
        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded-xl text-gray-900 font-semibold" onClick={()=>setStep(3)}>Back</button>
          <button className="btn" onClick={()=>{ setShowPin(true); speak('Enter your UPI PIN', language); }}>Confirm</button>
        </div>
      </div>
    );
    if (step === 5) return (
      <div className="card">
        <div className="text-xl font-bold">Success</div>
        <div className="mt-2">Payment simulated. Save recipient or share receipt.</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>setStep(0)}>Finish</button>
      </div>
    );
    return null;
  };

  const gpayUI = () => {
    if (step === 0) return (
      <div className="card">
        <div className="text-xl font-bold">Pay</div>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          <button className="btn" onClick={()=>{ setStep(1); speak('Align the QR code inside the box', language); }}>Scan QR</button>
          <button className="btn" onClick={()=>{ setStep(2); speak('Tap to select contact', language); }}>Pay contact</button>
        </div>
      </div>
    );
    if (step === 1) return (
      <div>
        <QRScannerMock onSimulate={()=>{ setRecipient('Merchant Store'); setStep(3); speak('Check name then tap Confirm', language); }} />
      </div>
    );
    if (step === 2) return (
      <div className="card">
        <div className="text-xl font-bold">Choose contact</div>
        <ContactsGridMock onPick={(c)=>{ setRecipient('Contact '+c); setStep(3); speak('Check name then tap Confirm', language); }} />
      </div>
    );
    if (step === 3) return (
      <div className="card">
        <div className="text-xl font-bold">Confirm recipient</div>
        <div className="mt-2">{recipient}</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak('Type amount and tap Confirm', language); }}>Confirm</button>
      </div>
    );
    if (step === 4) return (
      <div className="card">
        <div className="text-xl font-bold">Enter amount</div>
        <div className="text-2xl font-extrabold" style={{margin:'8px 0'}}>₹ {amount || '0'}</div>
        <NumericKeypad onKey={(k)=>setAmount(a=> (a+k).slice(0,7))} onBackspace={()=>setAmount(a=>a.slice(0,-1))} onDone={()=>{ setStep(5); speak('Choose payment source', language); }} />
      </div>
    );
    if (step === 5) return (
      <div className="card">
        <div className="text-xl font-bold">Choose source</div>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          <button className="card">Bank A</button>
          <button className="card">Bank B</button>
        </div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setShowPin(true); speak('Enter your UPI PIN', language); }}>Confirm</button>
      </div>
    );
    if (step === 6) return (
      <div className="card">
        <div className="text-xl font-bold">Success</div>
        <div className="mt-2">Transaction done. Share receipt.</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>setStep(0)}>Finish</button>
      </div>
    );
    return null;
  };

  const paytmUI = () => {
    if (step === 0) return (
      <div className="card">
        <div className="text-xl font-bold">UPI Pay</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(1); speak('Enter mobile number', language); }}>To Mobile</button>
      </div>
    );
    if (step === 1) return (
      <div className="card">
        <div className="text-xl font-bold">Enter mobile</div>
        <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="98765 43210" style={{marginTop:12}} />
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(2); speak('Check name and confirm', language); }}>Next</button>
      </div>
    );
    if (step === 2) return (
      <div className="card">
        <div className="text-xl font-bold">Confirm recipient</div>
        <div className="mt-2">{recipient || 'Paytm User'}</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(3); speak('Enter the amount', language); }}>Confirm</button>
      </div>
    );
    if (step === 3) return (
      <div className="card">
        <div className="text-xl font-bold">Enter amount</div>
        <div className="text-2xl font-extrabold" style={{margin:'8px 0'}}>₹ {amount || '0'}</div>
        <NumericKeypad onKey={(k)=>setAmount(a=> (a+k).slice(0,7))} onBackspace={()=>setAmount(a=>a.slice(0,-1))} onDone={()=>{ setShowPin(true); speak('Enter your UPI PIN', language); }} />
      </div>
    );
    if (step === 4) return (
      <div className="card">
        <div className="text-xl font-bold">Success</div>
        <div className="mt-2">Payment simulated.</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>setStep(0)}>Finish</button>
      </div>
    );
    return null;
  };

  const content = app==='phonepe' ? phonepeUI() : app==='gpay' ? gpayUI() : app==='paytm' ? paytmUI() : null;

  return (
    <div className="p-4 space-y-4 fade-up">
      {!app ? (
        <>
          <h2 className="text-2xl font-bold">Choose App for Send Money</h2>
          <div className="grid grid-cols-2 gap-4">
            {APPS.map(x => (
              <button key={x.id} className="btn" onClick={() => startFlow(x.id)}>{x.name}</button>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold">{app === 'phonepe' ? 'PhonePe' : app === 'gpay' ? 'Google Pay' : 'Paytm'} – Send Money</h2>
          {content}
        </>
      )}
      <UpiPinModal show={showPin} onClose={() => { setShowPin(false); setStep(app==='gpay'?6:5); speak('Payment successful', language); }} />
    </div>
  );
}

export default SendMoney;