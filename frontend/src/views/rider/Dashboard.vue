<template>
  <div class="rider-dashboard">
    <div class="stat-cards">
      <div class="stat-card" v-for="(s, i) in stats" :key="i" :style="{ animationDelay: `${i * 0.08}s` }">
        <div class="stat-icon" :style="{ background: s.color }">{{ s.icon }}</div>
        <div class="stat-info">
          <span class="stat-value">{{ s.value }}</span>
          <span class="stat-label">{{ s.label }}</span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h3>快捷操作</h3>
      <div class="action-grid">
        <router-link to="/rider/available" class="action-card">
          <span class="action-icon">📦</span>
          <span class="action-text">查看待接订单</span>
        </router-link>
        <router-link to="/rider/my-orders" class="action-card">
          <span class="action-icon">🚚</span>
          <span class="action-text">我的配送</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { riderApi } from '@/api/rider'

const stats = ref([
  { icon: '📦', label: '总配送', value: '...', color: 'linear-gradient(135deg, #667eea, #764ba2)' },
  { icon: '📅', label: '今日配送', value: '...', color: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { icon: '💰', label: '累计佣金 (10%)', value: '...', color: 'linear-gradient(135deg, #10b981, #059669)' },
  { icon: '🚚', label: '配送中', value: '...', color: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
])

onMounted(async () => {
  try {
    const res: any = await riderApi.getStats()
    stats.value[0].value = String(res.totalOrders || 0)
    stats.value[1].value = String(res.todayOrders || 0)
    stats.value[2].value = '¥' + (res.totalCommission || 0).toFixed(0)
    stats.value[3].value = String(res.pendingOrders || 0)
  } catch (e) { console.error(e) }
})
</script>

<style scoped lang="scss">
$rider-green: #10b981;

.rider-dashboard { animation: fadeIn 0.4s ease; }

.stat-cards {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px;
}

.stat-card {
  background: #fff; border-radius: 16px; padding: 20px;
  display: flex; align-items: center; gap: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s; animation: fadeInUp 0.5s ease backwards;

  &:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
}

.stat-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center; font-size: 24px;
}

.stat-info {
  display: flex; flex-direction: column;
  .stat-value { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1a1f36; }
  .stat-label { font-size: 13px; color: #999; }
}

.quick-actions {
  background: #fff; border-radius: 16px; padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);

  h3 { font-size: 16px; font-weight: 600; color: #1a1f36; margin-bottom: 16px; }
}

.action-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }

.action-card {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 32px; background: #f8f9fc; border-radius: 16px;
  text-decoration: none; cursor: pointer; transition: all 0.3s;
  border: 2px solid transparent;

  &:hover { border-color: $rider-green; background: rgba($rider-green, 0.05); transform: translateY(-4px); }
  .action-icon { font-size: 40px; }
  .action-text { font-size: 15px; font-weight: 500; color: #1a1f36; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
</style>
