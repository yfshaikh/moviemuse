import sys
import os
from uuid import uuid4
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

import unittest
from server_deployment.app import app


class MovieSearchTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # --------------------- CRISTIAN TESTCASE ---------------------
    def test_search_movies_without_genres(self):
        # Test case for searching movies without providing genres
        # Expects an error response due to missing genres
        response = self.app.get('/search')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'No genres provided')

    # --------------------- SHERIDAN TESTCASE ---------------------
    def test_search_movies_with_invalid_genres(self):
        # Test case for searching movies with invalid genres
        # Expects a 400 error response indicating invalid genres
        response = self.app.get('/search?genres=invalidgenre1&genres=invalidgenre2')
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertTrue(data['error'].startswith('Invalid genre(s):'))


# ------------------------- ADDITIONAL MOVIE TEST CASES (NOORHAN) ---------------------------
def test_search_movies_with_multiple_valid_genres(self):
    # Test case for searching movies with multiple valid genres
    # Expects a 200 response and a list of movies in the response data
    response = self.app.get('/search?genres=action&genres=comedy')
    self.assertEqual(response.status_code, 200)
    data = response.get_json()
    self.assertIn('movies', data)
    self.assertIsInstance(data['movies'], list)

def test_search_movies_with_no_results(self):
    # Test case for searching movies with a genre that yields no results
    # Expects a 200 response with an empty list of movies
    response = self.app.get('/search?genres=nonexistentgenre')
    self.assertEqual(response.status_code, 200)
    data = response.get_json()
    self.assertIn('movies', data)
    self.assertEqual(data['movies'], [])
    
# ------------------------- ADDITIONAL MOVIE TEST CASES (THANVI) ---------------------------
def test_search_movies_with_keywords(self):
    # Test case for searching movies using keywords
    # Expects a 200 response with a list of movies that match the keywords
    response = self.app.get('/search?keywords=action')
    self.assertEqual(response.status_code, 200)
    data = response.get_json()
    self.assertIn('movies', data)
    self.assertGreater(len(data['movies']), 0)  # Ensure that there are movies in the response
    for movie in data['movies']:
        self.assertIn('action', movie['title'].lower())  # Check if the keyword is in the movie title

def test_sort_movies_by_maturity_rating(self):
    # Test case for sorting movies based on maturity ratings
    # Expects a 200 response with movies sorted by the specified maturity rating
    response = self.app.get('/sort?maturity_rating=PG-13')
    self.assertEqual(response.status_code, 200)
    data = response.get_json()
    self.assertIn('movies', data)
    self.assertGreater(len(data['movies']), 0)  # Ensure that there are movies in the response
    for movie in data['movies']:
        self.assertEqual(movie['maturity_rating'], 'PG-13')  # Check if the maturity rating matches



# ------------------------- ADDITIONAL MOVIE TEST CASES (SMON) ---------------------------
    def test_like_dislike_movie(self):
        # Test case for liking a movie
        # Expects a 200 response and an updated like count
        movie_id = 1  # Replace with a valid movie ID for testing

        # Like the movie
        response = self.app.post(f'/movies/{movie_id}/like')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('likes', data)
        self.assertGreater(data['likes'], 0)  # Check if the likes count has increased

        # Dislike the movie
        response = self.app.post(f'/movies/{movie_id}/dislike')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('dislikes', data)
        self.assertGreater(data['dislikes'], 0)  # Check if the dislikes count has increased


    def test_add_movie_to_watchlist(self):
        # Test case for adding a movie to a user's watchlist
        # Expects a 200 response and confirmation that the movie was added
        movie_id = 1  # Replace with a valid movie ID for testing

        response = self.app.post(f'/watchlist/add', json={'movie_id': movie_id})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Movie added to watchlist')
        self.assertIn('watchlist', data)
        self.assertIn(movie_id, data['watchlist'])  # Check if the movie ID is in the user's watchlist


# --------------------------------------- MOVIE RATINGS -------------------------------------------

    # Run with the following command: py -m unittest app_test.MovieRatingTestCase   (After generating new token)

class MovieRatingTestCase(unittest.TestCase):
    
    # ------------------------------ Sheridan -----------------------------------    
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3QiLCJlbWFpbCI6InRlc3RAdGVzdC5jb20iLCJleHAiOjE3MzExNzI5MTB9.fBKKYmN6VXeGljNP3khtfyRWNDj0tns2VQ0V8wNNQgU'  # Replace with a valid user token (this is an expired token I used for testing
    # Generate token with "curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d "{\"email\": \"YOUR EMAIL\", \"password\": \"YOUR PASSWORD\"}")"


    # has user has already rated movie
    def test_user_already_rated_movie(self):
        response = self.app.post('/movies/1/rate', json={'rating': 8}, headers={'Authorization': f'Bearer {self.token}'})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'You have already rated this movie')

    # testing if rating above 10 is not allowed
    def test_rating_above_10(self):
        response = self.app.post('/movies/1/rate', json={'rating': 11}, headers={'Authorization': f'Bearer {self.token}'})
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Rating must be between 0 and 10')

    # testing if user is logged in before rating
    def test_rating_without_login(self):
        response = self.app.post('/movies/1/rate', json={'rating': 8})
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Authorization header missing')

    # Test case for allowing a rating if the user is logged in and hasn't rated the movie before
    def test_rating_with_valid_login(self):
        response = self.app.post('/movies/2/rate', json={'rating': 8}, headers={'Authorization': f'Bearer {self.token}'}) # This will return error if the user has already rated the movie, as it should. to pass the test case make sure you are using a movie ID that the user has not rated before
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Rating submitted successfully')



# -------------------------------------- LOGGING IN ------------------------------------------

    # Run with the following command: py -m unittest app_test.LoginTestCase

class LoginTestCase(unittest.TestCase):
    
    # ------------------------------ Marie -----------------------------------    
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # Test case: Attempt to login with an unregistered email
    def test_login_with_unregistered_email(self):
        # This test simulates a login attempt using an email that is not registered in the system.
        # Expected outcome: a 401 Unauthorized status with "Invalid email or password" message.
        
        response = self.app.post('/login', json={
            'email': 'unregistereduser@example.com',
            'password': 'password'
        })
        
        # Check that the response status code is 401 (Unauthorized)
        self.assertEqual(response.status_code, 401)
        
        # Verify the response contains the generic 'Invalid email or password' error
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Invalid email or password')



   # Test case: Attempt to login with an invalid email format
    def test_login_with_not_an_email(self):
        # This test checks the server's response when an improperly formatted email is provided.
        # Expected outcome: a 401 Unauthorized status with "Invalid email or password" message.
        
        response = self.app.post('/login', json={
            'email': 'invalid-email-format',
            'password': 'password123'
        })
        
        # Check that the response status code is 401 (Unauthorized)
        self.assertEqual(response.status_code, 401)
        
        # Verify the response contains the generic 'Invalid email or password' error
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Invalid email or password')

    # ------------------------------ Yusuf -----------------------------------

    # test case for login with valid credentials
    def test_login_with_valid_credentials(self):
        # Test case for successful login with valid credentials
        # Expects a 200 status and success message
        response = self.app.post('/login', json={
            'email': 'Jdoe123@gmail.com',                   # Dummy Account in DB (You will need to create this account if you dont have it)
            'password': '123456'
        })
        self.assertEqual(response.status_code, 200) # checks that the response status code from the API is 200
        data = response.get_json() # extracts the JSON content from the API response
        self.assertIn('message', data) # checks that there is an 'message' key in the data dictionary.
        self.assertEqual(data['message'], 'Login successful') # checks that the value of the 'message' key in the response matches the expected message

    # Test case for login with incorrect password
    def test_login_with_invalid_password(self):
        # Test case for login with a valid email but incorrect password
        # Expects a 401 error with an invalid login error message
        response = self.app.post('/login', json={
            'email': 'validuser@example.com',
            'password': 'wrongpassword'
        })
        self.assertEqual(response.status_code, 401)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Invalid email or password')

    # Test case for login with missing email or password
    def test_login_missing_fields(self):
        # Test case for login with missing email or password fields
        # Expects a 400 error with a message indicating missing fields
        response = self.app.post('/login', json={
            'email': '',  # Missing email
            'password': 'password'
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Email and password are required')


# ----------------------------------------- FORUMS ---------------------------------------------

    # Run with the following command: py -m unittest app_test.ForumTestCase

class ForumTestCase(unittest.TestCase):
    
    # ------------------------------ Marie -----------------------------------    
    
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.token = self.generate_token()

    # Sets up token for a dummy account I created on the DB
    def generate_token(self):
        response = self.app.post('/login', json={'email': 'Jdoe123@gmail.com', 'password': '123456'})
        data = response.get_json()
        return data['token'] if 'token' in data else ''

    # Test case: Verify that a forum post can be made by a logged-in user
    def test_create_forum_post(self):
        unique_title = f"Sample Forum Post {uuid4()}"  # Generate a unique title
        response = self.app.post('/forum', json={
            'title': unique_title,
            'post': 'This is a test post for verification.',
            'tags': 'test'
        }, headers={'Authorization': f'Bearer {self.token}'})
        
        # Verify that the response status code is 200
        self.assertEqual(response.status_code, 200)
        
        # Verify that the response contains a success message or redirect
        data = response.get_json()
        self.assertIn('redirect', data)

    # Test case: Verify that a logged-in user can comment on a forum post
    def test_comment_on_forum_post(self):
        response = self.app.post('/add_comment', json={
            'postID': 1,  # Replace 1 with an actual post ID for testing
            'commentText': 'This is a test comment on the forum post.'
        }, headers={'Authorization': f'Bearer {self.token}'})
        
        # Verify that the response status code is 201 Created
        self.assertEqual(response.status_code, 201)
        
        # Verify that the response contains a success message
        data = response.get_json()
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Comment added successfully')

if __name__ == '__main__':
    unittest.main()

# ----------------------------------------------- MOVIE SEARCH -----------------------------------------------
# To sort movies based on rating/title alphabetically/maturity rating
class Movie:
    def __init__(self, title, rating, maturity_rating):
        self.title = title
        self.rating = rating
        self.maturity_rating = maturity_rating
    def __repr__(self):
        return f"'{self.title}' (Rating: {self.rating}, Maturity Rating: {self.maturity_rating})"
def sort_alphabetically_A_Z(movies):
    return sorted(movies, key=lambda x: x.title)
def sort_alphabetically_Z_A(movies):
    return sorted(movies, key=lambda x: x.title, reverse=True)
def sort_by_rating_high_to_low(movies):
    return sorted(movies, key=lambda x: x.rating, reverse=True)
def sort_by_rating_low_to_high(movies):
    return sorted(movies, key=lambda x: x.rating)
def sort_by_maturity_R_G(movies):
    maturity_order = {'G': 1, 'PG': 2, 'PG-13': 3, 'R': 4}
    return sorted(movies, key=lambda x: maturity_order.get(x.maturity_rating, 5), reverse=True)
def sort_by_maturity_G_R(movies):
    maturity_order = {'G': 1, 'PG': 2, 'PG-13': 3, 'R': 4}
    return sorted(movies, key=lambda x: maturity_order.get(x.maturity_rating, 5))

# Test Data
movies = [
    Movie("Inception", 8.8, "PG-13"),
    Movie("Avatar", 8.0, "PG-13"),
    Movie("Zootopia", 8.0, "PG"),
    Movie("The Dark Knight", 9.0, "PG-13"),
    Movie("Toy Story", 8.3, "G"),
    Movie("Deadpool", 8.0, "R"),
    Movie("Titanic", 7.8, "PG-13")
]

# Test Cases
print("Sorted Alphabetically A-Z:")
print(sort_alphabetically_A_Z(movies))
print("\nSorted Alphabetically Z-A:")
print(sort_alphabetically_Z_A(movies))
print("\nSorted by Rating (Highest to Lowest):")
print(sort_by_rating_high_to_low(movies))
print("\nSorted by Rating (Lowest to Highest):")
print(sort_by_rating_low_to_high(movies))
print("\nSorted by Maturity Rating (R to G):")
print(sort_by_maturity_R_G(movies))
print("\nSorted by Maturity Rating (G to R):")
print(sort_by_maturity_G_R(movies))


# Delete movies from watch list
class MovieWatchlistTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
        self.token = 'your-valid-token-here'  # Replace with a valid user token
    def test_delete_movie_from_watchlist(self):
        # Test case for deleting a movie from the user's watchlist
        # Expects a 200 response and confirmation that the movie was removed

        movie_id = 1  # Replace with a valid movie ID for testing

        # Delete the movie from the watchlist
        response = self.app.post(f'/watchlist/delete', json={'movie_id': movie_id}, headers={'Authorization': f'Bearer {self.token}'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Movie removed from watchlist')

        # Check if the movie is actually removed from the watchlist
        response = self.app.get(f'/watchlist', headers={'Authorization': f'Bearer {self.token}'})
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('watchlist', data)
        self.assertNotIn(movie_id, data['watchlist'])  # Ensure that the movie ID is no longer in the watchlist