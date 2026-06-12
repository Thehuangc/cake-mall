<template>
  <div class="checkout-page">
    <div class="container">
      <div class="checkout-page__header animate-fade-up">
        <span class="section-label">Checkout</span>
        <h1 class="checkout-page__title">确认订单</h1>
      </div>

      <div class="checkout-page__layout">
        <!-- Form -->
        <div class="checkout-page__form animate-fade-up delay-1">
          <div class="checkout-page__section">
            <h3>收货信息</h3>
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
              <div class="checkout-page__row">
                <el-form-item label="收货人" prop="name">
                  <el-input v-model="form.name" placeholder="请输入姓名" size="large" />
                </el-form-item>
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="form.phone" placeholder="请输入手机号" size="large" />
                </el-form-item>
              </div>
              <div class="checkout-page__row checkout-page__row--3">
                <el-form-item label="省份" prop="province">
                  <el-input v-model="form.province" placeholder="省份" size="large" />
                </el-form-item>
                <el-form-item label="城市" prop="city">
                  <el-input v-model="form.city" placeholder="城市" size="large" />
                </el-form-item>
                <el-form-item label="区县" prop="district">
                  <el-input v-model="form.district" placeholder="区县" size="large" />
                </el-form-item>
              </div>
              <el-form-item label="详细地址" prop="address">
                <el-input v-model="form.address" placeholder="街道、门牌号等" size="large" />
              </el-form-item>
              <el-form-item label="备注">
                <el-input v-model="remark" type="textarea" :rows="3" placeholder="选填，如配送时间要求等" />
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- Summary -->
        <div class="checkout-page__summary animate-fade-up delay-2">
          <h3>订单商品</h3>
          <div class="checkout-page__items">
            <div class="checkout-page__item" v-for="item in cartStore.items" :key="item.id">
              <img :src="item.product.image" :alt="item.product.name" />
              <div class="checkout-page__item-info">
                <span class="checkout-page__item-name">{{ item.product.name }}</span>
                <span class="checkout-page__item-qty">x{{ item.quantity }}</span>
              </div>
              <span class="checkout-page__item-price">¥{{ (item.product.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
          <div class="checkout-page__divider"></div>
          <div class="checkout-page__total-row">
            <span>商品合计</span>
            <span>¥{{ cartStore.total.toFixed(2) }}</span>
          </div>
          <div class="checkout-page__total-row">
            <span>运费</span>
            <span class="checkout-page__free">免运费</span>
          </div>
          <div class="checkout-page__divider"></div>
          <div class="checkout-page__total-row checkout-page__total-row--final">
            <span>应付金额</span>
            <span>¥{{ cartStore.total.toFixed(2) }}</span>
          </div>
          <button class="checkout-page__submit" @click="submitOrder" :loading="submitting">
            提交订单
          </button>
          <router-link to="/cart" class="checkout-page__back">返回购物车</router-link>
        </div>
      </div>
    </div>

    <!-- Success Overlay -->
    <transition name="scale">
      <div v-if="showSuccess" class="checkout-page__success">
        <div class="checkout-page__success-card">
          <div class="checkout-page__success-icon">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path d="M7 18l7 7 15-15" stroke="#5b9e6f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>订单提交成功</h3>
          <p>您的订单正在处理中</p>
          <div class="checkout-page__success-order">订单号：{{ orderId }}</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { orderApi } from '@/api/order'
import { ElMessage } from 'element-plus'

const router = useRouter()
const cartStore = useCartStore()
const formRef = ref()
const submitting = ref(false)
const showSuccess = ref(false)
const orderId = ref<number | null>(null)
const remark = ref('')
let redirectTimer: ReturnType<typeof setTimeout> | null = null

onBeforeUnmount(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
})

const form = reactive({
  name: '', phone: '', province: '', city: '', district: '', address: '',
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' },
  ],
  province: [{ required: true, message: '请输入省份', trigger: 'blur' }],
  city: [{ required: true, message: '请输入城市', trigger: 'blur' }],
  district: [{ required: true, message: '请输入区县', trigger: 'blur' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
}

onMounted(() => {
  if (cartStore.items.length === 0) {
    cartStore.fetchCart().then(() => {
      if (cartStore.items.length === 0) router.push('/cart')
    })
  }
})

const submitOrder = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true
    const res: any = await orderApi.create({
      address: { ...form },
      remark: remark.value || undefined,
    })
    orderId.value = res.id
    showSuccess.value = true
    // 清空购物车
    await cartStore.clearCart()
    redirectTimer = setTimeout(() => {
      router.push(`/orders/${res.id}`)
    }, 2000)
  } catch (error: any) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (!error.response) {
      ElMessage.error('网络错误，请稍后重试')
    }
  } finally {
    submitting.value = false
  }
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

.checkout-page {
  padding: 60px 0 100px;

  &__header { margin-bottom: 40px; }

  &__title {
    font-family: 'Playfair Display', serif;
    font-size: 36px;
    font-weight: 600;
    color: $navy;
  }

  &__layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: 40px;
    align-items: start;
  }

  &__section {
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 20px;
    padding: 32px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: $navy;
      margin-bottom: 24px;
    }

    :deep(.el-form-item__label) {
      font-weight: 500;
      color: #6b6b6b;
    }

    :deep(.el-input__wrapper) {
      border-radius: 10px;
    }
  }

  &__row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;

    &--3 { grid-template-columns: 1fr 1fr 1fr; }
  }

  &__summary {
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 20px;
    padding: 28px;
    position: sticky;
    top: 100px;

    h3 {
      font-size: 18px;
      font-weight: 600;
      color: $navy;
      margin-bottom: 20px;
    }
  }

  &__items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 20px;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;

    img {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      object-fit: cover;
    }

    &-info {
      flex: 1;
      display: flex;
      justify-content: space-between;
    }

    &-name {
      font-size: 14px;
      font-weight: 500;
      color: $navy;
    }

    &-qty {
      font-size: 13px;
      color: #9a9a9a;
    }

    &-price {
      font-size: 14px;
      font-weight: 600;
      color: $navy;
    }
  }

  &__divider {
    height: 1px;
    background: #f0ece6;
    margin: 16px 0;
  }

  &__total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
    font-size: 14px;
    color: #6b6b6b;

    &--final {
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

  &__submit {
    width: 100%;
    padding: 14px;
    background: $navy;
    color: #fff;
    border: none;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: 'Outfit', sans-serif;

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba($navy, 0.2);
    }
  }

  &__back {
    display: block;
    text-align: center;
    margin-top: 12px;
    font-size: 13px;
    color: #9a9a9a;
    transition: color 0.2s;

    &:hover { color: $gold; }
  }

  // Success overlay
  &__success {
    position: fixed;
    inset: 0;
    background: rgba($navy, 0.3);
    backdrop-filter: blur(12px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  &__success-card {
    background: #fff;
    border-radius: 24px;
    padding: 48px;
    text-align: center;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
    animation: successBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

    h3 {
      font-family: 'Playfair Display', serif;
      font-size: 24px;
      color: $navy;
      margin-bottom: 8px;
    }

    p {
      font-size: 14px;
      color: #9a9a9a;
      margin-bottom: 16px;
    }
  }

  &__success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(#5b9e6f, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 24px;
    animation: successBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  &__success-order {
    font-size: 13px;
    color: #9a9a9a;
    background: #f5f3f0;
    padding: 8px 16px;
    border-radius: 8px;
    display: inline-block;
  }
}

@keyframes successBounce {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.08); }
  100% { transform: scale(1); opacity: 1; }
}

@media (max-width: 768px) {
  .checkout-page__layout {
    grid-template-columns: 1fr;
  }
  .checkout-page__row {
    grid-template-columns: 1fr;
    &--3 { grid-template-columns: 1fr; }
  }
}
</style>
