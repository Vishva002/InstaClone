import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { storyAPI } from '../services/api';
import { StorySkeleton } from '../components/SkeletonLoader';

function Story() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isAddingStory, setIsAddingStory] = useState(false);
  const [newStoryUrl, setNewStoryUrl] = useState('');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const data = await storyAPI.getAll();
      setStories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (index) => {
    setActiveStoryIndex(index);
    setProgress(0);
    
    // Mark story as viewed locally and trigger patch optionally
    const targetStory = stories[index];
    if (!targetStory.viewed) {
      storyAPI.update(targetStory.id, { viewed: true })
        .then(() => {
          setStories(prev => prev.map((s, idx) => idx === index ? { ...s, viewed: true } : s));
        })
        .catch(err => console.error(err));
    }
  };

  const handleAddStorySubmit = async (e) => {
    e.preventDefault();
    if (!newStoryUrl.trim()) return;

    try {
      const newStory = {
        userId: currentUser.id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        storyImg: newStoryUrl.trim(),
        viewed: false,
        time: new Date().toISOString()
      };

      const created = await storyAPI.create(newStory);
      setStories(prev => [created, ...prev]);
      setNewStoryUrl('');
      setIsAddingStory(false);
      showToast('Story shared successfully!', 'success');
    } catch (err) {
      showToast('Failed to add story.', 'error');
    }
  };

  useEffect(() => {
    if (activeStoryIndex === null) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex(activeStoryIndex + 1);
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + 2; // Increments progress
      });
    }, 45);

    return () => clearInterval(timer);
  }, [activeStoryIndex, stories.length]);

  if (loading) {
    return <StorySkeleton />;
  }

  return (
    <>
      <div className="flex gap-4 p-4 border border-ig-border rounded-lg overflow-x-auto no-scrollbar bg-ig-card mb-6 mt-4">
        {/* Add Story Button for Current User */}
        <div className="flex flex-col items-center cursor-pointer w-[74px] shrink-0 hover:scale-105 transition-transform duration-200">
          <div 
            onClick={() => setIsAddingStory(true)}
            className="relative p-[2px] rounded-full inline-block mb-1.5 bg-zinc-200 dark:bg-zinc-800"
          >
            <img 
              className="w-14 h-14 rounded-full border-2 border-white dark:border-zinc-900 object-cover block" 
              src={currentUser?.profilePic || 'https://i.pravatar.cc/150'} 
              alt="You" 
            />
            <div className="absolute bottom-0 right-0 bg-[#0095f6] hover:bg-[#1877f2] text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white dark:border-zinc-900 text-xs font-bold transition">
              <i className="bi bi-plus-lg"></i>
            </div>
          </div>
          <span className="text-[11px] text-ig-muted text-center w-full truncate">Your story</span>
        </div>

        {/* Stories list */}
        {stories.map((story, index) => (
          <div 
            key={story.id} 
            className="flex flex-col items-center cursor-pointer w-[74px] shrink-0 hover:scale-105 transition-transform duration-200" 
            onClick={() => handleStoryClick(index)}
          >
            <div className={`p-[2px] rounded-full inline-block mb-1.5 ${story.viewed ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-gradient-to-tr from-amber-500 via-red-500 to-fuchsia-600'}`}>
              <img className="w-14 h-14 rounded-full border-2 border-white dark:border-zinc-900 object-cover block" src={story.profilePic} alt={story.username} />
            </div>
            <span className="text-[11px] text-ig-muted text-center w-full truncate">{story.username}</span>
          </div>
        ))}
      </div>

      {/* Add Story Dialog Modal */}
      {isAddingStory && (
        <div className="fixed inset-0 z-[2500] flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="bg-ig-card border border-ig-border rounded-lg p-6 max-w-sm w-full relative">
            <button 
              onClick={() => setIsAddingStory(false)}
              className="absolute top-3 right-3 text-ig-text hover:opacity-70 transition border-0 bg-transparent text-xl cursor-pointer"
            >
              <i className="bi bi-x-lg"></i>
            </button>
            <h4 className="font-bold text-lg text-ig-text mb-4 text-left">Add to your story</h4>
            <form onSubmit={handleAddStorySubmit} className="space-y-4">
              <div className="text-left space-y-1">
                <label className="text-xs font-semibold text-ig-muted">Paste Story Image URL</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3 py-2 text-sm bg-ig-input border border-ig-border rounded focus:outline-none focus:border-zinc-400"
                  value={newStoryUrl}
                  onChange={(e) => setNewStoryUrl(e.target.value)}
                />
              </div>
              <button 
                type="submit"
                disabled={!newStoryUrl.trim()}
                className="w-full py-2 bg-[#0095f6] hover:bg-[#1877f2] disabled:opacity-40 disabled:pointer-events-none text-white text-sm font-semibold rounded cursor-pointer transition"
              >
                Share to story
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Story Viewer Overlay */}
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div 
          className="fixed inset-0 flex flex-col justify-center items-center bg-zinc-950"
          style={{ zIndex: 3000 }}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white text-3xl hover:opacity-70 transition border-0 bg-transparent cursor-pointer"
            onClick={() => setActiveStoryIndex(null)}
          >
            <i className="bi bi-x-lg"></i>
          </button>

          {/* Story Card */}
          <div className="relative flex flex-col bg-black rounded-lg overflow-hidden shadow-2xl w-full max-w-[420px] h-[90vh]">
            {/* Story Progress Bar */}
            <div className="absolute top-0 left-0 w-full p-2 flex gap-1 z-10">
              {stories.map((_, idx) => (
                <div key={idx} className="flex-grow bg-zinc-600 rounded-sm h-[3px] overflow-hidden">
                  <div 
                    className="bg-white h-full" 
                    style={{ 
                      width: idx === activeStoryIndex ? `${progress}%` : idx < activeStoryIndex ? '100%' : '0%',
                      transition: idx === activeStoryIndex ? 'none' : 'width 0.05s linear'
                    }}
                  ></div>
                </div>
              ))}
            </div>

            {/* Header User info */}
            <div className="absolute top-4 left-4 flex items-center gap-2.5 z-10 text-white">
              <img 
                src={stories[activeStoryIndex].profilePic} 
                alt={stories[activeStoryIndex].username} 
                className="w-8 h-8 rounded-full border border-white object-cover"
              />
              <span className="font-semibold text-sm">{stories[activeStoryIndex].username}</span>
            </div>

            {/* Story Image */}
            <img 
              src={stories[activeStoryIndex].storyImg} 
              alt="Story Content" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Story;