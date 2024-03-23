import express from "express"
import { loginUser, logoutUser, refreshToken, registerUser, resendEmail, resetPassword, verifyEmail, sendPasswordResetEmail, verifyToken } from "../controllers/authControllers.mjs";

const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.post('/logout', logoutUser)
router.get('/verify-email/:token', verifyEmail)
// router.post('/validate-token', reactValidateToken)
router.get('/resend-email/:token', resendEmail)
router.post('/reset-password/:token', resetPassword)
router.post('/reset-password', sendPasswordResetEmail)
router.post('/refresh', refreshToken)
// router.post('/delete-user', deleteUser)


export default router