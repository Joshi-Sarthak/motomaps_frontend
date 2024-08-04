import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import Radio from "../components/Radio/Radio"
import NewTripButton from "../components/NewTripButton/NewTripButton"
import Card from "../components/Card/Card"
import { useEffect, useState } from "react"
import { useQuery } from "../hooks/useQuery"
import Loading from "../components/Loading/Loading"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import NoSearch from "../components/NoSearch/NoSearch"
import { signInFailure, signInSuccess } from "../redux/user/userSlice"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import { CSSTransition } from "react-transition-group"
import "./sortByAnimation.css"

const SearchResults = () => {
	const [results, setResults] = useState(null)
	const [loading, setLoading] = useState(false)
	const [emptyErr, setEmptyErr] = useState(false)
	const [showRadio, setShowRadio] = useState(false)
	const navigate = useNavigate()
	const query = useQuery()
	const dispatch = useDispatch()

	const { radioOption } = useSelector((state) => state.radio)

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
		const handleSearch = async () => {
			setLoading(true)
			try {
				let option
				if (radioOption == 1) {
					option = "1"
				} else if (radioOption === 2) {
					option = "2"
				} else if (radioOption === 3) {
					option = "3"
				}

				const res = await fetch(
					`https://motomaps-backend.onrender.com/trip/search?query=${query}&radio=${option}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				)
				const data = await res.json()

				if (res.ok) {
					if (data.length === 0) {
						setEmptyErr(true)
					}

					setResults(data)
				}

				setLoading(false)
			} catch (e) {
				console.error(e)
				setLoading(false)
			}
		}
		if (query) {
			handleSearch()
		}
	}, [navigate, query, radioOption])

	if (loading) {
		return <Loading />
	}

	if (emptyErr) {
		return <NoSearch />
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

					<div className="w-full flex flex-col">
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 my-4">
							{results &&
								results.map((element) => (
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

export default SearchResults
