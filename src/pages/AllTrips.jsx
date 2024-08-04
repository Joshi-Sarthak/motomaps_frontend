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
	const [showRadio, setShowRadio] = useState(false)
	const { radioOption } = useSelector((state) => state.radio)
	const dispatch = useDispatch()

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
		const loadAllRoutes = async () => {
			try {
				let option
				if (radioOption == 1) {
					option = "mostliked"
				} else if (radioOption === 2) {
					option = "newest"
				} else if (radioOption === 3) {
					option = "oldest"
				}
				const res = await fetch(
					`https://motomaps-backend.onrender.com/trip/load-all-${option}`,
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
	}, [radioOption])

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
							<div className="flex lg:hidden mb-2 font-kanit text-neutral-200 mx-5">
								<KeyboardArrowDownIcon
									onClick={() => setShowRadio(!showRadio)}
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
