
import { Box, Button, TextField } from "@mui/material"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { RegisterController } from "./Register.controller"

export const Register = () => {
  const navigate = useNavigate();
  const controller = new RegisterController();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  return (
    <Box gap={'2vh'} width={'100%'} height={'100%'} display={'flex'} flexDirection={'column'} alignItems={'center'} justifyContent={'center'}>
      <TextField label={'Nombre de Usuario'} value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label={'Correo'} value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField type="password" label={'Contraseña'} value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button variant="contained" onClick={async () => {
        const success = await controller.register(username, email, password);
        if (success) navigate('/');
      }}>Registrarse</Button>
      <Button onClick={() => navigate('/')}>¿Ya tienes cuenta?</Button>
    </Box>
  );
}
