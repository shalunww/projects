<template>
  <el-container class="common-layout">
    <el-header class="layout-header">
      <div class="header-left">
        <el-button @click="toggleCollapse" :icon="Fold" circle></el-button>
        <span class="system-title">售后仓储管理系统</span>
      </div>
      <div class="header-right">
        <span>欢迎您，{{ username }}！</span>
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <el-avatar :size="30" :src="avatarUrl" class="user-avatar"></el-avatar>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container>
      <el-aside width="auto" class="layout-aside">
        <el-menu
          :default-active="activeMenu"
          class="el-menu-vertical-demo"
          :collapse="isCollapse"
          router
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b"
        >
          <el-menu-item index="/home">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>

          <el-sub-menu index="user-management">
            <template #title>
              <el-icon><User /></el-icon>
              <span>用户管理</span>
            </template>
            <el-menu-item index="/users">用户列表</el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/customers">
            <el-icon><Avatar /></el-icon> <span>客户管理</span>
          </el-menu-item>

          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon> <span>商品管理</span>
          </el-menu-item>

          <el-menu-item index="/product-categories">
            <el-icon><FolderOpened /></el-icon> <span>商品类别管理</span>
          </el-menu-item>

          <el-menu-item index="/suppliers">
            <el-icon><Van /></el-icon> <span>供应商管理</span>
          </el-menu-item>

          <el-menu-item index="/inbound-records">
            <el-icon><Tickets /></el-icon>
            <span>入库记录管理</span>
          </el-menu-item>

          <el-menu-item index="/stocks">
            <el-icon><TakeawayBox /></el-icon> <span>库存管理</span>
          </el-menu-item>

        </el-menu>
      </el-aside>

      <el-main class="layout-main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House,
  User,
  Fold,
  ArrowDown,
  Avatar,
  Goods,           // 用于商品管理
  FolderOpened,    // 用于商品类别管理
  Van,             // 用于供应商管理
  Tickets,         // 新增：用于入库记录管理
  TakeawayBox,     // 新增：用于库存管理 (您可以选择其他图标，例如 Box, Storage, ShoppingBag)
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const isCollapse = ref(false)

const user = JSON.parse(localStorage.getItem('user'));
const username = computed(() => user ? user.username : '访客');
const avatarUrl = ref('https://cube.elemecdn.com/0/88/03b0dff42b20a49053ea5cf97235bpng.png');

const activeMenu = computed(() => {
  // 确保当路由为根路径时，首页菜单项高亮
  if (route.path === '/') {
    return '/home';
  }
  return route.path;
});

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        localStorage.removeItem('user');
        router.push('/login');
        ElMessage.success('退出登录成功！');
      })
      .catch(() => {
        ElMessage.info('已取消退出登录');
      });
  } else if (command === 'profile') {
    ElMessage.info('个人中心功能待实现...');
  }
}
</script>

<style scoped>
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  background-color: #409eff;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.system-title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 15px;
}

.header-right {
  display: flex;
  align-items: center;
}

.header-right span {
  margin-right: 15px;
  font-size: 16px;
}

.user-avatar {
  cursor: pointer;
  vertical-align: middle;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #fff;
}

.layout-aside {
  background-color: #545c64;
  height: calc(100vh - 60px);
  transition: width 0.3s;
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}

.layout-main {
  flex-grow: 1;
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>