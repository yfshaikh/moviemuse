import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from './WatchlistPage.module.css';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import API_BASE_URL from '../../api';

const WatchlistPage = () => {
  const { user } = useUser();
  const token = localStorage.getItem('token');
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    const fetchWatchlist = async () => {
      console.log("Fetching watchlist...");
  
      // Check if token exists
      if (!token) {
        console.error("No token found. User might need to log in.");
        setError("You need to log in again.");
        setLoading(false);
        return;
      }
  
      console.log("Token:", token);
  
      try {
        const response = await fetch(`${API_BASE_URL}/watchlist/${user.user_id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
  
        console.log("Response status:", response.status);
  
        // Handle unauthorized access
        if (response.status === 401) {
          console.warn("Unauthorized access. Clearing token and prompting user to log in.");
          setError("Session expired. Please log in again.");
          localStorage.removeItem('token');
          return;
        }
  
        if (!response.ok) {
          console.error("Failed to fetch watchlist:", response.status, response.statusText);
          throw new Error(`Error: ${response.status}`);
        }
  
        const data = await response.json();
        console.log("Fetched watchlist data:", data);
  
        if (data.error) {
          console.error("API returned an error:", data.error);
          setError(data.error);
        } else {
          setWatchlist(data.watchlist);
        }
      } catch (err) {
        console.error("An error occurred while fetching the watchlist:", err);
        setError("An error occurred while fetching the watchlist.");
      } finally {
        console.log("Fetching watchlist completed.");
        setLoading(false);
      }
    };
  
    console.log("User ID:", user.user_id);
    fetchWatchlist();
  }, [user.user_id, token]);
  

  if (loading) return <div className={styles['loading']}>Loading...</div>;
  if (error) return <div className={styles['error']}>{error}</div>;

  return (
    <>
      <Navbar />
      <div className={styles['watchlist-container']}>
        <h1>Your Watchlist</h1>
        <ul className={styles['watchlist-items']}>
          {watchlist.length > 0 ? (
            watchlist.map((movie) => (
              <li key={movie.movie_id} className={styles['movie-item']}>
                <Link to={`/movie/${movie.movie_id}`} className={styles['movie-link']}>
                  <img src={movie.poster} alt={`${movie.title} poster`} className={styles['movie-poster']} />
                  <h3 className={styles['movie-title']}>{movie.title}</h3>
                </Link>
              </li>
            ))
          ) : (
            <div className={styles['empty-message']}>
              <p>It looks pretty empty here...</p>
            </div>
          )}
        </ul>
      </div>
    </>
  );
};

export default WatchlistPage;
