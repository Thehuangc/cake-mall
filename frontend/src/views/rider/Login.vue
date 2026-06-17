<template>
  <div class="rider-login">
    <div class="login-card">
      <div class="login-header">
        <span class="logo-icon">🚴</span>
        <h1>骑手登录</h1>
        <p>蛋糕商城骑手配送系统</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱地址" size="large" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="login-btn">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-footer">
        <router-link to="/">返回首页</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useCartStore } from '@/stores/cart'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const cartStore = useCartStore()
const formRef = ref()
const loading = ref(false)
const form = reactive({ email: '', password: '' })

const rules = {
  email: [{ required: true, message: '请输入邮箱或用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    const res: any = await authApi.login({ email: form.email, password: form.password })
    if (res.user.role !== 'rider' && res.user.role !== 'admin') {
      ElMessage.error('此账号不是骑手账号')
      loading.value = false
      return
    }
    localStorage.setItem('token', res.token)
    userStore.token = res.token
    userStore.user = res.user
    cartStore.fetchCart()
    ElMessage.success('登录成功')
    router.push('/rider/dashboard')
  } catch (e: any) {
    if (e.response?.data?.message) ElMessage.error(e.response.data.message)
  } finally { loading.value = false }
}
</script>

<style scoped lang="scss">
$rider-green: #10b981;

.rider-login {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: linear-gradient(135deg, #065f46, #064e3b);
  position: relative; overflow: hidden;

  &::before {
    content: ''; position: absolute; top: -30%; right: -20%;
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba($rider-green, 0.15) 0%, transparent 70%);
    border-radius: 50%; animation: float 8s ease-in-out infinite;
  }
}

.login-card {
  position: relative; z-index: 1; width: 100%; max-width: 400px;
  background: rgba(255,255,255,0.95); backdrop-filter: blur(20px);
  border-radius: 24px; padding: 48px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  animation: fadeInUp 0.6s ease;
}

.login-header {
  text-align: center; margin-bottom: 32px;
  .logo-icon { font-size: 48px; display: block; margin-bottom: 16px; }
  h1 { font-family: 'Playfair Display', serif; font-size: 28px; color: #1a1f36; margin-bottom: 8px; }
  p { font-size: 14px; color: #999; }
}

:deep(.el-input__wrapper) { border-radius: 12px; padding: 4px 12px; }

.login-btn {
  width: 100%; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 600;
  background: linear-gradient(135deg, $rider-green, darken($rider-green, 8%));
  border: none;
  &:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba($rider-green, 0.3); }
}

.login-footer {
  text-align: center; margin-top: 20px;
  a { color: #999; font-size: 13px; text-decoration: none; &:hover { color: $rider-green; } }
}

@keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
</style>
