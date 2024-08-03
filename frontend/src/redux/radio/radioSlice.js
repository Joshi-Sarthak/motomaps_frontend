import { createSlice } from "@reduxjs/toolkit"

const initialState = {
	radioOption: 1,
}

const radioSlice = createSlice({
	name: "radio",
	initialState,
	reducers: {
		setRadio: (state, action) => {
			state.radioOption = action.payload
		}
	},
})

export const {
	setRadio
} = radioSlice.actions

export default radioSlice.reducer
