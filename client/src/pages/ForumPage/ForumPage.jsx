import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartRegular, faCommentDots, faUser } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import styles from "./ForumPage.module.css";
import Navbar from '../../components/Navbar/Navbar';
import { useUser } from "../../context/UserContext";
import API_BASE_URL from "../../api";

function ForumPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token')
  const { user, logout, pfp, updatePfp } = useUser();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [commentInputVisible, setCommentInputVisible] = useState({}); // Track visibility of comment inputs
  const [commentInputs, setCommentInputs] = useState({}); // State for comment inputs
  const [comments, setComments] = useState({}); // State for fetched comments
  const [loadingComments, setLoadingComments] = useState({}); // Track loading state for comments
  const [userProfilePics, setUserProfilePics] = useState({});

  // Fetch posts and comments
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/forum`);

        if (response.ok) {
          const data = await response.json();
          setPosts(data.forumPosts);  
          console.log('Posts fetched successfully:', data.forumPosts);

          // Fetch comments for each post
          data.forumPosts.forEach(post => {
            fetchComments(post.id);
            fetchUserProfilePic(post.userID); // Fetch the user's pfp
          });

        } else {
          console.log('Error fetching posts');
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    };

    fetchPosts();
  }, []);

  // Fetch comments for a specific post
  const fetchComments = async (postId) => {
    setLoadingComments((prev) => ({ ...prev, [postId]: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/comments/${postId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const commentsData = await response.json();
        setComments((prevComments) => ({
          ...prevComments,
          [postId]: commentsData, // Set comments for specific post
        }));
      } else {
        const errorData = await response.json();
        console.error('Error fetching comments:', errorData.error);
      }
    } catch (error) {
      console.error('Error making API request:', error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };
  
  // Fetch user profile picture by user ID
  const fetchUserProfilePic = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/${userId}/profile_pic`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, 
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setUserProfilePics((prev) => ({
          ...prev,
          [userId]: userData.image_url || "/images/profile-pic-placeholder.jpg", // Fallback to placeholder if no pfp
        }));
        console.log('fetched pfp:', userData.image_url)
        console.log('userID: ', userId)
      } else {
        console.error('Error fetching user profile:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Toggle comment input visibility
  const handleToggleComment = (postId) => {
    setCommentInputVisible((prev) => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleCommentChange = (postId, text) => {
    setCommentInputs((prevInputs) => ({
      ...prevInputs,
      [postId]: String(text)
    }));
  };

  const handleAddComment = async (postId) => {
    const commentText = commentInputs[postId];
    console.log(`Adding comment to post ${postId}: ${commentText}`);
  
    const commentData = {
      postID: postId,
      commentText: commentText,
    };
  
    try {
      const response = await fetch(`${API_BASE_URL}/add_comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(commentData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log('Comment added successfully:', data);
        fetchComments(postId); // Re-fetch comments to show the new one
      } else {
        const errorData = await response.json();
        console.error('Error adding comment:', errorData.error);
      }
    } catch (error) {
      console.error('Error making API request:', error);
    }
  
    // Clear input field after submitting the comment
    setCommentInputs((prevInputs) => ({ ...prevInputs, [postId]: "" }));
    
    handleToggleComment(postId);
  };

  const handleLike = async (postId) => {
    // Toggle the like status in the local state
    setLikedPosts((prevLikedPosts) => {
      const isLiked = prevLikedPosts.includes(postId);
      const action = isLiked ? 'unlike' : 'like';
  
      // Send the like/unlike action to the backend
      sendLikeRequest(postId, action);
  
      // Update the state to reflect the like/unlike action
      if (isLiked) {
        console.log(`Unliked post ${postId}`);
        return prevLikedPosts.filter(id => id !== postId); // Un-like
      } else {
        console.log(`Liked post ${postId}`);
        return [...prevLikedPosts, postId]; // Like
      }
    });
  };
  
  // Helper function to send the like/unlike request to the backend
  const sendLikeRequest = async (postId, action) => {
    const likeData = {
      postId: postId,
      action: action, // 'like' or 'unlike'
    };
  
    try {
      const response = await fetch(`${API_BASE_URL}/like_post`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, 
        },
        body: JSON.stringify(likeData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log(`${action.charAt(0).toUpperCase() + action.slice(1)} action successful for post ${postId}`);
      } else {
        const errorData = await response.json();
        console.error('Error updating like:', errorData.error);
      }
    } catch (error) {
      console.error('Error making API request:', error);
    }
  };
  

  return (
    <>
      <Navbar />
      <div className={styles['forum-container']}>
        <div className={styles['button-container']}>
          <button className={styles['btn']} onClick={() => navigate('/forumpost')}>Create a Post</button>
        </div>
        
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <div key={index} className={styles.post}>
              <div className={styles.postHeader}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <div className={styles.postTags}>
                  {(Array.isArray(post.tags) ? post.tags : []).map((tag, i) => (
                    <span key={i} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
              
              <div className={styles.postContent}>
                <p className={styles.postText}>{post.post}</p>
              </div>
              
              <div className={styles.postFooter}>
                <div className={styles.postInfoContainer}>
                  <div className={styles.postInfo}>
                    <img
                      src={userProfilePics[post.userID] || "/images/profile-pic-placeholder.jpg"}
                      alt="Profile"
                      className={styles['profile-pic']}
                    />
                    <span className={styles.authorName}>{post.author}</span>
                    <span className={styles.postLikes}>{post.likes} Likes</span>
                    <span className={styles.postComments}>{post.comments_count} Comments</span>
                  </div>
                  <div className={styles.actionButtons}>
                    <button 
                      className={`${styles.likeButton} ${likedPosts.includes(post.id) ? styles.liked : ''}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <FontAwesomeIcon 
                        icon={likedPosts.includes(post.id) ? faHeartSolid : faHeartRegular} 
                        className={styles.heartIcon}
                      />
                    </button>
                    <button
                      className={styles.commentButton}
                      onClick={() => handleToggleComment(post.id)}
                    >
                      <FontAwesomeIcon icon={faCommentDots} className={styles.commentIcon} />
                    </button>
                  </div>
                </div>
              </div>



  
              {commentInputVisible[post.id] && (
                <div className={styles.commentSection}>
                  <input
                    type="text"
                    className={styles.commentInput}
                    placeholder="Write a comment..."
                    value={commentInputs[post.id] || ""}
                    onChange={(e) => handleCommentChange(post.id, e.target.value)}
                  />
                  <button
                    className={styles.commentSubmitButton}
                    onClick={() => handleAddComment(post.id)}
                  >
                    Post
                  </button>
                </div>
              )}
  
              <div className={styles.commentsList}>
                {loadingComments[post.id] ? (
                  <p>Loading comments...</p>
                ) : (
                  Array.isArray(comments[post.id]) && comments[post.id].map((comment, i) => (
                    <div key={i} className={styles.commentContainer}>
                      <div className={styles.comment}>
                        <span className={styles.commentAuthor}>{comment.username}</span>
                        <p className={styles.commentText}>{comment.comment_text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </>
  )  
  
}

export default ForumPage;
