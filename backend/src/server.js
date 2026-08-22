import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import { ENV } from "./config/env.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();
const { PORT } = ENV;

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT} `),
);
