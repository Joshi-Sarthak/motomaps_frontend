import { useDispatch, useSelector } from "react-redux"
import { setRadio } from "../../redux/radio/radioSlice"

import {
	Radio,
	List,
	ListItem,
	ListItemPrefix,
	Typography,
} from "@material-tailwind/react"

export default function RadioVerticalList() {
	const dispatch = useDispatch()
	const { radioOption } = useSelector((state) => state.radio)

	const setRadioOption = (option) => {
		dispatch(setRadio(option))
	}

	return (
		<List>
			<h2 className="p-2 font-kanit text-neutral-300 text-lg ml-2">Sort items</h2>
			<ListItem className="p-0 hover:bg-stone-800 transition-all duration-300">
				<label
					htmlFor="vertical-list-svelte"
					className="flex w-full cursor-pointer items-center px-3"
				>
					<ListItemPrefix className="mr-2">
						<Radio
							name="vertical-list"
							id="vertical-list-svelte"
							ripple={false}
							className="custom-radio"
							containerProps={{
								className: "px-2",
							}}
							checked={radioOption === 1}
							onChange={() => setRadioOption(1)}
						/>
					</ListItemPrefix>
					<Typography
						color="blue-gray"
						className="text-neutral-300 font-kanit font-light"
					>
						Most Liked
					</Typography>
				</label>
			</ListItem>

			<ListItem className="p-0 hover:bg-stone-800 transition-all duration-300">
				<label
					htmlFor="vertical-list-react"
					className="flex w-full cursor-pointer items-center px-3"
				>
					<ListItemPrefix className="mr-2">
						<Radio
							name="vertical-list"
							id="vertical-list-react"
							ripple={true}
							className="custom-radio"
							containerProps={{
								className: "px-2",
							}}
							checked={radioOption === 2}
							onChange={() => setRadioOption(2)}
						/>
					</ListItemPrefix>
					<Typography
						color="blue-gray"
						className="text-neutral-300 font-kanit font-light"
					>
						Newest to Oldest
					</Typography>
				</label>
			</ListItem>

			<ListItem className="p-0 hover:bg-stone-800 transition-all duration-300">
				<label
					htmlFor="vertical-list-vue"
					className="flex w-full cursor-pointer items-center px-3"
				>
					<ListItemPrefix className="mr-2">
						<Radio
							name="vertical-list"
							id="vertical-list-vue"
							ripple={false}
							className="custom-radio"
							containerProps={{
								className: "px-2",
							}}
							checked={radioOption === 3}
							onChange={() => setRadioOption(3)}
						/>
					</ListItemPrefix>
					<Typography
						color="blue-gray"
						className="text-neutral-300 font-kanit font-light"
					>
						Oldest to Newest
					</Typography>
				</label>
			</ListItem>
			<ListItem className="p-0 hover:bg-stone-800 transition-all duration-300">
				<label
					htmlFor="vertical-list-ang"
					className="flex w-full cursor-pointer items-center px-3"
				>
					<ListItemPrefix className="mr-2">
						<Radio
							name="vertical-list"
							id="vertical-list-ang"
							ripple={false}
							className="custom-radio"
							containerProps={{
								className: "px-2",
							}}
							checked={radioOption === 4}
							onChange={() => setRadioOption(4)}
						/>
					</ListItemPrefix>
					<Typography
						color="blue-gray"
						className="text-neutral-300 font-kanit font-light"
					>
						Nearest to You
					</Typography>
				</label>
			</ListItem>
		</List>
	)
}
