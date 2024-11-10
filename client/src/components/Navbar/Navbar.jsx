import React, { useEffect, useState } from 'react';
import { json, Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../context/UserContext';
import Popup from '../Popup/Popup.jsx';
import { db, storage } from '../../firebase.js';
import { doc, setDoc, updateDoc, getDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import API_BASE_URL from '../../api.jsx';

function Navbar() {
  const { user, logout, pfp, updatePfp, postProfile } = useUser();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [trigger, setTrigger] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null); 

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Trigger file input click and handle file selection
  const handleButtonClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await updatePfp(file); 
      await postProfile();
      console.log(pfp)
    }
  };





  return (
    <header>
      <Popup trigger={trigger} setTrigger={setTrigger}>
        {user ? (
          <>
            <div className={styles['profile-info']}>
              <span>{user.username}</span>
              <span>{user.email}</span>
            </div>

            <div className={styles['button-container']}>
              <input 
                type="file" 
                id="fileInput" 
                onChange={handleFileChange} 
                style={{ display: 'none' }}
              />
              <button 
                onClick={handleButtonClick} 
                className={`${styles['button']} ${styles['upload']}`} 
              >
                Change Profile Picture
              </button>

              <button 
                className={`${styles['button']} ${styles['logout']}`} 
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <div>You are logged out</div>
        )}
      </Popup>

      <nav className={styles['navbar']}>
        <div className={styles['left-container']}>
          <Link to="/">
            <img src="/images/moviemuseinverted.png" alt="logo" className={styles['navbar-logo']} />
          </Link>
          {user && (
            <div className={styles['links-container']}>
              <Link to="/movies" className={styles['nav-link']}>Movies</Link>
              <Link to="/forum" className={styles['nav-link']}>Forum</Link>
              <Link to="/watchlist" className={styles['nav-link']}>Watchlist</Link>
            </div>
          )}
        </div>

        <div>
          {user ? (
            <div onClick={() => setTrigger(true)} className={styles['profile-container']}>
              <span className={styles['profile-name']}>{user.username}</span>
              <img
                src={pfp || "/images/profile-pic-placeholder.jpg"}
                alt="Profile"
                className={styles['profile-pic']}
              />
            </div>
          ) : (
            <Link to="/login" className={styles['nav-link']}>Login</Link>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
