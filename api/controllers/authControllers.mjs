import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendCustomEmail from "../utils/sendEmail.mjs";
import sendCustomPasswordResetEmail from "../utils/sendPasswordResetEmail.mjs";

// REGISTER
export const registerUser = async (req, res) => {
	const { username, email, password } = req.body;

	if (!username || !email || !password) {
		return res
			.status(400)
			.json({ msg: "Username, Email and Password required!" });
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

		res.status(201).json({
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
		return res.status(400).json({ msg: "Email not valid", ok: false });
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

	res.status(200).json({
		user: {
			username,
			email,
			id: user._id,
		},
		msg: `Email verification link resent to ${email}`,
		ok: true,
	});
};

// VERIFY EMAIL
export const verifyEmail = async (req, res) => {
	const token = req.params.token;

	jwt.verify(
		token,
		process.env.EMAIL_CONFIRM_SECRET,
		async (err, decoded) => {
			if (err) {
				console.log("Email verification error: ", err);
				return res
					.status(401)
					.json({ msg: "Token expired", ok: false });
			}
			const user = await User.findOne({ username: decoded.username });
			user.isEmailVerified = true;
			await user.save();

			res.status(200).json({
				msg: "Email successfully verified",
				ok: true,
			});
		}
	);
};

// LOGIN
export const loginUser = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return res.status(400).json({ msg: "Email and password required!" });
	}
	const foundUser = await User.findOne({ email: email }).exec();
	if (!foundUser) {
		return res
			.status(401)
			.json({ msg: "Wrong credentials entered", ok: false });
	}
	if (!foundUser.isEmailVerified) {
		return res
			.status(403)
			.json({ msg: "Email verification required", ok: false });
	}

	try {
		const isValidated = bcrypt.compareSync(password, foundUser.password);
		if (!isValidated) {
			return res
				.status(401)
				.json({ msg: "Wrong credentials entered!", ok: false });
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
		})
			.status(200)
			.json({
				refreshToken: refreshToken,
				msg: `User ${email} successfully logged in!`,
				user: { ...rest, accessToken: accessToken },
				ok: true,
			});
	} catch (error) {
		console.log(error);
		return res
			.status(401)
			.json({ msg: "Error while logging in", ok: false });
	}
};

// SEND EMAIL FOR USER TO RESET PASSWORD
export const sendPasswordResetEmail = async (req, res) => {
	const email = req.body.email;
	const user = await User.findOne({ email });

	if (!user) {
		return res
			.status(404)
			.json({ msg: "Email not registered!", ok: false });
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

	res.status(200).json({ msg: "Reset email sent", ok: true });
};

// RESET PASSWORD
export const resetPassword = async (req, res) => {
	const token = req.params.token;

	jwt.verify(
		token,
		process.env.PASSWORD_RESET_SECRET,
		async (err, decoded) => {
			if (err) {
				return res.status(401).json({
					msg: "Reset password token expired",
					ok: false,
				});
			}

			const { email, password } = req.body;
			const foundUser = await User.findOne({ email });
			if (!foundUser) {
				return res.status(404).json({
					msg: "No user found for this email",
					ok: false,
				});
			}

			const user = await User.findOne({ token });
			if (!(user.email === decoded.email && user.email === email)) {
				return res.status(403).json({
					msg: "You can only reset your own password",
					ok: false,
				});
			}


			try {
				const hashedPWD = await bcrypt.hash(password, 10);
				foundUser.password = hashedPWD;
				await foundUser.save();

				res.status(200).json({
					ok: true,
					msg: "Password reset successful",
				});
			} catch (error) {
				console.log("Password reset error: ", error);
				res.json({
					msg: "An error occured while resetting password, please try again",
					ok: false,
				});
			}
		}
	);
};

// VERIFY TOKEN MIDDLEWARE
export const verifyToken = async (req, res, next) => {
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
		req.user = decoded.username;
		next();
	});
};

// VERIFY ADMIN STATUS MIDDLEWARE
export const verifyAdminStatus = async (req, res, next) => {
	const header = req.headers.Authorization || req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ msg: "Invalid token format", ok: false });
	}
	const token = header.split(" ")[1];
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
		if (err) {
			console.log(err);
			return res
				.status(401)
				.json({ expired: true, msg: "Token expired", ok: false });
		}
		try {
			const user = await User.findOne({ email: decoded.email });
			if (!user || !user.isAdmin) {
				return res.status(403).json({ msg: "Forbidden!", ok: false });
			}
		} catch (error) {
			return res.status(403).json({ msg: "Forbidden!!", ok: false });
		}
		req.user = decoded.username;
		next();
	});
};

// VERIFY ACCESS TOKEN CONTROLLER
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
		res.status(200).json({ msg: "Token active", ok: true });
	});
};

// REFRESH TOKEN CONTRLLER
export const refreshToken = async (req, res) => {
	const header = req.headers.Authorization || req.headers.authorization;
	if (!header?.startsWith("Bearer ")) {
		return res.status(401).json({ msg: "Invalid token format", ok: false });
	}
	const token = header.split(" ")[1];

	if (!token) {
		return res.json({ msg: "invalid token format", ok: false });
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
				return res.status(401).json({
					msg: "Refresh token expired",
					expired: true,
					ok: false,
				});
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
					email: decoded.email,
					userId: decoded._id,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: "1d" }
			);
			res.status(200).json({
				accessToken: newAccessToken,
				refreshToken: newRefreshToken,
				msg: "token refreshed",
				ok: true,
			});
		}
	);
};

// LOGOUT CONTROLLER
export const logoutUser = async (req, res) => {
	try {
		res.status(200).clearCookie("accessToken").json({
			msg: "User successfully logged out!",
			ok: true,
		});
	} catch (error) {
		console.error("Error clearing cookie:", error);
		res.status(500).json({ error: "Failed to log out user", ok: false });
	}
};
