import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendCustomEmail from "../utils/sendEmail.mjs";
import sendCustomPasswordResetEmail from "../utils/sendPasswordResetEmail.mjs";

// REGISTER
export const registerUser = async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res.json({ msg: "Username, Email and Password required!" });
	}
	// Check if duplicated username
	const usernameDuplicate = await User.findOne({ username: username }).exec();
	if (usernameDuplicate) {
		return res
			.status(409)
			.json({ msg: `User with username ${username} already exist!` });
	}
	// Check if duplicate email
	const emailDuplicate = await User.findOne({ email: email }).exec();
	if (emailDuplicate) {
		return res
			.status(409)
			.json({ msg: `User with email ${email} already exist!` });
	}

	try {
		const hashedPSWD = await bcrypt.hash(password, 10);
		const token = jwt.sign(
			{ username, email },
			process.env.EMAIL_CONFIRM_SECRET,
			{ expiresIn: "600s" }
		);
		const newUser = await User.create({
			username: username,
			email: email,
			token: token,
			password: hashedPSWD,
		});
		// Send email verification email
		const from = "listoweladolwin@gmail.com";
		const to = email;
		const subject = "Email Verification";

		sendCustomEmail(from, to, subject, token);

		console.log(newUser);
		res.json({
			user: {
				username,
				email,
				id: newUser._id,
			},
			msg: `Email verification link sent to ${newUser.email}`,
			ok: true,
		});
	} catch (error) {
		console.log(error);
		res.json({ msg: "Error saving user" });
	}
};

// RESEND EMAIL (AFTER FIRST ONE PROBABLY EXPIRES BEFORE USER VERIFIES)
export const resendEmail = async (req, res) => {
	const id = req.params.id;
	const user = await User.findById(id);

	if (!user) {
		return res.json({ msg: "Email not valid" });
	}
	const username = user.username;
	const email = user.email;

	const newToken = jwt.sign(
		{ username, email },
		process.env.EMAIL_CONFIRM_SECRET,
		{ expiresIn: "600s" }
	);

	// Resend email
	const from = "listoweladolwin@gmail.com";
	const to = email;
	const subject = "Email Verification";

	sendCustomEmail(from, to, subject, newToken);

	console.log(user);
	res.json({
		user: {
			username,
			email,
			id: user._id,
		},
		msg: `Email verification link resent to ${email}`,
		ok: true,
	});
};

// VERY EMAIL
export const verifyEmail = async (req, res) => {
	const token = req.params.token;

	jwt.verify(
		token,
		process.env.EMAIL_CONFIRM_SECRET,
		async (err, decoded) => {
			if (err) {
				console.log("Email verification error: ", err);
				return res.json({ msg: "Token expired", ok: false });
			}
			console.log("Email verification: ", decoded);
			const user = await User.findOne({ username: decoded.username });
			user.isEmailVerified = true;
			await user.save();

			res.json({ msg: "Email successfully verified", ok: true });
		}
	);
};

// LOGIN
export const loginUser = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.json({ msg: "Email and password required!" });
	}
	const foundUser = await User.findOne({ email: email }).exec();
	if (!foundUser) {
		return res.json({ msg: "Wrong credentials entered", ok: false });
	}
	if (!foundUser.isEmailVerified) {
		return res.json({ msg: "Email verification required", ok: false });
	}

	try {
		const isValidated = bcrypt.compareSync(password, foundUser.password);
		if (!isValidated) {
			return res.json({ msg: "Wrong credentials entered!", ok: false });
		}

		const accessToken = jwt.sign(
			{
				email: email,
				userId: foundUser._id,
			},
			process.env.ACCESS_TOKEN_SECRET,
			{ expiresIn: "900s" }
		);

		const refreshToken = jwt.sign(
			{
				email: email,
				userId: foundUser._id,
			},
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: "1d" }
		);

		foundUser.set({ refreshToken: refreshToken });
		await foundUser.save();

		const { password: pass, ...rest } = foundUser._doc;

		const expirationTime = new Date(Date.now() + 900 * 1000);
		res.cookie("refreshToken", refreshToken, {
			httpOnly: true,
			expires: expirationTime,
		}).json({
			refreshToken: refreshToken,
			msg: `User ${email} successfully logged in!`,
			user: { ...rest, accessToken: accessToken },
			ok: true,
		});
	} catch (error) {
		console.log(error);
		return res.json({ msg: "Error while logging in", ok: false });
	}
};

export const sendPasswordResetEmail = async (req, res) => {
	const email = req.body.email;
	const user = await User.findOne({ email });

	if (!user) {
		return res.json({ msg: "Email not registered!", ok: false });
	}

	const resetToken = jwt.sign({ email }, process.env.PASSWORD_RESET_SECRET, {
		expiresIn: "300s",
	});
	user.token = resetToken;
	await user.save();

	// send the reset password email
	const from = "listoweladolwin@gmail.com";
	const to = user.email;
	const subject = "Password Reset";

	sendCustomPasswordResetEmail(from, to, subject, resetToken);

	res.json({ msg: "Reset email sent", ok: true });
};

export const resetPassword = async (req, res) => {
	const token = req.params.token;

	jwt.verify(
		token,
		process.env.PASSWORD_RESET_SECRET,
		async (err, decoded) => {
			if (err) {
				return res.json({
					ok: false,
					msg: "Reset password token expired",
					ok: false,
				});
			}

			const { email, password } = req.body;

			const foundUser = await User.findOne({ email });
			if (!foundUser) {
				return res.json({
					msg: "No user found for this email",
					ok: false,
				});
			}

			try {
				const hashedPWD = await bcrypt.hash(password, 10);
				console.log("Old user password: ", foundUser);
				foundUser.password = hashedPWD;
				const result = await foundUser.save();
				console.log("New user password: ", result);

				res.status(200).json({
					ok: true,
					msg: "Password reset successful",
				});
			} catch (error) {
				res.json({
					msg: "An error occured while resetting password, please try again",
					ok: false,
				});
				console.log("Password reset error: ", error);
			}
		}
	);
};

export const verifyToken = async (req, res, next) => {
	const header = req.headers.Authorization || req.headers.authorization;
	console.log(req.headers);
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ msg: "Invalid token format", ok: false });
	}
	const token = header.split(" ")[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			console.log(err);
			return res
				.status(401)
				.json({ expired: true, msg: "Token expired", ok: false });
		}
		req.user = decoded.username;
		next();
	});
};

export const verifyAdminStatus = async (req, res, next) => {
	const poster = req.body.poster;
	if (!poster || !poster.isAdmin) {
		return res.status(401).json({ msg: "Forbidden!", ok: false });
	}
	next();
};

export const verifyAccessToken = async (req, res, next) => {
	const header = req.headers.Authorization || req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ msg: "Invalid token format", ok: false });
	}
	const token = header.split(" ")[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
		if (err) {
			console.log(err);
			return res
				.status(401)
				.json({ expired: true, msg: "Token expired", ok: false });
		}
		res.status(200).json({msg: "Token active", ok: true})
	});
};

export const refreshToken = async (req, res) => {
	const header = req.headers.Authorization || req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ msg: "Invalid token format", ok: false });
	}
	const token = header.split(" ")[1];

	if (!token) {
		return res.json({ msg: "invalid token", ok: false });
	}

	const user = await User.findOne({ refreshToken: token }).exec();
	if (!user) {
		return res.json({ msg: "invalid user", ok: false });
	}

	jwt.verify(
		token,
		process.env.REFRESH_TOKEN_SECRET,
		{ expiresIn: "1d" },
		(err, decoded) => {
			if (err) {
				return res.json({ msg: "invalid token", expired: true, ok:false });
			}
			const newAccessToken = jwt.sign(
				{
					email: decoded.email,
					userId: decoded._id,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "900s" }
			);
			const newRefreshToken = jwt.sign(
				{
					email: decoded,
					userId: decoded._id,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: "1d" }
			);
			res.json({
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
				msg: "token refreshed",
				ok: true,
			});
		}
	);
};

export const logoutUser = async (req, res) => {
	try {
		res.clearCookie("accessToken").json({
			msg: "User successfully logged out!",
			ok: true,
		});
	} catch (error) {
		console.error("Error clearing cookie:", error);
		res.status(500).json({ error: "Failed to log out user", ok: false });
	}
};
