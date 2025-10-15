import React, { useEffect, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import { isValidMobileOrUpi, isValidUpiPin } from '../services/validation';

const NumericKeypad = ({ onKey, onBackspace, onDone }) => (
  <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
    {[1,2,3,4,5,6,7,8,9,'00',0,'.'].map(k => (
      <button key={k} className="card" onClick={() => onKey(String(k))} style={{padding:'16px 0',fontSize:22,fontWeight:800}}>{k}</button>
    ))}
    <button className="card" onClick={onBackspace}>⌫</button>
    <button className="btn" onClick={onDone} style={{gridColumn:'span 2'}}>Confirm</button>
  </div>
);

const UpiPinModal = ({ show, onClose }) => {
  const [pin, setPin] = useState('');
  const digitsOnly = (v) => v.replace(/\D/g, '').slice(0,6);
  const valid = isValidUpiPin(pin);
  if (!show) return null;
  return (
    <div className="fade-up" style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="card" style={{width:320}}>
        <div className="text-xl font-bold">Enter UPI PIN</div>
        <input type="password" inputMode="numeric" value={pin} onChange={e=>setPin(digitsOnly(e.target.value))} maxLength={6} placeholder="****" style={{marginTop:12}} />
        {!valid && pin && (
          <div style={{color:'#dc2626',marginTop:8,fontWeight:600}}>UPI PIN must be 4 or 6 digits</div>
        )}
        <button className="btn" style={{marginTop:12}} disabled={!valid} onClick={()=>onClose(pin)}>Done</button>
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

function GPayFlow() {
  const { language } = useLanguage();
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const isRecipientValid = isValidMobileOrUpi(recipient);

  useEffect(()=>{ speak(t(language,'k_choose_app_send'), language); },[language]);

  const render = () => {
    if (step === 0) return (
      <div className="card">
        <div className="text-xl font-bold">Pay</div>
        <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
          <button className="btn" onClick={()=>{ setStep(1); speak(t(language,'k_align_qr'), language); }}>Scan QR</button>
          <button className="btn" onClick={()=>{ setStep(2); speak(t(language,'k_select_contact'), language); }}>Pay contact</button>
        </div>
      </div>
    );
    if (step === 1) return (
        <QRScannerMock onSimulate={()=>{ setRecipient('Merchant Store'); setStep(3); speak(t(language,'k_check_name_confirm'), language); }} />
    );
    if (step === 2) return (
      <div className="card">
        <div className="text-xl font-bold">Choose contact</div>
        <ContactsGridMock onPick={(c)=>{ setRecipient('Contact '+c); setStep(3); speak(t(language,'k_check_name_confirm'), language); }} />
        <div className="mt-4">
          <div className="text-sm" style={{fontWeight:700,marginBottom:8}}>Or enter mobile / UPI ID</div>
          <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="98765 43210 or name@upi" />
          {!isRecipientValid && recipient && (
            <div style={{color:'#dc2626',marginTop:8,fontWeight:600}}>Enter a valid mobile number or UPI ID</div>
          )}
          <button className="btn" style={{marginTop:12}} disabled={!isRecipientValid} onClick={()=>{ setStep(3); speak(t(language,'k_check_name_confirm'), language); }}>Next</button>
        </div>
      </div>
    );
    if (step === 3) return (
      <div className="card">
        <div className="text-xl font-bold">Confirm recipient</div>
        <div className="mt-2">{recipient}</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>{ setStep(4); speak(t(language,'k_type_amount_confirm'), language); }}>Confirm</button>
      </div>
    );
    if (step === 4) return (
      <div className="card">
        <div className="text-xl font-bold">Enter amount</div>
        <div className="text-2xl font-extrabold" style={{margin:'8px 0'}}>₹ {amount || '0'}</div>
        <NumericKeypad onKey={(k)=>setAmount(a=> (a+k).slice(0,7))} onBackspace={()=>setAmount(a=>a.slice(0,-1))} onDone={()=>{ setShowPin(true); speak(t(language,'k_enter_upi_pin'), language); }} />
      </div>
    );
    if (step === 5) return (
      <div className="card">
        <div className="text-xl font-bold">Success</div>
        <div className="mt-2">Transaction done. Share receipt.</div>
        <button className="btn" style={{marginTop:12}} onClick={()=>setStep(0)}>Finish</button>
      </div>
    );
    return null;
  };

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">Google Pay – Send Money</h2>
      {render()}
      <UpiPinModal show={showPin} onClose={()=>{ setShowPin(false); setStep(5); speak(t(language,'k_transaction_done'), language); }} />
    </div>
  );
}

export default GPayFlow;


