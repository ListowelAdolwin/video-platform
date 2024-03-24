import express from "express"
import mongoose from "mongoose"
import dotenv from 'dotenv'
import connectDB from "./config/db.mjs"
import authRoutes from "./routes/authRoutes.mjs"
import userRoutes from "./routes/userRoutes.mjs"
import videoRoutes from "./routes/videoRoutes.mjs"

dotenv.config()

const app = express()

app.use(express.json())
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/videos", videoRoutes)

connectDB()

mongoose.connection.once('open', () => {
    console.log('DB connected')
    app.listen(3000, () => {
    console.log("App started")
    })
})