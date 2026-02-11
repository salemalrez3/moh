const express = require("express");
const prisma = require("../db");
const router = express.Router();

// Create response for survey
router.post("/:surveyId", async (req, res) => {
  try {
    const surveyId = Number(req.params.surveyId);
    const { data } = req.body;
    const userId = req.user.userId;

    const survey = await prisma.survey.findUnique({
      where: { id: surveyId },
    });
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    if (survey.contentType === "SURVEY") {
      const existing = await prisma.response.findFirst({
        where: { surveyId, userId },
      });
      if (existing) {
        return res
          .status(400)
          .json({ error: "User has already responded to this survey" });
      }
    }

    const response = await prisma.response.create({
      data: { surveyId, userId, data },
      include: { user: { select: { id: true, userName: true } } },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("Failed to create response:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:surveyId", async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 5); 
    const skip = (page - 1) * limit;
    const surveyId = Number(req.params.surveyId);

    const survey = await prisma.survey.findFirst({ where: { id: surveyId } });
    if (!survey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    const groups = survey.groups ? JSON.parse(survey.groups) : [];

    // count all responses
    const totalResponses = await prisma.response.count({ where: { surveyId } });

    // fetch page slice
    const responses = await prisma.response.findMany({
      where: { surveyId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, userName: true } } },
    });

    // pagination meta
    const totalPages = Math.ceil(totalResponses / limit) || 1;
    const hasMore = page < totalPages;
    const pagination = {
      page,
      limit,
      total: totalResponses,
      totalPages,
      hasMore,
      nextPage: hasMore ? page + 1 : undefined,
    };
  
    if (survey.contentType === "POST") {
      return res.json({
        survey,
        results: responses,
        numberOfResponses: totalResponses,
        pagination,
      });
    }

    const results = {};
    groups.forEach((group, gi) => {
      group.questions.forEach((q, qi) => {
        const key = `${gi}-${qi}`;
        if (q.type === "radio" || q.type === "checkbox") {
          results[key] = {};
          q.options.forEach((opt) => (results[key][opt] = 0));
        } else if (q.type === "text") {
          results[key] = [];
        }
      });
    });

    responses.forEach((resp) => {
      Object.entries(resp.data).forEach(([key, answer]) => {
        const [gi, qi] = key.split("-").map(Number);
        const q = groups[gi]?.questions?.[qi];
        if (!q) return;

        if (q.type === "radio") {
          results[key][answer] += 1;
        } else if (q.type === "checkbox") {
          answer.forEach((opt) => (results[key][opt] += 1));
        } else if (q.type === "text") {
          results[key].push(answer);
        }
      });
    });

    res.json({
      survey,
      results,
      numberOfResponses: totalResponses,
      pagination,
    });
  } catch (error) {
    console.error("Failed to get responses:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});


module.exports = router;
