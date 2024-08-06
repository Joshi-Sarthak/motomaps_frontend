import { useState, useEffect } from "react"
import Footer from "../components/Footer/Footer"
import LoadingExplore from "../components/Loading/LoadingExplore"
import explore from "../assets/explore.jpg"
import img1 from "../assets/img1.jpg"
import img2 from "../assets/img2.jpg"
import img3 from "../assets/img3.png"
import img4 from "../assets/img4.jpg"
import img5 from "../assets/img5.jpg"
import aos from "aos"
import "aos/dist/aos.css"
import { Link } from "react-router-dom"

const Explore = () => {
	const imageUrls = [explore, img1, img2, img3, img4, img5]
	const [loadedImages, setLoadedImages] = useState(0)
	const [allImagesLoaded, setAllImagesLoaded] = useState(false)

	useEffect(() => {
		aos.init()
	}, [])

	useEffect(() => {
		if (loadedImages === imageUrls.length) {
			setAllImagesLoaded(true)
		}
	}, [loadedImages, imageUrls.length])

	const handleImageLoad = () => {
		setLoadedImages((prev) => prev + 1)
	}

	return (
		<>
			{allImagesLoaded ? (
				<div className="bg-stone-900 min-h-screen">
					<div
						className="w-full h-[300px] md:h-[400px] bg-cover bg-center flex flex-col justify-center items-center text-white"
						style={{ backgroundImage: `url(${explore})` }}
					>
						<h1 className="font-kanit text-4xl md:text-6xl text-center hover:tracking-wide transition-all duration-300">
							What is MotoMaps?
						</h1>
						<p className="font-kanit font-extralight text-base md:text-lg text-center py-4 hover:tracking-wide transition-all duration-300">
							- Motomaps is a platform for discovering and sharing
							<br /> the best routes and trails.
						</p>
					</div>

					<div className="w-11/12 md:w-2/3 mx-auto h-auto md:h-[400px] flex flex-col-reverse md:flex-row justify-between py-4 mt-10">
						<div
							className="flex flex-col py-4 md:mr-10 w-full md:w-1/2 px-4"
							data-aos="fade-right"
						>
							<span className="text-neutral-100 font-kanit text-3xl md:text-5xl my-10 text-right">
								Scenic Routes
							</span>
							<span className="text-neutral-400 font-kanit font-light text-base md:text-lg text-right">
								Experience the best rides with our curated routes that
								take you through breathtaking landscapes and thrilling
								twists and turns
							</span>
						</div>
						<div
							className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center rounded-lg mt-4 md:mt-0"
							style={{ backgroundImage: `url(${img2})` }}
							data-aos="fade-left"
						></div>
					</div>
					<div className="w-11/12 md:w-2/3 mx-auto h-auto md:h-[400px] flex flex-col md:flex-row justify-between py-4 mt-10">
						<div
							className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center rounded-lg"
							style={{ backgroundImage: `url(${img1})` }}
							data-aos="fade-right"
						></div>
						<div
							className="flex flex-col py-4 md:ml-10 w-full md:w-1/2 px-4"
							data-aos="fade-left"
						>
							<span className="text-neutral-100 font-kanit text-3xl md:text-5xl my-10 text-left">
								Trips Near you
							</span>
							<span className="text-neutral-400 font-kanit font-light text-base md:text-lg text-left">
								Find the best routes for a quick getaway or a day-long
								adventure. Discover scenic drives and hidden gems near
								you for an unforgettable ride
							</span>
						</div>
					</div>
					<div className="w-11/12 md:w-2/3 mx-auto h-auto md:h-[400px] flex flex-col-reverse md:flex-row justify-between py-4 mt-10">
						<div
							className="flex flex-col py-4 md:mr-10 w-full md:w-1/2 px-4"
							data-aos="fade-right"
						>
							<span className="text-neutral-100 font-kanit text-3xl md:text-5xl my-10 text-right">
								Share Your Ride
							</span>
							<span className="text-neutral-400 font-kanit font-light text-base md:text-lg text-right">
								Document your journey and share your adventures with the
								community. Upload photos, write reviews, and inspire
								others with your stories
							</span>
						</div>
						<div
							className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center rounded-lg mt-4 md:mt-0"
							style={{ backgroundImage: `url(${img3})` }}
							data-aos="fade-left"
						></div>
					</div>
					<div className="w-11/12 md:w-2/3 mx-auto h-auto md:h-[400px] flex flex-col md:flex-row justify-between py-4 mt-10">
						<div
							className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center rounded-lg"
							style={{ backgroundImage: `url(${img4})` }}
							data-aos="fade-right"
						></div>
						<div
							className="flex flex-col py-4 md:ml-10 w-full md:w-1/2 px-4"
							data-aos="fade-left"
						>
							<span className="text-neutral-100 font-kanit text-3xl md:text-5xl my-10 text-left">
								Discover Hidden Gems
							</span>
							<span className="text-neutral-400 font-kanit font-light text-base md:text-lg text-left">
								Unearth hidden treasures. From viewpoints to
								off-the-beaten-path trails, discover places only known
								to the most adventurous riders
							</span>
						</div>
					</div>
					<div className="w-11/12 md:w-2/3 mx-auto h-auto md:h-[400px] flex flex-col-reverse md:flex-row justify-between py-4 mt-10">
						<div
							className="flex flex-col py-4 md:mr-10 w-full md:w-1/2 px-4"
							data-aos="fade-right"
						>
							<span className="text-neutral-100 font-kanit text-3xl md:text-5xl my-10 text-right">
								Custom Route Builder
							</span>
							<span className="text-neutral-400 font-kanit font-light text-base md:text-lg text-right">
								Create and customize your own routes. Use our intuitive
								route builder to plan every detail of your ride and
								share it with the community
							</span>
						</div>
						<div
							className="w-full md:w-1/2 h-64 md:h-full bg-cover bg-center rounded-lg mt-4 md:mt-0"
							style={{ backgroundImage: `url(${img5})` }}
							data-aos="fade-left"
						></div>
					</div>

					<div className="flex flex-col justify-center items-center py-10">
						<span className="text-neutral-100 font-kanit font-extralight text-3xl md:text-4xl mt-10 mb-4">
							Join Motomaps Today!
						</span>
						<Link to="/signup">
							<button className="inline-flex w-fit h-12 animate-shimmer items-center justify-center rounded-3xl border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-200 transition-colors focus:outline-none focus:ring-1 focus:ring-slate-800 focus:ring-offset-2 focus:ring-offset-slate-800">
								Join Now
							</button>
						</Link>
					</div>
					<Footer />
				</div>
			) : (
				<div className="flex items-center justify-center min-h-screen bg-stone-900 text-white">
					<LoadingExplore />
				</div>
			)}

			{imageUrls.map((url) => (
				<img
					key={url}
					src={url}
					alt="preload"
					style={{ display: "none" }}
					onLoad={handleImageLoad}
				/>
			))}
		</>
	)
}

export default Explore
