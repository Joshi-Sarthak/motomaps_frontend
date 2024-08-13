import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { useSelector } from "react-redux"
import Loading from "./components/Loading/Loading"

const Signup = lazy(() => import("./pages/Signup"))
const Login = lazy(() => import("./pages/Login"))
const Home = lazy(() => import("./pages/Home"))
const Explore = lazy(() => import("./pages/Explore"))
const Profile = lazy(() => import("./pages/Profile"))
const Trip = lazy(() => import("./pages/Trip"))
const AddTrip = lazy(() => import("./pages/AddTrip"))
const AllTrips = lazy(() => import("./pages/AllTrips"))
const AllMyTrips = lazy(() => import("./pages/AllMyTrips"))
const AllMyLikedTrips = lazy(() => import("./pages/AllMyLikedPosts"))
const EditTrip = lazy(() => import("./pages/EditTrip"))
const SearchResults = lazy(() => import("./pages/SearchResults"))

function App() {
	const { currentUser } = useSelector((state) => state.user)

	return (
		<Router>
			<Suspense fallback={<Loading />}>
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
						element={
							currentUser ? <AllMyTrips /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/likedposts"
						element={
							currentUser ? <AllMyLikedTrips /> : <Navigate to="/login" />
						}
					/>
					<Route
						path="/search"
						element={
							currentUser ? <SearchResults /> : <Navigate to="/login" />
						}
					/>
				</Routes>
			</Suspense>
		</Router>
	)
}

export default App
