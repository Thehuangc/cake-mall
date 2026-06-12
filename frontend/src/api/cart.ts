import api from './index'

export const cartApi = {
  getList() {
    return api.get('/cart')
  },

  addItem(data: { product_id: number; quantity?: number }) {
    return api.post('/cart', data)
  },

  updateItem(id: number, data: { quantity: number }) {
    return api.put(`/cart/${id}`, data)
  },

  removeItem(id: number) {
    return api.delete(`/cart/${id}`)
  },

  clearCart() {
    return api.delete('/cart')
  },
}
