import unittest
from moviemuse.server.server_deployment.app import app

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


class LoginTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    # --------------------- LOGIN TEST CASES (YUSUF) ---------------------

    # test case for login with valid credentials
    def test_login_with_valid_credentials(self):
        # Test case for successful login with valid credentials
        # Expects a 200 status and success message
        response = self.app.post('/login', json={
            'email': 'validuser@example.com',
            'password': 'correctpassword'
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

    # ----------------- ADDITIONAL LOGIN TEST CASES (MARIE) ---------------------

    def test_login_with_unregistered_email(self):
        # Test case for login with an email that is not registered in the system
        # Expects a 404 error indicating the user was not found
        response = self.app.post('/login', json={
            'email': 'unregistereduser@example.com',
            'password': 'password'
        })
        self.assertEqual(response.status_code, 404)  # Assuming 404 for user not found
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'User not found') # Output of test case
    
    def test_login_with_not_an_email(self):
        # Test case for login with an invalid email format
        # Expects a 400 error with an error message about invalid email format
        response = self.app.post('/login', json={
            'email': 'invalid-email-format',
            'password': 'password123'
        })
        self.assertEqual(response.status_code, 400)
        data = response.get_json()
        self.assertIn('error', data)
        self.assertEqual(data['error'], 'Invalid email format') # Output of test case


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


# -------------------------------- MOVIE RATINGS --------------------------------

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

if __name__ == '__main__':
    unittest.main()