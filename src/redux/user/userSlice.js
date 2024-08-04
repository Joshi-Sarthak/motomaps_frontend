import { createSlice } from "@reduxjs/toolkit"

const initialState = {
	currentUser: null,
}

const userSlice = createSlice({
	name: "user",
	initialState,
	reducers: {
		signInSuccess: (state, action) => {
			state.currentUser = action.payload
		},
		signInFailure: (state) => {
			state.currentUser = null
		},
		updateUserSuccess: (state, action) => {
			state.currentUser = action.payload
		},
		deleteUserSuccess: (state) => {
			state.currentUser = null
		},
		signOut: (state) => {
			state.currentUser = null
		},
	},
})

export const {
	signOut,
	deleteUserSuccess,
	signInFailure,
	signInSuccess,
	updateUserSuccess,
} = userSlice.actions

export default userSlice.reducer
