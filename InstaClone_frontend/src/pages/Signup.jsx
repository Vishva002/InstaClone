import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import instagramText from '../assets/instatext.png';

function Signup() {
  const [formData, setFormData] = useState({ email: '', name: '', username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_.]+$/.test(formData.username)) {
      newErrors.username = 'Only letters, numbers, dots, and underscores allowed';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await signup(
        formData.username.trim(),
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );
      showToast('Registration successful! Welcome to Instagram.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-[350px] flex flex-col gap-3">
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-8 flex flex-col items-center rounded">
          {/* Logo */}
          <img 
            src={instagramText} 
            alt="Instagram" 
            className="w-[175px] mb-4 dark:invert" 
          />

          <p className="text-gray-400 font-semibold text-center text-sm mb-4 leading-tight">
            Sign up to see photos and videos from your friends.
          </p>

          <button className="w-full py-1.5 bg-[#0095f6] hover:bg-[#1877f2] text-white text-xs font-semibold rounded cursor-pointer transition flex items-center justify-center gap-2">
            <i className="bi bi-facebook text-base"></i>
            Log in with Facebook
          </button>

          {/* Divider */}
          <div className="w-full flex items-center justify-between gap-4 my-4">
            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-800"></div>
            <span className="text-xs font-semibold text-gray-400 uppercase">OR</span>
            <div className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-800"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
            <div className="relative">
              <input 
                type="text" 
                name="email"
                placeholder="Mobile Number or Email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-2 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-zinc-800'} rounded focus:outline-none focus:border-gray-400 text-gray-800 dark:text-zinc-200`}
              />
              {errors.email && (
                <span className="text-[10px] text-red-500">{errors.email}</span>
              )}
            </div>

            <div className="relative">
              <input 
                type="text" 
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-2 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-zinc-800'} rounded focus:outline-none focus:border-gray-400 text-gray-800 dark:text-zinc-200`}
              />
              {errors.name && (
                <span className="text-[10px] text-red-500">{errors.name}</span>
              )}
            </div>

            <div className="relative">
              <input 
                type="text" 
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={`w-full px-2 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-zinc-800'} rounded focus:outline-none focus:border-gray-400 text-gray-800 dark:text-zinc-200`}
              />
              {errors.username && (
                <span className="text-[10px] text-red-500">{errors.username}</span>
              )}
            </div>

            <div className="relative">
              <input 
                type="password" 
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-2 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-zinc-800'} rounded focus:outline-none focus:border-gray-400 text-gray-800 dark:text-zinc-200`}
              />
              {errors.password && (
                <span className="text-[10px] text-red-500">{errors.password}</span>
              )}
            </div>

            <p className="text-[11px] text-gray-400 text-center leading-normal mt-2">
              People who use our service may have uploaded your contact information to Instagram.{' '}
              <Link to="#" className="no-underline text-gray-500 hover:text-gray-700">Learn More</Link>
            </p>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-1.5 bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold rounded cursor-pointer transition text-center"
            >
              {isSubmitting ? 'Signing up...' : 'Sign up'}
            </button>
          </form>
        </div>

        {/* Log in prompt card */}
        <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 text-center text-sm text-gray-800 dark:text-zinc-300 rounded">
          Have an account?{' '}
          <Link to="/login" className="text-[#0095f6] font-semibold no-underline hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
