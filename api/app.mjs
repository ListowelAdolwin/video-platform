import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import videoRoutes from "./routes/videoRoutes.mjs";

dotenv.config();

const app = express();

app.use(
	cors({
		origin: [
			"https://video-platform-client.onrender.com",
			"http://127.0.0.1:5173/",
			"http://video-platform-client.onrender.com",
			"https://127.0.0.1:5173/",
			"http://127.0.0.1:5173",
			"https://video-platform.onrender.com",
			"https://video-platform.onrender.com/",
			"http://video-platform.onrender.com",
			"http://video-platform.onrender.com/",
		],
		methods: ["GET", "POST", "PUT", "DELETE"],
		credentials: true,
	}),
);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/videos", videoRoutes);

export default app;
