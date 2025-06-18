// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '../views/MainLayout.vue';
import Login from '../views/Login.vue'; // 确保这里导入的是 Login.vue

// 导入 ElMessage 用于导航守卫中的提示
import { ElMessage } from 'element-plus'; // 确保您已安装 element-plus

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // 推荐使用 import.meta.env.BASE_URL
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: Login, // 登录页通常不需要布局，也不需要认证
      meta: { title: '登录', requiresAuth: false } // 明确指出不需要认证
    },
    {
      path: '/',
      name: 'Layout', // 路由名称可以保持 'Layout' 或 'MainLayout'，保持一致即可
      component: MainLayout,
      redirect: '/home', // 默认重定向到首页，用户访问 / 时会进入 /home
      meta: { requiresAuth: true }, // 需要登录才能访问 MainLayout 及其子路由
      children: [
        {
          path: '/home', // 完整路径是 /home
          name: 'Home',
          component: () => import('../views/HomeView.vue'),
          meta: { title: '首页' }
        },
        {
          path: '/product-templates', // 完整路径是 /product-templates
          name: 'ProductTemplateList',
          component: () => import('../views/ProductTemplateListView.vue'), // 懒加载
          meta: { title: '商品模板管理' }
        },
        {
          path: '/stocks', // 完整路径是 /stocks
          name: 'StockList',
          component: () => import('../views/StockListView.vue'), // 懒加载
          meta: { title: '库存管理' }
        },
        {
          path: '/inbound-records', // 完整路径是 /inbound-records
          name: 'InboundRecordList',
          component: () => import('../views/InboundRecordListView.vue'), // 懒加载
          meta: { title: '入库管理' }
        },
        // 【建议补充的其他模块路由示例】
        {
          path: '/users',
          name: 'UserList',
          component: () => import('../views/UserListView.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/customers',
          name: 'CustomerList',
          component: () => import('../views/CustomerListView.vue'),
          meta: { title: '客户管理' }
        },
        {
          path: '/product-categories',
          name: 'ProductCategoryList',
          component: () => import('../views/ProductCategoryListView.vue'),
          meta: { title: '商品类别管理' }
        },
        {
          path: '/suppliers',
          name: 'SupplierList',
          component: () => import('../views/SupplierListView.vue'),
          meta: { title: '供应商管理' }
        },
      ]
    },
    // 【重要】404 Catch-all 路由应放在所有明确定义的路由的最后
    // 并且通常放在顶级，这样可以捕获任何未匹配的路径，无论是带布局的还是不带布局的。
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
      meta: { title: '404 - 页面未找到' }
    }
  ]
});

// 路由守卫 (用于登录权限校验和页面标题设置)
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - 仓库管理系统` : '仓库管理系统';

  // 登录权限判断
  // ***修改点1: 不再检查 'token'，而是检查 'userInfo'***
  const userInfo = localStorage.getItem('userInfo'); 
  const isLoggedIn = !!userInfo; // 判断 localStorage 中是否有用户信息

  const requiresAuth = to.meta.requiresAuth !== false; // 默认需要认证，除非明确设置为 false

  if (requiresAuth && !isLoggedIn) {
    // 如果需要认证但用户未登录，则重定向到登录页
    ElMessage.warning('请先登录才能访问此页面！');
    // next('/login'); // 简单重定向到登录页
    next({ path: '/login', query: { redirect: to.fullPath } }); // 更友好的方式：登录后可以跳回原页面
  } else if (to.path === '/login' && isLoggedIn) {
    // 如果已登录用户尝试访问登录页，则重定向到首页
    next('/');
  } else {
    // 否则正常跳转
    next();
  }
});

export default router;