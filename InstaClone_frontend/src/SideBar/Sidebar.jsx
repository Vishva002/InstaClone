import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userAPI, notificationAPI } from '../services/api';
import instagramText from '../assets/instatext.png';

function Sidebar({ 
  isSearchOpen, 
  setSearchOpen, 
  isNotificationsOpen, 
  setNotificationsOpen, 
  onCreateOpen 
}) {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isDirectMessages = location.pathname.startsWith('/direct');
  
  // Sidebar collapses to slim mode when drawers are open or Direct Messages is open
  const isSlim = isSearchOpen || isNotificationsOpen || isDirectMessages;

  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    // Fetch users for search utility
    userAPI.getAll()
      .then(data => {
        // Exclude current user from suggestions/search matching list optionally, or keep all
        setAllUsers(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    // Fetch notifications if open
    if (isNotificationsOpen && currentUser) {
      notificationAPI.getByUser(currentUser.id)
        .then(data => {
          setNotifications(data);
          
          // Mark unread notifications as read
          const unread = data.filter(n => !n.read);
          if (unread.length > 0) {
            Promise.all(unread.map(n => notificationAPI.markAsRead(n.id)))
              .catch(err => console.error("Error reading notifications:", err));
          }
        })
        .catch(err => console.error(err));
    }
  }, [isNotificationsOpen, currentUser]);

  const menuItems = [
    { name: 'Home', path: '/', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill' },
    { name: 'Search', path: null, icon: 'bi-search', activeIcon: 'bi-search' },
    { name: 'Explore', path: '/explore', icon: 'bi-compass', activeIcon: 'bi-compass-fill' },
    { name: 'Reels', path: '/reels', icon: 'bi-play-circle', activeIcon: 'bi-play-circle-fill' },
    { name: 'Messages', path: '/direct/inbox', icon: 'bi-send', activeIcon: 'bi-send-fill' },
    { name: 'Notifications', path: null, icon: 'bi-bell', activeIcon: 'bi-bell-fill' },
    { name: 'Create', path: null, icon: 'bi-plus-square', activeIcon: 'bi-plus-square-fill' },
    { name: 'Profile', path: '/profile', icon: null } // Custom element (profile avatar)
  ];

  const handleItemClick = (name) => {
    setIsMoreOpen(false);
    if (name === 'Search') {
      setSearchOpen(!isSearchOpen);
      setNotificationsOpen(false);
    } else if (name === 'Notifications') {
      setNotificationsOpen(!isNotificationsOpen);
      setSearchOpen(false);
    } else if (name === 'Create') {
      onCreateOpen();
    } else {
      // Normal route selection, close sliding panels
      setSearchOpen(false);
      setNotificationsOpen(false);
    }
  };

  const filteredUsers = searchQuery.trim()
    ? allUsers.filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : allUsers.slice(0, 5);

  const handleUserClick = (username) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(`/profile?username=${username}`);
  };

  const handleNotificationFollowBack = async (e, notif) => {
    e.stopPropagation();
    // In a real flow, this would add follower relationship, but we can redirect to profile
    navigate(`/profile?username=${notif.senderUsername}`);
    setNotificationsOpen(false);
  };

  return (
    <div className="relative">
      {/* Sidebar Navigation Panel */}
      <div 
        className={`fixed left-0 top-0 h-screen border-r border-ig-border bg-ig-card p-3 py-6 flex flex-col justify-between z-50 transition-all duration-300 ${isSlim ? 'w-[72px]' : 'w-[244px]'}`}
      >
        <div className="flex flex-col">
          {/* Logo Section */}
          {isSlim ? (
            <Link to="/" onClick={() => handleItemClick('Home')} className="flex justify-center items-center h-12 mb-6">
              <i className="bi bi-instagram text-2xl text-ig-text hover:scale-105 transition-transform duration-200"></i>
            </Link>
          ) : (
            <Link to="/" onClick={() => handleItemClick('Home')} className="block px-3 mb-8">
              <img
                className="w-[103px] dark:invert"
                src={instagramText}
                alt="Instagram Logo"
              />  
            </Link>
          )}

          {/* Nav Items */}
          <div className="flex flex-col gap-1.5 text-ig-text">
            {menuItems.map((item) => {
              const isPathActive = item.path && (location.pathname === item.path);
              const isTabActive = isPathActive || (item.name === 'Search' && isSearchOpen) || (item.name === 'Notifications' && isNotificationsOpen);
              
              const itemContent = (
                <div
                  className={`flex items-center gap-4 text-base p-3 rounded-lg cursor-pointer transition-all duration-200 hover-ig-bg hover:scale-[1.01] ${isSlim ? 'justify-center' : ''} ${isTabActive ? 'font-bold' : 'font-normal'}`}
                  onClick={() => handleItemClick(item.name)}
                >
                  {item.name === 'Profile' ? (
                    <img 
                      src={currentUser?.profilePic || 'https://i.pravatar.cc/150'} 
                      alt="Profile" 
                      className={`w-6 h-6 rounded-full object-cover border ${isTabActive ? 'border-ig-text ring-1 ring-ig-text' : 'border-ig-border'}`}
                    />
                  ) : (
                    <i className={`text-2xl transition-transform duration-200 bi ${isTabActive ? item.activeIcon : item.icon}`}></i>
                  )}
                  {!isSlim && <span className="text-sm select-none">{item.name}</span>}
                </div>
              );

              return item.path ? (
                <Link key={item.name} to={item.path} className="text-ig-text no-underline block">
                  {itemContent}
                </Link>
              ) : (
                <div key={item.name}>
                  {itemContent}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section with More Dropdown */}
        <div className="relative flex flex-col gap-1">
          {isMoreOpen && (
            <div className="absolute bottom-14 left-0 w-56 bg-ig-card border border-ig-border rounded-lg shadow-xl py-1.5 z-[100] animate-fade-in text-ig-text">
              <button 
                onClick={() => { setIsMoreOpen(false); navigate('/settings'); }}
                className="w-full text-left px-4 py-2.5 hover-ig-bg text-sm font-medium border-0 bg-transparent cursor-pointer flex items-center gap-2.5 text-ig-text"
              >
                <i className="bi bi-gear text-base"></i>
                Settings
              </button>
              <button 
                onClick={toggleTheme}
                className="w-full text-left px-4 py-2.5 hover-ig-bg text-sm font-medium border-0 bg-transparent cursor-pointer flex items-center gap-2.5 text-ig-text"
              >
                <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon'} text-base`}></i>
                Switch Appearance
              </button>
              <div className="h-[1px] bg-ig-border my-1.5"></div>
              <button 
                onClick={() => { setIsMoreOpen(false); logout(); }}
                className="w-full text-left px-4 py-2.5 hover-ig-bg text-sm font-medium text-red-500 border-0 bg-transparent cursor-pointer flex items-center gap-2.5"
              >
                <i className="bi bi-box-arrow-right text-base"></i>
                Log Out
              </button>
            </div>
          )}
          
          <div 
            className={`flex items-center gap-4 text-base p-3 rounded-lg cursor-pointer transition-all duration-200 hover-ig-bg hover:scale-[1.01] text-ig-text ${isSlim ? 'justify-center' : ''} ${isMoreOpen ? 'bg-ig-hover font-bold' : ''}`}
            onClick={() => setIsMoreOpen(!isMoreOpen)}
          >
            <i className="bi bi-list text-2xl"></i>
            {!isSlim && <span className="text-sm font-normal select-none">More</span>}
          </div>
        </div>
      </div>

      {/* Search Drawer Panel */}
      <div 
        className={`fixed top-0 bottom-0 w-[397px] bg-ig-card border-r border-ig-border z-40 shadow-xl flex flex-col p-6 transition-all duration-300 text-ig-text ${isSearchOpen ? 'left-[72px]' : '-left-[400px] pointer-events-none'}`}
      >
        <h3 className="text-2xl font-bold text-ig-text mb-6 text-left">Search</h3>
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Search users" 
            className="w-full bg-ig-input border border-ig-border rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none text-ig-text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="bi bi-search absolute left-3.5 top-3.5 text-ig-muted text-sm"></i>
        </div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          <div className="flex justify-between items-center mb-3">
            <span className="font-bold text-sm text-ig-text">Results</span>
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-xs font-semibold text-sky-500 hover:text-sky-700 bg-transparent border-0 cursor-pointer">
                Clear
              </button>
            )}
          </div>
          {filteredUsers.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredUsers.map(user => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 py-1 cursor-pointer hover-ig-bg rounded p-1 text-left"
                  onClick={() => handleUserClick(user.username)}
                >
                  <img src={user.profilePic} className="w-10 h-10 rounded-full object-cover border border-ig-border" alt="" />
                  <div>
                    <p className="font-semibold text-sm text-ig-text leading-tight mb-0.5">{user.username}</p>
                    <p className="text-xs text-ig-muted">{user.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ig-muted text-xs text-center py-10">No users found</p>
          )}
        </div>
      </div>

      {/* Notifications Drawer Panel */}
      <div 
        className={`fixed top-0 bottom-0 w-[397px] bg-ig-card border-r border-ig-border z-40 shadow-xl flex flex-col p-6 transition-all duration-300 text-ig-text ${isNotificationsOpen ? 'left-[72px]' : '-left-[400px] pointer-events-none'}`}
      >
        <h3 className="text-2xl font-bold text-ig-text mb-6 text-left">Notifications</h3>
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-5">
          <h5 className="font-bold text-sm text-left text-ig-text">Recent Activity</h5>
          
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className="flex items-center gap-3 text-left py-0.5 cursor-pointer hover:bg-ig-hover p-1.5 rounded transition"
                  onClick={() => {
                    setNotificationsOpen(false);
                    navigate(`/profile?username=${notif.senderUsername}`);
                  }}
                >
                  <img src={notif.senderProfilePic} className="w-10 h-10 rounded-full object-cover border border-ig-border" alt="" />
                  <div className="flex-1 text-sm text-ig-text leading-tight">
                    <span className="font-semibold mr-1">{notif.senderUsername}</span>
                    {notif.detail}
                    <span className="text-ig-muted text-xs block mt-0.5">
                      {new Date(notif.time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  {notif.type === 'like' && notif.postId && (
                    <i className="bi bi-heart-fill text-red-500 text-base"></i>
                  )}
                  {notif.type === 'follow' && (
                    <button 
                      onClick={(e) => handleNotificationFollowBack(e, notif)}
                      className="px-3 py-1 bg-[#0095f6] hover:bg-[#1877f2] text-white rounded font-semibold text-xs transition cursor-pointer border-0"
                    >
                      View
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ig-muted text-xs text-center py-10">No notifications yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;