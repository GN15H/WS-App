import axios from "axios";

export class LoginController {
  async login(email: string, password: string) {
    const req = await axios.post(import.meta.env.VITE_API_URI + '/auth/login', {
      email: email,
      password: password
    })
    localStorage.setItem('token', req.data['token'])
    console.log(req);
  }
}
