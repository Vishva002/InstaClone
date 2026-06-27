import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserProfile() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser) return null;

  return (
    <div className="w-full py-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3.5">
          <Link to="/profile" className="block shrink-0">
            <img
              src={currentUser.profilePic || "https://i.pravatar.cc/150"}
              alt={currentUser.username}
              className="w-11 h-11 rounded-full object-cover border border-ig-border"
            />
          </Link>
          <div className="text-left">
            <Link to="/profile" className="font-semibold text-sm text-ig-text mb-0.5 no-underline hover:underline block leading-tight">
              {currentUser.username}
            </Link>
            <small className="text-xs text-ig-muted block leading-tight mt-0.5">{currentUser.name}</small>
          </div>
        </div>
        <button 
          className="text-xs font-bold text-sky-500 hover:text-sky-700 cursor-pointer bg-transparent border-0" 
          onClick={() => navigate('/settings')}
        >
          Settings
        </button>
      </div>
    </div>
  );
}

export default UserProfile;