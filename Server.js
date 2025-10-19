import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import notesRoutes from "./Routes/notes.js";
import authRoutes from "./Routes/auth.js";
import metaRoutes from "./Routes/meta.js";
import adminRoutes from "./Routes/admin.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("API running..."));

app.use("/api/notes", notesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
