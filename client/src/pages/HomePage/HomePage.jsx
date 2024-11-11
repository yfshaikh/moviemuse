import React, { useState, useEffect } from 'react';
import styles from './HomePage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { useNavigate } from 'react-router-dom';

// FIREBASE 
import { storage } from '../../firebase.js';
import { ref, getDownloadURL } from 'firebase/storage';

function HomePage() {
  const navigate = useNavigate();
  const [arrowUrl, setArrowUrl] = useState(null);
  const [forumsDemoUrl, setForumsDemoUrl] = useState(null);
  const [genreDemoUrl, setGenreDemoUrl] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        // Fetch white-down-arrow.png
        const arrowRef = ref(storage, 'homepage/white-down-arrow.png');
        const arrowUrl = await getDownloadURL(arrowRef);
        setArrowUrl(arrowUrl);

        // Fetch forums-demo.png
        const forumsDemoRef = ref(storage, 'homepage/forums-demo.png');
        const forumsDemoUrl = await getDownloadURL(forumsDemoRef);
        setForumsDemoUrl(forumsDemoUrl);

        // Fetch genre_demo.mp4
        const genreDemoRef = ref(storage, 'homepage/genre_demo.mp4');
        const genreDemoUrl = await getDownloadURL(genreDemoRef);
        setGenreDemoUrl(genreDemoUrl);

      } catch (error) {
        console.error("Error fetching images from Firebase Storage:", error);
      }
    };

    fetchImages();
  }, []);

  const scrollToContent = () => {
    const nextSection = document.querySelector(`.${styles['full-width-container']}`);
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Navbar/>
      <div className={styles['homepage']}>
        <div className={styles['logo-container']}>
          <img src="/images/moviemuseinverted.png" alt="Logo" className={styles['logo']} />
        </div>
        <h1>MovieMuse</h1>
        <p className={styles['subtitle']}>Discover. Discuss. Dive Into Movies.</p>
        <button className={styles['btn']} onClick={() => navigate('/signup')}>Get Started</button>
        <img src={arrowUrl} alt="arrow" className={styles['arrow']} onClick={scrollToContent}/>
      </div>

      <div className={styles['full-width-container']}>
        <div className={styles['text-container']}>
          <h2>The Power of MovieMuse</h2>
          <p>Select your favorite genres to pinpoint your next favorite movie.</p>
          <div className={styles['text-container-btn']}>
            <button className={styles['btn-inverted']} onClick={() => navigate('/signup')}>Discover Movies</button>
          </div>
        </div>
        {genreDemoUrl && (
          <video className={styles['video']} autoPlay muted loop playsInline>
            <source src={genreDemoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      <div className={styles['full-width-container']} style={{ backgroundColor: '#624E88' }}>
        {forumsDemoUrl && (
          <img src={forumsDemoUrl} alt="forums image" className={styles['video']} />
        )}
        <div className={styles['text-container']} style={{ color: 'white' }}>
          <h2>Your Place for all Things Film</h2>
          <p>Join the conversation about anything and everything cinema.</p>
          <div className={styles['text-container-btn']}>
            <button className={styles['btn-purp']} onClick={() => navigate('/signup')}>Discuss Movies</button>
          </div>
        </div>
      </div>

      <div className={styles['homepage']} style={{ backgroundColor: '#1e1e1e' }}>
        <div className={styles['text-container-grey']}>
          <h1>Don't Miss Out.</h1>
          <p>Sign Up and access your very own watchlist.</p>
          <div className={styles['text-container-btn']}>
            <button className={styles['btn']} onClick={() => navigate('/signup')}>Dive Into Movies</button>
          </div>
        </div>
      </div>
      <footer className={styles['footer']}>2024 Movie Muse. All Rights Reserved.</footer>
    </>
  );
}

export default HomePage;
