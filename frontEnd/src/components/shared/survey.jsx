import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateResponse } from "../../repository/response";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  TextField,
  FormControlLabel,
  Radio,
  Checkbox,
  LinearProgress,
  Divider,
} from "@mui/material";
import { useGetAttachments } from "../../repository/attachment";
import ImageVidDisplayer from "./imageVidDisplay";
import OtherDisplayer from "./otherDisplayer";

function Survey({ survey, isLoading, error }) {
  const { t, i18n } = useTranslation();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const createResponse = useCreateResponse(survey?.id);
  const closeDate = new Date(survey?.closedAt || null);
  const [responses, setResponses] = useState({});
  const { data: attachments = [], isLoading: isLoadingAtt } = useGetAttachments(survey?.id);

  // --- Early loading states ---
  if (isLoading) return <Typography>{t("loading")}</Typography>;
  if (error) return <Typography color="error">{t("loadError")}</Typography>;

  // --- Form validation ---
  const isFormValid = () => {
    if (!survey?.groups) return true;
    for (let groupIndex = 0; groupIndex < survey.groups.length; groupIndex++) {
      const group = survey.groups[groupIndex];
      for (let questionIndex = 0; questionIndex < group.questions.length; questionIndex++) {
        const question = group.questions[questionIndex];
        if (question.required) {
          const key = `${groupIndex}-${questionIndex}`;
          const answer = responses[key];
          if (
            (question.type === "text" && (!answer || answer.trim() === "")) ||
            (question.type === "radio" && !answer) ||
            (question.type === "checkbox" && (!answer || answer.length === 0))
          ) {
            return false;
          }
        }
      }
    }
    return true;
  };

  // --- Handlers ---
  const handleTextChange = (groupIndex, questionIndex, value) =>
    setResponses((prev) => ({ ...prev, [`${groupIndex}-${questionIndex}`]: value }));

  const handleRadioChange = (groupIndex, questionIndex, value) =>
    setResponses((prev) => ({ ...prev, [`${groupIndex}-${questionIndex}`]: value }));

  const handleCheckboxChange = (groupIndex, questionIndex, value) => {
    const key = `${groupIndex}-${questionIndex}`;
    const currentValues = responses[key] || [];
    setResponses((prev) => ({
      ...prev,
      [key]: currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value],
    }));
  };

  // --- Input field renderer ---
  const renderInputField = (question, groupIndex, questionIndex) => {
    switch (question.type) {
      case "text":
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t("enterValue", { field: question.name })}
            value={responses[`${groupIndex}-${questionIndex}`] || ""}
            onChange={(e) => handleTextChange(groupIndex, questionIndex, e.target.value)}
          />
        );
      case "radio":
        return (
          <Box>
            {question.options?.map((option, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Radio
                    color="primary"
                    checked={responses[`${groupIndex}-${questionIndex}`] === option}
                    onChange={() => handleRadioChange(groupIndex, questionIndex, option)}
                  />
                }
                label={option}
                sx={{ display: "block" }}
              />
            ))}
          </Box>
        );
      case "checkbox":
        return (
          <Box>
            {question.options?.map((option, idx) => (
              <FormControlLabel
                key={idx}
                control={
                  <Checkbox
                    color="primary"
                    checked={(responses[`${groupIndex}-${questionIndex}`] || []).includes(option)}
                    onChange={() => handleCheckboxChange(groupIndex, questionIndex, option)}
                  />
                }
                label={option}
                sx={{ display: "block" }}
              />
            ))}
          </Box>
        );
      default:
        return null;
    }
  };

  // --- Results renderer ---
  const renderResults = (survey) => {
    if (!survey.results) return null;

    return (
      <Box sx={{ mt: 2 }}>
        {survey.groups.map((group, gi) => (
          <Box key={gi} sx={{ mb: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom>
              {group.name}
            </Typography>
            {group.questions.map((q, qi) => {
              const key = `${gi}-${qi}`;
              const res = survey.results[key];

              if (q.type === "radio" || q.type === "checkbox") {
                const total = Object.values(res).reduce((sum, count) => sum + count, 0);
                return (
                  <Box key={qi} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1">{q.name}</Typography>
                    {q.options.map((opt) => {
                      const count = res[opt] || 0;
                      const percent = total ? Math.round((count / total) * 100) : 0;
                      return (
                        <Box key={opt} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {opt}: {count} ({percent}%)
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{
                              height: 8,
                              borderRadius: 5,
                              [`& .MuiLinearProgress-bar`]: {
                                backgroundColor: "primary.main",
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                );
              } else if (q.type === "text") {
                return (
                  <Box key={qi} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1">{q.name}</Typography>
                    <Typography variant="body2">
                      {res.count} {t("responses")}
                    </Typography>
                  </Box>
                );
              }

              return null;
            })}
          </Box>
        ))}
      </Box>
    );
  };

  // --- Submission handler ---
  const handleSubmit = () => {
    if (!survey?.id) return;
    if (!isFormValid()) {
      alert(t("pleaseFillRequired"));
      return;
    }
    createResponse.mutate({ data: responses }, { onSuccess: () => setResponses({}) });
  };

  const closeDateStr = new Date(closeDate).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // --- Main Render ---
  return (
    <Box dir={dir} sx={{ p: 2 }}>
      {closeDate.getTime() > Date.now() ? (
        <Card
          variant="outlined"
          sx={{
            p: 3,
            mb: 3,
            borderColor: "secondary.main",
            backgroundColor: "background.paper",
          }}
        >
          <CardContent>
            <Typography variant="h5" color="primary" gutterBottom>
              {survey.title}
            </Typography>

            <Typography
              variant="body2"
              color={closeDate.getTime() > Date.now() ? "success.main" : "error.main"}
              sx={{ mb: 2, fontWeight: "bold" }}
            >
              {t("closesOn")}: {closeDateStr}
            </Typography>

            {/* Attachments */}
            {attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <ImageVidDisplayer
                  attachments={attachments.filter(
                    (a) => a.mimeType?.startsWith("image/") || a.mimeType?.startsWith("video/")
                  )}
                />
                <Box sx={{ mt: 2 }}>
                  <OtherDisplayer
                    attachments={attachments.filter(
                      (a) =>
                        !a.mimeType?.startsWith("image/") &&
                        !a.mimeType?.startsWith("video/")
                    )}
                  />
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Survey Questions */}
            {survey.groups?.map((group, groupIndex) => (
              <Box
                key={groupIndex}
                sx={{
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "rgba(212,175,55,0.08)", // light gold tint
                }}
              >
                <Typography
                  variant="subtitle1"
                  color="secondary"
                  fontWeight="bold"
                  gutterBottom
                >
                  {group.groupLabel}
                </Typography>

                {group.questions.map((question, questionIndex) => (
                  <Box key={questionIndex} sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      {question.name}
                      {question.required && (
                        <Typography
                          component="span"
                          sx={{ color: "error.main", ml: 0.5 }}
                        >
                          *
                        </Typography>
                      )}
                    </Typography>
                    {renderInputField(question, groupIndex, questionIndex)}
                  </Box>
                ))}
              </Box>
            ))}

            <Box sx={{ textAlign: "center", mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={createResponse.isLoading || !isFormValid()}
              >
                {createResponse.isLoading ? t("submitting") : t("submit")}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ p: 3, backgroundColor: "background.default" }}>
          {renderResults(survey)}
        </Card>
      )}
    </Box>
  );
}

export default Survey;
