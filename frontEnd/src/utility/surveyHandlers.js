  const handleTextChange = (groupIndex, questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${groupIndex}-${questionIndex}`]: value,
    }));
  };

  const handleRadioChange = (groupIndex, questionIndex, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${groupIndex}-${questionIndex}`]: value,
    }));
  };

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
export const renderInputField = (question, groupIndex, questionIndex) => {
    switch (question.type) {
      case "text":
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t("enterValue", { field: question.name })}
            value={responses[`${groupIndex}-${questionIndex}`] || ""}
            onChange={(e) =>
              handleTextChange(groupIndex, questionIndex, e.target.value)
            }
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
                    checked={
                      responses[`${groupIndex}-${questionIndex}`] === option
                    }
                    onChange={() =>
                      handleRadioChange(groupIndex, questionIndex, option)
                    }
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
                    checked={(
                      responses[`${groupIndex}-${questionIndex}`] || []
                    ).includes(option)}
                    onChange={() =>
                      handleCheckboxChange(groupIndex, questionIndex, option)
                    }
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

 export function renderResults(survey) {
    if (!survey.results) return null;

    return (
      <Box sx={{ mt: 2 }}>
        {survey.groups.map((group, gi) => (
          <Box key={gi} sx={{ mb: 3 }}>
            <Typography variant="h6">{group.name}</Typography>
            {group.questions.map((q, qi) => {
              const key = `${gi}-${qi}`;
              const res = survey.results[key];

              if (q.type === "radio" || q.type === "checkbox") {
                const total = Object.values(res).reduce(
                  (sum, count) => sum + count,
                  0
                );
                return (
                  <Box key={qi} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1">{q.name}</Typography>
                    {q.options.map((opt) => {
                      const count = res[opt] || 0;
                      const percent = total
                        ? Math.round((count / total) * 100)
                        : 0;
                      return (
                        <Box key={opt} sx={{ mb: 1 }}>
                          <Typography variant="body2">
                            {opt}: {count} ({percent}%)
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={percent}
                            sx={{ height: 8, borderRadius: 5 }}
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
                      {res.count} responses
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
  }

   // export const renderResults = () => {
  //   if (!surveyResponses) return null;
  //   return Object.entries(surveyResponses.results).map(([key, answers]) => {
  //     const [gi, qi] = key.split("-").map(Number);
  //     const isText = Array.isArray(answers);
  //     const totalVotes = !isText
  //       ? Object.values(answers).reduce((sum, c) => sum + c, 0)
  //       : 0;

  //     return (
  //       <Card key={key} sx={{ mb: 2 }}>
  //         <CardContent>
  //           <Typography variant="h6" gutterBottom>
  //             {t("question")} {gi + 1}-{qi + 1}{" "}
  //             {isText ? `(${t("textAnswers")})` : `(${t("choices")})`}
  //           </Typography>
  //           {isText ? (
  //             <Typography variant="body2" color="text.secondary">
  //               {answers.length} {t("answers")}
  //             </Typography>
  //           ) : (
  //             <Box>
  //               {Object.entries(answers).map(([option, count]) => (
  //                 <Box
  //                   key={option}
  //                   sx={{
  //                     display: "flex",
  //                     justifyContent: "space-between",
  //                     borderBottom: "1px solid #eee",
  //                     py: 0.5,
  //                   }}
  //                 >
  //                   <span>{option}</span>
  //                   <strong>
  //                     {count} / {surveyResponses.numberOfResponses}
  //                   </strong>
  //                 </Box>
  //               ))}
  //             </Box>
  //           )}
  //         </CardContent>
  //       </Card>
  //     );
  //   });
  // };
