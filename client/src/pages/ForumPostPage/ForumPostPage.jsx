import React, { useState } from 'react';
import styles from './ForumPostPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';


function ForumPostPage() {
  const { user } = useUser();
  const token = localStorage.getItem('token');
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  

  // Function to handle tag input
  const handleTagChange = (e) => {
    const inputTags = e.target.value.split(',').map(tag => tag.trim());
    const nonEmptyTags = inputTags.filter(tag => tag !== '');

    if (nonEmptyTags.length > 3) {
      setError('You can only add up to 3 tags.');
    } else {
      setError('');
      setTags(nonEmptyTags);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    try {
      const response = await fetch("http://localhost:8000/forum", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }, 
        body: JSON.stringify({ title: postTitle, post: postContent, tags, userID: user.user_id, author: user.username })
      });

      const data = await response.json(); // parse response

      if (response.ok) {
        setSuccess(true);
        console.log('Forum post successful:', data);
      } else {
        setError(data.error || 'Post failed');
        console.log('Forum post failed:', data);
      }
    } catch (error) {
      console.error("Error posting forum", error);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <>
      <Navbar /> {/* Navbar added here */}
      <div className={styles['create-post-container']}>
        <h1 className={styles['title']}><span className={styles['yellow-text']}>Create a Post</span></h1>
        <p className={styles['subtitle']}>Write about anything movie related!</p>

        <form className={styles['form']} onSubmit={handleSubmit}>
          {/* Title input */}
          <div className={styles['title-field']}>
            <input
              type="text"
              placeholder="Title"
              className={styles['input-field']}
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
            />
          </div>

          {/* Content input */}
          <textarea
            placeholder="Start typing.."
            className={styles['textarea-field']}
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            rows="12" 
          />

          {/* Tag input */}
          <input
            type="text"
            placeholder="Add up to 3 tags, separated by commas"
            className={styles['input-field']}
            onChange={handleTagChange}
          />
          {error && <p className={styles['error-message']}>{error}</p>}

          {/* Display the tags dynamically */}
          {tags.length > 0 && (
            <div className={styles['tag-list']}>
              {tags.map((tag, index) => (
                <span key={index} className={styles['tag']}>{tag}</span>
              ))}
            </div>
          )}
          
          <button type="submit" className={styles['post-button']}>
            Post
          </button>
          {success && <p className={styles['success-message']}>Post created successfully!</p>}
        </form>
      </div>
    </>
  );
}

export default ForumPostPage;
