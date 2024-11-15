import { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './MoviePage.module.css'; 
import Navbar from '../../components/Navbar/Navbar';
import API_BASE_URL from '../../api';

function MoviePage() {
  const [query, setQuery] = useState('');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [error, setError] = useState('');

  const genres = ['Action', 'Comedy', 'Drama', 'Sci-Fi', 'Thriller', 'Horror'];

  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      // build URL with query parameters
      const url = new URL(`${API_BASE_URL}/search`);
      if (query) url.searchParams.append('title', query);
      selectedGenres.forEach((genre) => url.searchParams.append('genres', genre.toLowerCase()));

      // fetch search results from the server
      const response = await fetch(url);
      const data = await response.json();
      console.log(data);

      // update the results or show an error message
      if (response.ok) {
        setMovies(data.movies);
        setError('');
      } else {
        setMovies([]);
        setError(data.error || 'No results found');
      }
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch search results');
    }
  };

  // Handle genre selection
  const handleGenreChange = (genre) => {
    setSelectedGenres((prevGenres) =>
      prevGenres.includes(genre)
        ? prevGenres.filter((g) => g !== genre) // deselect genre if already selected
        : [...prevGenres, genre] // select genre if not already selected
    );
  };

  return (
    <>
      <Navbar />
      <div className={styles['movie-page']}>
        <h1>Search for Movies</h1>
        <form onSubmit={handleSearch} className={styles['search-form']}>
          <input
            type="text"
            placeholder="Search movies by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles['search-input']}
          />
          
          {/* Genre Selection */}
          <div className={styles['genres']}>
            {genres.map((genre) => (
              <label key={genre} className={styles['genre-label']}>
                <input
                  type="checkbox"
                  value={genre}
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                />
                <p>{genre}</p>
              </label>
            ))}
          </div>

          <button type="submit" className={styles['search-button']}>Search</button>
        </form>

        {/* Display Results or Error */}
        {error ? (
          <p className={styles['error-message']}>{error}</p>
        ) : (
          <ul className={styles['results']}>
            {movies.map((movie) => (
               <li key={movie.movie_id} className={styles['movie-item']}>
               <Link to={`/movie/${movie.movie_id}`} className={styles['movie-link']}>
                   <img src={movie.poster} alt={movie.title} className={styles['movie-poster']} />
                   <h3 className={styles['movie-title']}>{movie.title}</h3>
               </Link>
           </li>
           
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default MoviePage;
