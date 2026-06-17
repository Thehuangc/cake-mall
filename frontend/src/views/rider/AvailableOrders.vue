<template>
  <div class="available-orders">
    <div class="orders-list" v-loading="loading">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-no">{{ order.order_no }}</span>
          <el-tag type="warning" size="small">待接单</el-tag>
        </div>
        <div class="order-address">
          <el-icon><Location /></el-icon>
          <span>{{ formatAddress(order.address) }}</span>
        </div>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="item">
            <img :src="item.product_image" :alt="item.product_name" />
            <span>{{ item.product_name }} x{{ item.quantity }}</span>
          </div>
        </div>
        <div class="order-footer">
          <div class="order-amounts">
            <span class="order-amount">¥{{ order.total_amount }}</span>
            <span class="order-commission">预计佣金 ¥{{ (order.total_amount * 0.1).toFixed(2) }}</span>
          </div>
          <el-button type="primary" size="small" @click="handleAccept(order.id)">
            接单
          </el-button>
        </div>
      </div>
      <el-empty v-if="!loading && orders.length === 0" description="暂无可接订单" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
import { riderApi } from '@/api/rider'

const orders = ref<any[]>([])
const loading = ref(false)

onMounted(() => fetchOrders())

const fetchOrders = async () => {
  loading.value = true
  try {
    const res: any = await riderApi.getAvailableOrders()
    orders.value = res.items || []
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const formatAddress = (addr: any) => {
  if (!addr) return '无地址'
  return `${addr.province || ''}${addr.city || ''}${addr.district || ''}${addr.address || ''}`
}

const handleAccept = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定接单吗？', '确认接单', { type: 'info' })
    await riderApi.acceptOrder(id)
    ElMessage.success('接单成功')
    fetchOrders()
  } catch (e: any) {
    if (e !== 'cancel' && e?.response?.data?.message) {
      ElMessage.error(e.response.data.message)
    }
  }
}
</script>

<style scoped lang="scss">
.available-orders { animation: fadeIn 0.4s ease; }

.orders-list { display: flex; flex-direction: column; gap: 16px; }

.order-card {
  background: #fff; border-radius: 16px; padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  transition: all 0.3s;
  &:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
}

.order-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.order-no { font-size: 13px; color: #999; font-family: 'Outfit', monospace; }

.order-address {
  display: flex; align-items: center; gap: 8px;
  padding: 12px; background: #f8f9fc; border-radius: 10px;
  margin-bottom: 12px; font-size: 14px; color: #333;
  .el-icon { color: #10b981; }
}

.order-items {
  display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 12px;
  .item {
    display: flex; align-items: center; gap: 8px;
    img { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
    span { font-size: 13px; color: #666; }
  }
}

.order-footer {
  display: flex; justify-content: space-between; align-items: center;
  padding-top: 12px; border-top: 1px solid #f0ece6;
}

.order-amounts {
  display: flex; flex-direction: column; gap: 2px;
  .order-amount { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: #1a1f36; }
  .order-commission { font-size: 12px; color: #10b981; font-weight: 500; }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
