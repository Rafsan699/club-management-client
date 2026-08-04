import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import AboutUs from './pages/AboutUs';
import Events from './pages/Events';
import Team from './pages/Team';
import Contact from './pages/Contact';
import Newsfeed from './pages/Newsfeed';

// কমন লেআউট কম্পোনেন্ট
const Layout = () => {
  const [content, setContent] = useState(null);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // লোকালস্টোরেজ থেকে লগইন করা ইউজারের ডাটা চেক করা
    const savedUser = localStorage.getItem('clubUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // ব্যাকএন্ড রাউটের সাথে মিল রেখে /api/content থেকে পরিবর্তন করে /api/club/content করা হয়েছে
    axios.get('/api/club/content')
      .then(res => {
        if (res.data) setContent(res.data);
      })
      .catch(err => console.error("Error fetching content:", err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('clubUser');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <div className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen' : 'bg-[#f8fafc] text-slate-800 min-h-screen'}>
      {/* কমন হেডার/নেভবার */}
      <Navbar 
        content={content} 
        user={user} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        handleLogout={handleLogout} 
      />
      
      {/* মূল পেজের কন্টেন্ট */}
      <main className="pt-28">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* এই রাউটগুলোর ভেতরে সব পেজে একই হেডার দেখাবে */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration" element={<Register />} />
        </Route>

        {/* আলাদা পেজ যেমন অ্যাডমিন বা লগইন */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<Newsfeed />} />
      </Routes>
    </Router>
  );
}

export default App;