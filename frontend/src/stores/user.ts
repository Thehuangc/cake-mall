import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

interface User {
  id: number
  username: string
  email: string
  phone?: string
  avatar?: string
  role?: string
  created_at?: string
}

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const res: any = await authApi.login({ email, password })
    if (!res.token) throw new Error('登录失败：服务器未返回token')
    token.value = res.token
    user.value = res.user
    localStorage.setItem('token', res.token)
    return res
  }

  async function register(username: string, email: string, password: string) {
    const res: any = await authApi.register({ username, email, password })
    if (!res.token) throw new Error('注册失败：服务器未返回token')
    token.value = res.token
    user.value = res.user
    localStorage.setItem('token', res.token)
    return res
  }

  async function fetchProfile() {
    if (!token.value) return
    try {
      const res: any = await authApi.getProfile()
      user.value = res
    } catch {
      logout()
    }
  }

  function logout() {
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    fetchProfile,
    logout,
  }
})
