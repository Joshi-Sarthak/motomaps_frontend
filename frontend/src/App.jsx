import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Signup from "./pages/Signup"
import Login from "./pages/Login"
import Home from "./pages/Home"
import Explore from "./pages/Explore"
import Profile from "./pages/Profile"
import Trip from "./pages/Trip"
import AddTrip from "./pages/AddTrip"
import AllTrips from "./pages/AllTrips"
import AllMyTrips from "./pages/AllMyTrips"
import AllMyLikedTrips from "./pages/AllMyLikedPosts"
import EditTrip from "./pages/EditTrip"
import { useSelector } from "react-redux"
import SearchResults from "./pages/SearchResults"

function App() {
	const { currentUser } = useSelector((state) => state.user)
	return (
		<Router>
			<Routes>
				<Route path="/" element={<Explore />} />
				<Route
					path="/login"
					element={!currentUser ? <Login /> : <Navigate to="/home" />}
				/>
				<Route
					path="/signup"
					element={!currentUser ? <Signup /> : <Navigate to="/home" />}
				/>
				<Route
					path="/home"
					element={currentUser ? <Home /> : <Navigate to="/login" />}
				/>
				<Route
					path="/profile"
					element={currentUser ? <Profile /> : <Navigate to="/login" />}
				/>
				<Route
					path="/trip/:id"
					element={currentUser ? <Trip /> : <Navigate to="/login" />}
				/>
				<Route
					path="/trip/edit/:id"
					element={currentUser ? <EditTrip /> : <Navigate to="/login" />}
				/>
				<Route
					path="/newtrip"
					element={currentUser ? <AddTrip /> : <Navigate to="/login" />}
				/>
				<Route
					path="/all"
					element={currentUser ? <AllTrips /> : <Navigate to="/login" />}
				/>
				<Route
					path="/myposts"
					element={currentUser ? <AllMyTrips /> : <Navigate to="/login" />}
				/>
				<Route
					path="/likedposts"
					element={
						currentUser ? <AllMyLikedTrips /> : <Navigate to="/login" />
					}
				/>
				<Route
					path="/search"
					element={currentUser ? <SearchResults /> : <Navigate to="/login" />}
				/>
			</Routes>
		</Router>
	)
}

export default App
