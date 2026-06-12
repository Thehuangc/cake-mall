<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero__bg">
        <div class="hero__grain"></div>
      </div>
      <div class="hero__content">
        <div class="hero__text">
          <div class="hero__label animate-fade-up">
            <span class="hero__label-line"></span>
            Pâtisserie Artisanale
          </div>
          <h1 class="hero__title animate-fade-up delay-1">
            每一口，<br />
            <em>都是艺术</em>
          </h1>
          <p class="hero__desc animate-fade-up delay-2">
            甄选全球优质原料，以法式匠心工艺<br />
            为您呈现味蕾与视觉的双重盛宴
          </p>
          <div class="hero__actions animate-fade-up delay-3">
            <router-link to="/products" class="hero__btn hero__btn--primary">
              <span>探索全部作品</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </router-link>
            <router-link to="/products?sort=newest" class="hero__btn hero__btn--ghost">
              新品鉴赏
            </router-link>
          </div>
        </div>
        <div class="hero__visual animate-fade-up delay-2">
          <div class="hero__image-wrapper">
            <img
              src="https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=640&h=640&fit=crop&q=80"
              alt="精品蛋糕"
              class="hero__image"
            />
            <div class="hero__image-badge">
              <span class="hero__badge-num">100%</span>
              <span class="hero__badge-text">手工制作</span>
            </div>
          </div>
          <div class="hero__float hero__float--1">🎂</div>
          <div class="hero__float hero__float--2">✨</div>
          <div class="hero__float hero__float--3">🍓</div>
        </div>
      </div>
      <div class="hero__scroll animate-fade-up delay-4">
        <div class="hero__scroll-line"></div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories reveal">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Collection</span>
          <h2 class="section-title">探索我们的系列</h2>
          <p class="section-desc">每一款蛋糕，都承载着独特的风味故事</p>
        </div>
        <div class="categories__grid">
          <router-link
            v-for="(cat, i) in categories"
            :key="cat.id"
            :to="{ path: '/products', query: { category: cat.id } }"
            class="categories__card reveal-scale"
            :style="{ transitionDelay: `${i * 0.06}s` }"
          >
            <div class="categories__icon">{{ cat.icon }}</div>
            <h3 class="categories__name">{{ cat.name }}</h3>
            <span class="categories__arrow">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M5 10h10M11 6l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Featured Products -->
    <section class="featured reveal">
      <div class="container">
        <div class="featured__header">
          <div>
            <span class="section-label">Best Sellers</span>
            <h2 class="section-title">人气之选</h2>
          </div>
          <router-link to="/products" class="featured__more">
            查看全部
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </router-link>
        </div>
        <div class="featured__grid">
          <div
            v-for="(product, i) in hotProducts"
            :key="product.id"
            class="product-card reveal-scale"
            :style="{ transitionDelay: `${i * 0.08}s` }"
            @click="$router.push(`/products/${product.id}`)"
          >
            <div class="product-card__image">
              <img :src="product.image" :alt="product.name" loading="lazy" @error="handleImgError" />
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
                <span class="product-card__sales">已售 {{ product.sales }}</span>
                <span class="product-card__rating">★ 4.9</span>
              </div>
              <h3 class="product-card__name">{{ product.name }}</h3>
              <p class="product-card__desc">{{ product.description }}</p>
              <div class="product-card__footer">
                <div class="product-card__price">
                  <span class="product-card__price-current">¥{{ product.price }}</span>
                  <span v-if="product.original_price" class="product-card__price-original">
                    ¥{{ product.original_price }}
                  </span>
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
      </div>
    </section>

    <!-- Banner / CTA -->
    <section class="cta reveal">
      <div class="cta__inner">
        <div class="cta__content">
          <span class="section-label" style="color: #c9a96e;">Artisan</span>
          <h2 class="cta__title">匠心工艺，<br /><em>只为这一刻</em></h2>
          <p class="cta__desc">
            从选材到成品，每一个环节都经过严格把控，<br />
            只为给您带来最纯粹的味觉体验。
          </p>
          <router-link to="/products" class="cta__btn">
            立即选购
          </router-link>
        </div>
      </div>
    </section>

    <!-- New Arrivals -->
    <section class="new-arrivals reveal">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Nouveautés</span>
          <h2 class="section-title">新品鉴赏</h2>
          <p class="section-desc">最新出炉的精致甜点，等您品鉴</p>
        </div>
        <div class="new-arrivals__grid">
          <div
            v-for="(product, i) in newProducts"
            :key="product.id"
            class="new-card reveal-left"
            :style="{ transitionDelay: `${i * 0.1}s` }"
            @click="$router.push(`/products/${product.id}`)"
          >
            <div class="new-card__image">
              <img :src="product.image" :alt="product.name" loading="lazy" @error="handleImgError" />
              <span class="new-card__tag">NEW</span>
            </div>
            <div class="new-card__body">
              <h3 class="new-card__name">{{ product.name }}</h3>
              <p class="new-card__desc">{{ product.description }}</p>
              <div class="new-card__bottom">
                <span class="new-card__price">¥{{ product.price }}</span>
                <span class="new-card__link">
                  了解更多
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features -->
    <section class="features reveal">
      <div class="container">
        <div class="features__grid">
          <div class="features__item" v-for="(f, i) in features" :key="i">
            <div class="features__icon">{{ f.icon }}</div>
            <h3 class="features__title">{{ f.title }}</h3>
            <p class="features__desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter -->
    <section class="newsletter reveal">
      <div class="container">
        <div class="newsletter__inner">
          <div class="newsletter__content">
            <span class="section-label">Newsletter</span>
            <h2 class="newsletter__title">订阅甜蜜资讯</h2>
            <p class="newsletter__desc">第一时间获取新品上市、限定款及专属优惠信息</p>
          </div>
          <div class="newsletter__form">
            <input
              v-model="email"
              type="email"
              placeholder="您的邮箱地址"
              class="newsletter__input"
            />
            <button class="newsletter__btn" @click="subscribe">订阅</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { productApi } from '@/api/product'
import { categoryApi } from '@/api/category'
import { useReveal } from '@/composables/useReveal'
import { ElMessage } from 'element-plus'

useReveal()

const router = useRouter()
const cartStore = useCartStore()
const userStore = useUserStore()

const email = ref('')
const categories = ref<any[]>([])
const hotProducts = ref<any[]>([])
const newProducts = ref<any[]>([])

const features = [
  { icon: '🎯', title: '匠心手作', desc: '每一款蛋糕均由资深甜点师精心制作' },
  { icon: '🌿', title: '甄选原料', desc: '全球优质食材，天然无添加' },
  { icon: '❄️', title: '冷链配送', desc: '全程冷链保鲜，确保完美呈现' },
  { icon: '💝', title: '专属定制', desc: '支持个性化定制，打造独一无二的甜蜜' },
]

onMounted(async () => {
  try {
    const [catRes, hotRes, newRes] = await Promise.all([
      categoryApi.getAll(),
      productApi.getHot(),
      productApi.getNew(),
    ])
    categories.value = (catRes as any[]) || []
    hotProducts.value = ((hotRes as any[]) || []).slice(0, 4)
    newProducts.value = ((newRes as any[]) || []).slice(0, 4)
  } catch (e) {
    console.error(e)
  }
})

const handleImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23f0ece6" width="400" height="400"/%3E%3Ctext x="200" y="200" text-anchor="middle" dominant-baseline="middle" font-size="48" fill="%23c9a96e"%3E🎂%3C/text%3E%3C/svg%3E'
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
  } catch (e) {
    console.error(e)
  }
}

const subscribe = () => {
  if (email.value) {
    ElMessage.success('感谢订阅！')
    email.value = ''
  }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;
$gold-light: #d4b97a;
$cream: #faf8f5;

.container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 48px;
}

.section-header {
  text-align: center;
  margin-bottom: 64px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: $gold;
  margin-bottom: 14px;

  &::before {
    content: '';
    width: 24px;
    height: 1px;
    background: $gold;
  }
}

.section-title {
  font-family: 'Playfair Display', 'Noto Serif SC', serif;
  font-size: 40px;
  font-weight: 600;
  color: $navy;
  margin-bottom: 14px;
  letter-spacing: -0.02em;
}

.section-desc {
  font-size: 15px;
  color: #9a9a9a;
  max-width: 480px;
  margin: 0 auto;
  line-height: 1.7;
}

// ─── Hero ──────────────────────────────────────
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: $cream;

  &__bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 80% 20%, rgba($gold, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 20% 80%, rgba($navy, 0.03) 0%, transparent 50%);
  }

  &__grain {
    position: absolute;
    inset: 0;
    opacity: 0.25;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
  }

  &__content {
    position: relative;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 48px;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 100px;
    align-items: center;
  }

  &__text {
    padding: 60px 0;
  }

  &__label {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: $gold;
    margin-bottom: 28px;

    &-line {
      width: 32px;
      height: 1px;
      background: $gold;
    }
  }

  &__title {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 72px;
    font-weight: 700;
    line-height: 1.1;
    color: $navy;
    margin-bottom: 28px;
    letter-spacing: -0.03em;

    em {
      font-style: italic;
      color: $gold;
    }
  }

  &__desc {
    font-size: 16px;
    line-height: 1.9;
    color: #7a7a7a;
    margin-bottom: 48px;
    max-width: 440px;
  }

  &__actions {
    display: flex;
    gap: 16px;
    align-items: center;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    letter-spacing: 0.02em;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

    &--primary {
      padding: 16px 36px;
      background: $navy;
      color: #fff;
      border-radius: 40px;
      box-shadow: 0 4px 16px rgba($navy, 0.15);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba($navy, 0.2);
      }

      svg { transition: transform 0.3s ease; }
      &:hover svg { transform: translateX(4px); }
    }

    &--ghost {
      padding: 16px 28px;
      color: $navy;
      border: 1px solid #ddd;
      border-radius: 40px;

      &:hover {
        border-color: $gold;
        color: $gold;
        background: rgba($gold, 0.03);
      }
    }
  }

  &__visual {
    position: relative;
    display: flex;
    justify-content: center;
    padding: 60px 0;
  }

  &__image-wrapper {
    position: relative;
    width: 440px;
    height: 440px;
    border-radius: 240px 240px 120px 120px;
    overflow: hidden;
    box-shadow: 0 40px 80px rgba($navy, 0.12);

    &::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
      pointer-events: none;
    }
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover { transform: scale(1.04); }
  }

  &__image-badge {
    position: absolute;
    bottom: 32px;
    right: -20px;
    background: #fff;
    padding: 18px 22px;
    border-radius: 18px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
    text-align: center;
    z-index: 2;
  }

  &__badge-num {
    display: block;
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: $navy;
    line-height: 1;
  }

  &__badge-text {
    display: block;
    font-size: 11px;
    color: $gold;
    margin-top: 4px;
    letter-spacing: 0.08em;
  }

  &__float {
    position: absolute;
    font-size: 28px;
    animation: float 7s ease-in-out infinite;
    z-index: 1;

    &--1 { top: 15%; right: 8%; animation-delay: 0s; }
    &--2 { bottom: 25%; left: 3%; animation-delay: 2s; }
    &--3 { top: 55%; right: 3%; animation-delay: 4s; }
  }

  &__scroll {
    position: absolute;
    bottom: 36px;
    left: 50%;
    transform: translateX(-50%);

    &-line {
      width: 1px;
      height: 56px;
      background: linear-gradient(to bottom, $gold, transparent);
      position: relative;

      &::after {
        content: '';
        position: absolute;
        top: 0;
        left: -2px;
        width: 5px;
        height: 14px;
        background: $gold;
        border-radius: 3px;
        animation: scrollDown 2.2s ease-in-out infinite;
      }
    }
  }
}

@keyframes scrollDown {
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(28px); opacity: 0; }
  51% { transform: translateY(0); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

// ─── Categories ────────────────────────────────
.categories {
  padding: 140px 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
  }

  &__card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 40px 20px;
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 20px;
    text-decoration: none;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, $gold, transparent);
      transform: scaleX(0);
      transform-origin: center;
      transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    }

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba($navy, 0.06);
      border-color: transparent;

      &::before { transform: scaleX(1); }
      .categories__arrow { opacity: 1; transform: translateX(0); }
    }
  }

  &__icon {
    font-size: 44px;
    line-height: 1;
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

    .categories__card:hover & { transform: scale(1.12); }
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: $navy;
  }

  &__arrow {
    color: $gold;
    opacity: 0;
    transform: translateX(-8px);
    transition: all 0.3s ease;
  }
}

// ─── Featured ──────────────────────────────────
.featured {
  padding: 0 0 140px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 48px;

    .section-header { text-align: left; margin-bottom: 0; }
  }

  &__more {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 14px;
    font-weight: 500;
    color: $gold;
    transition: gap 0.3s ease;
    &:hover { gap: 10px; }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

// ─── Product Card ──────────────────────────────
.product-card {
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f0ece6;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 24px 56px rgba($navy, 0.08);
    border-color: transparent;

    .product-card__overlay { opacity: 1; }
    .product-card__image img { transform: scale(1.06); }
    .product-card__cart {
      background: $navy;
      color: #fff;
      box-shadow: 0 4px 12px rgba($navy, 0.15);
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
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background: rgba($navy, 0.25);
    backdrop-filter: blur(2px);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.4s ease;
  }

  &__quick {
    padding: 12px 28px;
    background: rgba(255, 255, 255, 0.95);
    color: $navy;
    border: none;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transform: translateY(10px);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    font-family: 'Outfit', sans-serif;

    .product-card:hover & { transform: translateY(0); }
  }

  &__badge {
    position: absolute;
    top: 14px;
    left: 14px;
    padding: 5px 12px;
    background: $navy;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    border-radius: 8px;
    letter-spacing: 0.02em;
  }

  &__body { padding: 22px; }

  &__meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    font-size: 12px;
    color: #aaa;
  }

  &__rating { color: $gold; }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 6px;
    transition: color 0.3s;
    .product-card:hover & { color: $gold; }
  }

  &__desc {
    font-size: 13px;
    color: #aaa;
    line-height: 1.6;
    margin-bottom: 18px;
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
      font-size: 22px;
      font-weight: 700;
      color: $navy;
      font-family: 'Playfair Display', serif;
    }
    &-original {
      font-size: 13px;
      color: #ccc;
      text-decoration: line-through;
      margin-left: 8px;
    }
  }

  &__cart {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid #eee;
    background: #fff;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }
}

// ─── CTA ───────────────────────────────────────
.cta {
  padding: 140px 0;
  background: $navy;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -15%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba($gold, 0.08) 0%, transparent 70%);
    border-radius: 50%;
  }

  &__inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 48px;
    text-align: center;
    position: relative;
  }

  &__title {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 52px;
    font-weight: 700;
    color: #fff;
    margin-bottom: 20px;
    letter-spacing: -0.02em;

    em { font-style: italic; color: $gold; }
  }

  &__desc {
    font-size: 16px;
    line-height: 1.9;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 48px;
  }

  &__btn {
    display: inline-flex;
    padding: 18px 48px;
    background: linear-gradient(135deg, $gold, $gold-light);
    color: $navy;
    font-size: 14px;
    font-weight: 600;
    border-radius: 40px;
    letter-spacing: 0.05em;
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    box-shadow: 0 4px 16px rgba($gold, 0.25);

    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 32px rgba($gold, 0.35);
    }
  }
}

// ─── New Arrivals ──────────────────────────────
.new-arrivals {
  padding: 140px 0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

.new-card {
  display: flex;
  background: #fff;
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid #f0ece6;
  cursor: pointer;
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 48px rgba($navy, 0.07);
    border-color: transparent;

    .new-card__image img { transform: scale(1.04); }
  }

  &__image {
    width: 240px;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }
  }

  &__tag {
    position: absolute;
    top: 16px;
    left: 16px;
    padding: 6px 14px;
    background: $navy;
    color: $gold;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    border-radius: 8px;
  }

  &__body {
    flex: 1;
    padding: 32px;
    display: flex;
    flex-direction: column;
  }

  &__name {
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  &__desc {
    font-size: 14px;
    color: #aaa;
    line-height: 1.8;
    flex: 1;
    margin-bottom: 24px;
  }

  &__bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__price {
    font-family: 'Playfair Display', serif;
    font-size: 26px;
    font-weight: 700;
    color: $navy;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-weight: 500;
    color: $gold;
    transition: gap 0.3s ease;
    &:hover { gap: 8px; }
  }
}

// ─── Features ──────────────────────────────────
.features {
  padding: 120px 0;
  background: #f5f3f0;

  &__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 48px;
  }

  &__item { text-align: center; }

  &__icon {
    font-size: 40px;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 10px;
  }

  &__desc {
    font-size: 14px;
    color: #aaa;
    line-height: 1.7;
  }
}

// ─── Newsletter ────────────────────────────────
.newsletter {
  padding: 120px 0;

  &__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 72px 72px;
    background: $navy;
    border-radius: 28px;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -25%;
      right: -8%;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba($gold, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }
  }

  &__content {
    position: relative;
    .section-label { color: $gold; &::before { background: $gold; } }
  }

  &__title {
    font-family: 'Playfair Display', 'Noto Serif SC', serif;
    font-size: 30px;
    font-weight: 600;
    color: #fff;
    margin: 10px 0;
  }

  &__desc {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.45);
    line-height: 1.7;
  }

  &__form {
    display: flex;
    gap: 12px;
    position: relative;
  }

  &__input {
    width: 300px;
    padding: 16px 24px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    color: #fff;
    font-size: 14px;
    font-family: 'Outfit', sans-serif;
    outline: none;
    transition: all 0.3s ease;

    &::placeholder { color: rgba(255, 255, 255, 0.3); }
    &:focus { border-color: $gold; background: rgba(255, 255, 255, 0.1); }
  }

  &__btn {
    padding: 16px 32px;
    background: linear-gradient(135deg, $gold, $gold-light);
    color: $navy;
    border: none;
    border-radius: 14px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Outfit', sans-serif;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba($gold, 0.3);
    }
  }
}

// ─── Responsive ────────────────────────────────
@media (max-width: 1024px) {
  .hero {
    &__content { grid-template-columns: 1fr; gap: 48px; text-align: center; }
    &__title { font-size: 52px; }
    &__actions { justify-content: center; }
    &__desc { margin: 0 auto 40px; }
    &__image-wrapper { width: 340px; height: 340px; }
    &__label { justify-content: center; }
  }

  .categories__grid { grid-template-columns: repeat(3, 1fr); }
  .featured__grid { grid-template-columns: repeat(2, 1fr); }
  .new-arrivals__grid { grid-template-columns: 1fr; }
  .features__grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .container { padding: 0 24px; }
  .hero {
    &__title { font-size: 38px; }
    &__image-wrapper { width: 280px; height: 280px; }
    &__content { padding: 0 24px; }
  }
  .categories__grid { grid-template-columns: repeat(2, 1fr); }
  .featured__grid { grid-template-columns: 1fr; }
  .section-title { font-size: 30px; }
  .cta__title { font-size: 34px; }
  .newsletter__inner {
    flex-direction: column;
    text-align: center;
    gap: 32px;
    padding: 48px 28px;
  }
  .newsletter__form { width: 100%; }
  .newsletter__input { flex: 1; width: auto; }
}
</style>
