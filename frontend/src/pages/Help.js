import React, { useState } from 'react';

function Help() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const ask = (e) => {
    e.preventDefault();
    // Simple stubbed responses
    if (question.toLowerCase().includes('send money')) {
      setAnswer('Open your UPI app, tap Send, enter amount, confirm with PIN.');
    } else if (question.toLowerCase().includes('book')) {
      setAnswer('Open RedBus, search route, choose seat, pay securely.');
    } else {
      setAnswer('I can help with sending money, booking tickets, and ordering food.');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Help</h2>
      <form onSubmit={ask} className="bg-white rounded-2xl p-4 shadow border space-y-3">
        <input value={question} onChange={(e)=>setQuestion(e.target.value)} className="w-full border rounded-xl p-3 text-lg" placeholder="Ask: How to send money?" />
        <button type="submit" className="w-full bg-primary text-white rounded-xl py-3 text-xl font-bold">Ask</button>
      </form>
      {answer && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-lg">
          {answer}
        </div>
      )}
    </div>
  );
}

export default Help;