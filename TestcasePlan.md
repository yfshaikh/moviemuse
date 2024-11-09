# TESTCASE (NAME)



# Movie Ratings (Sheridan)
---
## Inputs
Any existing user token (create an account on webpage then run in your cmd:
	`curl -X POST http://localhost:8000/login -H "Content-Type: application/json" -d "{\"email\": \"YOUR EMAIL\", \"password\": \"YOUR PASSWORD\"}")`

The token may expire during testing so generate a new token every so often.
	
### `test_user_already_rated_movie`
- login with matching token
- Any valid `movie_id`
- A `rating` for the `movie_id` between 0-10 (submitted by the user who's token you are using)

### `test_rating_above_10`
- login with matching token
- Any valid `movie_id`
- A `rating` for the `movie_id` below 0 or above 10 (submitted by the user who's token you are using)

### `test_rating_without_login`
- logout/do not login
- Any valid `movie_id`
- A valid `rating`

### `test_rating_with_valid_login`
- login with matching token
- Any valid `movie_id`
- A valid `rating`

## Expected Outputs
### `test_user_already_rated_movie`
- OK: "You have already rated this movie"
  
### `test_rating_above_10`
- OK: "Rating must be between 0 and 10"

### `test_rating_without_login`
- OK: "Login to rate your favorite movies!"

### `test_rating_with_valid_login`
- *If user has already rated movie* - ERROR: "You have already rated this movie" 
- *If user has not rated movie* - OK: "Rating submitted successfully"