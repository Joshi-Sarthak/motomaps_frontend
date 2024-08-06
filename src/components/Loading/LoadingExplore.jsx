import Lottie from "lottie-react"
import loadingAnimation from "../../assets/loadingAnimation.json"

const LoadingExplore = () => {
	const style = {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100vh",
		width: "Full",
	}

	const animationStyle = {
		width: "100px",
		height: "100px",
	}

	return (
		<div style={style} className="bg-stone-950 w-full flex flex-col">
			<Lottie
				animationData={loadingAnimation}
				style={animationStyle}
				loop={true}
			/>
			<h2 className="font-kanit font-light text-white font-lg">
				Welcome to Motomaps.
			</h2>
		</div>
	)
}

export default LoadingExplore
