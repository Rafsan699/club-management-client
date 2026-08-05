import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../services/api';
import { UserPlus, User, Mail, BookOpen, Layers, Lock, Phone, Award, Image as ImageIcon, CheckSquare } from 'lucide-react';

export default function Register() {
  // Maintaining all connection hooks and states while updating schema payload fields to match the UI style
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    personalEmail: '',
    dept: '',
    batch: '',
    phone: '',
    backupPhone: '',
    tShirtSize: 'Select Size',
    image: '',
    studentId: '',
    bloodGroup: 'Select Blood Group',
    facebookProfile: '',
    softSkills: [],
    experience: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSoftSkillToggle = (skill) => {
    const updatedSkills = formData.softSkills.includes(skill)
      ? formData.softSkills.filter((s) => s !== skill)
      : [...formData.softSkills, skill];
    setFormData({ ...formData, softSkills: updatedSkills });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await API.post('/api/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data && res.data.imageUrl) {
        setFormData({ ...formData, image: res.data.imageUrl });
      }
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload picture');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Combining names and formatting payload to align smoothly with your backend architecture
    const submissionPayload = {
      ...formData,
      name: `${formData.firstName} ${formData.lastName}`.trim(),
    };

    try {
      const res = await API.post('/api/register', submissionPayload);
      alert(res.data?.message || 'Registration Successful!');
      navigate('/login');
    } catch (err) {
      console.error("Registration Error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Registration failed!';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const softSkillOptions = [
    'Leadership', 'Communication', 'Team Work', 'Problem Solving',
    'Time Management', 'Public Speaking', 'Event Management', 'Project Management',
    'Photography', 'Cinematography', 'Graphic Design', 'Video Editing',
    'Motion Graphics', 'Content Writing', 'Acting', 'Singing'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fbf9f5] py-12 px-4 text-slate-800">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl w-full max-w-4xl border border-slate-200 my-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-purple-600 flex items-center justify-center gap-3">
            <UserPlus className="w-10 h-10" /> Join Club Application
          </h2>
          <p className="text-sm text-slate-500 font-medium">Be part of the most dynamic tech community at your university.</p>
        </div>

        {/* 2-Column Grid for Professional Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-4 h-4 text-purple-600" /> First Name
            </label>
            <input 
              type="text" 
              required
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-4 h-4 text-purple-600" /> Last Name
            </label>
            <input 
              type="text" 
              required
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-4 h-4 text-purple-600" /> University Email
            </label>
            <input 
              type="email" 
              required
              placeholder="e.g., abcd1230126@bscse.uiu.ac.bd"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Mail className="w-4 h-4 text-purple-600" /> Personal Email
            </label>
            <input 
              type="email" 
              placeholder="Enter your personal email"
              value={formData.personalEmail}
              onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-purple-600" /> Phone (WhatsApp Number)
            </label>
            <input 
              type="text" 
              required
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Phone className="w-4 h-4 text-purple-600" /> Backup Phone (Optional)
            </label>
            <input 
              type="text" 
              placeholder="Enter backup phone number"
              value={formData.backupPhone}
              onChange={(e) => setFormData({...formData, backupPhone: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-600" /> T-Shirt Size
            </label>
            <select
              value={formData.tShirtSize}
              onChange={(e) => setFormData({...formData, tShirtSize: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            >
              <option disabled>Select Size</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="XXL">XXL</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <ImageIcon className="w-4 h-4 text-purple-600" /> Semi Formal Picture of Yourself
            </label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files[0])}
              className="w-full p-2 bg-slate-50 text-slate-600 rounded-xl border border-slate-200 text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-purple-600" /> Student ID & Department
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                required
                placeholder="Student ID"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
              />
              <input 
                type="text" 
                required
                placeholder="Dept (e.g., CSE)"
                value={formData.dept}
                onChange={(e) => setFormData({...formData, dept: e.target.value})}
                className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-purple-600" /> Blood Group & Batch
            </label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
              >
                <option disabled>Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
              <input 
                type="text" 
                required
                placeholder="Batch (e.g., 13th)"
                value={formData.batch}
                onChange={(e) => setFormData({...formData, batch: e.target.value})}
                className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <User className="w-4 h-4 text-purple-600" /> Facebook Profile Link
            </label>
            <input 
              type="text" 
              placeholder="https://facebook.com/yourprofile"
              value={formData.facebookProfile}
              onChange={(e) => setFormData({...formData, facebookProfile: e.target.value})}
              className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
            />
          </div>

        </div>

        {/* Soft Skills Multi-Selection Checkbox Grid */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-purple-600" /> Soft Skills
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            {softSkillOptions.map((skill) => (
              <label key={skill} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={formData.softSkills.includes(skill)}
                  onChange={() => handleSoftSkillToggle(skill)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                {skill}
              </label>
            ))}
          </div>
        </div>

        {/* Experience textarea */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-purple-600" /> Experience
          </label>
          <textarea
            rows="3"
            placeholder="Tell us about your relevant experience..."
            value={formData.experience}
            onChange={(e) => setFormData({...formData, experience: e.target.value})}
            className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
          ></textarea>
        </div>

        {/* Password field required to maintain authentication route */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-purple-600" /> Account Password
          </label>
          <input 
            type="password" 
            required
            placeholder="Enter account password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full p-3 bg-slate-50 text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500 text-sm font-medium"
          />
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-slate-800 hover:bg-slate-900 text-white p-4 rounded-xl font-bold text-sm tracking-wider uppercase transition shadow-lg disabled:opacity-50"
        >
          {loading ? 'Submitting Application...' : 'Submit Application'}
        </button>

        <p className="text-center text-slate-500 text-xs">
          Already have an account? <Link to="/login" className="text-purple-600 font-bold hover:underline">Login here</Link>
        </p>
      </form>
    </div>
  );
}