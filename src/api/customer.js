// src/api/customer.js
// 这个文件用于定义所有与客户（Customer）相关的后端 API 请求

import request from './request'; // 确保这个路径正确，指向您的 Axios 封装实例

/**
 * 获取客户分页列表
 * GET /api/customers/page
 * @param {Object} params - 查询参数对象
 * @param {number} params.pageNum - 当前页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} [params.keyword] - 搜索关键字 (可选)
 * @returns {Promise<any>} - 后端返回的 PageInfo 对象
 */
export function getCustomersPageApi(params) {
  return request({
    url: '/customers/page', // 与后端 CustomerController 的 @RequestMapping("/api/customers") + @GetMapping("/page") 匹配
    method: 'get',
    params: params, // Axios 会将这个对象自动序列化为 URL 查询参数 (?pageNum=1&pageSize=10&keyword=abc)
  });
}

/**
 * 创建客户
 * POST /api/customers
 * @param {Object} data - 客户数据对象
 * @returns {Promise<any>} - 后端返回的操作结果信息
 */
export function createCustomerApi(data) {
  return request({
    url: '/customers',
    method: 'post',
    data: data, // POST 请求的数据放在 data 字段中
  });
}

/**
 * 更新客户
 * PUT /api/customers
 * @param {Object} data - 客户数据对象
 * @returns {Promise<any>} - 后端返回的操作结果信息
 */
export function updateCustomerApi(data) {
  return request({
    url: '/customers',
    method: 'put',
    data: data, // PUT 请求的数据放在 data 字段中
  });
}

/**
 * 删除客户
 * DELETE /api/customers/{id}
 * @param {number} id - 客户ID
 * @returns {Promise<any>} - 后端返回的操作结果信息
 */
export function deleteCustomerApi(id) {
  return request({
    url: `/customers/${id}`, // 动态路径参数
    method: 'delete',
  });
}

/**
 * 根据ID获取客户详情
 * GET /api/customers/{id}
 * @param {number} id - 客户ID
 * @returns {Promise<any>} - 客户数据对象
 */
export function getCustomerByIdApi(id) {
  return request({
    url: `/customers/${id}`,
    method: 'get',
  });
}

/**
 * 根据客户名称获取客户
 * GET /api/customers/name/{customerName}
 * @param {string} customerName - 客户名称
 * @returns {Promise<any>} - 客户数据对象
 */
export function getCustomerByNameApi(customerName) {
  return request({
    url: `/customers/name/${customerName}`,
    method: 'get',
  });
}

/**
 * 根据联系电话获取客户
 * GET /api/customers/phone/{contactPhone}
 * @param {string} contactPhone - 联系电话
 * @returns {Promise<any>} - 客户数据对象
 */
export function getCustomerByPhoneApi(contactPhone) {
  return request({
    url: `/customers/phone/${contactPhone}`,
    method: 'get',
  });
}


/**
 * 获取所有客户（不分页，慎用在大数据量场景）
 * GET /api/customers
 * @returns {Promise<Array<any>>} - 客户列表数组
 */
export function getAllCustomersApi() {
  return request({
    url: '/customers',
    method: 'get',
  });
}

/**
 * 搜索客户（如果后端有独立的搜索接口）
 * GET /api/customers/search
 * @param {string} keyword - 搜索关键字
 * @returns {Promise<Array<any>>} - 匹配的客户列表数组
 */
export function searchCustomersApi(keyword) {
  return request({
    url: '/customers/search',
    method: 'get',
    params: { keyword },
  });
}