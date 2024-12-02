import React, { useEffect, useState } from 'react';
import { json, Link, useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';
import { useUser } from '../../context/UserContext';
import Popup from '../Popup/Popup.jsx';
import { FaExternalLinkAlt, FaBars, FaTimes } from 'react-icons/fa'



function Navbar() {
  const { user, logout, pfp, updatePfp, postProfile } = useUser();
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [trigger, setTrigger] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

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
      const downloadURL = await updatePfp(file); // Wait for downloadURL from updatePfp
      if (downloadURL) {
        await postProfile(downloadURL); // Pass downloadURL to postProfile
        window.location.reload()
      }
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
        {/* Center the hamburger icon */}
        <div className={styles['hamburger-icon']} onClick={toggleMenu}>
          {menuOpen ? <FaTimes size={30} color="white" /> : <FaBars size={30} color="white" />}
        </div>
        <div className={styles['left-container']}>
          <Link to="/">
            <img src="/images/moviemuseinverted.png" alt="logo" className={styles['navbar-logo']} />
          </Link>
          {user && (
            <ul className={`${styles['navList']} ${menuOpen ? styles['showMenu'] : ''}`}>
              <li><Link to="/movies" className={styles['nav-link']}>Movies</Link></li>
              <li><Link to="/forum" className={styles['nav-link']}>Forum</Link></li>
              <li><Link to="/watchlist" className={styles['nav-link']}>Watchlist</Link></li>
            </ul>
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
