import { Link } from "react-router-dom"
import { useState } from "react"

const NewTrupButton = () => {
	const [isHovered, setIsHovered] = useState(false)

	return (
		<Link to="/newtrip">
			<button
				className={`fixed bottom-10 right-10 h-16 rounded-full flex items-center justify-center font-semibold bg-neutral-200 transition-all duration-300 z-50 ${
					isHovered ? "w-32" : "w-16"
				}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<span
					className={`relative transition-all duration-300 text-3xl font-thin top[-2px] md:top-[-4px] ${
						isHovered ? "opacity-0" : "opacity-100"
					}`}
				>
					+
				</span>
				<span
					className={`absolute transition-all duration-300 ${
						isHovered ? "opacity-100" : "opacity-0"
					} ${isHovered ? "translate-x-0" : "translate-x-2"}`}
				>
					New Post
				</span>
			</button>
		</Link>
	)
}

export default NewTrupButton
