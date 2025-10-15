import React, { useEffect, useRef, useState } from 'react';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { isValidMobileOrUpi, isValidUpiPin } from '../services/validation';

const NumericKeypad = ({ onKey, onBackspace, onDone }) => (
  <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
    {[1,2,3,4,5,6,7,8,9,'00',0,'.'].map(k => (
      <button key={k} className="card" onClick={() => onKey(String(k))} style={{padding:'16px 0',fontSize:22,fontWeight:800}}>{k}</button>
    ))}
    <button className="card" onClick={onBackspace}>⌫</button>
    <button className="btn" onClick={onDone} style={{gridColumn:'span 2'}}>Next</button>
  </div>
);

const PhoneKeypad = ({ onKey, onBackspace, onDone }) => (
  <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)', gap:12}}>
    {[1,2,3,4,5,6,7,8,9,'+','#',0].map(k => (
      <button key={k} className="card" onClick={() => onKey(String(k))} style={{padding:'16px 0',fontSize:22,fontWeight:800}}>{k}</button>
    ))}
    <button className="card" onClick={onBackspace}>⌫</button>
    <button className="btn" onClick={onDone} style={{gridColumn:'span 2'}}>Next</button>
  </div>
);

const QRScannerMock = ({ onSimulate }) => (
  <div className="card" style={{height:260,position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
    <div style={{width:220,height:220,border:'3px dashed #7c3aed',borderRadius:16}} />
    <div style={{position:'absolute',bottom:12,left:0,right:0,textAlign:'center',color:'#c7d2fe'}}>Align QR code inside the box</div>
    <button className="btn" style={{position:'absolute',bottom:12,right:12}} onClick={onSimulate}>Simulate Scan</button>
  </div>
);

// Simple relative time formatter for history items
function formatRelative(dateLike) {
  try {
    const d = typeof dateLike === 'string' || typeof dateLike === 'number' ? new Date(dateLike) : (dateLike || new Date());
    const diffMs = Date.now() - d.getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 45) return 'Just now';
    if (min < 60) return `${min} min${min === 1 ? '' : 's'} ago`;
    if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
    return `${day} day${day === 1 ? '' : 's'} ago`;
  } catch {
    return '';
  }
}

const UpiPinModal = ({ show, onClose, name, number, amount }) => {
  const [pin, setPin] = useState('');
  if (!show) return null;
  const handleKey = (k) => setPin(p => (p + String(k)).replace(/\D/g,'').slice(0,6));
  const backspace = () => setPin(p => p.slice(0,-1));
  const valid = /^(\d{4}|\d{6})$/.test(pin);
  return (
    <div className="fade-up" style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'rgba(0,0,0,0.75)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}}>
      <div className="card" style={{width:360,background:'#0b0b0b',color:'#e5e7eb'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid #1f2937'}}>
          <div>
            <div style={{fontSize:12,color:'#9ca3af'}}>State Bank Of India</div>
            <div style={{fontSize:12,color:'#9ca3af'}}>XXXX0518</div>
          </div>
          <div style={{fontWeight:900}}>UPI</div>
        </div>
        <div style={{marginTop:12,color:'#9ca3af'}}>To:</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div style={{fontWeight:800}}>{name || 'Recipient'}</div>
          <div style={{fontWeight:900}}>₹ {amount || '0'}</div>
        </div>
        <div style={{marginTop:8,color:'#9ca3af'}}>{number || ''}</div>
        <div style={{marginTop:16,textAlign:'center',color:'#9ca3af'}}>ENTER 6-DIGIT UPI PIN</div>
        <div style={{display:'flex',justifyContent:'space-between',gap:8,marginTop:8}}>
          {Array.from({length:6}).map((_,i)=> (
            <div key={i} style={{flex:1,height:10,borderBottom:'3px solid #cbd5e1',opacity:i < pin.length ? 1 : 0.6}} />
          ))}
        </div>
        <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)',gap:12,marginTop:16}}>
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(k => (
            k === '' ? <div key="sp" /> : (
            <button key={k} className="card" onClick={()=> (k==='⌫'? backspace(): handleKey(k))} style={{padding:'14px 0',fontSize:20,fontWeight:800}}>{k}</button>
            )
          ))}
          <button className="btn" disabled={!valid} onClick={()=>{ console.log('PIN submitted:', pin); onClose(pin); }} style={{gridColumn:'span 3',marginTop:4}}>
            ✔
          </button>
        </div>
      </div>
    </div>
  );
};

function PhonePeFlow() {
  const { language } = useLanguage();
  const { token } = useAuth();
  const [step, setStep] = useState(0);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const isRecipientValid = isValidMobileOrUpi(recipient);
  const [recents, setRecents] = useState([]);
  const [contacts] = useState([
    { name: 'Bhargav', number: '7981092249' },
    { name: 'Naresh', number: '7981963099' },
    { name: 'Vivek Vardhan', number: '77801550019' },
    { name: 'Tirumala', number: '7013407073' },
    { name: 'Kiran Kumar', number: '6281092249' },
  ]);
  const [phoneInput, setPhoneInput] = useState('');
  const [countryPrefix, setCountryPrefix] = useState('+91');
  const [searchQuery, setSearchQuery] = useState('');
  const [unknownNumber, setUnknownNumber] = useState('');
  const [blockedNumbers, setBlockedNumbers] = useState(()=>{
    try { return JSON.parse(localStorage.getItem('phonepe_blocked')||'[]'); } catch { return []; }
  });
  const [activeName, setActiveName] = useState('');
  const [activeNumber, setActiveNumber] = useState('');
  const [chatAmount, setChatAmount] = useState('');
  const paymentRecordedRef = useRef(false);
  const isFullScreenStep = [19,20,21,22,23,24,25,26,27,10].includes(step);
  const [serverTransactions, setServerTransactions] = useState([]);
  const [lastPayment, setLastPayment] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('phonepe_recents');
    if (saved) {
      try { setRecents(JSON.parse(saved)); } catch { /* ignore */ }
    } else {
      // seed with demo data
      setRecents([
        { name: 'Vivek CSD', amount: 10, direction: 'received', date: '13/10' },
        { name: 'V jagan', amount: 25000, direction: 'received', date: '12/10' },
        { name: 'Sameera', amount: 4, direction: 'received', date: '07/10' },
        { name: 'VANDANA HARSHAVARD...', amount: 2500, direction: 'sent', date: '05/10' },
        { name: 'Amma Nanna', amount: 2500, direction: 'received', date: '05/10' },
        { name: 'Vinay Anna..', amount: 130, direction: 'sent', date: '04/10' },
        { name: 'Chatrapathi Csd', amount: 70, direction: 'sent', date: '24/09' },
        { name: 'Sudheer Anna...', amount: 100, direction: 'sent', date: '23/09' },
      ]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('phonepe_recents', JSON.stringify(recents));
  }, [recents]);

  useEffect(() => {
    localStorage.setItem('phonepe_blocked', JSON.stringify(blockedNumbers));
  }, [blockedNumbers]);
  useEffect(() => {
    if (step === 19) {
      const t = setTimeout(() => setStep(20), 1500);
      return () => clearTimeout(t);
    }
    // Step 20 timeout removed - user must click Done button manually
    
    // Reset PIN when entering PIN entry screen
    if (step === 26) {
      setPin('');
    }
    
    if (step === 21) {
      if (!paymentRecordedRef.current) {
        const digits = (activeNumber || unknownNumber || recipient);
        const displayName = activeName || generateDisplayName(String(digits).replace(/\D/g,''));
        const amountToPay = chatAmount || amount || 1;
        addPaymentToChat(String(digits).replace(/\D/g,''), displayName, amountToPay);
        paymentRecordedRef.current = true;
      }
    } else {
      paymentRecordedRef.current = false;
    }
  }, [step]);

  // Voice guidance on step changes
  useEffect(() => {
    try {
      switch (step) {
        case 11: // Send Money -> Search contacts screen
          speak(t(language, 'k_select_contact') || t(language, 'k_type_mobile_upi'), language);
          break;
        case 14: // Banking name verification
          speak(t(language, 'k_check_name_confirm'), language);
          break;
        case 15: // Chat & amount entry
          speak(t(language, 'k_enter_amount_or_chat') || t(language, 'k_type_amount_confirm'), language);
          break;
        case 17: // UPI PIN for payment
          speak(t(language, 'k_enter_upi_pin'), language);
          break;
        case 26: // SBI PIN entry (balance check)
          speak(t(language, 'k_enter_upi_pin'), language);
          break;
        case 19: // Payment success screen
          speak(t(language, 'k_payment_success'), language);
          break;
        case 20: // Detailed payment confirmation - stay until Done
          speak(t(language, 'k_payment_details_tap_done'), language);
          break;
        case 27: // Bank balance page
          speak(t(language, 'k_show_account_balance'), language);
          break;
        default:
          break;
      }
    } catch (_) {}
  }, [step, language]);

  const addRecent = (name, amt, number) => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const recent = { name, amount: Number(amt) || 0, direction: 'sent', date: `${dd}/${mm}`, number: (number||'').replace(/\D/g,'') };
    setRecents(r => [recent, ...r.filter(x => x.name !== name)].slice(0, 20));
  };

  const highlightDigits = (number, query) => {
    if (!query) return number;
    const idx = number.indexOf(query);
    if (idx === -1) return number;
    return (
      <span>
        {number.slice(0, idx)}
        <span style={{color:'#22d3ee',fontWeight:900}}>{number.slice(idx, idx + query.length)}</span>
        {number.slice(idx + query.length)}
      </span>
    );
    if (step === 17) {
      const digits = (activeNumber || unknownNumber || recipient);
      const full = `+91${String(digits).replace(/\D/g,'')}`;
      const displayName = activeName || generateDisplayName(String(digits).replace(/\D/g,''));
      return (
        <div className="card" style={{background:'#0b0b0b'}}>
          <div style={{padding:12,borderRadius:16,background:'#111827',marginBottom:12,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:72,height:72,borderRadius:16,background:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',color:'#111827',fontWeight:900}}>GR</div>
            <div style={{color:'#9ca3af',marginTop:12}}>Banking name :</div>
            <div style={{color:'#e5e7eb',fontWeight:900,fontSize:18,marginTop:4}}>{displayName} <span style={{color:'#22c55e'}}>✓</span></div>
            <div style={{color:'#9ca3af',marginTop:4}}>{full}</div>
          </div>
        </div>
      );
    }
    if (step === 19) {
      console.log('Rendering step 19 - Green success screen');
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#15803d',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
          <div style={{textAlign:'center',color:'#fff'}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:'#fff',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:48,height:48,border:'6px solid #16a34a',borderTop:'none',borderLeft:'none',transform:'rotate(45deg) translateY(-8px)'}} />
            </div>
            <div style={{fontWeight:900,fontSize:24}}>Payment Successful</div>
            <div style={{marginTop:8,fontSize:16}}>Today at 12:34 PM</div>
            <button className="btn" style={{marginTop:20,background:'#fff',color:'#15803d',fontWeight:900,padding:'12px 24px'}} onClick={()=>setStep(20)}>
              Next (Step 20)
            </button>
          </div>
        </div>
      );
    }
    if (step === 20) {
      console.log('Rendering step 20 - Detailed payment screen');
      const digits = (activeNumber || unknownNumber || recipient);
      const displayName = activeName || generateDisplayName(String(digits).replace(/\D/g,''));
      const amountToPay = chatAmount || amount || 1;
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#065f46',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Payment Successful Header */}
          <div style={{padding:'40px 20px 20px',textAlign:'center',color:'#fff'}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:'#fff',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:48,height:48,border:'6px solid #16a34a',borderTop:'none',borderLeft:'none',transform:'rotate(45deg) translateY(-8px)'}} />
          </div>
            <div style={{fontWeight:900,fontSize:24}}>Payment Successful</div>
            <div style={{marginTop:8,fontSize:16}}>Today at 12:34 PM</div>
          </div>

          {/* Payment Details Card */}
          <div style={{flex:1,padding:'0 20px',display:'flex',flexDirection:'column'}}>
            <div className="card" style={{background:'#111827',color:'#e5e7eb',padding:'20px',borderRadius:'16px',marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900}}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900,fontSize:18}}>{displayName}</div>
                  <div style={{color:'#9ca3af',fontSize:14}}>+91{String(digits).replace(/\D/g,'')}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12}}>
                <div style={{fontWeight:900,fontSize:24}}>₹{amountToPay}</div>
                <div style={{color:'#7c3aed',fontWeight:800,fontSize:14}}>Split Expense</div>
              </div>
              <div style={{display:'flex',gap:12,marginTop:16}}>
                <button className="card" style={{flex:1,background:'#7c3aed',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px'}}>
                  <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>📄</div>
                  <span style={{fontWeight:800}}>View Details</span>
                </button>
                <button className="card" style={{flex:1,background:'#7c3aed',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px'}}>
                  <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>📤</div>
                  <span style={{fontWeight:800}}>Share Receipt</span>
                </button>
              </div>
            </div>

            {/* Advertisement Card */}
            <div className="card" style={{background:'#4c1d95',color:'#fff',padding:'20px',borderRadius:'16px',marginBottom:'20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:'8px',background:'#6d28d9',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>📈</div>
                <div>
                  <div style={{fontWeight:900,fontSize:16}}>share.market</div>
                  <div style={{fontSize:12,color:'#c4b5fd'}}>A PhonePe Product</div>
                </div>
              </div>
              <div style={{fontWeight:900,fontSize:18,marginBottom:8}}>
                Invest in India's top stocks with just <span style={{color:'#22c55e'}}>₹1,000</span>
              </div>
              <button className="card" style={{background:'#6d28d9',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',marginTop:12}}>
                <span style={{fontWeight:800}}>Download now</span>
                <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>→</div>
              </button>
            </div>
          </div>

          {/* Bottom Done Button */}
          <div style={{padding:'0 20px 20px'}}>
            <button className="btn" style={{width:'100%',background:'#111827',color:'#7c3aed',fontWeight:900,padding:'16px',cursor:'pointer'}} onClick={()=> goToHomeAfterPayment(digits, displayName, amountToPay)}>
              Done
            </button>
          </div>
        </div>
      );
    }
    if (step === 21) {
      const digits = (activeNumber || unknownNumber || recipient);
      const clean = String(digits).replace(/\D/g,'');
      const displayName = activeName || generateDisplayName(clean);
      let entries = loadChat(clean);
      const full = `+91${clean}`;

      // If chat is empty, seed with dynamic cards including the latest payment
      if (!entries.length) {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const lastAmount = Number(chatAmount || amount || 1);
        entries = [
          { type: 'failed', amount: 1, time },
          { type: 'received', amount: 2, time },
          { type: 'paid', amount: lastAmount, time },
          { type: 'received', amount: 2, time },
        ];
      }
      return (
        <div className="fade-up" style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'#0b0b0b',zIndex:60,display:'flex',flexDirection:'column'}}>
          {/* Top bar */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 12px 0'}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button className="card" onClick={()=>setStep(0)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
              <div>
            <div className="text-xl font-extrabold" style={{color:'#e5e7eb'}}>{displayName}</div>
                <div style={{color:'#9ca3af',fontSize:12}}>{full}</div>
          </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:12,color:'#cbd5e1'}}>
              <span>⟳</span>
              <span>ⓘ</span>
            </div>
          </div>

          {/* Chat timeline */}
          <div className="space-y-2" style={{margin:12,overflowY:'auto',flex:1}}>
            {entries.map((e,i)=> (
              <div key={i}>
                <div className="card" style={{
                  background:e.type==='paid'? '#4c1d95' : (e.type==='received' ? '#111827' : '#1f2937'),
                  color:'#e5e7eb',
                  padding:'12px',
                  borderRadius:16,
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'space-between'
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{fontSize:24,fontWeight:900}}>₹{e.amount}</div>
                    <div style={{color:'#cbd5e1',fontWeight:800}}>{e.type==='paid'?'PAID':(e.type==='received'?'RECEIVED':'FAILED')}</div>
                  </div>
                  <div style={{color:'#94a3b8',fontSize:12}}>{e.time}</div>
                </div>
                {i === entries.length - 1 && (
                  <div style={{display:'flex',justifyContent:'flex-end',marginTop:8}}>
                    <div style={{background:'#7c3aed',color:'#fff',padding:'10px 12px',borderRadius:12,maxWidth:'80%'}}>
                      <div style={{fontWeight:800}}>{displayName}</div>
                      <div>₹ Paid to You</div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Quick replies */}
          <div style={{display:'flex',gap:8,margin:'0 12px 12px'}}>
            <button className="card" style={{border:'1px dashed #475569',color:'#e5e7eb'}}>Thank you</button>
            <button className="card" style={{border:'1px dashed #475569',color:'#e5e7eb'}}>Received</button>
            <button className="card" style={{border:'1px dashed #475569',color:'#e5e7eb'}}>👍</button>
          </div>

          {/* Input row */}
          <div className="card" style={{display:'flex',alignItems:'center',gap:8,margin:'0 12px 12px'}}>
            <div style={{fontWeight:900,color:'#22c55e'}}>₹</div>
            <input placeholder="Enter amount or chat" style={{flex:1,border:'none',outline:'none',background:'transparent',color:'#e5e7eb'}} />
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <button className="card">📎</button>
              <button className="card">➤</button>
            </div>
          </div>
        </div>
      );
    }
  };

  const highlightName = (text, query) => {
    if (!query) return text;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i === -1) return text;
    return (
      <span>
        {text.slice(0, i)}
        <span style={{color:'#22d3ee',fontWeight:900}}>{text.slice(i, i + query.length)}</span>
        {text.slice(i + query.length)}
      </span>
    );
  };

  const formatPhoneDisplay = (prefix, digits) => {
    if (prefix === '+91') {
      const d = digits.replace(/\D/g,'').slice(-10);
      if (!d) return `${prefix}`;
      const left = d.slice(0,5);
      const right = d.slice(5);
      return `${prefix} ${left}${right ? ' ' + right : ''}`;
    }
    // generic grouping every 3-4 digits
    const cleaned = digits.replace(/\D/g,'');
    const groups = [];
    for (let i = 0; i < cleaned.length; i += 3) groups.push(cleaned.slice(i, i+3));
    return `${prefix} ${groups.join(' ')}`.trim();
  };

  const isBlocked = (num) => blockedNumbers.includes(num);
  const generateDisplayName = (num) => {
    // simple deterministic pseudo-name from digits
    const names = ['ROHIT KUMAR SARAF','AMIT SHARMA','NEHA SINGH','RAVI KUMAR','ANITA VERMA'];
    const idx = (parseInt(num.slice(-2)) || 0) % names.length;
    return names[idx];
  };
  const loadChat = (num) => {
    try { return JSON.parse(localStorage.getItem(`phonepe_chat_${num}`)||'[]'); } catch { return []; }
  };
  const saveChat = (num, entries) => {
    localStorage.setItem(`phonepe_chat_${num}` , JSON.stringify(entries));
  };
  // History persistence helpers
  const loadHistory = () => {
    try { return JSON.parse(localStorage.getItem('phonepe_history')||'[]'); } catch { return []; }
  };
  const saveHistory = (entries) => {
    localStorage.setItem('phonepe_history', JSON.stringify(entries));
  };
  const addHistoryEntry = async (type, name, amount, number) => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const status = type === 'received' ? 'Credited to' : type === 'failed' ? 'Failed' : 'Debited from';
    const entry = { id: `h_${now.getTime()}`, type, name, number, amount: Number(amount), time, when: 'Just now', status, createdAt: now.toISOString() };
    const current = loadHistory();
    saveHistory([entry, ...current].slice(0, 50));
    setLastPayment(entry);
    // also store last payment snapshot for fallback UI
    try { localStorage.setItem('phonepe_last_payment', JSON.stringify(entry)); } catch {}
    // Persist to backend if logged in
    try {
      if (token) {
        await api.createTransaction(token, {
          type,
          name,
          number,
          amount: Number(amount),
          status,
          meta: { source: 'phonepe_sim' },
        });
      }
    } catch (e) {
      // ignore network errors, local history is already saved
      console.warn('Failed to persist transaction:', e?.message || e);
    }
    return entry;
  };
  const addPaymentToChat = async (num, name, amount) => {
    const entries = loadChat(num);
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const entry = { type: 'paid', amount: Number(amount), time };
    const updated = [...entries, entry];
    saveChat(num, updated);
    addRecent(name, amount, num);
    const hist = await addHistoryEntry('paid', name, amount, num);
    return hist;
  };

  // Ensure reliable navigation to chat after Done
  const goToChatAfterPayment = (numberDigits, name, amt) => {
    try {
      const clean = String(numberDigits).replace(/\D/g,'');
      if (amt != null) addPaymentToChat(clean, name || generateDisplayName(clean), amt);
      setActiveNumber(clean);
      setActiveName(name || generateDisplayName(clean));
      setChatAmount(String(amt || ''));
      setTimeout(() => setStep(21), 0);
    } catch (_) {
      setStep(21);
    }
  };

  // Alternative: return to Home after payment
  const goToHomeAfterPayment = async (numberDigits, name, amt) => {
    try {
      const clean = String(numberDigits).replace(/\D/g,'');
      if (amt != null) await addPaymentToChat(clean, name || generateDisplayName(clean), amt);
      // Navigate back to PhonePe Home
      setTimeout(() => setStep(0), 0);
    } catch (_) {
      setStep(0);
    }
  };

  useEffect(()=>{ speak(t(language,'k_tap_send_money'), language); },[language]);

  // Handle deep link from History: /send-money/phonepe?chat=1&name=...&number=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('chat') === '1') {
        const name = params.get('name') || '';
        const number = (params.get('number') || '').replace(/\D/g,'');
        if (number || name) {
          setActiveName(name || generateDisplayName(number));
          setActiveNumber(number);
          setChatAmount('');
          setStep(21); // open chat view
        }
      }
      if (params.get('detail') === '1') {
        // Open detailed payment confirmation screen populated from query
        const name = params.get('name') || '';
        const number = (params.get('number') || '').replace(/\D/g,'');
        const amountParam = params.get('amount');
        const type = params.get('type') || 'paid';
        setActiveName(name || generateDisplayName(number));
        setActiveNumber(number);
        setChatAmount(String(amountParam || ''));
        // Step 20 shows the Transaction Successful card UI
        setStep(20);
      }
      const stepParam = params.get('step');
      if (stepParam) {
        const s = parseInt(stepParam, 10);
        if (!Number.isNaN(s)) setStep(s);
      }
    } catch (_) {}
  }, []);

  // Load transactions from backend when History screen is opened
  useEffect(() => {
    let cancelled = false;
    async function loadTransactions() {
      try {
        if (token && step === 22) {
          const resp = await api.getTransactions(token, 20);
          const items = (resp.items || []).map((it) => ({
            id: String(it._id || it.id),
            type: it.type,
            name: it.name,
            number: it.number,
            amount: it.amount,
            when: formatRelative(it.createdAt),
            createdAt: it.createdAt,
            status: it.status || (it.type === 'received' ? 'Credited to' : it.type === 'failed' ? 'Failed' : 'Debited from')
          }));
          if (!cancelled) setServerTransactions(items);
        } else if (step === 22) {
          if (!cancelled) setServerTransactions([]);
        }
      } catch (_) {
        if (!cancelled) setServerTransactions([]);
      }
    }
    loadTransactions();
    return () => { cancelled = true; };
  }, [step, token]);

  const render = () => {
    console.log('Current step:', step, 'showPin:', showPin);
    
    // Step 19: First success screen with tick animation
    if (step === 19) {
      console.log('Rendering step 19 - Green success screen with tick animation');
      const now = new Date();
      const dateStr = now.toLocaleString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:true });
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#15803d',display:'flex',alignItems:'center',justifyContent:'center',zIndex:60}}>
          <div style={{textAlign:'center',color:'#fff'}}>
            {/* Animated tick circle */}
            <div style={{
              width:96,
              height:96,
              borderRadius:'50%',
              background:'#fff',
              margin:'0 auto 16px',
              display:'flex',
              alignItems:'center',
              justifyContent:'center',
              animation:'pulse 0.6s ease-in-out'
            }}>
              {/* Animated tick */}
              <div style={{
                width:48,
                height:48,
                border:'6px solid #16a34a',
                borderTop:'none',
                borderLeft:'none',
                transform:'rotate(45deg) translateY(-8px)',
                animation:'tickDraw 0.8s ease-in-out 0.3s both'
              }} />
            </div>
            
            {/* Success text */}
            <div style={{fontWeight:900,fontSize:24,marginBottom:8}}>Payment Successful</div>
            <div style={{fontSize:16,opacity:0.9}}>{dateStr} at {timeStr}</div>
          </div>
          
          {/* CSS Animations */}
          <style jsx>{`
            @keyframes pulse {
              0% { transform: scale(0.8); opacity: 0; }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); opacity: 1; }
            }
            @keyframes tickDraw {
              0% { 
                width: 0; 
                height: 0; 
                border-width: 0;
                transform: rotate(45deg) translateY(-8px);
              }
              50% { 
                width: 24; 
                height: 24; 
                border-width: 3px;
                transform: rotate(45deg) translateY(-4px);
              }
              100% { 
                width: 48; 
                height: 48; 
                border-width: 6px;
                transform: rotate(45deg) translateY(-8px);
              }
            }
          `}</style>
        </div>
      );
    }
    
    // Step 20: Detailed payment confirmation screen
    if (step === 20) {
      console.log('Rendering step 20 - Detailed payment screen');
      const digits = (activeNumber || unknownNumber || recipient);
      const displayName = activeName || generateDisplayName(String(digits).replace(/\D/g,''));
      const amountToPay = chatAmount || amount || 1;
      const now = new Date();
      const dateStr = now.toLocaleString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:true });
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#065f46',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Payment Successful Header */}
          <div style={{padding:'40px 20px 20px',textAlign:'center',color:'#fff'}}>
            <div style={{width:96,height:96,borderRadius:'50%',background:'#fff',margin:'0 auto 16px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <div style={{width:48,height:48,border:'6px solid #16a34a',borderTop:'none',borderLeft:'none',transform:'rotate(45deg) translateY(-8px)'}} />
            </div>
            <div style={{fontWeight:900,fontSize:24}}>Payment Successful</div>
            <div style={{marginTop:8,fontSize:16}}>{dateStr} at {timeStr}</div>
          </div>

          {/* Payment Details Card */}
          <div style={{flex:1,padding:'0 20px',display:'flex',flexDirection:'column'}}>
            <div className="card" style={{background:'#111827',color:'#e5e7eb',padding:'20px',borderRadius:'16px',marginBottom:'16px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:48,height:48,borderRadius:'50%',background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900}}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900,fontSize:18}}>{displayName}</div>
                  <div style={{color:'#9ca3af',fontSize:14}}>+91{String(digits).replace(/\D/g,'')}</div>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:12}}>
                <div style={{fontWeight:900,fontSize:24}}>₹{amountToPay}</div>
                <div style={{color:'#7c3aed',fontWeight:800,fontSize:14}}>Split Expense</div>
              </div>
              <div style={{display:'flex',gap:12,marginTop:16}}>
                <button className="card" style={{flex:1,background:'#7c3aed',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px'}}>
                  <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>📄</div>
                  <span style={{fontWeight:800}}>View Details</span>
                </button>
                <button className="card" style={{flex:1,background:'#7c3aed',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px'}}>
                  <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>📤</div>
                  <span style={{fontWeight:800}}>Share Receipt</span>
                </button>
              </div>
            </div>

            {/* Advertisement Card */}
            <div className="card" style={{background:'#4c1d95',color:'#fff',padding:'20px',borderRadius:'16px',marginBottom:'20px'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                <div style={{width:40,height:40,borderRadius:'8px',background:'#6d28d9',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>📈</div>
                <div>
                  <div style={{fontWeight:900,fontSize:16}}>share.market</div>
                  <div style={{fontSize:12,color:'#c4b5fd'}}>A PhonePe Product</div>
                </div>
              </div>
              <div style={{fontWeight:900,fontSize:18,marginBottom:8}}>
                Invest in India's top stocks with just <span style={{color:'#22c55e'}}>₹1,000</span>
              </div>
              <button className="card" style={{background:'#6d28d9',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',gap:8,padding:'12px',marginTop:12}}>
                <span style={{fontWeight:800}}>Download now</span>
                <div style={{width:20,height:20,background:'#fff',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center'}}>→</div>
              </button>
            </div>
          </div>

          {/* Bottom Done Button */}
          <div style={{padding:'0 20px 20px'}}>
            <button className="btn" style={{width:'100%',background:'#111827',color:'#7c3aed',fontWeight:900,padding:'16px',cursor:'pointer'}} onClick={()=> goToHomeAfterPayment(digits, displayName, amountToPay)}>
              Done
            </button>
          </div>
        </div>
      );
    }
    
    // Step 22: History screen
    if (step === 22) {
      console.log('Rendering step 22 - History screen');
      const now = new Date();
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false });
      
      // Build dynamic transaction history from saved history + recents fallback
      const savedHistory = loadHistory();
      const lastSnap = (()=>{ try { return JSON.parse(localStorage.getItem('phonepe_last_payment')||'null'); } catch { return null; } })();
      const recentTransactions = recents.slice(0, 8).map((recent, index) => ({
        id: `recent_${index}`,
        type: recent.direction === 'received' ? 'received' : 'paid',
        name: recent.name,
        amount: recent.amount,
        time: 'today',
        status: recent.direction === 'received' ? 'Credited to' : 'Debited from',
        icon: recent.direction === 'received' ? '↓' : '↑'
      }));
      let base = serverTransactions.length ? serverTransactions : (savedHistory.length ? savedHistory : (lastSnap ? [lastSnap] : []));
      // Ensure latest local payment is included immediately
      if (lastPayment) {
        const exists = base.some(x => x.id === lastPayment.id);
        if (!exists) base = [lastPayment, ...base];
      }
      // compute display list with relative times if possible
      const transactionHistory = base.map((tx) => ({
        ...tx,
        when: tx.when || formatRelative(tx.createdAt),
      }));
      const withRecents = [...transactionHistory, ...recentTransactions].slice(0, 20);
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#0b0b0b',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Header */}
          <div style={{background:'#0b0b0b',padding:'20px 16px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={()=>setStep(0)} style={{background:'none',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer'}}>←</button>
              <div style={{color:'#fff',fontWeight:900,fontSize:24}}>History</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'16px'}}>?</div>
              <button style={{background:'#374151',color:'#fff',border:'none',padding:'8px 12px',borderRadius:'16px',fontSize:'12px',display:'flex',alignItems:'center',gap:'4px'}}>
                My Statements
                <span>↓</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{padding:'0 16px 16px'}}>
            <div style={{background:'#1f2937',borderRadius:'12px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{color:'#9ca3af',fontSize:'16px'}}>🔍</div>
              <input 
                placeholder="Search transactions" 
                style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:'14px'}}
              />
              <div style={{color:'#9ca3af',fontSize:'16px'}}>⚙️</div>
            </div>
          </div>

          {/* Transaction List */}
          <div style={{flex:1,padding:'0 16px',overflowY:'auto'}}>
            {withRecents.map((transaction, index) => (
              <div key={transaction.id} style={{
                background:'#111827',
                borderRadius:'12px',
                padding:'16px',
                marginBottom:'12px',
                display:'flex',
                alignItems:'center',
                gap:'12px'
              }}>
                {/* Transaction Icon */}
                <div style={{width:40,height:40,borderRadius:'8px',background: transaction.type === 'received' ? '#10b981' : transaction.type === 'failed' ? '#ef4444' : '#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'18px',fontWeight:900}}>
                  {transaction.type === 'received' ? '↓' : transaction.type === 'failed' ? '!' : '↑'}
                </div>
                
                {/* Transaction Details */}
                <div style={{flex:1}}>
                  <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'4px'}}>
                    {transaction.type === 'received' ? `Received from ${transaction.name}` : transaction.type === 'failed' ? `Payment to ${transaction.name}` : `Paid to ${transaction.name}`}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                    <span style={{color:'#9ca3af',fontSize:12}}>{transaction.status}</span>
                    <div style={{width:16,height:16,borderRadius:'50%',background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10}}>i</div>
                  </div>
                </div>
                
                {/* Amount and Time */}
                <div style={{textAlign:'right'}}>
                  <div style={{color:'#fff',fontWeight:900,fontSize:16,marginBottom:'4px'}}>₹{transaction.amount}</div>
                  <div style={{color:'#6b7280',fontSize:12}}>{transaction.when || transaction.time}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Navigation */}
          <div style={{background:'#1f2937',padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'space-around',minHeight:'60px'}}>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(0)}>
              <span style={{fontSize:'20px'}}>🏠</span>
              <span style={{fontSize:'10px'}}>Home</span>
            </button>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(23)}>
              <span style={{fontSize:'20px'}}>🔍</span>
              <span style={{fontSize:'10px'}}>Search</span>
            </button>
            <button style={{width:48,height:48,borderRadius:'50%',background:'#7c3aed',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,margin:'0 8px'}} onClick={()=>setStep(10)}>
              ⬛
            </button>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(24)}>
              <span style={{fontSize:'20px'}}>🔔</span>
              <span style={{fontSize:'10px'}}>Alerts</span>
            </button>
            <a href="/history" style={{color:'#fff',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
              <span style={{fontSize:'20px'}}>🕐</span>
              <span style={{fontSize:'10px'}}>History</span>
            </a>
          </div>
        </div>
      );
    }
    
    // Step 23: Search screen
    if (step === 23) {
      console.log('Rendering step 23 - Search screen');
      const now = new Date();
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false });
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#0b0b0b',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Header */}
          <div style={{background:'#0b0b0b',padding:'20px 16px 16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <button onClick={()=>setStep(0)} style={{background:'none',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer'}}>←</button>
              <div style={{color:'#fff',fontWeight:900,fontSize:24}}>Search</div>
            </div>
            
            {/* Search Bar */}
            <div style={{background:'#1f2937',borderRadius:'20px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{color:'#9ca3af',fontSize:16}}>🔍</div>
              <input 
                placeholder="Search for 'contacts'" 
                style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:14}}
              />
            </div>
          </div>

          {/* Search For Section */}
          <div style={{flex:1,padding:'0 16px'}}>
            <div style={{color:'#9ca3af',fontSize:12,fontWeight:700,letterSpacing:1,marginBottom:'16px'}}>SEARCH FOR</div>
            
            {/* Service Buttons Grid */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
              {[
                'Mobile Recharge', 'Loan Repayment', 'Free Credit Score', 'Refer & Earn ₹200',
                'Electricity', 'FASTag', 'Mutual Funds', 'Wallet', 'Gold Daily Savings'
              ].map((service, index) => (
                <button 
                  key={service}
                  style={{
                    background:'#1f2937',
                    color:'#fff',
                    border:'none',
                    borderRadius:'12px',
                    padding:'16px 12px',
                    fontSize:'14px',
                    fontWeight:600,
                    textAlign:'left',
                    cursor:'pointer',
                    gridColumn: service === 'Gold Daily Savings' ? '1 / -1' : 'auto'
                  }}
                  onClick={() => {
                    // Handle service selection
                    console.log('Selected service:', service);
                  }}
                >
                  {service}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div style={{background:'#1f2937',padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'space-around',minHeight:'60px'}}>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(0)}>
              <span style={{fontSize:'20px'}}>🏠</span>
              <span style={{fontSize:'10px'}}>Home</span>
            </button>
            <button style={{color:'#fff',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(23)}>
              <span style={{fontSize:'20px'}}>🔍</span>
              <span style={{fontSize:'10px'}}>Search</span>
            </button>
            <button style={{width:48,height:48,borderRadius:'50%',background:'#7c3aed',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,margin:'0 8px'}} onClick={()=>setStep(10)}>
              ⬛
            </button>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(24)}>
              <span style={{fontSize:'20px'}}>🔔</span>
              <span style={{fontSize:'10px'}}>Alerts</span>
            </button>
            <a href="/history" style={{color:'#9ca3af',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
              <span style={{fontSize:'20px'}}>🕐</span>
              <span style={{fontSize:'10px'}}>History</span>
            </a>
          </div>
        </div>
      );
    }
    
    // Step 24: Alerts screen
    if (step === 24) {
      console.log('Rendering step 24 - Alerts screen');
      const now = new Date();
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false });
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#0b0b0b',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Header */}
          <div style={{background:'#0b0b0b',padding:'20px 16px 16px'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={()=>setStep(0)} style={{background:'none',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer'}}>←</button>
              <div style={{color:'#fff',fontWeight:900,fontSize:24}}>Alerts</div>
            </div>
          </div>

          {/* Main Content - All Caught Up */}
          <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'40px 20px'}}>
            {/* Mailbox Illustration */}
            <div style={{marginBottom:'24px',position:'relative'}}>
              {/* Mailbox */}
              <div style={{
                width:120,
                height:80,
                background:'#ec4899',
                borderRadius:'8px 8px 0 0',
                position:'relative',
                marginBottom:'8px'
              }}>
                {/* Mailbox door */}
                <div style={{
                  position:'absolute',
                  right:0,
                  top:0,
                  width:40,
                  height:80,
                  background:'#be185d',
                  borderRadius:'0 8px 0 0'
                }} />
                {/* Mailbox flag */}
                <div style={{
                  position:'absolute',
                  right:8,
                  top:-8,
                  width:20,
                  height:16,
                  background:'#a855f7',
                  borderRadius:'4px 4px 0 0',
                  transform:'rotate(-15deg)'
                }} />
              </div>
              
              {/* Base/Post */}
              <div style={{
                width:60,
                height:20,
                background:'#6b7280',
                borderRadius:'4px',
                margin:'0 auto'
              }} />
            </div>
            
            {/* All Caught Up Text */}
            <div style={{color:'#fff',fontSize:18,fontWeight:600,textAlign:'center'}}>
              All caught up
            </div>
          </div>

          {/* Bottom Navigation */}
          <div style={{background:'#1f2937',padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'space-around',minHeight:'60px'}}>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(0)}>
              <span style={{fontSize:'20px'}}>🏠</span>
              <span style={{fontSize:'10px'}}>Home</span>
            </button>
            <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(23)}>
              <span style={{fontSize:'20px'}}>🔍</span>
              <span style={{fontSize:'10px'}}>Search</span>
            </button>
            <button style={{width:48,height:48,borderRadius:'50%',background:'#7c3aed',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,margin:'0 8px'}} onClick={()=>setStep(10)}>
              ⬛
            </button>
            <button style={{color:'#fff',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(24)}>
              <span style={{fontSize:'20px'}}>🔔</span>
              <span style={{fontSize:'10px'}}>Alerts</span>
            </button>
            <a href="/history" style={{color:'#9ca3af',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
              <span style={{fontSize:'20px'}}>🕐</span>
              <span style={{fontSize:'10px'}}>History</span>
            </a>
          </div>
        </div>
      );
    }
    
    // Step 25: Check Balance screen
    if (step === 25) {
      console.log('Rendering step 25 - Check Balance screen');
      const now = new Date();
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:false });
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#0b0b0b',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Status Bar */}
          {/* <div style={{background:'#000',color:'#fff',padding:'8px 16px',fontSize:'12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>{timeStr}</div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <span>31.0 KB/S</span>
              <span>Vo LTE</span>
              <span>4G</span>
              <span>📶</span>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <span style={{color:'#22c55e'}}>💰</span>
              <span>92%</span>
            </div>
          </div> */}

          {/* Header */}
          <div style={{background:'#0b0b0b',padding:'20px 16px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={()=>setStep(0)} style={{background:'none',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer'}}>←</button>
              <div style={{color:'#fff',fontWeight:900,fontSize:24}}>Check Balance</div>
            </div>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'16px'}}>?</div>
          </div>

          {/* Promotional Banner */}
          <div style={{padding:'0 16px 16px'}}>
            <div style={{background:'#1f2937',borderRadius:'12px',padding:'16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{flex:1}}>
                <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'4px'}}>Enjoy 10% savings*</div>
                <div style={{color:'#9ca3af',fontSize:12}}>Apply for PhonePe SBI Card</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:'#fff',display:'flex',alignItems:'center',justifyContent:'center',color:'#1f2937',fontSize:12}}>→</div>
                {/* Credit Cards */}
                <div style={{position:'relative',width:60,height:40}}>
                  <div style={{position:'absolute',top:0,left:0,width:50,height:32,background:'#1e40af',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:8,fontWeight:800}}>
                    पे<br/>sbi card
                  </div>
                  <div style={{position:'absolute',top:4,left:8,width:50,height:32,background:'#7c3aed',borderRadius:'6px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:8,fontWeight:800}}>
                    पे
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Account Options */}
          <div style={{flex:1,padding:'0 16px'}}>
            {/* State Bank of India */}
            <button 
              onClick={() => setStep(26)} 
              style={{background:'#111827',borderRadius:'12px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px',width:'100%',border:'none',cursor:'pointer'}}
            >
              <div style={{width:40,height:40,borderRadius:'50%',background:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:800}}>
                SBI
              </div>
              <div style={{flex:1,textAlign:'left'}}>
                <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'2px'}}>State Bank of India - 0518</div>
                <div style={{color:'#9ca3af',fontSize:12}}>Bank Account</div>
              </div>
              <div style={{color:'#9ca3af',fontSize:16}}>→</div>
            </button>

            {/* UPI Lite */}
            <div style={{background:'#111827',borderRadius:'12px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16}}>⚡</div>
              <div style={{flex:1}}>
                <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'2px'}}>UPI Lite</div>
                <div style={{color:'#9ca3af',fontSize:12}}>Pin-less payments up to ₹1,000</div>
              </div>
              <button style={{background:'#7c3aed',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'20px',fontSize:12,fontWeight:800}}>
                Try Now
              </button>
            </div>

            {/* PhonePe Wallet */}
            <div style={{background:'#111827',borderRadius:'12px',padding:'16px',marginBottom:'12px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16}}>👛</div>
              <div style={{flex:1}}>
                <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'2px'}}>PhonePe Wallet</div>
                <div style={{color:'#9ca3af',fontSize:12}}>Balance: ₹0</div>
              </div>
              <button style={{background:'#7c3aed',color:'#fff',border:'none',padding:'8px 16px',borderRadius:'20px',fontSize:12,fontWeight:800}}>
                Activate
              </button>
            </div>

            {/* Add UPI account */}
            <div style={{background:'#111827',borderRadius:'12px',padding:'16px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'12px'}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16}}>+</div>
              <div style={{flex:1}}>
                <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'2px'}}>Add UPI account</div>
                <div style={{color:'#9ca3af',fontSize:12}}>RuPay card, bank account & more</div>
              </div>
              <div style={{color:'#9ca3af',fontSize:16}}>→</div>
            </div>
          </div>

          {/* Bottom Promotional Banner */}
          <div style={{padding:'0 16px 20px'}}>
            <div style={{background:'#7c3aed',borderRadius:'12px',padding:'20px',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:'8px',right:'16px',color:'#fff',fontSize:10,opacity:0.8}}>*T&C Apply</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{flex:1}}>
                  <div style={{color:'#fff',fontWeight:900,fontSize:18,marginBottom:'8px'}}>
                    Benefits, cashback, reward points & more await!
                  </div>
                  <div style={{color:'#fff',fontSize:14,marginBottom:'12px'}}>
                    Link RuPay Credit Card to UPI, pay & claim
                  </div>
                  <button style={{background:'#fff',color:'#7c3aed',border:'none',padding:'12px 20px',borderRadius:'20px',fontSize:14,fontWeight:800,display:'flex',alignItems:'center',gap:'8px'}}>
                    Link Now
                    <span>→</span>
                  </button>
                </div>
                {/* Credit Cards */}
                <div style={{position:'relative',width:80,height:50}}>
                  <div style={{position:'absolute',top:0,left:0,width:60,height:40,background:'#3b82f6',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10,fontWeight:800}}>
                    RuPay<br/>UPI
                  </div>
                  <div style={{position:'absolute',top:8,left:12,width:20,height:20,borderRadius:'50%',background:'#fbbf24',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12}}>⭐</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 26: PIN Entry screen for State Bank of India
    if (step === 26) {
      console.log('Rendering step 26 - PIN Entry screen');
      
      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#fff',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Header */}
          <div style={{background:'#fff',padding:'20px 16px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e5e7eb'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={()=>setStep(25)} style={{background:'none',border:'none',color:'#374151',fontSize:'18px',cursor:'pointer'}}>←</button>
              <div style={{color:'#111827',fontWeight:800,fontSize:18}}>State Bank Of India</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
              <div style={{color:'#6b7280',fontSize:14}}>XXXX0518</div>
              <div style={{width:40,height:24,background:'#1e40af',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10,fontWeight:800}}>
                UPI
              </div>
            </div>
          </div>

          {/* UPI Logo Section */}
          <div style={{padding:'20px 16px',textAlign:'center',background:'#f9fafb'}}>
            <div style={{color:'#1e40af',fontWeight:900,fontSize:24,marginBottom:'4px'}}>UPI</div>
            <div style={{color:'#6b7280',fontSize:12,fontWeight:600}}>UNIFIED PAYMENTS INTERFACE</div>
          </div>

          {/* Transaction Details */}
          <div style={{padding:'20px 16px',background:'#fff'}}>
            {/* <div style={{marginBottom:'16px'}}>
              <div style={{color:'#374151',fontSize:16,marginBottom:'4px'}}>To: Gonti Ramesh</div>
              <div style={{color:'#111827',fontWeight:800,fontSize:20}}>Sending: ₹200.00</div>
            </div> */}
            
            {/* PIN Entry Prompt */}
            <div style={{textAlign:'center',marginBottom:'20px'}}>
              <div style={{color:'#111827',fontWeight:800,fontSize:18,marginBottom:'16px'}}>ENTER 6-DIGIT UPI PIN</div>
              
              {/* PIN Input Fields */}
              <div style={{display:'flex',justifyContent:'center',gap:'8px',marginBottom:'20px'}}>
                {[1,2,3,4,5,6].map((digit, index) => (
                  <div key={index} style={{
                    width:40,
                    height:40,
                    border:'2px solid #d1d5db',
                    borderRadius:'8px',
                    display:'flex',
                    alignItems:'center',
                   justifyContent:'center',
                    fontSize:'18px',
                    fontWeight:800,
                    color:'#111827'
                  }}>
                    {pin && pin.length > index ? '•' : ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Warning Message */}
            {/* <div style={{background:'#fef3c7',border:'1px solid #f59e0b',borderRadius:'8px',padding:'12px',marginBottom:'20px'}}>
              <div style={{color:'#92400e',fontSize:14,fontWeight:600}}>
                You are transferring money from your State Bank Of India account to Gonti Ramesh.
              </div>
            </div> */}
          </div>

          {/* Numeric Keypad */}
          <div style={{flex:1,background:'#f9fafb',padding:'20px 16px'}}>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'16px',maxWidth:'300px',margin:'0 auto'}}>
              {/* Numbers 1-9 */}
              {[1,2,3,4,5,6,7,8,9].map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    if (pin.length < 6) {
                      setPin(prev => prev + num.toString());
                    }
                  }}
                  style={{
                    width:'100%',
                    height:60,
                    background:'#fff',
                    border:'1px solid #e5e7eb',
                    borderRadius:'12px',
                    fontSize:'24px',
                    fontWeight:800,
                    color:'#111827',
                    cursor:'pointer',
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                  }}
                >
                  {num}
                </button>
              ))}
              
              {/* Bottom row: Backspace, 0, Submit */}
              <button
                onClick={() => setPin(prev => prev.slice(0, -1))}
                style={{
                  width:'100%',
                  height:60,
                  background:'#f3f4f6',
                  border:'1px solid #e5e7eb',
                  borderRadius:'12px',
                  fontSize:'18px',
                  fontWeight:800,
                  color:'#6b7280',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
              >
                ✕
              </button>
              
              <button
                onClick={() => {
                  if (pin.length < 6) {
                    setPin(prev => prev + '0');
                  }
                }}
                style={{
                  width:'100%',
                  height:60,
                  background:'#fff',
                  border:'1px solid #e5e7eb',
                  borderRadius:'12px',
                  fontSize:'24px',
                  fontWeight:800,
                  color:'#111827',
                  cursor:'pointer',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
              >
                0
              </button>
              
              <button
                onClick={() => {
                  if (pin.length === 6) {
                    // PIN entered successfully, go to SBI balance screen
                    setStep(27);
                  }
                }}
                style={{
                  width:'100%',
                  height:60,
                  background:pin.length === 6 ? '#1e40af' : '#e5e7eb',
                  border:'none',
                  borderRadius:'12px',
                  fontSize:'18px',
                  fontWeight:800,
                  color:pin.length === 6 ? '#fff' : '#9ca3af',
                  cursor:pin.length === 6 ? 'pointer' : 'not-allowed',
                  display:'flex',
                  alignItems:'center',
                  justifyContent:'center'
                }}
              >
                ✓
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Step 27: SBI Bank Balance screen (after PIN submit)
    if (step === 27) {
      console.log('Rendering step 27 - SBI Bank Balance');
      const now = new Date();
      const dateStr = now.toLocaleString('en-GB', { day:'2-digit', month:'long', year:'numeric' });
      const timeStr = now.toLocaleString('en-GB', { hour:'2-digit', minute:'2-digit', hour12:true });

      // Mock balance and recent entries (can be wired to real data later)
      const currentBalance = '₹ 12,450.75';
      const miniStatements = [
        { label: 'UPI CREDIT', amount: '+₹1,200.00', color: '#16a34a', meta: 'GPay • 2:10 PM' },
        { label: 'ATM WITHDRAWAL', amount: '-₹2,000.00', color: '#ef4444', meta: 'SBI ATM • 10:02 AM' },
        { label: 'INTEREST', amount: '+₹45.25', color: '#16a34a', meta: 'Savings • Yesterday' },
        { label: 'UPI DEBIT', amount: '-₹350.00', color: '#ef4444', meta: 'PhonePe • Yesterday' },
      ];

      return (
        <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'#ffffff',display:'flex',flexDirection:'column',zIndex:60}}>
          {/* Header */}
          <div style={{background:'#ffffff',padding:'20px 16px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid #e5e7eb'}}>
            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
              <button onClick={()=>setStep(25)} style={{background:'none',border:'none',color:'#374151',fontSize:'18px',cursor:'pointer'}}>←</button>
              <div>
                <div style={{color:'#111827',fontWeight:800,fontSize:18}}>State Bank Of India</div>
                <div style={{color:'#6b7280',fontSize:12}}>XXXX0518 • UPI Linked</div>
              </div>
            </div>
            <button onClick={()=>setStep(26)} style={{background:'#f3f4f6',border:'1px solid #e5e7eb',borderRadius:8,padding:'6px 10px',color:'#374151',fontWeight:700,cursor:'pointer'}}>Check PIN</button>
          </div>

          {/* Balance Card */}
          <div style={{padding:'16px'}}>
            <div style={{background:'#0b0b0b',borderRadius:16,color:'#e5e7eb',padding:'20px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  <div style={{width:40,height:40,borderRadius:'50%',background:'#1e40af',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900}}>SBI</div>
                  <div>
                    <div style={{fontWeight:900}}>Savings Account</div>
                    <div style={{fontSize:12,color:'#9ca3af'}}>XXXX 0518</div>
                  </div>
                </div>
                <button style={{background:'#111827',border:'1px solid #1f2937',color:'#e5e7eb',borderRadius:999,padding:'8px 12px',fontWeight:800,cursor:'pointer'}}>Refresh</button>
              </div>
              <div style={{marginTop:16,color:'#9ca3af',fontSize:12}}>Available Balance</div>
              <div style={{fontSize:32,fontWeight:900,marginTop:4,color:'#ffffff'}}>{currentBalance}</div>
              <div style={{marginTop:8,color:'#9ca3af',fontSize:12}}>As of {dateStr} at {timeStr}</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{padding:'0 16px'}}>
            <div style={{display:'flex',gap:12}}>
              <button style={{flex:1,background:'#1e40af',color:'#fff',border:'none',borderRadius:12,padding:'12px',fontWeight:800,cursor:'pointer'}}>Download Statement</button>
              <button style={{flex:1,background:'#111827',color:'#e5e7eb',border:'1px solid #1f2937',borderRadius:12,padding:'12px',fontWeight:800,cursor:'pointer'}}>View Passbook</button>
            </div>
          </div>

          {/* Mini Statement */}
          <div style={{padding:'16px',marginTop:12}}>
            <div style={{fontWeight:900,color:'#111827',marginBottom:8}}>Mini Statement</div>
            <div style={{background:'#ffffff',border:'1px solid #e5e7eb',borderRadius:12}}>
              {miniStatements.map((tx, idx) => (
                <div key={idx} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',borderBottom: idx<miniStatements.length-1 ? '1px solid #e5e7eb' : 'none'}}>
                  <div>
                    <div style={{fontWeight:800,color:'#111827'}}>{tx.label}</div>
                    <div style={{fontSize:12,color:'#6b7280'}}>{tx.meta}</div>
                  </div>
                  <div style={{fontWeight:900,color:tx.color}}>{tx.amount}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom nav (back to accounts) */}
          <div style={{padding:'16px'}}>
            <button onClick={()=>setStep(25)} className="btn" style={{width:'100%',background:'#111827',color:'#e5e7eb',fontWeight:900,padding:'14px',borderRadius:12}}>Back to Accounts</button>
          </div>
        </div>
      );
    }
    
    if (step === 0) {
      console.log('Rendering step 0 - Title screen');
      return (
      <div className="fade-up" style={{borderRadius:16,overflow:'hidden',background:'#0b0220'}}>
        {/* Top banner */}
        <div style={{padding:'16px'}}>
          <div style={{height:140,borderRadius:16,background:'#2d0d5f',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px'}}>
            <div style={{color:'#fff',fontWeight:900,fontSize:18,maxWidth:200}}>
              11 days of
              <br/>security at just ₹11
            </div>
            <div style={{width:120,height:100,borderRadius:16,background:'#4c1d95'}} />
          </div>
        </div>

        {/* Money Transfers */}
        <div style={{background:'#0a0a0a',borderTopLeftRadius:24,borderTopRightRadius:24,padding:'16px'}}>
          <div style={{color:'#e5e7eb',fontWeight:800}}>Money Transfers</div>
          <div className="grid" style={{gridTemplateColumns:'repeat(4, minmax(0,1fr))',gap:12,marginTop:12}}>
            <button className="card" onClick={()=>{ setStep(11); speak(t(language,'k_choose_app_send'), language); }} style={{background:'#2e1065',color:'#e9d5ff',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'#5b21b6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>📞</div>
              <div style={{fontSize:12,fontWeight:700,marginTop:8,textAlign:'center'}}>To Mobile
                <br/>Number
              </div>
            </button>
            <button className="card" onClick={()=>setStep(28)} style={{background:'#2e1065',color:'#e9d5ff',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'#5b21b6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>🏦</div>
              <div style={{fontSize:12,fontWeight:700,marginTop:8,textAlign:'center'}}>To Bank &
                <br/>Self A/c
              </div>
            </button>
            <button className="card" onClick={()=>setStep(29)} style={{background:'#2e1065',color:'#e9d5ff',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'#5b21b6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>📣</div>
              <div style={{fontSize:12,fontWeight:700,marginTop:8,textAlign:'center'}}>Refer &
                <br/>Invite Now
              </div>
            </button>
            <button className="card" onClick={()=>setStep(25)} style={{background:'#2e1065',color:'#e9d5ff',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
              <div style={{width:56,height:56,borderRadius:'50%',background:'#5b21b6',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>₹</div>
              <div style={{fontSize:12,fontWeight:700,marginTop:8,textAlign:'center'}}>Check
                <br/>Balance
              </div>
            </button>
          </div>

          {/* Recharge & Bills (compact mock) */}
          <div className="card" style={{marginTop:16,background:'#111827',color:'#e5e7eb'}}>
            <div className="flex items-center justify-between">
              <div style={{fontWeight:800}}>Recharge & Bills</div>
              <div style={{color:'#a78bfa',fontWeight:800}}>View All</div>
            </div>
            <div className="grid" style={{gridTemplateColumns:'repeat(4, minmax(0,1fr))',gap:12,marginTop:12}}>
              {['Mobile','FASTag','Electricity','Loan'].map(label => (
                <div key={label} className="card" style={{background:'#1f2937',color:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',padding:12}}>
                  <div>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto'}}>⚡</div>
                    <div style={{fontSize:12,fontWeight:700,marginTop:8,textAlign:'center'}}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div style={{position:'sticky',bottom:0,background:'#0b0220',padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'space-around',minHeight:'60px'}}>
          <button style={{color:'#e5e7eb',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
            <span style={{fontSize:'20px'}}>🏠</span>
            <span style={{fontSize:'10px'}}>Home</span>
          </button>
          <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(23)}>
            <span style={{fontSize:'20px'}}>🔍</span>
            <span style={{fontSize:'10px'}}>Search</span>
          </button>
          <button className="btn" onClick={()=>{ setStep(10); speak(t(language,'k_align_qr'), language); }} style={{borderRadius:'50%',width:48,height:48,background:'#6d28d9',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,margin:'0 8px'}}>⬛</button>
          <button style={{color:'#9ca3af',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}} onClick={()=>setStep(24)}>
            <span style={{fontSize:'20px'}}>🔔</span>
            <span style={{fontSize:'10px'}}>Alerts</span>
          </button>
          <a href="/history" style={{color:'#9ca3af',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
            <span style={{fontSize:'20px'}}>🕐</span>
            <span style={{fontSize:'10px'}}>History</span>
          </a>
        </div>
      </div>
    );
    }
    // Step 28: Send Money to Bank / Self Account screen
    if (step === 28) return (
      <div className="card" style={{background:'#0b0b0b'}}>
        <div className="flex items-center" style={{gap:8,marginBottom:12}}>
          <button className="card" onClick={()=>setStep(0)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
          <div className="text-xl font-extrabold" style={{color:'#e5e7eb'}}>Send Money</div>
          <div style={{marginLeft:'auto',color:'#9ca3af'}}>?</div>
        </div>
        <div style={{color:'#22c55e',fontWeight:900,marginBottom:4}}>Zero wait time • Zero fee</div>
        <div style={{color:'#9ca3af',marginBottom:16}}>Add recipient and pay up to ₹1 lakh per day instantly.</div>

        <div className="grid" style={{gridTemplateColumns:'repeat(2, minmax(0,1fr))',gap:12}}>
          <button className="card" style={{background:'#111827',color:'#e5e7eb',padding:16,textAlign:'left'}} onClick={()=>setStep(26)}>
            <div style={{width:48,height:48,borderRadius:12,background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>🖼️</div>
            <div style={{fontWeight:800}}>To Self Bank
              <br/>Account
            </div>
          </button>
          <button className="card" style={{background:'#111827',color:'#e5e7eb',padding:16,textAlign:'left'}} onClick={()=>setStep(14)}>
            <div style={{width:48,height:48,borderRadius:12,background:'#7c3aed',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>🏦</div>
            <div style={{fontWeight:800}}>To Account
              <br/>Number & IFSC
            </div>
          </button>
        </div>

        <div className="card" style={{background:'#111827',color:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 16px',marginTop:16}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:18,background:'#374151',display:'flex',alignItems:'center',justifyContent:'center'}}>@</div>
            <div>
              <div style={{fontWeight:800}}>To UPI ID or Number</div>
              <div style={{color:'#9ca3af',fontSize:12}}>Transfer to any UPI app</div>
            </div>
          </div>
          <button className="card" onClick={()=>setStep(11)} style={{padding:'6px 10px'}}>→</button>
        </div>
      </div>
    );

    // Step 29: Invite Now screen
    if (step === 29) return (
      <div className="card" style={{background:'#5b21b6'}}>
        <div className="flex items-center" style={{gap:8,marginBottom:12}}>
          <button className="card" onClick={()=>setStep(0)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
          <div className="text-xl font-extrabold" style={{color:'#fff'}}>Invite Now</div>
          <div style={{marginLeft:'auto',color:'#fff'}}>?</div>
        </div>
        <div style={{color:'#fff',fontWeight:900,fontSize:24,marginTop:8}}>Invite Now</div>
        <div style={{color:'#e9d5ff',marginTop:8}}>Help your family & friends make cashless payments using PhonePe</div>
        <div className="card" style={{marginTop:16,background:'#7c3aed',color:'#fff',display:'inline-flex',alignItems:'center',gap:8,padding:'8px 12px'}}>How to refer a friend ▶</div>

        <div style={{marginTop:24,color:'#fff',fontWeight:800}}>Invite</div>
        <div style={{display:'flex',gap:12,marginTop:12}}>
          {['Whatsapp','Sms','Email','More'].map((label) => (
            <div key={label} className="card" style={{background:'#7c3aed',color:'#fff',padding:'10px 12px',borderRadius:12}}>{label}</div>
          ))}
        </div>

        <div style={{marginTop:24,color:'#fff',fontWeight:800}}>Suggested contacts</div>
        <div style={{display:'flex',gap:12,marginTop:12,flexWrap:'wrap'}}>
          {['AC','BE','CS','DM'].map((initials,idx)=> (
            <div key={idx} className="card" style={{background:'#7c3aed',color:'#fff',width:56,height:56,borderRadius:28,display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900}}>{initials}</div>
          ))}
        </div>
      </div>
    );
    if (step === 10) return (
      <QRScannerMock onSimulate={()=>{ setRecipient('Merchant Store'); setStep(2); speak(t(language,'k_check_name_confirm'), language); }} />
    );
    if (step === 11) return (
      <div className="card" style={{background:'#0b0b0b'}}>
        <div className="flex items-center" style={{gap:8,marginBottom:12}}>
          <button className="card" onClick={()=>setStep(0)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
          <div className="text-xl font-extrabold" style={{color:'#e5e7eb'}}>Send Money</div>
        </div>
        <div style={{color:'#9ca3af',fontSize:12,marginBottom:8}}>to any UPI app</div>
        <div className="card" style={{background:'#1f2937',display:'flex',alignItems:'center',gap:8,padding:'10px 12px'}}>
          <div>🔍</div>
          <input placeholder="Search any contact / name" onFocus={()=>setStep(12)} onClick={()=>setStep(12)} readOnly style={{flex:1,background:'transparent',color:'#e5e7eb',outline:'none',border:'none',cursor:'text'}} />
        </div>
        <div className="card" style={{marginTop:12,background:'#111827',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:8,background:'#374151',display:'flex',alignItems:'center',justifyContent:'center'}}>🧾</div>
            <div>
              <div style={{color:'#e5e7eb',fontWeight:800}}>Split Expenses</div>
              <div style={{color:'#9ca3af',fontSize:12}}>Track & settle with friends</div>
            </div>
          </div>
          <div style={{color:'#22d3ee',fontWeight:800}}>New</div>
        </div>
        <div style={{color:'#9ca3af',fontSize:12,letterSpacing:1,marginTop:16}}>PAYMENTS & CHAT</div>
        <div className="space-y-2" style={{marginTop:8}}>
          {recents.slice(0,5).map((item,idx)=> (
            <button key={item.name+idx} className="card" onClick={()=>{ const num = (item.number || contacts.find(c=>c.name.toLowerCase()===item.name.toLowerCase())?.number || '').replace(/\D/g,''); setActiveName(item.name); setActiveNumber(num); setChatAmount(''); setStep(15); }} style={{background:'#111827',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800}}>{item.name[0]}</div>
                <div style={{textAlign:'left'}}>
                  <div style={{color:'#e5e7eb',fontWeight:800}}>{item.name}</div>
                  <div style={{color:'#9ca3af',fontSize:12}}>₹{item.amount} - {item.direction === 'received' ? 'Received' : 'Sent'} Instantly</div>
                </div>
              </div>
              {idx % 2 === 0 && <div style={{width:10,height:10,borderRadius:'50%',background:'#22c55e'}} />}
            </button>
          ))}
        </div>
        <div style={{position:'sticky',bottom:12,display:'flex',justifyContent:'center',marginTop:16}}>
          <button className="btn" onClick={()=>{ setStep(1); speak(t(language,'k_type_mobile_upi'), language); }} style={{background:'#7c3aed'}}>
            + New Payment
          </button>
        </div>
      </div>
    );
    if (step === 12) return (
      <div className="card" style={{background:'#0b0b0b'}}>
        <div className="flex items-center" style={{gap:8,marginBottom:12}}>
          <button className="card" onClick={()=>setStep(11)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
          <input autoFocus value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search number or name" style={{flex:1,background:'transparent',color:'#e5e7eb',outline:'none',borderBottom:'2px solid #7c3aed',padding:'8px 4px'}} />
        </div>
        <button className="card" onClick={()=>{ setStep(1); speak(t(language,'k_type_mobile_upi'), language); }} style={{background:'#111827',display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:24,textAlign:'center'}}>🔢</div>
          <div style={{color:'#a78bfa',fontWeight:900}}>New Mobile Number</div>
        </button>
        <div style={{height:1,background:'#1f2937',margin:'12px 0'}} />
        <div style={{color:'#9ca3af',fontSize:12,letterSpacing:1,marginBottom:8}}>RECENTS</div>
        <div className="space-y-2">
          {recents
            .filter(r => {
              if (!searchQuery) return true;
              const q = searchQuery.toLowerCase();
              const digits = searchQuery.replace(/\D/g,'');
              const nameMatch = r.name.toLowerCase().includes(q);
              const numberMatch = digits
                ? contacts.some(c => c.name.toLowerCase() === r.name.toLowerCase() && c.number.includes(digits))
                : false;
              return nameMatch || numberMatch;
            })
            .map((item,idx)=> (
            <button key={item.name+idx} className="card" onClick={()=>{ const num = (item.number || contacts.find(c=>c.name.toLowerCase()===item.name.toLowerCase())?.number || '').replace(/\D/g,''); setActiveName(item.name); setActiveNumber(num); setChatAmount(''); setStep(15); }} style={{background:'#111827',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800}}>{(item.name.replace(/[^A-Za-z]/g,'')||'U').slice(0,2).toUpperCase()}</div>
                <div style={{textAlign:'left'}}>
                  <div style={{color:'#e5e7eb',fontWeight:800}}>{highlightName(item.name, searchQuery)}</div>
                  {(() => { const digits = searchQuery.replace(/\D/g,''); const contact = contacts.find(c => c.name.toLowerCase() === item.name.toLowerCase()); return digits && contact && contact.number.includes(digits) ? (
                    <div style={{color:'#9ca3af',fontSize:12}}>{highlightDigits(contact.number, digits)}</div>
                  ) : null; })()}
                  <div style={{color:'#9ca3af',fontSize:12}}>You: ₹{item.amount} - {item.direction === 'received' ? 'Received Instantly' : 'Sent Securely'}</div>
                </div>
              </div>
              <div style={{color:'#9ca3af',fontSize:12}}>{item.date}</div>
            </button>
          ))}
        </div>
        {(() => {
          const digits = searchQuery.replace(/\D/g,'');
          const isTen = digits.length === 10;
          const known = contacts.some(c => c.number === digits);
          if (isTen && !known) {
            const full = `+91${digits}`;
            const blocked = isBlocked(digits);
            return (
              <div className="card" style={{marginTop:12,background:'#111827'}}>
                <div style={{color:'#9ca3af',marginBottom:8}}>Search Results</div>
                <button className="card" disabled={blocked} onClick={()=>{ setUnknownNumber(digits); setActiveNumber(digits); setActiveName(generateDisplayName(digits)); setChatAmount(''); setStep(14); }} style={{display:'flex',alignItems:'center',gap:12,opacity:blocked?0.6:1}}>
                  <div style={{width:48,height:48,borderRadius:'50%',background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#e5e7eb'}}>👤</div>
                  <div style={{textAlign:'left'}}>
                    <div style={{color:'#e5e7eb',fontWeight:800}}>{blocked ? 'Blocked' : 'Unknown'}</div>
                    <div style={{color:'#9ca3af'}}>{full}</div>
                    {!blocked && <div style={{color:'#a78bfa',fontWeight:800,marginTop:4}}>Tap to select</div>}
                  </div>
                </button>
              </div>
            );
          }
          return null;
        })()}
        {searchQuery && (
          <>
            <div style={{height:1,background:'#1f2937',margin:'12px 0'}} />
            <div style={{color:'#9ca3af',fontSize:12,letterSpacing:1,marginBottom:8}}>ALL CONTACTS</div>
            <div className="space-y-2">
              {contacts
                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.number.includes(searchQuery.replace(/\D/g,'')))
                .map(c => (
                  <button key={c.number} className="card" onClick={()=>{ setActiveNumber(c.number); setActiveName(c.name); setChatAmount(''); setStep(14); }} style={{background:'#111827',display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:40,height:40,borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800}}>{(c.name[0]||'U').toUpperCase()}</div>
                    <div style={{textAlign:'left'}}>
                      <div style={{color:'#e5e7eb',fontWeight:800}}>{highlightName(c.name, searchQuery)}</div>
                      <div style={{color:'#9ca3af',fontSize:12}}>{highlightDigits(c.number, searchQuery.replace(/\D/g,''))}</div>
                    </div>
                  </button>
                ))}
            </div>
          </>
        )}
      </div>
    );
    if (step === 14) {
      const digits = activeNumber || unknownNumber;
      const full = `+91${digits}`;
      const displayName = activeName || generateDisplayName(digits);
      return (
        <div className="card" style={{background:'#0b0b0b'}}>
          <div style={{padding:12,borderRadius:16,background:'#111827',marginBottom:12,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:72,height:72,borderRadius:16,background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#e5e7eb',fontWeight:900}}>RS</div>
            <div style={{color:'#9ca3af',marginTop:12}}>Banking name :</div>
            <div style={{color:'#e5e7eb',fontWeight:900,fontSize:18,marginTop:4}}>{displayName} <span style={{color:'#22c55e'}}>✓</span></div>
            <div style={{color:'#9ca3af',marginTop:4}}>{full}</div>
            <button className="card" style={{marginTop:12}}>+ Save Contact</button>
          </div>
          <div className="card" style={{background:'#111827'}}>
            <div style={{color:'#e5e7eb',fontWeight:900,fontSize:18}}>Number not in your contact</div>
            <div style={{color:'#9ca3af',marginTop:4}}>Review details before money transfer</div>
            <div className="flex items-center justify-between" style={{marginTop:12}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:'#f59e0b',display:'flex',alignItems:'center',justifyContent:'center',color:'#111827',fontWeight:900}}>RS</div>
                <div>
                  <div style={{color:'#e5e7eb',fontWeight:800}}>{displayName}</div>
                  <div style={{color:'#9ca3af'}}>{full}</div>
                </div>
              </div>
              <button className="text-red-600" onClick={()=>setStep(16)} style={{color:'#ef4444',fontWeight:800}}>Block</button>
            </div>
            <div style={{color:'#9ca3af',marginTop:12}}>You don’t have to enter UPI PIN to receive money</div>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
              <button className="btn" onClick={()=>setStep(15)} style={{background:'#7c3aed'}}>Continue to chat & pay</button>
              <button className="card" onClick={()=>setStep(11)} style={{textAlign:'center',fontWeight:800}}>Exit Chat</button>
            </div>
          </div>
        </div>
      );
    }
    if (step === 16) {
      const digits = unknownNumber;
      const full = `+91${digits}`;
      const displayName = generateDisplayName(digits);
      return (
        <div className="fade-up" style={{position:'fixed',left:0,right:0,top:0,bottom:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div className="card" style={{width:360,background:'#0b0b0b'}}>
            <div style={{color:'#e5e7eb',fontWeight:900,fontSize:18,textAlign:'center'}}>Block</div>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginTop:12}}>
              <div style={{width:72,height:72,borderRadius:'50%',background:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:900}}>GR</div>
              <div style={{color:'#e5e7eb',fontWeight:800,marginTop:12}}>{displayName}</div>
              <div style={{color:'#9ca3af'}}>{full}</div>
              <div style={{color:'#9ca3af',marginTop:12,textAlign:'center'}}>This user cannot request or send money to you after blocking</div>
            </div>
            <div className="grid" style={{gridTemplateColumns:'1fr 1fr',gap:8,marginTop:16}}>
              <button className="card" onClick={()=>setStep(14)} style={{fontWeight:800,color:'#a78bfa'}}>Go Back</button>
              <button className="card" onClick={()=>{ setBlockedNumbers(arr=> Array.from(new Set([...arr, unknownNumber]))); setStep(11); }} style={{fontWeight:800,color:'#ef4444'}}>Block</button>
            </div>
          </div>
        </div>
      );
    }
    if (step === 15) {
      const digits = (activeNumber || unknownNumber || recipient);
      const full = `+91${String(digits).replace(/\D/g,'')}`;
      const displayName = activeName || generateDisplayName(String(digits).replace(/\D/g,''));
      return (
        <div className="card" style={{background:'#0b0b0b'}}>
          <div style={{padding:12,borderRadius:16,background:'#111827',marginBottom:12,display:'flex',flexDirection:'column',alignItems:'center'}}>
            <div style={{width:72,height:72,borderRadius:16,background:'#374151',display:'flex',alignItems:'center',justifyContent:'center',color:'#e5e7eb',fontWeight:900}}>RS</div>
            <div style={{color:'#9ca3af',marginTop:12}}>Banking name :</div>
            <div style={{color:'#e5e7eb',fontWeight:900,fontSize:18,marginTop:4}}>{displayName} <span style={{color:'#22c55e'}}>✓</span></div>
            <div style={{color:'#9ca3af',marginTop:4}}>{full}</div>
          </div>
          <div style={{color:'#9ca3af',textAlign:'center',margin:'16px 0'}}>Your messages are secured with 256-bit encryption</div>
          <div className="grid" style={{gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <button className="card">Hi</button>
            <button className="card">Send ₹1</button>
            <button className="card">👋</button>
          </div>
          <div className="card" style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>
            <div style={{fontWeight:900,color:'#22c55e'}}>₹</div>
            <input value={chatAmount} onChange={e=>setChatAmount(e.target.value.replace(/[^0-9]/g,'').slice(0,6))} placeholder="Enter amount or chat" style={{flex:1,border:'none',outline:'none',background:'transparent',color:'#e5e7eb'}} />
            <button className="btn" disabled={!chatAmount} onClick={()=>{ setStep(17); }}>{chatAmount ? 'PAY' : '➤'}</button>
          </div>
        </div>
      );
    }
    if (step === 1) return (
      <div className="card" style={{background:'#0b0b0b'}}>
        <div className="flex items-center" style={{gap:8,marginBottom:12}}>
          <button className="card" onClick={()=>setStep(12)} style={{width:40,height:40,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
          <div className="text-lg font-extrabold" style={{color:'#e5e7eb'}}>Enter mobile number</div>
        </div>
        <div className="card" style={{background:'#111827',marginBottom:12}}>
          <div className="text-2xl font-extrabold" style={{color:'#e5e7eb',textAlign:'center'}}>{formatPhoneDisplay(countryPrefix, phoneInput)}</div>
        </div>
        <div className="space-y-2" style={{marginBottom:12}}>
          {phoneInput && contacts.filter(c => c.number.includes(phoneInput.replace(/\D/g,''))).map(c => (
            <button key={c.number} className="card" onClick={()=>{ setActiveNumber(c.number); setActiveName(c.name); setChatAmount(''); setStep(14); }} style={{background:'#111827',display:'flex',alignItems:'center',gap:12}}>
              <div style={{width:40,height:40,borderRadius:'50%',background:'#334155',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800}}>{(c.name[0]||'U').toUpperCase()}</div>
              <div style={{textAlign:'left'}}>
                <div style={{color:'#e5e7eb',fontWeight:800}}>{c.name}</div>
                <div style={{color:'#9ca3af',fontSize:12}}>{highlightDigits(c.number, phoneInput.replace(/\D/g,''))}</div>
              </div>
            </button>
          ))}
        </div>
        <PhoneKeypad onKey={(k)=>{
            if (k === '+') { setCountryPrefix(p => p === '+91' ? '+' : '+91'); return; }
            setPhoneInput(r => (r + k).replace(/\D/g,'').slice(0,13));
          }}
          onBackspace={()=>setPhoneInput(r=>r.slice(0,-1))}
          onDone={()=>{ const digits = phoneInput.replace(/\D/g,''); if (isValidMobileOrUpi(digits)) { setActiveNumber(digits); setActiveName(generateDisplayName(digits)); setChatAmount(''); setStep(14); } }} />
      </div>
    );
    if (step === 2) return (
      <div className="card">
        <div className="text-xl font-bold">Confirm recipient</div>
        <div className="text-lg mt-2">{recipient || 'John Kumar'}</div>
        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded-xl text-gray-900 font-semibold" onClick={()=>setStep(1)}>Edit</button>
          <button className="btn" onClick={()=>{ setStep(3); speak(t(language,'k_enter_amount'), language); }}>Confirm</button>
        </div>
      </div>
    );
    if (step === 3) return (
      <div className="card">
        <div className="text-xl font-bold">Enter amount</div>
        <div className="text-2xl font-extrabold" style={{margin:'8px 0'}}>₹ {amount || '0'}</div>
        <NumericKeypad onKey={(k)=>setAmount(a=> (a+k).slice(0,7))} onBackspace={()=>setAmount(a=>a.slice(0,-1))} onDone={()=>{ setStep(4); speak(t(language,'k_review_confirm'), language); }} />
      </div>
    );
    if (step === 4) return (
      <div className="card">
        <div className="text-xl font-bold">Payment summary</div>
        <div className="mt-2">To: {recipient || 'John Kumar'}</div>
        <div>Amount: ₹ {amount || '0'}</div>
        <div className="flex justify-between mt-4">
          <button className="px-4 py-2 bg-gray-200 rounded-xl text-gray-900 font-semibold" onClick={()=>setStep(3)}>Back</button>
          <button className="btn" onClick={()=>{ setShowPin(true); speak(t(language,'k_enter_upi_pin'), language); }}>Confirm</button>
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
    console.log('No step condition matched! Current step:', step, 'Returning null');
    return null;
  };

  return (
    <div className="p-4 space-y-4 fade-up">
      {!isFullScreenStep && (<h2 className="text-2xl font-bold">PhonePe – Send Money</h2>)}
      {render()}
      {/* Global PIN modal to ensure it always renders on PAY */}
      <UpiPinModal show={step===17} name={activeName || generateDisplayName(String(activeNumber||unknownNumber||recipient).replace(/\D/g,''))} number={`+91${String(activeNumber||unknownNumber||recipient).replace(/\D/g,'')}`} amount={chatAmount || amount || 1} onClose={(pin)=>{ console.log('MAIN PIN modal onClose called with pin:', pin, 'Current step:', step, 'Setting step to 19'); setStep(19); }} />
      <UpiPinModal show={showPin && step!==17} name={recipient || 'Recipient'} number={recipient || ''} amount={amount || 1} onClose={(pin)=>{ setShowPin(false); setStep(5); }} />
    </div>
  );
}

export default PhonePeFlow;


