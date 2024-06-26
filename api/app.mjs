import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import authRoutes from "./routes/authRoutes.mjs";
import userRoutes from "./routes/userRoutes.mjs";
import videoRoutes from "./routes/videoRoutes.mjs";

dotenv.config();

const app = express();

app.use(helmet());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
	message: "Max requests limit reached",
});

app.use(limiter);

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
