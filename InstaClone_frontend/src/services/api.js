import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// User API
export const userAPI = {
  getAll: () => api.get('/users').then(res => res.data),
  getById: (id) => api.get(`/users/${id}`).then(res => res.data),
  getByUsername: (username) => api.get(`/users?username=${username}`).then(res => res.data),
  getByEmail: (email) => api.get(`/users?email=${email}`).then(res => res.data),
  create: (userData) => api.post('/users', userData).then(res => res.data),
  update: (id, userData) => api.patch(`/users/${id}`, userData).then(res => res.data),
};

// Post API
export const postAPI = {
  getAll: async (limit = 10, page = 1) => {
    const res = await api.get('/posts');
    const sorted = (res.data || []).sort((a, b) => new Date(b.time) - new Date(a.time));
    const start = (page - 1) * limit;
    return sorted.slice(start, start + limit);
  },
  getAllUnpaginated: async () => {
    const res = await api.get('/posts');
    return (res.data || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  },
  getById: (id) => api.get(`/posts/${id}`).then(res => res.data),
  getByUser: async (userId) => {
    const res = await api.get(`/posts?userId=${userId}`);
    return (res.data || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  },
  getByUsername: async (username) => {
    const res = await api.get(`/posts?username=${username}`);
    return (res.data || []).sort((a, b) => new Date(b.time) - new Date(a.time));
  },
  create: (postData) => api.post('/posts', postData).then(res => res.data),
  update: (id, postData) => api.patch(`/posts/${id}`, postData).then(res => res.data),
  delete: (id) => api.delete(`/posts/${id}`).then(res => res.data),
};

// Stories API
export const storyAPI = {
  getAll: () => api.get('/stories?_sort=time&_order=desc').then(res => res.data),
  create: (storyData) => api.post('/stories', storyData).then(res => res.data),
  update: (id, storyData) => api.patch(`/stories/${id}`, storyData).then(res => res.data),
};

// Comments API
export const commentAPI = {
  getByPost: (postId) => api.get(`/comments?postId=${postId}&_sort=time&_order=asc`).then(res => res.data),
  create: (commentData) => api.post('/comments', commentData).then(res => res.data),
  update: (id, commentData) => api.patch(`/comments/${id}`, commentData).then(res => res.data),
  delete: (id) => api.delete(`/comments/${id}`).then(res => res.data),
  deleteByPost: async (postId) => {
    const comments = await commentAPI.getByPost(postId);
    const deletePromises = comments.map(c => commentAPI.delete(c.id));
    return Promise.all(deletePromises);
  }
};

// Likes API
export const likeAPI = {
  getByPost: (postId) => api.get(`/likes?postId=${postId}`).then(res => res.data),
  getByUser: (userId) => api.get(`/likes?userId=${userId}`).then(res => res.data),
  create: (likeData) => api.post('/likes', likeData).then(res => res.data),
  delete: (id) => api.delete(`/likes/${id}`).then(res => res.data),
  deleteByPost: async (postId) => {
    const likes = await likeAPI.getByPost(postId);
    const deletePromises = likes.map(l => likeAPI.delete(l.id));
    return Promise.all(deletePromises);
  }
};

// Saved API
export const savedAPI = {
  getByUser: (userId) => api.get(`/saved?userId=${userId}`).then(res => res.data),
  create: (savedData) => api.post('/saved', savedData).then(res => res.data),
  delete: (id) => api.delete(`/saved/${id}`).then(res => res.data),
  deleteByPost: async (postId) => {
    const saved = await api.get(`/saved?postId=${postId}`).then(res => res.data);
    const deletePromises = saved.map(s => savedAPI.delete(s.id));
    return Promise.all(deletePromises);
  }
};

// Followers API
export const followerAPI = {
  getFollowers: (userId) => api.get(`/followers?followingId=${userId}`).then(res => res.data),
  getFollowing: (userId) => api.get(`/followers?followerId=${userId}`).then(res => res.data),
  create: (followData) => api.post('/followers', followData).then(res => res.data),
  delete: (id) => api.delete(`/followers/${id}`).then(res => res.data),
};

// Notifications API
export const notificationAPI = {
  getByUser: (userId) => api.get(`/notifications?receiverId=${userId}&_sort=time&_order=desc`).then(res => res.data),
  create: (notificationData) => api.post('/notifications', notificationData).then(res => res.data),
  markAsRead: (id) => api.patch(`/notifications/${id}`, { read: true }).then(res => res.data),
  delete: (id) => api.delete(`/notifications/${id}`).then(res => res.data),
};

// Messages API
export const messageAPI = {
  getAllForUser: (userId) => api.get(`/messages?senderId=${userId}`).then(res => res.data), // can get receiverId side too
  getChat: async (user1Id, user2Id) => {
    const sent = await api.get(`/messages?senderId=${user1Id}&receiverId=${user2Id}`).then(res => res.data);
    const received = await api.get(`/messages?senderId=${user2Id}&receiverId=${user1Id}`).then(res => res.data);
    return [...sent, ...received].sort((a, b) => new Date(a.time) - new Date(b.time));
  },
  create: (messageData) => api.post('/messages', messageData).then(res => res.data),
};

export default api;
