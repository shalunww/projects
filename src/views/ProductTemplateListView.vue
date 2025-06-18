<template>
  <div class="product-template-list-container">
    <h1>商品管理</h1>

    <el-card class="search-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入商品名称或型号搜索"
            clearable
            @clear="fetchProductTemplates"
            @keyup.enter="fetchProductTemplates"
          />
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchCategoryId" placeholder="选择商品类别" clearable @change="fetchProductTemplates">
            <el-option
              v-for="category in productCategories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="searchSupplierId" placeholder="选择供应商" clearable @change="fetchProductTemplates">
            <el-option
              v-for="supplier in suppliers"
              :key="supplier.id"
              :label="supplier.supplierName"
              :value="supplier.id"
            ></el-option>
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :icon="Search" @click="fetchProductTemplates">搜索</el-button>
          <el-button type="success" :icon="Plus" @click="openDialog('add')">新增</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="productTemplateList"
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="productName" label="商品名称" width="150"></el-table-column>
        <el-table-column prop="model" label="型号" width="120"></el-table-column>
        <el-table-column prop="categoryName" label="商品类别" width="120">
            <template #default="scope">
                {{ getCategoryNameById(scope.row.categoryId) }}
            </template>
        </el-table-column>
        <el-table-column prop="supplierName" label="供应商" width="120">
             <template #default="scope">
                {{ getSupplierNameById(scope.row.supplierId) }}
            </template>
        </el-table-column>
        <el-table-column prop="purchasePrice" label="采购价" width="100"></el-table-column>
        <el-table-column prop="salePrice" label="销售价" width="100"></el-table-column>
        <el-table-column prop="warrantyPeriod" label="保修期(月)" width="120"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              :icon="Edit"
              @click="openDialog('edit', scope.row)"
            >编辑</el-button>
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row.id)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        background
      >
      </el-pagination>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      :before-close="handleClose"
    >
      <el-form
        :model="currentProductTemplate"
        :rules="rules"
        ref="productTemplateFormRef"
        label-width="100px"
      >
        <el-form-item label="商品名称" prop="productName">
          <el-input v-model="currentProductTemplate.productName" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="currentProductTemplate.model" placeholder="请输入商品型号"></el-input>
        </el-form-item>
        <el-form-item label="商品类别" prop="categoryId">
          <el-select v-model="currentProductTemplate.categoryId" placeholder="请选择商品类别" style="width: 100%;">
            <el-option
              v-for="category in productCategories"
              :key="category.id"
              :label="category.categoryName"
              :value="category.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="供应商" prop="supplierId">
          <el-select v-model="currentProductTemplate.supplierId" placeholder="请选择供应商" style="width: 100%;">
            <el-option
              v-for="supplier in suppliers"
              :key="supplier.id"
              :label="supplier.supplierName"
              :value="supplier.id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="采购价" prop="purchasePrice">
          <el-input-number v-model="currentProductTemplate.purchasePrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="销售价" prop="salePrice">
          <el-input-number v-model="currentProductTemplate.salePrice" :min="0" :precision="2" :step="0.01" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="保修期(月)" prop="warrantyPeriod">
          <el-input-number v-model="currentProductTemplate.warrantyPeriod" :min="0" :precision="0" :step="1" style="width: 100%;"></el-input-number>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentProductTemplate.description"
            type="textarea"
            :rows="3"
            placeholder="请输入商品描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitProductTemplateForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'; // 引入 nextTick
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';

import {
  getProductTemplatesPageApi,
  createProductTemplateApi,
  updateProductTemplateApi,
  deleteProductTemplateApi,
} from '@/api/productTemplate';

import { getAllProductCategoriesApi } from '@/api/productCategory';
// 【重要】您需要有一个 supplier.js 和 getAllSuppliersApi 来获取供应商列表
// 假设您已经创建了或将要创建 supplier.js 文件
import { getAllSuppliersApi } from '@/api/supplier'; // 取消注释，假设您已创建此API


const productTemplateList = ref([]);
const productCategories = ref([]); // 商品类别列表
const suppliers = ref([]); // 供应商列表，初始为空数组

const loading = ref(false);
const searchKeyword = ref('');
const searchCategoryId = ref(null); // 新增搜索条件：商品类别ID
const searchSupplierId = ref(null); // 新增搜索条件：供应商ID

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEditMode = ref(false);
const currentProductTemplate = reactive({
  id: null,
  productName: '',
  model: '',
  categoryId: null,
  supplierId: null,
  purchasePrice: 0,
  salePrice: 0,
  warrantyPeriod: 0,
  description: '',
  createTime: '',
  updateTime: '',
});
const productTemplateFormRef = ref(null);

const rules = reactive({
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  model: [
    { required: true, message: '请输入商品型号', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  categoryId: [
    { required: true, message: '请选择商品类别', trigger: 'change' },
  ],
  supplierId: [
    { required: true, message: '请选择供应商', trigger: 'change' },
  ],
  purchasePrice: [
    { required: true, message: '请输入采购价', trigger: 'blur' },
    { type: 'number', message: '采购价必须为数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('采购价不能为负数'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  salePrice: [
    { required: true, message: '请输入销售价', trigger: 'blur' },
    { type: 'number', message: '销售价必须为数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('销售价不能为负数'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  warrantyPeriod: [
    { required: true, message: '请输入保修期', trigger: 'blur' },
    { type: 'number', message: '保修期必须为数字', trigger: 'blur' },
    { validator: (rule, value, callback) => {
      if (value < 0) {
        callback(new Error('保修期不能为负数'));
      } else {
        callback();
      }
    }, trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' },
  ],
});

const getCategoryNameById = computed(() => (categoryId) => {
  const category = productCategories.value.find(c => c.id === categoryId);
  return category ? category.categoryName : '未知类别';
});

const getSupplierNameById = computed(() => (supplierId) => {
  const supplier = suppliers.value.find(s => s.id === supplierId);
  return supplier ? supplier.supplierName : '未知供应商';
});


onMounted(() => {
  fetchProductTemplates();
  fetchProductCategories();
  fetchSuppliers(); // 调用获取供应商列表的方法
});

const fetchProductTemplates = async () => {
  loading.value = true;
  try {
    const responseData = await getProductTemplatesPageApi({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
      categoryId: searchCategoryId.value, // 传递类别ID搜索条件
      supplierId: searchSupplierId.value, // 传递供应商ID搜索条件
    });
    productTemplateList.value = responseData.list;
    pagination.total = responseData.total;
    pagination.pageNum = responseData.pageNum;
    pagination.pageSize = responseData.pageSize;
  } catch (error) {
    console.error('获取商品模板失败:', error);
    ElMessage.error('获取商品模板失败，请稍后再试。');
  } finally {
    loading.value = false;
  }
};

const fetchProductCategories = async () => {
    try {
        const response = await getAllProductCategoriesApi();
        productCategories.value = response;
    } catch (error) {
        console.error('获取商品类别失败:', error);
        ElMessage.error('获取商品类别失败，请检查后端服务。');
    }
};

const fetchSuppliers = async () => {
    try {
        // 【重要】这里假设您有一个供应商API接口 getAllSuppliersApi
        // 如果您还没有供应商模块的后端和API，这里需要您自己实现
        // 暂时用一个模拟数据，您可以替换成实际的API调用
        const response = await getAllSuppliersApi(); // 取消注释，调用实际API
        suppliers.value = response;

        // 如果没有后端或API，可以使用模拟数据进行前端开发
        // suppliers.value = [
        //     { id: 1, supplierName: '模拟供应商A' },
        //     { id: 2, supplierName: '模拟供应商B' },
        //     { id: 3, supplierName: '模拟供应商C' }
        // ];
    } catch (error) {
        console.error('获取供应商失败:', error);
        ElMessage.error('获取供应商失败，请检查后端服务。');
        // 在API调用失败时，仍然可以提供模拟数据，以便前端界面不完全空白
        suppliers.value = [
            { id: 1, supplierName: '模拟供应商X' },
            { id: 2, supplierName: '模拟供应商Y' },
        ];
    }
};


const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  fetchProductTemplates();
};

const handleCurrentChange = (newPage) => {
  pagination.pageNum = newPage;
  fetchProductTemplates();
};

const openDialog = (mode, row = {}) => {
  dialogVisible.value = true;
  isEditMode.value = mode === 'edit';
  dialogTitle.value = isEditMode.value ? '编辑商品' : '新增商品';

  if (isEditMode.value) {
    Object.assign(currentProductTemplate, row);
  } else {
    Object.assign(currentProductTemplate, {
      id: null,
      productName: '',
      model: '',
      categoryId: null,
      supplierId: null,
      purchasePrice: 0,
      salePrice: 0,
      warrantyPeriod: 0,
      description: '',
      createTime: '',
      updateTime: '',
    });
  }
  // 确保在对话框完全渲染且数据设置完毕后才重置表单校验
  nextTick(() => {
    if (productTemplateFormRef.value) {
      productTemplateFormRef.value.resetFields();
    }
  });
};

const handleClose = () => {
  ElMessageBox.confirm('确认关闭？')
    .then(() => {
      dialogVisible.value = false;
      nextTick(() => { // 同样在关闭时确保重置表单
        if (productTemplateFormRef.value) {
          productTemplateFormRef.value.resetFields();
        }
      });
    })
    .catch(() => {
      // 取消关闭
    });
};

const submitProductTemplateForm = () => {
  productTemplateFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let message;
        if (isEditMode.value) {
          message = await updateProductTemplateApi(currentProductTemplate);
        } else {
          message = await createProductTemplateApi(currentProductTemplate);
        }
        ElMessage.success(message);
        dialogVisible.value = false;
        fetchProductTemplates(); // 刷新列表
      } catch (error) {
        console.error('提交失败:', error);
        ElMessage.error(error.message || '操作失败，请稍后再试。');
      }
    } else {
      ElMessage.warning('请检查表单输入！');
      return false;
    }
  });
};

const handleDelete = (id) => {
  ElMessageBox.confirm('此操作将永久删除该商品, 是否继续?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const message = await deleteProductTemplateApi(id);
        ElMessage.success(message);
        fetchProductTemplates(); // 刷新列表
      } catch (error) {
        console.error('删除失败:', error);
        ElMessage.error('删除失败，请稍后再试。');
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};
</script>

<style scoped>
.product-template-list-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>