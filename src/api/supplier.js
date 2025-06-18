// src/api/supplier.js
import request from './request'; // 确保导入您的 Axios 封装实例

// 获取供应商分页列表
export function getSuppliersPageApi(params) {
  return request({
    url: '/suppliers/page', // 对应后端 SupplierController 的 /api/suppliers/page
    method: 'get',
    params,
  });
}

// 获取所有供应商列表（用于下拉选择，不分页）
export function getAllSuppliersApi() {
  return request({
    url: '/suppliers', // 对应后端 SupplierController 的 /api/suppliers
    method: 'get',
  });
}

// 创建供应商
export function createSupplierApi(data) {
  return request({
    url: '/suppliers',
    method: 'post',
    data,
  });
}

// 更新供应商
export function updateSupplierApi(data) {
  return request({
    url: '/suppliers',
    method: 'put',
    data,
  });
}

// 删除供应商
export function deleteSupplierApi(id) {
  return request({
    url: `/suppliers/${id}`,
    method: 'delete',
  });
}

// 根据ID获取供应商
export function getSupplierByIdApi(id) {
  return request({
    url: `/suppliers/${id}`,
    method: 'get',
  });
}

// 根据供应商名称获取供应商
export function getSupplierByNameApi(supplierName) {
  return request({
    url: `/suppliers/name/${supplierName}`,
    method: 'get',
  });
}