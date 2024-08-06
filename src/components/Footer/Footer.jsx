import { Link } from "react-router-dom"

function Footer() {
	return (
		<footer className="bg-stone-950 shadow">
			<div className="w-full max-w-screen-xl mx-auto py-4 md:py-8 px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center text-center sm:flex-row sm:items-center sm:text-left sm:justify-between">
					<Link
						to="/home"
						className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse"
					>
						<span className="text-2xl lg:text-3xl whitespace-nowrap text-white font-kanit font-medium">
							MotoMaps.
						</span>
					</Link>
					<ul className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 text-sm font-medium text-gray-400">
						<li className="mb-2 sm:mb-0">
							<Link to="/" className="hover:underline">
								About
							</Link>
						</li>
						<li className="mb-2 sm:mb-0">
							<a
								href="mailto:sarthaksj02@gmail.com"
								className="hover:underline"
							>
								Contact - motomaps.service@gmail.com
							</a>
						</li>
					</ul>
				</div>
				<hr className="my-6 border-gray-700" />
				<span className="block text-sm text-gray-400 text-center">
					© 2024{" "}
					<Link to="/home" className="hover:underline">
						MotoMaps™
					</Link>
					. All Rights Reserved.
				</span>
			</div>
		</footer>
	)
}

export default Footer
