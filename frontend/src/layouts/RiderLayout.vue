<template>
  <div class="rider-layout">
    <aside class="sidebar" :class="{ collapsed: isCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">🚴</span>
          <span class="logo-text" v-show="!isCollapsed">骑手端</span>
        </div>
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
          <el-icon><Fold v-if="!isCollapsed" /><Expand v-else /></el-icon>
        </button>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/rider/dashboard" class="nav-item" :class="{ active: $route.path === '/rider/dashboard' }">
          <span class="nav-icon">📊</span>
          <span v-show="!isCollapsed">控制面板</span>
        </router-link>
        <router-link to="/rider/available" class="nav-item" :class="{ active: $route.path === '/rider/available' }">
          <span class="nav-icon">📦</span>
          <span v-show="!isCollapsed">待接订单</span>
        </router-link>
        <router-link to="/rider/my-orders" class="nav-item" :class="{ active: $route.path === '/rider/my-orders' }">
          <span class="nav-icon">🚚</span>
          <span v-show="!isCollapsed">我的配送</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <router-link to="/" class="nav-item">
          <span class="nav-icon">🏠</span>
          <span v-show="!isCollapsed">返回前台</span>
        </router-link>
        <button class="nav-item" @click="handleLogout">
          <span class="nav-icon">🚪</span>
          <span v-show="!isCollapsed">退出登录</span>
        </button>
      </div>
    </aside>

    <main class="rider-main" :style="{ marginLeft: isCollapsed ? '64px' : '220px' }">
      <header class="rider-header">
        <h2>{{ currentTitle }}</h2>
        <div class="rider-info">
          <span>🚴 骑手</span>
        </div>
      </header>
      <div class="rider-content">
        <router-view v-slot="{ Component }">
          <transition name="rider-fade" mode="out-in" :duration="200">
            <div :key="$route.path" class="rider-page">
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Expand } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const isCollapsed = ref(false)

const currentTitle = computed(() => {
  const map: Record<string, string> = {
    '/rider/dashboard': '控制面板',
    '/rider/available': '待接订单',
    '/rider/my-orders': '我的配送',
  }
  return map[route.path] || '骑手端'
})

const handleLogout = () => {
  localStorage.removeItem('token')
  ElMessage.success('已退出')
  router.push('/rider/login')
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$green: #10b981;

.rider-layout { display: flex; min-height: 100vh; background: #f5f3f0; }

.sidebar {
  position: fixed; top: 0; left: 0; bottom: 0; width: 220px;
  background: linear-gradient(180deg, #065f46 0%, #064e3b 100%);
  display: flex; flex-direction: column;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1); z-index: 100;

  &.collapsed { width: 64px; }
}

.sidebar-header {
  padding: 20px 16px; display: flex; align-items: center; justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.logo {
  display: flex; align-items: center; gap: 10px;
  &-icon { font-size: 24px; }
  &-text { font-size: 16px; font-weight: 600; color: #fff; white-space: nowrap; }
}

.collapse-btn {
  width: 32px; height: 32px; border-radius: 8px; border: none;
  background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.5);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  &:hover { background: rgba(255,255,255,0.2); color: #fff; }
}

.sidebar-nav { flex: 1; padding: 12px 8px; display: flex; flex-direction: column; gap: 4px; }

.nav-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; border-radius: 10px;
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.5);
  text-decoration: none; cursor: pointer; border: none; background: none;
  width: 100%; font-family: 'Outfit', sans-serif;

  .nav-icon { font-size: 18px; width: 24px; text-align: center; flex-shrink: 0; }

  &:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
  &.active { background: rgba($green, 0.2); color: $green; }
}

.sidebar-footer { padding: 8px; border-top: 1px solid rgba(255,255,255,0.1); }

.rider-main { flex: 1; margin-left: 220px; transition: margin-left 0.3s; }

.rider-header {
  position: sticky; top: 0; z-index: 50;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border-bottom: 1px solid #f0ece6; padding: 0 32px; height: 64px;
  display: flex; justify-content: space-between; align-items: center;

  h2 { font-size: 18px; font-weight: 600; color: $navy; }
  .rider-info { font-size: 14px; color: #666; font-weight: 500; }
}

.rider-content { padding: 24px; }

.rider-fade-enter-active,
.rider-fade-leave-active {
  transition: opacity 0.2s ease;
}
.rider-fade-enter-from,
.rider-fade-leave-to {
  opacity: 0;
}

.rider-page {
  min-height: 1px;
}
</style>
