import { useEffect, useRef, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import maplibregl from "maplibre-gl"
import "maplibre-gl/dist/maplibre-gl.css"
import style from "../map/style.json"
import DistanceMeasurementMapLibreGlDirections, { config } from "../map/custommap"
import balloonWaypointImgUrl from "../images/balloon-waypoint.png"
import balloonSnappointImgUrl from "../images/balloon-snappoint.png"
import balloonHoverpointImgUrl from "../images/balloon-hoverpoint.png"
import routelineImgUrl from "../images/blue.png"
import Footer from "../components/Footer/Footer.jsx"
import Navbar from "../components/Navbar/Navbar.jsx"
import conversions from "conversions"
import { CarouselCustomNavigation } from "../components/Carousel/Carousel.jsx"
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons"
import TimeAgo from "react-timeago"
import { useSelector, useDispatch } from "react-redux"
import { signInFailure, signInSuccess } from "../redux/user/userSlice"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"

const Trip = () => {
	const { id } = useParams()
	const mapRef = useRef(null)
	const directionsRef = useRef(null)
	const [directionsState, setDirectionsState] = useState(null)
	const [map, setMap] = useState(null)
	const [center, setCenter] = useState([0, 0])
	const [routeLoaded, setRouteLoaded] = useState(false)
	const [routeData, setRouteData] = useState({})
	const [totalDistance, setTotalDistance] = useState(0)
	const [title, setTitle] = useState(null)
	const [description, setDescription] = useState(null)
	const [images, setImages] = useState([])
	const [likes, setLikes] = useState(0)
	const [postId, setPostId] = useState(null)
	const [created_at, setCreated_at] = useState(null)
	const [username, setUsername] = useState(null)
	const [isLiked, setIsLiked] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)
	const { currentUser } = useSelector((state) => state.user)
	const dispatch = useDispatch()
	const navigate = useNavigate()

	useEffect(() => {
		const sendRequest = async () => {
			const res = await fetch(`https://motomaps-backend.onrender.com/checkauth`, {
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
		const loadRoute = async () => {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/trip/load/${id}`,
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
				setTitle(data.title)
				setDescription(data.description)
				setImages(data.images)
				setPostId(data.post_id)
				const waypointsFeatures = JSON.parse(data.location.waypointsFeatures)
				const firstWaypoint = waypointsFeatures[0].geometry.coordinates
				setTotalDistance(data.distance)
				setCenter(firstWaypoint)
				setRouteData(data)

				setCreated_at(data.created_at)
				setLikes(data.likes)
				setRouteLoaded(true)
			}
		}

		loadRoute()
	}, [id])

	useEffect(() => {
		if (mapRef.current && routeLoaded && !map) {
			const mapInstance = new maplibregl.Map({
				container: mapRef.current,
				style,
				center,
				zoom: 11,
				fadeDuration: 0,
				attributionControl: false,
			})

			mapInstance.on("load", async () => {
				const directions = new DistanceMeasurementMapLibreGlDirections(
					mapInstance,
					config
				)

				await Promise.all([
					mapInstance.loadImage(balloonWaypointImgUrl).then((image) => {
						if (image) mapInstance.addImage("balloon-waypoint", image.data)
					}),
					mapInstance.loadImage(balloonSnappointImgUrl).then((image) => {
						if (image) mapInstance.addImage("balloon-snappoint", image.data)
					}),
					mapInstance.loadImage(balloonHoverpointImgUrl).then((image) => {
						if (image)
							mapInstance.addImage("balloon-hoverpoint", image.data)
					}),
					mapInstance.loadImage(routelineImgUrl).then((image) => {
						if (image) mapInstance.addImage("routeline", image.data)
					}),
				])

				directions.on("fetchroutesend", (ev) => {
					setTotalDistance(ev.data?.routes[0].distance || 0)
				})

				directions.on("removewaypoint", () => {
					if (directions.waypoints.length < 2) {
						setTotalDistance(0)
					}
				})

				directionsRef.current = directions
				setDirectionsState(directions)
				setMap(mapInstance)
			})
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [center, routeLoaded])

	useEffect(() => {
		if (directionsState && routeData) {
			const waypointsFeatures = JSON.parse(routeData.location.waypointsFeatures)
			const snappointsFeatures = JSON.parse(
				routeData.location.snappointsFeatures || ""
			)
			const routelinesFeatures = JSON.parse(
				routeData.location.routelinesFeatures || ""
			)

			directionsState.setWaypointsFeatures(waypointsFeatures || "")
			directionsState.setSnappointsFeatures(snappointsFeatures)
			directionsState.setRoutelinesFeatures(routelinesFeatures)
		}
	}, [directionsState, routeData])

	useEffect(() => {
		const isLiked = async () => {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/trip/isLiked?user_id=${currentUser.user_id}&post_id=${postId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			)

			const data = await res.json()

			setIsLiked(data.liked)
		}
		if (currentUser.user_id && postId) {
			isLiked()
		}
	}, [postId, currentUser.user_id])

	useEffect(() => {
		const userDetails = async () => {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/trip/user-details?user_id=${routeData.user_id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			)

			const data = await res.json()

			setUsername(data[0].username)
		}
		if (routeData) {
			userDetails()
		}
	}, [routeData, routeData.user_id])

	const handleRevert = () => {
		//setconfirmUpdate(false)
		location.reload()
	}

	const handleLike = async () => {
		if (isLiked) {
			setIsLiked(false)
			setLikes((prev) => prev - 1)
			await fetch(`https://motomaps-backend.onrender.com/trip/unlike`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_id: currentUser.user_id,
					post_id: postId,
				}),
				credentials: "include",
			})
		} else {
			setIsLiked(true)
			setLikes((prev) => prev + 1)

			await fetch(`https://motomaps-backend.onrender.com/trip/like`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: currentUser.user_id, post_id: postId }),
				credentials: "include",
			})
		}
	}

	const handleDelete = async () => {
		const res = await fetch(
			`https://motomaps-backend.onrender.com/trip/delete/${id}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: currentUser.user_id, post_id: postId }),
				credentials: "include",
			}
		)

		if (res.ok) {
			navigate("/all")
		}
	}

	return (
		<>
			<Navbar />
			<div className="w-full h-screen bg-stone-900 overflow-x-hidden pb-4">
				<div className="mt-2">
					<Link to={`/all`}>
						<span className="font-kanit text-xl text-white px-4 hover:underline">
							<ArrowBackIosIcon className="p-[0.15rem] mb-[0.2rem]" />
							Back
						</span>
					</Link>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
					<div className="w-full px-4 lg:px-8 flex flex-col lg:flex-row items-start lg:items-center">
						<p className="block uppercase tracking-wide text-neutral-100 text-2xl lg:text-3xl font-kanit mb-2 mt-4 lg:mt-4">
							{title}
						</p>
					</div>
					<div className="w-full max-lg:hidden lg:w-1/2 ml-4">
						<p className="block uppercase tracking-wide text-neutral-100 text-lg lg:text-xl font-kanit mt-6">
							Images
						</p>
					</div>
				</div>

				<div className="flex flex-col lg:flex-row w-full px-2 lg:px-4 gap-4 ">
					<div
						className="relative w-full h-[300px] lg:w-1/2 lg:h-[500px] rounded-lg"
						ref={mapRef}
					>
						<div className="absolute bottom-0 right-0 mb-2 mr-2 z-50">
							{isLiked ? (
								<span
									className="text-red-600 hover:cursor-pointer text-lg font-kanit"
									onClick={handleLike}
								>
									<>
										<HeartFilledIcon className="w-5 h-5 animate-like inline mr-1 mb-1" />
										{likes}
									</>
								</span>
							) : (
								<span
									className="text-white hover:cursor-pointer text-lg font-kanit"
									onClick={handleLike}
								>
									<>
										<HeartIcon className="w-5 h-5 animate-like inline mr-1 mb-1" />
										{likes}
									</>
								</span>
							)}
						</div>
					</div>
					<div className="w-full lg:w-1/2">
						<p className="lg:hidden block uppercase tracking-wide text-neutral-100 text-lg lg:text-xl font-kanit mt-6">
							Images
						</p>
						<CarouselCustomNavigation images={images} />
					</div>
				</div>

				<div className="mt-4">
					<div className="flex flex-col lg:flex-row lg:justify-between">
						<p className=" tracking-wide text-neutral-100 text-lg lg:text-xl font-kanit ml-4">
							Total Route Distance{" "}
							{totalDistance ? (
								<>{conversions(totalDistance, "m", "km")} km</>
							) : (
								<>0 km</>
							)}
						</p>
						{currentUser.user_id === routeData.user_id ? (
							<div className="flex flex-row justify-between max-lg:pt-2 lg:justify-end text-white mr-4">
								<Link to={`/trip/edit/${id}`}>
									<button className="max-lg:my-2 mx-4 px-8 py-2 rounded-3xl bg-stone-900 border border-blue-700 text-blue-700 font-kanit transition duration-200 hover:bg-blue-700 hover:text-stone-900">
										Edit
									</button>
								</Link>
								<button
									onClick={() => {
										setConfirmDelete(true)
									}}
									className="max-lg:my-2 ml-4 px-8 py-2 rounded-3xl bg-stone-900 border border-red-600 text-red-600 font-kanit transition duration-200 hover:bg-red-600 hover:text-stone-900 hover:border-red-600"
								>
									Delete
								</button>
							</div>
						) : (
							<></>
						)}
					</div>
					{confirmDelete && (
						<div className="fixed inset-0 backdrop-blur-sm bg-opacity-25 flex justify-center items-center z-[200]">
							<div className="relative p-4 w-full max-w-md max-h-full">
								<div className="relative bg-white rounded-lg shadow dark:bg-stone-900">
									<div className="p-4 md:p-5 text-center">
										<svg
											className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
											aria-hidden="true"
											xmlns="http://www.w3.org/2000/svg"
											fill="none"
											viewBox="0 0 20 20"
										>
											<path
												stroke="currentColor"
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth="2"
												d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
											/>
										</svg>
										<h3 className="font-kanit mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
											Are you sure you want to DELETE this post
											permanently?
										</h3>
										<div className="flex justify-center space-x-5">
											<button
												type="button"
												onClick={handleRevert}
												data-modal-hide="popup-modal"
												className="font-kanit px-11 py-2 bg-transparent  border border-gray-800 hover:border-gray-400 dark:border-gray-700 dark:text-gray-400 text-black rounded-lg font-medium"
											>
												Revert
											</button>
											<button
												data-modal-hide="popup-modal"
												className="font-kanit px-11  hover:bg-red-700 py-1 bg-red-600 rounded-md text-white font-medium"
												onClick={handleDelete}
											>
												Delete
											</button>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					<p className="block tracking-wide uppercase text-neutral-200 text-md lg:text-lg font-kanit mt-10 ml-4">
						Description
					</p>
					<p className="block tracking-wide text-neutral-400 text-sm lg:text-md font-kanit mb-2 ml-4">
						{description}
					</p>
					<p className="block tracking-wide text-neutral-600 text-sm lg:text-md font-kanit mb-2 mt-4 ml-4">
						Posted by {username}{" "}
						<TimeAgo date={created_at} minPeriod={60} />
					</p>
				</div>
			</div>
			<Footer />
		</>
	)
}
export default Trip
