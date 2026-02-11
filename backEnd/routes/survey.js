const express = require('express');
const prisma = require('../db');
const router = express.Router();

// Create new survey
router.post("/", async (req, res) => {
  try {
    const { title, closedAt, groups, audience, contentType } = req.body;

    if (!title || !audience) {
      return res.status(400).json({ error: "title and audience are required",title:title,audience:audience });
    }

    const survey = await prisma.Survey.create({
      data: {
        title,
        closedAt: closedAt ? new Date(closedAt) : null,
        audience,
        contentType, 
        groups: groups ? JSON.stringify(groups) : null,
      },
    });

    res.status(201).json(survey);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Get single survey
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const survey = await prisma.survey.findUnique({ 
      where: { id } 
    });

    if (!survey) return res.status(404).json({ error: 'Survey not found' });

    res.json({
      ...survey,
      groups: JSON.parse(survey.groups)
    });
  } catch (error) {
    console.error('Failed to get survey:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all surveys
router.get("/", async (req, res) => {
  try {
    
      const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5);
    const audience = req.query.audience;
    const skip = (page - 1) * limit;
    const take = Number(limit);

    const surveys = await prisma.survey.findMany({
      where: { audience },
      orderBy: { createdAt: "desc" },
      skip,
      take,
      include: {
        responses: {
          include: { user: { select: { id: true, userName: true } } },
        },
      },
    });

    const surveysWithData = surveys.map((survey) => {
      const groups = survey.groups ? JSON.parse(survey.groups) : [];

      // If survey is still open → send groups for answering
      if (new Date(survey.closedAt) > new Date()) {
        return {
          ...survey,
          groups,
          responses: undefined, // don’t send full responses
        };
      }

      // Survey is closed → aggregate results
      const results = {};
      groups.forEach((group, gi) => {
        group.questions.forEach((q, qi) => {
          const key = `${gi}-${qi}`;
          if (q.type === "radio" || q.type === "checkbox") {
            results[key] = {};
            q.options.forEach((opt) => (results[key][opt] = 0));
          } else if (q.type === "text") {
            results[key] = { count: 0 }; // only count text responses
          }
        });
      });

      survey.responses.forEach((resp) => {
        Object.entries(resp.data).forEach(([key, answer]) => {
          const [gi, qi] = key.split("-").map(Number);
          const q = groups[gi]?.questions?.[qi];
          if (!q) return;

          if (q.type === "radio") {
            if (results[key][answer] !== undefined) results[key][answer] += 1;
          } else if (q.type === "checkbox") {
            answer.forEach(
              (opt) => results[key][opt] !== undefined && results[key][opt]++
            );
          } else if (q.type === "text") {
            results[key].count++;
          }
        });
      });

      return {
        ...survey,
        groups,
        results,
        numberOfResponses: survey.responses.length,
        responses: undefined, // don’t send raw responses to frontend feed
      };
    });

    res.json({
      surveys: surveysWithData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasMore: surveysWithData.length === Number(limit),
      },
    });
  } catch (error) {
    console.error("Failed to get surveys:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;