import conversions from "conversions"
import { HeartIcon, HeartFilledIcon } from "@radix-ui/react-icons"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import TimeAgo from "react-timeago"
import { useSelector } from "react-redux"

import "./animation.css"

const Card = ({ title, distance, image, user_id, post_id, likes, created_at }) => {
	const { currentUser } = useSelector((state) => state.user)
	const [isLiked, setIsLiked] = useState(false)
	const [username, setUsername] = useState(null)
	const [likeCount, setLikeCount] = useState(likes)

	useEffect(() => {
		const isLiked = async () => {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/trip/isLiked?user_id=${currentUser.user_id}&post_id=${post_id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			)

			const data = await res.json()
			console.log(data)
			setIsLiked(data.liked)
		}
		isLiked()
	}, [currentUser.user_id, post_id])

	useEffect(() => {
		const userDetails = async () => {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/trip/user-details?user_id=${user_id}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: "include",
				}
			)

			const data = await res.json()
			console.log(data)
			setUsername(data[0].username)
		}
		userDetails()
		console.log(Date.now())
	}, [user_id])

	const handleLike = async () => {
		if (isLiked) {
			setIsLiked(false)
			setLikeCount((prev) => prev - 1)
			const res = await fetch(
				`https://motomaps-backend.onrender.com/trip/unlike`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ user_id: currentUser.user_id, post_id }),
					credentials: "include",
				}
			)

			const data = await res.json()
			console.log(data)
		} else {
			setIsLiked(true)
			setLikeCount((prev) => prev + 1)

			const res = await fetch(`https://motomaps-backend.onrender.com/trip/like`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ user_id: currentUser.user_id, post_id }),
				credentials: "include",
			})

			const data = await res.json()
			console.log(data)
		}
	}

	return (
		<div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg h-96 bg-stone-900 border-[1px] border-stone-800 rounded-xl flex flex-col hover:scale-95 transition-all duration-300">
			<div className="rounded-lg w-full h-3/4 overflow-hidden px-2 pt-2">
				<Link to={`/trip/${post_id}`}>
					<img
						src={image}
						alt={title}
						className="w-full h-full object-cover rounded-md"
					/>
				</Link>
			</div>
			{isLiked ? (
				<span
					className="absolute top-3 right-3 text-red-600 bg-gray-800 rounded-full p-2 hover:cursor-pointer z-50"
					onClick={handleLike}
				>
					<HeartFilledIcon className="w-5 h-5 animate-like" />
				</span>
			) : (
				<span
					className="absolute top-3 right-3 text-white bg-gray-800 rounded-full p-2 hover:cursor-pointer z-50"
					onClick={handleLike}
				>
					<HeartIcon className="w-5 h-5" />
				</span>
			)}

			<div className="w-full h-1/4 px-2 mt-1 flex flex-col justify-center">
				<Link to={`/trip/${post_id}`}>
					<div className="flex flex-row justify-between">
						<div>
							<h2 className="text-neutral-200 text-base sm:text-lg font-kanit font-light">
								{title}
							</h2>
							<p className="text-neutral-200 text-sm sm:text-base font-kanit font-thin">
								Approximately{" "}
								{distance
									? Math.round(conversions(distance, "m", "km"))
									: 0}{" "}
								kms
							</p>
						</div>
						<div className="mt-2">
							<p className="text-neutral-200 text-sm sm:text-md font-kanit font-light">
								{likeCount} Likes
							</p>
						</div>
					</div>
					<div className="flex mt-2">
						<p className="text-neutral-600 text-sm sm:text-md font-kanit font-light ml-auto">
							Posted by {username}{" "}
							<TimeAgo date={created_at} minPeriod={60} />
						</p>
					</div>
				</Link>
			</div>
		</div>
	)
}

export default Card
