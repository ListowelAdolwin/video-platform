import express from "express"
import mongoose from "mongoose"
import dotenv from 'dotenv'
import connectDB from "./config/db.mjs"

dotenv.config()

const app = express()

connectDB()

mongoose.connection.once('open', () => {
    console.log('DB connected')
    app.listen(3000, () => {
    console.log("App started")
    })
})