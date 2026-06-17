<template>
  <div class="order-manage">
    <div class="page-header">
      <h2>订单管理</h2>
    </div>

    <div class="search-bar">
      <el-input v-model="searchKeyword" placeholder="搜索订单号/用户…" clearable class="search-input" @keyup.enter="handleSearch">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="selectedStatus" placeholder="订单状态" clearable class="status-select">
        <el-option label="待付款" :value="0" />
        <el-option label="已付款" :value="1" />
        <el-option label="已取货" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <el-table :data="orders" class="order-table" v-loading="loading">
      <el-table-column prop="order_no" label="订单号" width="200" />
      <el-table-column label="用户" width="120">
        <template #default="{ row }">{{ row.user?.username || '-' }}</template>
      </el-table-column>
      <el-table-column label="商品" min-width="200">
        <template #default="{ row }">
          <div class="order-items">
            <div v-for="item in row.items?.slice(0, 2)" :key="item.id" class="item">
              <img :src="item.product_image" :alt="item.product_name" />
              <span>{{ item.product_name }}</span>
            </div>
            <span v-if="row.items?.length > 2" class="more">+{{ row.items.length - 2 }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="110">
        <template #default="{ row }"><span class="price">¥{{ row.total_amount }}</span></template>
      </el-table-column>
      <el-table-column label="佣金" width="110">
        <template #default="{ row }">
          <span v-if="row.commission" class="commission">¥{{ row.commission }}</span>
          <span v-else class="no-commission">未设置</span>
        </template>
      </el-table-column>
      <el-table-column label="骑手" width="100">
        <template #default="{ row }">
          <span v-if="row.rider_id">骑手#{{ row.rider_id }}</span>
          <span v-else class="no-rider">未派送</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="160">
        <template #default="{ row }">{{ formatTime(row.created_at) }}</template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="handleView(row)">详情</el-button>
          <el-button type="warning" text size="small" @click="handleSetCommission(row)">设佣金</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="total > 10">
      <el-pagination v-model:current-page="currentPage" :total="total" :page-size="10" layout="total, prev, pager, next" @current-change="fetchOrders" />
    </div>

    <!-- 订单详情弹窗 -->
    <el-dialog v-model="detailVisible" title="订单详情" width="640px">
      <div v-if="currentOrder" class="detail-content">
        <div class="detail-row"><span class="label">订单号</span><span>{{ currentOrder.order_no }}</span></div>
        <div class="detail-row"><span class="label">用户</span><span>{{ currentOrder.user?.username }}</span></div>
        <div class="detail-row"><span class="label">状态</span><el-tag :type="getStatusType(currentOrder.status)">{{ getStatusText(currentOrder.status) }}</el-tag></div>
        <div class="detail-row"><span class="label">金额</span><span class="price">¥{{ currentOrder.total_amount }}</span></div>
        <div class="detail-row"><span class="label">佣金</span><span>{{ currentOrder.commission ? '¥' + currentOrder.commission : '未设置' }}</span></div>
        <div class="detail-row"><span class="label">骑手</span><span>{{ currentOrder.rider_id ? '骑手#' + currentOrder.rider_id : '未派送' }}</span></div>
        <div class="detail-row"><span class="label">地址</span><span>{{ formatAddress(currentOrder.address) }}</span></div>
        <h4 style="margin-top:20px">商品</h4>
        <div v-for="item in currentOrder.items" :key="item.id" class="detail-item">
          <img :src="item.product_image" />
          <span>{{ item.product_name }} x{{ item.quantity }}</span>
          <span class="price">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>
    </el-dialog>

    <!-- 设置佣金弹窗 -->
    <el-dialog v-model="commissionVisible" title="设置佣金" width="400px">
      <el-form v-if="commissionOrder">
        <el-form-item label="订单号"><span>{{ commissionOrder.order_no }}</span></el-form-item>
        <el-form-item label="订单金额"><span class="price">¥{{ commissionOrder.total_amount }}</span></el-form-item>
        <el-form-item label="佣金金额">
          <el-input-number v-model="commissionValue" :min="0" :precision="2" size="large" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="commissionVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCommission">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'

const orders = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const searchKeyword = ref('')
const selectedStatus = ref<number | ''>('')
const detailVisible = ref(false)
const currentOrder = ref<any>(null)
const commissionVisible = ref(false)
const commissionOrder = ref<any>(null)
const commissionValue = ref(0)

onMounted(() => fetchOrders())

const fetchOrders = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, limit: 10 }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (selectedStatus.value !== '') params.status = selectedStatus.value
    const res: any = await adminApi.getOrders(params)
    orders.value = res.items || []
    total.value = res.total || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleSearch = () => { currentPage.value = 1; fetchOrders() }
const handleReset = () => { searchKeyword.value = ''; selectedStatus.value = ''; handleSearch() }

const handleView = (order: any) => { currentOrder.value = order; detailVisible.value = true }

const handleSetCommission = (order: any) => {
  commissionOrder.value = order
  commissionValue.value = Number(order.commission) || 0
  commissionVisible.value = true
}

const submitCommission = async () => {
  try {
    await adminApi.setOrderCommission(commissionOrder.value.id, commissionValue.value)
    ElMessage.success('佣金设置成功')
    commissionVisible.value = false
    fetchOrders()
  } catch (e: any) {
    ElMessage.error(e.response?.data?.message || '设置失败')
  }
}

const getStatusType = (s: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: '', 2: 'info', 3: 'success', 4: 'danger' }
  return (map[s] || 'info') as any
}

const getStatusText = (s: number) => {
  const map: Record<number, string> = { 0: '待付款', 1: '已付款', 2: '已取货', 3: '已完成', 4: '已取消' }
  return map[s] || '未知'
}

const formatTime = (d: string) => new Date(d).toLocaleString('zh-CN')
const formatAddress = (a: any) => a ? `${a.province || ''}${a.city || ''}${a.district || ''}${a.address || ''}` : '-'
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;

.order-manage { animation: fadeIn 0.4s ease; }
.page-header { margin-bottom: 24px; h2 { font-size: 20px; color: $navy; font-weight: 600; } }

.search-bar {
  background: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;
  display: flex; gap: 12px; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  .search-input { width: 240px; }
  .status-select { width: 140px; }
}

.order-table {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  .order-items { display: flex; align-items: center; gap: 8px; .item { display: flex; align-items: center; gap: 6px; img { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; } span { font-size: 12px; } } .more { font-size: 12px; color: #999; } }
  .price { color: #ff6b6b; font-weight: 600; }
  .commission { color: #10b981; font-weight: 600; }
  .no-commission { color: #999; font-size: 12px; }
  .no-rider { color: #999; font-size: 12px; }
}

.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }

.detail-content {
  .detail-row { display: flex; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; .label { color: #999; min-width: 60px; } .price { color: #ff6b6b; font-weight: 600; } }
  .detail-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; img { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; } span { font-size: 14px; } .price { margin-left: auto; color: #ff6b6b; font-weight: 600; } }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
