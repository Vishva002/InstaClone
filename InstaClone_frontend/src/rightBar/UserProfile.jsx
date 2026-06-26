import React, { useState, useEffect } from "react";

function UserProfile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/profiles")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch((err) => console.log(err));
  }, []);

  if (!profile) {
    return <p>Loading...</p>;
  }

  return (
    <div className="suggestion-container">
      <div className="suggestion-card">
        <div className="suggestion-header">
          <div className="suggestion-user-info">
            <img
              src={profile.profilePic}
              alt={profile.username}
              className="profile-pic"
            />

            <div>
              <h6 className="username">{profile.username}</h6>
              <small className="followed-by">
                {profile.name}
              </small>
            </div>
          </div>

          <p className="follow-btn">Switch</p>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;