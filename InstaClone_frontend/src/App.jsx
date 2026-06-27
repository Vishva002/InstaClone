import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './SideBar/Sidebar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Reels from './pages/Reels';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';
import CreatePostModal from './components/CreatePostModal';
import ProtectedRoute from './components/ProtectedRoute';
import { MobileHeader, MobileFooter } from './components/MobileNavBar';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import './App.css';
import './index.css';

function AppContent() {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isCreateOpen, setCreateOpen] = useState(false);

  const location = useLocation();
  const isDirectMessages = location.pathname.startsWith('/direct');
  
  // Collapse sidebar if drawers or direct inbox is active
  const isSlim = isSearchOpen || isNotificationsOpen || isDirectMessages;

  const handlePostCreated = () => {
    // Reload feed by going to home page
    if (location.pathname === '/') {
      window.location.reload();
    } else {
      window.location.href = '/';
    }
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-ig-primary text-ig-text transition-colors duration-200">
        {/* Mobile top header */}
        <MobileHeader 
          onNotificationsToggle={() => {
            setNotificationsOpen(!isNotificationsOpen);
            setSearchOpen(false);
          }}
          isNotificationsOpen={isNotificationsOpen}
        />

        {/* Left Sidebar Slot */}
        <div 
          style={{ width: isSlim ? '72px' : '244px' }} 
          className="shrink-0 transition-all duration-300 hidden md:block"
        >
          <Sidebar 
            isSearchOpen={isSearchOpen}
            setSearchOpen={setSearchOpen}
            isNotificationsOpen={isNotificationsOpen}
            setNotificationsOpen={setNotificationsOpen}
            onCreateOpen={() => setCreateOpen(true)}
          />
        </div>

        {/* Main Content Layout Panel */}
        <div className="flex-1 flex flex-col min-w-0 pb-12 md:pb-0 pt-14 md:pt-0">
          <div className="w-full max-w-[1015px] mx-auto px-3 md:px-8 py-4 flex-1 flex flex-col justify-start">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/reels" element={<Reels />} />
              <Route path="/direct/inbox" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>

        {/* Mobile bottom footer */}
        <MobileFooter onCreateOpen={() => setCreateOpen(true)} />

        {/* Create New Post Modal */}
        {isCreateOpen && (
          <CreatePostModal 
            onClose={() => setCreateOpen(false)}
            onPostCreated={handlePostCreated}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;