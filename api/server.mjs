import dotenv from "dotenv";
import connectDB from "./config/db.mjs";
import app from "./app.mjs"

dotenv.config();


connectDB();


app.listen(process.env.APP_PORT, () => {
	console.log("listening on port: " + process.env.APP_PORT);
});