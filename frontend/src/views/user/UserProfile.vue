<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-page__header animate-fade-up">
        <span class="section-label">My Account</span>
        <h1 class="profile-page__title">个人中心</h1>
      </div>

      <div class="profile-page__layout">
        <!-- Sidebar -->
        <div class="profile-page__sidebar animate-fade-up delay-1">
          <div class="profile-page__user">
            <div class="profile-page__avatar">
              {{ userStore.user?.username?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="profile-page__user-info">
              <h3>{{ userStore.user?.username }}</h3>
              <p>{{ userStore.user?.email }}</p>
            </div>
          </div>
          <nav class="profile-page__nav">
            <button
              class="profile-page__nav-item"
              :class="{ active: activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              <el-icon><User /></el-icon>个人信息
            </button>
            <button
              class="profile-page__nav-item"
              :class="{ active: activeTab === 'orders' }"
              @click="activeTab = 'orders'"
            >
              <el-icon><List /></el-icon>我的订单
            </button>
          </nav>
        </div>

        <!-- Content -->
        <div class="profile-page__content animate-fade-up delay-2">
          <!-- Info -->
          <div v-if="activeTab === 'info'" class="profile-page__card">
            <h3>个人信息</h3>
            <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
              <div class="profile-page__row">
                <el-form-item label="用户名" prop="username">
                  <el-input v-model="form.username" size="large" />
                </el-form-item>
                <el-form-item label="邮箱">
                  <el-input :model-value="userStore.user?.email" size="large" disabled />
                </el-form-item>
              </div>
              <el-form-item label="手机号" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入手机号" size="large" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="saving" @click="saveProfile" size="large">
                  保存修改
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- Orders -->
          <div v-if="activeTab === 'orders'">
            <OrderList />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus'
import { User, List } from '@element-plus/icons-vue'
import OrderList from '@/views/order/OrderList.vue'

const userStore = useUserStore()
const formRef = ref()
const saving = ref(false)
const activeTab = ref('info')

const form = reactive({ username: '', phone: '' })

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 50, message: '2-50个字符', trigger: 'blur' },
  ],
}

onMounted(() => {
  if (userStore.user) {
    form.username = userStore.user.username
    form.phone = userStore.user.phone || ''
  }
})

const saveProfile = async () => {
  try {
    await formRef.value?.validate()
    saving.value = true
    await userApi.updateProfile(form)
    await userStore.fetchProfile()
    ElMessage.success('保存成功')
  } catch (e) { console.error(e) }
  finally { saving.value = false }
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

.profile-page {
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
    grid-template-columns: 260px 1fr;
    gap: 32px;
    align-items: start;
  }

  &__sidebar {
    background: #fff;
    border: 1px solid #f0ece6;
    border-radius: 20px;
    overflow: hidden;
  }

  &__user {
    padding: 28px 24px;
    border-bottom: 1px solid #f0ece6;
    display: flex;
    align-items: center;
    gap: 14px;
  }

  &__avatar {
    width: 48px;
    height: 48px;
    border-radius: 14px;
    background: $navy;
    color: $gold;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: 700;
    font-family: 'Playfair Display', serif;
    flex-shrink: 0;
  }

  &__user-info {
    h3 {
      font-size: 15px;
      font-weight: 600;
      color: $navy;
    }

    p {
      font-size: 12px;
      color: #9a9a9a;
      margin-top: 2px;
    }
  }

  &__nav {
    padding: 8px;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 16px;
    background: none;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #6b6b6b;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'Outfit', sans-serif;

    &:hover {
      background: #f5f3f0;
      color: $navy;
    }

    &.active {
      background: $navy;
      color: #fff;
    }
  }

  &__content {
    min-height: 400px;
  }

  &__card {
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
  }
}

@media (max-width: 768px) {
  .profile-page__layout {
    grid-template-columns: 1fr;
  }

  .profile-page__row {
    grid-template-columns: 1fr;
  }
}
</style>
