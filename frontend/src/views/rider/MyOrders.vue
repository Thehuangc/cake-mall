<template>
  <div class="my-orders">
    <div class="tabs">
      <button v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value; fetchOrders()">
        {{ tab.label }}
      </button>
    </div>

    <div class="orders-list" v-loading="loading">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">{{ order.order_no }}</span>
          <el-tag :type="getStatusType(order.status)" size="small">{{ getStatusText(order.status) }}</el-tag>
        </div>
        <div class="order-info">
          <div class="info-row">
            <span class="label">客户：</span>
            <span>{{ order.user?.username || '-' }}</span>
          </div>
          <div class="info-row">
            <span class="label">地址：</span>
            <span>{{ formatAddress(order.address) }}</span>
          </div>
          <div class="info-row">
            <span class="label">金额：</span>
            <span class="amount">¥{{ order.total_amount }}</span>
          </div>
          <div class="info-row">
            <span class="label">佣金：</span>
            <span class="commission" v-if="order.commission">¥{{ order.commission }}</span>
            <span class="commission-pending" v-else>送达后自动计算</span>
          </div>
        </div>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="item">
            <img :src="item.product_image" :alt="item.product_name" />
            <span>{{ item.product_name }} x{{ item.quantity }}</span>
          </div>
        </div>
        <div class="order-actions">
          <el-button v-if="order.status === 1" type="primary" size="small" @click="handlePickup(order.id)">
            确认取货
          </el-button>
          <el-button v-if="order.status === 2" type="success" size="small" @click="handleDeliver(order.id)">
            确认送达
          </el-button>
          <el-button v-if="order.status === 3" type="info" size="small" disabled>
            已完成
          </el-button>
        </div>
      </div>
      <el-empty v-if="!loading && orders.length === 0" description="暂无订单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { riderApi } from '@/api/rider'

const orders = ref<any[]>([])
const loading = ref(false)
const activeTab = ref(-1)

const tabs = [
  { label: '全部', value: -1 },
  { label: '待取货', value: 1 },
  { label: '配送中', value: 2 },
  { label: '已完成', value: 3 },
]

onMounted(() => fetchOrders())

const fetchOrders = async () => {
  loading.value = true
  try {
    const params: any = { page: 1, limit: 50 }
    if (activeTab.value !== -1) params.status = activeTab.value
    const res: any = await riderApi.getMyOrders(params)
    orders.value = res.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const formatAddress = (addr: any) => {
  if (!addr) return '无地址'
  return `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.address || ''}`
}

const getStatusType = (s: number) => {
  const map: Record<number, string> = { 1: 'warning', 2: 'primary', 3: 'success' }
  return (map[s] || 'info') as any
}

const getStatusText = (s: number) => {
  const map: Record<number, string> = { 1: '待取货', 2: '配送中', 3: '已完成' }
  return map[s] || '未知'
}

const handlePickup = async (id: number) => {
  try {
    await riderApi.pickupOrder(id)
    ElMessage.success('已取货')
    fetchOrders()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '操作失败')
  }
}

const handleDeliver = async (id: number) => {
  try {
    await riderApi.deliverOrder(id)
    ElMessage.success('已送达')
    fetchOrders()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '操作失败')
  }
}
</script>

<style scoped lang="scss">
.my-orders { animation: fadeIn 0.4s ease; }

.tabs {
  display: flex; gap: 4px; margin-bottom: 20px;
  border-bottom: 1px solid #f0ece6;
}

.tab {
  padding: 10px 18px; background: none; border: none;
  font-size: 14px; font-weight: 500; color: #999;
  cursor: pointer; position: relative;
  font-family: 'Outfit', sans-serif;
  transition: color 0.2s;

  &::after {
    content: ''; position: absolute; bottom: -1px; left: 0; right: 0;
    height: 2px; background: #10b981; transform: scaleX(0);
    transition: transform 0.3s;
  }

  &.active { color: #1a1f36; font-weight: 600; &::after { transform: scaleX(1); } }
  &:hover { color: #1a1f36; }
}

.orders-list { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: #fff; border-radius: 16px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
}

.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-no { font-size: 13px; color: #999; }

.order-info {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;
  padding: 12px; background: #f8f9fc; border-radius: 10px; margin-bottom: 12px;
  .info-row { display: flex; gap: 8px; font-size: 13px; }
  .label { color: #999; }
  .amount { color: #ff6b6b; font-weight: 600; }
  .commission { color: #10b981; font-weight: 600; }
  .commission-pending { color: #999; font-size: 12px; }
}

.order-items {
  display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;
  .item {
    display: flex; align-items: center; gap: 8px;
    img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
    span { font-size: 13px; color: #666; }
  }
}

.order-actions {
  display: flex; justify-content: flex-end; gap: 8px;
  padding-top: 12px; border-top: 1px solid #f0ece6;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
