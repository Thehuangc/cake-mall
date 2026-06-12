<template>
  <!-- Page loading bar -->
  <div v-if="isRouteLoading" class="page-loading"></div>

  <router-view v-slot="{ Component, route }">
    <transition :name="getTransition(route)" mode="out-in">
      <keep-alive :include="['Home']">
        <component :is="Component" :key="route.path" />
      </keep-alive>
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isRouteLoading = ref(false)

const getTransition = (r: any) => {
  return r.meta.transition || 'page'
}

watch(() => route.path, () => {
  isRouteLoading.value = true
  setTimeout(() => { isRouteLoading.value = false }, 400)
})
</script>

<style lang="scss">
// ─── Page Transitions ──────────────────────────
// Vertical fade (default — most routes)
.page-enter-active,
.page-leave-active {
  transition: opacity 0.32s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// Horizontal slide (for drill-down flows)
.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

// Scale (for modals / overlays)
.scale-enter-active,
.scale-leave-active {
  transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.02);
}
</style>
