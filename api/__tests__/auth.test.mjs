import request from "supertest";
import app from "../app.mjs";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import sendCustomEmail from "../utils/sendEmail.mjs";
import User from "../models/User.mjs";
import bcrypt from "bcrypt";
import sendCustomPasswordResetEmail from "../utils/sendPasswordResetEmail.mjs";
import jwt from "jsonwebtoken";

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

describe("Register", function () {
	describe("Given no password or username or email", function () {
		it("should return statusCode 400", async function () {
			const response = await request(app)
				.post("/api/auth/register")
				.send({ email: "hi@gami.com", password: "kdkdfkdfkdf" });

			expect(response.status).toBe(400);
		});
	});

	describe("Given duplicate username", function () {
		it("should return statusCode 409", async function () {
			await request(app).post("/api/auth/register").send(testUserData);
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					email: "hello1@gmail.com",
					username: "hello",
					password: "hellopassword",
				});
			expect(response.status).toBe(409);
			expect(response.body.msg).toBe(
				"User with username hello already exist!"
			);
		});
	});

	describe("Given duplicate email", function () {
		it("should return statusCode 409", async function () {
			await request(app).post("/api/auth/register").send(testUserData);
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					email: "hello@gmail.com",
					username: "hello1",
					password: "hellopassword",
				});

			expect(response.status).toBe(409);
			expect(response.body.msg).toBe(
				"User with email hello@gmail.com already exist!"
			);
		});
	});

	describe("Given all valid details", function () {
		it("should return statusCode 201 and new user and email verification link sent", async function () {
			const response = await request(app)
				.post("/api/auth/register")
				.send({
					email: "hello2@gmail.com",
					username: "hello2",
					password: "hellopassword",
				});

			expect(response.status).toBe(201);
			expect(response.body.user.username).toBe("hello2");
			expect(response.body.msg).toBe(
				"Email verification link sent to hello2@gmail.com"
			);
			expect(sendCustomEmail).toHaveBeenCalled();
			//expect(sendCustomEmail).toHaveBeenCalledWith('hello2@gmail.com');
		});
	});
});

describe("Resend Email When User registers Route", function () {
	describe("Invalid user id sent", function () {
		it("Should return status code 400", async function () {
			const userId = new mongoose.Types.ObjectId().toString();
			const response = await request(app).get(
				`/api/auth/resend-email/${userId}`
			);
			expect(response.status).toBe(400);
			expect(response.body).toStrictEqual({
				msg: "Email not valid",
				ok: false,
			});
		});
	});

	describe("Valid user id sent", function () {
		it("Should return status code 200", async function () {
			const res = await request(app).post("/api/auth/register").send({
				email: "hello3@gmail.com",
				username: "hello3",
				password: "hellopassword",
			});
			const userId = res.body.user.id;
			const response = await request(app).get(
				`/api/auth/resend-email/${userId}`
			);
			expect(response.status).toBe(200);
			expect(response.body.user.id).toBe(userId);
			expect(sendCustomEmail).toHaveBeenCalled();
		});
	});
});

describe("Email Verification route", function () {
	describe("Invalid token provided", function () {
		it("Should return status code 401", async function () {
			const response = await request(app).get(
				`/api/auth/verify-email/udfxcjvjhufcxchcv`
			);
			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Token expired",
				ok: false,
			});
		});
	});

	// 	describe("Valid token provided", function () {
	// 		it("Should return status code 200", async function () {
	// 			const res = await request(app).post("/api/auth/register").send({
	// 				email: "hello3@gmail.com",
	// 				username: "hello3",
	// 				password: "hellopassword",
	// 			});
	// 			const userId = res.body.user.id;
	// 			const response = await request(app).get(
	// 				`/api/auth/resend-email/${userId}`
	// 			);
	// 			expect(response.status).toBe(200);
	// 			expect(response.body.user.id).toBe(userId);
	// 			expect(sendCustomEmail).toHaveBeenCalled();
	// 		});
	// 	});
});

describe("Login route", function () {
	describe("Given no password or email", function () {
		it("should return statusCode 400", async function () {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "hi@gami.com" });

			expect(response.status).toBe(400);
			expect(response.body).toStrictEqual({
				msg: "Email and password required!",
			});
		});
	});

	describe("Given wrong password or email", function () {
		it("should return statusCode 401", async function () {
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "hi@gami.com", password: "fidghkfdf" });

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Wrong credentials entered",
				ok: false,
			});
		});
	});

	describe("Given email not verified", function () {
		it("should return statusCode 403", async function () {
			const user = await User.create({
				email: "hi1@gami.com",
				username: "hi1",
				password: "fidghkfdf",
			});
			const response = await request(app)
				.post("/api/auth/login")
				.send({ email: "hi1@gami.com", password: "fidghkfdf" });

			expect(response.status).toBe(403);
			expect(response.body).toStrictEqual({
				msg: "Email verification required",
				ok: false,
			});
		});
	});

	describe("Given wrong credentials", function () {
		it("should return statusCode 401 and Wrong credentials error", async function () {
			const hashedPSWD = await bcrypt.hash("fidghkfdf", 10);
			const user = await User.create({
				email: "hi3@gami.com",
				username: "hi3",
				password: hashedPSWD,
				token: "hgiushcjhsduds",
			});
			user.isEmailVerified = true;
			await user.save();
			const response = await request(app).post("/api/auth/login").send({
				email: "hi3@gami.com",
				password: "fidgfdf",
			});

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Wrong credentials entered!",
				ok: false,
			});
			expect(sendCustomEmail).toHaveBeenCalled();
		});
	});

	describe("Given all valid login details", function () {
		it("should return statusCode 200 and accessToken and refreshToken", async function () {
			const hashedPSWD = await bcrypt.hash("fidghkfdf", 10);
			const user = await User.create({
				email: "hi4@gmail.com",
				username: "hi4",
				password: hashedPSWD,
				token: "hgiushcjhsdudffdgh",
			});
			user.isEmailVerified = true;
			await user.save();
			const response = await request(app).post("/api/auth/login").send({
				email: "hi4@gmail.com",
				password: "fidghkfdf",
			});
			expect(response.status).toBe(200);
			expect(response.body.msg).toBe(
				"User hi4@gmail.com successfully logged in!"
			);
			expect(response.body).toHaveProperty(
				"refreshToken",
				expect.any(String)
			);
		});
	});
});

describe("Password reset send emaill route", function () {
	describe("Given unregistered user email", function () {
		it("Should return status code 404", async function () {
			const response = await request(app)
				.post(`/api/auth/reset-password`)
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

	describe("Given valid user email", function () {
		it("Should return status code 404", async function () {
			const hashedPSWD = await bcrypt.hash("fidghkfdf", 10);
			const user = await User.create({
				email: "hi5@gmail.com",
				username: "hi5",
				password: hashedPSWD,
				token: "hgiushcjhsdudffdgdfdh",
			});
			user.isEmailVerified = true;
			await user.save();
			const response = await request(app)
				.post(`/api/auth/reset-password`)
				.send({
					email: "hi5@gmail.com",
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

describe("Password reset route", function () {
	describe("Given invalid token", function () {
		it("Should return status code 401", async function () {
			const response = await request(app)
				.post("/api/auth/reset-password/randomtoken123")
				.send({
					email: "wrongemail@gmail.com",
					password: "randompassword",
				});
			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Reset password token expired",
				ok: false,
			});
		});
	});

	describe("Given a valid token", function () {
		it("Should return status code 201", async function () {
			const hashedPSWD = await bcrypt.hash("fidghkfdf", 10);
			const resetToken = jwt.sign(
				{ email: "hi6@gmail.com" },
				process.env.PASSWORD_RESET_SECRET,
				{
					expiresIn: "300s",
				}
			);
			const user = await User.create({
				email: "hi6@gmail.com",
				username: "hi6",
				password: hashedPSWD,
				token: resetToken,
			});
			user.isEmailVerified = true;
			await user.save();
			const response = await request(app)
				.post(`/api/auth/reset-password/${resetToken}`)
				.send({
					email: "hi6@gmail.com",
					password: "newpassword",
				});
			expect(response.status).toBe(200);
			expect(response.body).toStrictEqual({
				ok: true,
				msg: "Password reset successful",
			});
		});
		describe("Logging in after password reset", function () {
			it("Should login user with new password and return status code 200 and refresh token", async function () {
				const response = await request(app)
					.post("/api/auth/login")
					.send({
						email: "hi6@gmail.com",
						password: "newpassword",
					});
				expect(response.status).toBe(200);
				expect(response.body.msg).toBe(
					"User hi6@gmail.com successfully logged in!"
				);
				expect(response.body).toHaveProperty(
					"refreshToken",
					expect.any(String)
				);
			});
		});
	});
});

describe("VerifyToken middleware", function () {
	describe("Given no access token provided in header", function () {
		it("Should return status code 401 and invalid token message", async function () {
			const response = await request(app).get("/api/users");

			expect(response.status).toBe(401);
			expect(response.body).toStrictEqual({
				msg: "Invalid token format",
				ok: false,
			});
		});
	});

	describe("Given invalid access token provided", function () {
		it("Should return status code 401 and token expired message", async function () {
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

	describe("Given valid access token in header", function () {
		it("Should fetch all active test users in the database with 200 status", async function () {
			const user = await User.create({
				email: "tokenemail@gmail.com",
				username: "tokenusername",
				password: "tokenpassword",
				token: "tokentoken",
			});
			const accessToken = jwt.sign(
				{
					email: user.email,
					userId: user._id,
				},
				process.env.ACCESS_TOKEN_SECRET,
				{ expiresIn: "900s" }
			);
			const response = await request(app)
				.get("/api/users")
				.set("Authorization", `Bearer ${accessToken}`)
				.expect("Content-Type", /json/);

			expect(response.status).toBe(200);
			expect(Array.isArray(response.body)).toBe(true)
		});
	});
});
