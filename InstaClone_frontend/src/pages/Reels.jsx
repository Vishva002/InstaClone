import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { likeAPI, savedAPI, followerAPI, notificationAPI } from '../services/api';
import api from '../services/api';

function Reels() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [reels, setReels] = useState([
    {
      id: "1",
      userId: "2",
      username: "sowgar",
      profilePic: "https://i.pravatar.cc/150?img=1",
      bgImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80",
      caption: "Chasing sunsets in Maldives! 🌴🌊 #travel #wanderlust #sunset",
      audio: "Original Audio - sowgar",
      likesCount: 154200
    },
    {
      id: "2",
      userId: "3",
      username: "emma",
      profilePic: "https://i.pravatar.cc/150?img=3",
      bgImage: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
      caption: "Creating the ultimate breakfast plate 🍳✨ #foodie #cooking #recipe",
      audio: "Lo-Fi Beats - Creative Music Studio",
      likesCount: 94800
    },
    {
      id: "3",
      userId: "5",
      username: "alex_07",
      profilePic: "https://i.pravatar.cc/150?img=12",
      bgImage: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=500&auto=format&fit=crop&q=80",
      caption: "First try down the triple set! 🛹🔥 #skateboarding #streetstyle",
      audio: "Rock Anthem - skate_skate",
      likesCount: 212500
    }
  ]);

  const [dbLikes, setDbLikes] = useState([]);
  const [dbSaves, setDbSaves] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInteractions();
  }, [currentUser]);

  const loadInteractions = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [likesData, savesData, followingsData] = await Promise.all([
        api.get('/likes').then(res => res.data),
        savedAPI.getByUser(currentUser.id),
        followerAPI.getFollowing(currentUser.id)
      ]);
      setDbLikes(likesData);
      setDbSaves(savesData);
      setFollowings(followingsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeToggle = async (reelId, reelOwnerId) => {
    const virtualPostId = `reel_${reelId}`;
    const existingLike = dbLikes.find(l => l.postId === virtualPostId && l.userId === currentUser.id);

    try {
      if (existingLike) {
        await likeAPI.delete(existingLike.id);
        setDbLikes(prev => prev.filter(l => l.id !== existingLike.id));
      } else {
        const created = await likeAPI.create({ postId: virtualPostId, userId: currentUser.id });
        setDbLikes(prev => [...prev, created]);
        
        // Notify owner
        if (currentUser.id !== reelOwnerId) {
          await notificationAPI.create({
            senderId: currentUser.id,
            senderUsername: currentUser.username,
            senderProfilePic: currentUser.profilePic,
            receiverId: reelOwnerId,
            type: "like",
            postId: "",
            detail: "liked your reel.",
            read: false,
            time: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveToggle = async (reelId) => {
    const virtualPostId = `reel_${reelId}`;
    const existingSave = dbSaves.find(s => s.postId === virtualPostId);

    try {
      if (existingSave) {
        await savedAPI.delete(existingSave.id);
        setDbSaves(prev => prev.filter(s => s.id !== existingSave.id));
        showToast("Reel unsaved", "info");
      } else {
        const created = await savedAPI.create({ postId: virtualPostId, userId: currentUser.id });
        setDbSaves(prev => [...prev, created]);
        showToast("Reel saved", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFollowToggle = async (reel) => {
    const isFollowing = followings.find(f => f.followingId === reel.userId);
    try {
      if (isFollowing) {
        await followerAPI.delete(isFollowing.id);
        setFollowings(prev => prev.filter(f => f.id !== isFollowing.id));
        showToast(`Unfollowed ${reel.username}`, "info");
      } else {
        const payload = {
          followerId: currentUser.id,
          followingId: reel.userId
        };
        const created = await followerAPI.create(payload);
        setFollowings(prev => [...prev, created]);
        showToast(`Followed ${reel.username}`, "success");

        await notificationAPI.create({
          senderId: currentUser.id,
          senderUsername: currentUser.username,
          senderProfilePic: currentUser.profilePic,
          receiverId: reel.userId,
          type: "follow",
          postId: "",
          detail: "started following you.",
          read: false,
          time: new Date().toISOString()
        });
      }
    } catch (err) {
      showToast("Operation failed.", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center text-ig-muted">
        <div className="spinner-border text-secondary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="h-[88vh] overflow-y-scroll snap-y snap-mandatory scrollbar-none no-scrollbar py-2 flex flex-col items-center gap-8 text-white">
      {reels.map((reel) => {
        const virtualPostId = `reel_${reel.id}`;
        const isLiked = dbLikes.some(l => l.postId === virtualPostId && l.userId === currentUser.id);
        const isSaved = dbSaves.some(s => s.postId === virtualPostId);
        const isFollowing = followings.some(f => f.followingId === reel.userId);
        
        // Calculate display likes
        const displayLikes = isLiked ? reel.likesCount + 1 : reel.likesCount;
        const formattedLikes = (displayLikes / 1000).toFixed(1) + "K";

        return (
          <div 
            key={reel.id} 
            className="snap-start shrink-0 w-full max-w-[360px] h-[72vh] md:h-[78vh] bg-black rounded-lg overflow-hidden relative shadow-2xl flex items-center justify-center border border-ig-border"
          >
            {/* Reel Image Content */}
            <img 
              src={reel.bgImage} 
              alt="Reel content" 
              className="w-full h-full object-cover select-none pointer-events-none"
            />

            {/* Dark gradient overlay for readable text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35 pointer-events-none"></div>

            {/* Top header overlay */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center text-white text-lg font-bold">
              <span className="text-base">Reels</span>
              <i className="bi bi-camera hover:opacity-75 cursor-pointer"></i>
            </div>

            {/* Left panel overlay info */}
            <div className="absolute bottom-4 left-4 right-14 text-white flex flex-col gap-2 text-left">
              <div className="flex items-center gap-2">
                <img 
                  src={reel.profilePic} 
                  alt={reel.username} 
                  className="w-8 h-8 rounded-full border border-white object-cover shrink-0"
                />
                <span className="font-semibold text-sm truncate max-w-[120px]">{reel.username}</span>
                {reel.userId !== currentUser.id && (
                  <button 
                    onClick={() => handleFollowToggle(reel)}
                    className="px-2 py-0.5 text-[10px] border border-white rounded font-bold hover:bg-white/10 transition cursor-pointer bg-transparent"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
              
              <p className="text-xs text-gray-200 line-clamp-2 pr-2">{reel.caption}</p>

              {/* Moving Audio Name */}
              <div className="flex items-center gap-1.5 text-[10px] bg-black/40 px-2.5 py-1 rounded-full w-fit max-w-[180px] overflow-hidden">
                <i className="bi bi-music-note-beamed"></i>
                <span className="whitespace-nowrap font-medium truncate">{reel.audio}</span>
              </div>
            </div>

            {/* Right vertical action bar */}
            <div className="absolute bottom-4 right-2.5 flex flex-col gap-4.5 items-center text-white z-10">
              {/* Heart */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleLikeToggle(reel.id, reel.userId)}
                  className={`p-2 bg-black/30 hover:bg-black/50 rounded-full text-xl transition cursor-pointer border-0 ${isLiked ? 'text-red-500' : 'text-white'}`}
                >
                  <i className={`bi ${isLiked ? 'bi-heart-fill text-red-500 animate-heart-pop' : 'bi-heart'}`}></i>
                </button>
                <span className="text-[10px] font-bold mt-1 shadow-sm">{formattedLikes}</span>
              </div>

              {/* Comment */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => showToast("Comments coming soon!", "info")}
                  className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-xl cursor-pointer border-0 text-white"
                >
                  <i className="bi bi-chat"></i>
                </button>
                <span className="text-[10px] font-bold mt-1 shadow-sm">285</span>
              </div>

              {/* Send */}
              <button 
                onClick={() => showToast("Link copied to clipboard!", "success")}
                className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-xl cursor-pointer border-0 text-white"
              >
                <i className="bi bi-send"></i>
              </button>

              {/* Bookmark */}
              <button 
                onClick={() => handleSaveToggle(reel.id)}
                className={`p-2 bg-black/30 hover:bg-black/50 rounded-full text-xl transition cursor-pointer border-0 ${isSaved ? 'text-white' : 'text-white/80'}`}
              >
                <i className={`bi ${isSaved ? 'bi-bookmark-fill' : 'bi-bookmark'}`}></i>
              </button>

              {/* Option */}
              <button className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-lg cursor-pointer border-0 text-white">
                <i className="bi bi-three-dots"></i>
              </button>

              {/* Spinning disk icon */}
              <div className="w-8 h-8 rounded-full border border-gray-400 overflow-hidden mt-1 p-[2px] animate-spin bg-gray-950">
                <img src={reel.profilePic} className="w-full h-full rounded-full object-cover" alt="" />
              </div>
            </div>

          </div>
        );
      })}
      </div>
    );
}

export default Reels;
