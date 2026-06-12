import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { cartApi } from '@/api/cart'

interface CartItem {
  id: number
  product_id: number
  quantity: number
  product: {
    id: number
    name: string
    price: number
    image: string
    stock: number
  }
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const total = ref(0)

  const count = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  async function fetchCart() {
    try {
      const res: any = await cartApi.getList()
      items.value = res.items
      total.value = res.total
    } catch {
      items.value = []
      total.value = 0
    }
  }

  async function addItem(productId: number, quantity: number = 1) {
    await cartApi.addItem({ product_id: productId, quantity })
    await fetchCart()
  }

  async function updateQuantity(id: number, quantity: number) {
    await cartApi.updateItem(id, { quantity })
    await fetchCart()
  }

  async function removeItem(id: number) {
    await cartApi.removeItem(id)
    await fetchCart()
  }

  async function clearCart() {
    await cartApi.clearCart()
    items.value = []
    total.value = 0
  }

  return {
    items,
    total,
    count,
    fetchCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
  }
})
