import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { postAPI, commentAPI, likeAPI, savedAPI } from '../services/api';
import { ProfileSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

function Explore() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [exploreItems, setExploreItems] = useState([]);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [saves, setSaves] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Interaction states inside detailed modal
  const [modalComments, setModalComments] = useState([]);
  const [modalCommentText, setModalCommentText] = useState("");
  
  useEffect(() => {
    loadExploreData();
  }, [currentUser]);

  const loadExploreData = async () => {
    try {
      setLoading(true);
      const [postsData, likesData, commentsData, savesData] = await Promise.all([
        postAPI.getAllUnpaginated(),
        api.get('/likes').then(res => res.data),
        api.get('/comments').then(res => res.data),
        savedAPI.getByUser(currentUser.id)
      ]);

      setExploreItems(postsData);
      setLikes(likesData);
      setComments(commentsData);
      setSaves(savesData);
    } catch (err) {
      console.error(err);
      showToast("Error loading explore grid.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = async (post) => {
    setSelectedPost(post);
    try {
      // Fetch fresh comments for this specific post
      const freshComments = await commentAPI.getByPost(post.id);
      setModalComments(freshComments);
    } catch (e) {
      console.error(e);
    }
  };

  const handleModalLikeToggle = async (post) => {
    const existingLike = likes.find(l => l.postId === post.id && l.userId === currentUser.id);
    try {
      if (existingLike) {
        await likeAPI.delete(existingLike.id);
        setLikes(prev => prev.filter(l => l.id !== existingLike.id));
      } else {
        const created = await likeAPI.create({ postId: post.id, userId: currentUser.id });
        setLikes(prev => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalSaveToggle = async (post) => {
    const existingSave = saves.find(s => s.postId === post.id);
    try {
      if (existingSave) {
        await savedAPI.delete(existingSave.id);
        setSaves(prev => prev.filter(s => s.id !== existingSave.id));
        showToast("Post unsaved", "info");
      } else {
        const created = await savedAPI.create({ postId: post.id, userId: currentUser.id });
        setSaves(prev => [...prev, created]);
        showToast("Post saved", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleModalAddComment = async (e) => {
    e.preventDefault();
    if (!modalCommentText.trim() || !selectedPost) return;

    try {
      const payload = {
        postId: selectedPost.id,
        userId: currentUser.id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        comment: modalCommentText.trim(),
        time: new Date().toISOString()
      };

      const created = await commentAPI.create(payload);
      setModalComments(prev => [...prev, created]);
      setComments(prev => [...prev, created]); // Sync with global explore comments
      setModalCommentText("");
      showToast("Comment posted", "success");
    } catch (err) {
      showToast("Failed to post comment", "error");
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="max-w-[935px] mx-auto px-4 py-6 text-ig-text">
      {/* 3-Column Grid */}
      <div className="grid grid-cols-3 gap-1 md:gap-7">
        {exploreItems.map((item) => {
          const itemLikes = likes.filter(l => l.postId === item.id).length;
          const itemComments = comments.filter(c => c.postId === item.id).length;

          return (
            <div 
              key={item.id} 
              className="relative aspect-square cursor-pointer group bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-ig-border"
              onClick={() => handlePostClick(item)}
            >
              {/* Image */}
              <img 
                src={item.postImage} 
                alt={item.caption} 
                className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
              />
              {/* Hover overlay with statistics */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-semibold transition duration-200">
                <span className="flex items-center gap-2 text-lg">
                  <i className="bi bi-heart-fill"></i>
                  {itemLikes}
                </span>
                <span className="flex items-center gap-2 text-lg">
                  <i className="bi bi-chat-fill"></i>
                  {itemComments}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Post Viewer Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-ig-card rounded-lg max-w-[850px] w-full h-[600px] flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-ig-border"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button inside modal */}
            <button 
              className="absolute top-3 right-3 text-ig-text hover:opacity-75 md:hidden z-10 text-xl cursor-pointer bg-transparent border-0"
              onClick={() => setSelectedPost(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {/* Left side: Image */}
            <div className="flex-1 bg-black flex items-center justify-center min-w-0">
              <img 
                src={selectedPost.postImage} 
                alt="Post content" 
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Right side: Comments & User Detail Pane */}
            <div className="w-full md:w-[340px] shrink-0 flex flex-col bg-ig-card h-full min-h-0 border-l border-ig-border">
              {/* Header Profile info */}
              <div className="p-4 border-b border-ig-border flex items-center gap-3">
                <img 
                  src={selectedPost.profilePic} 
                  alt={selectedPost.username} 
                  className="w-8 h-8 rounded-full object-cover border border-ig-border"
                />
                <div className="text-left">
                  <Link to={`/profile?username=${selectedPost.username}`} onClick={() => setSelectedPost(null)} className="font-semibold text-sm text-ig-text leading-none mb-1 hover:underline no-underline block">
                    {selectedPost.username}
                  </Link>
                  <small className="text-ig-muted text-xs">{selectedPost.location}</small>
                </div>
              </div>

              {/* Caption & Comments List scrollable section */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0 text-left">
                {/* Caption as first comment */}
                {selectedPost.caption && (
                  <div className="flex gap-3 text-sm items-start">
                    <img src={selectedPost.profilePic} alt="" className="w-6 h-6 rounded-full object-cover border border-ig-border shrink-0" />
                    <div>
                      <span className="font-semibold text-ig-text mr-2">{selectedPost.username}</span>
                      <span className="text-ig-text break-words">{selectedPost.caption}</span>
                    </div>
                  </div>
                )}

                {/* Actual comments */}
                {modalComments.length > 0 ? (
                  modalComments.map((c) => (
                    <div key={c.id} className="flex gap-3 text-sm items-start">
                      <img src={c.profilePic} alt="" className="w-6 h-6 rounded-full object-cover border border-ig-border shrink-0" />
                      <div>
                        <span className="font-semibold text-ig-text mr-2">{c.username}</span>
                        <span className="text-ig-text break-words">{c.comment}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-ig-muted py-10 text-xs">
                    No comments yet.
                  </div>
                )}
              </div>

              {/* Footer action stats */}
              <div className="p-4 border-t border-ig-border bg-ig-card">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-4 text-xl text-ig-text">
                    <i 
                      onClick={() => handleModalLikeToggle(selectedPost)}
                      className={`cursor-pointer hover:opacity-60 transition bi ${likes.some(l => l.postId === selectedPost.id && l.userId === currentUser.id) ? 'bi-heart-fill text-red-500' : 'bi-heart'}`}
                    ></i>
                    <i className="bi bi-chat hover:opacity-60 cursor-pointer"></i>
                    <Link to="/direct/inbox" className="text-ig-text flex items-center hover:opacity-60 transition">
                      <i className="bi bi-send"></i>
                    </Link>
                  </div>
                  <i 
                    onClick={() => handleModalSaveToggle(selectedPost)}
                    className={`cursor-pointer hover:opacity-60 transition text-xl bi ${saves.some(s => s.postId === selectedPost.id) ? 'bi-bookmark-fill' : 'bi-bookmark'}`}
                  ></i>
                </div>
                <p className="font-semibold text-sm text-ig-text text-left">
                  {likes.filter(l => l.postId === selectedPost.id).length} likes
                </p>

                {/* Add Comment Box inside Modal */}
                <form onSubmit={handleModalAddComment} className="flex items-center gap-2 mt-3 pt-2 border-t border-ig-border">
                  <input 
                    type="text" 
                    placeholder="Add a comment..."
                    className="flex-grow border-0 text-sm focus:outline-none bg-transparent placeholder-ig-muted text-ig-text"
                    value={modalCommentText}
                    onChange={(e) => setModalCommentText(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!modalCommentText.trim()}
                    className="text-sky-500 font-semibold text-sm bg-transparent border-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:text-sky-700 transition"
                  >
                    Post
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Explore;
