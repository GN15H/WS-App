import axios from "axios";

export class LoginController {
  async login(email: string, password: string) {
    const req = await axios.post(import.meta.env.VITE_API_URI + '/auth/login', {
      email: email,
      password: password
    })
    localStorage.setItem('token', req.data['token'])
    console.log(req);
    const profReq = await axios.get(import.meta.env.VITE_API_URI + '/auth/userInfo', {
      headers: {
        Authorization: `Bearer ${req.data['token']}`
      }
    })
    console.log('pero sisas?', profReq);
    localStorage.setItem('profile', JSON.stringify({
      id: profReq.data['id'],
      username: profReq.data['userName'],
      email: profReq.data['email']
    }))
    window.location.reload()
  }
}
