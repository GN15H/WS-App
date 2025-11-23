import axios from "axios"

export class RegisterController {
  async register(username: string, email: string, password: string): Promise<boolean> {
    try {
      const req = await axios.post(import.meta.env.VITE_API_URI + "/auth/register", {
        userName: username,
        email: email,
        password: password,
        confirmPassword: password,
      })

      return req.status === 201
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message
        throw new Error(message)
      }
      throw error
    }
  }
}
