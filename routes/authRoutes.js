import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || !process.env.GENERAL_PASSWORD_HASH) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    const isMatch = await bcrypt.compare(password, process.env.GENERAL_PASSWORD_HASH);

    if (!isMatch) {
      alert("Invalid Password");
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    // ✅ Save session data
    req.session.isAuthenticated = true;

    // Explicitly save the session before responding
    req.session.save(err => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ success: false, message: "Could not save session" });
      }
      return res.json({ success: true, message: "Login successful" });
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ success: false, message: "Could not log out" });
    }
    res.clearCookie("connect.sid", {
      path: "/", // ensure cookie is cleared
    });
    return res.json({ success: true, message: "Logged out" });
  });
});

// OPTIONAL: check session status
router.get("/me", (req, res) => {
  if (req.session.isAuthenticated) {
    return res.json({ authenticated: true });
  }
  return res.json({ authenticated: false });
});

export default router;
