import api from './index'

export const orderApi = {
  create(data: { address: any; remark?: string }) {
    return api.post('/orders', data)
  },

  getList(params?: { page?: number; limit?: number; status?: number }) {
    return api.get('/orders', { params })
  },

  getById(id: number) {
    return api.get(`/orders/${id}`)
  },

  cancel(id: number) {
    return api.put(`/orders/${id}/cancel`)
  },
}
