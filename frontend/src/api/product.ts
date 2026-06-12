import api from './index'

export const productApi = {
  getList(params?: {
    page?: number
    limit?: number
    category_id?: number
    keyword?: string
    minPrice?: number
    maxPrice?: number
    sort?: string
  }) {
    return api.get('/products', { params })
  },

  getById(id: number) {
    return api.get(`/products/${id}`)
  },

  getHot() {
    return api.get('/products/hot')
  },

  getNew() {
    return api.get('/products/new')
  },
}
