<template>
  <div class="user-list-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="header-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="请输入关键字搜索 (用户名/角色)"
              clearable
              style="width: 350px; margin-right: 10px;"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            ></el-input>
            <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
            <el-button type="primary" :icon="Plus" @click="handleAddUser">新增用户</el-button>
          </div>
        </div>
      </template>

      <el-table :data="userList" stripe style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="序号" width="80" align="center"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="fullName" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="phone" label="电话"></el-table-column>
        <el-table-column prop="roleId" label="角色ID" width="100" align="center"></el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'ACTIVE' ? 'success' : 'danger'">
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
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
        <el-table-column label="操作" width="180" align="center" fixed="right">
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

    <UserFormDialog
      v-model:visible="userFormDialogVisible"
      :edit-data="currentUser"
      @success="fetchUserList"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'; // 导入 reactive
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Search } from '@element-plus/icons-vue'; // 导入 Search
import UserFormDialog from '../components/UserFormDialog.vue';
import { getUsersPageApi, deleteUserApi } from '../api/user'; // 【重要修改】导入 getUsersPageApi 和 deleteUserApi

const userList = ref([]);
const loading = ref(false);
const userFormDialogVisible = ref(false);
const currentUser = ref(null);
const searchKeyword = ref(''); // 【新增】搜索关键字

const pagination = reactive({ // 【新增】分页 reactive 对象
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 获取用户列表数据
const fetchUserList = async () => {
  loading.value = true;
  try {
    // 【重要修改】调用 getUsersPageApi
    const response = await getUsersPageApi({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: searchKeyword.value,
    });
    userList.value = response.list; // PageHelper 返回的数据在 .list 属性中
    pagination.total = response.total; // PageHelper 返回的总数在 .total 属性中
    pagination.pageNum = response.pageNum; // 更新当前页码
    pagination.pageSize = response.pageSize; // 更新每页大小

    ElMessage.success('用户列表加载成功！');
  } catch (error) {
    console.error('获取用户列表失败:', error);
    const errorMessage = error.response && error.response.data
      ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
      : error.message;
    ElMessage.error(`获取用户列表失败，请检查网络或服务器！错误: ${errorMessage}`);
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  // 假设后端返回的是 ISO 8601 格式的字符串，可以直接创建 Date 对象
  const date = new Date(dateTimeString);
  // 确保日期对象有效
  if (isNaN(date.getTime())) {
    // 如果直接解析失败，尝试兼容 Mybatis Plus 默认的日期格式
    // 例如：2023-01-01T12:00:00
    const parts = dateTimeString.split(/[-T:]|\./);
    if (parts.length >= 6) { // 至少年-月-日T时:分:秒
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // 月份从0开始
        const day = parseInt(parts[2]);
        const hour = parseInt(parts[3]);
        const minute = parseInt(parts[4]);
        const second = parseInt(parts[5]);
        const millisecond = parts[6] ? parseInt(parts[6].substring(0, 3)) : 0; // 毫秒
        return new Date(year, month, day, hour, minute, second, millisecond).toLocaleString();
    }
    return dateTimeString; // 无法解析则返回原始字符串
  }
  return date.toLocaleString(); // 使用 toLocaleString() 进行本地化格式显示
};

// 【新增】处理每页显示数量改变
const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  pagination.pageNum = 1; // 改变每页数量时，回到第一页
  fetchUserList();
};

// 【新增】处理当前页码改变
const handleCurrentChange = (newNum) => {
  pagination.pageNum = newNum;
  fetchUserList();
};

// 【新增】处理搜索
const handleSearch = () => {
  pagination.pageNum = 1; // 搜索时，回到第一页
  fetchUserList();
};


// 新增用户按钮点击事件
const handleAddUser = () => {
  currentUser.value = null;
  userFormDialogVisible.value = true;
};

// 编辑用户点击事件
const handleEdit = (row) => {
  currentUser.value = JSON.parse(JSON.stringify(row)); // 深拷贝防止修改原始数据
  userFormDialogVisible.value = true;
};

// 删除用户点击事件
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await deleteUserApi(row.id); // 【重要修改】使用 deleteUserApi
        if (response.includes("成功")) { // 假设后端返回包含“成功”的字符串
          ElMessage.success('用户删除成功！');
          fetchUserList();
        } else {
          ElMessage.error(`删除失败: ${response}`);
        }
      } catch (error) {
        console.error('删除用户失败:', error);
        const errorMessage = error.response && error.response.data
          ? (typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data))
          : error.message;
        ElMessage.error(`删除用户失败，请检查网络或服务器！${errorMessage}`);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除。');
    });
};

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.user-list-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions { /* 新增样式 */
  display: flex;
  align-items: center;
}

.pagination-container { /* 新增样式 */
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>