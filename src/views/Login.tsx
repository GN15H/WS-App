import type React from "react";
import {
  Box,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Container,
  Card,
  Typography,
  Link,
} from "@mui/material";
import { useState } from "react";
import { LoginController } from "./Login.controller";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeProvider";
import { ThemeToggle } from "./components/ThemeToogle";

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const controller = new LoginController();
  const muiTheme = useTheme();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    if (!email) {
      newErrors.email = "El correo es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Correo inválido";
    }

    if (!password) {
      newErrors.password = "La contraseña es requerida";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      await controller.login(email, password);
    } catch (error) {
      setErrors({
        general:
          error instanceof Error ? error.message : "Error al iniciar sesión",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header with Theme Toggle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
          Chat Pro
        </Typography>
        <ThemeToggle />
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
        }}
      >
        <Container maxWidth="sm">
          <Card
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 2,
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Bienvenido
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Inicia sesión para acceder a tus canales
              </Typography>
            </Box>

            {errors.general && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.general}
              </Alert>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                fullWidth
                label="Correo Electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
                placeholder="tu@email.com"
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!errors.password}
                helperText={errors.password}
                disabled={loading}
                placeholder="••••••••"
                variant="outlined"
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleLogin}
                disabled={loading}
                size="large"
                sx={{
                  mt: 1,
                  py: 1.2,
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Inicia Sesión"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ¿No tienes cuenta?{" "}
                  <Link
                    component="button"
                    onClick={() => navigate("/register")}
                    disabled={loading}
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    Regístrate
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>
    </Box>
  );
};
