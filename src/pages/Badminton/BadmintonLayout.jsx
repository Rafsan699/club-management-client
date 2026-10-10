import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BadmintonHeader from './BadmintonHeader';
import './badminton.css';

export default function BadmintonLayout({ darkMode, setDarkMode }) {
  const loc = useLocation();
  return (
    <div className="bd">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap" />
      <div className="bd-amb" aria-hidden="true"><i /><i /><i /></div>
      <BadmintonHeader darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="bd-wrap">
        <div className="bd-page" key={loc.pathname}><Outlet /></div>
      </div>
    </div>
  );
}