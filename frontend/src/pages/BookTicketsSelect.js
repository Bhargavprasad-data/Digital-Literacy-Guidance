import React from 'react';
import { useHistory } from 'react-router-dom';
import { speak } from '../services/voice';
import { useLanguage } from '../contexts/LanguageContext';
import { t } from '../i18n';

function BookTicketsSelect() {
  const history = useHistory();
  const { language } = useLanguage();

  React.useEffect(()=>{ speak(t(language, 'k_choose_ticket_type'), language); }, [language]);

  return (
    <div className="p-4 space-y-4 fade-up">
      <h2 className="text-2xl font-bold">{t(language, 'k_choose_ticket_type', 'Choose Ticket Type')}</h2>
      <div className="grid grid-cols-2 gap-4">
        <button className="btn" onClick={()=>history.push('/book-tickets/movies')}>{t(language, 'k_movie_tickets', 'Movie Tickets')}</button>
        <button className="btn" onClick={()=>history.push('/book-tickets/train')}>{t(language, 'k_train_tickets', 'Train Tickets')}</button>
        <button className="btn" onClick={()=>history.push('/book-tickets/bus')}>{t(language, 'k_bus_tickets', 'Bus Tickets')}</button>
        <button className="btn" onClick={()=>history.push('/book-tickets/flights')}>{t(language, 'k_flight_tickets', 'Flight Tickets')}</button>
      </div>
    </div>
  );
}

export default BookTicketsSelect;


