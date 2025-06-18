// src/api/stockApi.js
import service from './request'; // <-- 这里的路径现在是正确的，因为它们都在同一个目录下

// 库存相关的API请求
const stockApi = {
    /**
     * 分页获取库存列表
     * @param {number} pageNum - 当前页码
     * @param {number} pageSize - 每页大小
     * @param {string} [keyword] - 搜索关键词 (商品名称/型号/位置)
     * @param {number} [productTemplateId] - 商品模板ID
     * @param {string} [location] - 仓库位置
     * @returns {Promise<any>}
     */
    getStocksPage(pageNum, pageSize, keyword, productTemplateId, location) {
        return service.get('/stocks/page', {
            params: {
                pageNum,
                pageSize,
                keyword,
                productTemplateId,
                location
            }
        });
    },

    /**
     * 根据商品模板ID获取单个库存信息 (通常用于编辑时回显)
     * @param {number} productTemplateId - 商品模板ID
     * @returns {Promise<any>}
     */
    getStockByProductTemplateId(productTemplateId) {
        return service.get(`/stocks/template/${productTemplateId}`);
    },

    /**
     * 更新库存信息（主要用于修改预警值或位置）
     * @param {object} data - 库存更新数据对象
     * @returns {Promise<any>}
     */
    updateStock(data) {
        return service.put('/stocks', data);
    }
};

export default stockApi; // 以默认导出方式导出