import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Trash2, Plus, Lock } from 'lucide-react';

const initialContentState = {
  universityName: '',
  clubTitle: '',
  logoUrl: '',
  objective: '',
  flashNews: '',
  copyrightText: '',
  convener: { name: '', role: '', dept: '', image: '' },
  activities: [],
  members: [],
  contact: { phone: '', hotline: '', email: '', address: '' },
  departments: []
};

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [content, setContent] = useState(initialContentState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await API.get('/api/content');
        if (res.data) {
          setContent(prev => ({
            ...initialContentState,
            ...res.data,
            contact: { ...initialContentState.contact, ...(res.data.contact || {}) },
            convener: { ...initialContentState.convener, ...(res.data.convener || {}) },
            members: res.data.members || [],
            departments: res.data.departments || [],
            activities: res.data.activities || []
          }));
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'adminbriusc123') {
      setIsAuthenticated(true);
    } else {
      alert('Wrong Password!');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put('/api/content', content);
      alert('Changes saved successfully to database!');
    } catch (err) {
      console.error(err);
      alert('Failed to save changes.');
    }
  };

  const handleAddMember = () => {
    if (content.members && content.members.length >= 10) {
      alert('সর্বোচ্চ ১০ জন মেম্বার যোগ করা যাবে!');
      return;
    }
    const newMember = { name: '', role: '', dept: '', img: '' };
    setContent({
      ...content,
      members: [...(content.members || []), newMember]
    });
  };

  const handleRemoveMember = (index) => {
    const updatedMembers = content.members.filter((_, i) => i !== index);
    setContent({ ...content, members: updatedMembers });
  };

  const handleMemberChange = (index, field, value) => {
    const updatedMembers = [...(content.members || [])];
    updatedMembers[index][field] = value;
    setContent({ ...content, members: updatedMembers });
  };

  const handleAddDepartment = () => {
    const newDept = { name: '', logo: '' };
    setContent({
      ...content,
      departments: [...(content.departments || []), newDept]
    });
  };

  const handleRemoveDepartment = (index) => {
    const updatedDepts = content.departments.filter((_, i) => i !== index);
    setContent({ ...content, departments: updatedDepts });
  };

  const handleDeptChange = (index, field, value) => {
    const updatedDepts = [...(content.departments || [])];
    updatedDepts[index][field] = value;
    setContent({ ...content, departments: updatedDepts });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-12 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-800">
          <h2 className="text-4xl text-white mb-8 font-extrabold flex items-center gap-3">
            <Lock className="w-10 h-10 text-emerald-500" /> Admin Login
          </h2>
          <label className="block text-base font-semibold text-slate-300 mb-3">Password</label>
          <input 
            type="password" 
            placeholder="Enter Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-4 mb-6 bg-slate-800 text-white text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
          />
          <button type="submit" className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-lg">
            Login to Dashboard
          </button>
        </form>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center p-12 text-2xl font-bold text-white bg-slate-950 min-h-screen flex items-center justify-center">
        Loading Admin Panel...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 lg:p-12">
      <div className="w-full max-w-7xl mx-auto bg-slate-900 p-6 sm:p-10 lg:p-14 rounded-3xl shadow-2xl border border-slate-800">
        <h1 className="text-4xl sm:text-5xl font-black mb-10 text-emerald-400 border-b border-slate-800 pb-6 tracking-wide">
          Club Management Dashboard
        </h1>
        
        <form onSubmit={handleUpdate} className="space-y-10">
          
          {/* Header Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block mb-3 text-lg font-bold text-slate-200">University Name:</label>
              <input 
                type="text" 
                value={content.universityName || ''} 
                onChange={(e) => setContent({...content, universityName: e.target.value})}
                className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block mb-3 text-lg font-bold text-slate-200">Club Title:</label>
              <input 
                type="text" 
                value={content.clubTitle || ''} 
                onChange={(e) => setContent({...content, clubTitle: e.target.value})}
                className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block mb-3 text-lg font-bold text-slate-200">Logo URL:</label>
            <input 
              type="text" 
              value={content.logoUrl || ''} 
              onChange={(e) => setContent({...content, logoUrl: e.target.value})}
              className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block mb-3 text-lg font-bold text-slate-200">Objective:</label>
            <textarea 
              value={content.objective || ''} 
              onChange={(e) => setContent({...content, objective: e.target.value})}
              className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
              rows="4"
            />
          </div>

          {/* CONTACT & ADDRESS SECTION */}
          <div className="bg-slate-800/40 p-8 rounded-2xl border border-emerald-500/30">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6">📍 Contact & Address Information (Footer)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Phone Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 01774948849"
                  value={content.contact?.phone || ''} 
                  onChange={(e) => setContent({...content, contact: {...content.contact, phone: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Hotline Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. 01800000000"
                  value={content.contact?.hotline || ''} 
                  onChange={(e) => setContent({...content, contact: {...content.contact, hotline: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Email Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. info@university.edu"
                  value={content.contact?.email || ''} 
                  onChange={(e) => setContent({...content, contact: {...content.contact, email: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Physical Address</label>
                <input 
                  type="text" 
                  placeholder="e.g. Jamalpur 2000, Bangladesh"
                  value={content.contact?.address || ''} 
                  onChange={(e) => setContent({...content, contact: {...content.contact, address: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-white"
                />
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-emerald-400 mb-3">Footer Copyright Text</h2>
            <input 
              type="text" 
              placeholder="© 2026 Brahmaputra International University SPORTS CLUB"
              value={content.copyrightText || ''} 
              onChange={(e) => setContent({...content, copyrightText: e.target.value})}
              className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Convener Section */}
          <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700">
            <h2 className="text-2xl font-bold text-emerald-400 mb-6">Convener Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Name</label>
                <input 
                  type="text" 
                  value={content.convener?.name || ''} 
                  onChange={(e) => setContent({...content, convener: {...content.convener, name: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Role</label>
                <input 
                  type="text" 
                  value={content.convener?.role || ''} 
                  onChange={(e) => setContent({...content, convener: {...content.convener, role: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Department</label>
                <input 
                  type="text" 
                  value={content.convener?.dept || ''} 
                  onChange={(e) => setContent({...content, convener: {...content.convener, dept: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block mb-2 text-base font-semibold text-slate-300">Image URL</label>
                <input 
                  type="text" 
                  value={content.convener?.image || ''} 
                  onChange={(e) => setContent({...content, convener: {...content.convener, image: e.target.value}})}
                  className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Departments Section */}
          <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">Departments Management</h2>
              <button 
                type="button" 
                onClick={handleAddDepartment}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-6 h-6" /> Add Department
              </button>
            </div>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3">
              {content.departments?.map((dept, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-4 items-center bg-slate-900 p-5 rounded-2xl border border-slate-700">
                  <span className="font-extrabold text-emerald-400 text-lg w-10">#{idx + 1}</span>
                  <input 
                    type="text" 
                    placeholder="Department Name" 
                    value={dept.name || ''} 
                    onChange={(e) => handleDeptChange(idx, 'name', e.target.value)}
                    className="w-full sm:w-1/2 p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Logo URL" 
                    value={dept.logo || ''} 
                    onChange={(e) => handleDeptChange(idx, 'logo', e.target.value)}
                    className="w-full sm:w-1/2 p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveDepartment(idx)}
                    className="text-red-500 hover:text-red-400 p-3"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Committee Members Section */}
          <div className="bg-slate-800/40 p-8 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-emerald-400">Committee Members ({content.members?.length || 0}/10)</h2>
              <button 
                type="button" 
                onClick={handleAddMember}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition"
              >
                <Plus className="w-6 h-6" /> Add Member
              </button>
            </div>
            <div className="space-y-5 max-h-[600px] overflow-y-auto pr-3">
              {content.members?.map((member, idx) => (
                <div key={idx} className="flex flex-col lg:flex-row gap-4 items-center bg-slate-900 p-6 rounded-2xl border border-slate-700">
                  <span className="font-extrabold text-emerald-400 text-xl">#{idx + 1}</span>
                  <input 
                    type="text" 
                    placeholder="Name" 
                    value={member.name || ''} 
                    onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                    className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Role" 
                    value={member.role || ''} 
                    onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                    className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Department" 
                    value={member.dept || ''} 
                    onChange={(e) => handleMemberChange(idx, 'dept', e.target.value)}
                    className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <input 
                    type="text" 
                    placeholder="Image URL" 
                    value={member.img || ''} 
                    onChange={(e) => handleMemberChange(idx, 'img', e.target.value)}
                    className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <button 
                    type="button" 
                    onClick={() => handleRemoveMember(idx)}
                    className="text-red-500 hover:text-red-400 p-3"
                  >
                    <Trash2 className="w-7 h-7" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-3 text-lg font-bold text-slate-200">Flash News / Notice:</label>
            <input 
              type="text" 
              value={content.flashNews || ''} 
              onChange={(e) => setContent({...content, flashNews: e.target.value})}
              className="w-full p-4 bg-slate-800 text-lg rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button type="submit" className="w-full bg-emerald-600 text-white p-6 rounded-2xl font-black hover:bg-emerald-700 transition text-2xl shadow-2xl">
            Save All Changes to Database
          </button>
        </form>
      </div>
    </div>
  );
}