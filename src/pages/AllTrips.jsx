import { useState, useEffect } from "react"
import Loading from "../components/Loading/Loading"
import Card from "../components/Card/Card"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import Radio from "../components/Radio/Radio"
import NewTripButton from "../components/NewTripButton/NewTripButton"
import { useSelector, useDispatch } from "react-redux"
import { signInFailure, signInSuccess } from "../redux/user/userSlice"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { CSSTransition } from "react-transition-group"
import "./sortByAnimation.css"

export default function AllRoutes() {
	const [data, setData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [l, setL] = useState([])
	const [showRadio, setShowRadio] = useState(false)
	const { radioOption } = useSelector((state) => state.radio)
	const dispatch = useDispatch()

	useEffect(() => {
		const sendRequest = async () => {
			const res = await fetch(`https://motomaps-backend-i6cp.onrender.com/checkauth`, {
				method: "GET",
				credentials: "include",
			})
			if (!res.ok) {
				dispatch(signInFailure())
				throw Error("Failed to login, please try again")
			} else {
				const data = await res.json()
				dispatch(signInSuccess(data))
			}
		}

		sendRequest()
	}, [dispatch])

	useEffect(() => {
		const loadLocation = async () => {
			navigator.geolocation.getCurrentPosition((position) => {
				const userLocation = [
					position.coords.longitude,
					position.coords.latitude,
				]

				setL(userLocation)
			})
		}
		loadLocation()
	}, [])

	useEffect(() => {
		const loadAllRoutes = async () => {
			try {
				let option
				if (radioOption == 1) {
					option = "mostliked"
				} else if (radioOption === 2) {
					option = "newest"
				} else if (radioOption === 3) {
					option = "oldest"
				} else if (radioOption === 4) {
					option = "mostliked"
				}
				const res = await fetch(
					`https://motomaps-backend-i6cp.onrender.com/trip/load-all-${option}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				)

				if (res.ok) {
					const data = await res.json()

					if (radioOption === 4) {
						sortNearest(data, l)
						return
					}
					setData(data)
				} else {
					setError("Failed to load data")
				}
			} catch (err) {
				setError(err.message)
			} finally {
				setLoading(false)
			}
		}

		loadAllRoutes()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [radioOption])

	function toRadians(degrees) {
		return degrees * (Math.PI / 180)
	}

	function haversineDistance(coord1, coord2) {
		const R = 6371

		const lat1 = toRadians(coord1[0])
		const lon1 = toRadians(coord1[1])
		const lat2 = toRadians(coord2[0])
		const lon2 = toRadians(coord2[1])

		const dLat = lat2 - lat1
		const dLon = lon2 - lon1

		const a =
			Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

		const distance = R * c

		return distance
	}

	const sortNearest = (d, loc) => {
		setLoading(true)
		let temp = []

		for (let i = 0; i < d.length; i++) {
			const element = d[i]

			const s = JSON.parse(element.location.waypointsFeatures)
			const start = s[0].geometry.coordinates
			const l = JSON.parse(element.location.waypointsFeatures)
			const last = l[l.length - 1].geometry.coordinates

			const distance1 = haversineDistance(start, loc)
			const distance2 = haversineDistance(last, loc)
			const distance = Math.min(distance1, distance2)

			temp.push({ route: element, d: distance })
		}

		temp.sort((a, b) => a.d - b.d)
		const n = temp.slice(0, temp.length).map((item) => item.route)
		setData(n)
		setLoading(true)
	}

	if (loading) {
		return <Loading />
	}

	if (error) {
		return <div>Error: {error}</div>
	}

	return (
		<>
			<Navbar />
			<div className="flex flex-col min-h-screen">
				<div className="flex-grow bg-stone-900 flex flex-col lg:flex-row">
					<div className="w-full lg:w-1/5 border-b lg:border-b-0 lg:border-r border-neutral-700 my-2 mx-2 lg:my-4 lg:relative">
						{window.innerWidth < 1024 && (
							<div className="flex lg:hidden mb-2 font-kanit text-neutral-200 mx-5" onClick={() => setShowRadio(!showRadio)}>
								<KeyboardArrowDownIcon
									className="cursor-pointer text-white mr-2"
								/>
								Sort by
							</div>
						)}

						{/* Apply CSSTransition for sliding animation */}
						<CSSTransition
							in={showRadio || window.innerWidth >= 1024}
							timeout={300}
							classNames="radio-slide"
							unmountOnExit
						>
							<Radio />
						</CSSTransition>
					</div>

					<div className="w-full flex justify-center">
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 my-4">
							{data.map((element) => (
								<div key={element.post_id}>
									<Card
										title={element.title}
										description={element.description}
										distance={element.distance}
										image={
											element.images &&
											element.images.length > 0 &&
											element.images[0]
										}
										likes={element.likes}
										post_id={element.post_id}
										user_id={element.user_id}
										created_at={element.created_at}
									/>
								</div>
							))}
						</div>
					</div>

					<div className="fixed bottom-4 right-4 lg:relative lg:bottom-auto lg:right-auto">
						<NewTripButton />
					</div>
				</div>
			</div>
			<Footer />
		</>
	)
}
