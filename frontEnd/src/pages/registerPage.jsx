import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useRegister } from "../repository/user";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
  Link,
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [serverError, setServerError] = useState(null);
  const [serverSuccess, setServerSuccess] = useState(null);

  const registerMutation = useRegister();

  const onRegister = async (e) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!email || !password || !name) {
      setServerError(t("pleaseFillAllFields") || "Please fill all fields");
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({ email, password, name });

      if (res?.token) {
        setServerSuccess(
          t("registeredAndLogged") || "Registered and logged in"
        );
        navigate("/fact-check", { replace: true });
      } else {
        setServerSuccess(t("registered") || "Registered successfully");
        navigate("/login", { replace: true });
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";
      setServerError(msg);
    }
  };

  const isLoading = registerMutation.isPending;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Card
        sx={{
          width: 480,
          maxWidth: "100%",
          borderRadius: 3,
          boxShadow: 6,
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 64, height: 64 }}>
              <PersonAddAltIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>

          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
          >
            {t("register") || "Register"}
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t("registerSubtitle") || "Create your account to get started."}
          </Typography>

          <Box component="form" onSubmit={onRegister} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              {serverSuccess && (
                <Alert severity="success">{serverSuccess}</Alert>
              )}

              <TextField
                label={t("username") || "Name"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label={t("email") || "Email"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label={t("passWord") || "Password"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password"
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="large"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={isLoading}
                sx={{ py: 1.6, fontWeight: 700 }}
                startIcon={
                  isLoading ? <CircularProgress size={18} /> : null
                }
              >
                {t("register") || "Register"}
              </Button>

              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                {t("alreadyHaveAccount") || "Already have an account?"}{" "}
                <Link component={RouterLink} to="/login" underline="hover">
                  {t("login") || "Login"}
                </Link>
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
