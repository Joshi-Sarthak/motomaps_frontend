import Lottie from "lottie-react"
import loadingAnimation from "../../assets/loadingAnimation.json"

const Loading = () => {
	const style = {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100vh",
	}

	const animationStyle = {
		width: "100px",
		height: "100px",
	}

	return (
		<div style={style} className="bg-stone-950">
			<Lottie
				animationData={loadingAnimation}
				style={animationStyle}
				loop={true}
			/>
		</div>
	)
}

export default Loading
