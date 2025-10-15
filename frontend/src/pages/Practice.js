import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

function Practice() {
  const [amount, setAmount] = useState('');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState('');
  const { token } = useAuth();

  const simulate = async (e) => {
    e.preventDefault();
    if (!amount || !pin) {
      setStatus('Please enter amount and a 4-digit PIN');
      return;
    }
    
    try {
      // Save practice log to backend if user is logged in
      if (token) {
        await api.savePracticeLog(token, {
          type: 'send_money',
          payload: { amount: parseFloat(amount), simulated: true }
        });
      }
      
      setStatus('Simulated: Money sent safely (no real transaction).');
    } catch (error) {
      setStatus('Simulated: Money sent safely (no real transaction).');
      console.error('Failed to save practice log:', error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Practice Mode</h2>
      <form onSubmit={simulate} className="bg-white rounded-2xl p-4 shadow border space-y-3">
        <label className="block">
          <span className="text-lg font-semibold">Amount</span>
          <input type="number" className="mt-1 w-full border rounded-xl p-3 text-lg" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Enter amount" />
        </label>
        <label className="block">
          <span className="text-lg font-semibold">UPI PIN</span>
          <input type="password" className="mt-1 w-full border rounded-xl p-3 text-lg tracking-widest" value={pin} onChange={(e)=>setPin(e.target.value)} placeholder="****" maxLength={4} />
        </label>
        <button type="submit" className="w-full bg-primary text-white rounded-xl py-3 text-xl font-bold">Practice Send</button>
        {status && <div className="text-green-700 text-lg">{status}</div>}
      </form>
    </div>
  );
}

export default Practice;