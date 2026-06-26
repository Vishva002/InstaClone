import React, { useEffect, useState } from "react";

function Suggestion() {
    const [suggestions, setSuggestions] = useState([]);
  
    useEffect(() => {
      fetch("http://localhost:3000/suggestions")
        .then((res) => res.json())
        .then((data) => setSuggestions(data))
        .catch((err) => console.log(err));
  }, []);
  return (
<div>
  <p><b>Suggestions for you</b></p>

  <div className="suggestion-container">
    {suggestions.map((suggestion) => (
      <div key={suggestion.id} className="suggestion-card">
        <div className="suggestion-header">
          <div className="suggestion-user-info">
            <img
              src={suggestion.profilePic}
              alt={suggestion.username}
              className="profile-pic"
            />

            <div>
              <h6 className="username">{suggestion.username}</h6>
              <small className="followed-by">
                {suggestion.followedBy}
              </small>
            </div>
          </div>

          <p className="follow-btn">Follow</p>
        </div>
      </div>
    ))}
  </div>
</div>
  )
}

export default Suggestion