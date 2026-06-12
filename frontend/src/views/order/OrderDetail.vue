<template>
  <div class="order-detail" v-loading="loading">
    <div class="container" v-if="order">
      <div class="order-detail__header animate-fade-up">
        <router-link to="/orders" class="order-detail__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回订单列表
        </router-link>
        <span class="section-label">Order Detail</span>
        <h1 class="order-detail__title">订单详情</h1>
      </div>

      <!-- Status Steps -->
      <div class="order-detail__steps animate-fade-up">
        <div class="step" v-for="(step, i) in steps" :key="i" :class="{ active: i <= currentStep, done: i < currentStep }">
          <div class="step__dot">
            <svg v-if="i < currentStep" width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="step__label">{{ step }}</span>
        </div>
      </div>

      <div class="order-detail__layout">
        <!-- Info -->
        <div class="order-detail__info">
          <div class="order-detail__card animate-fade-up delay-1">
            <h3>订单信息</h3>
            <div class="order-detail__row">
              <span>订单号</span><span>{{ order.order_no }}</span>
            </div>
            <div class="order-detail__row">
              <span>下单时间</span><span>{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-detail__row">
              <span>订单状态</span>
              <el-tag :type="getStatusType(order.status)" size="small" effect="plain">
                {{ getStatusText(order.status) }}
              </el-tag>
            </div>
          </div>

          <div class="order-detail__card animate-fade-up delay-2" v-if="order.address">
            <h3>收货地址</h3>
            <p class="order-detail__address-name">{{ order.address.name }} {{ order.address.phone }}</p>
            <p class="order-detail__address-text">
              {{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.address }}
            </p>
          </div>

          <div class="order-detail__card animate-fade-up delay-3">
            <h3>商品信息</h3>
            <div class="order-detail__products">
              <div class="order-detail__product" v-for="item in order.items" :key="item.id">
                <img :src="item.product_image" :alt="item.product_name" />
                <div class="order-detail__product-info">
                  <span class="order-detail__product-name">{{ item.product_name }}</span>
                  <span class="order-detail__product-price">¥{{ item.price }} x {{ item.quantity }}</span>
                </div>
                <span class="order-detail__product-total">¥{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Summary -->
        <div class="order-detail__summary animate-fade-up delay-2">
          <div class="order-detail__card">
            <h3>订单金额</h3>
            <div class="order-detail__row">
              <span>商品合计</span><span>¥{{ order.total_amount }}</span>
            </div>
            <div class="order-detail__row">
              <span>运费</span><span class="order-detail__free">免运费</span>
            </div>
            <div class="order-detail__divider"></div>
            <div class="order-detail__row order-detail__row--total">
              <span>实付金额</span>
              <span>¥{{ order.total_amount }}</span>
            </div>
            <div class="order-detail__actions">
              <button v-if="order.status === 0" class="order-detail__btn order-detail__btn--primary" @click="handlePay">
                立即付款
              </button>
              <button v-if="order.status === 0" class="order-detail__btn order-detail__btn--ghost" @click="handleCancel">
                取消订单
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { orderApi } from '@/api/order'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()
const order = ref<any>(null)
const loading = ref(false)

const steps = ['提交订单', '付款成功', '商品发货', '交易完成']
const currentStep = computed(() => {
  const map: Record<number, number> = { 0: 0, 1: 1, 2: 2, 3: 3, 4: -1 }
  return map[order.value?.status] ?? 0
})

onMounted(async () => {
  loading.value = true
  try {
    order.value = await orderApi.getById(Number(route.params.id))
  } catch {
    ElMessage.error('订单不存在')
    router.push('/orders')
  } finally {
    loading.value = false
  }
})

const getStatusType = (s: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: '', 2: 'info', 3: 'success', 4: 'danger' }
  return (map[s] || '') as any
}

const getStatusText = (s: number) => {
  const map: Record<number, string> = { 0: '待付款', 1: '已付款', 2: '已发货', 3: '已完成', 4: '已取消' }
  return map[s] || '未知'
}

const formatDate = (d: string) => new Date(d).toLocaleString('zh-CN')

const handlePay = () => ElMessage.info('支付功能开发中')

const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确定取消订单？', '提示', { type: 'warning' })
    await orderApi.cancel(order.value.id)
    ElMessage.success('已取消')
    order.value.status = 4
  } catch {}
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: $gold;
  margin-bottom: 8px;

  &::before { content: ''; width: 24px; height: 1px; background: $gold; }
}

.order-detail {
  padding: 40px 0 100px;

  &__back {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #9a9a9a;
    margin-bottom: 24px;
    transition: color 0.2s;

    &:hover { color: $gold; }
  }

  &__title {
    font-family: 'Playfair Display', serif;
    font-size: 32px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 32px;
  }

  &__steps {
    display: flex;
    justify-content: center;
    gap: 60px;
    margin-bottom: 48px;
    padding: 32px;
    background: #fff;
    border-radius: 16px;
    border: 1px solid #f0ece6;
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 32px;
    align-items: start;
  }

  &__card {
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 20px;

    h3 {
      font-size: 16px;
      font-weight: 600;
      color: $navy;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid #f0ece6;
    }
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    color: #6b6b6b;

    &--total {
      font-size: 18px;
      font-weight: 700;
      color: $navy;
      margin-bottom: 24px;

      span:last-child {
        font-family: 'Playfair Display', serif;
        font-size: 28px;
      }
    }
  }

  &__free {
    color: #5b9e6f;
    font-weight: 500;
  }

  &__divider {
    height: 1px;
    background: #f0ece6;
    margin: 16px 0;
  }

  &__address-name {
    font-size: 15px;
    font-weight: 600;
    color: $navy;
    margin-bottom: 6px;
  }

  &__address-text {
    font-size: 14px;
    color: #6b6b6b;
  }

  &__products {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__product {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      width: 56px;
      height: 56px;
      border-radius: 10px;
      object-fit: cover;
    }

    &-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &-name {
      font-size: 14px;
      font-weight: 500;
      color: $navy;
    }

    &-price {
      font-size: 13px;
      color: #9a9a9a;
    }

    &-total {
      font-family: 'Playfair Display', serif;
      font-size: 16px;
      font-weight: 700;
      color: $navy;
    }
  }

  &__summary {
    position: sticky;
    top: 100px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__btn {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Outfit', sans-serif;

    &--primary {
      background: $navy;
      color: #fff;
      border: none;

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba($navy, 0.2);
      }
    }

    &--ghost {
      background: #fff;
      border: 1px solid #e8e4de;
      color: #6b6b6b;

      &:hover {
        border-color: #c45b5b;
        color: #c45b5b;
      }
    }
  }
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  &__dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f0ece6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #9a9a9a;
    transition: all 0.3s ease;
  }

  &__label {
    font-size: 13px;
    color: #9a9a9a;
  }

  &.active .step__dot {
    background: $navy;
    color: #fff;
  }

  &.done .step__dot {
    background: #5b9e6f;
    color: #fff;
  }

  &.active .step__label {
    color: $navy;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .order-detail__layout {
    grid-template-columns: 1fr;
  }

  .order-detail__steps {
    gap: 24px;
    flex-wrap: wrap;
  }
}
</style>
