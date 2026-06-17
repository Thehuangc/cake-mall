<template>
  <div class="orders-page">
    <div class="container">
      <div class="orders-page__header">
        <span class="section-label">My Orders</span>
        <h1 class="orders-page__title">我的订单</h1>
      </div>

      <div class="orders-page__tabs">
        <button v-for="tab in tabs" :key="tab.value" class="tab" :class="{ active: activeTab === tab.value }" @click="activeTab = tab.value; fetchOrders()">
          {{ tab.label }}
        </button>
      </div>

      <div class="orders-page__list" v-loading="loading">
        <div v-for="order in orders" :key="order.id" class="order-card" @click="$router.push(`/orders/${order.id}`)">
          <div class="order-card__header">
            <span class="order-card__no">订单号：{{ order.order_no }}</span>
            <el-tag :type="getStatusType(order.status)" size="small" effect="plain">{{ getStatusText(order.status) }}</el-tag>
          </div>
          <div class="order-card__items">
            <div class="order-card__item" v-for="item in order.items?.slice(0, 3)" :key="item.id">
              <img :src="item.product_image" :alt="item.product_name" />
              <div class="order-card__item-info">
                <span>{{ item.product_name }}</span>
                <span class="order-card__item-qty">x{{ item.quantity }}</span>
              </div>
            </div>
            <span v-if="order.items?.length > 3" class="order-card__more">+{{ order.items.length - 3 }} 件</span>
          </div>
          <div class="order-card__footer">
            <span class="order-card__time">{{ formatDate(order.created_at) }}</span>
            <div class="order-card__total">
              共 {{ order.items?.length }} 件，合计：
              <span class="order-card__amount">¥{{ order.total_amount }}</span>
            </div>
          </div>
          <div class="order-card__actions" v-if="order.status === 0">
            <el-button type="danger" size="small" @click.stop="handleCancel(order.id)">取消订单</el-button>
          </div>
        </div>

        <el-empty v-if="!loading && orders.length === 0" description="暂无订单">
          <router-link to="/products"><el-button type="primary">去逛逛</el-button></router-link>
        </el-empty>
      </div>

      <div v-if="total > 10" class="orders-page__pagination">
        <el-pagination v-model:current-page="currentPage" :total="total" :page-size="10" layout="prev, pager, next" @current-change="fetchOrders" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { orderApi } from '@/api/order'

const orders = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const activeTab = ref(-1)

const tabs = [
  { label: '全部', value: -1 },
  { label: '待付款', value: 0 },
  { label: '已付款', value: 1 },
  { label: '已取货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 },
]

onMounted(() => fetchOrders())

const fetchOrders = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, limit: 10 }
    if (activeTab.value !== -1) params.status = activeTab.value
    const res: any = await orderApi.getList(params)
    orders.value = res.items || []
    total.value = res.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const getStatusType = (s: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: '', 2: 'info', 3: 'success', 4: 'danger' }
  return (map[s] || '') as any
}

const getStatusText = (s: number) => {
  const map: Record<number, string> = { 0: '待付款', 1: '已付款', 2: '已取货', 3: '已完成', 4: '已取消' }
  return map[s] || '未知'
}

const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN')

const handleCancel = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定取消该订单吗？', '提示', { type: 'warning' })
    await orderApi.cancel(id)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (e: any) {
    if (e !== 'cancel') ElMessage.error(e?.response?.data?.message || '取消失败')
  }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;

.container { max-width: 900px; margin: 0 auto; padding: 0 32px; }

.section-label { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: $gold; margin-bottom: 8px; &::before { content: ''; width: 24px; height: 1px; background: $gold; } }

.orders-page {
  padding: 60px 0 100px;
  &__header { margin-bottom: 32px; }
  &__title { font-family: 'Playfair Display', serif; font-size: 36px; font-weight: 600; color: $navy; }
  &__tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 1px solid #f0ece6; }
  &__list { display: flex; flex-direction: column; gap: 16px; min-height: 300px; }
  &__pagination { display: flex; justify-content: center; padding: 40px 0; }
}

.tab {
  padding: 10px 18px; background: none; border: none;
  font-size: 14px; font-weight: 500; color: #999;
  cursor: pointer; position: relative; font-family: 'Outfit', sans-serif;
  transition: color 0.2s;
  &::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 2px; background: $gold; transform: scaleX(0); transition: transform 0.3s; }
  &.active { color: $navy; font-weight: 600; &::after { transform: scaleX(1); } }
  &:hover { color: $navy; }
}

.order-card {
  background: #fff; border: 1px solid #f0ece6; border-radius: 16px; padding: 24px;
  cursor: pointer; transition: all 0.3s;
  &:hover { box-shadow: 0 8px 24px rgba($navy, 0.06); border-color: transparent; }

  &__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  &__no { font-size: 13px; color: #9a9a9a; }
  &__items { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
  &__item { display: flex; align-items: center; gap: 10px; img { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; } &-info { display: flex; flex-direction: column; gap: 2px; span:first-child { font-size: 14px; font-weight: 500; color: $navy; } &-qty { font-size: 12px; color: #9a9a9a; } } }
  &__more { font-size: 13px; color: #9a9a9a; }
  &__footer { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid #f0ece6; }
  &__time { font-size: 13px; color: #9a9a9a; }
  &__total { font-size: 14px; color: #6b6b6b; }
  &__amount { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 700; color: $navy; }
  &__actions { display: flex; justify-content: flex-end; padding-top: 12px; margin-top: 12px; border-top: 1px solid #f5f5f5; }
}
</style>
