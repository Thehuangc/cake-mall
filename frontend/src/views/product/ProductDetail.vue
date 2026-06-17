<template>
  <div class="detail-page" v-loading="loading">
    <div class="container" v-if="product">
      <!-- Breadcrumb -->
      <nav class="detail-page__breadcrumb animate-fade">
        <router-link to="/">首页</router-link>
        <span>/</span>
        <router-link to="/products">全部商品</router-link>
        <span>/</span>
        <span class="current">{{ product.name }}</span>
      </nav>

      <!-- Product Main -->
      <div class="detail-page__main animate-fade-up">
        <!-- Gallery -->
        <div class="detail-page__gallery">
          <div class="detail-page__image-main">
            <img :src="currentImage" :alt="product.name" />
            <div v-if="product.stock === 0" class="detail-page__sold-out">已售罄</div>
            <span v-if="product.original_price" class="detail-page__badge">
              省 ¥{{ (product.original_price - product.price).toFixed(0) }}
            </span>
          </div>
          <div class="detail-page__thumbs" v-if="product.images?.length > 1">
            <button
              v-for="(img, i) in product.images"
              :key="i"
              class="detail-page__thumb"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <img :src="img" :alt="`${product.name} ${i + 1}`" />
            </button>
          </div>
        </div>

        <!-- Info -->
        <div class="detail-page__info">
          <div class="detail-page__category" v-if="product.category">
            {{ product.category.icon }} {{ product.category.name }}
          </div>
          <h1 class="detail-page__name">{{ product.name }}</h1>
          <p class="detail-page__desc">{{ product.description }}</p>

          <!-- Price -->
          <div class="detail-page__price-block">
            <div class="detail-page__price-row">
              <span class="detail-page__price-label">价格</span>
              <span class="detail-page__price">¥{{ product.price }}</span>
              <span v-if="product.original_price" class="detail-page__price-original">
                ¥{{ product.original_price }}
              </span>
              <span v-if="product.original_price" class="detail-page__discount">
                {{ Math.round((1 - product.price / product.original_price) * 100) }}% OFF
              </span>
            </div>
          </div>

          <!-- Meta -->
          <div class="detail-page__meta">
            <div class="detail-page__meta-item">
              <span class="detail-page__meta-label">销量</span>
              <span class="detail-page__meta-value">{{ product.sales }} 件</span>
            </div>
            <div class="detail-page__meta-item">
              <span class="detail-page__meta-label">库存</span>
              <span class="detail-page__meta-value" :class="{ low: product.stock < 10 }">
                {{ product.stock }} 件{{ product.stock < 10 ? ' · 库存紧张' : '' }}
              </span>
            </div>
          </div>

          <!-- Quantity -->
          <div class="detail-page__quantity">
            <span class="detail-page__quantity-label">数量</span>
            <div class="detail-page__quantity-control">
              <button @click="quantity = Math.max(1, quantity - 1)" :disabled="quantity <= 1">−</button>
              <span>{{ quantity }}</span>
              <button @click="quantity = Math.min(product.stock, quantity + 1)" :disabled="quantity >= product.stock">+</button>
            </div>
          </div>

          <!-- Actions -->
          <div class="detail-page__actions">
            <button class="detail-page__btn-cart" @click="addToCart" :disabled="product.stock === 0 || addingToCart">
              <svg v-if="!addingToCart" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span v-if="addingToCart" class="detail-page__btn-spinner"></span>
              {{ addingToCart ? '添加中...' : '加入购物车' }}
            </button>
            <button class="detail-page__btn-buy" @click="buyNow" :disabled="product.stock === 0">
              立即购买
            </button>
          </div>

          <!-- Guarantees -->
          <div class="detail-page__guarantees">
            <div class="detail-page__guarantee">
              <span>✓</span> 正品保证
            </div>
            <div class="detail-page__guarantee">
              <span>✓</span> 新鲜直达
            </div>
            <div class="detail-page__guarantee">
              <span>✓</span> 售后无忧
            </div>
          </div>
        </div>
      </div>

      <!-- Description Tab -->
      <div class="detail-page__extra animate-fade-up">
        <div class="detail-page__tabs">
          <button
            class="detail-page__tab"
            :class="{ active: activeTab === 'detail' }"
            @click="activeTab = 'detail'"
          >商品详情</button>
          <button
            class="detail-page__tab"
            :class="{ active: activeTab === 'reviews' }"
            @click="activeTab = 'reviews'"
          >用户评价</button>
        </div>
        <div class="detail-page__tab-content">
          <div v-if="activeTab === 'detail'" class="detail-page__detail-text">
            <p>{{ product.description }}</p>
          </div>
          <div v-else class="detail-page__reviews">
            <div class="detail-page__empty-reviews">
              <span>💬</span>
              <p>暂无评价</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add to cart success toast -->
    <transition name="slide-down">
      <div v-if="showCartSuccess" class="detail-page__toast">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M4 10l4 4 8-8" stroke="#5b9e6f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>已加入购物车</span>
        <router-link to="/cart" class="detail-page__toast-link">去结算 →</router-link>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const product = ref<any>(null)
const loading = ref(false)
const quantity = ref(1)
const currentImage = ref('')
const activeTab = ref('detail')
const addingToCart = ref(false)
const showCartSuccess = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const res = await productApi.getById(Number(route.params.id))
    product.value = res
    currentImage.value = (res as any).image
  } catch (e) {
    ElMessage.error('商品不存在')
    router.push('/products')
  } finally {
    loading.value = false
  }
})

const addToCart = async () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  addingToCart.value = true
  try {
    await cartStore.addItem(product.value.id, quantity.value)
    showCartSuccess.value = true
    setTimeout(() => { showCartSuccess.value = false }, 1800)
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '添加失败')
  } finally { addingToCart.value = false }
}

const buyNow = async () => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await cartStore.addItem(product.value.id, quantity.value)
    router.push('/checkout')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '购买失败')
  }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;
$cream: #faf8f5;

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px;
}

.detail-page {
  padding: 24px 0 80px;

  &__breadcrumb {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: #9a9a9a;
    margin-bottom: 32px;

    a {
      color: #6b6b6b;
      text-decoration: none;
      transition: color 0.2s;

      &:hover { color: $gold; }
    }

    .current { color: $navy; font-weight: 500; }
  }

  &__main {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    margin-bottom: 80px;
  }

  // Gallery
  &__gallery {
    position: sticky;
    top: 100px;
    align-self: start;
  }

  &__image-main {
    position: relative;
    aspect-ratio: 1;
    border-radius: 24px;
    overflow: hidden;
    margin-bottom: 16px;
    background: #f5f3f0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s ease;
    }

    &:hover img { transform: scale(1.03); }
  }

  &__sold-out {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) rotate(-15deg);
    padding: 10px 32px;
    background: rgba(#c45b5b, 0.9);
    color: #fff;
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 0.1em;
    border-radius: 8px;
    z-index: 2;
  }

  &__badge {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 6px 14px;
    background: #c45b5b;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    border-radius: 8px;
  }

  &__thumbs {
    display: flex;
    gap: 12px;
  }

  &__thumb {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    overflow: hidden;
    border: 2px solid transparent;
    cursor: pointer;
    padding: 0;
    background: none;
    transition: all 0.2s ease;

    &.active {
      border-color: $gold;
    }

    &:hover { border-color: $gold; }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  // Info
  &__category {
    font-size: 13px;
    color: $gold;
    font-weight: 500;
    margin-bottom: 12px;
  }

  &__name {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 32px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 16px;
    line-height: 1.3;
  }

  &__desc {
    font-size: 15px;
    color: #6b6b6b;
    line-height: 1.7;
    margin-bottom: 28px;
  }

  &__price-block {
    background: #f5f3f0;
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 28px;
  }

  &__price-row {
    display: flex;
    align-items: baseline;
    gap: 12px;
  }

  &__price-label {
    font-size: 13px;
    color: #9a9a9a;
  }

  &__price {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 700;
    color: $navy;
  }

  &__price-original {
    font-size: 16px;
    color: #c0c0c0;
    text-decoration: line-through;
  }

  &__discount {
    padding: 3px 8px;
    background: rgba(#c45b5b, 0.1);
    color: #c45b5b;
    font-size: 12px;
    font-weight: 600;
    border-radius: 4px;
  }

  &__meta {
    display: flex;
    gap: 32px;
    margin-bottom: 28px;
    padding-bottom: 28px;
    border-bottom: 1px solid #f0ece6;
  }

  &__meta-item {
    display: flex;
    gap: 8px;
  }

  &__meta-label {
    font-size: 13px;
    color: #9a9a9a;
  }

  &__meta-value {
    font-size: 13px;
    font-weight: 500;
    color: $navy;

    &.low { color: #c45b5b; }
  }

  &__quantity {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 32px;
  }

  &__quantity-label {
    font-size: 14px;
    color: #6b6b6b;
  }

  &__quantity-control {
    display: flex;
    align-items: center;
    border: 1px solid #e8e4de;
    border-radius: 10px;
    overflow: hidden;

    button {
      width: 40px;
      height: 40px;
      background: #fff;
      border: none;
      font-size: 18px;
      color: $navy;
      cursor: pointer;
      transition: background 0.2s;

      &:hover:not(:disabled) { background: #f5f3f0; }
      &:disabled { opacity: 0.3; cursor: not-allowed; }
    }

    span {
      width: 48px;
      text-align: center;
      font-size: 15px;
      font-weight: 600;
      color: $navy;
    }
  }

  &__actions {
    display: flex;
    gap: 12px;
    margin-bottom: 28px;
  }

  &__btn-cart, &__btn-buy {
    flex: 1;
    padding: 14px 24px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-family: 'Outfit', sans-serif;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__btn-cart {
    background: #fff;
    border: 2px solid $navy;
    color: $navy;

    &-spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba($navy, 0.3);
      border-top-color: $navy;
      border-radius: 50%;
      animation: pd-spin 0.6s linear infinite;
    }

    &:hover:not(:disabled) {
      background: $navy;
      color: #fff;
    }
  }

  &__btn-buy {
    background: $navy;
    border: 2px solid $navy;
    color: #fff;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba($navy, 0.2);
    }
  }

  &__guarantees {
    display: flex;
    gap: 24px;
  }

  &__guarantee {
    font-size: 13px;
    color: #6b6b6b;

    span {
      color: #5b9e6f;
      margin-right: 4px;
    }
  }

  // Tabs
  &__extra {
    border-top: 1px solid #f0ece6;
    padding-top: 48px;
  }

  &__tabs {
    display: flex;
    gap: 4px;
    margin-bottom: 32px;
    border-bottom: 1px solid #f0ece6;
  }

  &__tab {
    padding: 12px 24px;
    background: none;
    border: none;
    font-size: 15px;
    font-weight: 500;
    color: #9a9a9a;
    cursor: pointer;
    position: relative;
    transition: color 0.2s;
    font-family: 'Outfit', sans-serif;

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: $gold;
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    &.active {
      color: $navy;
      font-weight: 600;

      &::after { transform: scaleX(1); }
    }

    &:hover { color: $navy; }
  }

  &__tab-content {
    padding: 0 0 40px;
  }

  &__detail-text {
    font-size: 15px;
    line-height: 1.8;
    color: #6b6b6b;
  }

  &__empty-reviews {
    text-align: center;
    padding: 48px 0;

    span { font-size: 40px; display: block; margin-bottom: 12px; }
    p { font-size: 14px; color: #9a9a9a; }
  }

  // Toast notification
  &__toast {
    position: fixed;
    top: 88px;
    right: 32px;
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 14px;
    padding: 16px 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    font-size: 14px;
    font-weight: 500;
    color: $navy;
  }

  &__toast-link {
    color: $gold;
    font-weight: 600;
    font-size: 13px;
    transition: opacity 0.2s;
    &:hover { opacity: 0.7; }
  }
}

@keyframes pd-spin { to { transform: rotate(360deg); } }

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-16px);
}
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 768px) {
  .detail-page {
    &__main {
      grid-template-columns: 1fr;
      gap: 32px;
    }

    &__gallery { position: static; }
    &__name { font-size: 24px; }
    &__price { font-size: 28px; }
  }
}
</style>
