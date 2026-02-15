const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// POST /verify
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { claim } = req.body;
    if (!claim) {
      return res.status(400).json({ error: 'Claim text is required' });
    }

    // Call the external AI service (replace URL with your AI endpoint)
    const aiResponse = await axios.post(process.env.AI_API_URL, { claim });
    const data = aiResponse.data; // should match the shape you provided

    // Store the claim check and sources in the database
    const result = await prisma.claimCheck.create({
      data: {
        userId: req.userId,
        claimText: claim,
        verdict: data.verdict,
        confidence: data.confidence,
        analysisSummary: data.analysis_summary,
        sources: {
          create: data.sources.map(src => ({
            title: src.title,
            url: src.url,
            stance: src.stance,
            similarityScore: src.similarity_score
          }))
        }
      },
      include: { sources: true }
    });

    // Return the stored data (same shape as AI response)
    res.json({
      id: result.id,
      verdict: result.verdict,
      confidence: result.confidence,
      analysis_summary: result.analysisSummary,
      sources: result.sources.map(s => ({
        title: s.title,
        url: s.url,
        stance: s.stance,
        similarity_score: s.similarityScore
      }))
    });
  } catch (error) {
    console.error('Verification error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Verification failed' });
  }
});

module.exports = router;