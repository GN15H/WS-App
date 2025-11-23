import type React from "react";
import { Box, Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterController } from "./Register.controller";

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

  // Validación completa del formulario
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
      gap="2vh"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <h1 style={{ marginBottom: "2rem" }}>Registrarse</h1>

      {errors.general && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: "400px" }}>
          {errors.general}
        </Alert>
      )}

      <TextField
        label="Nombre de Usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyPress={handleKeyPress}
        error={!!errors.username}
        helperText={errors.username}
        disabled={loading}
        fullWidth
        sx={{ maxWidth: "400px" }}
      />

      <TextField
        label="Correo"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyPress={handleKeyPress}
        error={!!errors.email}
        helperText={errors.email}
        disabled={loading}
        fullWidth
        sx={{ maxWidth: "400px" }}
      />

      <TextField
        type="password"
        label="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        error={!!errors.password}
        helperText={errors.password}
        disabled={loading}
        fullWidth
        sx={{ maxWidth: "400px" }}
      />

      <TextField
        type="password"
        label="Confirmar Contraseña"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onKeyPress={handleKeyPress}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
        disabled={loading}
        fullWidth
        sx={{ maxWidth: "400px" }}
      />

      <Button
        variant="contained"
        onClick={handleRegister}
        disabled={loading}
        sx={{ maxWidth: "400px", width: "100%", minHeight: "44px" }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          "Registrarse"
        )}
      </Button>

      <Button
        onClick={() => navigate("/")}
        disabled={loading}
        sx={{ maxWidth: "400px", width: "100%" }}
      >
        ¿Ya tienes cuenta? Inicia sesión
      </Button>
    </Box>
  );
};
