"use client";

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
import { useNavigate } from "react-router-dom";
import { RegisterController } from "./Register.controller";
import { ThemeToggle } from "./components/ThemeToogle";

interface RegisterErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export const Register = () => {
  const navigate = useNavigate();
  const controller = new RegisterController();

  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<RegisterErrors>({});

  const validateForm = (): boolean => {
    const newErrors: RegisterErrors = {};

    if (!username) {
      newErrors.username = "El nombre de usuario es requerido";
    } else if (username.length < 3) {
      newErrors.username =
        "El nombre de usuario debe tener al menos 3 caracteres";
    } else if (username.length > 20) {
      newErrors.username =
        "El nombre de usuario no puede exceder 20 caracteres";
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirmar contraseña es requerido";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const success = await controller.register(username, email, password);
      if (success) {
        navigate("/");
      }
    } catch (error) {
      setErrors({
        general:
          error instanceof Error ? error.message : "Error al registrarse",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
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
          overflowY: "auto",
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
                Crear Cuenta
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Regístrate para comenzar a chatear
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
                label="Nombre de Usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!errors.username}
                helperText={errors.username}
                disabled={loading}
                placeholder="Tu nombre"
                variant="outlined"
              />

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

              <TextField
                fullWidth
                label="Confirmar Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={loading}
                placeholder="••••••••"
                variant="outlined"
              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleRegister}
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
                  "Crear Cuenta"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  ¿Ya tienes cuenta?{" "}
                  <Link
                    component="button"
                    onClick={() => navigate("/")}
                    disabled={loading}
                    sx={{
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    Inicia Sesión
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
