import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

function EditProfile() {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    website: '',
    bio: '',
    profilePic: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData({
        name: currentUser.name || '',
        username: currentUser.username || '',
        website: currentUser.website || '',
        bio: currentUser.bio || '',
        profilePic: currentUser.profilePic || ''
      });
    }
  }, [currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.name.trim()) {
      showToast('Name and Username are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        username: formData.username.trim().toLowerCase(),
        website: formData.website.trim(),
        bio: formData.bio.trim(),
        profilePic: formData.profilePic.trim()
      });
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[700px] w-full mx-auto px-4 py-8 bg-ig-card border border-ig-border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-6 text-left text-ig-text">Edit Profile</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Profile Pic Preview and URL Row */}
        <div className="flex items-center gap-6">
          <img 
            src={formData.profilePic || 'https://i.pravatar.cc/150'} 
            alt="Avatar Preview" 
            className="w-16 h-16 rounded-full object-cover border border-ig-border"
          />
          <div className="flex-grow space-y-1 text-left">
            <span className="font-semibold text-sm text-ig-text">{currentUser?.username}</span>
            <input 
              type="text" 
              name="profilePic"
              placeholder="Profile Picture URL"
              value={formData.profilePic}
              onChange={handleChange}
              className="w-full px-3 py-1.5 text-xs bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* Name Input */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
          <label className="w-full md:w-32 font-semibold text-sm md:text-right text-ig-text">Name</label>
          <div className="flex-1 text-left">
            <input 
              type="text" 
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
            <p className="text-[11px] text-ig-muted mt-1 leading-normal">
              Help people discover your account by using the name you're known by: either your full name, nickname, or business name.
            </p>
          </div>
        </div>

        {/* Username Input */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
          <label className="w-full md:w-32 font-semibold text-sm md:text-right text-ig-text">Username</label>
          <div className="flex-1 text-left">
            <input 
              type="text" 
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* Website Input */}
        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
          <label className="w-full md:w-32 font-semibold text-sm md:text-right text-ig-text">Website</label>
          <div className="flex-1 text-left">
            <input 
              type="text" 
              name="website"
              placeholder="Website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
            />
          </div>
        </div>

        {/* Bio Input */}
        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
          <label className="w-full md:w-32 font-semibold text-sm md:text-right text-ig-text mt-2">Bio</label>
          <div className="flex-1 text-left">
            <textarea 
              name="bio"
              placeholder="Bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400 resize-none"
              maxLength={150}
            />
            <div className="text-right text-[11px] text-ig-muted">
              {formData.bio.length} / 150
            </div>
          </div>
        </div>

        {/* Submit Row */}
        <div className="flex md:justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold rounded cursor-pointer transition"
          >
            {isSubmitting ? 'Saving...' : 'Submit'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default EditProfile;
