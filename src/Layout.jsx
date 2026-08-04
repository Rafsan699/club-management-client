import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import axios from 'axios';

const Layout = () => {
  const [content, setContent] = useState(null);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // ইউজারের ডাটা লোকালস্টোরেজ থেকে লোড করা
    const savedUser = localStorage.getItem('clubUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // ব্যাকএন্ড থেকে কন্টেন্ট বা লোগো ফেচ করা (প্রয়োজন হলে)
    axios.get('/api/content')
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
    <div>
      {/* Navbar এ প্রয়োজনীয় প্রপসগুলো পাস করা হলো */}
      <Navbar 
        content={content} 
        user={user} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        handleLogout={handleLogout} 
      />
      
      {/* পেজের মূল কন্টেন্ট লোড হওয়ার জায়গা */}
      <main className="pt-24">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;