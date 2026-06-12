<template>
  <div class="layout">
    <!-- Header -->
    <header class="header" :class="{ scrolled: isScrolled, hidden: isHidden }">
      <div class="header__inner">
        <!-- Logo -->
        <router-link to="/" class="header__logo">
          <span class="header__logo-icon">🎂</span>
          <div class="header__logo-text">
            <span class="header__logo-brand">L'Atelier</span>
            <span class="header__logo-sub">du Gâteau</span>
          </div>
        </router-link>

        <!-- Navigation -->
        <nav class="header__nav">
          <router-link to="/" class="header__nav-link" :class="{ active: $route.path === '/' }">
            首页
          </router-link>
          <router-link to="/products" class="header__nav-link" :class="{ active: $route.path.startsWith('/products') }">
            全部商品
          </router-link>
          <router-link
            v-if="userStore.user?.role === 'admin'"
            to="/admin/dashboard"
            class="header__nav-link header__nav-admin"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            后台管理
          </router-link>
        </nav>

        <!-- Search -->
        <div class="header__search" :class="{ expanded: searchExpanded }">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索蛋糕..."
            class="header__search-input"
            @focus="searchExpanded = true"
            @blur="searchExpanded = false"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </div>

        <!-- Actions -->
        <div class="header__actions">
          <router-link to="/cart" class="header__action-btn">
            <el-badge :value="cartStore.count" :hidden="cartStore.count === 0" :max="99">
              <el-icon :size="20"><ShoppingCart /></el-icon>
            </el-badge>
          </router-link>

          <template v-if="userStore.isAuthenticated">
            <el-dropdown trigger="click" @command="handleUserCommand">
              <div class="header__user">
                <div class="header__avatar">
                  {{ userStore.user?.username?.charAt(0)?.toUpperCase() }}
                </div>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="profile">
                    <el-icon><User /></el-icon>个人中心
                  </el-dropdown-item>
                  <el-dropdown-item command="orders">
                    <el-icon><List /></el-icon>我的订单
                  </el-dropdown-item>
                  <el-dropdown-item divided command="logout">
                    <el-icon><SwitchButton /></el-icon>退出登录
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          <template v-else>
            <router-link to="/login" class="header__login-btn">登录</router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <div class="footer__logo">
            <span class="footer__logo-icon">🎂</span>
            <div>
              <div class="footer__logo-brand">L'Atelier du Gâteau</div>
              <div class="footer__logo-sub">蛋糕工坊 · 法式匠心</div>
            </div>
          </div>
          <p class="footer__desc">
            每一款蛋糕，都是一件艺术品。我们甄选全球优质原料，以法式匠心工艺，为您呈现味蕾与视觉的双重盛宴。
          </p>
        </div>

        <div class="footer__links">
          <div class="footer__col">
            <h4>探索</h4>
            <router-link to="/products">全部商品</router-link>
            <router-link to="/products?sort=newest">新品上市</router-link>
            <router-link to="/products?sort=sales">人气之选</router-link>
          </div>
          <div class="footer__col">
            <h4>服务</h4>
            <a href="#">配送说明</a>
            <a href="#">退换政策</a>
            <a href="#">常见问题</a>
          </div>
          <div class="footer__col">
            <h4>联系</h4>
            <a href="#">400-888-9999</a>
            <a href="#">hello@atelier-cake.com</a>
            <a href="#">微信公众号</a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <p>© 2024 L'Atelier du Gâteau · 蛋糕工坊 · 用心制作每一份甜蜜</p>
      </div>
    </footer>

    <!-- Back to Top -->
    <transition name="scale">
      <button v-show="isScrolled" class="back-top" @click="scrollToTop">
        <el-icon><Top /></el-icon>
      </button>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { ElMessage } from 'element-plus'
import {
  Search, ShoppingCart, User, List, SwitchButton, Top
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()

const searchKeyword = ref('')
const searchExpanded = ref(false)
const isScrolled = ref(false)
const isHidden = ref(false)
let lastScrollY = 0

const handleScroll = () => {
  const currentY = window.scrollY
  isScrolled.value = currentY > 60
  isHidden.value = currentY > 300 && currentY > lastScrollY
  lastScrollY = currentY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  if (userStore.isAuthenticated) {
    userStore.fetchProfile()
    cartStore.fetchCart()
  }
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push({ path: '/products', query: { keyword: searchKeyword.value.trim() } })
  }
}

const handleUserCommand = (command: string) => {
  switch (command) {
    case 'profile': router.push('/user'); break
    case 'orders': router.push('/orders'); break
    case 'logout':
      userStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped lang="scss">
// ─── Header ────────────────────────────────────
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border-bottom: 1px solid transparent;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);

  &.scrolled {
    background: rgba(255, 255, 255, 0.95);
    border-bottom-color: var(--el-border-color-lighter);
    box-shadow: 0 1px 12px rgba(0, 0, 0, 0.04);
  }

  &.hidden {
    transform: translateY(-100%);
  }

  &__inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 32px;
    height: 72px;
    display: flex;
    align-items: center;
    gap: 32px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    flex-shrink: 0;

    &-icon {
      font-size: 28px;
      line-height: 1;
    }

    &-text {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
    }

    &-brand {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 600;
      color: #1a1f36;
      letter-spacing: 0.02em;
    }

    &-sub {
      font-size: 10px;
      font-weight: 500;
      color: #c9a96e;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
  }

  &__nav {
    display: flex;
    gap: 4px;
    margin-left: 16px;
    align-items: center;

    &-link {
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      color: #6b6b6b;
      border-radius: 8px;
      transition: all 0.25s ease;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        width: 0;
        height: 2px;
        background: #c9a96e;
        border-radius: 1px;
        transform: translateX(-50%);
        transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      &:hover {
        color: #2d2d2d;
      }

      &.active {
        color: #1a1f36;
        font-weight: 600;

        &::after {
          width: 20px;
        }
      }
    }

    &-admin {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      margin-left: 8px;
      padding: 7px 16px;
      background: linear-gradient(135deg, #c9a96e, #b8944f);
      color: #fff !important;
      font-weight: 600;
      font-size: 13px;
      border-radius: 8px;
      letter-spacing: 0.03em;
      box-shadow: 0 2px 8px rgba(201, 169, 110, 0.3);
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);

      &::after {
        display: none;
      }

      &:hover {
        color: #fff !important;
        transform: translateY(-1px);
        box-shadow: 0 4px 16px rgba(201, 169, 110, 0.4);
        background: linear-gradient(135deg, #d4b97a, #c9a96e);
      }

      svg {
        opacity: 0.9;
      }
    }
  }

  &__search {
    flex: 1;
    max-width: 320px;
    margin-left: auto;

    &-input {
      :deep(.el-input__wrapper) {
        background: #f5f3f0;
        border-radius: 24px;
        box-shadow: none;
        padding: 4px 16px;
        transition: all 0.3s ease;

        &:hover, &.is-focus {
          background: #fff;
          box-shadow: 0 0 0 1px #e8e4de;
        }

        &.is-focus {
          box-shadow: 0 0 0 2px #c9a96e;
        }
      }
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__action-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    color: #6b6b6b;
    transition: all 0.25s ease;

    &:hover {
      background: #f5f3f0;
      color: #1a1f36;
    }

    :deep(.el-badge__content) {
      background: #c9a96e;
      border: none;
      font-size: 10px;
    }
  }

  &__user {
    cursor: pointer;
  }

  &__avatar {
    width: 36px;
    height: 36px;
    border-radius: 12px;
    background: linear-gradient(135deg, #1a1f36, #2d3250);
    color: #c9a96e;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    font-family: 'Playfair Display', serif;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  &__login-btn {
    padding: 8px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #1a1f36;
    border: 1px solid #e8e4de;
    border-radius: 24px;
    transition: all 0.25s ease;

    &:hover {
      border-color: #c9a96e;
      color: #c9a96e;
      background: rgba(201, 169, 110, 0.05);
    }
  }
}

// ─── Main ──────────────────────────────────────
.main {
  min-height: 100vh;
  padding-top: 72px;
}

// ─── Footer ────────────────────────────────────
.footer {
  background: #1a1f36;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 120px;

  &__inner {
    max-width: 1280px;
    margin: 0 auto;
    padding: 80px 32px 60px;
    display: grid;
    grid-template-columns: 1.5fr 2fr;
    gap: 80px;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;

    &-icon {
      font-size: 32px;
    }

    &-brand {
      font-family: 'Playfair Display', serif;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }

    &-sub {
      font-size: 11px;
      color: #c9a96e;
      letter-spacing: 0.1em;
    }
  }

  &__desc {
    font-size: 14px;
    line-height: 1.8;
    color: rgba(255, 255, 255, 0.5);
    max-width: 360px;
  }

  &__links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
  }

  &__col {
    h4 {
      font-size: 13px;
      font-weight: 600;
      color: #c9a96e;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 20px;
    }

    a {
      display: block;
      font-size: 14px;
      color: rgba(255, 255, 255, 0.5);
      padding: 6px 0;
      transition: all 0.2s ease;

      &:hover {
        color: #fff;
        transform: translateX(4px);
      }
    }
  }

  &__bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    p {
      max-width: 1280px;
      margin: 0 auto;
      padding: 24px 32px;
      font-size: 12px;
      color: rgba(255, 255, 255, 0.3);
      text-align: center;
    }
  }
}

// ─── Back to Top ───────────────────────────────
.back-top {
  position: fixed;
  bottom: 32px;
  right: 32px;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #1a1f36;
  color: #c9a96e;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(26, 31, 54, 0.2);
  transition: all 0.3s ease;
  z-index: 100;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(26, 31, 54, 0.3);
  }
}

// ─── Responsive ────────────────────────────────
@media (max-width: 768px) {
  .header {
    &__inner {
      padding: 0 16px;
      height: 60px;
      gap: 12px;
    }

    &__nav { display: none; }

    &__search {
      max-width: 200px;
    }

    &__logo-text { display: none; }
  }

  .main {
    padding-top: 60px;
  }

  .footer {
    &__inner {
      grid-template-columns: 1fr;
      gap: 40px;
      padding: 48px 16px 40px;
    }

    &__links {
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
  }
}
</style>
