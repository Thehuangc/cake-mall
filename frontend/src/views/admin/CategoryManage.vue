<template>
  <div class="category-manage">
    <div class="page-header">
      <h2>分类管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加分类
      </el-button>
    </div>

    <!-- 分类表格 -->
    <el-table :data="categories" style="width: 100%" class="category-table" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="icon" label="图标" width="100">
        <template #default="{ row }">
          <span class="category-icon">{{ row.icon }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="分类名称" />
      <el-table-column prop="sort_order" label="排序" width="120" />
      <el-table-column prop="created_at" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.created_at) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" text size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button type="danger" text size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑分类' : '添加分类'"
      width="500px"
      class="category-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="请输入图标（如：🎂）" />
        </el-form-item>
        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="form.sort_order" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'

const categories = ref<any[]>([])
const loading = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  icon: '',
  sort_order: 0,
})

const rules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
  ],
  icon: [
    { required: true, message: '请输入图标', trigger: 'blur' },
  ],
}

onMounted(() => {
  fetchCategories()
})

const fetchCategories = async () => {
  loading.value = true
  try {
    const res: any = await adminApi.getCategories()
    categories.value = res
  } catch (error) {
    console.error('获取分类失败:', error)
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  form.name = ''
  form.icon = ''
  form.sort_order = 0
  dialogVisible.value = true
}

const handleEdit = (category: any) => {
  isEdit.value = true
  editingId.value = category.id
  form.name = category.name
  form.icon = category.icon
  form.sort_order = category.sort_order
  dialogVisible.value = true
}

const handleDelete = async (category: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${category.name}"吗？`,
      '提示',
      { type: 'warning' }
    )
    await adminApi.deleteCategory(category.id)
    ElMessage.success('删除成功')
    fetchCategories()
  } catch {
    // 取消
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    if (isEdit.value && editingId.value) {
      await adminApi.updateCategory(editingId.value, form)
      ElMessage.success('更新成功')
    } else {
      await adminApi.createCategory(form)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchCategories()
  } catch (error) {
    console.error('提交失败:', error)
  } finally {
    submitting.value = false
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('zh-CN')
}
</script>

<style scoped lang="scss">
.category-manage {
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

.category-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .category-icon {
    font-size: 32px;
  }
}

.category-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
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
