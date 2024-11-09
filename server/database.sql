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

CREATE TABLE forumPosts (
    id SERIAL PRIMARY KEY,
    userID INTEGER NOT NULL,                      
    title VARCHAR(100) UNIQUE NOT NULL,
    post VARCHAR(255),       
    tags VARCHAR(100),           
    author VARCHAR(255) NOT NULL,          
    views INTEGER DEFAULT 0,                      
    likes INTEGER DEFAULT 0,
    comments VARCHAR(30)                                     
);

CREATE TABLE movies (  
    movie_id SERIAL PRIMARY KEY,
    title character varying(255),
    link TEXT,
    genre TEXT[],
    rating TEXT,
    director TEXT,
    top_actors TEXT[]
);


\copy movies (title, link, genre, rating, director, top_actors) FROM 'insert\path' WITH CSV HEADER NULL AS '' QUOTE '"'
ALTER TABLE movies ADD COLUMN movie_poster VARCHAR(255);
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg' WHERE movie_id = 1;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BYjE4NzdmOTYtYjc5Yi00YzBiLWEzNDEtNTgxZGQ2MWVkN2NiXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 2;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMTZkMjBjNWMtZGI5OC00MGU0LTk4ZTItODg2NWM3NTVmNWQ4XkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 3;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BYzdjMDAxZGItMjI2My00ODA1LTlkNzItOWFjMDU5ZDJlYWY3XkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 4;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMTkxNGFlNDktZmJkNC00MDdhLTg0MTEtZjZiYWI3MGE5NWIwXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 5;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BMzYyNzU0MTM1OF5BMl5BanBnXkFtZTcwMzE1ODE1NA@@._V1_.jpg' WHERE movie_id = 6;
UPDATE movies SET movie_poster = 'https://m.media-amazon.com/images/M/MV5BYmMzMmIxNzYtYjk3OS00NjBiLTkxNDQtODU3ZDNjN2RiMTIxXkEyXkFqcGc@._V1_.jpg' WHERE movie_id = 7;


ALTER TABLE movies ADD COLUMN likes INTEGER DEFAULT 0;
ALTER TABLE movies ADD COLUMN dislikes INTEGER DEFAULT 0;

ALTER TABLE movies ADD COLUMN rating INTEGER DEFAULT 0;
ALTER TABLE movies ADD COLUMN rating_count INTEGER DEFAULT 0;

--------------- Watchlist DB ( Marie ) -----------------------------

CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
    UNIQUE (user_id, movie_id)
);

----- Add image URLs to users -----
ALTER TABLE users
ADD COLUMN image_url VARCHAR(255);

--- comments -----
CREATE TABLE postComments (
    id SERIAL PRIMARY KEY,
    postID INTEGER NOT NULL,
    userID INTEGER NOT NULL,
    commentText TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (postID) REFERENCES forumPosts(id),  -- This establishes the relation
    FOREIGN KEY (userID) REFERENCES users(id)  
);

ALTER TABLE forumPosts
ADD COLUMN comments_count INTEGER DEFAULT 0;

