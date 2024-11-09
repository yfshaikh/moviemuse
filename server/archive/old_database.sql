CREATE DATABASE moviemuse;

\c moviemuse;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,                      
    username VARCHAR(50) UNIQUE NOT NULL,       
    email VARCHAR(100) UNIQUE NOT NULL,           
    password_hash VARCHAR(255) NOT NULL,          
    first_name VARCHAR(50),                      
    last_name VARCHAR(50),                                    
    role VARCHAR(20) DEFAULT 'user',              
    CONSTRAINT email_check CHECK (email LIKE '%@%') 
);


CREATE TABLE movies (  
    movie_id SERIAL PRIMARY KEY,
    movie_title character varying(255),
    tags text
);

INSERT INTO movies (movie_id, movie_title, tags)
VALUES 
(1, 'The Dark Knight',
'action, crime, dark, drama, philosophical, practical effects, superhero, thriller'),
(2, '12 Angry Men', 
'crime, drama, philosophical'),
(3, 'The Lord of the Rings: The Return of the King', 
'action, dark, drama, fantasy, practical effects, war'),
(4, 'Interstellar', 
'action, drama, sci-fi, thriller'),
(5, 'Star Wars: Episode IV - A New Hope', 
'action, philosophical, practical effects, sci-fi, war'),
(6, 'The Magnificent Seven', 
'action, comedy, drama, practical effects, western'),
(7, 'Gremlins', 
'action, comedy, horror, practical effects, thriller');

ALTER TABLE movies ADD COLUMN movie_poster VARCHAR(255);
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg' WHERE movie_id = 1;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 2;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 3;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 4;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMTkxNGFlNDktZmJkNC00MDdhLTg0MTEtZjZiYWI3MGE5NWIwXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 5;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMzYyNzU0MTM1OF5BMl5BanBnXkFtZTcwMzE1ODE1NA@@._V1_.jpg' WHERE movie_id = 6;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BYmMzMmIxNzYtYjk3OS00NjBiLTkxNDQtODU3ZDNjN2RiMTIxXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 7;

ALTER TABLE movies ADD COLUMN rating INTEGER DEFAULT 0;
ALTER TABLE movies ADD COLUMN rating_count INTEGER DEFAULT 0;


CREATE TABLE IF NOT EXISTS user_ratings (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    PRIMARY KEY (user_id, movie_id)
);


--------------- Watchlist DB ( Marie ) -----------------------------

CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    UNIQUE (user_id, movie_id)
);