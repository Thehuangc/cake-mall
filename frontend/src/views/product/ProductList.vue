<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="products-page__hero">
      <div class="products-page__hero-content">
        <span class="section-label">Collection</span>
        <h1 class="products-page__title">{{ currentCategory || '全部商品' }}</h1>
        <p class="products-page__subtitle">精心甄选每一款作品，只为给您最纯粹的味觉体验</p>
      </div>
    </div>

    <div class="container">
      <!-- Filters -->
      <div class="products-page__filters animate-fade-up">
        <div class="products-page__filter-left">
          <div class="filter-tabs">
            <button
              class="filter-tab"
              :class="{ active: !selectedCategory }"
              @click="selectCategory('')"
            >全部</button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              class="filter-tab"
              :class="{ active: selectedCategory === cat.id }"
              @click="selectCategory(cat.id)"
            >
              {{ cat.icon }} {{ cat.name }}
            </button>
          </div>
        </div>
        <div class="products-page__filter-right">
          <select v-model="sortBy" class="sort-select" @change="fetchProducts">
            <option value="">默认排序</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="sales">销量优先</option>
            <option value="newest">最新上架</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div class="products-page__grid" v-loading="loading">
        <div
          v-for="(product, i) in products"
          :key="product.id"
          class="product-card animate-fade-up"
          :class="`delay-${(i % 8) + 1}`"
          @click="$router.push(`/products/${product.id}`)"
        >
          <div class="product-card__image">
            <img :src="product.image" :alt="product.name" loading="lazy" />
            <div class="product-card__overlay">
              <button class="product-card__quick" @click.stop="$router.push(`/products/${product.id}`)">
                查看详情
              </button>
            </div>
            <span v-if="product.original_price" class="product-card__badge">
              -{{ Math.round((1 - product.price / product.original_price) * 100) }}%
            </span>
          </div>
          <div class="product-card__body">
            <div class="product-card__meta">
              <span class="product-card__category">{{ product.category?.name }}</span>
              <span class="product-card__rating">★ 4.9</span>
            </div>
            <h3 class="product-card__name">{{ product.name }}</h3>
            <p class="product-card__desc">{{ product.description }}</p>
            <div class="product-card__footer">
              <div class="product-card__price">
                <span class="product-card__price-current">¥{{ product.price }}</span>
                <span v-if="product.original_price" class="product-card__price-original">¥{{ product.original_price }}</span>
              </div>
              <button class="product-card__cart" @click.stop="addToCart(product)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!loading && products.length === 0" class="products-page__empty">
        <div class="products-page__empty-icon">🎂</div>
        <h3>暂无商品</h3>
        <p>该分类下暂时没有商品</p>
      </div>

      <!-- Pagination -->
      <div v-if="total > 0" class="products-page__pagination">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="total"
          layout="prev, pager, next"
          @current-change="fetchProducts"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { productApi } from '@/api/product'
import { categoryApi } from '@/api/category'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { useReveal } from '@/composables/useReveal'
import { ElMessage } from 'element-plus'

useReveal()

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)
const selectedCategory = ref<number | ''>('')
const sortBy = ref('')
const keyword = ref('')

const currentCategory = computed(() => {
  if (!selectedCategory.value) return ''
  const cat = categories.value.find(c => c.id === selectedCategory.value)
  return cat?.name || ''
})

onMounted(async () => {
  if (route.query.category) selectedCategory.value = Number(route.query.category)
  if (route.query.keyword) keyword.value = route.query.keyword as string
  if (route.query.sort) sortBy.value = route.query.sort as string

  try {
    const res = await categoryApi.getAll()
    categories.value = (res as any[]) || []
  } catch (e) { console.error(e) }

  await fetchProducts()
})

const fetchProducts = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, limit: pageSize.value }
    if (selectedCategory.value) params.category_id = selectedCategory.value
    if (sortBy.value) params.sort = sortBy.value
    if (keyword.value) params.keyword = keyword.value

    const res: any = await productApi.getList(params)
    products.value = res.items || []
    total.value = res.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const selectCategory = (id: number | '') => {
  selectedCategory.value = id
  currentPage.value = 1
  fetchProducts()
}

const addToCart = async (product: any) => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  try {
    await cartStore.addItem(product.id, 1)
    ElMessage.success('已加入购物车')
  } catch (e) { console.error(e) }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;
$cream: #faf8f5;

.container {
  max-width: 1280px;
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
  margin-bottom: 12px;

  &::before {
    content: '';
    width: 24px;
    height: 1px;
    background: $gold;
  }
}

.products-page {
  &__hero {
    padding: 80px 0 60px;
    background: $cream;
    text-align: center;
    border-bottom: 1px solid #f0ece6;
  }

  &__title {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 42px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 12px;
  }

  &__subtitle {
    font-size: 15px;
    color: #9a9a9a;
  }

  &__filters {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 0;
    gap: 24px;
    flex-wrap: wrap;
  }

  &__filter-left {
    flex: 1;
    overflow-x: auto;
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
    min-height: 400px;
  }

  &__empty {
    text-align: center;
    padding: 80px 0;

    &-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 20px;
      color: $navy;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #9a9a9a;
    }
  }

  &__pagination {
    display: flex;
    justify-content: center;
    padding: 48px 0;

    :deep(.el-pagination) {
      --el-pagination-hover-color: #{$gold};

      .is-active {
        background: $gold !important;
      }
    }
  }
}

.filter-tabs {
  display: flex;
  gap: 8px;
  padding-bottom: 4px;
}

.filter-tab {
  padding: 8px 18px;
  background: #fff;
  border: 1px solid #e8e4de;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 500;
  color: #6b6b6b;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.25s ease;
  font-family: 'Outfit', sans-serif;

  &:hover {
    border-color: $gold;
    color: $gold;
  }

  &.active {
    background: $navy;
    border-color: $navy;
    color: #fff;
  }
}

.sort-select {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e8e4de;
  border-radius: 8px;
  font-size: 13px;
  font-family: 'Outfit', sans-serif;
  color: #6b6b6b;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: $gold;
  }
}

.product-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f0ece6;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 48px rgba($navy, 0.1);
    border-color: transparent;

    .product-card__overlay { opacity: 1; }
    .product-card__image img { transform: scale(1.06); }
    .product-card__cart {
      background: $navy;
      color: #fff;
      box-shadow: 0 4px 12px rgba($navy, 0.2);
    }
  }

  &__image {
    position: relative;
    aspect-ratio: 1;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba($navy, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &__quick {
    padding: 10px 24px;
    background: rgba(255, 255, 255, 0.95);
    color: $navy;
    border: none;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transform: translateY(8px);
    transition: all 0.3s ease;
    font-family: 'Outfit', sans-serif;

    .product-card:hover & { transform: translateY(0); }
  }

  &__badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 10px;
    background: #c45b5b;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
  }

  &__body { padding: 20px; }

  &__meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
    color: #9a9a9a;
  }

  &__category {
    background: #f5f3f0;
    padding: 2px 8px;
    border-radius: 4px;
  }

  &__rating { color: $gold; }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 6px;
  }

  &__desc {
    font-size: 13px;
    color: #9a9a9a;
    line-height: 1.5;
    margin-bottom: 16px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__price {
    &-current {
      font-size: 20px;
      font-weight: 700;
      color: $navy;
      font-family: 'Playfair Display', serif;
    }
    &-original {
      font-size: 13px;
      color: #c0c0c0;
      text-decoration: line-through;
      margin-left: 8px;
    }
  }

  &__cart {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    border: 1px solid #e8e4de;
    background: #fff;
    color: #6b6b6b;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }
}

@media (max-width: 1024px) {
  .products-page__grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .products-page__grid { grid-template-columns: repeat(2, 1fr); }
  .products-page__title { font-size: 32px; }
}

@media (max-width: 480px) {
  .products-page__grid { grid-template-columns: 1fr; }
}
</style>
