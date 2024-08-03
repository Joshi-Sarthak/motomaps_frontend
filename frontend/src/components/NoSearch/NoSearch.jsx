import Lottie from "lottie-react"
import empty from "../../assets/NoSearch.json"
import { useNavigate } from "react-router-dom"
import Navbar from "../Navbar/Navbar"
import Footer from "../Footer/Footer"

const NoSearch = () => {
	const navigate = useNavigate()
	const style = {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100vh",
	}

	const animationStyle = {
		width: "200px",
		height: "200px",
	}

	return (
		<>
			<Navbar />
			<div
				style={style}
				className="bg-stone-900 flex flex-col items-center justify-center p-4 sm:p-8 md:p-16 lg:p-24"
			>
				<Lottie animationData={empty} style={animationStyle} loop={true} />
				<div className="mt-8 text-center">
					<span className="text-white font-kanit text-lg sm:text-xl md:text-2xl lg:text-3xl block">
						Oops, nothing found. Click{" "}
						<button
							onClick={() => navigate("/home")}
							className="hover:underline text-blue-400"
						>
							here
						</button>{" "}
						to return to the homepage.
					</span>
				</div>
			</div>
			<Footer />
		</>
	)
}

export default NoSearch
