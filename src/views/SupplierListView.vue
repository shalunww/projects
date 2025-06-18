<template>
  <div class="supplier-list-container">
    <h1>供应商管理</h1>

    <el-card class="search-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入供应商名称、联系人、电话或地址搜索"
            clearable
            @clear="fetchSuppliers"
            @keyup.enter="fetchSuppliers"
          />
        </el-col>
        <el-col :span="4">
          <el-button type="primary" :icon="Search" @click="fetchSuppliers">搜索</el-button>
          <el-button type="success" :icon="Plus" @click="openDialog('add')">新增</el-button>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="supplierList"
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="supplierName" label="供应商名称" width="180"></el-table-column>
        <el-table-column prop="contactPerson" label="联系人" width="120"></el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="description" label="描述" show-overflow-tooltip></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180"></el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
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
        :model="currentSupplier"
        :rules="rules"
        ref="supplierFormRef"
        label-width="100px"
      >
        <el-form-item label="供应商名称" prop="supplierName">
          <el-input v-model="currentSupplier.supplierName" placeholder="请输入供应商名称"></el-input>
        </el-form-item>
        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="currentSupplier.contactPerson" placeholder="请输入联系人"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input v-model="currentSupplier.contactPhone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="currentSupplier.address" placeholder="请输入供应商地址"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="currentSupplier.description"
            type="textarea"
            :rows="3"
            placeholder="请输入供应商描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitSupplierForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Search, Plus, Edit, Delete } from '@element-plus/icons-vue';

import {
  getSuppliersPageApi,
  createSupplierApi,
  updateSupplierApi,
  deleteSupplierApi,
} from '@/api/supplier';

const supplierList = ref([]);
const loading = ref(false);
const searchKeyword = ref('');

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

const dialogVisible = ref(false);
const dialogTitle = ref('');
const isEditMode = ref(false);
const currentSupplier = reactive({
  id: null,
  supplierName: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  description: '',
  createTime: '',
  updateTime: '',
});
const supplierFormRef = ref(null);

const rules = reactive({
  supplierName: [
    { required: true, message: '请输入供应商名称', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  contactPerson: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码', trigger: 'blur' },
  ],
  address: [
    { required: true, message: '请输入供应商地址', trigger: 'blur' },
    { max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' },
  ],
});

onMounted(() => {
  fetchSuppliers();
});

const fetchSuppliers = async () => {
  loading.value = true;
  try {
    const responseData = await getSuppliersPageApi({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
    });
    supplierList.value = responseData.list;
    pagination.total = responseData.total;
    pagination.pageNum = responseData.pageNum;
    pagination.pageSize = responseData.pageSize;
  } catch (error) {
    console.error('获取供应商失败:', error);
    ElMessage.error('获取供应商失败，请稍后再试。');
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  fetchSuppliers();
};

const handleCurrentChange = (newPage) => {
  pagination.pageNum = newPage;
  fetchSuppliers();
};

const openDialog = (mode, row = {}) => {
  dialogVisible.value = true;
  isEditMode.value = mode === 'edit';
  dialogTitle.value = isEditMode.value ? '编辑供应商' : '新增供应商';

  if (isEditMode.value) {
    // 深度拷贝，避免直接修改表格数据
    Object.assign(currentSupplier, JSON.parse(JSON.stringify(row)));
  } else {
    // 重置表单
    Object.assign(currentSupplier, {
      id: null,
      supplierName: '',
      contactPerson: '',
      contactPhone: '',
      address: '',
      description: '',
      createTime: '',
  updateTime: '',
    });
  }
  // 清除表单校验，确保新开对话框时没有残留的校验信息
  if (supplierFormRef.value) {
    supplierFormRef.value.resetFields();
  }
};

const handleClose = () => {
  ElMessageBox.confirm('确认关闭？')
    .then(() => {
      dialogVisible.value = false;
      if (supplierFormRef.value) {
        supplierFormRef.value.resetFields();
      }
    })
    .catch(() => {
      // 取消关闭
    });
};

const submitSupplierForm = () => {
  supplierFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let message;
        if (isEditMode.value) {
          message = await updateSupplierApi(currentSupplier);
        } else {
          message = await createSupplierApi(currentSupplier);
        }
        ElMessage.success(message);
        dialogVisible.value = false;
        fetchSuppliers(); // 刷新列表
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
  ElMessageBox.confirm('此操作将永久删除该供应商, 是否继续?', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const message = await deleteSupplierApi(id);
        ElMessage.success(message);
        fetchSuppliers(); // 刷新列表
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
.supplier-list-container {
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