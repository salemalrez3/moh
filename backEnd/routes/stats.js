const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const prisma = new PrismaClient();
const router = express.Router();

// GET /stats
router.get('/',authMiddleware, async (req, res) => {
  try {
    // 1. Main Stats Cards
    const totalChecks = await prisma.claimCheck.count();
    const totalUsers = await prisma.user.count();
    const avgConfidence = await prisma.claimCheck.aggregate({
      _avg: { confidence: true }
    });
    // Most common verdict
    const verdictCounts = await prisma.claimCheck.groupBy({
      by: ['verdict'],
      _count: { verdict: true },
      orderBy: { _count: { verdict: 'desc' } }
    });
    const mostCommonVerdict = verdictCounts[0]?.verdict || 'N/A';

    // 2. Distribution & Topics (here: verdict distribution)
    const distribution = verdictCounts.map(v => ({
      verdict: v.verdict,
      count: v._count.verdict
    }));

    // 3. Recent Checks (last 10, with user name and source count)
    const recentChecks = await prisma.claimCheck.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { sources: true } }
      }
    });

    // Optional: Source stance distribution
    const sourceStanceCounts = await prisma.source.groupBy({
      by: ['stance'],
      _count: { stance: true }
    });

    res.json({
      mainStats: {
        totalChecks,
        totalUsers,
        averageConfidence: avgConfidence._avg.confidence,
        mostCommonVerdict
      },
      distribution: {
        byVerdict: distribution,
        bySourceStance: sourceStanceCounts.map(s => ({
          stance: s.stance,
          count: s._count.stance
        }))
      },
      recentChecks: recentChecks.map(c => ({
        id: c.id,
        claim: c.claimText,
        verdict: c.verdict,
        confidence: c.confidence,
        userName: c.user.name || c.user.email,
        sourceCount: c._count.sources,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;