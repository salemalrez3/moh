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
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    let { page = 1, limit = 10, verdict, from, to, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    // Build filter
    const where = { userId };
    if (verdict) where.verdict = verdict;
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }
    if (search) {
      where.claimText = { contains: search }; // case-insensitive if using SQLite (default)
    }

    // Get total count and paginated checks
    const [total, checks] = await Promise.all([
      prisma.claimCheck.count({ where }),
      prisma.claimCheck.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { sources: true } }
        }
      })
    ]);

    res.json({
      page,
      limit,
      total,
      checks: checks.map(c => ({
        id: c.id,
        claim: c.claimText,
        verdict: c.verdict,
        confidence: c.confidence,
        sourceCount: c._count.sources,
        createdAt: c.createdAt
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});



// GET /sources/top
router.get('/top', authMiddleware, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const take = parseInt(limit);

    // Group sources by title and url, counting appearances
    const grouped = await prisma.source.groupBy({
      by: ['url'],
      _count: { title: true },
      _avg: { similarityScore: true },
      orderBy: { _count: { title: 'desc' } },
      take
    });

    // For each source, fetch one example title and stance
    const enriched = await Promise.all(
      grouped.map(async (g) => {
        const example = await prisma.source.findFirst({
          where: { url: g.url },
          select: { title: true, stance: true }
        });
        return {
          title: example?.title || g.url,
          url: g.url,
          mentions: g._count.title,
          avgSimilarity: g._avg.similarityScore,
          exampleStance: example?.stance || 'unknown'
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch top sources' });
  }
});
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// GET /stats/trends (protected)
router.get('/trends', authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const { groupBy = 'day', from, to } = req.query;

    // Validate groupBy parameter
    const validGroupBy = ['day', 'week', 'month'];
    if (!validGroupBy.includes(groupBy)) {
      return res.status(400).json({ error: 'groupBy must be day, week, or month' });
    }

    // Build date filter
    const where = { userId };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    // Fetch all checks in the period (we'll group them in JS)
    const checks = await prisma.claimCheck.findMany({
      where,
      select: { createdAt: true, verdict: true },
      orderBy: { createdAt: 'asc' }
    });

    // Group by the specified period
    const grouped = {};
    checks.forEach(c => {
      const date = new Date(c.createdAt);
      let key;
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
      } else if (groupBy === 'week') {
        const year = date.getFullYear();
        const week = getWeekNumber(date);
        key = `${year}-W${week}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = { total: 0, verdicts: {} };
      }
      grouped[key].total++;
      grouped[key].verdicts[c.verdict] = (grouped[key].verdicts[c.verdict] || 0) + 1;
    });

    // Convert to array sorted by period
    const trendData = Object.entries(grouped)
      .map(([period, data]) => ({ period, ...data }))
      .sort((a, b) => a.period.localeCompare(b.period));

    res.json(trendData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});
module.exports = router;