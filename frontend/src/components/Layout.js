import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LanguageSelector from './LanguageSelector';

const NavButton = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`px-4 py-2 text-lg font-semibold ${
        isActive ? 'text-primary' : 'text-gray-500'
      }`}
      aria-label={label}
    >
      {label}
    </Link>
  );
};

function Layout({ children }) {
  const { user, logout } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const canGoBack = location.pathname !== '/home' && location.pathname !== '/';

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 max-w-md mx-auto w-full p-3 elevated" style={{borderRadius:'0 0 16px 16px',background:'rgba(255,255,255,0.97)'}}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {canGoBack && (
              <button
                aria-label="Go back"
                onClick={() => history.goBack()}
                className="px-2 py-1 text-primary"
                style={{fontSize:20,fontWeight:800}}
              >
                ←
              </button>
            )}
            <Link to="/home" className="text-xl font-extrabold text-primary">Digital Guide</Link>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <div className="text-sm text-gray-600">
              {user?.name}
              <button onClick={logout} className="ml-2 text-primary text-xs">Logout</button>
            </div>
          </div>
        </div>
        <nav className="flex items-center justify-center gap-2 mt-2" style={{flexWrap:'wrap'}}>
          <NavButton to="/home" label="Home" />
          {/* <NavButton to="/history" label="History" /> */}
          <NavButton to="/practice" label="Practice" />
          <NavButton to="/help" label="Help" />
        </nav>
      </header>
      <main className="flex-1 max-w-md mx-auto w-full" style={{padding:'16px'}}>
        {children}
      </main>
    </div>
  );
}

export default Layout;