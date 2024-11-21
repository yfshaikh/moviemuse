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
      // Wait for the user to load
      if (!user) {
        console.log("User context is not available yet, skipping fetch.");
        return;
      }

      if (!user.user_id) {
        console.error("Invalid user context:", user);
        setError("User is not logged in. Please log in again.");
        setLoading(false);
        return;
      }

      if (!token) {
        console.error("Token is missing or invalid.");
        setError("You need to log in again.");
        setLoading(false);
        return;
      }

      console.log("Fetching watchlist for user ID:", user.user_id);

      try {
        const response = await fetch(`${API_BASE_URL}/watchlist/${user.user_id}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

        if (response.status === 401) {
          console.warn("Unauthorized. Clearing token and prompting login.");
          setError("Session expired. Please log in again.");
          localStorage.removeItem('token');
          return;
        }

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched watchlist data:", data);

        if (data.error) {
          setError(data.error);
        } else {
          setWatchlist(data.watchlist || []);
        }
      } catch (err) {
        console.error("An error occurred while fetching the watchlist:", err);
        setError("An error occurred while fetching the watchlist.");
      } finally {
        setLoading(false);
      }
    };

    // Attempt to fetch the watchlist only if the user exists
    if (user) {
      fetchWatchlist();
    }
  }, [user, token]);

  if (!user) return <div className={styles['loading']}>Loading user information...</div>;
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
