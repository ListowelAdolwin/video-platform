import express from "express";
import { saveVideo, getVideos, getVideo, getNextVideo, deleteVideo, editVideo } from "../controllers/videoControllers.mjs";

const router = express.Router()

router.get("", getVideos)
router.get("/:id", getVideo)
router.post("/save", saveVideo)
router.post("/next", getNextVideo)
router.get("/delete/:id", deleteVideo)
router.post("/edit/:id", editVideo)

export default router;