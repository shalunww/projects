<template>
  <div class="product-category-list-container">
    <h1>商品类别管理</h1>

    <el-card class="search-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入类别名称或描述进行搜索"
            clearable
            @clear="fetchCategories"
            @keyup.enter="fetchCategories"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :icon="Search" @click="fetchCategories">搜索</el-button>
        </el-col>
        <el-col :span="4">
          <el-button type="success" :icon="Plus" @click="openDialog('add')">新增类别</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="categoryList"
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="categoryName" label="类别名称" width="180"></el-table-column>
        <el-table-column prop="description" label="描述"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" align="center">
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
      width="500px"
      :before-close="handleClose"
    >
      <el-form
        :model="currentCategory"
        :rules="rules"
        ref="categoryFormRef"
        label-width="100px"
      >
        <el-form-item label="类别名称" prop="categoryName">
          <el-input v-model="currentCategory.categoryName" placeholder="请输入类别名称"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentCategory.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitCategoryForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue'; // 导入图标

// 导入 API 服务
import {
  getProductCategoriesPageApi,
  createProductCategoryApi,
  updateProductCategoryApi,
  deleteProductCategoryApi,
} from '@/api/productCategory'; // 确保路径正确

// 数据
const categoryList = ref([]);
const loading = ref(false);
const searchKeyword = ref('');
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 对话框相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEditMode = ref(false); // 标记是否为编辑模式
const currentCategory = reactive({
  id: null,
  categoryName: '',
  description: '',
  createTime: '',
  updateTime: '',
});
const categoryFormRef = ref(null); // 表单引用

// 表单验证规则
const rules = reactive({
  categoryName: [
    { required: true, message: '请输入类别名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' },
  ],
});

// 生命周期钩子
onMounted(() => {
  fetchCategories();
});

// 方法
const fetchCategories = async () => {
  loading.value = true;
  try {
    const responseData = await getProductCategoriesPageApi({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
    });
    categoryList.value = responseData.list;
    pagination.total = responseData.total;
    pagination.pageNum = responseData.pageNum; // 确保页码更新
    pagination.pageSize = responseData.pageSize; // 确保每页大小更新
  } catch (error) {
    console.error('获取商品类别失败:', error);
    ElMessage.error('获取商品类别失败，请稍后再试。');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  fetchCategories();
};

const handleCurrentChange = (newPage) => {
  pagination.pageNum = newPage;
  fetchCategories();
};

const openDialog = (mode, row = {}) => {
  dialogVisible.value = true;
  isEditMode.value = mode === 'edit';
  dialogTitle.value = isEditMode.value ? '编辑商品类别' : '新增商品类别';

  if (isEditMode.value) {
    // 编辑模式，拷贝数据到表单
    Object.assign(currentCategory, row);
  } else {
    // 新增模式，清空表单
    Object.assign(currentCategory, {
      id: null,
      categoryName: '',
      description: '',
      createTime: '',
      updateTime: '',
    });
  }
  // 重置表单验证状态
  if (categoryFormRef.value) {
    categoryFormRef.value.resetFields();
  }
};

const handleClose = () => {
  ElMessageBox.confirm('确认关闭？')
    .then(() => {
      dialogVisible.value = false;
      // 可选：关闭时重置表单，避免下次打开显示上次数据
      if (categoryFormRef.value) {
        categoryFormRef.value.resetFields();
      }
    })
    .catch(() => {
      // 取消关闭
    });
};

const submitCategoryForm = () => {
  categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let message;
        if (isEditMode.value) {
          message = await updateProductCategoryApi(currentCategory);
        } else {
          message = await createProductCategoryApi(currentCategory);
        }
        ElMessage.success(message);
        dialogVisible.value = false;
        fetchCategories(); // 刷新列表
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
  ElMessageBox.confirm('此操作将永久删除该商品类别, 是否继续?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const message = await deleteProductCategoryApi(id);
        ElMessage.success(message);
        fetchCategories(); // 刷新列表
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
.product-category-list-container {
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