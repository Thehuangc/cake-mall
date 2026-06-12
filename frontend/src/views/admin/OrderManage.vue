<template>
  <div class="order-manage">
    <div class="page-header">
      <h2>订单管理</h2>
      <div class="header-actions">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon>
          导出订单
        </el-button>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索订单号/用户..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="selectedStatus" placeholder="订单状态" clearable class="status-select">
        <el-option label="待付款" :value="0" />
        <el-option label="已付款" :value="1" />
        <el-option label="已发货" :value="2" />
        <el-option label="已完成" :value="3" />
        <el-option label="已取消" :value="4" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 订单表格 -->
    <el-table :data="orders" style="width: 100%" class="order-table" v-loading="loading">
      <el-table-column prop="order_no" label="订单号" width="200" />
      <el-table-column label="用户" width="120">
        <template #default="{ row }">
          {{ row.user?.username || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="商品" min-width="200">
        <template #default="{ row }">
          <div class="order-items">
            <div v-for="item in row.items?.slice(0, 2)" :key="item.id" class="order-item">
              <el-image :src="item.product_image" fit="cover" class="item-image" />
              <span class="item-name">{{ item.product_name }}</span>
            </div>
            <span v-if="row.items?.length > 2" class="more">+{{ row.items.length - 2 }}件</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="金额" width="120">
        <template #default="{ row }">
          <span class="price">¥{{ row.total_amount }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="下单时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button
            v-if="row.status === 1"
            type="success"
            text
            size="small"
            @click="handleShip(row)"
          >
            发货
          </el-button>
          <el-button
            v-if="row.status === 0"
            type="warning"
            text
            size="small"
            @click="handleCancel(row)"
          >
            取消
          </el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :total="total"
        :page-size="10"
        layout="total, prev, pager, next"
        @current-change="fetchOrders"
      />
    </div>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      title="订单详情"
      width="700px"
      class="order-detail-dialog"
    >
      <div class="order-detail" v-if="currentOrder">
        <div class="detail-section">
          <h3>订单信息</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span>{{ currentOrder.order_no }}</span>
            </div>
            <div class="info-item">
              <span class="label">下单时间：</span>
              <span>{{ formatDate(currentOrder.created_at) }}</span>
            </div>
            <div class="info-item">
              <span class="label">订单状态：</span>
              <el-tag :type="getStatusType(currentOrder.status)">
                {{ getStatusText(currentOrder.status) }}
              </el-tag>
            </div>
            <div class="info-item">
              <span class="label">订单金额：</span>
              <span class="price">¥{{ currentOrder.total_amount }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="currentOrder.address">
          <h3>收货地址</h3>
          <p>{{ currentOrder.address.name }} {{ currentOrder.address.phone }}</p>
          <p>{{ currentOrder.address.province }}{{ currentOrder.address.city }}{{ currentOrder.address.district }}{{ currentOrder.address.address }}</p>
        </div>

        <div class="detail-section">
          <h3>商品信息</h3>
          <el-table :data="currentOrder.items" style="width: 100%">
            <el-table-column label="商品" min-width="200">
              <template #default="{ row }">
                <div class="product-info">
                  <el-image :src="row.product_image" fit="cover" class="product-image" />
                  <span>{{ row.product_name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row }">
                <span class="price">¥{{ row.price }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="100" />
            <el-table-column label="小计" width="120">
              <template #default="{ row }">
                <span class="price">¥{{ (row.price * row.quantity).toFixed(2) }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="detail-section" v-if="currentOrder.remark">
          <h3>订单备注</h3>
          <p>{{ currentOrder.remark }}</p>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Download } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'

const orders = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const searchKeyword = ref('')
const selectedStatus = ref<number | ''>('')
const detailVisible = ref(false)
const currentOrder = ref<any>(null)

onMounted(() => {
  fetchOrders()
})

const fetchOrders = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: 10,
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (selectedStatus.value !== '') {
      params.status = selectedStatus.value
    }

    const res: any = await adminApi.getOrders(params)
    orders.value = res.items
    total.value = res.total
  } catch (error) {
    console.error('获取订单失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

const handleReset = () => {
  searchKeyword.value = ''
  selectedStatus.value = ''
  handleSearch()
}

const handleView = (order: any) => {
  currentOrder.value = order
  detailVisible.value = true
}

const handleShip = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要标记为已发货吗？', '提示', { type: 'info' })
    await adminApi.updateOrderStatus(order.id, 2)
    ElMessage.success('发货成功')
    fetchOrders()
  } catch {
    // 取消
  }
}

const handleCancel = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', { type: 'warning' })
    await adminApi.updateOrderStatus(order.id, 4)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch {
    // 取消
  }
}

const handleDelete = async (order: any) => {
  try {
    await ElMessageBox.confirm('确定要删除该订单吗？', '提示', { type: 'warning' })
    await adminApi.deleteOrder(order.id)
    ElMessage.success('删除成功')
    fetchOrders()
  } catch {
    // 取消
  }
}

const handleExport = () => {
  ElMessage.info('导出功能开发中...')
}

const getStatusType = (status: number) => {
  const types: Record<number, string> = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger',
  }
  return types[status] || 'info'
}

const getStatusText = (status: number) => {
  const texts: Record<number, string> = {
    0: '待付款',
    1: '已付款',
    2: '已发货',
    3: '已完成',
    4: '已取消',
  }
  return texts[status] || '未知'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.order-manage {
  animation: fadeIn 0.5s ease;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  h2 {
    font-size: 20px;
    color: #333;
    font-weight: 600;
  }
}

.search-bar {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
  align-items: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .search-input {
    width: 250px;
  }

  .status-select {
    width: 150px;
  }
}

.order-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .order-items {
    display: flex;
    align-items: center;
    gap: 8px;

    .order-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .item-image {
      width: 40px;
      height: 40px;
      border-radius: 6px;
    }

    .item-name {
      font-size: 13px;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .more {
      color: #999;
      font-size: 12px;
    }
  }

  .price {
    color: #ff6b6b;
    font-weight: 600;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail-dialog {
  .order-detail {
    .detail-section {
      margin-bottom: 24px;

      h3 {
        font-size: 16px;
        color: #333;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid #eee;
      }

      .info-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;

        .info-item {
          .label {
            color: #999;
            margin-right: 8px;
          }
        }
      }

      .product-info {
        display: flex;
        align-items: center;
        gap: 12px;

        .product-image {
          width: 50px;
          height: 50px;
          border-radius: 8px;
        }
      }

      .price {
        color: #ff6b6b;
        font-weight: 600;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
