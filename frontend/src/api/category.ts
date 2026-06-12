import api from './index'

export const categoryApi = {
  getAll() {
    return api.get('/categories')
  },

  getById(id: number) {
    return api.get(`/categories/${id}`)
  },
}
