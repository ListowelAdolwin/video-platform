import express from "express";
import {
	loginUser,
	logoutUser,
	refreshToken,
	registerUser,
	resendEmail,
	resetPassword,
	verifyEmail,
	sendPasswordResetEmail,
	verifyAccessToken,
} from "../controllers/authControllers.mjs";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logoutUser);
router.get("/verify-email/:token", verifyEmail);
router.get("/token-validity", verifyAccessToken);
router.get("/resend-email/:id", resendEmail);
router.post("/reset-password/:token", resetPassword);
router.post("/reset-password", sendPasswordResetEmail);
router.get("/refresh", refreshToken);
// router.post('/delete-user', deleteUser)

export default router;
