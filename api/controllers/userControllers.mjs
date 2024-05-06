import User from "../models/User.mjs";

export const getUsers = async (req, res) => {
	const users = await User.find();
	res.status(200).json(users);
};
