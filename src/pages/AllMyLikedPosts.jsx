import { useState, useEffect } from "react"
import Loading from "../components/Loading/Loading"
import Card from "../components/Card/Card"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import { useSelector, useDispatch } from "react-redux"
import { signInFailure, signInSuccess } from "../redux/user/userSlice"

export default function AllRoutes() {
	const [data, setData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const { radioOption } = useSelector((state) => state.radio)
	const { currentUser } = useSelector((state) => state.user)
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
				const res = await fetch(
					`https://motomaps-backend.onrender.com/trip/load-allmylikedposts/${currentUser.user_id}`,
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
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
					<div className="w-full flex flex-col">
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
				</div>
			</div>
			<Footer />
		</>
	)
}
