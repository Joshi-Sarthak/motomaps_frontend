import { useSelector } from "react-redux"
import { useRef, useState, useEffect } from "react"
import { getStorage, uploadBytesResumable, ref, getDownloadURL } from "firebase/storage"
import { app } from "../firebase.js"
import { useDispatch } from "react-redux"
import { Input } from "../components/ui/Input"
import { cn } from "../utils/cn"
import { Label } from "../components/ui/Label"
import Navbar from "../components/Navbar/Navbar"
import Footer from "../components/Footer/Footer"
import Card from "../components/Card/Card"
import { Link } from "react-router-dom"

import {
	signOut,
	updateUserSuccess,
	deleteUserSuccess,
	signInFailure,
	signInSuccess,
} from "../redux/user/userSlice.js"
import Loading from "../components/Loading/Loading.jsx"

export default function Profile() {
	const fileRef = useRef(null)
	const [image, setImage] = useState()
	const [imagePercent, setImagePercent] = useState(0)
	const [isLoading, setIsLoading] = useState(false)
	const [imageError, setImageError] = useState(false)
	const [formData, setFormData] = useState({})
	const [updateSuccess, setUpdateSuccess] = useState(false)
	const [error, setError] = useState(null)
	const [myPostsLen, setMyPostsLen] = useState(0)
	const [myLikedPostsLen, setMyLikedPostsLen] = useState(0)
	const [confirmUpdate, setconfirmUpdate] = useState(false)
	const [myPosts, setMyPosts] = useState([])
	const [myLikedPosts, setMyLikedPosts] = useState([])
	const [screenLoading, setScreenLoading] = useState(false)
	const [confirmDelete, setConfirmDelete] = useState(false)

	const { currentUser } = useSelector((state) => state.user)

	const dispatch = useDispatch()

	useEffect(() => {
		const sendRequest = async () => {
			setScreenLoading(true)
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
				loadMyPosts()
				loadMyLikedPosts()
			}
		}

		const loadMyPosts = async () => {
			try {
				const res = await fetch(
					`https://motomaps-backend.onrender.com/trip/load-myposts/${currentUser.user_id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				)

				const r = await res.json()
				setMyPostsLen(r.length)
				const data = r.slice(0, 2)
				setMyPosts(data)

				if (!res.ok) {
					setError(myPosts.msg)
					setIsLoading(false)
				}
				if (res.ok) {
					setError(false)
				}
				setIsLoading(false)
			} catch (error) {
				setIsLoading(false)
			}
		}

		const loadMyLikedPosts = async () => {
			try {
				const res = await fetch(
					`https://motomaps-backend.onrender.com/trip/load-mylikedposts/${currentUser.user_id}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
						credentials: "include",
					}
				)

				const r = await res.json()
				setMyLikedPostsLen(r.length)
				const data = r.slice(0, 2)
				setMyLikedPosts(data)

				if (!res.ok) {
					setError(myLikedPosts.msg)
					setIsLoading(false)
				}
				if (res.ok) {
					setError(false)
				}
				setIsLoading(false)
			} catch (error) {
				setIsLoading(false)
			}
			setScreenLoading(false)
		}

		sendRequest()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dispatch])

	const handleRevert = () => {
		//setconfirmUpdate(false)
		location.reload()
	}

	const handleFileUpload = async (image) => {
		const storage = getStorage(app)
		const fileName = new Date().getTime() + image.name
		const storageRef = ref(storage, fileName)
		const uploadTask = uploadBytesResumable(storageRef, image)

		uploadTask.on(
			"state_changed",
			(snapshot) => {
				const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
				setImagePercent(Math.round(progress))
			},

			// eslint-disable-next-line no-unused-vars
			(error) => {
				setImageError(true)
			},

			() => {
				getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
					setFormData({
						...formData,
						profilePicture: downloadURL,
					})
				})
			}
		)
	}

	const checkForm = (e) => {
		if (e.target.id === "firstname") {
			if (e.target.value === "") {
				setError("First name cannot be empty")
			} else {
				setError(null)
				if (formData.username === "") {
					setError("Username cannot be empty")
				}
			}
		} else if (e.target.id === "username") {
			if (e.target.value === "") {
				setError("Username cannot be empty")
			} else {
				setError(null)
				if (formData.firstname === "") {
					setError("First name cannot be empty")
				}
			}
		}
	}

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.id]: e.target.value,
		})

		checkForm(e)
	}

	const handleSubmit = async (e) => {
		setIsLoading(true)
		e.preventDefault()
		try {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/users/update/${currentUser.user_id}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ ...formData, id: currentUser.user_id }),
					credentials: "include",
				}
			)
			const data = await res.json()
			if (!res.ok) {
				setError(data.msg)
				setIsLoading(false)
				setconfirmUpdate(false)
			}
			if (res.ok) {
				dispatch(updateUserSuccess(data))

				setUpdateSuccess(true)
				setconfirmUpdate(false)
				setError(false)
			}

			setIsLoading(false)
		} catch (error) {
			setIsLoading(false)
		}
	}

	useEffect(() => {
		if (image) {
			handleFileUpload(image)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [image])

	const handleDeleteAccount = async () => {
		setIsLoading(true)
		try {
			const res = await fetch(
				`https://motomaps-backend.onrender.com/users/delete/${currentUser.user_id}`,
				{
					method: "DELETE",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ id: currentUser.user_id }),
					credentials: "include",
				}
			)
			const data = await res.json()

			if (!res.ok) {
				setError("Failed to delete account")
				return
			}

			if (res.ok) {
				dispatch(deleteUserSuccess(data))
				return
			}

			setIsLoading(false)
		} catch (error) {
			setIsLoading(false)
		}
	}

	const handleSignout = async () => {
		setIsLoading(true)
		try {
			await fetch("https://motomaps-backend.onrender.com/users/signout")
			dispatch(signOut())
			setIsLoading(false)
		} catch (error) {
			setIsLoading(false)
		}
	}

	const handleConfirmUpdate = () => {
		if (JSON.stringify(formData) !== "{}") {
			setconfirmUpdate(true)
		} else {
			setError("Please change details to update")
		}
	}

	const handleConfirmDelete = () => {
		setConfirmDelete(true)
	}

	const scrollToProfile = () => {
		document
			.getElementById("profile-section")
			.scrollIntoView({ behavior: "smooth" })
		setTimeout(() => {
			window.scrollBy(0, -60) // Adjust the value as needed
		}, 800)
	}

	const scrollToLikedPosts = () => {
		document.getElementById("liked-section").scrollIntoView({ behavior: "smooth" })
		setTimeout(() => {
			window.scrollBy(0, -55) // Adjust the value as needed
		}, 800)
	}

	const scrollToBookmarks = () => {
		document
			.getElementById("bookmark-section")
			.scrollIntoView({ behavior: "smooth" })
		setTimeout(() => {
			window.scrollBy(0, -50) // Adjust the value as needed
		}, 800)
	}

	if (screenLoading) {
		return <Loading />
	}

	return (
		<>
			<Navbar />
			<div id="profile-section" className="flex flex-col lg:flex lg:flex-row">
				<div className="w-full min-h-screen bg-stone-900 flex-1 flex flex-row lg:w-4/12 p-1">
					<div className="max-w-md w-full max-sm:mx-4 mx-auto max-lg:pb-6 lg:pl-2 lg:pr-3 xl:pr-6 2xl:pr-8 shadow-input max-lg:mx-auto mt-2 border-b lg:border-b-0 lg:border-r border-neutral-700">
						<h2 className="font-kanit old text-xl text-neutral-800 dark:text-neutral-200 mx-auto text-center">
							Profile
						</h2>

						<form
							className="my-8"
							onSubmit={handleSubmit}
							autoComplete="off"
						>
							<input
								type="file"
								ref={fileRef}
								hidden
								accept="image/*"
								onChange={(e) => {
									setImage(e.target.files[0])
								}}
							/>

							<div className="flex flex-row h-24 w-40 mx-auto mb-8">
								<img
									src={
										formData.profilePicture ||
										currentUser.profile_pic
									}
									alt="profileimage"
									className="mb-8 mt-0  mx-auto h-24 w-24 object-cover rounded-full"
								/>

								<span
									className="cursor-pointer"
									onClick={() => {
										fileRef.current.click()
									}}
								>
									<svg
										width="15"
										height="15"
										viewBox="0 0 15 15"
										fill="none"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z"
											fill="#FFFFFF"
											fillRule="evenodd"
											clipRule="evenodd"
										></path>
									</svg>
								</span>
							</div>

							<p className="text-md text-center">
								{imageError ? (
									<span className="font-kanit font-light text-red-700 text-center">
										Error Uploading Image
									</span>
								) : imagePercent > 0 && imagePercent < 100 ? (
									<span className="text-slate-700 font-kanit font-light text-center">{`Uploading:${imagePercent} %`}</span>
								) : imagePercent === 100 ? (
									<span className="font-kanit font-light text-green-700 text-center">
										Image Uploaded Successfully, Click on Update to
										confirm
									</span>
								) : (
									""
								)}
							</p>

							<div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-2 mt-5">
								<LabelInputContainer className="mb-4">
									<Label htmlFor="firstname">Firstname</Label>
									<Input
										type="text"
										defaultValue={currentUser.first_name}
										id="firstname"
										placeholder="Firstname"
										onChange={handleChange}
									/>
								</LabelInputContainer>

								<LabelInputContainer className="mb-4">
									<Label htmlFor="lastname">Lastname</Label>
									<Input
										type="text"
										defaultValue={currentUser.last_name}
										id="lastname"
										placeholder="Lastname"
										onChange={handleChange}
									/>
								</LabelInputContainer>
							</div>

							<LabelInputContainer className="mb-4">
								<Label htmlFor="username">Username</Label>
								<Input
									type="text"
									defaultValue={currentUser.username}
									id="username"
									placeholder="Username"
									onChange={handleChange}
								/>
							</LabelInputContainer>

							<LabelInputContainer className="mb-4">
								<Label htmlFor="email">Email Address</Label>
								<Input
									isProfileEmail={true}
									disabled={true}
									type="text"
									defaultValue={currentUser.email}
									id="email"
									placeholder="Email"
									onChange={handleChange}
								/>
							</LabelInputContainer>

							<LabelInputContainer className="mb-4">
								<Label htmlFor="email">Password</Label>
								<Input
									type="password"
									id="password"
									placeholder="Password"
									className="bg-slate-100 rounded-lg p-3"
									onChange={handleChange}
								/>
							</LabelInputContainer>

							{!confirmUpdate && (
								<button
									className="relative border border-gray-800 flex items-center justify-center bg-gradient-to-br group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 dark:bg-zinc-800 w-full text-neutral-200 rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
									type="button"
									onClick={handleConfirmUpdate}
									disabled={error}
								>
									<>Update</>
									<BottomGradient />
								</button>
							)}

							{confirmUpdate && (
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
													Are you sure you want to update this
													Account?
												</h3>
												<div className="flex ml-11 space-x-5">
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
														className="font-kanit hover:bg-[rgba(0,118,255,0.9)] px-3.5 py-1 bg-[#0070f3] rounded-md text-white transition duration-200 ease-linear font-medium"
														type="submit"
														disabled={isLoading}
													>
														{isLoading ? (
															<>
																<svg
																	aria-hidden="true"
																	className="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
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
															</>
														) : (
															<> Confirm Update</>
														)}
													</button>
												</div>
											</div>
										</div>
									</div>
								</div>
							)}
						</form>

						{!confirmUpdate && (
							<div className="flex space-x-6 justify-between mt-5">
								<button
									onClick={handleConfirmDelete}
									className="relative py-4 font-semibold flex items-center justify-center bg-gradient-to-br group/btn from-red-950 dark:from-red-900 dark:to-red-700 to-red-200 dark:bg-zinc-800 w-full text-neutral-200 rounded-md h-8 shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
									type="button"
									disabled={isLoading}
								>
									Delete Account
									<BottomGradientRed />
								</button>

								<button
									onClick={handleSignout}
									className="relative py-4 font-semibold flex items-center justify-center bg-gradient-to-br group/btn from-red-950 dark:from-red-900 dark:to-red-700 to-red-200 dark:bg-zinc-800 w-full text-neutral-200 rounded-md h-8 shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
									type="button"
									disabled={isLoading}
								>
									SignOut
									<BottomGradientRed />
								</button>
							</div>
						)}

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
												Are you sure you want to DELETE this
												account along with it`s posts
												permanently?
											</h3>
											<div className="flex ml-11 space-x-5">
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
													onClick={handleDeleteAccount}
												>
													Delete
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						)}

						{error ? (
							<p className="font-kanit font-light text-red-700 mt-5">
								{error}
							</p>
						) : (
							""
						)}

						{updateSuccess && (
							<p className="font-kanit font-light text-green-700 mt-5">
								User Updated!
							</p>
						)}
					</div>
				</div>

				<div
					id="liked-section"
					className="w-full lg:w-4/12 min-h-screen flex-1 bg-stone-900 border-b lg:border-b-0 lg:border-r border-neutral-700"
				>
					<div className="max-w-md ml-8 w-full mb-0 px-4 md:px-8  max-lg:mx-auto mt-2">
						<h2 className="font-kanit text-xl text-neutral-800 dark:text-neutral-200 mx-auto xl:pr-4 text-center">
							My Posts
						</h2>

						<div className="flex flex-row min-h-screen">
							<div className="flex-grow bg-stone-900 flex flex-col lg:flex-row">
								<div className="w-full flex flex-col my-1">
									<div className="">
										{myPosts.map((element) => (
											<div className="my-2" key={element.post_id}>
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

										{myPostsLen > 2 && (
											<Link to="/myposts">
												<button className="mb-2 mt-8 w-full bg-stone-950 hover:bg-stone-800 font-kanit font-medium rounded-lg text-sm px-5 py-2.5 text-white focus:outline-none transition-all duration-200">
													View More
												</button>
											</Link>
										)}

										{myPosts.length == 0 && (
											<div className="flex justify-center items-center h-screen text-neutral-200 font-kanit font-light text-xl">
												No posts yet :(
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div
					id="bookmark-section"
					className="w-full lg:w-4/12 min-h-screen flex-1 bg-stone-900 "
				>
					<div className="max-w-md w-full mx-auto mb-0 px-4 md:px-8  max-lg:mx-auto mt-2">
						<h2 className="font-kanit text-xl text-neutral-800 dark:text-neutral-200 mx-auto text-center">
							Liked Posts
						</h2>
						<div className="flex flex-row min-h-screen">
							<div className="flex-grow bg-stone-900 flex flex-col lg:flex-row">
								<div className="w-full flex flex-col my-1">
									<div className="">
										{myLikedPosts.map((element) => (
											<div className="my-2" key={element.post_id}>
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

										{myLikedPostsLen > 2 && (
											<Link to="/likedposts">
												<button className="mb-2 mt-8 w-full bg-stone-950 hover:bg-stone-800 font-kanit font-medium rounded-lg text-sm px-5 py-2.5 text-white focus:outline-none transition-all duration-200">
													View More
												</button>
											</Link>
										)}

										{myLikedPosts.length == 0 && (
											<div className="flex justify-center items-center h-screen text-neutral-200 font-kanit font-light text-xl">
												No posts liked yet :(
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="fixed bottom-0 left-0 right-0 bg-stone-950 text-white lg:hidden flex justify-around items-center py-2">
				<button onClick={scrollToProfile} className="text-center">
					<svg
						className="h-6 w-6 mx-auto mb-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z M4.271 18.3457C4.271 18.3457 6.50002 15.5 12 15.5C17.5 15.5 19.7291 18.3457 19.7291 18.3457 M12 12C13.6569 12 15 10.6569 15 9C15 7.34315 13.6569 6 12 6C10.3431 6 9 7.34315 9 9C9 10.6569 10.3431 12 12 12Z"
						/>
					</svg>
					Profile
				</button>
				<button onClick={scrollToLikedPosts} className="text-center">
					<svg
						className="h-6 w-6 mx-auto mb-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9.14,5.08c0,2.39-3.82,6-3.82,6S1.5,7.47,1.5,5.08A3.7,3.7,0,0,1,5.32,1.5,3.7,3.7,0,0,1,9.14,5.08Z"
						/>
						<circle
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							className="cls-2"
							cx="5.32"
							cy="5.32"
							r="0.95"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							className="cls-1"
							d="M22.5,14.62c0,2.39-3.82,6-3.82,6s-3.82-3.58-3.82-6a3.7,3.7,0,0,1,3.82-3.57A3.7,3.7,0,0,1,22.5,14.62Z"
						/>
						<circle
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							className="cls-2"
							cx="18.68"
							cy="14.86"
							r="0.95"
						/>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							className="cls-1"
							d="M4.36,13h4.3a2.39,2.39,0,0,1,2.39,2.39h0a2.39,2.39,0,0,1-2.39,2.39H3.89A2.39,2.39,0,0,0,1.5,20.11h0A2.39,2.39,0,0,0,3.89,22.5H19.64"
						/>
					</svg>
					My Posts
				</button>
				<button onClick={scrollToBookmarks} className="text-center">
					<svg
						className="h-6 w-6 mx-auto mb-1"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
						/>
					</svg>
					Liked
				</button>
			</div>

			<Footer />
		</>
	)
}

const BottomGradient = () => {
	return (
		<>
			<span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
			<span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
		</>
	)
}
const BottomGradientRed = () => {
	return (
		<>
			<span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-red-400 to-transparent" />
			<span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-neutral-100 to-transparent" />
		</>
	)
}

const LabelInputContainer = ({ children, className }) => {
	return (
		<div className={cn("flex flex-col space-y-2 w-full", className)}>
			{children}
		</div>
	)
}
