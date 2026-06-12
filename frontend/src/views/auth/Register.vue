<template>
  <div class="auth-page">
    <div class="auth-page__visual">
      <div class="auth-page__visual-bg"></div>
      <div class="auth-page__visual-content">
        <div class="auth-page__visual-logo">
          <span>🎂</span>
          <div>
            <div class="auth-page__visual-brand">L'Atelier</div>
            <div class="auth-page__visual-sub">du Gâteau</div>
          </div>
        </div>
        <h2 class="auth-page__visual-title">开启甜蜜之旅</h2>
        <p class="auth-page__visual-desc">
          创建您的专属账户<br />
          享受会员专属优惠与定制服务
        </p>
        <div class="auth-page__visual-deco">
          <div class="auth-page__visual-circle auth-page__visual-circle--1"></div>
          <div class="auth-page__visual-circle auth-page__visual-circle--2"></div>
        </div>
      </div>
    </div>

    <div class="auth-page__form-side">
      <div class="auth-page__form-wrapper">
        <router-link to="/" class="auth-page__back">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          返回首页
        </router-link>

        <div class="auth-page__header">
          <h1 class="auth-page__title">注册</h1>
          <p class="auth-page__subtitle">创建您的账户</p>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" @keyup.enter="handleRegister" class="auth-page__form">
          <el-form-item prop="username" class="auth-page__field">
            <el-input v-model="form.username" placeholder="用户名" size="large" prefix-icon="User" />
          </el-form-item>
          <el-form-item prop="email" class="auth-page__field">
            <el-input v-model="form.email" placeholder="邮箱地址" size="large" prefix-icon="Message" />
          </el-form-item>
          <el-form-item prop="password" class="auth-page__field">
            <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" size="large" prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item prop="confirmPassword" class="auth-page__field">
            <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" size="large" prefix-icon="Lock" show-password />
          </el-form-item>
          <el-form-item>
            <button
              type="button"
              class="auth-page__submit"
              :class="{ loading: loading, success: showSuccess }"
              :disabled="loading"
              @click="handleRegister"
            >
              <span v-if="!loading && !showSuccess">创建账户</span>
              <span v-else-if="loading" class="auth-page__spinner"></span>
              <svg v-else class="auth-page__check" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </el-form-item>
        </el-form>

        <div class="auth-page__footer">
          已有账户？
          <router-link to="/login" class="auth-page__link">立即登录</router-link>
        </div>
      </div>
    </div>

    <transition name="scale">
      <div v-if="showSuccess" class="auth-page__success">
        <div class="auth-page__success-card">
          <div class="auth-page__success-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M6 16l7 7 13-13" stroke="#5b9e6f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3>注册成功</h3>
          <p>欢迎加入 L'Atelier du Gâteau</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()

const formRef = ref()
const loading = ref(false)
const showSuccess = ref(false)

const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })

const validateConfirm = (_rule: any, value: string, callback: any) => {
  if (value !== form.password) callback(new Error('两次密码不一致'))
  else callback()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 2, max: 50, message: '2-50个字符', trigger: 'blur' }],
  email: [{ required: true, message: '请输入邮箱', trigger: 'blur' }, { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 6, message: '密码至少6位', trigger: 'blur' }],
  confirmPassword: [{ required: true, message: '请确认密码', trigger: 'blur' }, { validator: validateConfirm, trigger: 'blur' }],
}

const handleRegister = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true
    await userStore.register(form.username, form.email, form.password)
    showSuccess.value = true
    setTimeout(() => { router.push('/') }, 1200)
  } catch (error: any) {
    if (error.response?.data?.message) ElMessage.error(error.response.data.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;
$success: #5b9e6f;

.auth-page {
  display: flex;
  min-height: 100vh;

  &__visual {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: lighten($navy, 3%);

    &-bg {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 60% 30%, rgba($gold, 0.12) 0%, transparent 60%),
        radial-gradient(ellipse at 20% 70%, rgba($gold, 0.08) 0%, transparent 50%);
    }

    &-content { position: relative; z-index: 1; text-align: center; padding: 40px; }
    &-logo {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 48px;
      span { font-size: 36px; }
      &-brand { font-family: 'Playfair Display', serif; font-size: 20px; font-weight: 600; color: #fff; text-align: left; }
      &-sub { font-size: 11px; color: $gold; letter-spacing: 0.15em; text-transform: uppercase; text-align: left; }
    }
    &-title { font-family: 'Playfair Display', 'Noto Serif SC', serif; font-size: 42px; font-weight: 700; color: #fff; margin-bottom: 16px; }
    &-desc { font-size: 15px; line-height: 1.8; color: rgba(255, 255, 255, 0.5); }
    &-deco { position: absolute; inset: 0; pointer-events: none; }
    &-circle {
      position: absolute; border-radius: 50%; border: 1px solid rgba($gold, 0.12);
      &--1 { width: 260px; height: 260px; bottom: 10%; right: -8%; animation: float 7s ease-in-out infinite; }
      &--2 { width: 180px; height: 180px; top: 20%; left: -5%; animation: float 5s ease-in-out infinite reverse; }
    }
  }

  &__form-side { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px; background: #fff; }
  &__form-wrapper { width: 100%; max-width: 400px; animation: fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
  &__back {
    display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: #9a9a9a; margin-bottom: 40px; transition: color 0.2s;
    &:hover { color: $gold; }
  }
  &__header { margin-bottom: 36px; }
  &__title { font-family: 'Playfair Display', serif; font-size: 32px; font-weight: 700; color: $navy; margin-bottom: 8px; }
  &__subtitle { font-size: 15px; color: #9a9a9a; }
  &__form { :deep(.el-input__wrapper) { border-radius: 12px; padding: 4px 12px; } }
  &__field {
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
    &:nth-child(1) { animation-delay: 0.08s; }
    &:nth-child(2) { animation-delay: 0.14s; }
    &:nth-child(3) { animation-delay: 0.20s; }
    &:nth-child(4) { animation-delay: 0.26s; }
  }

  &__submit {
    width: 100%; height: 48px; border-radius: 12px; font-size: 15px; font-weight: 600;
    background: $navy; color: #fff; border: none; cursor: pointer; font-family: 'Outfit', sans-serif;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.32s both;

    &:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba($navy, 0.2); }
    &:active:not(:disabled) { transform: translateY(0) scale(0.98); }
    &.loading { background: lighten($navy, 5%); }
    &.success { background: $success; }
    &:disabled { cursor: not-allowed; }
  }

  &__spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
  &__check { animation: checkPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
  &__footer { text-align: center; font-size: 14px; color: #9a9a9a; margin-top: 24px; animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.38s both; }
  &__link { color: $gold; font-weight: 600; transition: opacity 0.2s; &:hover { opacity: 0.7; } }

  &__success {
    position: fixed; inset: 0; background: rgba($navy, 0.3); backdrop-filter: blur(12px);
    display: flex; align-items: center; justify-content: center; z-index: 9999;

    &-card {
      background: #fff; border-radius: 24px; padding: 48px; text-align: center;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
      animation: successBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      h3 { font-family: 'Playfair Display', serif; font-size: 24px; color: $navy; margin-bottom: 8px; }
      p { font-size: 14px; color: #9a9a9a; }
    }

    &-icon {
      width: 72px; height: 72px; border-radius: 50%; background: rgba($success, 0.1);
      display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;
      animation: successBounce 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  }
}

@keyframes spin { to { transform: rotate(360deg); } }
@keyframes successBounce { 0% { transform: scale(0); opacity: 0; } 60% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
@keyframes checkPop { 0% { transform: scale(0); } 100% { transform: scale(1); } }
@keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }

@media (max-width: 768px) { .auth-page { &__visual { display: none; } } }
</style>
