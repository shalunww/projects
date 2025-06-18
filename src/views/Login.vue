<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          <span>系统登录</span>
        </div>
      </template>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model="loginForm.password" placeholder="请输入密码" show-password @keyup.enter="handleLogin"></el-input> </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginApi } from '@/api/authApi' // 导入封装的登录API

const router = useRouter()
const loginFormRef = ref(null) // 表单引用
const loading = ref(false) // 登录按钮加载状态

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const handleLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true // 显示加载状态
      try {
        // 调用封装好的登录API
        const response = await loginApi({
          username: loginForm.username,
          password: loginForm.password
        });

        // ***修改点1: 根据您后端实际返回的响应结构判断登录成功***
        // 您的后端返回的响应中直接包含了 username, fullName 等用户字段，但没有 token 字段
        // 因此，我们检查 response 中是否存在 username 字段作为登录成功的标志
        if (response && response.username) { // 这里检查 response.username 是最直接的方式
          ElMessage.success('登录成功！');
          
          // ***修改点2: 不再存储 token，因为后端没有返回***
          // 如果后端是基于 Session/Cookie 的认证，浏览器会自动处理Session ID的存储和发送 (通过Cookie)
          
          // ***修改点3: 存储用户信息到 localStorage，供前端页面逻辑使用***
          // 将整个响应对象存储为 userInfo
          localStorage.setItem('userInfo', JSON.stringify(response)); 

          // ***修改点4: 跳转到主页 (根据 router/index.js 的 redirect 设置)***
          router.push('/'); 
        } else {
          // 登录失败，显示后端返回的错误消息，或通用错误
          // 如果 request.js 已经统一处理了非200的code并抛出错误，这里通常不会走到else分支
          // 如果后端返回的响应中没有 username 但有 message 字段，可以使用 response.message
          ElMessage.error(response.message || '登录失败，请检查用户名或密码。');
        }
      } catch (error) {
        console.error('登录请求失败:', error); //
        // request.js 已经统一处理了错误信息并弹窗，这里通常只需要捕获错误不重复弹窗
        // 但为了更具体的错误类型提示，可以在这里根据需要进行细化
        if (error.response && error.response.status === 401) {
          ElMessage.error('用户名或密码错误！'); // 针对 401 给出更具体提示
        } else if (error.message) {
            // error.message 可能来自 request.js 中 Promise.reject(new Error(res.message))
            // 或 axios 自身的网络错误信息
            ElMessage.error(`登录失败: ${error.message}`);
        } else {
          ElMessage.error('登录请求失败，请稍后再试。');
        }
      } finally {
        loading.value = false; // 隐藏加载状态
      }
    } else {
      ElMessage.error('请完整填写表单！')
      return false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.login-card {
  width: 400px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
}
</style>