import Lottie from "lottie-react"
import loadingAnimation from "../../assets/loadingAnimation.json"

const LoadingExplore = () => {
	const containerStyle = {
		position: "relative",
		height: "100vh",
		width: "100%",
	}

	const contentStyle = {
		position: "absolute",
		top: "45%",
		left: "50%",
		transform: "translate(-50%, -50%)",
	}

	const animationStyle = {
		width: "100px",
		height: "100px",
	}

	return (
		<div
			style={containerStyle}
			className="bg-stone-950 w-full flex items-center justify-center"
		>
			<div style={contentStyle} className="flex flex-col items-center">
				<Lottie
					animationData={loadingAnimation}
					style={animationStyle}
					loop={true}
				/>
				<h2 className="font-kanit font-light text-white md:text-lg mt-1">
					Welcome to Motomaps.
				</h2>
			</div>
		</div>
	)
}

export default LoadingExplore
