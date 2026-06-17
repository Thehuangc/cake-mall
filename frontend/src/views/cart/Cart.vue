<template>
  <div class="cart-page">
    <div class="container">
      <div class="cart-page__header animate-fade-up">
        <span class="section-label">Shopping Cart</span>
        <h1 class="cart-page__title">购物车</h1>
      </div>

      <div class="cart-page__layout" v-if="!loading && cartStore.items.length > 0">
        <!-- Cart Items -->
        <div class="cart-page__items animate-fade-up delay-1">
          <div class="cart-page__item" v-for="item in cartStore.items" :key="item.id">
            <div class="cart-page__item-image" @click="$router.push(`/products/${item.product.id}`)">
              <img :src="item.product.image" :alt="item.product.name" />
            </div>
            <div class="cart-page__item-info">
              <h3 @click="$router.push(`/products/${item.product.id}`)">{{ item.product.name }}</h3>
              <div class="cart-page__item-price">¥{{ item.product.price }}</div>
            </div>
            <div class="cart-page__item-quantity">
              <button @click="updateQty(item, item.quantity - 1)" :disabled="item.quantity <= 1">−</button>
              <span>{{ item.quantity }}</span>
              <button @click="updateQty(item, item.quantity + 1)" :disabled="item.quantity >= item.product.stock">+</button>
            </div>
            <div class="cart-page__item-total">
              ¥{{ (item.product.price * item.quantity).toFixed(2) }}
            </div>
            <button class="cart-page__item-remove" @click="removeItem(item.id)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- Summary -->
        <div class="cart-page__summary animate-fade-up delay-2">
          <h3>订单摘要</h3>
          <div class="cart-page__summary-row">
            <span>商品数量</span>
            <span>{{ cartStore.count }} 件</span>
          </div>
          <div class="cart-page__summary-row">
            <span>商品总价</span>
            <span>¥{{ cartStore.total.toFixed(2) }}</span>
          </div>
          <div class="cart-page__summary-row">
            <span>运费</span>
            <span class="cart-page__free">免运费</span>
          </div>
          <div class="cart-page__summary-divider"></div>
          <div class="cart-page__summary-row cart-page__summary-row--total">
            <span>合计</span>
            <span>¥{{ cartStore.total.toFixed(2) }}</span>
          </div>
          <button class="cart-page__checkout-btn" @click="$router.push('/checkout')">
            去结算
          </button>
          <button class="cart-page__clear-btn" @click="clearCart">清空购物车</button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="cart-page__loading">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- Empty State -->
      <div v-else-if="cartStore.items.length === 0" class="cart-page__empty animate-fade-up">
        <div class="cart-page__empty-icon">🛒</div>
        <h3>购物车是空的</h3>
        <p>去挑选一些美味的蛋糕吧</p>
        <router-link to="/products" class="cart-page__empty-btn">浏览商品</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()
const loading = ref(true)

onMounted(async () => {
  await cartStore.fetchCart()
  loading.value = false
})

const updateQty = async (item: any, qty: number) => {
  const old = item.quantity
  item.quantity = qty
  try {
    await cartStore.updateQuantity(item.id, qty)
  } catch {
    item.quantity = old
  }
}

const removeItem = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定删除该商品？', '提示', { type: 'warning' })
    await cartStore.removeItem(id)
    ElMessage.success('已删除')
  } catch {}
}

const clearCart = async () => {
  try {
    await ElMessageBox.confirm('确定清空购物车？', '提示', { type: 'warning' })
    await cartStore.clearCart()
    ElMessage.success('已清空')
  } catch {}
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;
$cream: #faf8f5;

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: $gold;
  margin-bottom: 8px;

  &::before {
    content: '';
    width: 24px;
    height: 1px;
    background: $gold;
  }
}

.cart-page {
  padding: 60px 0 100px;

  &__header {
    margin-bottom: 40px;
  }

  &__title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 600;
    color: $navy;
  }

  &__loading {
    background: #fff; border-radius: 20px; padding: 32px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.06);
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 40px;
    align-items: start;
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 1px;
    background: #f0ece6;
    border-radius: 16px;
    overflow: hidden;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    background: #fff;

    &-image {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      cursor: pointer;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      &:hover img { transform: scale(1.05); }
    }

    &-info {
      flex: 1;
      min-width: 0;

      h3 {
        font-size: 15px;
        font-weight: 600;
        color: $navy;
        cursor: pointer;
        margin-bottom: 4px;

        &:hover { color: $gold; }
      }

      .cart-page__item-price {
        font-size: 14px;
        color: #9a9a9a;
      }
    }

    &-quantity {
      display: flex;
      align-items: center;
      border: 1px solid #e8e4de;
      border-radius: 8px;
      overflow: hidden;

      button {
        width: 32px;
        height: 32px;
        background: #fff;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: $navy;

        &:hover:not(:disabled) { background: #f5f3f0; }
        &:disabled { opacity: 0.3; }
      }

      span {
        width: 40px;
        text-align: center;
        font-size: 14px;
        font-weight: 600;
      }
    }

    &-total {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 700;
      color: $navy;
      min-width: 80px;
      text-align: right;
    }

    &-remove {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: none;
      background: none;
      color: #c0c0c0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      &:hover {
        background: #f8e8e8;
        color: #c45b5b;
      }
    }
  }

  &__summary {
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 20px;
    padding: 28px;
    position: sticky;
    top: 100px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: $navy;
      margin-bottom: 24px;
    }

    &-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 14px;
      font-size: 14px;
      color: #6b6b6b;

      &--total {
        font-size: 18px;
        font-weight: 700;
        color: $navy;
        margin-bottom: 24px;

        span:last-child {
          font-family: 'Playfair Display', serif;
          font-size: 24px;
        }
      }
    }

    &-divider {
      height: 1px;
      background: #f0ece6;
      margin: 16px 0;
    }
  }

  &__free {
    color: #5b9e6f;
    font-weight: 500;
  }

  &__checkout-btn {
    width: 100%;
    padding: 14px;
    background: $navy;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Outfit', sans-serif;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba($navy, 0.2);
    }
  }

  &__clear-btn {
    width: 100%;
    padding: 10px;
    background: none;
    border: none;
    color: #9a9a9a;
    font-size: 13px;
    cursor: pointer;
    margin-top: 8px;
    font-family: 'Outfit', sans-serif;

    &:hover { color: #c45b5b; }
  }

  &__empty {
    text-align: center;
    padding: 80px 0;

    &-icon { font-size: 64px; margin-bottom: 16px; }

    h3 {
      font-size: 20px;
      color: $navy;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #9a9a9a;
      margin-bottom: 24px;
    }

    &-btn {
      display: inline-flex;
      padding: 12px 28px;
      background: $navy;
      color: #fff;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba($navy, 0.2);
      }
    }
  }
}

@media (max-width: 768px) {
  .cart-page__layout {
    grid-template-columns: 1fr;
  }

  .cart-page__summary {
    position: static;
  }
}
</style>
