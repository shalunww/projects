<template>
  <div class="inbound-record-list-container">
    <h2>入库记录管理</h2>

    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" @submit.prevent="handleSearch">
        <el-form-item label="入库单号">
          <el-input v-model="searchForm.inboundSn" placeholder="请输入入库单号" clearable></el-input>
        </el-form-item>
        <el-form-item label="操作员ID">
          <el-input v-model="searchForm.operatorId" placeholder="请输入操作员ID" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
      <el-button type="primary" @click="handleAdd" :icon="Plus">新增入库</el-button> </el-card>

    <el-table :data="inboundRecords" v-loading="loading" border style="width: 100%; margin-top: 20px;">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="inboundSn" label="入库单号" width="150"></el-table-column>
      <el-table-column prop="inboundTime" label="入库时间" width="180">
        <template #default="{ row }">
          {{ formatDateTime(row.inboundTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="总金额" width="120">
        <template #default="{ row }">
          ¥{{ row.totalAmount ? row.totalAmount.toFixed(2) : '0.00' }}
        </template>
      </el-table-column>
      <el-table-column prop="operatorId" label="操作员ID" width="100"></el-table-column>
      <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip></el-table-column>
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
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleViewDetails(scope.row)">查看详情</el-button>
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button link type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.pageNum"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      background
      style="margin-top: 20px; justify-content: flex-end;"
    ></el-pagination>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="60%"
      :close-on-click-modal="false"
      destroy-on-close
    >
      <InboundRecordForm
        :inboundRecordId="currentRecordId"
        @submit-success="handleSubmitSuccess"
        @cancel="dialogVisible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus } from '@element-plus/icons-vue'; // 修改点2: 导入 Plus 图标

// 【重要】导入 InboundRecord 相关的 API
import {
  getInboundRecordsPageApi,
  deleteInboundRecordApi,
  // 如果需要，这里可以根据 InboundRecordForm 的需求导入 create 和 update API
  createInboundRecordApi, // 假设 InboundRecordForm 会使用
  updateInboundRecordApi, // 假设 InboundRecordForm 会使用
  getInboundRecordByIdApi // 假设 InboundRecordForm 会使用
} from '@/api/inboundRecordApi'; // 注意：我们接下来需要创建这个文件
import InboundRecordForm from './InboundRecordForm.vue'; // 导入新增/编辑组件

// 搜索表单数据
const searchForm = reactive({
  inboundSn: '',
  operatorId: null,
});

// 列表数据和加载状态
const inboundRecords = ref([]);
const loading = ref(false);

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 弹窗相关
const dialogVisible = ref(false);
const dialogTitle = ref('');
const currentRecordId = ref(null); // 用于编辑时传递 ID

// 格式化日期时间
const formatDateTime = (dateTime) => {
  // 1. 处理 null, undefined 或空字符串的情况
  if (!dateTime) {
    return '';
  }

  // 2. 尝试创建 Date 对象
  const date = new Date(dateTime);

  // 3. 检查 Date 对象是否有效（例如传入了无法解析的字符串）
  if (isNaN(date.getTime())) {
    console.error('Invalid Date string provided to formatDateTime:', dateTime);
    // 根据需求返回空字符串或错误提示
    return 'Invalid Date Format';
  }

  // 4. 使用 toLocaleString 进行本地化格式化
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false // 使用24小时制
  });
};

// 获取入库记录列表
const fetchInboundRecords = async () => {
  loading.value = true;
  try {
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      // 检查并添加搜索条件
      ...(searchForm.inboundSn && { inboundSn: searchForm.inboundSn }),
      // operatorId 如果输入的是数字，确保转换为数字类型，或者后端支持字符串ID搜索
      // 注意：如果 operatorId 是纯数字且不能为空字符串，这里需要更严格的判断
      ...(searchForm.operatorId !== null && searchForm.operatorId !== '' && { operatorId: searchForm.operatorId }),
    };

    // 根据您的后端API设计，这里可能需要调用 searchInboundRecordsApi 或 getInboundRecordsPageApi
    // 我假设 getInboundRecordsPageApi 支持多条件查询
    const response = await getInboundRecordsPageApi(params);
    inboundRecords.value = response.list; // 假设后端返回的数据结构是 { list: [], total: ... }
    console.log('API Response:', response);
    pagination.total = response.total;
  } catch (error) {
    ElMessage.error('获取入库记录失败: ' + (error.message || '未知错误'));
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.pageNum = 1; // 搜索时重置回第一页
  fetchInboundRecords();
};

// 重置搜索
const resetSearch = () => {
  searchForm.inboundSn = '';
  searchForm.operatorId = null; // 重置为 null
  pagination.pageNum = 1;
  fetchInboundRecords();
};

// 新增
const handleAdd = () => {
  currentRecordId.value = null; // 新增时ID为空
  dialogTitle.value = '新增入库记录';
  dialogVisible.value = true;
};

// 查看详情
const handleViewDetails = (row) => {
  currentRecordId.value = row.id;
  dialogTitle.value = '入库记录详情';
  dialogVisible.value = true;
  // 注意：InboundRecordForm 会根据传入的 ID 决定是加载数据还是作为新增表单
};

// 编辑
const handleEdit = (row) => {
  currentRecordId.value = row.id;
  dialogTitle.value = '编辑入库记录';
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除入库单号为 "${row.inboundSn}" 的记录吗？`, '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteInboundRecordApi(row.id);
    ElMessage.success('删除成功！');
    fetchInboundRecords(); // 刷新列表
  } catch (error) {
    if (error !== 'cancel') { // 区分用户取消和实际错误
      ElMessage.error('删除失败: ' + (error.message || '未知错误'));
    }
  }
};

// 分页大小改变
const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  fetchInboundRecords();
};

// 当前页码改变
const handleCurrentChange = (newPage) => {
  pagination.pageNum = newPage;
  fetchInboundRecords();
};

// 提交成功后回调 (从 InboundRecordForm 发出)
const handleSubmitSuccess = () => {
  dialogVisible.value = false; // 关闭弹窗
  fetchInboundRecords(); // 刷新列表
  ElMessage.success('操作成功！');
};

// 组件挂载时加载数据
onMounted(() => {
  fetchInboundRecords();
});
</script>

<style scoped>
.inbound-record-list-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
  padding: 20px;
}

.el-form-item {
  margin-right: 20px;
  margin-bottom: 0; /* 避免 Element Plus 默认的 margin-bottom 导致表单项之间有大空隙 */
}

.el-button {
  margin-left: 10px;
}
</style>