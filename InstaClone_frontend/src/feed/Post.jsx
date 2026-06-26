import React, { useEffect, useState } from "react";

function Post() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="post-container">
      {posts.map((post) => (
        <div key={post.id} className="post-card">

          {/* Header */}
          <div className="post-header">
            <div className="post-user">
              <img
                src={post.profilePic}
                alt={post.username}
                className="profile-pic"
              />

              <div>
                <h6 className="username">{post.username}</h6>
                <small className="location">{post.location}</small>
              </div>
            </div>

            <i className="bi bi-three-dots"></i>
          </div>

          {/* Image */}
          <img
            src={post.postImage}
            alt="Post"
            className="post-image"
          />

          {/* Icons */}
          <div className="post-icons">
            <div className="left-icons">
              <i className="bi bi-heart"></i>
              <i className="bi bi-chat"></i>
              <i className="bi bi-send"></i>
            </div>

            <i className="bi bi-bookmark"></i>
          </div>

          {/* Likes */}
          <p className="likes">
            {post.likes.toLocaleString()} likes
          </p>

          {/* Caption */}
          <p className="caption">
            <span className="username">{post.username}</span>
            {" "}
            {post.caption}
          </p>

          {/* View comments */}
          <p className="view-comments">
            View all {post.comments.length} comments
          </p>

          {/* Comments */}
          {post.comments.map((comment) => (
            <p key={comment.id} className="comment">
              <span className="username">
                {comment.username}
              </span>
              {" "}
              {comment.comment}
            </p>
          ))}

          {/* Time */}
          <small className="time">{post.time} ago</small>

        </div>
      ))}
    </div>
  );
}

export default Post;