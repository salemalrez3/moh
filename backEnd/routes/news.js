const express = require('express');
const router = express.Router();
const prisma = require('../db');
const multer = require('multer');
const path = require('path');
const { skip } = require('@prisma/client/runtime/library');

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

router.post('/', upload.array('attachments'), async (req, res) => {
  try {
    const { title, content } = req.body;
    
    let attachments = []; 
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        fileName: file.filename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
      })); 
      console.log("i ran", attachments);
    }

    const news = await prisma.news.create({
      data: {
        title,
        content,
        attachments: {
          create: attachments,
        },
      },
      include: { attachments: true },
    });

    res.status(201).json(news);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating news" });
  }
});

 router.get('/', async (req, res) => {
  try {
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const cursor = req.query.cursor ? Number(req.query.cursor) : undefined;
    
    let whereCondition = {};
    if (cursor) {
      whereCondition = {
        id: {
          lt: cursor  
        }
      };
    }

    const news = await prisma.news.findMany({
      where: whereCondition,
      take: limit + 1, 
      orderBy: {
        id: 'desc' 
      },
    });

    let nextCursor = null;
    if (news.length > limit) {
      nextCursor = news[limit - 1].id; 
      news.splice(limit, 1);
    }

    res.status(200).json({
      news,
      nextCursor,
      hasMore: !!nextCursor
    });
    
  } catch (error) {
    console.error("News fetch error:", error && error.stack ? error.stack : error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: String(error.message || error) 
    });
  }
});
module.exports = router;
