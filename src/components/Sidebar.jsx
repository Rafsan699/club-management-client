import React, { useState } from 'react';

const Sidebar = ({ onSelectFeature }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    "Club Information", "All Department", "Committee List", "General Member List",
    "Meeting", "Sports Week Calendar", "Event Management", "Cricket", "Football",
    "Volleyball", "Badminton", "Chess", "Carrom", "Champion Teams", "Champion Players", "All Documents"
  ];

  return (
    <>
      {/* 3 Icon Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed top-4 left-4 z-50 p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Left Sidebar Drawer */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto p-5 pt-16`}>
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2">Menu</h2>
        <div className="flex flex-col gap-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => { onSelectFeature(item); setIsOpen(false); }}
              className="text-left px-3 py-2 rounded hover:bg-blue-600 transition duration-200 text-sm font-medium"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default Sidebar;