// src/api/request.js
import axios from 'axios';
import { ElMessage } from 'element-plus'; // 确保您已安装 Element Plus
import router from '@/router'; // 引入 Vue Router 实例，用于 401 跳转

// 创建 Axios 实例
const service = axios.create({
  // baseURL: 'http://localhost:8080/api', // 硬编码的URL，不推荐
  // 推荐使用环境变量 VITE_APP_BASE_API (在 .env.development 或 .env.production 中定义)
  // 如果没有定义，可以提供一个默认值，或者与 vite.config.js 的代理配置结合
  baseURL: import.meta.env.VITE_APP_BASE_API || 'http://localhost:8080/api', // 您的后端 API 基础URL
  timeout: 10000, // 请求超时时间 (毫秒)，稍微增加以应对复杂请求
  headers: {
    'Content-Type': 'application/json;charset=utf-8', // 显式设置默认的 Content-Type
  },
});

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    // 例如：从 localStorage 获取 token 并添加到请求头中
    // ⚠️ 注意：如果后端是基于 Session/Cookie 认证，且没有 JWT token，这里不需要添加 Authorization 头。
    // 如果您确定后端没有返回 JWT token，请注释掉或删除以下 token 相关代码。
    // 如果后端确实有 JWT token 但没有在登录响应中返回，那后端需要修改。
    const userInfo = localStorage.getItem('userInfo'); // 从 userInfo 中尝试获取 token
    let token = null;
    try {
      if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo);
        // 假设 token 字段在 userInfo 对象中 (如果后端真的会返回的话)
        // 否则，如果后端是 Session/Cookie 认证，这里无需处理 token
        if (parsedUserInfo && parsedUserInfo.token) { 
          token = parsedUserInfo.token;
        }
      }
    } catch (e) {
      console.error("解析 userInfo 失败:", e);
    }
    
    if (token) {
      // 根据后端要求添加 Bearer 前缀或其他认证头
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => {
    // 对请求错误做些什么 (例如网络断开、请求被取消等)
    console.error('[Request Error]:', error); // 打印详细的请求错误信息
    ElMessage.error('请求发送失败，请检查网络连接或稍后再试！');
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data; // 获取后端返回的完整数据体

    // ***修改点1: 调整对后端响应格式的判断***
    // 根据您提供的截图，后端登录接口在成功时直接返回用户对象，没有 code 字段。
    // 对于这类直接返回数据而非统一包装格式的接口，我们直接返回 res。
    // 对于其他可能返回统一格式的接口（如果有的话），需要根据实际情况判断。

    // 假设：如果后端返回的直接是一个对象且包含 'username' 字段（通常意味着是登录成功返回的用户数据），
    // 那么我们直接返回这个数据。
    // 如果您有其他接口是统一的 { code, message, data } 格式，需要更复杂的判断逻辑。

    // 这里我们假设登录接口的成功响应就是直接的用户对象。
    // 对于其他接口，如果它们是 { code: 200, data: {} } 这种格式，
    // 您需要在 Login.vue 中对 loginApi 的响应做特殊处理，或者在 request.js 中做更精细的判断。

    // 最简单的方案（适用于后端登录接口直接返回用户数据，其他接口可能也有类似情况）：
    // 直接返回整个 response.data。让具体的业务组件去判断返回的数据是否有效。
    // 这样，Login.vue 就能直接拿到完整的用户对象。
    return res; 
    
    /*
    // 这是一个更通用的处理方式，但需要您确认所有后端接口的返回规范：
    // 如果您的后端大部分接口遵循 { code: 200, message: "成功", data: {} } 这样的统一格式，
    // 而只有登录接口是特例，那么您可能需要在这里做一些判断：
    // 例如：
    // if (response.config.url.includes('/login') && response.status === 200 && res && res.username) {
    //    // 登录接口成功，直接返回用户数据
    //    return res;
    // } else if (res && res.code !== undefined) { // 检查是否存在 code 字段，是统一格式
    //    if (res.code === 200) {
    //        return res.data; // 返回 data 字段
    //    } else {
    //        ElMessage.error(res.message || '后端业务处理失败');
    //        return Promise.reject(new Error(res.message || 'Error'));
    //    }
    // } else {
    //    // 其他不确定格式的成功响应，直接返回
    //    return res;
    // }
    */
  },
  error => {
    // 对响应错误做些什么 (HTTP 状态码错误，如 4xx, 5xx)
    console.error('[Response Error]:', error.response || error); // 打印详细的响应错误信息

    let message = '请求失败，请稍后再试！'; // 默认错误信息

    if (error.response) {
      const status = error.response.status; // HTTP 状态码
      const errorData = error.response.data; // 后端返回的错误详情（通常是 JSON 或字符串）

      let backendMessage = '';
      if (errorData) {
        if (typeof errorData === 'string') {
          backendMessage = errorData; // 如果 data 是纯字符串
        } else if (typeof errorData === 'object' && errorData !== null) {
          // 尝试从对象中提取 message, error, path 等字段
          backendMessage = errorData.message || errorData.error || '';
          // 如果 backendMessage 仍然为空，但 errorData 有其他有用信息，可以尝试 JSON.stringify
          if (!backendMessage && Object.keys(errorData).length > 0) {
              backendMessage = JSON.stringify(errorData);
          }
        }
      }

      switch (status) {
        case 400:
          message = `请求参数错误！${backendMessage ? `详情: ${backendMessage}` : ''}`;
          break;
        case 401:
          // 未授权，通常是 token 过期或无效
          message = '会话过期或未授权，请重新登录！';
          ElMessage.warning(message); // 先提示用户
          // 【强制跳转到登录页】
          // ***修改点2: 清除 localStorage 中的 userInfo，而不是 token***
          localStorage.removeItem('userInfo'); // 清除本地用户信息
          // 延迟跳转，给用户看到提示的时间
          setTimeout(() => {
            // 使用 router.replace 避免回退到未授权页面
            if (router.currentRoute.value.path !== '/login') { // 避免重复跳转
              router.replace('/login');
            }
          }, 1000);
          break;
        case 403:
          message = `无权限访问！${backendMessage ? `详情: ${backendMessage}` : ''}`;
          break;
        case 404:
          message = `请求资源不存在！${backendMessage ? `详情: ${backendMessage}` : ''}`;
          break;
        case 500:
          message = `服务器内部错误！${backendMessage ? `详情: ${backendMessage}` : ''}`;
          break;
        default:
          message = `网络错误 (${status})！${backendMessage ? `详情: ${backendMessage}` : ''}`;
          break;
      }
    } else if (axios.isCancel(error)) {
        // 请求被取消
        console.warn('Request canceled:', error.message);
        // 通常不需要显示错误消息给用户，除非是用户明确取消的操作
        message = '请求已取消';
    } else if (error.request) {
      // 请求已发出但没有收到响应 (例如：网络连接中断，CORS 错误等)
      message = '网络连接失败或后端服务未响应，请检查网络或联系管理员！';
    } else {
      // 在设置请求时发生了错误 (例如：代码逻辑错误，配置问题)
      message = `请求配置错误: ${error.message}`;
    }

    ElMessage.error(message); // 显示错误提示
    return Promise.reject(error); // 继续抛出错误，以便组件可以进行特定处理（如果需要）
  }
);

export default service;