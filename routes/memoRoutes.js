import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import ExcelJS from "exceljs";
import { Memo, MemoImage } from "../models/index.js";
import cloudinary from "../config/cloudinary.js"; // 👈 import your Cloudinary config
import fs from "fs";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer setup (use memory or temp storage, not disk)
const upload = multer({ dest: "temp/" });

// Excel logging function
async function appendToExcel({
  date_signed,
  sender,
  subject,
  amount,
  recipient_office,
  received_by,
  imageUrls,
}) {
  const filePath = path.join(__dirname, "../excel/memo_log.xlsx");
  const workbook = new ExcelJS.Workbook();

  try {
    await workbook.xlsx.readFile(filePath);
  } catch {
    workbook.addWorksheet("Memos");
  }

  const sheet = workbook.getWorksheet("Memos") || workbook.addWorksheet("Memos");

  // Add one row per image
  imageUrls.forEach((url) => {
    sheet.addRow([
      new Date().toLocaleString(),
      date_signed,
      sender,
      subject,
      amount || "",
      recipient_office,
      url,
      received_by,
    ]);
  });

  await workbook.xlsx.writeFile(filePath);
}

function requireAuth(req, res, next) {
  if (req.session?.isAuthenticated) {
    return next();
  }
  return res.status(403).json({ error: "Not authorized" });
}

// ✅ GET route to fetch all memos with images
router.get("/api/memos", requireAuth, async (req, res) => {
  try {
    const memos = await Memo.findAll({
      include: { model: MemoImage, as: "images" },
      order: [["createdAt", "DESC"]],
    });
    res.json(memos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch memos" });
  }
});

// ✅ POST route to log memo with multiple images (Cloudinary)
router.post(
  "/api/memos",
  requireAuth,
  upload.array("memoImages", 10),
  async (req, res) => {
    try {
      const rawAmount = req.body.amount?.replace(/,/g, "");
      const amount = rawAmount ? parseFloat(rawAmount) : null;
      const { date_signed, sender, subject, recipient_office, received_by } =
        req.body;

      if (!received_by) {
        return res.status(400).json({ error: "received_by is required" });
      }

      // Upload each file to Cloudinary
      const imageUrls = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "movement-register",
        });
        imageUrls.push(result.secure_url);

        // cleanup temp file
        fs.unlinkSync(file.path);
      }

      // Create memo with associated images
      const memo = await Memo.create(
        {
          sender,
          subject,
          recipient_office,
          date_signed,
          amount,
          received_by,
          images: imageUrls.map((url) => ({ image_url: url })),
        },
        { include: [{ model: MemoImage, as: "images" }] }
      );

      // Log to Excel
      await appendToExcel({
        date_signed,
        sender,
        subject,
        amount,
        recipient_office,
        received_by,
        imageUrls,
      });

      res.status(201).json(memo);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to log memo" });
    }
  }
);

// ✅ Download Excel file
router.get("/api/memos/export", requireAuth, async (req, res) => {
  const filePath = path.join(__dirname, "../excel/memo_log.xlsx");
  res.download(filePath, "memo_log.xlsx", (err) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error downloading Excel file");
    }
  });
});

export default router;
