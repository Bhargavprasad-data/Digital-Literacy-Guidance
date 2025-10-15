import React from 'react';
import { useHistory } from 'react-router-dom';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function FoodOrderSelect() {
  const history = useHistory();
  const { language } = useLanguage();
  React.useEffect(()=>{ speak(t(language, 'k_choose_food_app'), language); }, [language]);
  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">{t(language, 'k_choose_food_app', 'Choose Food App')}</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="btn" onClick={()=>history.push('/order-food/swiggy')}>Swiggy</button>
        <button className="btn" onClick={()=>history.push('/order-food/zomato')}>Zomato</button>
        <button className="btn" onClick={()=>history.push('/order-food/blinkit')}>Blinkit</button>
        <button className="btn" onClick={()=>history.push('/order-food/dominos')}>Domino's</button>
      </div>
    </div>
  );
}

export default FoodOrderSelect;


