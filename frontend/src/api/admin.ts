import api from './index'

export const adminApi = {
  // 用户管理
  getUsers(params?: { page?: number; limit?: number; keyword?: string }) {
    return api.get('/admin/users', { params })
  },

  createUser(data: { username: string; email: string; password: string; phone?: string }) {
    return api.post('/admin/users', data)
  },

  updateUser(id: number, data: { username?: string; phone?: string }) {
    return api.put(`/admin/users/${id}`, data)
  },

  deleteUser(id: number) {
    return api.delete(`/admin/users/${id}`)
  },

  // 商品管理
  getProducts(params?: { page?: number; limit?: number; keyword?: string; category_id?: number }) {
    return api.get('/admin/products', { params })
  },

  createProduct(data: any) {
    return api.post('/admin/products', data)
  },

  updateProduct(id: number, data: any) {
    return api.put(`/admin/products/${id}`, data)
  },

  deleteProduct(id: number) {
    return api.delete(`/admin/products/${id}`)
  },

  // 分类管理
  getCategories() {
    return api.get('/admin/categories')
  },

  createCategory(data: { name: string; icon: string; sort_order?: number }) {
    return api.post('/admin/categories', data)
  },

  updateCategory(id: number, data: { name?: string; icon?: string; sort_order?: number }) {
    return api.put(`/admin/categories/${id}`, data)
  },

  deleteCategory(id: number) {
    return api.delete(`/admin/categories/${id}`)
  },

  // 订单管理
  getOrders(params?: { page?: number; limit?: number; status?: number; keyword?: string }) {
    return api.get('/admin/orders', { params })
  },

  updateOrderStatus(id: number, status: number) {
    return api.put(`/admin/orders/${id}/status`, { status })
  },

  deleteOrder(id: number) {
    return api.delete(`/admin/orders/${id}`)
  },

  // 统计数据
  getDashboardStats() {
    return api.get('/admin/dashboard/stats')
  },
}
