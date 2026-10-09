import express from "express";
import { createServer } from "node:http";
import connectToSocket from "./controllers/socketManager.js";
import userRoutes from "./routes/user.router.js";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import dns from "dns";

dns.setServers(['1.1.1.1', '8.8.8.8'],)

dotenv.config({ path: [".env", "src/.env"], override: true });

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8080);
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api/v1/user", userRoutes);

const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI environment variable is required.");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to Db :- ${mongoose.connection.host}`);
  server.listen(app.get("port"), () => {
    console.log(`Server is running on port ${app.get("port")}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
