import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './MovieDetailsPage.module.css';
import Navbar from '../../components/Navbar/Navbar';
import { useUser } from '../../context/UserContext';
import API_BASE_URL from '../../api';

const MovieDetailsPage = () => {
    const { id } = useParams();
    const { user } = useUser();
    const token = localStorage.getItem('token');
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [watchlistMessage, setWatchlistMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const [isInWatchlist, setIsInWatchlist] = useState(false);
    const [rating, setRating] = useState(0);
    const [averageRating, setAverageRating] = useState(0);
    const [ratingMessage, setRatingMessage] = useState('');

    useEffect(() => {
        const fetchMovieDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/movie/${id}`);
                if (!response.ok) throw new Error('Failed to fetch movie details');
                const data = await response.json();
                setMovie(data);
                setAverageRating(data.average_rating); // Set the average rating
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        const checkIfInWatchlist = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/watchlist/${user.user_id}`, {
                    method: 'GET',
                    headers: {
                      "Content-Type": "application/json",
                      "Authorization": `Bearer ${token}`
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch watchlist');
                
                const data = await response.json();
                const movieInWatchlist = data.watchlist.some(item => item.movie_id === parseInt(id));
                setIsInWatchlist(movieInWatchlist);
                console.log("Is movie in watchlist?", movieInWatchlist); // Debugging line
            } catch (err) {
                console.error(err);
            }
        };
    
        fetchMovieDetails();
        checkIfInWatchlist();
    }, [id]);

    const handleToggleWatchlist = async () => {
        try {
            const endpoint = isInWatchlist ? 'remove_from_watchlist' : 'add_to_watchlist';
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: user.user_id, movie_id: id }),
            });

            const data = await response.json();
            if (response.ok) {
                setIsInWatchlist(!isInWatchlist); // Toggle the watchlist state
                setWatchlistMessage(data.message || (isInWatchlist ? "Removed from watchlist" : "Added to watchlist"));
            } else {
                setWatchlistMessage(data.error || 'Operation failed');
            }

            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
        } catch (error) {
            setWatchlistMessage('An error occurred');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
            console.error(error);
        }
    };



    const handleRatingChange = (e) => {
        setRating(Number(e.target.value));
    };

    const handleSubmitRating = async () => {
        if (!user) {
            setRatingMessage('Login to rate your favorite movies!');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/movies/${id}/rate`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ rating }),
            });

            const data = await response.json();
            if (response.ok) {
                setAverageRating(data.average_rating);
                setRatingMessage(data.message || 'Rating submitted successfully');
            } else {
                setRatingMessage(data.error || 'Failed to update rating');
            }

            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);

        } catch (error) {
            setRatingMessage('Error updating rating');
            setShowMessage(true);
            setTimeout(() => setShowMessage(false), 3000);
            console.error('Error updating rating:', error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <>
            <Navbar />
            <div className={styles['movie-details']}>
                {movie && (
                    <>
                        <h1>{movie.movie_title}</h1>
                        <img src={movie.movie_poster} alt={`${movie.movie_title} poster`} />
                        <p><strong>Genres:</strong> {movie.tags}</p>
                        <button className={styles['watchlist-button']} onClick={handleToggleWatchlist}>
                            {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>
                        {showMessage && (
                            <p className={`${styles.message} ${showMessage ? styles.fadeInOut : ''}`}>
                                {watchlistMessage}
                            </p>
                        )}
                        <div className={styles['rating-container']}>
                            <p className={styles['movie-ratings']}><strong>Rate Movie:</strong></p>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={rating}
                                onChange={handleRatingChange}
                                className={styles['rating-input']}
                            />
                            <button className={styles['submit-button']} onClick={handleSubmitRating}>Submit</button>
                            <p className={styles['average-rating']}><strong>Average Rating:</strong> {averageRating.toFixed(1)}</p>
                            {showMessage && (
                                <p className={`${styles.message} ${showMessage ? styles.fadeInOut : ''}`}>
                                    {ratingMessage}
                                </p>
                            )}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default MovieDetailsPage;