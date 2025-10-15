import React from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './components/Landing';
import Home from './pages/Home';
import SendMoneySelect from './pages/SendMoneySelect';
import PhonePeFlow from './pages/PhonePeFlow';
import GPayFlow from './pages/GPayFlow';
import PaytmFlow from './pages/PaytmFlow';
import Practice from './pages/Practice';
import Help from './pages/Help';
import Login from './pages/Login';
import ChooseLanguage from './pages/ChooseLanguage';
import BookTicketsSelect from './pages/BookTicketsSelect';
import MoviesFlow from './pages/MoviesFlow';
import TrainFlow from './pages/TrainFlow';
import BusFlow from './pages/BusFlow';
import FlightsFlow from './pages/FlightsFlow';
import FoodOrderSelect from './pages/FoodOrderSelect';
import SwiggyFlow from './pages/SwiggyFlow';
import ZomatoFlow from './pages/ZomatoFlow';
import BlinkitFlow from './pages/BlinkitFlow';
import DominosFlow from './pages/DominosFlow';
import History from './pages/History';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route path="/login" component={Login} />
          <Route path="/choose-language" component={ChooseLanguage} />
          <Redirect to="/" />
        </Switch>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Layout>
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/home" />} />
          <Route path="/home" component={Home} />
          <Route exact path="/send-money" component={SendMoneySelect} />
          <Route path="/send-money/phonepe" component={PhonePeFlow} />
          <Route path="/send-money/gpay" component={GPayFlow} />
          <Route path="/send-money/paytm" component={PaytmFlow} />
          <Route exact path="/book-tickets" component={BookTicketsSelect} />
          <Route path="/book-tickets/movies" component={MoviesFlow} />
          <Route path="/book-tickets/train" component={TrainFlow} />
          <Route path="/book-tickets/bus" component={BusFlow} />
          <Route path="/book-tickets/flights" component={FlightsFlow} />
          <Route exact path="/order-food" component={FoodOrderSelect} />
          <Route path="/order-food/swiggy" component={SwiggyFlow} />
          <Route path="/order-food/zomato" component={ZomatoFlow} />
          <Route path="/order-food/blinkit" component={BlinkitFlow} />
          <Route path="/order-food/dominos" component={DominosFlow} />
          <Route path="/choose-language" component={ChooseLanguage} />
          <Route path="/practice" component={Practice} />
          <Route path="/history" component={History} />
          <Route path="/help" component={Help} />
          <Route path="/login" render={() => <Redirect to="/home" />} />
        </Switch>
      </Layout>
    </BrowserRouter>
  );
}

export default App;