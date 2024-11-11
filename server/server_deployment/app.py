from flask import Flask, request, jsonify
from flask_cors import CORS
from flask import session
import psycopg2
import bcrypt
# from db import get_db_connection 
from psycopg2.extras import RealDictCursor
from werkzeug.security import check_password_hash, generate_password_hash
from dotenv import load_dotenv
import os
import jwt  
from datetime import datetime, timedelta, timezone

app = Flask(__name__)
CORS(app) 


load_dotenv()
SECRET_KEY=os.getenv("SECRET_KEY")
app.config['SECRET_KEY'] = SECRET_KEY
PORT=8000

# load environment variables
load_dotenv()

def get_db_connection():
    localtesting = False
    if localtesting:
        conn = psycopg2.connect(
            host="localhost",  
            database="moviemuse",  
            user=os.getenv("USER"),  
            password=os.getenv("PASSWORD"),  
            port="5433"  
        )
    else:
        conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST"),
            database=os.getenv("POSTGRES_DATABASE"),  
            user=os.getenv("POSTGRES_USER"),  
            password=os.getenv("POSTGRES_PASSWORD"),  
            port="5432"
        )

    return conn


def decode_token(token):
    """
    Decodes the JWT token and returns user info if the token is valid.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return {
            "user_id": payload["user_id"],
            "username": payload["username"],
            "valid": True
        }
    except jwt.ExpiredSignatureError:
        return {
            "error": "Token has expired",
            "valid": False
        }
    except jwt.InvalidTokenError:
        return {
            "error": "Invalid token",
            "valid": False
        }

# search movies
@app.route('/search', methods=['GET'])
def search_movies():
    try:
        # --- Genre Search ---

        # Get genres and title from URL 
        movie_title = request.args.get('title', '').strip()
        user_genres = [genre.lower() for genre in request.args.getlist('genres')]

        # Validate that at least a movie title is provided
        if not movie_title:
            return jsonify({'error': 'No movie title provided'}), 400

        # Connect to the movie database
        conn = get_db_connection()
        cursor = conn.cursor()

        # --------------------- GENRE VALIDATION ---------------------

        # Fetch all genres from the movie table
        cursor.execute("""
            SELECT DISTINCT genre
            FROM movies
            WHERE genre IS NOT NULL
        """)
        
        # Set to store unique genres in lowercase
        unique_genres = set()

        # Process each genre tuple from fetchall_result
        for genre_tuple in cursor.fetchall():
            genres = genre_tuple[0].strip('{}').split(',')
            unique_genres.update(genre.strip().lower() for genre in genres)

        # Check for any genres that don’t exist in the database
        invalid_genres = [genre for genre in user_genres if genre not in unique_genres]
        if invalid_genres:
            return jsonify({'error': f'Invalid genre(s): {", ".join(invalid_genres)}'}), 400

        # --- Title Search ---
        cursor.execute("""
            SELECT movie_id, movie_title, genre, movie_poster 
            FROM movies 
            WHERE LOWER(movie_title) LIKE LOWER(%s)
        """, (f'%{movie_title}%',))

        # Fetch matching movie entries
        movies = cursor.fetchall()

        # If no movies found based on the title, return an empty list
        if not movies:
            return jsonify({"movies": []})

        # Close the connection after fetching results
        conn.commit()
        cursor.close()
        conn.close()

        # Filter results by genres if any genres were provided
        filtered_movies = []
        for movie in movies:
            movie_id, title, genre, poster = movie
            movie_genres = set(genre.strip().lower() for genre in genre.split(','))

            # Include movie if it matches any of the user-provided genres
            if not user_genres or any(genre in movie_genres for genre in user_genres):
                filtered_movies.append({
                    "movie_id": movie_id,
                    "title": title,
                    "genre": genre,
                    "poster": poster
                })

        return jsonify({"movies": filtered_movies})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

   
# create a new user
@app.route('/users', methods=['POST'])
def create_user():
    try:
        # get data from the request
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name')
        last_name = data.get('last_name')

        # make sure required fields are sent
        if not username or not email or not password or not first_name or not last_name:
            return jsonify({"error": "All fields are required"}), 400

        # hash the password
        # salt = bcrypt.gensalt()
        # password_hash = bcrypt.hashpw(password.encode('utf-8'), salt)
        password_hash = generate_password_hash(password)

        # insert the user into the database
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("""
            INSERT INTO users (username, email, password_hash, first_name, last_name)
            VALUES (%s, %s, %s, %s, %s) RETURNING id, username, email, first_name, last_name;
        """, (username, email, password_hash, first_name, last_name))

        new_user = cursor.fetchone()
        conn.commit()
        cursor.close()
        conn.close()

        # send the user data back without the password hash
        user_data = {
            "id": new_user[0],
            "username": new_user[1],
            "email": new_user[2],
            "first_name": new_user[3],
            "last_name": new_user[4],
        }
        return jsonify(user_data), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


# login
@app.route('/login', methods=['POST'])
def login():
    
    # get email and password from client-side request
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    # check if email and password are provided
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    
    conn = None
    cursor = None
    try:
        # connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # query for the user's password hash and ID by email
        cursor.execute("SELECT id, username, password_hash FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()

        # check if user exists
        if user is None:
            return jsonify({"error": "Invalid email or password"}), 401

        # get the user id, username, and password hash
        user_id, username, password_hash = user  

        # verify the stored hash against the submitted password
        if check_password_hash(password_hash, password):
            # password is correct, generate JWT
            payload = {
                "user_id": user_id,
                "username": username,
                "email": email,
                "exp": datetime.now(timezone.utc) + timedelta(hours=1)  # token expiration time
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")
            # save user id and username to session
            session['user_id'] = user_id
            session['username'] = username
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    
    except Exception as e:
        print("Database error:", e)
        return jsonify({"error": "Database error"}), 500
    
    finally:
        if cursor is not None:
            cursor.close()
        if conn is not None:
            conn.close()

 # Add to watchlist
@app.route('/add_to_watchlist', methods=['POST'])
def add_to_watchlist():
    data = request.json
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')

    if not user_id or not movie_id:
        return jsonify({"error": "User ID and Movie ID are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the movie is already in the user's watchlist
        cursor.execute("SELECT 1 FROM watchlist WHERE user_id = %s AND movie_id = %s", (user_id, movie_id))
        if cursor.fetchone():
            return jsonify({"message": "Movie is already in your watchlist"}), 200

        # Add movie to watchlist if it is not there already
        cursor.execute("INSERT INTO watchlist (user_id, movie_id) VALUES (%s, %s)", (user_id, movie_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Movie added to watchlist"}), 201

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# Remove from watchlist
@app.route('/remove_from_watchlist', methods=['POST'])
def remove_from_watchlist():
    data = request.json
    user_id = data.get('user_id')
    movie_id = data.get('movie_id')

    if not user_id or not movie_id:
        return jsonify({"error": "User ID and Movie ID are required"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the movie is in the user's watchlist
        cursor.execute("SELECT 1 FROM watchlist WHERE user_id = %s AND movie_id = %s", (user_id, movie_id))
        if not cursor.fetchone():
            return jsonify({"message": "Movie is not in your watchlist"}), 200

        # Remove movie from watchlist
        cursor.execute("DELETE FROM watchlist WHERE user_id = %s AND movie_id = %s", (user_id, movie_id))
        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({"message": "Movie removed from watchlist"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    
# View Watchlist
@app.route('/watchlist/<int:user_id>', methods=['GET'])
def view_watchlist(user_id):
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    # extract the token from "Bearer <token>"
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header

    # decode the token
    decoded = decode_token(token)
    if not decoded["valid"]:
        return jsonify({"error": decoded["error"]}), 401
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Query for movies in the user's watchlist
        cursor.execute("""
            SELECT m.movie_id, m.movie_title, m.movie_poster
            FROM watchlist w
            JOIN movies m ON w.movie_id = m.movie_id
            WHERE w.user_id = %s
        """, (user_id,))
        watchlist = cursor.fetchall()
        cursor.close()
        conn.close()

        # Return the watchlist as JSON
        return jsonify({
            "watchlist": [{"movie_id": movie[0], "title": movie[1], "poster": movie[2]} for movie in watchlist]
        }), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

# Display movie details when you click on a movie    
# server/app.py
@app.route('/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query for movie details, including genre, movie description, top actors, and director
        cursor.execute("""
            SELECT movie_title, genre, movie_desc, top_actors, director, movie_poster, rating, rating_count
            FROM movies
            WHERE movie_id = %s
        """, (movie_id,))
        
        movie = cursor.fetchone()
        
        if movie:
            movie_title, genre, movie_desc, top_actors, director, movie_poster, rating, rating_count = movie
            
            # Calculate average rating
            average_rating = rating / rating_count if rating_count > 0 else 0
            
            # Create movie details dictionary
            movie_details = {
                "movie_title": movie_title,
                "genre": genre,
                "movie_desc": movie_desc,
                "top_actors": top_actors,
                "director": director,
                "movie_poster": movie_poster,
                "average_rating": average_rating
            }
            
            return jsonify(movie_details), 200
        else:
            return jsonify({"error": "Movie not found"}), 404

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/forum', methods=['POST'])
def add_forum_post():

    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    # extract the token from "Bearer <token>"
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header

    # decode the token
    decoded = decode_token(token)
    if not decoded["valid"]:
        return jsonify({"error": decoded["error"]}), 401

    # Now you can use the user info
    user_id = decoded["user_id"]
    username = decoded["username"]

    data = request.json
    title = data.get('title')
    post = data.get('post')
    tags = data.get('tags')
    if data is None:
        return jsonify({"error": "No info recieved"}), 500

    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    query = """
        INSERT INTO forumPosts (userID, title, post, tags, author)
        VALUES (%s, %s, %s, %s, %s)
    """
    cursor.execute(query, (user_id, title, post, tags, username))
    conn.commit()
    cursor.close()
    conn.close()

    # redirect to the forum page to view updated forum state
    return jsonify({'redirect': './pages/ForumPage/ForumPage'}), 200
    
@app.route('/forum', methods=['GET'])
def fetch_forum_posts():
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    # get all info from forumPosts table
    cursor.execute(f"""
        SELECT * FROM forumPosts
    """)

    table = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify({ "forumPosts": [{"id": post[0],"userID": post[1], "title": post[2], 
                                     "post": post[3], "tags": post[4], "author": post[5], 
                                     "views": post[6], "likes": post[7], "comments": post[8],
                                     "comments_count": post[7]} for post in table]}), 200

@app.route('/movies/<int:movie_id>/rate', methods=['POST'])
def rate_movie(movie_id):
    
    # auth header - extract token from header
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    # extract the token from Bearer token
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header
    decoded = decode_token(token)
    if not decoded["valid"]:
        return jsonify({"error": decoded["error"]}), 401

    user_id = decoded["user_id"]
    data = request.json
    new_rating = data.get('rating')
    if new_rating is None or not (0 <= new_rating <= 10):
        return jsonify({"error": "Rating must be between 0 and 10"}), 400

    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check user ratings in database to see if there's already an existing entry for this user and movie
        cursor.execute("SELECT 1 FROM user_ratings WHERE user_id = %s AND movie_id = %s", (user_id, movie_id))
        if cursor.fetchone():
            return jsonify({"error": "You have already rated this movie"}), 400

        # update rating if user has not rated movie and logged in
        cursor.execute("UPDATE movies SET rating = rating + %s, rating_count = rating_count + 1 WHERE movie_id = %s RETURNING rating, rating_count", (new_rating, movie_id))
        updated_rating, rating_count = cursor.fetchone()
        average_rating = updated_rating / rating_count

        cursor.execute("INSERT INTO user_ratings (user_id, movie_id, rating) VALUES (%s, %s, %s)", (user_id, movie_id, new_rating))
        conn.commit()
        cursor.close()
        conn.close()

        # return the average rating after movie is rated
        return jsonify({"average_rating": average_rating, "message": "Rating submitted successfully"}), 200
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/add_comment', methods=['POST'])
def add_comment():
    # Get the authorization header from the request
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    # Extract the token from the "Bearer <token>"
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header

    # Decode the token 
    decoded = decode_token(token)
    if not decoded["valid"]:
        return jsonify({"error": decoded["error"]}), 401

    # get user info from the decoded token
    user_id = decoded["user_id"]
    username = decoded["username"]

    # Get the comment data from the request body
    data = request.json
    post_id = data.get('postID')
    comment_text = data.get('commentText')

    if not post_id or not comment_text:
        return jsonify({"error": "Missing post ID or comment text"}), 400
    
    try:
        conn = get_db_connection()  
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    # Insert the comment into the `postComments` table
    query = """
        INSERT INTO postComments (postID, userID, commentText)
        VALUES (%s, %s, %s)
    """
    cursor.execute(query, (post_id, user_id, comment_text))
    
    # Update the comments count in the `forumPosts` table
    update_query = """
        UPDATE forumPosts
        SET comments_count = comments_count + 1
        WHERE id = %s
    """
    cursor.execute(update_query, (post_id,))
    
    # Commit the transaction and close the connection
    conn.commit()
    cursor.close()
    conn.close()

    # Return success response
    return jsonify({'message': 'Comment added successfully'}), 201

@app.route('/like_post', methods=['POST'])
def like_post():
    # Get the Authorization token from the request header
    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    # Extract token from "Bearer <token>"
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header

    # Decode the token to get the user info
    decoded = decode_token(token)
    if not decoded["valid"]:
        return jsonify({"error": decoded["error"]}), 401

    user_id = decoded["user_id"]
    
    # Get postId from request data
    data = request.json
    post_id = data.get('postId')
    action = data.get('action')  # 'like' or 'unlike'

    if not post_id or action not in ['like', 'unlike']:
        return jsonify({"error": "Invalid data received"}), 400

    try:
        # Connect to the database
        conn = get_db_connection()
        cursor = conn.cursor()

        # Check if the user has already liked the post
        cursor.execute("SELECT likes FROM forumPosts WHERE id = %s", (post_id,))
        post = cursor.fetchone()

        if not post:
            return jsonify({"error": "Post not found"}), 404

        current_likes = post[0]

        # Update likes based on the action
        if action == 'like':
            cursor.execute("UPDATE forumPosts SET likes = %s WHERE id = %s", (current_likes + 1, post_id))
        elif action == 'unlike':
            cursor.execute("UPDATE forumPosts SET likes = %s WHERE id = %s", (current_likes - 1, post_id))

        conn.commit()

        # Close the connection
        cursor.close()
        conn.close()

        return jsonify({"message": "Like updated successfully"}), 200

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/comments/<int:post_id>', methods=['GET'])
def get_comments(post_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Query the postComments table to fetch comments for the specific post
        query = """
            SELECT pc.id, pc.userID, u.username, pc.commentText, pc.createdAt
            FROM postComments pc
            JOIN users u ON pc.userID = u.id
            WHERE pc.postID = %s
            ORDER BY pc.createdAt DESC;
        """
        cursor.execute(query, (post_id,))
        comments = cursor.fetchall()

        if not comments:
            return jsonify({"message": "No comments found for this post."}), 404

        # Format the result as a list of dictionaries
        formatted_comments = [
            {
                "id": comment[0],
                "user_id": comment[1],
                "username": comment[2],
                "comment_text": comment[3],
                "created_at": comment[4]
            }
            for comment in comments
        ]

        cursor.close()
        conn.close()

        # Return the comments as a JSON response
        return jsonify(formatted_comments), 200

    except Exception as e:
        print(f"Error fetching comments: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


@app.route('/update_profile_picture', methods=['POST'])
def update_profile_picture():

    auth_header = request.headers.get("Authorization", None)
    if not auth_header:
        return jsonify({"error": "Authorization header missing"}), 401
    
    # Extract the token from "Bearer <token>"
    token = auth_header.split(" ")[1] if auth_header.startswith("Bearer ") else auth_header

    # Decode the token
    decoded = decode_token(token)
    if not decoded["valid"]:
        return jsonify({"error": decoded["error"]}), 401

    user_id = decoded["user_id"]

    data = request.json
    image_url = data.get('image_url')
    if not image_url:
        return jsonify({"error": "No image_url provided"}), 400
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500

    # Update the user's profile picture URL in the database
    query = """
        UPDATE users
        SET image_url = %s
        WHERE id = %s
    """
    cursor.execute(query, (image_url, user_id))
    conn.commit()
    cursor.close()
    conn.close()

    return jsonify({"message": "Profile picture updated successfully"}), 200

@app.route('/user/<int:user_id>/profile_pic', methods=['GET'])
def get_user_profile_pic(user_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT image_url FROM users WHERE id = %s", (user_id,))
        user = cursor.fetchone()
        if user:
            image_url = user[0] 
            if image_url:
                return jsonify({"image_url": image_url}), 200
            else:
                return jsonify({"error": "Profile picture not found"}), 404
        else:
            return jsonify({"error": "User not found"}), 404
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": "Internal Server Error"}), 500


if __name__ == '__main__':
    app.run(port=PORT)