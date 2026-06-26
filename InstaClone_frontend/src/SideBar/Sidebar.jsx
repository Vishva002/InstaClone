import React from 'react';
import instagramText from '../assets/instatext.png';

function Sidebar() {
  return (
    <div
      className="d-flex flex-column justify-content-between p-3 "
      style={{ width: '250px', height: '100vh', position: 'fixed' }}
    >
      {/* Top Section */}
      <div className="d-flex flex-column gap-4">
        <img
          className="instagram-logo"
          src={instagramText}
          alt="Instagram Text"
          style={{ width: '120px' }}
        />  
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-house-door fs-4"></i>
          <span>Home</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-search fs-4"></i>
          <span>Search</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-compass fs-4"></i>
          <span>Explore</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-play-circle fs-4"></i>
          <span>Reels</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-send fs-4"></i>
          <span>Messages</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-bell fs-4"></i>
          <span>Notifications</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-plus-square fs-4"></i>
          <span>Create</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-person-circle fs-4"></i>
          <span>Profile</span>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="d-flex flex-column gap-4">
        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-threads fs-4"></i>
          <span>Threads</span>
        </div>

        <div className="d-flex align-items-center gap-3">
          <i className="bi bi-list fs-4"></i>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;