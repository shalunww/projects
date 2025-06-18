<template>
  <div class="customer-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>客户列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入关键字搜索 (名称/联系人/电话/地址)"
              clearable
              style="width: 300px; margin-right: 10px;"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            ></el-input>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAddCustomer">新增客户</el-button>
          </div>
        </div>
      </template>

      <el-table :data="customerList" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="customerName" label="客户名称"></el-table-column>
        <el-table-column prop="contactPerson" label="联系人"></el-table-column>
        <el-table-column prop="contactPhone" label="联系电话"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.updateTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center">
          <template #default="{ row }">
            <el-button type="primary" :icon="Edit" size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" :icon="Delete" size="small" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.pageNum"
          :page-sizes="[5, 10, 20, 50]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        ></el-pagination>
      </div>
    </el-card>

    <CustomerFormDialog
      v-model:visible="customerFormDialogVisible"
      :edit-data="currentCustomer"
      @success="fetchCustomerList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
// 移除： import axios from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue';
import CustomerFormDialog from '../components/CustomerFormDialog.vue'; // 确保这个路径是正确的

// 【重要】从 src/api/customer.js 导入所需的 API 函数
import {
  getCustomersPageApi,
  deleteCustomerApi,
  // 假设 CustomerFormDialog 会调用 createCustomerApi 和 updateCustomerApi，所以这里不需要导入
  // 如果 CustomerFormDialog 不处理，那么需要在这里导入并添加 handleSubmitCustomer 方法
} from '../api/customer';

const customerList = ref([]);
const loading = ref(false);
const customerFormDialogVisible = ref(false);
const currentCustomer = ref(null); // 用于新增时为 null，编辑时为客户数据
const searchKeyword = ref('');

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 获取客户列表
const fetchCustomerList = async () => {
  loading.value = true;
  try {
    // 【修改】使用从 customer.js 导入的 API 函数
    const response = await getCustomersPageApi({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
    });

    // 假设后端 PageInfo 返回的数据结构是 { list: [...], total: ..., pageNum: ..., pageSize: ... }
    // 并且 customer.js 的 request 已经处理了 response.data
    customerList.value = response.list || [];
    pagination.total = response.total || 0;
    pagination.pageNum = response.pageNum || 1; // 确保这里更新了实际的页码和每页大小
    pagination.pageSize = response.pageSize || 10;

    if (response.list && response.list.length > 0) {
      ElMessage.success('客户列表加载成功！');
    } else if (searchKeyword.value) {
      ElMessage.info('未找到符合条件的客户。');
    } else {
      ElMessage.info('客户列表为空。');
    }

  } catch (error) {
    console.error('获取客户列表失败:', error);
    // request.js 中的错误处理可能已经处理了，这里可以简化
    const errorMessage = error.response && error.response.data
      ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
      : error.message;
    ElMessage.error(`获取客户列表失败，请检查网络或服务器！错误: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};

// 日期时间格式化函数
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  try {
    const date = new Date(dateTimeString);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    return dateTimeString; // 如果Date对象无效，返回原始字符串
  } catch (e) {
    console.warn("Date parsing error for:", dateTimeString, e);
    return dateTimeString; // 捕获异常时返回原始字符串
  }
};

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  pagination.pageNum = 1; // 改变每页大小后重置到第一页
  fetchCustomerList();
};

const handleCurrentChange = (newNum) => {
  pagination.pageNum = newNum;
  fetchCustomerList();
};

const handleSearch = () => {
  pagination.pageNum = 1; // 搜索时重置到第一页
  fetchCustomerList();
};

const handleAddCustomer = () => {
  currentCustomer.value = null; // 新增时传递 null 或空对象
  customerFormDialogVisible.value = true;
};

const handleEdit = (row) => {
  currentCustomer.value = JSON.parse(JSON.stringify(row)); // 深度复制，避免直接修改原始数据
  customerFormDialogVisible.value = true;
};

const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除客户 "${row.customerName}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        // 【修改】使用从 customer.js 导入的 API 函数
        const response = await deleteCustomerApi(row.id);
        // 假设 response.data 已经是后端返回的字符串，并且 request.js 已经处理了 .data
        if (typeof response === 'string' && response.includes("成功")) { // 检查 response 本身是否包含“成功”
          ElMessage.success('客户删除成功！');
          fetchCustomerList();
        } else {
          ElMessage.error(`删除失败: ${response || '未知错误'}`);
        }
      } catch (error) {
        console.error('删除客户失败:', error);
        const errorMessage = error.response && error.response.data
          ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
          : error.message;
        ElMessage.error(`删除客户失败，请检查网络或服务器！${errorMessage}`);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除。');
    });
};

// 组件挂载时加载数据
onMounted(() => {
  fetchCustomerList();
});
</script>

<style scoped>
.customer-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>