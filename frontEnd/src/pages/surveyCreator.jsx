import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box,
  Divider,
  Chip,
  IconButton,
  Grid,
  Checkbox,
  Input,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// import AddIcon from '@mui/material';
// import DeleteIcon from '@mui/material';
import { useCreateSurvey } from "../repository/survey";
import { useCreateAttachment } from "../repository/attachment";
import { useTranslation } from "react-i18next";
import { AttachFile } from "@mui/icons-material";

function SurveyCreator() {
  const { i18n, t } = useTranslation();

  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const [surveyTitle, setSurveyTitle] = useState("");
  const [groups, setGroups] = useState([]);
  const [currentGroupLabel, setCurrentGroupLabel] = useState("");
  const [currentGroupQuestions, setCurrentGroupQuestions] = useState([]);
  const [surveyCloseDate, setSurveyCloseDate] = useState(null);
  const [fieldType, setFieldType] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [options, setOptions] = useState([]);
  const [optionLabel, setOptionLabel] = useState("");
  const [currGroupId, setCurrGroupId] = useState(0);
  const [required, setRequired] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const { mutate: createSurvey } = useCreateSurvey();
  const { mutate: createAttachments } = useCreateAttachment();
  const [audience, setAudience] = useState("USER");
  const [contentType, setContentType] = useState("SURVEY");

  // Add option to the current question
  const handleAddOption = () => {
    if (optionLabel.trim()) {
      setOptions([...options, optionLabel.trim()]);
      setOptionLabel("");
    }
  };

  // Remove an option
  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    setOptions(newOptions);
  };

  const handleRemoveAttachment = (index) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  // Handle add question to current group
  const handleAddQuestion = () => {
    if (!fieldName || !fieldType) return;

    if (
      (fieldType === "radio" || fieldType === "checkbox") &&
      options.length === 0
    ) {
      alert("Please add at least one option for this question type");
      return;
    }

    const question = {
      required: required,
      type: fieldType,
      name: fieldName,
      ...(fieldType === "radio" || fieldType === "checkbox" ? { options } : {}),
    };

    setCurrentGroupQuestions([...currentGroupQuestions, question]);
    setFieldName("");
    setFieldType("");
    setOptions([]);
  };

  // Handle add group with its questions
  const handleAddGroup = () => {
    if (!currentGroupLabel || currentGroupQuestions.length === 0) return;

    setGroups([
      ...groups,
      {
        id: currGroupId,
        groupLabel: currentGroupLabel,
        questions: currentGroupQuestions,
      },
    ]);
    setCurrGroupId((prev) => prev++);
    setCurrentGroupLabel("");
    setCurrentGroupQuestions([]);
  };

  // Clear everything
  const handleClear = () => {
    setSurveyTitle("");
    setGroups([]);
    setCurrentGroupLabel("");
    setCurrentGroupQuestions([]);
    setFieldType("");
    setFieldName("");
    setOptions([]);
    setOptionLabel("");
    setSurveyCloseDate(null);
    setAttachments([]);
    setAudience("USER");
    setContentType("SURVEY");
  };

  // Submit survey or post
  const handleSubmit = () => {
    // Base payload
    const payload = {
      closedAt: surveyCloseDate ? surveyCloseDate.toISOString() : null,
      title: surveyTitle,
      audience,
      contentType,
    };

    // If it's a survey → include groups
    if (!(audience === "EXPERT" && contentType === "POST")) {
      payload.groups = [
        ...groups,
        ...(currentGroupQuestions.length > 0 && currentGroupLabel
          ? [
              {
                groupLabel: currentGroupLabel,
                questions: currentGroupQuestions,
              },
            ]
          : []),
      ];
    }

    createSurvey(payload, {
      onSuccess: (surveyData) => {
        if (attachments.length > 0) {
          createAttachments(
            { surveyId: surveyData.id, attachments: attachments },
            {
              onSuccess: () => {
                alert("Survey/Post and attachments created successfully!");
                handleClear();
              },
              onError: () => {
                alert("Created but failed to upload attachments");
              },
            }
          );
        } else {
          alert("Created successfully!");
          handleClear();
        }
      },
      onError: () => {
        alert("Failed to create");
      },
    });
  };

  const showOptionsUI = fieldType === "radio" || fieldType === "checkbox";

  return (
    <Box dir={dir} p={4} maxWidth={1200} mx="auto">
      <Card variant="outlined" sx={{ borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", color: "primary" }}
            color="primary"
          >
            {t("createSurveyBtn")}
          </Typography>

          {/* === NEW Audience + Type === */}
          <Box mb={3} display="flex" gap={2}>
            <FormControl>
              <Select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                size="small"
              >
                <MenuItem value="USER">{t("User")}</MenuItem>
                <MenuItem value="EXPERT">{t("Expert")}</MenuItem>
              </Select>
            </FormControl>

            {audience === "EXPERT" && (
              <FormControl>
                <Select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  size="small"
                >
                  <MenuItem value="SURVEY">{t("Survey")}</MenuItem>
                  <MenuItem value="POST">{t("Post")}</MenuItem>
                </Select>
              </FormControl>
            )}
          </Box>

          {/* Survey/Post Title, Attachments, End Date (common) */}
          <Box mb={3} display={"inline"}>
            <Box paddingRight={"12px"} display={"inline"}>
              <TextField
                label={t("")}
                value={surveyTitle}
                onChange={(e) => setSurveyTitle(e.target.value)}
                placeholder={t("enterSurveyTitle")}
                variant="outlined"
                size="medium"
                color="primary"
              />
            </Box>
            <Button
              component="label"
              variant="outlined"
              color="primary"
              startIcon={<AttachFile />}
              sx={{
                borderRadius: 2,
                fontWeight: 600,
                textTransform: "none",
              }}
            >
              {t("addAttachments")}
              <input
                hidden
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setAttachments((prev) => {
                    const unique = [...prev];
                    files.forEach((file) => {
                      const exists = unique.some(
                        (f) => f.name === file.name && f.size === file.size
                      );
                      if (!exists) {
                        unique.push(file);
                      }
                    });
                    return unique;
                  });
                }}
              />
            </Button>

            <Box padding={"10px"} display={"inline"}>
              <DatePicker
                dir={dir}
                label={t("")}
                value={surveyCloseDate}
                onChange={(newValue) => setSurveyCloseDate(newValue)}
                placeholder={t("surveyClosedAt")}
                variant="outlined"
                size="small"
              ></DatePicker>
            </Box>
            <Box padding={"10px"} display={"box"}>
              {attachments.map((attachment, index) => {
                return (
                  <Chip
                    key={index}
                    label={attachment.name}
                    onDelete={() => handleRemoveAttachment(index)}
                    variant="outlined"
                    sx={{ backgroundColor: "#e3f2fd" }}
                  />
                );
              })}
            </Box>
          </Box>

          {/* === Show groups/questions only if NOT expert post === */}
          {!(audience === "EXPERT" && contentType === "POST") && (
            <>
              {/* Group Label */}
              <Typography variant="h6" sx={{ mb: 1, color: "#3498db" }}>
                {t("newGroup")}
              </Typography>
              <Grid container spacing={3} alignItems="center" mb={2}>
                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label={t("groupLabel")}
                    placeholder="e.g. Personal Information"
                    variant="outlined"
                    value={currentGroupLabel}
                    onChange={(e) => setCurrentGroupLabel(e.target.value)}
                    size="small"
                    color="primary"
                  />
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddGroup}
                    disabled={
                      !currentGroupLabel || currentGroupQuestions.length === 0
                    }
                    fullWidth
                  >
                    {t("finishGroup")}
                  </Button>
                </Grid>
              </Grid>

              {/* Add Question */}
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{ mt: 3, fontWeight: "medium" }}
                color="primary"
              >
                {t("addQuestionBtn")}
              </Typography>

              <Grid container spacing={2} mb={2}>
                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControl
                    fullWidth
                    variant="outlined"
                    size="small"
                    sx={{ width: "8dvw" }}
                  >
                    <InputLabel>{t("questionType")}</InputLabel>
                    <Select
                      label={t("questionType")}
                      value={fieldType}
                      onChange={(e) => setFieldType(e.target.value)}
                    >
                      <MenuItem value="text">{t("textInput")}</MenuItem>
                      <MenuItem value="radio">{t("radioButtons")}</MenuItem>
                      <MenuItem value="checkbox">{t("checkboxes")}</MenuItem>
                      <MenuItem value="file">{t("file")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <TextField
                    fullWidth
                    label={t("questionText")}
                    variant="outlined"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    size="small"
                    
                  />
                </Grid>

                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <Button
                    variant="contained"
                    onClick={handleAddQuestion}
                    disabled={
                      !fieldName ||
                      !fieldType ||
                      (showOptionsUI && options.length === 0)
                    }
                    fullWidth
                  >
                    {t("addQuestionBtn")}
                  </Button>
                </Grid>
                <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                  <label>{t("required")}</label>
                  <Checkbox
                    value={required}
                    onChange={() => setRequired((prev) => !prev)}
                  ></Checkbox>
                </Grid>
              </Grid>

              {/* Options for radio and checkbox */}
              {showOptionsUI && (
                <Box
                  mb={2}
                  sx={{ border: "1px dashed #e0e0e0", p: 2, borderRadius: 1 }}
                >
                  <Typography variant="subtitle2" gutterBottom>
                    {t("addOptionBtn")}{" "}
                    {fieldType === "radio"
                      ? t("radioButtons")
                      : t("checkboxes")}
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                      <TextField
                        fullWidth
                        label={t("newOption")}
                        variant="outlined"
                        value={optionLabel}
                        onChange={(e) => setOptionLabel(e.target.value)}
                        size="small"
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleAddOption()
                        }
                      />
                    </Grid>
                    <Grid item size={{ xs: 12, sm: 6, md: 4 }}>
                      <Button
                        variant="outlined"
                        onClick={handleAddOption}
                        disabled={!optionLabel.trim()}
                        fullWidth
                      >
                        {t("addOptionBtn")}
                      </Button>
                    </Grid>
                  </Grid>

                  {options.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {t("currentOptions")}
                      </Typography>
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {options.map((option, index) => (
                          <Chip
                            key={index}
                            label={option}
                            onDelete={() => handleRemoveOption(index)}
                            variant="outlined"
                            sx={{ backgroundColor: "#e3f2fd" }}
                          />
                        ))}
                      </Box>
                    </Box>
                  )}

                  {options.length === 0 && (
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      {t("noOptions")}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Current Group Preview */}
              {currentGroupQuestions.length > 0 && (
                <Box
                  mb={3}
                  sx={{ border: "1px solid #e0e0e0", borderRadius: 1, p: 2 }}
                >
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: "medium" }}
                  >
                    {t("currentGroup")} {currentGroupLabel || "Untitled Group"}
                  </Typography>

                  {currentGroupQuestions.map((q, i) => (
                    <Box
                      key={i}
                      mb={1}
                      sx={{ pl: 1, borderLeft: "3px solid #3498db" }}
                    >
                      <Typography variant="body1">
                        <strong>{q.name}</strong> ({q.type})
                      </Typography>

                      {q.options && q.options.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 0.5,
                            mt: 0.5,
                          }}
                        >
                          {q.options.map((opt, idx) => (
                            <Chip
                              key={idx}
                              label={opt}
                              size="small"
                              sx={{ backgroundColor: "#e3f2fd" }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Preview of all groups */}
              {groups.length > 0 && (
                <Box>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: "bold" }}
                  >
                    {t("surveyPreview")}
                  </Typography>

                  {groups.map((group, i) => (
                    <Box
                      key={i}
                      mb={3}
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        p: 2,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "medium",
                          color: "#3498db",
                          display: "inline",
                        }}
                      >
                        {group.groupLabel}
                      </Typography>
                      <Button
                        onClick={() => {
                          setGroups((prevGroups) =>
                            prevGroups.filter((_, idx) => idx !== i)
                          );
                        }}
                        sx={{ width: "20px", display: "inline", right: "1" }}
                      >
                        X
                      </Button>
                      {group.questions.map((q, j) => (
                        <Box key={j} mb={1} sx={{ pl: 1, mt: 1 }}>
                          <Typography variant="body2">
                            <strong>{q.name}</strong> ({q.type})
                          </Typography>

                          {q.options && q.options.length > 0 && (
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 0.5,
                                mt: 0.5,
                              }}
                            >
                              {q.options.map((opt, idx) => (
                                <Chip
                                  key={idx}
                                  label={opt}
                                  size="small"
                                  sx={{ backgroundColor: "#e8f5e9" }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />
                </Box>
              )}
            </>
          )}
        </CardContent>

        <CardActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !surveyTitle ||
              !surveyCloseDate ||
              (!(audience === "EXPERT" && contentType === "POST") &&
                groups.length === 0)
            }
            color="primary"
          >
            {t("createSurveyBtn")}
          </Button>

          <Button variant="outlined" onClick={handleClear} color="error">
            {t("clearAll")}
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
}

export default SurveyCreator;
