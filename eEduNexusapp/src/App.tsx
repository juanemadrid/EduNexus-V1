import React, { useState } from 'react';
import LoginPage from './page';
import DashboardHome from './Dashboard';
import './index.css';

export default function App() {
  const [isLogged, setIsLogged] = useState(false);
  
  if (isLogged) {
    return <DashboardHome />;
  }

  return (
    <div onClick={(e) => {
      // Very basic navigation wrapper for demonstration: click button to enter portal
      if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLInputElement) {
        e.preventDefault();
        setIsLogged(true);
      }
    }}>
      <LoginPage />
    </div>
  );
}
