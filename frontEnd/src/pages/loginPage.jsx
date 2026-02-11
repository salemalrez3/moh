import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {useLogin,useRegister} from "../repository/user"
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Avatar,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // tab: 0 => Login, 1 => Register
  const [tab, setTab] = useState(0);

  // common fields
  const [email, setEmail] = useState("");
  const [passWord, setpassWord] = useState("");
  const [showpassWord, setShowpassWord] = useState(false);

  // register-only field
  const [userName, setUserName] = useState("");

  // feedback
  const [serverError, setServerError] = useState(null);
  const [serverSuccess, setServerSuccess] = useState(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  const handleTabChange = (_, newVal) => {
    setServerError(null);
    setServerSuccess(null);
    setTab(newVal);
    setEmail("");
    setpassWord("");
    setUserName("");
  };

  const onLogin = async (e) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!email || !passWord) {
      setServerError(t("pleaseFillAllFields") || "Please fill all fields");
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({ email, passWord });
      setServerSuccess(t("loginSuccess") || "Logged in");
      // navigate to surveys (or user desired route)
      navigate("/surveys", { replace: true });
    } catch (err) {
      // err may be Axios error => err.response?.data?.message
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed";
      setServerError(msg);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!email || !passWord || !userName) {
      setServerError(t("pleaseFillAllFields") || "Please fill all fields");
      return;
    }

    try {
      const res = await registerMutation.mutateAsync({
        email,
        userName,
        passWord,
      });

      // If server didn't automatically log in the user, you can call login or navigate to login
      if (res?.token) {
        setServerSuccess(t("registeredAndLogged") || "Registered and logged in");
        navigate("/surveys", { replace: true });
      } else {
        setServerSuccess(t("registered") || "Registered successfully");
        // optionally auto-switch to login tab
        setTab(0);
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

  const isLoading = loginMutation.isLoading || registerMutation.isLoading;

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
              <LockOutlinedIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>

          <Typography
            variant="h5"
            align="center"
            sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}
          >
            {t("welcome") || "Welcome"}
          </Typography>

          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t("authSubtitle") ||
              "Sign in to your account or create a new one to get started."}
          </Typography>

          <Tabs value={tab} onChange={handleTabChange} centered>
            <Tab label={t("login") || "Login"} sx={{   color:"text.secondary"}}/>
            <Tab label={t("register") || "Register"}   sx={{   color:"text.secondary"}} />
          </Tabs>

          <Box component="form" onSubmit={tab === 0 ? onLogin : onRegister} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              {serverError && <Alert severity="error">{serverError}</Alert>}
              {serverSuccess && <Alert severity="success">{serverSuccess}</Alert>}

              {tab === 1 && (
                <TextField
                  label={t("username") || "Username"}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  fullWidth
                  required
                />
              )}

              <TextField
                label={t("email") || "Email"}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                required
              />

              <TextField
                label={t("passWord") || "passWord"}
                type={showpassWord ? "text" : "passWord"}
                value={passWord}
                onChange={(e) => setpassWord(e.target.value)}
                fullWidth
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle passWord"
                        onClick={() => setShowpassWord((s) => !s)}
                        edge="end"
                        size="large"
                      >
                        {showpassWord ? <VisibilityOff /> : <Visibility />}
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
                startIcon={isLoading ? <CircularProgress size={18} /> : null}
              >
                {tab === 0 ? t("login") || "Login" : t("register") || "Register"}
              </Button>

              <Box sx={{ textAlign: "center", mt: 1 }}>
                <Button
                  onClick={() => {
                    // quick demo shortcut to prefill guest creds in dev
                    setEmail("demo@example.com");
                    setpassWord("passWord123");
                    if (tab === 1) setUserName("demo");
                  }}
                  size="small"
                >
                  {t("useDemo") || "Use demo credentials"}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
