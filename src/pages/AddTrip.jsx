import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useLocation, useNavigate } from "react-router-dom"
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from "firebase/storage"
import maplibregl from "maplibre-gl"
import { app } from "../firebase.js"
import "maplibre-gl/dist/maplibre-gl.css"
import style from "../map/style.json"
import DistanceMeasurementMapLibreGlDirections, { config } from "../map/custommap"
import balloonWaypointImgUrl from "../images/balloon-waypoint.png"
import balloonSnappointImgUrl from "../images/balloon-snappoint.png"
import balloonHoverpointImgUrl from "../images/balloon-hoverpoint.png"
import routelineImgUrl from "../images/blue.png"
import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box"
import "./mapsearch.css"
import Navbar from "../components/Navbar/Navbar.jsx"
import { ImageIcon } from "@radix-ui/react-icons"
import conversions from "conversions"
import Footer from "../components/Footer/Footer.jsx"
import { signInFailure, signInSuccess } from "../redux/user/userSlice"

export default function AddTrip() {
	const fileRef = useRef(null)
	const dispatch = useDispatch()
	const [formData, setFormData] = useState({})
	const [images, setImages] = useState([])
	const { currentUser } = useSelector((state) => state.user)
	const mapRef = useRef(null)
	const directionsRef = useRef(null)
	const location = useLocation()
	const [direction, setDirections] = useState(null)
	const [totalDistance, setTotalDistance] = useState(0)
	const [error, setError] = useState(null)
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate()

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		})
	}

	const handleFileUpload = async () => {
		const storage = getStorage(app)
		const uploadPromises = images.map((image) => {
			const fileName = new Date().getTime() + image.name
			const storageRef = ref(storage, fileName)
			const uploadTask = uploadBytesResumable(storageRef, image)

			return new Promise((resolve, reject) => {
				uploadTask.on(
					"state_changed",
					() => {},
					(error) => {
						if (error.code === 'storage/unauthorized') {
							setError("Only jpeg and png format allowed for images")
						}
						reject(error)
					},
					() => {
						getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
							resolve(downloadURL)
						})
					}
				)
			})
		})

		const downloadURLs = await Promise.all(uploadPromises)
		setFormData((prevFormData) => ({
			...prevFormData,
			images: downloadURLs,
		}))
	}

	const saveRoute = async (e) => {
		e.preventDefault()

		if (!formData.title || !formData.description) {
			setLoading(true)
			setError("Please fill all the fields")
			setLoading(false)
			return
		} else {
			setError(null)
			if (formData.images.length !== 0) {
				if (images.length > 0 && images.length < 6) {
					setLoading(true) // Set loading to true when submission starts
					try {
						const route = {
							waypointsFeatures: JSON.stringify(
								direction.waypointsFeatures
							),
							snappointsFeatures: JSON.stringify(
								direction.snappointsFeatures
							),
							routelinesFeatures: JSON.stringify(
								direction.routelinesFeatures
							),
						}

						if (totalDistance == 0) {
							setError("Please add trip on the map")
							setLoading(false)
							return
						}

						const res = await fetch(
							`https://motomaps-backend.onrender.com/trip/save`,
							{
								method: "POST",
								headers: {
									"Content-Type": "application/json",
								},
								credentials: "include",
								body: JSON.stringify({
									...formData,
									id: currentUser.user_id,
									route,
									distance: totalDistance,
									created_at: Date.now(),
								}),
							}
						)

						if (res.ok) {
							navigate("/all")
						} else {
							// Handle error

							setError("Submission failed. Please try again.")
						}
					} catch (err) {
						setError("Please fill all the fields.")
					} finally {
						setLoading(false) // Reset loading to false when done
					}
				} else {
					setError("Upload minimum 1 and maximum 5 images")
					setLoading(false)
				}
			}
		}
	}

	const clear = () => {
		direction.clear()
	}

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
		if (images) {
			handleFileUpload()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [images])

	useEffect(() => {
		if (mapRef.current) {
			const control = new MapLibreSearchControl({
				onResultSelected: () => {},
			})

			const map = new maplibregl.Map({
				container: mapRef.current,
				style,
				center: [-74.1197632, 40.6974034],
				zoom: 11,
				fadeDuration: 0,
				attributionControl: false,
			})

			map.addControl(control, "top-left")

			navigator.geolocation.getCurrentPosition(
				(position) => {
					const userLocation = [
						position.coords.longitude,
						position.coords.latitude,
					]
					map.setCenter(userLocation)
					map.flyTo({
						center: userLocation,
						essential: true,
					})
				},
				(error) => {
					console.error("Error getting user location:", error)
				}
			)

			map.on("load", async () => {
				const directions = new DistanceMeasurementMapLibreGlDirections(
					map,
					config
				)

				await Promise.all([
					map.loadImage(balloonWaypointImgUrl).then((image) => {
						if (image) map.addImage("balloon-waypoint", image.data)
					}),
					map.loadImage(balloonSnappointImgUrl).then((image) => {
						if (image) map.addImage("balloon-snappoint", image.data)
					}),
					map.loadImage(balloonHoverpointImgUrl).then((image) => {
						if (image) map.addImage("balloon-hoverpoint", image.data)
					}),
					map.loadImage(routelineImgUrl).then((image) => {
						if (image) map.addImage("routeline", image.data)
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

				setDirections(directions)

				directions.interactive = true
				directionsRef.current = directions
			})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname])

	return (
		<>
			<Navbar />
			<div className="w-full h-screen bg-stone-900 overflow-x-hidden pb-4">
				<p className="text-neutral-200 px-4 mt-4 font-kanit font-light lg:ml-20">
					Total Route Distance:{" "}
					{totalDistance ? (
						<>{conversions(totalDistance, "m", "km")} km</>
					) : (
						<>0 km</>
					)}
				</p>
				<div className="flex flex-col lg:flex-row w-full px-2 lg:px-4 lg:ml-20 mt-2">
					<div
						className="w-full lg:w-1/2 h-[500px] rounded-md"
						ref={mapRef}
					/>
					<button
						onClick={clear}
						className="max-lg:w-fit lg:hidden max-lg:mx-auto h-12 2xl:h-10 mt-4 px-4 py-2 rounded-md border font-kanit border-neutral-300 bg-neutral-100 text-black text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
					>
						Clear Waypoints
					</button>
					<div className="w-full lg:w-1/2">
						<form
							onSubmit={saveRoute}
							className="flex flex-col w-full lg:w-2/3 mx-auto max-lg:mt-2"
						>
							<div className="w-full lg:px-3">
								<label
									className="block uppercase tracking-wide text-neutral-100 text-sm font-kanit mb-2"
									htmlFor="title"
								>
									Title
								</label>
								<input
									className="appearance-none placeholder-gray-500 hover:bg-white block w-full bg-gray-200 text-stone-700 border border-gray-200 rounded-md py-3 px-4 mb-6 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
									id="title"
									type="text"
									placeholder="Manali to Leh via Zanskar"
									onChange={handleChange}
								/>
							</div>
							<div className="w-full lg:px-3">
								<label
									className="block uppercase tracking-wide text-neutral-100 text-sm font-kanit mb-2"
									htmlFor="description"
								>
									Description
								</label>
								<textarea
									className="appearance-none placeholder-gray-500 hover:bg-white block w-full bg-gray-200 text-stone-700 border border-gray-200 rounded-md py-3 px-4 mb-6 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
									id="description"
									placeholder="Yap about the place"
									rows="6"
									maxLength={200}
									onChange={handleChange}
								/>
							</div>

							<input
								type="file"
								ref={fileRef}
								accept="image/*"
								className="w-[0.1px] h-[0.1px] opacity-0 overflow-hidden absolute z-[-1]"
								id="file-input"
								multiple
								onChange={(e) => {
									setImages(Array.from(e.target.files))
								}}
							/>
							<div className="w-full md:px-3">
								<p className="block uppercase tracking-wide text-neutral-100 text-sm font-kanit mb-2">
									Add Image
								</p>
								<div className="flex max-lg:flex-col">
									<label
										htmlFor="file-input"
										className="text-stone-800 cursor-pointer bg-gray-200 hover:bg-white p-3 mb-2 rounded-md w-fit"
									>
										<ImageIcon className="inline mr-3 mb-1" />
										<p className="text-stone-800 inline">
											Add Image
										</p>
										<p className="text-stone-400 ml-2 inline">
											{images.length > 0
												? images.length > 1
													? `${images.length} items selected`
													: images[0].name
												: ""}
										</p>
									</label>
									<p className="font-kanit text-neutral-400 my-3 ml-0 lg:mx-3 font-light max-lg:text-sm">
										Maximum of 5 images are allowed
									</p>
								</div>
							</div>
							{error && (
								<p className="text-red-600 font-kanit font-light mt-2 px-3">
									{error}
								</p>
							)}
							<button
								className={`p-[2px] relative mt-5 mx-auto w-1/3 ${
									loading ? "cursor-not-allowed" : ""
								}`}
								type="submit"
								disabled={loading}
							>
								<div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-800 rounded-lg" />
								<div className="px-8 py-2 bg-stone-900 rounded-[8px] relative group transition duration-400 text-white font-kanit hover:bg-transparent">
									{loading ? (
										<svg
											aria-hidden="true"
											className="inline w-5 h-5 text-gray-600 animate-spin dark:text-white fill-white dark:fill-gray-600"
											viewBox="0 0 100 101"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
												fill="currentColor"
											/>
											<path
												d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
												fill="currentFill"
											/>
										</svg>
									) : (
										"Submit"
									)}
								</div>
							</button>
						</form>
					</div>
				</div>
				<div className="flex flex-col w-full lg:flex-row lg:w-[54.2%] justify-between mt-2">
					<p className="text-neutral-400 px-2 lg:px-4 lg:ml-20 font-kanit font-light max-lg:text-sm">
						How to add routes? <br />
						1. Search your starting location and click on it on the map to
						add a waypoint <br />
						2. Repeat the procedure for destination <br />
						3. Add other waypoints in-between source and destination if
						needed <br />
						To remove all waypoints click on &#39;Clear Waypoints&#39;
						button
					</p>
					<button
						onClick={clear}
						className="max-lg:hidden max-lg:mx-auto h-14 2xl:h-10 px-4 py-2 rounded-md border font-kanit border-neutral-300 bg-neutral-100 text-black text-sm hover:-translate-y-1 transform transition duration-200 hover:shadow-md"
					>
						Clear Waypoints
					</button>
				</div>
			</div>
			<Footer />
		</>
	)
}
