// src/api/authApi.js
import request from './request'; // 确保导入我们封装的 Axios 实例

/**
 * 用户登录接口
 * @param {Object} data - 包含用户名和密码的对象
 * @param {string} data.username - 用户名
 * @param {string} data.password - 密码
 * @returns {Promise<Object>} - 登录成功后后端返回的数据，通常包含token等
 */
export function loginApi(data) {
  return request({
    url: '/users/login', // 这是您的后端登录接口路径
    method: 'post',
    data, // 包含 username 和 password 的请求体
  });
}

// 您可以根据需要在这里添加其他认证相关的API，例如：

/**
 * 获取当前登录用户信息
 * @returns {Promise<Object>} - 用户信息
 */
// export function getUserInfoApi() {
//   return request({
//     url: '/users/info', // 示例路径
//     method: 'get',
//   });
// }

/**
 * 用户退出登录
 * @returns {Promise<Object>} - 退出成功后的响应
 */
// export function logoutApi() {
//   return request({
//     url: '/auth/logout', // 示例路径
//     method: 'post',
//   });
// }