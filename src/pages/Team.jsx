import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UserPlus, Image as ImageIcon, Trash2, Users } from 'lucide-react';

const AddNewMember = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    department: '',
    batch: '',
    semester: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]); // এডমিন প্যানেলে মেম্বার লিস্ট দেখানোর জন্য

  // মেম্বার লিস্ট ফেচ করা
  const fetchMembers = async () => {
    try {
      const res = await API.get('/api/members/list');
      setMembers(res.data.data);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // মেম্বার সাবমিট বা যোগ করার হ্যান্ডলার
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Uploading member profile...');

    const data = new FormData();
    data.append('name', formData.name);
    data.append('category', formData.category);
    data.append('department', formData.department);
    data.append('batch', formData.batch);
    data.append('semester', formData.semester);
    
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      await API.post('/api/members/add', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('Member profile created successfully!');
      setFormData({ name: '', category: '', department: '', batch: '', semester: '' });
      setImageFile(null);
      fetchMembers(); // নতুন মেম্বার যোগ হওয়ার পর লিস্ট রিফ্রেশ হবে
    } catch (err) {
      console.error(err);
      setStatus('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // এডমিন প্যানেল থেকে মেম্বার ডিলিট করার হ্যান্ডলার
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member?')) {
      try {
        await API.delete(`/api/members/delete/${id}`);
        setMembers(members.filter(m => m._id !== id));
        setStatus('Member deleted successfully!');
      } catch (err) {
        console.error('Failed to delete member:', err);
        setStatus('Failed to delete member.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* ফর্ম সেকশন */}
        <div className="bg-white/90 backdrop-blur-md border border-purple-100 p-8 max-w-md w-full mx-auto rounded-3xl shadow-xl shadow-purple-900/5">
          <div className="text-center mb-6">
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-2 shadow-inner">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-purple-950 uppercase tracking-tight">Add New Member</h2>
            <p className="text-xs text-purple-600/70 font-semibold mt-0.5">Admin Control Panel</p>
            <div className="w-10 h-1 bg-purple-600 mx-auto mt-2 rounded-full"></div>
          </div>

          {status && (
            <div className={`mb-4 p-3 rounded-xl text-xs font-bold text-center ${status.includes('successfully') ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-purple-50 text-purple-700 border border-purple-200'}`}>
              {status}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-purple-950 mb-1 uppercase tracking-wider">Member Name *</label>
              <input 
                type="text" 
                name="name"
                placeholder="e.g. John Doe" 
                value={formData.name} 
                onChange={handleInputChange} 
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-purple-950 font-medium" 
                required 
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-950 mb-1 uppercase tracking-wider">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-purple-950 font-medium"
              >
                <option value="">Select Category</option>
                <option value="Convener">Convener</option>
                <option value="Executive Committee">Executive Committee</option>
                <option value="Wing Leaders">Wing Leaders</option>
                <option value="Executive Members">Executive Members</option>
                <option value="General">General</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-950 mb-1 uppercase tracking-wider">Department</label>
              <input 
                type="text" 
                name="department"
                placeholder="e.g. CSE / EEE" 
                value={formData.department} 
                onChange={handleInputChange} 
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-purple-950 font-medium" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1 uppercase tracking-wider">Batch</label>
                <input 
                  type="text" 
                  name="batch"
                  placeholder="e.g. 56" 
                  value={formData.batch} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-purple-950 font-medium" 
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-purple-950 mb-1 uppercase tracking-wider">Semester</label>
                <input 
                  type="text" 
                  name="semester"
                  placeholder="e.g. 5th" 
                  value={formData.semester} 
                  onChange={handleInputChange} 
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-purple-100 rounded-xl focus:outline-none focus:border-purple-600 focus:bg-white transition-all text-purple-950 font-medium" 
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-purple-950 mb-1 uppercase tracking-wider">Profile Picture *</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-purple-100 rounded-xl">
                <ImageIcon className="w-4 h-4 text-purple-500 shrink-0" />
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange} 
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-purple-100 file:text-purple-700 hover:file:bg-purple-200 cursor-pointer" 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-2 bg-purple-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md shadow-purple-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Add Member'}
            </button>
          </form>
        </div>

        {/* বর্তমান যুক্ত থাকা মেম্বারদের তালিকা ও ডিলিট সেকশন */}
        <div className="bg-white/90 backdrop-blur-md border border-purple-100 p-6 sm:p-8 rounded-3xl shadow-xl shadow-purple-900/5">
          <div className="flex items-center gap-2 mb-6 border-b border-purple-100 pb-4">
            <Users className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-black text-purple-950 uppercase tracking-tight">Manage Added Members ({members.length})</h3>
          </div>

          {members.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-8 font-semibold">No members added yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {members.map(member => (
                <div key={member._id} className="flex items-center justify-between p-3 bg-slate-50 border border-purple-100 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <img 
                      src={member.image || "https://via.placeholder.com/150"} 
                      alt={member.name} 
                      className="w-10 h-10 rounded-xl object-cover border border-purple-200" 
                    />
                    <div>
                      <h4 className="font-bold text-xs text-purple-950">{member.name}</h4>
                      <p className="text-[10px] text-purple-600 font-semibold">{member.department || 'N/A'} {member.batch ? `(Batch: ${member.batch})` : ''}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleDelete(member._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all"
                    title="Delete Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddNewMember;