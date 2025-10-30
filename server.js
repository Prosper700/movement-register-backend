import express from 'express';
import cors from 'cors';
import dotenv from "dotenv";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { sequelize } from "./models/index.js";
import memoRoutes from './routes/memoRoutes.js';
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Session middleware
const PgSession = pgSession(session);

app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL, // Render injects this automatically
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 6 * 60 * 60 * 1000, // 6 hours
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  },
}));

// CORS
app.use(
  cors({
    origin: [
    "http://localhost:5173", // local dev
    "https://movement-register.onrender.com" // deployed frontend
  ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());

// Mount routes
app.use("/api", memoRoutes);
app.use("/api", authRoutes);
app.use("/api", uploadRoutes)

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
    console.log("✅ Database connection established");

    await sequelize.sync();
    console.log("✅ Models synchronized");

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:");
    console.error(err.message);
    console.error(err.stack);
    process.exit(1); // exit so you notice the crash
  }
};

startServer();