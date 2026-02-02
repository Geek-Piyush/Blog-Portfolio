import express from "express";
import cors from "cors";
import { config } from "./config/env.js";

// Import routes
import authRoutes from "./routes/auth.route.js";
import blogRoutes from "./routes/blog.route.js";
import uploadRoutes from "./routes/upload.route.js";

const app = express();

// CORS configuration - allow multiple origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://blog-portfolio-pink.vercel.app',
  'https://blogedit.piyushnashikkar.dev',
  config.CLIENT_URL,
].filter(Boolean);

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/auth", authRoutes);
app.use("/blogs", blogRoutes);
app.use("/upload", uploadRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Blog API is running" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(500)
    .json({ message: "Something went wrong!", error: err.message });
});

export default app;
