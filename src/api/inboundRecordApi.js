// src/api/inboundRecordApi.js
import request from './request'; // 确保导入您的 Axios 封装实例

// 获取入库记录分页列表 (支持搜索条件)
export function getInboundRecordsPageApi(params) {
  return request({
    url: '/inbound-records/page', // 对应后端 InboundRecordController 的 /api/inbound-records/page
    method: 'get',
    params,
  });
}

// 根据ID获取入库记录详情
export function getInboundRecordByIdApi(id) {
  return request({
    url: `/inbound-records/${id}`, // 对应后端 InboundRecordController 的 /api/inbound-records/{id}
    method: 'get',
  });
}

// 创建入库记录
export function createInboundRecordApi(data) {
  return request({
    url: '/inbound-records', // 对应后端 InboundRecordController 的 /api/inbound-records
    method: 'post',
    data,
  });
}

// 更新入库记录
export function updateInboundRecordApi(data) {
  return request({
    url: '/inbound-records', // 对应后端 InboundRecordController 的 /api/inbound-records
    method: 'put',
    data,
  });
}

// 删除入库记录
export function deleteInboundRecordApi(id) {
  return request({
    url: `/inbound-records/${id}`, // 对应后端 InboundRecordController 的 /api/inbound-records/{id}
    method: 'delete',
  });
}

// 【可选】如果后端有专门的模糊搜索接口，可以添加此函数
// export function searchInboundRecordsApi(params) {
//   return request({
//     url: '/inbound-records/search', // 示例路径，请根据后端实际路径调整
//     method: 'get',
//     params,
//   });
// }