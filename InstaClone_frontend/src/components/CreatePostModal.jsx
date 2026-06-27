import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postAPI } from '../services/api';

function CreatePostModal({ onClose, onPostCreated }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectRandomImage = () => {
    const randomId = Math.floor(Math.random() * 1000);
    setImageUrl(`https://picsum.photos/600/600?random=${randomId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;

    setIsSubmitting(true);

    const newPost = {
      userId: currentUser.id,
      username: currentUser.username,
      profilePic: currentUser.profilePic,
      postImage: imageUrl.trim(),
      location: location.trim() || "Earth",
      caption: caption.trim(),
      time: new Date().toISOString()
    };

    try {
      const createdPost = await postAPI.create(newPost);
      showToast("Post shared successfully!", "success");
      onPostCreated(createdPost);
      setIsSubmitting(false);
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      showToast("Failed to share post.", "error");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/80 p-4 animate-fade-in text-ig-text">
      {/* Close button on outer area */}
      <button 
        className="absolute top-4 right-4 text-white text-3xl hover:opacity-70 transition cursor-pointer bg-transparent border-0"
        onClick={onClose}
      >
        <i className="bi bi-x-lg"></i>
      </button>

      {/* Modal Card */}
      <div className="bg-ig-card border border-ig-border rounded-xl overflow-hidden max-w-[850px] w-full h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="h-11 border-b border-ig-border flex justify-between items-center px-4 shrink-0 bg-ig-card">
          <button onClick={onClose} className="text-ig-text font-semibold hover:opacity-60 cursor-pointer bg-transparent border-0">
            Cancel
          </button>
          <span className="font-semibold text-ig-text">Create new post</span>
          <button 
            onClick={handleSubmit} 
            disabled={!imageUrl.trim() || isSubmitting}
            className={`font-semibold cursor-pointer text-sky-500 hover:text-sky-700 disabled:opacity-30 disabled:pointer-events-none bg-transparent border-0`}
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-grow flex min-h-0 bg-ig-card">
          
          {/* Left Side: Photo Input/Preview */}
          <div className="flex-1 bg-ig-primary flex flex-col items-center justify-center border-r border-ig-border relative min-w-0">
            {imageUrl ? (
              <div className="w-full h-full p-2 flex items-center justify-center">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-w-full max-h-full object-contain rounded-md"
                />
                <button 
                  onClick={() => setImageUrl('')}
                  className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 text-sm shadow cursor-pointer border-0"
                  title="Remove image"
                >
                  <i className="bi bi-trash-fill"></i>
                </button>
              </div>
            ) : (
              <div className="w-full max-w-sm px-6 text-center flex flex-col items-center gap-4">
                <div className="text-ig-muted text-6xl">
                  <i className="bi bi-images"></i>
                </div>
                <h5 className="font-medium text-lg text-ig-text">Select photos and videos here</h5>
                
                <div className="w-full flex flex-col gap-2">
                  <input 
                    type="text" 
                    placeholder="Paste image URL here..." 
                    className="w-full px-3 py-2 text-sm border border-ig-border rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 bg-ig-input text-ig-text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <span className="text-xs text-ig-muted font-semibold my-1">OR</span>
                  <button 
                    type="button" 
                    onClick={selectRandomImage}
                    className="w-full py-2 bg-[#0095f6] hover:bg-sky-600 text-white text-sm font-semibold rounded-md shadow cursor-pointer transition border-0"
                  >
                    Select Random Mock Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Caption and Details */}
          <div className="w-[320px] shrink-0 p-4 flex flex-col gap-4 bg-ig-card border-l border-ig-border">
            
            {/* User Profile info */}
            <div className="flex items-center gap-3">
              <img 
                src={currentUser?.profilePic || "https://i.pravatar.cc/150"} 
                alt={currentUser?.username} 
                className="w-7 h-7 rounded-full object-cover border border-ig-border"
              />
              <span className="font-semibold text-sm text-ig-text">{currentUser?.username}</span>
            </div>

            {/* Caption Textarea */}
            <div className="flex-1 flex flex-col min-h-0 border-b border-ig-border">
              <textarea 
                placeholder="Write a caption..." 
                className="w-full flex-grow resize-none border-0 text-sm focus:outline-none text-ig-text placeholder-ig-muted bg-transparent py-1"
                maxLength={2200}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
              <div className="text-right text-xs text-ig-muted py-2">
                {caption.length} / 2,200
              </div>
            </div>

            {/* Add Location input */}
            <div className="flex items-center gap-2 border-b border-ig-border pb-2 bg-transparent">
              <i className="bi bi-geo-alt text-ig-muted text-base"></i>
              <input 
                type="text" 
                placeholder="Add location" 
                className="w-full border-0 text-sm focus:outline-none bg-transparent text-ig-text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="text-xs text-ig-muted">
              Your post will be published immediately to the global feed database.
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default CreatePostModal;
