import { createSlice } from "@reduxjs/toolkit";

const initialState = {
	currentUser: null,
};

const userSlice = createSlice({
	name: "user",
	initialState: initialState,
	reducers: {
		registerUser: (state, action) => {
			state.currentUser = action.payload;
		},
		loginUser: (state, action) => {
			state.currentUser = action.payload;
		},
		logoutUser: state => {
			state.currentUser = null;
		},
	},
});

export const { registerUser, logoutUser, loginUser } = userSlice.actions;

export default userSlice.reducer;
