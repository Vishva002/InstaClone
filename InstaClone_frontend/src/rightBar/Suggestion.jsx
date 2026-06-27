import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userAPI, followerAPI, notificationAPI } from "../services/api";

function Suggestion() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [suggestions, setSuggestions] = useState([]);
  const [followings, setFollowings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSuggestions();
  }, [currentUser]);

  const loadSuggestions = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [allUsers, myFollowings] = await Promise.all([
        userAPI.getAll(),
        followerAPI.getFollowing(currentUser.id)
      ]);

      setFollowings(myFollowings);

      // Filter out current user and users that current user is already following
      const followedIds = myFollowings.map(f => f.followingId);
      const filtered = allUsers.filter(
        user => user.id !== currentUser.id && !followedIds.includes(user.id)
      );

      setSuggestions(filtered.slice(0, 5)); // show up to 5 suggestions
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (suggestedUser) => {
    try {
      const payload = {
        followerId: currentUser.id,
        followingId: suggestedUser.id
      };
      
      const created = await followerAPI.create(payload);
      setFollowings(prev => [...prev, created]);
      
      // Remove from recommendations local state immediately
      setSuggestions(prev => prev.filter(s => s.id !== suggestedUser.id));
      showToast(`Followed ${suggestedUser.username}`, "success");

      // Send Notification
      await notificationAPI.create({
        senderId: currentUser.id,
        senderUsername: currentUser.username,
        senderProfilePic: currentUser.profilePic,
        receiverId: suggestedUser.id,
        type: "follow",
        postId: "",
        detail: "started following you.",
        read: false,
        time: new Date().toISOString()
      });
    } catch (err) {
      showToast("Failed to follow user.", "error");
    }
  };

  if (loading || suggestions.length === 0) return null;

  return (
    <div className="py-2 text-ig-text">
      <div className="flex justify-between items-center mb-3.5">
        <span className="text-ig-muted font-semibold text-[14px]">Suggestions for you</span>
        <button className="text-xs font-semibold text-ig-text hover:opacity-60 cursor-pointer p-0 border-0 bg-transparent">See All</button>
      </div>

      <div className="flex flex-col gap-3">
        {suggestions.map((suggestion) => {
          return (
            <div key={suggestion.id} className="w-full flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Link to={`/profile?username=${suggestion.username}`}>
                  <img
                    src={suggestion.profilePic}
                    alt={suggestion.username}
                    className="w-8 h-8 rounded-full object-cover border border-ig-border"
                  />
                </Link>
                <div className="text-left">
                  <Link to={`/profile?username=${suggestion.username}`} className="font-semibold text-sm text-ig-text mb-0.5 no-underline hover:underline block leading-tight">
                    {suggestion.username}
                  </Link>
                  <small className="text-[11px] text-ig-muted max-w-[160px] truncate block leading-tight mt-0.5">
                    Suggested for you
                  </small>
                </div>
              </div>
              <button 
                className="text-xs font-bold text-sky-500 hover:text-sky-700 cursor-pointer bg-transparent border-0"
                onClick={() => handleFollow(suggestion)}
              >
                Follow
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Suggestion;