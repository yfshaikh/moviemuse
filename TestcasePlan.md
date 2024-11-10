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

# -------------------------------------------------------------------------------------------------------------

# Login & Forum Posts (Marie)
## Inputs
For the `test_create_forum_post` and `test_comment_on_forum_post` cases, it will also take a
token generated using a test account Jdoe123@gmail.com with password 123456. The token is created in the test case
	
### `test_login_with_unregistered_email`
- Email not registered in the database. EX: unregistereduser@example.com
- Any valid password. EX: password123

### `test_login_with_not_an_email`
- Any invalid email format (no @ or .com). EX: invalid-email
- Any valid password. EX: password123

### `test_create_forum_post`
- Valid token.
- Post Data:
- 	Title: Sample Forum Post
- 	Content: This is a test post for verification.
- 	Tags: test

### `test_comment_on_forum_post`
- Valid token
- Any valid post_id. EX: 1
- Comment. EX: This is a test comment on the forum post.

## Expected Outputs
### `test_login_with_unregistered_email`
- OK: Error: {"error": "Invalid email or password"}

### `test_login_with_not_an_email`
- OK: Error: {"error": "Invalid email or password"}

### `test_create_forum_post`
- OK: 
	If user not logged in: Error: {"error": "Authorization header missing"} with a 401 status code prompting the user to log in.

	If user is logged in: Post successfully created. Status Code: 200

### `test_comment_on_forum_post`
- OK: 
	If user not logged in: Error: {"error": "Authorization header missing"} with a 401 status code prompting the user to log in.

	If user is logged in: Comment added successfully. Status Code: 201

#
----------------------------------------------------------------------
# Searching Movies (Noorhan)

## Inputs
# 'test_search_movies_with_multiple_valid_genres
- Any valid token
- EX: "Toy Story"

## test_search_movies_with_no_results
- Any invalid token
- EX: "Not a Movie"

## Outputs
# test_search_movies_with_multiple_valid_genres
- Movie matches genres chosen: corresponding movies show up

# test_search_movies_with_no_results
- OK: Nothing shows up on the screen 
