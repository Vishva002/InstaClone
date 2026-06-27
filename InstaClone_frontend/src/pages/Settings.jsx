import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, updateProfile, logout } = useAuth();
  const { showToast } = useToast();
  
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmNewPassword) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (passwords.currentPassword !== currentUser.password) {
      showToast('Incorrect current password.', 'error');
      return;
    }
    if (passwords.newPassword.length < 4) {
      showToast('New password must be at least 4 characters.', 'error');
      return;
    }
    if (passwords.newPassword !== passwords.confirmNewPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ password: passwords.newPassword });
      showToast('Password updated successfully!', 'success');
      setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[700px] w-full mx-auto px-4 py-8 bg-ig-card border border-ig-border rounded-lg shadow-sm space-y-8 text-left">
      <h2 className="text-xl font-bold mb-4 text-ig-text">Settings</h2>

      {/* Theme Settings Section */}
      <div className="border-b border-ig-border pb-6">
        <h4 className="font-semibold text-base mb-3 text-ig-text">Appearance</h4>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-ig-text">Dark Mode</span>
            <p className="text-xs text-ig-muted">Switch between light and dark themes.</p>
          </div>
          <button 
            onClick={toggleTheme}
            className="px-4 py-2 bg-ig-input hover-ig-bg border border-ig-border rounded text-sm font-semibold transition cursor-pointer flex items-center gap-2"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-moon-fill' : 'bi-sun-fill'} text-base`}></i>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="border-b border-ig-border pb-6">
        <h4 className="font-semibold text-base mb-4 text-ig-text">Change Password</h4>
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ig-muted">Current Password</label>
            <input 
              type="password" 
              name="currentPassword"
              placeholder="Current Password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ig-muted">New Password</label>
            <input 
              type="password" 
              name="newPassword"
              placeholder="New Password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-ig-muted">Confirm New Password</label>
            <input 
              type="password" 
              name="confirmNewPassword"
              placeholder="Confirm New Password"
              value={passwords.confirmNewPassword}
              onChange={handlePasswordChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold rounded cursor-pointer transition"
          >
            {isSubmitting ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Logout Action Area */}
      <div>
        <h4 className="font-semibold text-base mb-3 text-red-500">Account Actions</h4>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-ig-text">Logout of your account</span>
            <p className="text-xs text-ig-muted">Securely terminate your current session.</p>
          </div>
          <button 
            onClick={logout}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-semibold cursor-pointer transition"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
