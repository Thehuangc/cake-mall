import api from './index'

export const riderApi = {
  getAvailableOrders(params?: { page?: number; limit?: number }) {
    return api.get('/rider/orders', { params })
  },

  getMyOrders(params?: { page?: number; limit?: number; status?: number }) {
    return api.get('/rider/my-orders', { params })
  },

  acceptOrder(id: number) {
    return api.put(`/rider/orders/${id}/accept`)
  },

  pickupOrder(id: number) {
    return api.put(`/rider/orders/${id}/pickup`)
  },

  deliverOrder(id: number) {
    return api.put(`/rider/orders/${id}/deliver`)
  },

  getStats() {
    return api.get('/rider/stats')
  },
}
