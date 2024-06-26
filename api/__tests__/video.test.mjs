import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../app.mjs";
import User from "../models/User.mjs";
import Video from "../models/Video.mjs";

let mongoServer;
let adminUser;
let normalUser;
let adminAccessToken;
let normalUserAccessToken;
let videoData;
beforeAll(async () => {
	mongoServer = await MongoMemoryServer.create();
	await mongoose.connect(mongoServer.getUri());

	adminUser = await User.create({
		username: "admin",
		email: "admin@gmail.com",
		password: "adminpassword",
		token: "kfhdoiushiidfd",
		isAdmin: true,
	});

	adminAccessToken = jwt.sign(
		{
			email: adminUser.email,
			userId: adminUser._id,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "900s" },
	);

	normalUser = await User.create({
		username: "normaluser",
		email: "normaluser@gmail.com",
		password: "normaluserpassword",
		token: "kfhdoiushiidfhgyrd",
		isAdmin: false,
	});

	normalUserAccessToken = jwt.sign(
		{
			email: normalUser.email,
			userId: normalUser._id,
		},
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: "900s" },
	);

	videoData = {
		poster: adminUser,
		title: "test",
		description: "test_d",
		videoUrl: "khidhfdkjgfhd",
	};
});

afterAll(async () => {
	await mongoose.disconnect();
	await mongoose.connection.close();
	await mongoServer.stop();
});

describe("Save video route", () => {
	describe("Given the user is not an admin", () => {
		it("Should returun 403 an forbidden error message", async () => {
			const response = await request(app)
				.post("/api/videos/save")
				.set("Authorization", `Bearer ${normalUserAccessToken}`)
				.send({ ...videoData, poster: normalUser });

			expect(response.status).toBe(403);
			expect(response.body).toStrictEqual({
				msg: "Forbidden!",
				ok: false,
			});
		});
	});
	describe("Given no title, description, or videoUrl", () => {
		it("Should return 400 with field missing error message", async () => {
			const response = await request(app)
				.post("/api/videos/save")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send({ ...videoData, title: "" });
			expect(response.status).toBe(400);
			expect(response.body).toStrictEqual({
				ok: false,
				msg: "Please fill in all fields",
			});
		});
	});

	describe("Given all valid video data", () => {
		it("Should return 201 with success message", async () => {
			const response = await request(app)
				.post("/api/videos/save")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send(videoData);
			expect(response.status).toBe(201);
			expect(response.body.msg).toBe("Video saved successfully");
		});
	});

	describe("Given three saved videos", () => {
		it("Should be correctly linked to form a doubly linked list", async () => {
			await request(app)
				.post("/api/videos/save")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send({ ...videoData, title: "video 1" });

			await request(app)
				.post("/api/videos/save")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send({ ...videoData, title: "video 2" });

			await request(app)
				.post("/api/videos/save")
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send({ ...videoData, title: "video 3" });

			const video1 = await Video.findOne({ title: "video 1" });
			const video2 = await Video.findOne({ title: "video 2" });
			const video3 = await Video.findOne({ title: "video 3" });

			expect(video3.nextVid._id).toStrictEqual(video2._id);
			expect(video2.nextVid._id).toStrictEqual(video1._id);
			expect(video1.prevVid._id).toStrictEqual(video2._id);
			expect(video2.prevVid._id).toStrictEqual(video3._id);
		});
	});
});

describe("Get videos route", () => {
	describe("Given a limit of 7", () => {
		it("Should return status code 200 and array of length 3", async () => {
			const videoPromises = [];
			for (let i = 0; i < 10; i += 1) {
				videoPromises.push(Video.create({ ...videoData, poster: adminUser }));
			}

			await Promise.all(videoPromises);
			const response = await request(app).get("/api/videos/?limit=7");

			expect(response.status).toBe(200);
			expect(response.body.videos.length).toBe(7);
		});
	});
});

describe("Get video route", () => {
	describe("given a wrong video id", () => {
		it("should return status 404", async () => {
			const response = await request(app).get("/api/video/didhifdgffdfi");
			expect(response.status).toBe(404);
		});
	});

	describe("Given valid video id", () => {
		it("Should return status 200 and the video", async () => {
			const video = await Video.findOne();
			const response = await request(app).get(`/api/videos/${video.id}`);
			expect(response.status).toBe(200);
			expect(response.body.video.title).toBe(video.title);
		});
	});
});

describe("Delete video route", () => {
	describe("Given the user is not an admin", () => {
		it("Should returun 403 an forbidden error message", async () => {
			const video = await Video.findOne();
			const response = await request(app)
				.get(`/api/videos/delete/${video.id}`)
				.set("Authorization", `Bearer ${normalUserAccessToken}`);
			expect(response.status).toBe(403);
			expect(response.body).toStrictEqual({
				msg: "Forbidden!",
				ok: false,
			});
		});
	});

	describe("Given invalid video id", () => {
		it("Should return status 404 and video not found message", async () => {
			const id = new mongoose.Types.ObjectId().toString();
			const response = await request(app)
				.get(`/api/videos/delete/${id}`)
				.set("Authorization", `Bearer ${adminAccessToken}`);

			expect(response.status).toBe(404);
			expect(response.body.msg).toBe("Video not found");
		});
	});

	describe("Given a valid video id", () => {
		let video;
		it("Should return status 200 and video deleted message", async () => {
			video = await Video.findOne();
			const response = await request(app)
				.get(`/api/videos/delete/${video.id}`)
				.set("Authorization", `Bearer ${adminAccessToken}`);
			expect(response.status).toBe(200);
			expect(response.body.msg).toBe("Video deleted");
		});

		it("Should return status 404 and video not found message", async () => {
			const response = await request(app).get(`/api/videos/${video.id}`);

			expect(response.status).toBe(404);
			expect(response.body.msg).toBe("Video not found");
		});
	});
});

describe("Edit video route", () => {
	describe("Given wrong video id", () => {
		it("Should return 404", async () => {
			const wrongId = new mongoose.Types.ObjectId().toString();
			const response = await request(app)
				.post(`/api/videos/edit/${wrongId}`)
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send({
					...videoData,
					title: "Updated title",
				});

			expect(response.status).toBe(404);
			expect(response.body.msg).toBe("Video not found");
		});
	});

	describe("Given valid video id", () => {
		it("Should return 200 and updated video", async () => {
			const video = await Video.findOne();
			const response = await request(app)
				.post(`/api/videos/edit/${video.id}`)
				.set("Authorization", `Bearer ${adminAccessToken}`)
				.send({
					...videoData,
					title: "Updated title",
				});

			expect(response.status).toBe(200);
			expect(response.body.msg).toBe("Video edited successfully!");
			expect(response.body.video.title).toBe("Updated title");
		});
	});
});
