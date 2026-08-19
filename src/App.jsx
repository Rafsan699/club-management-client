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
import MemberList from './pages/MemberList';
import NoticeView from './pages/NoticeView';
import Founders from './pages/Founders';
import DynamicFormView from './pages/DynamicFormView';
import EntryGate from './pages/EntryGate';

// নতুন মিটিং পেজ কম্পোনেন্টসমূহ আমদানি (আপনার ফোল্ডার পাথ অনুযায়ী ইমপোর্ট এডজাস্ট করে নেবেন)
import MeetingHome from './pages/MeetingHome';
import MeetingEntry from './pages/MeetingEntry';
import MeetingDetailsUser from './pages/MeetingDetailsUser';

// কমন লেআউট কম্পোনেন্ট
const Layout = ({ darkMode, setDarkMode, user, content, handleLogout }) => {
  return (
    <div className={darkMode ? 'dark bg-slate-950 text-slate-100 min-h-screen transition-colors duration-300' : 'bg-[#f8fafc] text-slate-800 min-h-screen transition-colors duration-300'}>
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
  const [content, setContent] = useState(null);
  const [user, setUser] = useState(null);

  // লোকালস্টোরেজ থেকে ডার্ক মোড স্টেট ইনিশিয়ালাইজ করা যাতে সব পেজে কাজ করে
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // ডার্ক মোড পরিবর্তন হলে এইচটিএমএল ক্লাসে অ্যাড করা এবং লোকালস্টোরেজে সেভ করা
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    // লোকালস্টোরেজ থেকে লগইন করা ইউজারের ডাটা চেক করা
    const savedUser = localStorage.getItem('clubUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

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
    <Router>
      <Routes>
        {/* এই রাউটগুলোর ভেতরে সব পেজে একই হেডার দেখাবে */}
        <Route element={
          <Layout 
            darkMode={darkMode} 
            setDarkMode={setDarkMode} 
            user={user} 
            content={content} 
            handleLogout={handleLogout} 
          />
        }>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/registration" element={<Register />} />
          <Route path="/founders" element={<Founders />} />

          {/* ক্লাব মিটিং সংক্রান্ত নতুন রাউটসমূহ */}
          <Route path="/activities/meetings" element={<MeetingHome />} />
          <Route path="/activities/meetings/entry" element={<MeetingEntry />} />
          <Route path="/activities/meetings/view" element={<MeetingDetailsUser />} />
        </Route>

        {/* আলাদা পেজ যেমন অ্যাডমিন বা লগইন */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/news" element={<Newsfeed />} />
        <Route path="/members/list" element={<MemberList />} />
        <Route path="/notice/general" element={<NoticeView />} />
        <Route path="/notice/registration" element={<EntryGate />} />
        
        {/* পাথ এক করার জন্য এখানে /dynamic-form এবং /Access-Form দুটোই সাপোর্ট রাখা হলো */}
        <Route path="/dynamic-form" element={<DynamicFormView />} />
        <Route path="/Access-Form" element={<DynamicFormView />} />
      </Routes>
    </Router>
  );
}

export default App;