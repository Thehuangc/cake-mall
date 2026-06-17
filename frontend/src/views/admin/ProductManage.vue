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
      <el-input v-model="searchKeyword" placeholder="搜索商品…" clearable class="search-input" @keyup.enter="handleSearch">
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="selectedCategory" placeholder="选择分类" clearable class="category-select">
        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 商品表格 -->
    <el-table :data="products" class="product-table" v-loading="loading">
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column label="图片" width="100">
        <template #default="{ row }">
          <div class="table-image" @click="previewImage(row.image)">
            <img :src="row.image" :alt="row.name" />
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="商品名称" min-width="140" />
      <el-table-column label="分类" width="110">
        <template #default="{ row }">
          <el-tag size="small" effect="plain">{{ row.category?.name || '-' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="价格" width="130">
        <template #default="{ row }">
          <div class="price-cell">
            <span class="price">¥{{ row.price }}</span>
            <span v-if="row.original_price" class="original">¥{{ row.original_price }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="stock" label="库存" width="80">
        <template #default="{ row }">
          <span :class="{ low: row.stock < 10 }">{{ row.stock }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sales" label="销量" width="80" />
      <el-table-column label="状态" width="80">
        <template #default="{ row }">
          <el-switch v-model="row.status" :active-value="1" :inactive-value="0" size="small" @change="handleStatusChange(row)" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="{ row }">
          <el-button type="primary" plain size="small" class="action-btn edit-btn" @click="handleEdit(row)">
            <el-icon><Edit /></el-icon> 编辑
          </el-button>
          <el-button type="danger" plain size="small" class="action-btn delete-btn" @click="handleDelete(row)">
            <el-icon><Delete /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination" v-if="total > 10">
      <el-pagination v-model:current-page="currentPage" :total="total" :page-size="10" layout="total, prev, pager, next" @current-change="fetchProducts" />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑商品' : '添加商品'" width="860px" class="product-dialog" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="24">
          <!-- 左侧：基本信息 -->
          <el-col :span="14">
            <el-form-item label="商品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入商品名称" size="large" maxlength="100" show-word-limit />
            </el-form-item>
            <el-form-item label="分类" prop="category_id">
              <el-select v-model="form.category_id" placeholder="请选择分类" size="large" style="width:100%">
                <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
            <el-row :gutter="12">
              <el-col :span="8">
                <el-form-item label="价格 ¥" prop="price">
                  <el-input-number v-model="form.price" :min="0" :precision="2" :controls="false" size="large" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="原价">
                  <el-input-number v-model="form.original_price" :min="0" :precision="2" :controls="false" size="large" style="width:100%" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="库存" prop="stock">
                  <el-input-number v-model="form.stock" :min="0" :controls="false" size="large" style="width:100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="商品描述">
              <el-input v-model="form.description" type="textarea" :rows="5" placeholder="请输入商品描述，支持多行文本" maxlength="2000" show-word-limit />
            </el-form-item>
          </el-col>

          <!-- 右侧：图片 -->
          <el-col :span="10">
            <el-form-item label="商品图片" prop="image">
              <!-- 图片预览区 -->
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                style="display:none"
                @change="handleFilePicked"
              />
              <div class="image-upload-area" :class="{ 'has-image': form.image, uploading: uploading }">
                <div v-if="form.image" class="image-preview" @click="openFilePicker">
                  <img :src="form.image" alt="预览" />
                  <div class="image-actions" @click.stop>
                    <el-button size="small" circle @click="openFilePicker" title="本地上传">
                      <el-icon><Upload /></el-icon>
                    </el-button>
                    <el-button size="small" circle @click="showImagePicker = true" title="URL/图库">
                      <el-icon><Picture /></el-icon>
                    </el-button>
                    <el-button size="small" circle type="danger" @click="form.image = ''" title="删除">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="upload-progress" v-if="uploading">
                    <div class="progress-bar"></div>
                  </div>
                </div>
                <div v-else class="image-placeholder" @click="openFilePicker">
                  <el-icon :size="40"><Upload /></el-icon>
                  <span>点击本地上传</span>
                  <span class="or-text" @click.stop="showImagePicker = true">或选择URL</span>
                </div>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '保存修改' : '添加商品' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 图片选择器弹窗 -->
    <el-dialog v-model="showImagePicker" title="选择图片" width="640px" class="image-picker-dialog">
      <el-tabs v-model="pickerTab">
        <el-tab-pane label="粘贴URL" name="url">
          <div class="url-input-area">
            <el-input v-model="imageUrlInput" placeholder="粘贴图片URL地址" size="large" @keyup.enter="applyImageUrl">
              <template #append>
                <el-button @click="applyImageUrl">应用</el-button>
              </template>
            </el-input>
            <div class="url-preview" v-if="imageUrlInput">
              <img :src="imageUrlInput" alt="预览" @error="imageUrlError = true" />
              <p v-if="imageUrlError" class="error-text">图片加载失败，请检查URL</p>
            </div>
          </div>
        </el-tab-pane>
        <el-tab-pane label="推荐图片" name="gallery">
          <div class="image-gallery">
            <div
              v-for="(img, i) in presetImages"
              :key="i"
              class="gallery-item"
              :class="{ selected: imageUrlInput === img.url }"
              @click="imageUrlInput = img.url"
            >
              <img :src="img.url" :alt="img.label" />
              <span class="gallery-label">{{ img.label }}</span>
              <div class="gallery-check" v-if="imageUrlInput === img.url">
                <el-icon><Check /></el-icon>
              </div>
            </div>
          </div>
          <div class="gallery-actions">
            <el-button type="primary" @click="applyImageUrl" :disabled="!imageUrlInput">使用选中图片</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>

    <!-- 图片预览弹窗 -->
    <el-dialog v-model="showPreview" title="" width="auto" class="preview-dialog" :show-close="true">
      <img :src="previewSrc" alt="预览" style="max-width:80vw; max-height:80vh; border-radius:12px;" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Check, Picture, Upload } from '@element-plus/icons-vue'
import { adminApi } from '@/api/admin'
import { categoryApi } from '@/api/category'

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploading = ref(false)

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

// 图片选择器
const showImagePicker = ref(false)
const pickerTab = ref('url')
const imageUrlInput = ref('')
const imageUrlError = ref(false)
const showPreview = ref(false)
const previewSrc = ref('')

const presetImages = [
  { url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80', label: '草莓奶油' },
  { url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80', label: '巧克力慕斯' },
  { url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=600&q=80', label: '抹茶千层' },
  { url: 'https://images.unsplash.com/photo-1535254973040-607b474cb50d?auto=format&fit=crop&w=600&q=80', label: '婚礼蛋糕' },
  { url: 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?auto=format&fit=crop&w=600&q=80', label: '法式马卡龙' },
  { url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80', label: '全麦吐司' },
  { url: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=600&q=80', label: '水果蛋糕' },
  { url: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=600&q=80', label: '芝士蛋糕' },
  { url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', label: '巧克力蛋糕' },
  { url: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80', label: '草莓甜点' },
  { url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80', label: '冰淇淋蛋糕' },
  { url: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&w=600&q=80', label: '甜甜圈' },
]

const form = reactive({
  name: '',
  category_id: null as number | null,
  price: 0, original_price: 0, stock: 0,
  image: '', description: '',
})

const rules = {
  name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
  category_id: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
  image: [{ required: true, message: '请选择商品图片', trigger: 'blur' }],
}

onMounted(async () => {
  await fetchCategories()
  await fetchProducts()
})

const fetchCategories = async () => {
  try { categories.value = (await categoryApi.getAll()) as any[] } catch (e) { console.error(e) }
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const params: any = { page: currentPage.value, limit: 10 }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (selectedCategory.value) params.category_id = selectedCategory.value
    const res: any = await adminApi.getProducts(params)
    products.value = res.items; total.value = res.total
  } catch (e) { console.error(e) }
  finally { loading.value = false }
}

const handleSearch = () => { currentPage.value = 1; fetchProducts() }
const handleReset = () => { searchKeyword.value = ''; selectedCategory.value = ''; handleSearch() }

const handleAdd = () => {
  isEdit.value = false; editingId.value = null
  form.name = ''; form.category_id = null; form.price = 0; form.original_price = 0
  form.stock = 0; form.image = ''; form.description = ''
  imageUrlError.value = false
  dialogVisible.value = true
}

const handleEdit = (product: any) => {
  isEdit.value = true; editingId.value = product.id
  form.name = product.name; form.category_id = product.category_id
  form.price = Number(product.price); form.original_price = Number(product.original_price || 0)
  form.stock = product.stock; form.image = product.image || ''
  form.description = product.description || ''
  imageUrlError.value = false
  dialogVisible.value = true
}

const handleDelete = async (product: any) => {
  try {
    await ElMessageBox.confirm(`确定删除「${product.name}」？`, '提示', { type: 'warning' })
    await adminApi.deleteProduct(product.id)
    ElMessage.success('删除成功')
    fetchProducts()
  } catch {}
}

const handleStatusChange = async (product: any) => {
  try {
    await adminApi.updateProduct(product.id, { status: product.status })
    ElMessage.success('状态更新成功')
  } catch (e) { product.status = product.status === 1 ? 0 : 1; console.error(e) }
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFilePicked = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // 检查文件大小
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('图片大小不能超过5MB')
    target.value = ''
    return
  }

  uploading.value = true
  try {
    const res: any = await adminApi.uploadImage(file)
    form.image = res.url
    imageUrlError.value = false
    ElMessage.success('上传成功')
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || '上传失败，请检查网络连接'
    ElMessage.error(msg)
  } finally {
    uploading.value = false
    target.value = ''
  }
}

const applyImageUrl = () => {
  if (!imageUrlInput.value) return
  form.image = imageUrlInput.value
  imageUrlError.value = false
  showImagePicker.value = false
}

const previewImage = (url: string) => {
  previewSrc.value = url
  showPreview.value = true
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
  } catch (e: any) {
    if (e.response?.data?.message) ElMessage.error(e.response.data.message)
  } finally { submitting.value = false }
}
</script>

<style scoped lang="scss">
$navy: #1a1f36;
$gold: #c9a96e;

.product-manage { animation: fadeIn 0.4s ease; }

.page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
  h2 { font-size: 20px; color: $navy; font-weight: 600; }
}

.search-bar {
  background: #fff; padding: 16px 20px; border-radius: 12px; margin-bottom: 20px;
  display: flex; gap: 12px; align-items: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  .search-input { width: 240px; }
  .category-select { width: 140px; }
}

.product-table {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  .table-image {
    width: 56px; height: 56px; border-radius: 10px; overflow: hidden; cursor: pointer;
    transition: transform 0.2s;
    &:hover { transform: scale(1.05); }
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .price-cell { .price { color: $navy; font-weight: 700; font-size: 15px; } .original { color: #ccc; text-decoration:line-through; font-size: 12px; margin-left: 6px; } }
  .low { color: #c45b5b; font-weight: 600; }
}

.pagination { margin-top: 20px; display: flex; justify-content: flex-end; }

// 图片上传区
.image-upload-area {
  border: 2px dashed #e0dcd6; border-radius: 14px; overflow: hidden;
  transition: all 0.3s; min-height: 220px;
  &:hover { border-color: $gold; background: rgba($gold, 0.02); }
  &.has-image { border-style: solid; border-color: #e8e4de; }
}

.image-placeholder {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 220px; cursor: pointer; color: #c0bdb6; gap: 10px;
  font-size: 13px; transition: color 0.2s;
  &:hover { color: $gold; }
}

.image-preview {
  position: relative;
  img { width: 100%; height: 220px; object-fit: cover; display: block; }
  .image-actions {
    position: absolute; top: 8px; right: 8px; display: flex; gap: 6px;
    .el-button { background: rgba(255,255,255,0.9); border: none; }
  }
}

// 图片选择器
.image-gallery {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;
}
.gallery-item {
  position: relative; border-radius: 12px; overflow: hidden; cursor: pointer;
  border: 3px solid transparent; transition: all 0.25s;
  &:hover { border-color: $gold; }
  &.selected { border-color: $navy; }
  img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
  .gallery-label {
    position: absolute; bottom: 0; left: 0; right: 0; padding: 6px 8px;
    background: linear-gradient(transparent, rgba(0,0,0,0.6)); color: #fff;
    font-size: 11px; text-align: center;
  }
  .gallery-check {
    position: absolute; top: 6px; right: 6px; width: 24px; height: 24px;
    border-radius: 50%; background: $navy; color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
}
.gallery-actions { display: flex; justify-content: center; }
.url-input-area { .url-preview { margin-top: 12px; border-radius: 10px; overflow: hidden; img { width:100%; max-height:200px; object-fit:cover; } } }
.error-text { color: #c45b5b; font-size: 13px; text-align: center; padding: 12px; }

// 操作按钮
.action-btn {
  border-radius: 8px; font-weight: 600; letter-spacing: 0.02em;
  transition: all 0.25s;
  &.edit-btn {
    border-color: $navy; color: $navy;
    &:hover { background: $navy; color: #fff; transform: translateY(-1px); box-shadow: 0 4px 12px rgba($navy, 0.2); }
  }
  &.delete-btn {
    &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(#c45b5b, 0.2); }
  }
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
