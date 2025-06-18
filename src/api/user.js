// src/api/user.js
import request from './request'; // 假设您已经创建了 request.js 文件

// 登录接口
export function loginApi(data) {
  return request({
    url: '/users/login', // 对应后端 UserController 的 @PostMapping("/login")
    method: 'post',
    data, // 包含 username 和 password
  });
}

// 【新增】获取用户分页列表
export function getUsersPageApi(params) {
  return request({
    url: '/users/page', // 对应后端 UserController 的 @GetMapping("/page")
    method: 'get',
    params, // pageNum, pageSize, keyword
  });
}

// 创建用户
export function createUserApi(data) {
  return request({
    url: '/users', // 对应后端 UserController 的 @PostMapping
    method: 'post',
    data,
  });
}

// 更新用户
export function updateUserApi(data) {
  return request({
    url: '/users', // 对应后端 UserController 的 @PutMapping
    method: 'put',
    data,
  });
}

// 删除用户
export function deleteUserApi(id) {
  return request({
    url: `/users/${id}`, // 对应后端 UserController 的 @DeleteMapping("/{id}")
    method: 'delete',
  });
}

// 根据ID获取用户
export function getUserByIdApi(id) {
  return request({
    url: `/users/${id}`, // 对应后端 UserController 的 @GetMapping("/{id}")
    method: 'get',
  });
}

// 根据用户名获取用户 (如果需要)
export function getUserByUsernameApi(username) {
  return request({
    url: `/users/username/${username}`, // 对应后端 UserController 的 @GetMapping("/username/{username}")
    method: 'get',
  });
}