const express = require('express');
const router = express.Router();
const prisma = require('../db');
const multer = require('multer');
const path = require('path');

router.get('/:newsId',async(req,res)=>{
    try {
    const newsId = Number(req.params.newsId)
    const newsAttachments = await prisma.newsAttachment.findMany({where:{newsId}})
    res.status(200).json({newsAttachments})
    } catch (error) {
       console.error("Register error:", error && error.stack ? error.stack : error);
    res.status(500).json({ error: "Internal Server Error", details: String(error.message || error) });  
    }
})

module.exports = router;