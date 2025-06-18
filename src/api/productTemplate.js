// src/api/productTemplate.js
import request from './request'; // 确保导入您的 Axios 封装实例

// 获取商品模板分页列表
export function getProductTemplatesPageApi(params) {
  return request({
    url: '/product-templates/page', // 对应后端 ProductTemplateController 的 /api/product-templates/page
    method: 'get',
    params, // 会被自动转换为查询参数：?pageNum=1&pageSize=10&keyword=...
  });
}

// 创建商品模板
export function createProductTemplateApi(data) {
  return request({
    url: '/product-templates',
    method: 'post',
    data,
  });
}

// 更新商品模板
export function updateProductTemplateApi(data) {
  return request({
    url: '/product-templates',
    method: 'put',
    data,
  });
}

// 删除商品模板
export function deleteProductTemplateApi(id) {
  return request({
    url: `/product-templates/${id}`,
    method: 'delete',
  });
}

// 根据ID获取商品模板
export function getProductTemplateByIdApi(id) {
  return request({
    url: `/product-templates/${id}`,
    method: 'get',
  });
}

// 根据商品名称获取商品模板
export function getProductTemplateByNameApi(productName) {
  return request({
    url: `/product-templates/name/${productName}`,
    method: 'get',
  });
}

// 根据型号获取商品模板
export function getProductTemplateByModelApi(model) {
  return request({
    url: `/product-templates/model/${model}`,
    method: 'get',
});
}

// 根据类别ID获取商品模板列表 (在新增/编辑时可能需要关联)
export function getProductTemplatesByCategoryIdApi(categoryId) {
  return request({
    url: `/product-templates/category/${categoryId}`,
    method: 'get',
  });
}

// 根据供应商ID获取商品模板列表 (在新增/编辑时可能需要关联)
export function getProductTemplatesBySupplierIdApi(supplierId) {
  return request({
    url: `/product-templates/supplier/${supplierId}`,
    method: 'get',
  });
}

// 获取所有商品模板 (如果需要，例如下拉选择)
export function getAllProductTemplatesApi() {
  return request({
    url: '/product-templates',
    method: 'get',
  });
}