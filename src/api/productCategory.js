// src/api/productCategory.js
import request from './request'; // 确保导入您的 Axios 封装实例

// 获取商品类别分页列表
export function getProductCategoriesPageApi(params) {
  return request({
    url: '/product-categories/page', // 对应后端 ProductCategoryController 的 /api/product-categories/page
    method: 'get',
    params, // 会被自动转换为查询参数：?pageNum=1&pageSize=10&keyword=...
  });
}

// 创建商品类别
export function createProductCategoryApi(data) {
  return request({
    url: '/product-categories',
    method: 'post',
    data,
  });
}

// 更新商品类别
export function updateProductCategoryApi(data) {
  return request({
    url: '/product-categories',
    method: 'put',
    data,
  });
}

// 删除商品类别
export function deleteProductCategoryApi(id) {
  return request({
    url: `/product-categories/${id}`,
    method: 'delete',
  });
}

// 根据ID获取商品类别
export function getProductCategoryByIdApi(id) {
  return request({
    url: `/product-categories/${id}`,
    method: 'get',
  });
}

// 根据商品类别名称获取商品类别
export function getProductCategoryByNameApi(categoryName) {
  return request({
    url: `/product-categories/name/${categoryName}`,
    method: 'get',
  });
}

// 获取所有商品类别 (如果需要)
export function getAllProductCategoriesApi() {
  return request({
    url: '/product-categories',
    method: 'get',
  });
}

// 搜索商品类别 (通常用分页接口的 keyword 参数，如果您有独立的搜索接口，可以使用这个)
export function searchProductCategoriesApi(keyword) {
  return request({
    url: '/product-categories/search',
    method: 'get',
    params: { keyword }
  });
}