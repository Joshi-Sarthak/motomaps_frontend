import { useSelector } from "react-redux"
import { Link, useLocation } from "react-router-dom"

const Navbar = () => {
	const { currentUser } = useSelector((state) => state.user)
	const location = useLocation() // Get the current location

	const renderSpanContent = () => {
		if (location.pathname === "/all") {
			return (
				<Link to="/home">
					<span className="text-neutral-200 font-kanit font-light py-2 px-3 md:py-2 md:px-4 text-xs md:text-sm lg:text-base hover:underline">
						Home
					</span>
				</Link>
			)
		} else {
			return (
				<Link to="/all">
					<span className="text-neutral-200 font-kanit font-light py-2 px-3 md:py-2 md:px-4 text-xs md:text-sm lg:text-base hover:underline">
						All Trips
					</span>
				</Link>
			)
		}
	}

	return (
		<nav className="flex flex-wrap items-center justify-between p-3 md:p-4 bg-stone-950 sticky top-0 z-[1000]">
			<Link to="/home" className="flex items-center">
				<h2 className="text-neutral-200 font-kanit text-xl md:text-2xl lg:text-3xl">
					MotoMaps.
				</h2>
			</Link>
			<div className="flex flex-wrap items-center md:space-x-3 lg:space-x-4">
				{renderSpanContent()} {/* Render the conditional content here */}
				<Link to="/profile" className="flex items-center">
					<span className="text-neutral-200 font-kanit font-light py-2 px-3 text-xs md:text-sm lg:text-base hover:underline max-md:mt-1">
						Hello, {currentUser?.first_name || "Guest"}
					</span>
					{currentUser?.profile_pic && (
						<span className="w-6 md:w-8 lg:w-10">
							<img
								src={currentUser.profile_pic}
								alt={`${currentUser.first_name}'s profile`}
								className="rounded-full"
							/>
						</span>
					)}
				</Link>
			</div>
		</nav>
	)
}

export default Navbar
