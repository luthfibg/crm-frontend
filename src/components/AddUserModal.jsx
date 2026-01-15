import React, { useState } from 'react';
import api from '../api/axios';
import { HugeiconsIcon } from '@hugeicons/react';
import { CancelCircleIcon, FloppyDiskIcon } from '@hugeicons/core-free-icons';

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone_number: '',
    address: '',
    date_of_birth: '',
    role: 'sales', // Default role
    points: 0,
    level: 'Beginner',
    bio: '',
    badge: 'New Member'
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await api.post('/users', formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        address: '',
        date_of_birth: '',
        role: 'sales',
        points: 0,
        level: 'Beginner',
        bio: '',
        badge: 'New Member'
      });
    } catch (error) {
      const validationErrors = error.response?.data?.errors;
      if (validationErrors) {
        setErrors(validationErrors);
      } else {
        console.error("Gagal menambah user:", error.message);
        alert("Terjadi kesalahan pada server.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-800">Add New User</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <HugeiconsIcon icon={CancelCircleIcon} size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Required Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name - Required */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Full Name *
                {errors.name && <span className="text-red-500 text-xs ml-2">({errors.name})</span>}
              </label>
              <input 
                required
                type="text"
                name="name"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.name ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter full name"
              />
            </div>

            {/* Email - Required */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Email Address *
                {errors.email && <span className="text-red-500 text-xs ml-2">({errors.email})</span>}
              </label>
              <input 
                required
                type="email"
                name="email"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
              />
            </div>

            {/* Password - Required */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Password *
                {errors.password && <span className="text-red-500 text-xs ml-2">({errors.password})</span>}
              </label>
              <input 
                required
                type="password"
                name="password"
                minLength="8"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.password ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
              />
              <p className="text-xs text-slate-400 mt-1">Minimum 8 characters</p>
            </div>

            {/* Role */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Role *
                {errors.role && <span className="text-red-500 text-xs ml-2">({errors.role})</span>}
              </label>
              <select 
                name="role"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="sales">Sales</option>
                <option value="presales" disabled>Presales</option>
                <option value="telesales" disabled>Telesales</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>

          {/* Personal Information */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Personal Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                  {errors.phone_number && <span className="text-red-500 text-xs ml-2">({errors.phone_number})</span>}
                </label>
                <input 
                  type="text"
                  name="phone_number"
                  maxLength="20"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.phone_number ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="+62..."
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Date of Birth
                  {errors.date_of_birth && <span className="text-red-500 text-xs ml-2">({errors.date_of_birth})</span>}
                </label>
                <input 
                  type="date"
                  name="date_of_birth"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.date_of_birth ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Address */}
            <div className="mt-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Address
                {errors.address && <span className="text-red-500 text-xs ml-2">({errors.address})</span>}
              </label>
              <input 
                type="text"
                name="address"
                maxLength="255"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.address ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="pt-4 border-t border-slate-100">
            <h4 className="text-sm font-bold text-slate-700 mb-4">Additional Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Points */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Points
                  {errors.points && <span className="text-red-500 text-xs ml-2">({errors.points})</span>}
                </label>
                <input 
                  type="number"
                  name="points"
                  min="0"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.points ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  value={formData.points}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              {/* Level */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Level
                  {errors.level && <span className="text-red-500 text-xs ml-2">({errors.level})</span>}
                </label>
                <input 
                  type="text"
                  name="level"
                  maxLength="100"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.level ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  value={formData.level}
                  onChange={handleChange}
                  placeholder="Beginner"
                />
              </div>

              {/* Badge */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Badge
                  {errors.badge && <span className="text-red-500 text-xs ml-2">({errors.badge})</span>}
                </label>
                <input 
                  type="text"
                  name="badge"
                  maxLength="100"
                  className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.badge ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  value={formData.badge}
                  onChange={handleChange}
                  placeholder="New Member"
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Bio / Description
                {errors.bio && <span className="text-red-500 text-xs ml-2">({errors.bio})</span>}
              </label>
              <textarea 
                rows="3"
                name="bio"
                maxLength="500"
                className={`w-full px-4 py-2.5 bg-slate-50 border ${errors.bio ? 'border-red-300' : 'border-slate-200'} rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none transition-all`}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about this user..."
              />
              <p className="text-xs text-slate-400 text-right">{formData.bio.length}/500</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 flex gap-3 border-t border-slate-100">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <HugeiconsIcon icon={FloppyDiskIcon} size={18} />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;