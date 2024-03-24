import express from "express";
import { saveVideo, getVideos } from "../controllers/videoControllers.mjs";

const router = express.Router()

router.get("", getVideos)
router.post("/save", saveVideo)

export default router;