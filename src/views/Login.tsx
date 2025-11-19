
import { Button, TextField } from "@mui/material"
import { useState } from "react";
import { LoginController } from "./Login.controller";

export const Login = () => {
  const controller = new LoginController();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  return (
    <div>
      <TextField value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={() => controller.login(email, password)}>Login</Button>
      <Button onClick={() => console.log(localStorage.getItem('token'))}>huh</Button>
    </div>
  );
}
