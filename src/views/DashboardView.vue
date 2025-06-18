<template>
  <div class="dashboard-container">
    <h1>欢迎来到后台管理系统！</h1>
    <el-button type="info" @click="logout">退出登录</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();

const logout = () => {
  localStorage.removeItem('user'); // 清除本地存储的用户信息
  ElMessage.info('已退出登录。');
  router.push('/'); // 跳转回登录页
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: Arial, sans-serif;
  background-color: #f0f2f5;
}
h1 {
  color: #333;
  margin-bottom: 20px;
}
</style>
