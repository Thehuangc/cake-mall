import api from './index'

export const authApi = {
  register(data: { username: string; email: string; password: string }) {
    return api.post('/auth/register', data)
  },

  login(data: { email: string; password: string }) {
    return api.post('/auth/login', data)
  },

  adminLogin(data: { email: string; password: string }) {
    return api.post('/auth/admin/login', data)
  },

  getProfile() {
    return api.get('/auth/profile')
  },
}
