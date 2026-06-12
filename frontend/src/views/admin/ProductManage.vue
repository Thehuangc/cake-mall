<template>
  <div class="product-manage">
    <div class="page-header">
      <h2>商品管理</h2>
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        添加商品
      </el-button>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="搜索商品名称..."
        clearable
        class="search-input"
        @keyup.enter="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-select v-model="selectedCategory" placeholder="选择分类" clearable class="category-select">
        <el-option
          v-for="item in categories"
          :key="item.id"
          :label="item.name"
          :value="item.id"
        />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 商品表格 -->
    <el-table :data="products" style="width: 100%" class="product-table" v-loading="loading">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column label="商品图片" width="100">
        <template #default="{ row }">
          <el-image
            :src="row.image"
            :preview-src-list="[row.image]"
            fit="cover"
            class="product-image"
          >
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="150" />
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.category?.name || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <div class="price-info">
            <span class="current-price">¥{{ row.price }}</span>
            <span class="original-price" v-if="row.original_price">¥{{ row.original_price }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="100">
        <template #default="{ row }">
          <span :class="{ low: row.stock < 10 }">{{ row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
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

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        :total="total"
        :page-size="10"
        layout="total, prev, pager, next"
        @current-change="fetchProducts"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="700px"
      class="product-dialog"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="form.category_id" placeholder="请选择分类" style="width: 100%">
                <el-option
                  v-for="item in categories"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="价格" prop="price">
              <el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="原价">
              <el-input-number v-model="form.original_price" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="库存" prop="stock">
              <el-input-number v-model="form.stock" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="商品图片" prop="image">
          <div class="image-input-wrapper">
            <el-input v-model="form.image" placeholder="请输入图片URL" @input="handleImagePreview" />
            <div class="image-preview" v-if="form.image">
              <el-image :src="form.image" fit="cover" class="preview-image">
                <template #error>
                  <div class="preview-error">
                    <el-icon><Picture /></el-icon>
                    <span>图片加载失败</span>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="商品描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入商品描述" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存修改' : '添加商品' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Picture } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { categoryApi } from '@/api/category'

const products = ref<any[]>([])
const categories = ref<any[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const searchKeyword = ref('')
const selectedCategory = ref<number | ''>('')
const dialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref()
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  category_id: null as number | null,
  price: 0,
  original_price: 0,
  stock: 0,
  image: '',
  description: '',
})

const rules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
  ],
  image: [
    { required: true, message: '请输入图片URL', trigger: 'blur' },
  ],
}

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})

const fetchCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    categories.value = res as any[]
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const params: any = {
      page: currentPage.value,
      limit: 10,
    }
    if (searchKeyword.value) {
      params.keyword = searchKeyword.value
    }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }

    const res: any = await adminApi.getProducts(params)
    products.value = res.items
    total.value = res.total
  } catch (error) {
    console.error('获取商品失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
  fetchProducts()
}

const handleReset = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  handleSearch()
}

const resetForm = () => {
  form.name = ''
  form.category_id = null
  form.price = 0
  form.original_price = 0
  form.stock = 0
  form.image = ''
  form.description = ''
}

const handleAdd = () => {
  isEdit.value = false
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (product: any) => {
  isEdit.value = true
  editingId.value = product.id
  form.name = product.name
  form.category_id = product.category_id
  form.price = Number(product.price)
  form.original_price = Number(product.original_price || 0)
  form.stock = product.stock
  form.image = product.image || ''
  form.description = product.description || ''
  dialogVisible.value = true
}

const handleDelete = async (product: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${product.name}"吗？`,
      '提示',
      { type: 'warning' }
    )
    await adminApi.deleteProduct(product.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch {
    // 取消
  }
}

const handleStatusChange = async (product: any) => {
  try {
    await adminApi.updateProduct(product.id, { status: product.status })
    ElMessage.success('状态更新成功')
  } catch (error) {
    product.status = product.status === 1 ? 0 : 1
    ElMessage.error('更新状态失败')
  }
}

const handleImagePreview = () => {
  // 图片URL变化时自动预览（由模板中的响应式绑定处理）
}

const handleSubmit = async () => {
  try {
    await formRef.value?.validate()
    submitting.value = true

    const submitData = {
      ...form,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      stock: Number(form.stock),
    }

    if (isEdit.value && editingId.value) {
      await adminApi.updateProduct(editingId.value, submitData)
      ElMessage.success('更新成功')
    } else {
      await adminApi.createProduct(submitData)
      ElMessage.success('添加成功')
    }

    dialogVisible.value = false
    fetchProducts()
  } catch (error: any) {
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.product-manage {
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

  .category-select {
    width: 150px;
  }
}

.product-table {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .product-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
  }

  .image-error {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f5f5;
    color: #ccc;
    font-size: 20px;
  }

  .price-info {
    .current-price {
      color: #ff6b6b;
      font-weight: 600;
    }

    .original-price {
      color: #999;
      text-decoration: line-through;
      font-size: 12px;
      margin-left: 8px;
    }
  }

  .low {
    color: #ff6b6b;
    font-weight: 600;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-dialog {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
  }

  .image-input-wrapper {
    width: 100%;

    .image-preview {
      margin-top: 12px;
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;

      .preview-image {
        width: 100%;
        height: 200px;
        display: block;
      }

      .preview-error {
        width: 100%;
        height: 200px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #f9f9f9;
        color: #ccc;

        .el-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        span {
          font-size: 12px;
        }
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
