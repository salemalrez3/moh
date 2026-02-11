const express = require("express");
const prisma = require("../db");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});  
const upload = multer({ storage: storage });

router.get("/:surveyId", async (req, res) => {
  try {
    const attachments = await prisma.Attachment.findMany({
      where: { surveyId: Number(req.params.surveyId)},
    });
    res.status(200).json(attachments);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/:surveyId", upload.array("attachments"), async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    if (!surveyId) {
      return res.status(400).json({ error: "surveyId is required" });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "attachments are required" });
    }

    const data = req.files.map((file) => ({
      surveyId,
      fileName: file.filename,        
      originalName: file.originalname, 
      mimeType: file.mimetype,
      size: file.size,
      path: file.path
    }));

    const result = await prisma.Attachment.createMany({ data });

    res.status(201).json({ count: result.count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
