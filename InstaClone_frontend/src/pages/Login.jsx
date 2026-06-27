import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import instagramText from '../assets/instatext.png';

function Login() {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Username or email is required';
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
      await login(formData.usernameOrEmail, formData.password);
      showToast('Logged in successfully! Welcome back.', 'success');
      navigate('/');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-black flex items-center justify-center p-4">
      <div className="flex items-center justify-center max-w-[850px] w-full gap-8">
        
        {/* Left Side: Mock Phone Frame (Hidden on small viewports) */}
        <div className="hidden md:block relative w-[380px] h-[580px] bg-no-repeat bg-contain bg-center bg-[url('https://static.cdninstagram.com/rsrc.php/v3/y4/r/ItKtgo1t9bb.png')]">
          <div className="absolute top-[28px] left-[110px] w-[250px] h-[525px] overflow-hidden rounded-[24px]">
            <img 
              src="https://picsum.photos/250/525?random=88" 
              alt="Insta Feed Mock" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Side: Login Form Card */}
        <div className="w-full max-w-[350px] flex flex-col gap-3">
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-8 flex flex-col items-center rounded">
            {/* Logo */}
            <img 
              src={instagramText} 
              alt="Instagram" 
              className="w-[175px] mb-8 dark:invert" 
            />

            {/* Form */}
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  name="usernameOrEmail"
                  placeholder="Phone number, username, or email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  className={`w-full px-2 py-2 text-xs bg-gray-50 dark:bg-zinc-900 border ${errors.usernameOrEmail ? 'border-red-500' : 'border-gray-300 dark:border-zinc-800'} rounded focus:outline-none focus:border-gray-400 text-gray-800 dark:text-zinc-200`}
                />
                {errors.usernameOrEmail && (
                  <span className="text-[10px] text-red-500">{errors.usernameOrEmail}</span>
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

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-1.5 bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold rounded cursor-pointer transition text-center"
              >
                {isSubmitting ? 'Logging in...' : 'Log in'}
              </button>
            </form>

            {/* Divider */}
            <div className="w-full flex items-center justify-between gap-4 my-5">
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-800"></div>
              <span className="text-xs font-semibold text-gray-400 uppercase">OR</span>
              <div className="flex-1 h-[1px] bg-gray-200 dark:bg-zinc-800"></div>
            </div>

            {/* Facebook login mock */}
            <button className="flex items-center gap-2 text-sm font-semibold text-[#385185] bg-transparent border-0 cursor-pointer">
              <i className="bi bi-facebook text-lg"></i>
              Log in with Facebook
            </button>
            
            <Link to="#" className="text-xs text-[#00376b] dark:text-sky-500 mt-4 no-underline hover:underline">
              Forgot password?
            </Link>
          </div>

          {/* Sign up prompt card */}
          <div className="bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 text-center text-sm text-gray-800 dark:text-zinc-300 rounded">
            Don't have an account?{' '}
            <Link to="/signup" className="text-[#0095f6] font-semibold no-underline hover:underline">
              Sign up
            </Link>
          </div>

          {/* App download section */}
          <div className="flex flex-col items-center gap-3 mt-2">
            <span className="text-xs text-gray-800 dark:text-zinc-400">Get the app.</span>
            <div className="flex gap-2 justify-center">
              <img src="https://static.cdninstagram.com/rsrc.php/v3/yt/r/Y23eFSrGZPA.png" alt="Google Play" className="h-10 cursor-pointer" />
              <img src="https://static.cdninstagram.com/rsrc.php/v3/yz/r/c5Rp7Ym_I0g.png" alt="Microsoft Store" className="h-10 cursor-pointer" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;
