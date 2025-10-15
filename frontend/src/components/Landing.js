import React from 'react';
import { Link } from 'react-router-dom';

function FeatureCard({ title, desc, icon }) {
  return (
    <div className="card fade-up" style={{textAlign:'center'}}>
      <div style={{width:64,height:64,margin:'0 auto 12px',borderRadius:16,background:'#4F46E5',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:800}}>
        {icon}
      </div>
      <div className="text-xl font-bold" style={{color:'#0f172a'}}>{title}</div>
      <div className="text-gray-700 mt-2" style={{fontSize:16}}>{desc}</div>
    </div>
  );
}

function Landing() {
  return (
    <div className="app-shell" style={{minHeight:'100vh'}}>
      <header style={{display:'flex',alignItems:'center',justifyContent:'space-between',maxWidth:960,margin:'0 auto',padding:'20px 16px'}}>
        <div style={{color:'#fff',fontWeight:900,fontSize:24}}>Digital Inclusion</div>
        <nav style={{display:'flex',gap:24,color:'#e5e7eb'}}>
          <a href="#features">Features</a>
          <a href="#practice">Practice Mode</a>
          <a href="#team">Our Team</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>
      <section style={{maxWidth:960,margin:'0 auto',padding:'36px 16px',display:'grid',gridTemplateColumns:'1.2fr 1fr',gap:24,alignItems:'center'}}>
        <div>
          <h1 className="fade-up" style={{fontSize:48,lineHeight:1.1,color:'#fff',fontWeight:900,margin:0}}>Empowering<br/>Digital Literacy</h1>
          <p style={{color:'#e5e7eb',fontSize:18,marginTop:16,maxWidth:520}}>An intuitive, icon-driven, and voice-guided mobile app for all users.</p>
          <Link to="/login" className="btn" style={{display:'inline-block',marginTop:24}}>Get Started</Link>
        </div>
        <div className="fade-up" style={{justifySelf:'center'}}>
          <div style={{width:280,height:420,borderRadius:32,background:'#1e40af',boxShadow:'0 20px 40px rgba(0,0,0,0.25)',position:'relative'}}>
            <div style={{position:'absolute',left:24,top:24,width:60,height:60,borderRadius:16,background:'#3b82f6',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:28}}>🔊</div>
            <div style={{position:'absolute',right:-30,bottom:40,width:120,height:120,borderRadius:'50%',background:'rgba(59,130,246,0.4)'}} />
          </div>
        </div>
      </section>
      <section id="features" style={{maxWidth:960,margin:'0 auto',padding:'24px 16px 64px'}}>
        <h2 className="fade-up" style={{color:'#fff',fontWeight:900,fontSize:32,marginBottom:16}}>Key Features</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
          <FeatureCard title="Voice Guidance" desc="Step-by-step voice instructions in multiple languages." icon="🎙️" />
          <FeatureCard title="Icon-Driven Interface" desc="Simple and intuitive icons for easy navigation." icon="🟦" />
          <FeatureCard title="Practice Mode" desc="Interactive simulations for hands-on learning." icon="✅" />
        </div>
      </section>
    </div>
  );
}

export default Landing;



