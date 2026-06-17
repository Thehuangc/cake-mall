<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="admin-layout__sidebar" :class="{ collapsed: isCollapsed }">
      <div class="admin-layout__sidebar-header">
        <router-link to="/admin/dashboard" class="admin-layout__logo">
          <span class="admin-layout__logo-icon">🎂</span>
          <div v-show="!isCollapsed" class="admin-layout__logo-text">
            <div class="admin-layout__logo-brand">L'Atelier</div>
            <div class="admin-layout__logo-sub">Admin Panel</div>
          </div>
        </router-link>
        <button class="admin-layout__toggle" @click="isCollapsed = !isCollapsed">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line v-if="!isCollapsed" x1="3" y1="12" x2="21" y2="12"></line>
            <line v-if="!isCollapsed" x1="3" y1="6" x2="21" y2="6"></line>
            <line v-if="!isCollapsed" x1="3" y1="18" x2="21" y2="18"></line>
            <line v-if="isCollapsed" x1="3" y1="12" x2="21" y2="12"></line>
            <line v-if="isCollapsed" x1="3" y1="6" x2="21" y2="6"></line>
            <line v-if="isCollapsed" x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <nav class="admin-layout__nav" ref="navRef">
        <div class="admin-layout__nav-indicator" ref="indicatorRef"></div>
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="admin-layout__nav-item"
          :data-path="item.path"
        >
          <span class="admin-layout__nav-icon">{{ item.icon }}</span>
          <span v-show="!isCollapsed" class="admin-layout__nav-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="admin-layout__sidebar-footer">
        <router-link to="/" class="admin-layout__nav-item">
          <span class="admin-layout__nav-icon">🏠</span>
          <span v-show="!isCollapsed" class="admin-layout__nav-label">返回前台</span>
        </router-link>
        <button class="admin-layout__nav-item" @click="logout">
          <span class="admin-layout__nav-icon">🚪</span>
          <span v-show="!isCollapsed" class="admin-layout__nav-label">退出登录</span>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="admin-layout__main" :style="{ marginLeft: isCollapsed ? '72px' : '240px' }">
      <header class="admin-layout__header">
        <div class="admin-layout__header-left">
          <h2>{{ currentTitle }}</h2>
        </div>
        <div class="admin-layout__header-right">
          <span class="admin-layout__admin-name">管理员</span>
          <div class="admin-layout__admin-avatar">A</div>
        </div>
      </header>
      <div class="admin-layout__content">
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const isCollapsed = ref(false)

const navItems = [
  { path: '/admin/dashboard', icon: '📊', label: '仪表盘' },
  { path: '/admin/orders', icon: '📦', label: '订单管理' },
  { path: '/admin/products', icon: '🎂', label: '商品管理' },
  { path: '/admin/categories', icon: '📂', label: '分类管理' },
  { path: '/admin/users', icon: '👥', label: '用户管理' },
]

// Sliding indicator — 用 Web Animations API，不依赖 CSS transition
const navRef = ref<HTMLElement | null>(null)
const indicatorRef = ref<HTMLElement | null>(null)
let prevTop = 0
let prevHeight = 46

const updateIndicator = () => {
  const nav = navRef.value
  const indicator = indicatorRef.value
  if (!nav || !indicator) return
  const el = nav.querySelector(`[data-path="${route.path}"]`) as HTMLElement
  if (!el) return

  const navRect = nav.getBoundingClientRect()
  const elRect = el.getBoundingClientRect()
  const newTop = elRect.top - navRect.top
  const newHeight = elRect.height

  // 用 Web Animations API 做平滑过渡
  indicator.animate([
    { top: `${prevTop}px`, height: `${prevHeight}px` },
    { top: `${newTop}px`, height: `${newHeight}px` },
  ], {
    duration: 600,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    fill: 'forwards',
  })

  prevTop = newTop
  prevHeight = newHeight
}

watch(() => route.path, () => nextTick(updateIndicator))
onMounted(() => {
  // 初始化位置（无动画）
  nextTick(() => {
    const nav = navRef.value
    const indicator = indicatorRef.value
    if (!nav || !indicator) return
    const el = nav.querySelector(`[data-path="${route.path}"]`) as HTMLElement
    if (!el) return
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    prevTop = elRect.top - navRect.top
    prevHeight = elRect.height
    indicator.style.top = `${prevTop}px`
    indicator.style.height = `${prevHeight}px`
    indicator.style.opacity = '1'
  })
})

const currentTitle = computed(() => {
  const item = navItems.find(n => n.path === route.path)
  return item?.label || '管理后台'
})

const logout = () => {
  localStorage.removeItem('adminToken')
  ElMessage.success('已退出')
  router.push('/admin/login')
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$navy-light: #242b4a;
$gold: #c9a96e;

.admin-layout {
  display: flex;
  min-height: 100vh;
  background: #f5f3f0;

  &__sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 240px;
    background: $navy;
    display: flex;
    flex-direction: column;
    transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: 100;

    &.collapsed { width: 72px; }
  }

  &__sidebar-header {
    padding: 20px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  &__logo-icon {
    font-size: 24px;
    flex-shrink: 0;
  }

  &__logo-brand {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    white-space: nowrap;
  }

  &__logo-sub {
    font-size: 10px;
    color: $gold;
    letter-spacing: 0.1em;
    white-space: nowrap;
  }

  &__toggle {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    border: none;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
  }

  &__nav {
    flex: 1;
    padding: 12px 8px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    position: relative;
  }

  &__nav-indicator {
    position: absolute;
    left: 8px;
    right: 8px;
    top: 0;
    background: rgba($gold, 0.15);
    border-radius: 10px;
    pointer-events: none;
    z-index: 0;
    opacity: 0;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    text-decoration: none;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    font-family: 'Outfit', sans-serif;
    position: relative;
    z-index: 1;
    transition: color 0.3s ease;

    &:hover {
      color: rgba(255, 255, 255, 0.8);
    }

    &.router-link-active {
      color: $gold;
    }
  }

  &__nav-icon {
    font-size: 18px;
    flex-shrink: 0;
    width: 24px;
    text-align: center;
  }

  &__nav-label {
    white-space: nowrap;
  }

  &__sidebar-footer {
    padding: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
  }

  &__main {
    flex: 1;
    margin-left: 240px;
    transition: margin-left 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  &__header {
    position: sticky;
    top: 0;
    z-index: 50;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid #f0ece6;
    padding: 0 32px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    h2 {
      font-size: 18px;
      font-weight: 600;
      color: $navy;
    }
  }

  &__header-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &__admin-name {
    font-size: 14px;
    font-weight: 500;
    color: #6b6b6b;
  }

  &__admin-avatar {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: $navy;
    color: $gold;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 700;
    font-family: 'Playfair Display', serif;
  }

  &__content {
    padding: 32px;
  }
}

</style>
