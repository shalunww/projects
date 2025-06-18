<template>
  <div class="not-found-container">
    <h1>404 Not Found</h1>
    <p>抱歉，您访问的页面不存在。</p>
    <el-button type="primary" @click="goHome">返回首页</el-button>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* 让内容垂直居中 */
  text-align: center;
}
h1 {
  font-size: 3em;
  color: #f56c6c;
  margin-bottom: 20px;
}
p {
  font-size: 1.2em;
  color: #606266;
  margin-bottom: 30px;
}
</style>