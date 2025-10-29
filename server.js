import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import session from "express-session";
import { sequelize } from "./models/index.js";
import memoRoutes from './routes/memoRoutes.js';
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 6 * 60 * 60 * 1000, // 6 hours
      httpOnly: true,
      secure: isProduction,       // ✅ only true in production (HTTPS)
      sameSite: isProduction ? "none" : "lax", // ✅ allow cross‑site cookies in prod
    },
  })
);

// CORS
app.use(
  cors({
    origin: isProduction
      ? process.env.FRONTEND_URL // e.g. "https://your-frontend.onrender.com"
      : "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Mount routes
app.use("/api", memoRoutes);
app.use("/api", authRoutes);

// Session check endpoint
app.get("/api/auth/check", (req, res) => {
  res.json({ loggedIn: !!req.session?.isAuthenticated });
});

// Logout endpoint
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    const port = process.env.PORT || 5000; // ✅ Render assigns PORT
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
};

startServer();
