import { BrowserRouter as Router, Route, Routes } from "react-router-dom"

// PAGES
import HomePage from "./pages/HomePage/HomePage"
import LoginPage from "./pages/LoginPage/LoginPage"
import SignUpPage from "./pages/SignUpPage/SignUpPage"
import ForumPage from "./pages/ForumPage/ForumPage"
import ForumPostPage from "./pages/ForumPostPage/ForumPostPage"
import MoviePage from "./pages/MoviePage/MoviePage"
import WatchlistPage from "./pages/WatchlistPage/WatchlistPage"
import MovieDetailsPage from "./pages/MovieDetailsPage/MovieDetailsPage"


function App() {
  const userId = 1; // Needs to be changed when user auth is added, this is just a test
  return (
    <>
      <Router>
        <div className="app">
          <Routes>
            <Route path = '/' element={<HomePage />} />
            <Route path = '/login' element={<LoginPage />} />
            <Route path = '/signup' element={<SignUpPage />} />
            <Route path = '/forum' element={<ForumPage />} />
            <Route path = '/forumpost' element={<ForumPostPage />} />
            <Route path = '/movies' element={<MoviePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/movie/:id" element={<MovieDetailsPage />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
