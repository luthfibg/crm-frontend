import { WavingHand02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // ← TAMBAHKAN INI

const Login = () => {

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // ← Tambahan untuk UX
  const navigate = useNavigate();
  const { login } = useAuth(); // ← TAMBAHKAN INI

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset error
    setIsLoading(true); // ← Tambahan
    
    try {
      const response = await api.post('/login', formData);
      
      // ← PERBAIKAN: Gunakan fungsi login dari context
      login(response.data.user, response.data.token);
      
      // Arahkan ke dashboard
      navigate('/panel');
    } catch (err) {
      // ← PERBAIKAN: Error handling yang lebih baik
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.errors?.email) {
        setError(err.response.data.errors.email[0]);
      } else if (err.response?.data?.errors?.password) {
        setError(err.response.data.errors.password[0]);
      } else {
        setError('Invalid email or password');
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false); // ← Tambahan
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8 flex gap-2 lg:gap-3 items-center justify-center">
          <HugeiconsIcon icon={WavingHand02Icon} size={30} color="#0A4C8F" strokeWidth={1.5} />
          <h2 className="text-3xl font-bold text-[#0A4C8F]">Welcome Back</h2>
        </div>

        {/* ← TAMBAHKAN: Tampilkan error jika ada */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email} // ← TAMBAHKAN value
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="name@example.com"
              onChange={handleChange}
              disabled={isLoading} // ← TAMBAHKAN
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              name="password"
              required
              value={formData.password} // ← TAMBAHKAN value
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              onChange={handleChange}
              disabled={isLoading} // ← TAMBAHKAN
            />
          </div>

          <div className="flex items-center">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <label htmlFor="remember" className="ml-2 block text-sm text-slate-600">
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading} // ← TAMBAHKAN
            className="w-full bg-[#0A4C8F] hover:bg-indigo-700 text-[#F8BF0B] font-semibold py-2.5 rounded-lg transition-colors duration-200 shadow-md shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing In...' : 'Sign In'} {/* ← TAMBAHKAN */}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <button className="font-medium text-indigo-600 hover:text-indigo-500">
              Contact Admin
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;