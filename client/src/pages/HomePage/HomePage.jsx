import React from 'react'
import styles from './HomePage.module.css'
import Navbar from '../../components/Navbar/Navbar'
import { Navigate, useNavigate } from 'react-router-dom'

function HomePage() {
  const navigate = useNavigate();

  return (
    <>
      <Navbar/>
      <div className={styles['homepage']}>
        <div className={styles['logo-container']}>
          <img src="/images/moviemuseinverted.png" alt="Logo" className={styles['logo']} />
        </div>
        <h1>MovieMuse</h1>
        <button className={styles['btn']} onClick={() => navigate('/signup')}>Get Started</button>
        <p className={styles['subtitle']}>Discover. Discuss. Dive Into Movies.</p>
        <img src="\images\white-down-arrow.png" alt="arrow" className={styles['arrow']} />
      </div>

      

      <div className={styles['full-width-container']}>
        <div className={styles['text-container']}>
          <h2>The Power of MovieMuse</h2>
          <p>Select your favorite genres to pinpoint your next favorite movie.</p>
          <div className={styles['text-container-btn']}>
            <button className={styles['btn-inverted']} onClick={() => navigate('/movies')}>Discover Movies</button>
          </div>
          
        </div>
        <video className={styles['video']} autoPlay muted loop playsInline>
          <source src="\images\genre_demo.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>


      <div className={styles['full-width-container']} style={{ backgroundColor: '#624E88' }}>
        <img src="\images\forums-demo.png" alt="forums image" className={styles['video']}/>
        
        <div className={styles['text-container']} style={{color: 'white'}}>
          <h2>Your Place for all Things Film</h2>
          <p>Join the conversation about anything and everything cinema.</p>
          <div className={styles['text-container-btn']}>
            <button className={styles['btn-purp']} onClick={() => navigate('/forum')}>Discuss Movies</button>
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
  )
}

export default HomePage