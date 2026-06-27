import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { userAPI, postAPI, followerAPI, savedAPI, commentAPI, likeAPI, notificationAPI } from '../services/api';
import { ProfileSkeleton } from '../components/SkeletonLoader';
import api from '../services/api';

function Profile() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Parse query parameter (e.g. ?username=sowgar)
  const queryParams = new URLSearchParams(location.search);
  const targetUsername = queryParams.get('username');

  const [profileUser, setProfileUser] = useState(null);
  const [profilePosts, setProfilePosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts');
  const [loading, setLoading] = useState(true);

  // Statistics
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowingTarget, setIsFollowingTarget] = useState(false);

  // Modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [modalComments, setModalComments] = useState([]);
  const [modalCommentText, setModalCommentText] = useState("");
  const [likes, setLikes] = useState([]);
  const [saves, setSaves] = useState([]);

  // Followers / Following List Modals
  const [activeStatsModal, setActiveStatsModal] = useState(null); // 'followers' | 'following' | null
  const [statsUsers, setStatsUsers] = useState([]); // List of user objects for the modal
  const [myFollowings, setMyFollowings] = useState([]); // currentUser's following maps to render buttons

  useEffect(() => {
    loadProfile();
    setActiveTab('posts');
  }, [targetUsername, currentUser]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Determine profile target
      let targetUser = currentUser;
      if (targetUsername && currentUser && targetUsername.toLowerCase() !== currentUser.username.toLowerCase()) {
        const users = await userAPI.getByUsername(targetUsername);
        if (users.length > 0) {
          targetUser = users[0];
        } else {
          // Fallback if user not found
          setProfileUser(null);
          setLoading(false);
          return;
        }
      }

      if (!targetUser) return;
      setProfileUser(targetUser);

      // Fetch posts by target user
      const postsData = await postAPI.getByUser(targetUser.id);
      setProfilePosts(postsData);

      // Fetch statistics (followers, following)
      const [followersList, followingList] = await Promise.all([
        followerAPI.getFollowers(targetUser.id),
        followerAPI.getFollowing(targetUser.id)
      ]);

      setFollowers(followersList);
      setFollowing(followingList);

      // Check if current user is following target
      if (currentUser && targetUser.id !== currentUser.id) {
        const isFollowing = followersList.some(f => f.followerId === currentUser.id);
        setIsFollowingTarget(isFollowing);
      }

      // Fetch saved posts if profile is current user
      if (currentUser && targetUser.id === currentUser.id) {
        const savedData = await savedAPI.getByUser(currentUser.id);
        const postPromises = savedData.map(s => postAPI.getById(s.postId).catch(() => null));
        const resolvedPosts = await Promise.all(postPromises);
        setSavedPosts(resolvedPosts.filter(p => p !== null));
      }

      // Sync interaction mappings
      const [likesData, savesData] = await Promise.all([
        api.get('/likes').then(res => res.data),
        savedAPI.getByUser(currentUser.id)
      ]);
      setLikes(likesData);
      setSaves(savesData);

    } catch (err) {
      console.error(err);
      showToast("Error loading profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser || !profileUser) return;
    try {
      if (isFollowingTarget) {
        // Unfollow target
        const match = followers.find(f => f.followerId === currentUser.id);
        if (match) {
          await followerAPI.delete(match.id);
          setFollowers(prev => prev.filter(f => f.id !== match.id));
          setIsFollowingTarget(false);
          showToast(`Unfollowed ${profileUser.username}`, "info");
        }
      } else {
        // Follow target
        const created = await followerAPI.create({
          followerId: currentUser.id,
          followingId: profileUser.id
        });
        setFollowers(prev => [...prev, created]);
        setIsFollowingTarget(true);
        showToast(`Following ${profileUser.username}`, "success");

        // Send Notification
        await notificationAPI.create({
          senderId: currentUser.id,
          senderUsername: currentUser.username,
          senderProfilePic: currentUser.profilePic,
          receiverId: profileUser.id,
          type: "follow",
          postId: "",
          detail: "started following you.",
          read: false,
          time: new Date().toISOString()
        });
      }
    } catch (e) {
      showToast("Operation failed.", "error");
    }
  };

  // Detailed Modal Click handlers
  const handlePostClick = async (post) => {
    setSelectedPost(post);
    try {
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
        setSavedPosts(prev => prev.filter(p => p.id !== post.id));
        showToast("Post unsaved", "info");
      } else {
        const created = await savedAPI.create({ postId: post.id, userId: currentUser.id });
        setSaves(prev => [...prev, created]);
        setSavedPosts(prev => [...prev, post]);
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
      setModalCommentText("");
    } catch (err) {
      showToast("Failed to post comment", "error");
    }
  };

  // Open Stat Listings (Followers or Following)
  const openStatsModal = async (type) => {
    setActiveStatsModal(type);
    try {
      const usersData = await userAPI.getAll();
      const myFollowingsList = await followerAPI.getFollowing(currentUser.id);
      setMyFollowings(myFollowingsList);

      if (type === 'followers') {
        const followerIds = followers.map(f => f.followerId);
        const matchingUsers = usersData.filter(u => followerIds.includes(u.id));
        setStatsUsers(matchingUsers);
      } else {
        const followingIds = following.map(f => f.followingId);
        const matchingUsers = usersData.filter(u => followingIds.includes(u.id));
        setStatsUsers(matchingUsers);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatModalFollowToggle = async (user) => {
    const isFollowing = myFollowings.find(f => f.followingId === user.id);
    try {
      if (isFollowing) {
        await followerAPI.delete(isFollowing.id);
        setMyFollowings(prev => prev.filter(f => f.id !== isFollowing.id));
        showToast(`Unfollowed ${user.username}`, "info");
      } else {
        const created = await followerAPI.create({
          followerId: currentUser.id,
          followingId: user.id
        });
        setMyFollowings(prev => [...prev, created]);
        showToast(`Following ${user.username}`, "success");
      }
      // Refresh current profile statistics after changes inside modal
      const [updatedFollowers, updatedFollowing] = await Promise.all([
        followerAPI.getFollowers(profileUser.id),
        followerAPI.getFollowing(profileUser.id)
      ]);
      setFollowers(updatedFollowers);
      setFollowing(updatedFollowing);
    } catch (e) {
      showToast("Operation failed.", "error");
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profileUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="text-ig-muted mt-2">The link you followed may be broken or the account may have been removed.</p>
        <Link to="/" className="text-sky-500 font-semibold mt-4 block">Go back to home</Link>
      </div>
    );
  }

  const displayPosts = activeTab === 'posts' ? profilePosts : savedPosts;

  return (
    <div className="max-w-[935px] w-full mx-auto px-4 py-8 text-ig-text">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16 border-b border-ig-border pb-11 mb-8 text-ig-text">
        {/* Avatar */}
        <div className="w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border border-ig-border shrink-0">
          <img 
            src={profileUser.profilePic || 'https://i.pravatar.cc/150'} 
            alt={profileUser.username} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Metadata */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          {/* Username & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <h2 className="text-xl font-semibold text-ig-text">{profileUser.username}</h2>
            <div className="flex items-center gap-2">
              {profileUser.id === currentUser.id ? (
                <>
                  <button 
                    onClick={() => navigate('/profile/edit')}
                    className="px-4 py-1.5 bg-ig-input hover-ig-bg border border-ig-border text-sm font-semibold rounded-md text-ig-text shadow-sm transition cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button 
                    onClick={() => navigate('/settings')}
                    className="px-4 py-1.5 bg-ig-input hover-ig-bg border border-ig-border text-sm font-semibold rounded-md text-ig-text shadow-sm transition cursor-pointer"
                  >
                    Settings
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={handleFollowToggle}
                    className={`px-6 py-1.5 text-sm font-semibold rounded-md shadow-sm transition cursor-pointer border-0 ${isFollowingTarget ? 'bg-ig-input hover-ig-bg text-ig-text border border-ig-border' : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'}`}
                  >
                    {isFollowingTarget ? 'Following' : 'Follow'}
                  </button>
                  <button 
                    onClick={() => navigate('/direct/inbox')}
                    className="px-4 py-1.5 bg-ig-input hover-ig-bg border border-ig-border text-sm font-semibold rounded-md text-ig-text shadow-sm transition cursor-pointer"
                  >
                    Message
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats count Row */}
          <div className="flex justify-center md:justify-start gap-8 text-sm md:text-base text-ig-text">
            <span><b className="font-semibold">{profilePosts.length}</b> posts</span>
            <span onClick={() => openStatsModal('followers')} className="cursor-pointer hover:underline">
              <b className="font-semibold">{followers.length}</b> followers
            </span>
            <span onClick={() => openStatsModal('following')} className="cursor-pointer hover:underline">
              <b className="font-semibold">{following.length}</b> following
            </span>
          </div>

          {/* Bio Row */}
          <div className="text-sm text-left">
            <h1 className="font-semibold text-ig-text mb-1 leading-tight">{profileUser.name}</h1>
            <p className="text-ig-text leading-relaxed whitespace-pre-line">{profileUser.bio || 'No bio yet.'}</p>
            {profileUser.website && (
              <a href={`https://${profileUser.website}`} target="_blank" rel="noopener noreferrer" className="text-sky-700 dark:text-sky-400 font-semibold no-underline hover:underline block mt-1">
                <i className="bi bi-link-45deg me-0.5 text-sm"></i>
                {profileUser.website}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-t border-ig-border flex justify-center gap-12 text-xs tracking-wider uppercase font-semibold text-ig-muted">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[1px] transition cursor-pointer ${activeTab === 'posts' ? 'border-ig-text text-ig-text' : 'border-transparent hover:text-ig-text'}`}
        >
          <i className="bi bi-grid-3x3"></i>
          Posts
        </button>
        {profileUser.id === currentUser.id && (
          <button 
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-1.5 py-4 border-t-2 -mt-[1px] transition cursor-pointer ${activeTab === 'saved' ? 'border-ig-text text-ig-text' : 'border-transparent hover:text-ig-text'}`}
          >
            <i className="bi bi-bookmark"></i>
            Saved
          </button>
        )}
      </div>

      {/* Profile grid content */}
      {displayPosts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 md:gap-7 mt-6">
          {displayPosts.map((post) => {
            const postLikes = likes.filter(l => l.postId === post.id).length;
            const postComments = comments.filter(c => c.postId === post.id).length;

            return (
              <div 
                key={post.id} 
                className="relative aspect-square cursor-pointer group bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-ig-border animate-fade-in"
                onClick={() => handlePostClick(post)}
              >
                <img 
                  src={post.postImage} 
                  alt={post.caption} 
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white font-semibold transition duration-200">
                  <span className="flex items-center gap-2 text-lg">
                    <i className="bi bi-heart-fill"></i>
                    {postLikes}
                  </span>
                  <span className="flex items-center gap-2 text-lg">
                    <i className="bi bi-chat-fill"></i>
                    {postComments}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-20 text-center text-ig-text">
          <div className="w-16 h-16 rounded-full border border-ig-border flex items-center justify-center mb-4 text-2xl text-ig-muted">
            <i className={activeTab === 'posts' ? 'bi bi-camera' : 'bi-bookmark'}></i>
          </div>
          <h3 className="font-bold text-lg mb-1">
            {activeTab === 'posts' ? 'Share Photos' : 'Save Photos'}
          </h3>
          <p className="text-sm text-ig-muted max-w-[280px]">
            {activeTab === 'posts' 
              ? 'When you share photos, they will appear on your profile.' 
              : 'Save photos and videos that you want to see again.'}
          </p>
        </div>
      )}

      {/* Grid Post Popup Detail Viewer Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-ig-card rounded-lg max-w-[850px] w-full h-[600px] flex flex-col md:flex-row overflow-hidden shadow-2xl relative border border-ig-border"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              className="absolute top-3 right-3 text-ig-text hover:opacity-75 md:hidden z-10 text-xl cursor-pointer bg-transparent border-0"
              onClick={() => setSelectedPost(null)}
            >
              <i className="bi bi-x-lg"></i>
            </button>

            {/* Left side image */}
            <div className="flex-1 bg-black flex items-center justify-center min-w-0">
              <img 
                src={selectedPost.postImage} 
                alt="Post content" 
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Right side comment details */}
            <div className="w-full md:w-[340px] shrink-0 flex flex-col bg-ig-card h-full min-h-0 border-l border-ig-border">
              <div className="p-4 border-b border-ig-border flex items-center gap-3">
                <img 
                  src={selectedPost.profilePic} 
                  alt={selectedPost.username} 
                  className="w-8 h-8 rounded-full object-cover border border-ig-border"
                />
                <div className="text-left">
                  <h6 className="font-semibold text-sm text-ig-text leading-none mb-1">{selectedPost.username}</h6>
                  <small className="text-ig-muted text-xs">{selectedPost.location}</small>
                </div>
              </div>

              {/* Scroll list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar min-h-0 text-left">
                {selectedPost.caption && (
                  <div className="flex gap-3 text-sm items-start">
                    <img src={selectedPost.profilePic} alt="" className="w-6 h-6 rounded-full object-cover border border-ig-border" />
                    <div>
                      <span className="font-semibold text-ig-text mr-2">{selectedPost.username}</span>
                      <span className="text-ig-text break-words">{selectedPost.caption}</span>
                    </div>
                  </div>
                )}

                {modalComments.length > 0 ? (
                  modalComments.map((c) => (
                    <div key={c.id} className="flex gap-3 text-sm items-start">
                      <img src={c.profilePic} alt="" className="w-6 h-6 rounded-full object-cover border border-ig-border" />
                      <div>
                        <span className="font-semibold text-ig-text mr-2">{c.username}</span>
                        <span className="text-ig-text break-words">{c.comment}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-ig-muted text-xs py-10">No comments yet.</div>
                )}
              </div>

              {/* Footer action bar */}
              <div className="p-4 border-t border-ig-border bg-ig-card">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex gap-4 text-xl text-ig-text">
                    <i 
                      onClick={() => handleModalLikeToggle(selectedPost)}
                      className={`cursor-pointer hover:opacity-60 transition bi ${likes.some(l => l.postId === selectedPost.id && l.userId === currentUser.id) ? 'bi-heart-fill text-red-500' : 'bi-heart'}`}
                    ></i>
                    <i className="bi bi-chat hover:opacity-60 cursor-pointer"></i>
                    <Link to="/direct/inbox" onClick={() => setSelectedPost(null)} className="text-ig-text flex items-center hover:opacity-60 transition">
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

      {/* Followers / Following Listings Modal */}
      {activeStatsModal && (
        <div 
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 p-4 animate-fade-in"
          onClick={() => setActiveStatsModal(null)}
        >
          <div 
            className="bg-ig-card border border-ig-border rounded-xl max-w-[400px] w-full h-[400px] flex flex-col overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-11 border-b border-ig-border flex justify-between items-center px-4 shrink-0 bg-ig-card">
              <span className="w-8"></span>
              <span className="font-semibold text-ig-text capitalize">{activeStatsModal}</span>
              <button 
                onClick={() => setActiveStatsModal(null)}
                className="text-ig-text hover:opacity-70 cursor-pointer text-lg bg-transparent border-0 p-0 flex items-center"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 no-scrollbar bg-ig-card">
              {statsUsers.length > 0 ? (
                statsUsers.map(user => {
                  const isFollowingUser = myFollowings.some(f => f.followingId === user.id);
                  
                  return (
                    <div key={user.id} className="flex justify-between items-center text-left">
                      <div 
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => {
                          setActiveStatsModal(null);
                          navigate(`/profile?username=${user.username}`);
                        }}
                      >
                        <img 
                          src={user.profilePic} 
                          className="w-10 h-10 rounded-full object-cover border border-ig-border" 
                          alt="" 
                        />
                        <div>
                          <p className="font-semibold text-sm text-ig-text leading-tight mb-0.5">{user.username}</p>
                          <p className="text-xs text-ig-muted leading-tight">{user.name}</p>
                        </div>
                      </div>
                      
                      {user.id !== currentUser.id && (
                        <button 
                          onClick={() => handleStatModalFollowToggle(user)}
                          className={`px-4 py-1 text-xs font-semibold rounded border-0 transition cursor-pointer ${isFollowingUser ? 'bg-ig-input hover-ig-bg text-ig-text border border-ig-border' : 'bg-[#0095f6] hover:bg-[#1877f2] text-white'}`}
                        >
                          {isFollowingUser ? 'Following' : 'Follow'}
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-ig-muted text-xs py-20">
                  No {activeStatsModal} list.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
