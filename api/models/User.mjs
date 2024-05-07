import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
	username: {
		type: String,
		required: [true, "Username is required!"],
		unique: [true, "Username must be unique"],
	},

	email: {
		type: String,
		required: [true, "Email is required!"],
		unique: [true, "Email must be unique!"],
		lowercase: true,
		trim: true,
		validate: {
			validator: (value) => /^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/.test(value),
			message: "Invalid email format",
		},
	},

	password: {
		type: String,
		required: [true, "Password is required!"],
	},

	isEmailVerified: {
		type: Boolean,
		default: false,
	},

	token: {
		type: String,
		unique: true,
	},

	refreshToken: String,

	isAdmin: {
		type: Boolean,
		default: false,
	},
});

const User = mongoose.model("User", userSchema);
export default User;
