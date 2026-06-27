import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { postAPI, commentAPI, likeAPI, savedAPI, followerAPI, notificationAPI } from "../services/api";
import { PostSkeleton } from "../components/SkeletonLoader";
import api from "../services/api";

function Post() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Interaction collections loaded in state
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [saves, setSaves] = useState([]);
  const [followings, setFollowings] = useState([]);

  // UI state variables
  const [expandedComments, setExpandedComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [animatingHearts, setAnimatingHearts] = useState({});

  // Options modal state
  const [activeMenuPost, setActiveMenuPost] = useState(null);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [editCaptionText, setEditCaptionText] = useState("");

  useEffect(() => {
    loadInitialData();
  }, [currentUser]);

  const loadInitialData = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      
      // Fetch posts (page 1)
      const postsData = await postAPI.getAll(3, 1);
      setPosts(postsData);
      if (postsData.length < 3) setHasMore(false);

      // Fetch interactions
      const [likesData, commentsData, savesData, followingData] = await Promise.all([
        api.get('/likes').then(res => res.data),
        api.get('/comments').then(res => res.data),
        savedAPI.getByUser(currentUser.id),
        followerAPI.getFollowing(currentUser.id)
      ]);

      setLikes(likesData);
      setComments(commentsData);
      setSaves(savesData);
      setFollowings(followingData);
    } catch (err) {
      console.error("Failed to load feed data:", err);
      showToast("Error loading feed content.", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const nextPosts = await postAPI.getAll(3, nextPage);
      if (nextPosts.length < 3) {
        setHasMore(false);
      }
      setPosts(prev => [...prev, ...nextPosts]);
      setPage(nextPage);
    } catch (err) {
      console.error(err);
      showToast("Failed to load more posts.", "error");
    } finally {
      setLoadingMore(false);
    }
  };

  // Follow/Unfollow User Handler
  const handleFollowToggle = async (postUser) => {
    const isFollowing = followings.find(f => f.followingId === postUser.userId);
    try {
      if (isFollowing) {
        // Unfollow
        await followerAPI.delete(isFollowing.id);
        setFollowings(prev => prev.filter(f => f.id !== isFollowing.id));
        showToast(`Unfollowed ${postUser.username}`, "info");
      } else {
        // Follow
        const payload = {
          followerId: currentUser.id,
          followingId: postUser.userId
        };
        const created = await followerAPI.create(payload);
        setFollowings(prev => [...prev, created]);
        showToast(`Started following ${postUser.username}`, "success");

        // Send Notification
        await notificationAPI.create({
          senderId: currentUser.id,
          senderUsername: currentUser.username,
          senderProfilePic: currentUser.profilePic,
          receiverId: postUser.userId,
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

  // Like Toggle Handler
  const handleLikeToggle = async (postId, postOwnerId) => {
    const existingLike = likes.find(l => l.postId === postId && l.userId === currentUser.id);
    try {
      if (existingLike) {
        await likeAPI.delete(existingLike.id);
        setLikes(prev => prev.filter(l => l.id !== existingLike.id));
      } else {
        const created = await likeAPI.create({ postId, userId: currentUser.id });
        setLikes(prev => [...prev, created]);
        
        // Notify owner (if not liking own post)
        if (currentUser.id !== postOwnerId) {
          await notificationAPI.create({
            senderId: currentUser.id,
            senderUsername: currentUser.username,
            senderProfilePic: currentUser.profilePic,
            receiverId: postOwnerId,
            type: "like",
            postId,
            detail: "liked your photo.",
            read: false,
            time: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Image Double Click Trigger
  const handleImageDoubleClick = (postId, postOwnerId) => {
    const isLiked = likes.some(l => l.postId === postId && l.userId === currentUser.id);
    if (!isLiked) {
      handleLikeToggle(postId, postOwnerId);
    }

    setAnimatingHearts(prev => ({ ...prev, [postId]: true }));
    setTimeout(() => {
      setAnimatingHearts(prev => ({ ...prev, [postId]: false }));
    }, 800);
  };

  // Save/Unsave Toggle Handler
  const handleSaveToggle = async (postId) => {
    const existingSave = saves.find(s => s.postId === postId);
    try {
      if (existingSave) {
        await savedAPI.delete(existingSave.id);
        setSaves(prev => prev.filter(s => s.id !== existingSave.id));
        showToast("Post unsaved.", "info");
      } else {
        const created = await savedAPI.create({ postId, userId: currentUser.id });
        setSaves(prev => [...prev, created]);
        showToast("Saved to collection.", "success");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Comment Submitting
  const handleAddComment = async (postId, postOwnerId) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const payload = {
        postId,
        userId: currentUser.id,
        username: currentUser.username,
        profilePic: currentUser.profilePic,
        comment: text.trim(),
        time: new Date().toISOString()
      };
      
      const created = await commentAPI.create(payload);
      setComments(prev => [...prev, created]);
      setCommentInputs(prev => ({ ...prev, [postId]: '' }));

      // Notify owner
      if (currentUser.id !== postOwnerId) {
        await notificationAPI.create({
          senderId: currentUser.id,
          senderUsername: currentUser.username,
          senderProfilePic: currentUser.profilePic,
          receiverId: postOwnerId,
          type: "comment",
          postId,
          detail: `commented: "${text.trim().substring(0, 20)}..."`,
          read: false,
          time: new Date().toISOString()
        });
      }
      showToast("Comment added", "success");
    } catch (err) {
      showToast("Failed to add comment.", "error");
    }
  };

  // Comment Editing
  const startEditComment = (cId, cText) => {
    setEditingCommentId(cId);
    setEditingCommentText(cText);
  };

  const saveEditedComment = async (cId) => {
    if (!editingCommentText.trim()) return;
    try {
      await commentAPI.update(cId, { comment: editingCommentText.trim() });
      setComments(prev => prev.map(c => c.id === cId ? { ...c, comment: editingCommentText.trim() } : c));
      setEditingCommentId(null);
      showToast("Comment updated", "success");
    } catch (err) {
      showToast("Failed to update comment", "error");
    }
  };

  // Comment Deleting
  const handleDeleteComment = async (cId) => {
    try {
      await commentAPI.delete(cId);
      setComments(prev => prev.filter(c => c.id !== cId));
      showToast("Comment deleted", "info");
    } catch (err) {
      showToast("Failed to delete comment", "error");
    }
  };

  // Post Deletion
  const handleDeletePost = async (postId) => {
    try {
      await postAPI.delete(postId);
      // Clean relationships in DB
      await Promise.all([
        commentAPI.deleteByPost(postId),
        likeAPI.deleteByPost(postId),
        savedAPI.deleteByPost(postId)
      ]);
      setPosts(prev => prev.filter(p => p.id !== postId));
      setActiveMenuPost(null);
      showToast("Post deleted successfully.", "success");
    } catch (err) {
      showToast("Failed to delete post.", "error");
    }
  };

  // Edit Caption
  const handleEditCaptionSubmit = async () => {
    if (!activeMenuPost || !editCaptionText.trim()) return;
    try {
      await postAPI.update(activeMenuPost.id, { caption: editCaptionText.trim() });
      setPosts(prev => prev.map(p => p.id === activeMenuPost.id ? { ...p, caption: editCaptionText.trim() } : p));
      setIsEditingCaption(false);
      setActiveMenuPost(null);
      showToast("Caption updated.", "success");
    } catch (err) {
      showToast("Failed to update caption.", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20 text-ig-text">
      {posts.map((post) => {
        const postLikes = likes.filter(l => l.postId === post.id);
        const postComments = comments.filter(c => c.postId === post.id);
        const isLiked = likes.some(l => l.postId === post.id && l.userId === currentUser.id);
        const isSaved = saves.some(s => s.postId === post.id);
        const isFollowing = followings.some(f => f.followingId === post.userId);
        
        const showAllComments = expandedComments[post.id];
        const commentsToDisplay = showAllComments ? postComments : postComments.slice(-2);

        return (
          <div key={post.id} className="bg-ig-card border border-ig-border rounded-lg max-w-[470px] w-full mx-auto overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center px-4 py-3 border-b border-ig-border">
              <div className="flex items-center gap-3">
                <Link to={`/profile?username=${post.username}`} className="block">
                  <img
                    src={post.profilePic}
                    alt={post.username}
                    className="w-8 h-8 rounded-full object-cover border border-ig-border"
                  />
                </Link>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <Link to={`/profile?username=${post.username}`} className="font-semibold text-sm text-ig-text leading-tight no-underline hover:underline">
                      {post.username}
                    </Link>
                    {post.userId !== currentUser.id && (
                      <>
                        <span className="text-[10px] text-ig-muted font-bold">•</span>
                        <button 
                          onClick={() => handleFollowToggle(post)}
                          className={`text-xs font-bold border-0 bg-transparent cursor-pointer transition ${isFollowing ? 'text-ig-text' : 'text-sky-500 hover:text-sky-700'}`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] text-ig-muted block leading-none mt-1">{post.location}</span>
                </div>
              </div>
              <i 
                onClick={() => {
                  setActiveMenuPost(post);
                  setEditCaptionText(post.caption);
                }}
                className="bi bi-three-dots text-lg cursor-pointer hover:opacity-60 text-ig-text"
              ></i>
            </div>

            {/* Image Container with Double Click */}
            <div 
              className="relative w-full cursor-pointer bg-zinc-50 dark:bg-zinc-900 overflow-hidden flex items-center justify-center"
              onDoubleClick={() => handleImageDoubleClick(post.id, post.userId)}
            >
              <img
                src={post.postImage}
                alt="Post content"
                className="w-full h-auto max-h-[585px] object-cover block"
              />
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 text-7xl text-white pointer-events-none z-10 opacity-0 ${animatingHearts[post.id] ? 'animate-heart-pulse' : ''}`}>
                <i className="bi bi-heart-fill"></i>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex justify-between items-center px-4 pt-3 pb-2 text-ig-text">
              <div className="flex gap-4 text-2xl">
                <i 
                  className={`cursor-pointer hover:opacity-60 transition bi ${isLiked ? 'bi-heart-fill text-red-500 animate-heart-pop' : 'bi-heart'}`}
                  onClick={() => handleLikeToggle(post.id, post.userId)}
                ></i>
                <i className="bi bi-chat cursor-pointer hover:opacity-60 transition" onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}></i>
                <Link to="/direct/inbox" className="text-ig-text flex items-center hover:opacity-60 transition">
                  <i className="bi bi-send"></i>
                </Link>
              </div>
              <i 
                className={`cursor-pointer hover:opacity-60 transition text-xl bi ${isSaved ? 'bi-bookmark-fill text-ig-text' : 'bi-bookmark'}`}
                onClick={() => handleSaveToggle(post.id)}
              ></i>
            </div>

            {/* Likes */}
            <p className="font-semibold text-sm px-4 mb-2 text-left">
              {postLikes.length.toLocaleString()} likes
            </p>

            {/* Caption */}
            <div className="text-sm px-4 mb-2 text-left">
              <Link to={`/profile?username=${post.username}`} className="font-semibold text-ig-text mr-2 no-underline hover:underline">
                {post.username}
              </Link>
              <span className="text-ig-text break-words">{post.caption}</span>
            </div>

            {/* View comments Toggle */}
            {postComments.length > 2 && (
              <p 
                className="text-ig-muted text-sm cursor-pointer px-4 mb-2 hover:opacity-80 text-left" 
                onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
              >
                {showAllComments 
                  ? "Hide comments" 
                  : `View all ${postComments.length} comments`}
              </p>
            )}

            {/* Comments List */}
            <div className="px-4 mb-2 space-y-2">
              {commentsToDisplay.map((comment) => {
                const isOwnComment = comment.userId === currentUser.id;
                
                return (
                  <div key={comment.id} className="flex justify-between items-start text-sm text-left gap-2 group">
                    <div className="flex-1">
                      <Link to={`/profile?username=${comment.username}`} className="font-semibold text-ig-text mr-2 no-underline hover:underline">
                        {comment.username}
                      </Link>
                      {editingCommentId === comment.id ? (
                        <div className="flex items-center gap-2 mt-1">
                          <input 
                            type="text" 
                            className="flex-grow px-2 py-1 border border-ig-border bg-ig-input text-xs rounded"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditedComment(comment.id);
                            }}
                          />
                          <button 
                            onClick={() => saveEditedComment(comment.id)}
                            className="px-2 py-1 bg-sky-500 text-white rounded text-[10px] font-bold"
                          >
                            Save
                          </button>
                          <button 
                            onClick={() => setEditingCommentId(null)}
                            className="px-2 py-1 bg-zinc-300 dark:bg-zinc-700 text-ig-text rounded text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <span className="text-ig-text break-words">{comment.comment}</span>
                      )}
                    </div>

                    {isOwnComment && editingCommentId !== comment.id && (
                      <div className="flex gap-2 text-xs text-ig-muted opacity-0 group-hover:opacity-100 transition shrink-0">
                        <i 
                          onClick={() => startEditComment(comment.id, comment.comment)} 
                          className="bi bi-pencil cursor-pointer hover:text-ig-text"
                          title="Edit"
                        ></i>
                        <i 
                          onClick={() => handleDeleteComment(comment.id)} 
                          className="bi bi-trash cursor-pointer hover:text-red-500"
                          title="Delete"
                        ></i>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time */}
            <small className="text-ig-muted text-[10px] uppercase px-4 block mb-3 text-left">
              {new Date(post.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </small>

            {/* Add Comment Input */}
            <div className="flex items-center border-t border-ig-border px-4 py-3 bg-ig-card">
              <input
                type="text"
                placeholder="Add a comment..."
                className="flex-grow border-0 text-sm focus:outline-none placeholder-ig-muted bg-transparent text-ig-text"
                value={commentInputs[post.id] || ""}
                onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddComment(post.id, post.userId);
                }}
              />
              <button
                className="text-sky-500 font-semibold text-sm bg-transparent border-0 cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:text-sky-700 transition"
                disabled={!(commentInputs[post.id] || "").trim()}
                onClick={() => handleAddComment(post.id, post.userId)}
              >
                Post
              </button>
            </div>
          </div>
        );
      })}

      {/* Load More Button */}
      {hasMore && (
        <div className="flex justify-center mt-2">
          <button 
            onClick={loadMorePosts}
            disabled={loadingMore}
            className="px-6 py-2 border border-ig-border bg-ig-card text-sm font-semibold rounded-md hover:bg-ig-hover transition cursor-pointer text-ig-text"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <span className="spinner-border spinner-border-sm" role="status"></span>
                Loading...
              </span>
            ) : 'Load More'}
          </button>
        </div>
      )}

      {/* Post Actions Dialog Options Modal */}
      {activeMenuPost && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 p-4 animate-fade-in">
          <div className="bg-ig-card border border-ig-border rounded-xl overflow-hidden max-w-[400px] w-full text-center shadow-2xl">
            {activeMenuPost.userId === currentUser.id ? (
              <div className="flex flex-col divide-y divide-ig-border">
                {isEditingCaption ? (
                  <div className="p-4 space-y-3">
                    <h5 className="font-bold text-sm text-ig-text">Edit Post Caption</h5>
                    <textarea 
                      value={editCaptionText}
                      onChange={(e) => setEditCaptionText(e.target.value)}
                      className="w-full px-2 py-1 bg-ig-input border border-ig-border text-sm rounded focus:outline-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleEditCaptionSubmit} 
                        className="flex-1 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded text-xs font-bold border-0 cursor-pointer"
                      >
                        Submit
                      </button>
                      <button 
                        onClick={() => setIsEditingCaption(false)}
                        className="flex-1 py-1.5 bg-zinc-300 dark:bg-zinc-700 text-ig-text rounded text-xs font-bold border-0 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => handleDeletePost(activeMenuPost.id)}
                      className="w-full py-3.5 text-red-500 font-bold text-sm bg-transparent border-0 cursor-pointer hover:bg-red-500/10 transition"
                    >
                      Delete Post
                    </button>
                    <button 
                      onClick={() => setIsEditingCaption(true)}
                      className="w-full py-3.5 text-ig-text text-sm bg-transparent border-0 cursor-pointer hover:bg-ig-hover transition"
                    >
                      Edit Caption
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-ig-border">
                <button 
                  onClick={() => {
                    handleFollowToggle(activeMenuPost);
                    setActiveMenuPost(null);
                  }}
                  className="w-full py-3.5 text-red-500 font-bold text-sm bg-transparent border-0 cursor-pointer hover:bg-red-500/10 transition"
                >
                  {followings.some(f => f.followingId === activeMenuPost.userId) ? 'Unfollow' : 'Follow'}
                </button>
                <button 
                  onClick={() => {
                    showToast("Post reported.", "success");
                    setActiveMenuPost(null);
                  }}
                  className="w-full py-3.5 text-ig-text text-sm bg-transparent border-0 cursor-pointer hover:bg-ig-hover transition"
                >
                  Report
                </button>
              </div>
            )}
            
            {!isEditingCaption && (
              <button 
                onClick={() => setActiveMenuPost(null)}
                className="w-full py-3.5 text-ig-muted text-sm bg-transparent border-0 cursor-pointer hover:bg-ig-hover transition border-t border-ig-border"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Post;