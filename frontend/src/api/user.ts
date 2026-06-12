import api from './index'

export const userApi = {
  getProfile() {
    return api.get('/users/profile')
  },

  updateProfile(data: { username?: string; phone?: string; avatar?: string }) {
    return api.put('/users/profile', data)
  },
}
