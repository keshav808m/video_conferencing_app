import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";

import { connectToSocket } from "./controllers/socketManager.controller.js";
import userRoutes from "./routes/users.routes.js"
import historyRoute from "./routes/history.routes.js";

import dotenv from "dotenv";
dotenv.config();



const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", (process.env.PORT || 8080));
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/history", historyRoute);

const start = async () => {
    app.set("mongo_user")
    server.listen(app.get("port"), () => {
        console.log("Listening on port 8080");
    })
    const connectionDB = await mongoose.connect(process.env.ATLASDB_URL)
    .then(()=>{
        console.log("Connected to DB");
    })
    .catch(e => console.log(e));
}
start();