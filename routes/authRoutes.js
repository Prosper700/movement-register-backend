import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();

router.post("/login", async (req, res) => { 
  try {
    const { password } = req.body;
    onsole.log("Password from body:", password);
    console.log("Hash from env:", process.env.ADMIN_PASSWORD_HASH);
    if (!password || !process.env.GENERAL_PASSWORD_HASH) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }
    const isMatch = await bcrypt.compare(password, process.env.GENERAL_PASSWORD_HASH);
    

    if (isMatch) {
      req.session.isAuthenticated = true;
      return res.json({ success: true, message: "Login successful" });

    } else {
      console.log("Password incorrect");
      return res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});


router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ success: true });
  });
});

export default router;
