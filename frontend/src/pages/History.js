import React from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

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

function loadLocalHistory() {
  try { return JSON.parse(localStorage.getItem('phonepe_history')||'[]'); } catch { return []; }
}
function loadLastSnap() {
  try { return JSON.parse(localStorage.getItem('phonepe_last_payment')||'null'); } catch { return null; }
}
function loadRecents() {
  try { return JSON.parse(localStorage.getItem('phonepe_recents')||'[]'); } catch { return []; }
}

export default function History() {
  const { token } = useAuth();
  const [items, setItems] = React.useState([]);
  const [q, setQ] = React.useState('');

  React.useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (token) {
          const resp = await api.getTransactions(token, 50);
          const mapped = (resp.items || []).map((it) => ({
            id: String(it._id || it.id),
            type: it.type,
            name: it.name,
            number: it.number,
            amount: it.amount,
            when: formatRelative(it.createdAt),
            status: it.status || (it.type === 'received' ? 'Credited to' : it.type === 'failed' ? 'Failed' : 'Debited from')
          }));
          // Merge with local fallback and last snap for immediate UX
          let base = mapped;
          const local = loadLocalHistory();
          if (!base.length && local.length) base = local;
          const last = loadLastSnap();
          if (last && !base.some(b => b.id === last.id)) base = [last, ...base];
          const recents = loadRecents().slice(0, 6).map((r, idx) => ({
            id: `recent_${idx}`,
            type: r.direction === 'received' ? 'received' : 'paid',
            name: r.name,
            amount: r.amount,
            when: 'today',
            status: r.direction === 'received' ? 'Credited to' : 'Debited from'
          }));
          if (!cancelled) setItems([...base, ...recents].slice(0, 50));
          return;
        }
      } catch (_) {}
      let base = loadLocalHistory();
      const last = loadLastSnap();
      if (!base.length && last) base = [last];
      const recents = loadRecents().slice(0, 6).map((r, idx) => ({
        id: `recent_${idx}`,
        type: r.direction === 'received' ? 'received' : 'paid',
        name: r.name,
        amount: r.amount,
        when: 'today',
        status: r.direction === 'received' ? 'Credited to' : 'Debited from'
      }));
      if (!cancelled) setItems([...base, ...recents].slice(0, 50));
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const filtered = items.filter(tx => !q || (tx.name||'').toLowerCase().includes(q.toLowerCase()));

  return (
    <div style={{position:'relative'}}>
      {/* Header like PhonePe */}
      <div style={{background:'#0b0b0b',padding:'20px 16px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',borderRadius:16}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <button onClick={()=>window.history.back()} style={{background:'none',border:'none',color:'#fff',fontSize:'18px',cursor:'pointer'}}>←</button>
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
      <div style={{padding:'16px 16px 8px'}}>
        <div style={{background:'#1f2937',borderRadius:'12px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
          <div style={{color:'#9ca3af',fontSize:'16px'}}>🔍</div>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search transactions" style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:'14px'}} />
          <div style={{color:'#9ca3af',fontSize:'16px'}}>⚙️</div>
        </div>
      </div>

      {/* Transaction List */}
      <div style={{padding:'0 16px 80px'}}>
        {filtered.map(tx => (
          <a key={tx.id} href={`/send-money/phonepe?detail=1&type=${encodeURIComponent(tx.type||'paid')}&name=${encodeURIComponent(tx.name||'')}&number=${encodeURIComponent(tx.number||'')}&amount=${encodeURIComponent(String(tx.amount||''))}`} style={{
            background:'#111827',
            borderRadius:'12px',
            padding:'16px',
            marginBottom:'12px',
            display:'flex',
            alignItems:'center',
            gap:'12px',
            color:'inherit',
            textDecoration:'none'
          }}>
            <div style={{width:40,height:40,borderRadius:'8px',background: tx.type === 'received' ? '#10b981' : tx.type === 'failed' ? '#ef4444' : '#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:'18px',fontWeight:900}}>
              {tx.type === 'received' ? '↓' : tx.type === 'failed' ? '!' : '↑'}
            </div>
            <div style={{flex:1}}>
              <div style={{color:'#fff',fontWeight:800,fontSize:16,marginBottom:'4px'}}>
                {tx.type === 'received' ? `Received from ${tx.name}` : tx.type === 'failed' ? `Payment to ${tx.name}` : `Paid to ${tx.name}`}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
                <span style={{color:'#9ca3af',fontSize:12}}>{tx.when}</span>
                <div style={{width:16,height:16,borderRadius:'50%',background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:10}}>i</div>
              </div>
            </div>
            <div style={{textAlign:'right'}}>
              <div style={{color:'#fff',fontWeight:900,fontSize:16,marginBottom:'4px'}}>₹{tx.amount}</div>
              <div style={{color:'#6b7280',fontSize:12}}>{tx.status}</div>
            </div>
          </a>
        ))}
        {!filtered.length && (
          <div className="card" style={{background:'#111827',color:'#9ca3af',padding:16,borderRadius:12}}>No transactions yet</div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div style={{background:'#1f2937',padding:'12px 8px',display:'flex',alignItems:'center',justifyContent:'space-around',minHeight:'60px',position:'sticky',bottom:0,borderRadius:16}}>
        <a href="/send-money/phonepe?step=0" style={{color:'#9ca3af',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
          <span style={{fontSize:'20px'}}>🏠</span>
          <span style={{fontSize:'10px'}}>Home</span>
        </a>
        <a href="/send-money/phonepe?step=23" style={{color:'#9ca3af',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
          <span style={{fontSize:'20px'}}>🔍</span>
          <span style={{fontSize:'10px'}}>Search</span>
        </a>
        <a href="/send-money/phonepe?step=10" style={{width:48,height:48,borderRadius:'50%',background:'#7c3aed',border:'none',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:16,margin:'0 8px',textDecoration:'none'}}>⬛</a>
        <a href="/send-money/phonepe?step=24" style={{color:'#9ca3af',fontWeight:700,textDecoration:'none',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
          <span style={{fontSize:'20px'}}>🔔</span>
          <span style={{fontSize:'10px'}}>Alerts</span>
        </a>
        <button style={{color:'#fff',fontWeight:700,background:'none',border:'none',cursor:'pointer',display:'flex',flexDirection:'column',alignItems:'center',gap:'4px',minWidth:'60px'}}>
          <span style={{fontSize:'20px'}}>🕐</span>
          <span style={{fontSize:'10px'}}>History</span>
        </button>
      </div>
    </div>
  );
}


