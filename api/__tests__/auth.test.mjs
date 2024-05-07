import request from "supertest";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import sendCustomEmail from "../utils/sendEmail.mjs";
import User from "../models/User.mjs";
import sendCustomPasswordResetEmail from "../utils/sendPasswordResetEmail.mjs";
import app from "../app.mjs";

jest.mock("../utils/sendEmail.mjs");
jest.mock("../utils/sendPasswordResetEmail.mjs");

const testUserData = {
	email: "hello@gmail.com",
	username: "hello",
	password: "hellopassword",
};

let mongoServer;
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoose.connection.close();
	await mongoServer.stop();
});

describe("Register", () => {
	describe("Given no password or username or email", () => {
		it("should return statusCode 400", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ ...testUserData, email: "" });

			expect(response.status).toBe(400);
		});
	});

	describe("Given duplicate username", () => {
		it("should return statusCode 409", async () => {
			await User.create({
				...testUserData,
				token: "hgiushcjhsdudlks",
			});
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					...testUserData,
					email: "hello1@gmail.com",
				});
			expect(response.status).toBe(409);
			expect(response.body.msg).toBe(
				"User with username hello already exist!",
			);
		});
	});

	describe("Given duplicate email", () => {
		it("should return statusCode 409", async () => {
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					...testUserData,
					username: "hello1",
				});

			expect(response.status).toBe(409);
			expect(response.body.msg).toBe(
				"User with email hello@gmail.com already exist!",
			);
		});
	});

	describe("Given all valid details", () => {
		it("should return statusCode 201 and new user and email verification link sent", async () => {
			await User.findOneAndDelete({ email: "hello@gmail.com" });
			const response = await request(app)
				.post("/api/auth/register")
				.send(testUserData);

			expect(response.status).toBe(201);
			expect(response.body.user.username).toBe("hello");
			expect(response.body.msg).toBe(
				"Email verification link sent to hello@gmail.com",
			);
			expect(sendCustomEmail).toHaveBeenCalled();
			// expect(sendCustomEmail).toHaveBeenCalledWith('hello2@gmail.com');
		});
	});
});

describe("Resend Email When User registers Route", () => {
	describe("Invalid user id sent", () => {
		it("Should return status code 400", async () => {
			const userId = new mongoose.Types.ObjectId().toString();
			const response = await request(app).get(
				`/api/auth/resend-email/${userId}`,
			);
			expect(response.status).toBe(400);
			expect(response.body).toStrictEqual({
				msg: "Email not valid",
				ok: false,
			});
		});
	});

	describe("Valid user id sent", () => {
		it("Should return status code 200", async () => {
			const user = await User.findOne({ email: "hello@gmail.com" });
			const response = await request(app).get(
				`/api/auth/resend-email/${user.id}`,
			);
			expect(response.status).toBe(200);
			expect(response.body.user.id).toBe(user.id);
			expect(sendCustomEmail).toHaveBeenCalled();
		});
	});
});

describe("Email Verification route", () => {
	describe("Invalid token provided", () => {
		it("Should return status code 401", async () => {
			const response = await request(app).get(
				"/api/auth/verify-email/udfxcjvjhufcxchcv",
			);
			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Token expired",
				ok: false,
			});
		});
	});

	describe("Valid token provided", () => {
		it("Should return status code 200", async () => {
			const token = jwt.sign(
				{ username: "hello", email: "hello@gmail.com" },
				process.env.EMAIL_CONFIRM_SECRET,
				{ expiresIn: "600s" },
			);
			const response = await request(app).get(
				`/api/auth/verify-email/${token}`,
			);
			expect(response.status).toBe(200);
			expect(response.body.msg).toBe("Email successfully verified");
		});

		it("Should successfully verify user and set isVerified to true", async () => {
			const user = await User.findOne({ email: "hello@gmail.com" });
			expect(user.isEmailVerified).toBe(true);
		});
	});
});

describe("Login route", () => {
	describe("Given no password or email", () => {
		it("should return statusCode 400", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "hi@gami.com" });

			expect(response.status).toBe(400);
			expect(response.body).toStrictEqual({
				msg: "Email and password required!",
			});
		});
	});

	describe("Given unregistered user credentials", () => {
		it("should return statusCode 401", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "wrongemail@gmail.com", password: "fidghkfdf" });

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Wrong credentials entered",
				ok: false,
			});
		});
	});

	describe("Given email not verified", () => {
		it("should return statusCode 403", async () => {
			const testData = {
				email: "hi1@gami.com",
				username: "hi1",
				password: "fidghkfdf",
			};
			await User.create(testData);
			const response = await request(app)
				.post("/api/auth/login")
				.send(testData);

			expect(response.status).toBe(403);
			expect(response.body).toStrictEqual({
				msg: "Email verification required",
				ok: false,
			});
		});
	});

	describe("Given wrong credentials", () => {
		it("should return statusCode 401 and Wrong credentials error", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ ...testUserData, password: "wrongpassword" });

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Wrong credentials entered!",
				ok: false,
			});
			expect(sendCustomEmail).toHaveBeenCalled();
		});
	});

	describe("Given all valid login details", () => {
		it("should return statusCode 200 and accessToken and refreshToken", async () => {
			const response = await request(app)
				.post("/api/auth/login")
				.send(testUserData);
			expect(response.status).toBe(200);
			expect(response.body.msg).toBe(
				"User hello@gmail.com successfully logged in!",
			);
			expect(response.body).toHaveProperty(
				"refreshToken",
				expect.any(String),
			);
		});
	});
});

describe("Password reset send emaill route", () => {
	describe("Given unregistered user email", () => {
		it("Should return status code 404", async () => {
			const response = await request(app)
				.post("/api/auth/reset-password")
				.send({
					email: "wrongemail@gmail.com",
				});
			expect(response.status).toBe(404);
			expect(response.body).toStrictEqual({
				msg: "Email not registered!",
				ok: false,
			});
		});
	});

	describe("Given valid user email", () => {
		it("Should return status code 200 and called sendpassword function", async () => {
			const response = await request(app)
				.post("/api/auth/reset-password")
				.send({
					email: "hello@gmail.com",
				});
			expect(response.status).toBe(200);
			expect(response.body).toStrictEqual({
				msg: "Reset email sent",
				ok: true,
			});
			expect(sendCustomPasswordResetEmail).toHaveBeenCalled();
		});
	});
});

describe("Password reset route", () => {
	describe("Given invalid token", () => {
		it("Should return status code 401", async () => {
			const response = await request(app)
				.post("/api/auth/reset-password/randomtoken123")
				.send(testUserData);
			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Reset password token expired",
				ok: false,
			});
		});
	});

	describe("Given unregistered user email", () => {
		it("Should return status code 404", async () => {
			const resetToken = jwt.sign(
				{ email: "unregistered@gmail.com" },
				process.env.PASSWORD_RESET_SECRET,
				{
					expiresIn: "300s",
				},
			);
			const response = await request(app)
				.post(`/api/auth/reset-password/${resetToken}`)
				.send({ ...testUserData, email: "unregistered@gmail.com" });
			expect(response.status).toBe(404);
			expect(response.body).toStrictEqual({
				msg: "No user found for this email",
				ok: false,
			});
		});
	});

	describe("Given different user's email", () => {
		it("Should return status code 401 and not reset password", async () => {
			const resetToken = jwt.sign(
				{ email: "hello@gmail.com" },
				process.env.PASSWORD_RESET_SECRET,
				{
					expiresIn: "300s",
				},
			);
			const user = await User.findOne({ email: "hello@gmail.com" });
			user.token = resetToken;
			await user.save();

			await User.create({
				email: "different@gmail.com",
				username: "different",
				password: "differentpassword",
				token: "jdffytgrry",
			});
			const response = await request(app)
				.post(`/api/auth/reset-password/${resetToken}`)
				.send({
					email: "different@gmail.com",
					password: "newdifferentpassword",
				});
			expect(response.status).toBe(403);
			expect(response.body).toStrictEqual({
				msg: "You can only reset your own password",
				ok: false,
			});
		});
	});

	describe("Given a valid token", () => {
		it("Should return status code 200", async () => {
			const resetToken = jwt.sign(
				{ email: "hello@gmail.com" },
				process.env.PASSWORD_RESET_SECRET,
				{
					expiresIn: "300s",
				},
			);
			const user = await User.findOne({ email: "hello@gmail.com" });
			user.token = resetToken;
			await user.save();
			const response = await request(app)
				.post(`/api/auth/reset-password/${resetToken}`)
				.send({
					email: "hello@gmail.com",
					password: "newpassword",
				});
			expect(response.status).toBe(200);
			expect(response.body).toStrictEqual({
				ok: true,
				msg: "Password reset successful",
			});
		});
		describe("Logging in after password reset", () => {
			it("Should not login user with old password and return status code 401", async () => {
				const response = await request(app)
					.post("/api/auth/login")
					.send(testUserData);
				expect(response.status).toBe(401);
				expect(response.body.msg).toBe("Wrong credentials entered!");
			});

			it("Should login user with new password and return status code 200 and refresh token", async () => {
				const response = await request(app)
					.post("/api/auth/login")
					.send({
						email: "hello@gmail.com",
						password: "newpassword",
					});
				expect(response.status).toBe(200);
				expect(response.body.msg).toBe(
					"User hello@gmail.com successfully logged in!",
				);
				expect(response.body).toHaveProperty(
					"refreshToken",
					expect.any(String),
				);
			});
		});
	});
});

describe("VerifyToken middleware", () => {
	describe("Given no access token provided in header", () => {
		it("Should return status code 401 and invalid token message", async () => {
			const response = await request(app).get("/api/users");

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Invalid token format",
				ok: false,
			});
		});
	});

	describe("Given invalid access token provided", () => {
		it("Should return status code 401 and token expired message", async () => {
			const response = await request(app)
				.get("/api/users")
				.set("Authorization", "Bearer dhgfdfjuihlkd");

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				expired: true,
				msg: "Token expired",
				ok: false,
			});
		});
	});

	describe("Given valid access token in header", () => {
		it("Should fetch all active test users in the database with 200 status", async () => {
			const user = await User.findOne({ email: "hello@gmail.com" });
			const accessToken = jwt.sign(
				{
					email: user.email,
					userId: user._id,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "900s" },
			);
			const response = await request(app)
				.get("/api/users")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect("Content-Type", /json/);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true);
		});
	});
});

describe("Refresh token route", () => {
	describe("Given expired refresh token", () => {
		it("Should return status code 401 and not refresh", async () => {
			const user = await User.findOne({ email: "hello@gmail.com" });
			const refreshToken = jwt.sign(
				{
					email: user.email,
					userId: user._id,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: "0s" },
			);
			user.refreshToken = refreshToken;
			await user.save();

			const response = await request(app)
				.get("/api/auth/refresh")
				.set("Authorization", `Bearer ${refreshToken}`);
			expect(response.status).toBe(401);
			expect(response.body.msg).toBe("Refresh token expired");
		});
	});

	describe("Given valid refresh token", () => {
		it("Should return status code 200 and new refresh and access tokens", async () => {
			const user = await User.findOne({ email: "hello@gmail.com" });
			const refreshToken = jwt.sign(
				{
					email: user.email,
					userId: user._id,
				},
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: "1d" },
			);
			user.refreshToken = refreshToken;
			await user.save();

			const response = await request(app)
				.get("/api/auth/refresh")
				.set("Authorization", `Bearer ${refreshToken}`);

			expect(response.status).toBe(200);
			expect(response.body).toHaveProperty(
				"accessToken",
				expect.any(String),
			);
			expect(response.body).toHaveProperty(
				"refreshToken",
				expect.any(String),
			);
			expect(response.body.msg).toBe("token refreshed");
		});
	});
});

describe("Logout endpoint", () => {
	it("Should clear access token cookie and return status code 200", async () => {
		const response = await request(app)
			.get("/api/auth/logout")
			.set("Cookie", ["accessToken=sampleToken"]);

		expect(response.status).toBe(200);
		expect(response.body.msg).toBe("User successfully logged out!");
		expect(response.header["set-cookie"][0]).toMatch(/^accessToken=;/);
	});
});
