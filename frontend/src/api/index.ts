import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 管理后台请求使用adminToken，普通请求使用user token
    const isAdminRequest = config.url?.startsWith('/admin')
    const token = isAdminRequest
      ? localStorage.getItem('adminToken')
      : localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response

      switch (status) {
        case 401: {
          const isAdminRequest = error.config?.url?.startsWith('/admin')
          if (isAdminRequest) {
            localStorage.removeItem('adminToken')
            router.push('/admin/login')
          } else {
            localStorage.removeItem('token')
            router.push('/login')
          }
          ElMessage.error('请重新登录')
          break
        }
        case 403:
          ElMessage.error('没有权限')
          break
        case 404:
          ElMessage.error('请求资源不存在')
          break
        case 422:
          ElMessage.error(data.message || '请求参数错误')
          break
        default:
          ElMessage.error(data.message || '服务器错误')
      }
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }

    return Promise.reject(error)
  }
)

export default api
