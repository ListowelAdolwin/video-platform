import express from "express";
import {
	saveVideo,
	getVideos,
	getVideo,
	getNextVideo,
	deleteVideo,
	editVideo,
} from "../controllers/videoControllers.mjs";
import {
	verifyAdminStatus,
	verifyToken,
} from "../controllers/authControllers.mjs";

const router = express.Router();

router.get("", getVideos);
router.get("/:id", getVideo);
router.post("/save", verifyAdminStatus, saveVideo);
router.post("/next", getNextVideo);
router.get("/delete/:id", verifyAdminStatus, deleteVideo);
router.post("/edit/:id", verifyAdminStatus, editVideo);

export default router;
