import { Box, Button, TextField, Alert, CircularProgress } from "@mui/material";
import { useState } from "react";
import { LoginController } from "./Login.controller";
import { useNavigate } from "react-router-dom";

interface LoginErrors {
  email?: string;
  password?: string;
  general?: string;
}

export const Login = () => {
  const navigate = useNavigate();
  const controller = new LoginController();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  // Validación básica
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
      // El controlador debería manejar la navegación o lanzar un error
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
      gap="2vh"
      width="100%"
      height="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      px={2}
    >
      <h1 style={{ marginBottom: "2rem" }}>Login</h1>

      {errors.general && (
        <Alert severity="error" sx={{ width: "100%", maxWidth: "400px" }}>
          {errors.general}
        </Alert>
      )}

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
        maxWidth="400px"
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
        maxWidth="400px"
        sx={{ maxWidth: "400px" }}
      />

      <Button
        variant="contained"
        onClick={handleLogin}
        disabled={loading}
        sx={{ maxWidth: "400px", width: "100%", minHeight: "44px" }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
      </Button>

      <Button
        onClick={() => navigate("/register")}
        disabled={loading}
        sx={{ maxWidth: "400px", width: "100%" }}
      >
        ¿No tienes cuenta? Regístrate
      </Button>
    </Box>
  );
};
