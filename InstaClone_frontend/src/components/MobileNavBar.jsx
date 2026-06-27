import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import instagramText from '../assets/instatext.png';

export const MobileHeader = ({ onNotificationsToggle, isNotificationsOpen }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) return null;

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-ig-card border-b border-ig-border flex items-center justify-between px-4 z-40">
      <Link to="/" className="flex items-center">
        <img 
          src={instagramText} 
          alt="Instagram" 
          className="h-8 object-contain dark:invert" 
        />
      </Link>
      <div className="flex items-center gap-5 text-2xl text-ig-text">
        <button 
          onClick={onNotificationsToggle} 
          className="relative bg-transparent border-0 cursor-pointer text-ig-text flex items-center p-0"
        >
          <i className={`bi ${isNotificationsOpen ? 'bi-bell-fill' : 'bi-bell'}`}></i>
        </button>
        <Link to="/direct/inbox" className="text-ig-text flex items-center">
          <i className="bi bi-send"></i>
        </Link>
      </div>
    </div>
  );
};

export const MobileFooter = ({ onCreateOpen }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) return null;

  const navItems = [
    { path: '/', icon: 'bi-house-door', activeIcon: 'bi-house-door-fill' },
    { path: '/explore', icon: 'bi-compass', activeIcon: 'bi-compass-fill' },
    { type: 'create', icon: 'bi-plus-square' },
    { path: '/reels', icon: 'bi-play-circle', activeIcon: 'bi-play-circle-fill' },
    { path: '/profile', icon: null } // Custom rendering for avatar
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-12 bg-ig-card border-t border-ig-border flex items-center justify-around z-40">
      {navItems.map((item, idx) => {
        const isPathActive = item.path && (location.pathname === item.path);
        
        if (item.type === 'create') {
          return (
            <button 
              key={idx}
              onClick={onCreateOpen}
              className="bg-transparent border-0 text-ig-text text-2xl cursor-pointer p-0 hover:scale-105 active:scale-95 transition-transform"
            >
              <i className={item.icon}></i>
            </button>
          );
        }

        if (item.path === '/profile') {
          return (
            <Link 
              key={idx} 
              to="/profile" 
              className={`w-7 h-7 rounded-full overflow-hidden border transition ${location.pathname === '/profile' ? 'border-ig-text ring-1 ring-ig-text' : 'border-ig-border hover:scale-105'}`}
            >
              <img 
                src={currentUser?.profilePic} 
                className="w-full h-full object-cover" 
                alt="Profile" 
              />
            </Link>
          );
        }

        return (
          <Link 
            key={idx} 
            to={item.path} 
            className="text-ig-text text-2xl hover:scale-105 active:scale-95 transition-transform flex items-center"
          >
            <i className={`bi ${isPathActive ? item.activeIcon : item.icon}`}></i>
          </Link>
        );
      })}
    </div>
  );
};
