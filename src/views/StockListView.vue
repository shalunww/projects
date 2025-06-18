<template>
  <div class="stock-list-container">
    <h1>库存管理</h1>
    <p>库存数据将在此处显示。</p>
    <el-card class="table-card">
      <el-table
        v-loading="loading"
        :data="stockList"
        border
        style="width: 100%"
        empty-text="暂无数据"
      >
        <el-table-column prop="id" label="ID" width="80" align="center"></el-table-column>
        <el-table-column prop="productName" label="商品名称" width="150"></el-table-column>
        <el-table-column prop="model" label="型号" width="120"></el-table-column>
        <el-table-column prop="currentStock" label="当前库存" width="120"></el-table-column>
        <el-table-column prop="lastInboundTime" label="最近入库时间" width="180"></el-table-column>
        <el-table-column prop="lastOutboundTime" label="最近出库时间" width="180"></el-table-column>
        <el-table-column prop="location" label="存放位置"></el-table-column>
        <el-table-column prop="remark" label="备注"></el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              :icon="Edit"
              @click="handleEditStock(scope.row)"
            >编辑</el-button>
            </template>
        </el-table-column>
      </el-table>

      <el-pagination
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="pagination.pageNum"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pagination.pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="pagination.total"
        background
      >
      </el-pagination>
    </el-card>

    <el-dialog
      v-model="editDialogVisible"
      title="编辑库存"
      width="500px"
      :before-close="handleEditClose"
    >
      <el-form :model="currentStock" ref="stockFormRef" label-width="120px">
        <el-form-item label="当前库存">
          <el-input-number v-model="currentStock.currentStock" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="存放位置">
          <el-input v-model="currentStock.location"></el-input>
        </el-form-item>
        <el-form-item label="备注">
          <el-input type="textarea" v-model="currentStock.remark"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitStockEdit">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Search, Plus } from '@element-plus/icons-vue'; // 引入图标

// 假设您已经创建了 stockApi.js
import stockApi from '@/api/stockApi'; // 确保 stockApi.js 存在且为默认导出

const stockList = ref([]);
const loading = ref(false);

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
});

// 编辑库存相关
const editDialogVisible = ref(false);
const currentStock = reactive({
  id: null,
  productName: '',
  model: '',
  currentStock: 0,
  location: '',
  remark: '',
  // ... 其他您可能需要的字段
});
const stockFormRef = ref(null);

onMounted(() => {
  console.log('StockListView mounted!');
  fetchStocks();
});

const fetchStocks = async () => {
  loading.value = true;
  try {
    // 这里的 API 接口需要您后端提供实际的库存分页查询接口
    // 假设 stockApi.getStocksPage 返回 { list: [], total: 0, pageNum, pageSize }
    // 如果您的后端没有模拟数据，这里可能会失败，暂时使用模拟数据
    const responseData = await stockApi.getStocksPage({
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        keyword: '' // 假设可以有搜索关键字
    });
    stockList.value = responseData.list;
    pagination.total = responseData.total;
    pagination.pageNum = responseData.pageNum;
    pagination.pageSize = responseData.pageSize;
  } catch (error) {
    console.error('获取库存失败:', error);
    ElMessage.error('获取库存失败，请检查后端服务。');
    // 如果没有后端或API，使用模拟数据进行前端开发
    stockList.value = [
      { id: 1, productName: '商品A', model: 'M100', currentStock: 50, lastInboundTime: '2023-05-01 10:00:00', lastOutboundTime: '2023-05-10 14:30:00', location: 'A区1排1货架', remark: '常用商品' },
      { id: 2, productName: '商品B', model: 'X200', currentStock: 20, lastInboundTime: '2023-04-20 09:00:00', lastOutboundTime: '2023-05-15 11:00:00', location: 'B区2排3货架', remark: '季节性商品' },
      { id: 3, productName: '商品C', model: 'P300', currentStock: 100, lastInboundTime: '2023-06-01 16:00:00', lastOutboundTime: null, location: 'C区5排2货架', remark: '新品' },
    ];
    pagination.total = stockList.value.length;
  } finally {
    loading.value = false;
  }
};

const handleSizeChange = (newSize) => {
  pagination.pageSize = newSize;
  fetchStocks();
};

const handleCurrentChange = (newPage) => {
  pagination.pageNum = newPage;
  fetchStocks();
};

const handleEditStock = (row) => {
  editDialogVisible.value = true;
  Object.assign(currentStock, row);
  // 确保重置表单验证状态
  if (stockFormRef.value) {
    setTimeout(() => { // 延迟重置以确保弹窗渲染完成
      stockFormRef.value.resetFields();
    }, 0);
  }
};

const handleEditClose = () => {
  ElMessageBox.confirm('确认关闭？')
    .then(() => {
      editDialogVisible.value = false;
      if (stockFormRef.value) {
        stockFormRef.value.resetFields();
      }
    })
    .catch(() => {
      // 取消关闭
    });
};

const submitStockEdit = async () => {
  if (stockFormRef.value) {
    stockFormRef.value.validate(async (valid) => {
      if (valid) {
        try {
          // 假设您有一个更新库存的 API 接口
          // await stockApi.updateStock(currentStock);
          ElMessage.success('库存信息更新成功！(模拟)');
          editDialogVisible.value = false;
          fetchStocks(); // 重新加载数据
        } catch (error) {
          console.error('更新库存失败:', error);
          ElMessage.error('更新库存失败，请稍后再试。');
        }
      } else {
        ElMessage.warning('请检查表单输入！');
        return false;
      }
    });
  }
};
</script>

<style scoped>
.stock-list-container {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
}

.table-card {
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
  display: flex;
}
</style>