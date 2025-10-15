import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

const APPS = [
  { id: 'phonepe', name: 'PhonePe' },
  { id: 'gpay', name: 'Google Pay' },
  { id: 'paytm', name: 'Paytm' },
];

function SendMoneySelect() {
  const history = useHistory();
  const { language } = useLanguage();

  useEffect(() => { speak(t(language,'k_choose_app_send'), language); }, [language]);

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">{t(language,'k_choose_app_send','Choose App for Send Money')}</h2>
      <div className="grid grid-cols-2 gap-4">
        {APPS.map(x => (
          <button key={x.id} className="btn" onClick={() => history.push(`/send-money/${x.id}`)}>{x.name}</button>
        ))}
      </div>
    </div>
  );
}

export default SendMoneySelect;


