<template>
  <div class="dashboard">
    <!-- Stats Cards -->
    <div class="dashboard__stats">
      <div class="stat-card" v-for="(stat, i) in stats" :key="i" :class="`animate-fade-up delay-${i + 1}`">
        <div class="stat-card__icon" :style="{ background: stat.bg }">
          <span>{{ stat.icon }}</span>
        </div>
        <div class="stat-card__info">
          <span class="stat-card__label">{{ stat.label }}</span>
          <span class="stat-card__value">{{ stat.value }}</span>
        </div>
        <div class="stat-card__trend" :class="stat.trend">
          {{ stat.trend === 'up' ? '↑' : '↓' }} {{ stat.change }}
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="dashboard__charts">
      <!-- Revenue Chart -->
      <div class="dashboard__chart-card animate-fade-up delay-5">
        <div class="dashboard__chart-header">
          <h3>订单金额趋势</h3>
          <select v-model="chartPeriod" class="dashboard__period-select">
            <option value="7">近7天</option>
            <option value="30">近30天</option>
            <option value="90">近90天</option>
          </select>
        </div>
        <div class="dashboard__chart-body">
          <div class="dashboard__bar-chart">
            <div class="dashboard__bar-group" v-for="(item, i) in chartData" :key="i">
              <div class="dashboard__bar-wrapper">
                <div
                  class="dashboard__bar"
                  :style="{ height: `${(item.value / maxChartValue) * 100}%` }"
                >
                  <span class="dashboard__bar-tooltip">¥{{ item.value.toLocaleString() }}</span>
                </div>
              </div>
              <span class="dashboard__bar-label">{{ item.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Status Distribution -->
      <div class="dashboard__chart-card animate-fade-up delay-6">
        <div class="dashboard__chart-header">
          <h3>订单状态分布</h3>
        </div>
        <div class="dashboard__chart-body">
          <div class="dashboard__donut">
            <svg viewBox="0 0 120 120" class="dashboard__donut-svg">
              <circle
                v-for="(seg, i) in donutSegments"
                :key="i"
                cx="60" cy="60" r="50"
                fill="none"
                :stroke="seg.color"
                stroke-width="12"
                :stroke-dasharray="seg.dash"
                :stroke-dashoffset="seg.offset"
                :transform="'rotate(-90 60 60)'"
              />
            </svg>
            <div class="dashboard__donut-center">
              <span class="dashboard__donut-total">{{ totalOrders }}</span>
              <span class="dashboard__donut-label">总订单</span>
            </div>
          </div>
          <div class="dashboard__legend">
            <div class="dashboard__legend-item" v-for="(seg, i) in donutSegments" :key="i">
              <span class="dashboard__legend-dot" :style="{ background: seg.color }"></span>
              <span class="dashboard__legend-text">{{ seg.label }}</span>
              <span class="dashboard__legend-count">{{ seg.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tables Row -->
    <div class="dashboard__tables">
      <!-- Recent Orders -->
      <div class="dashboard__table-card animate-fade-up delay-7">
        <div class="dashboard__table-header">
          <h3>最新订单</h3>
          <router-link to="/admin/orders" class="dashboard__view-all">查看全部</router-link>
        </div>
        <table class="dashboard__table">
          <thead>
            <tr>
              <th>订单号</th>
              <th>用户</th>
              <th>金额</th>
              <th>状态</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in recentOrders" :key="order.id">
              <td class="dashboard__order-no">{{ order.order_no }}</td>
              <td>{{ order.user?.username || '-' }}</td>
              <td class="dashboard__amount">¥{{ order.total_amount }}</td>
              <td>
                <span class="dashboard__status" :class="`status-${order.status}`">
                  {{ getStatusText(order.status) }}
                </span>
              </td>
              <td class="dashboard__time">{{ formatTime(order.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Recent Users -->
      <div class="dashboard__table-card animate-fade-up delay-8">
        <div class="dashboard__table-header">
          <h3>最新用户</h3>
          <router-link to="/admin/users" class="dashboard__view-all">查看全部</router-link>
        </div>
        <table class="dashboard__table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>邮箱</th>
              <th>注册时间</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in recentUsers" :key="user.id">
              <td>
                <div class="dashboard__user-cell">
                  <div class="dashboard__user-avatar">{{ user.username?.charAt(0)?.toUpperCase() }}</div>
                  <span>{{ user.username }}</span>
                </div>
              </td>
              <td>{{ user.email }}</td>
              <td class="dashboard__time">{{ formatTime(user.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Activity Log -->
    <div class="dashboard__log animate-fade-up delay-9">
      <div class="dashboard__log-header">
        <h3>操作日志</h3>
        <button class="dashboard__log-clear" @click="logs = []">清空日志</button>
      </div>
      <div class="dashboard__log-body">
        <div v-if="logs.length === 0" class="dashboard__log-empty">
          <span>📋</span>
          <p>暂无日志记录</p>
        </div>
        <div v-else class="dashboard__log-list">
          <div class="dashboard__log-item" v-for="(log, i) in logs" :key="i">
            <span class="dashboard__log-time">{{ log.time }}</span>
            <span class="dashboard__log-type" :class="log.type">{{ log.type }}</span>
            <span class="dashboard__log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { adminApi } from '@/api/admin'

const stats = ref([
  { icon: '👥', label: '总用户', value: '...', change: '12%', trend: 'up', bg: 'rgba(102, 126, 234, 0.1)' },
  { icon: '📦', label: '总订单', value: '...', change: '8%', trend: 'up', bg: 'rgba(201, 169, 110, 0.1)' },
  { icon: '💰', label: '总销售额', value: '...', change: '15%', trend: 'up', bg: 'rgba(91, 158, 111, 0.1)' },
  { icon: '🎂', label: '商品数量', value: '...', change: '5%', trend: 'up', bg: 'rgba(196, 91, 91, 0.1)' },
])

const chartPeriod = ref('7')
const chartData = ref<{ label: string; value: number }[]>([])
const maxChartValue = computed(() => Math.max(...chartData.value.map(d => d.value), 1))

const recentOrders = ref<any[]>([])
const recentUsers = ref<any[]>([])
const totalOrders = ref(0)

const orderStatusCounts = ref({ 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 })

const donutSegments = computed(() => {
  const total = totalOrders.value || 1
  const circumference = 2 * Math.PI * 50
  const statuses = [
    { label: '待付款', count: orderStatusCounts.value[0], color: '#e6a23c' },
    { label: '已付款', count: orderStatusCounts.value[1], color: '#409eff' },
    { label: '已发货', count: orderStatusCounts.value[2], color: '#909399' },
    { label: '已完成', count: orderStatusCounts.value[3], color: '#67c23a' },
    { label: '已取消', count: orderStatusCounts.value[4], color: '#f56c6c' },
  ]

  let offset = 0
  return statuses.map(s => {
    const ratio = s.count / total
    const dash = `${ratio * circumference} ${circumference}`
    const currentOffset = -offset
    offset += ratio * circumference
    return { ...s, dash, offset: currentOffset }
  })
})

const logs = ref<{ time: string; type: string; message: string }[]>([])

const addLog = (type: string, message: string) => {
  logs.value.unshift({
    time: new Date().toLocaleTimeString('zh-CN'),
    type,
    message,
  })
}

onMounted(async () => {
  try {
    const res: any = await adminApi.getDashboardStats()
    stats.value[0].value = (res.userCount || 0).toLocaleString()
    stats.value[1].value = (res.orderCount || 0).toLocaleString()
    stats.value[2].value = '¥' + (res.totalSales || 0).toLocaleString()
    stats.value[3].value = (res.productCount || 0).toLocaleString()
    totalOrders.value = res.orderCount || 0
    addLog('info', '仪表盘统计数据加载完成')
  } catch (e) {
    addLog('error', '统计数据加载失败')
  }

  // Load recent orders
  try {
    const res: any = await adminApi.getOrders({ page: 1, limit: 5 })
    recentOrders.value = res.items || []
    addLog('info', `加载了 ${recentOrders.value.length} 条最新订单`)
  } catch (e) {
    addLog('error', '订单数据加载失败')
  }

  // Load recent users
  try {
    const res: any = await adminApi.getUsers({ page: 1, limit: 5 })
    recentUsers.value = res.items || []
    addLog('info', `加载了 ${recentUsers.value.length} 名最新用户`)
  } catch (e) {
    addLog('error', '用户数据加载失败')
  }

  // Generate mock chart data
  generateChartData()
})

const generateChartData = () => {
  const days = parseInt(chartPeriod.value)
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    data.push({
      label: `${d.getMonth() + 1}/${d.getDate()}`,
      value: Math.floor(Math.random() * 5000) + 1000,
    })
  }
  chartData.value = data
  addLog('info', '图表数据已生成')
}

const getStatusText = (s: number) => {
  const map: Record<number, string> = { 0: '待付款', 1: '已付款', 2: '已发货', 3: '已完成', 4: '已取消' }
  return map[s] || '未知'
}

const formatTime = (d: string) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;

.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;

  // ─── Stats ─────────────────────────────────
  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }

  // ─── Charts ────────────────────────────────
  &__charts {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 24px;
  }

  &__chart-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f0ece6;
    padding: 24px;
  }

  &__chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $navy;
    }
  }

  &__period-select {
    padding: 6px 12px;
    border: 1px solid #e8e4de;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'Outfit', sans-serif;
    color: #6b6b6b;
    background: #fff;
    cursor: pointer;

    &:focus { outline: none; border-color: $gold; }
  }

  &__bar-chart {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 220px;
    padding-top: 20px;
  }

  &__bar-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    height: 100%;
  }

  &__bar-wrapper {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  &__bar {
    width: 70%;
    max-width: 32px;
    background: linear-gradient(to top, $gold, lighten($gold, 15%));
    border-radius: 4px 4px 0 0;
    position: relative;
    transition: height 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;

    &:hover {
      background: linear-gradient(to top, darken($gold, 5%), $gold);

      .dashboard__bar-tooltip {
        opacity: 1;
        transform: translateX(-50%) translateY(-4px);
      }
    }
  }

  &__bar-tooltip {
    position: absolute;
    top: -28px;
    left: 50%;
    transform: translateX(-50%) translateY(0);
    background: $navy;
    color: #fff;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &__bar-label {
    font-size: 11px;
    color: #9a9a9a;
  }

  // Donut
  &__donut {
    position: relative;
    width: 160px;
    height: 160px;
    margin: 0 auto 20px;
  }

  &__donut-svg {
    width: 100%;
    height: 100%;
  }

  &__donut-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  &__donut-total {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: $navy;
  }

  &__donut-label {
    font-size: 12px;
    color: #9a9a9a;
  }

  &__legend {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 3px;
  }

  &__legend-text {
    flex: 1;
    font-size: 13px;
    color: #6b6b6b;
  }

  &__legend-count {
    font-size: 13px;
    font-weight: 600;
    color: $navy;
  }

  // ─── Tables ────────────────────────────────
  &__tables {
    display: grid;
    grid-template-columns: 1.5fr 1fr;
    gap: 24px;
  }

  &__table-card {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f0ece6;
    overflow: hidden;
  }

  &__table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0ece6;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $navy;
    }
  }

  &__view-all {
    font-size: 13px;
    color: $gold;
    font-weight: 500;
    transition: opacity 0.2s;

    &:hover { opacity: 0.7; }
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

    th {
      padding: 12px 24px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #9a9a9a;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #faf8f5;
    }

    td {
      padding: 14px 24px;
      font-size: 13px;
      color: #6b6b6b;
      border-bottom: 1px solid #f5f3f0;
    }

    tr:last-child td {
      border-bottom: none;
    }

    tr:hover td {
      background: #faf8f5;
    }
  }

  &__order-no {
    font-family: 'Outfit', monospace;
    font-size: 12px;
    color: #9a9a9a;
  }

  &__amount {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    color: $navy;
  }

  &__status {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;

    &.status-0 { background: #fdf6ec; color: #e6a23c; }
    &.status-1 { background: #ecf5ff; color: #409eff; }
    &.status-2 { background: #f4f4f5; color: #909399; }
    &.status-3 { background: #f0f9eb; color: #67c23a; }
    &.status-4 { background: #fef0f0; color: #f56c6c; }
  }

  &__time {
    font-size: 12px;
    color: #9a9a9a;
  }

  &__user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  &__user-avatar {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: $navy;
    color: $gold;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
  }

  // ─── Log ───────────────────────────────────
  &__log {
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f0ece6;
    overflow: hidden;
  }

  &__log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0ece6;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $navy;
    }
  }

  &__log-clear {
    padding: 6px 14px;
    background: none;
    border: 1px solid #e8e4de;
    border-radius: 6px;
    font-size: 12px;
    color: #9a9a9a;
    cursor: pointer;
    font-family: 'Outfit', sans-serif;
    transition: all 0.2s;

    &:hover {
      border-color: #c45b5b;
      color: #c45b5b;
    }
  }

  &__log-body {
    padding: 16px 24px;
    max-height: 300px;
    overflow-y: auto;
  }

  &__log-empty {
    text-align: center;
    padding: 32px 0;

    span { font-size: 32px; display: block; margin-bottom: 8px; }
    p { font-size: 13px; color: #9a9a9a; }
  }

  &__log-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__log-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    background: #faf8f5;
    border-radius: 8px;
    font-size: 13px;
  }

  &__log-time {
    font-family: 'Outfit', monospace;
    font-size: 12px;
    color: #9a9a9a;
    flex-shrink: 0;
  }

  &__log-type {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    flex-shrink: 0;

    &.info { background: #ecf5ff; color: #409eff; }
    &.success { background: #f0f9eb; color: #67c23a; }
    &.error { background: #fef0f0; color: #f56c6c; }
    &.warn { background: #fdf6ec; color: #e6a23c; }
  }

  &__log-message {
    flex: 1;
    color: #6b6b6b;
  }
}

// ─── Stat Card ─────────────────────────────────
.stat-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f0ece6;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba($navy, 0.06);
    transform: translateY(-2px);
  }

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
  }

  &__info {
    flex: 1;
  }

  &__label {
    display: block;
    font-size: 12px;
    color: #9a9a9a;
    margin-bottom: 4px;
  }

  &__value {
    display: block;
    font-family: 'Playfair Display', serif;
    font-size: 24px;
    font-weight: 700;
    color: $navy;
  }

  &__trend {
    font-size: 12px;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 6px;

    &.up {
      background: #f0f9eb;
      color: #67c23a;
    }

    &.down {
      background: #fef0f0;
      color: #f56c6c;
    }
  }
}

@media (max-width: 1024px) {
  .dashboard {
    &__stats { grid-template-columns: repeat(2, 1fr); }
    &__charts { grid-template-columns: 1fr; }
    &__tables { grid-template-columns: 1fr; }
  }
}

@media (max-width: 640px) {
  .dashboard__stats { grid-template-columns: 1fr; }
}
</style>
