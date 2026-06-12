<template>
  <div class="admin-login">
    <div class="admin-login__card">
      <div class="admin-login__header">
        <span class="admin-login__icon">🎂</span>
        <h1 class="admin-login__title">管理后台</h1>
        <p class="admin-login__subtitle">L'Atelier du Gâteau Admin Panel</p>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleLogin" class="admin-login__form">
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="管理员邮箱" size="large" prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码" size="large" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="handleLogin" class="admin-login__btn">
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <router-link to="/" class="admin-login__back">← 返回前台</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref()
const loading = ref(false)
const form = reactive({ email: '', password: '' })

const rules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' },
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    const res: any = await authApi.adminLogin({ email: form.email, password: form.password })
    localStorage.setItem('adminToken', res.token)
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } catch (error: any) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;

.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $navy;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -30%;
    right: -20%;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba($gold, 0.1) 0%, transparent 70%);
    border-radius: 50%;
  }

  &__card {
    position: relative;
    width: 100%;
    max-width: 400px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 48px 40px;
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
  }

  &__header {
    text-align: center;
    margin-bottom: 36px;
  }

  &__icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }

  &__title {
    font-family: 'Playfair Display', serif;
    font-size: 28px;
    font-weight: 700;
    color: $navy;
    margin-bottom: 8px;
  }

  &__subtitle {
    font-size: 12px;
    color: $gold;
    letter-spacing: 0.1em;
  }

  &__form {
    :deep(.el-input__wrapper) {
      border-radius: 12px;
      padding: 4px 12px;
    }
  }

  &__btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    background: $navy;
    border: none;

    &:hover {
      background: lighten($navy, 5%);
    }
  }

  &__back {
    display: block;
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #9a9a9a;
    transition: color 0.2s;

    &:hover { color: $gold; }
  }
}
</style>
