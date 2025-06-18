<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    width="50%"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
  >
    <el-form :model="formData" :rules="rules" ref="categoryFormRef" label-width="100px">
      <el-form-item label="类别名称" prop="categoryName">
        <el-input v-model="formData.categoryName" placeholder="请输入类别名称"></el-input>
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input type="textarea" v-model="formData.description" placeholder="请输入类别描述"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { createProductCategoryApi, updateProductCategoryApi } from '../api/productCategory'; // 导入 API

const props = defineProps({
  visible: { // 控制弹窗显示隐藏
    type: Boolean,
    default: false,
  },
  title: { // 弹窗标题
    type: String,
    default: '商品类别',
  },
  category: { // 接收父组件传递的编辑数据
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:visible', 'success', 'close']); // 定义可触发的事件

const dialogVisible = ref(props.visible);
const categoryFormRef = ref(null); // 表单引用
const formData = reactive({
  id: null,
  categoryName: '',
  description: '',
});

// 表单验证规则
const rules = reactive({
  categoryName: [
    { required: true, message: '请输入类别名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  description: [
    { max: 255, message: '长度不能超过 255 个字符', trigger: 'blur' },
  ],
});

// 监听 props.visible 变化来同步 dialogVisible
watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal;
  if (newVal) {
    // 弹窗打开时，根据 props.category 初始化表单数据
    if (props.category && props.category.id) {
      Object.assign(formData, props.category); // 编辑模式
    } else {
      formData.id = null; // 新增模式
      formData.categoryName = '';
      formData.description = '';
    }
    // 重置表单验证状态
    categoryFormRef.value?.resetFields();
  }
}, { immediate: true }); // 立即执行一次监听，确保初始状态正确

// 提交表单
const submitForm = () => {
  categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        if (formData.id) {
          // 更新
          response = await updateProductCategoryApi(formData);
        } else {
          // 新增
          response = await createProductCategoryApi(formData);
        }

        if (response.includes("成功")) { // 假设后端返回包含“成功”的字符串
          ElMessage.success(response);
          handleClose(); // 关闭弹窗
          emit('success'); // 通知父组件刷新列表
        } else {
          ElMessage.error(`操作失败: ${response}`);
        }
      } catch (error) {
        console.error('提交商品类别失败:', error);
        // 错误信息已由 request.js 统一处理，这里可不再重复 ElMessage.error
      }
    } else {
      ElMessage.warning('表单验证失败，请检查输入项！');
      return false;
    }
  });
};

// 关闭弹窗并重置表单
const handleClose = () => {
  dialogVisible.value = false;
  emit('update:visible', false); // 通知父组件更新 visible 状态
  emit('close'); // 触发 close 事件
  categoryFormRef.value?.resetFields(); // 重置表单验证和数据
  Object.assign(formData, { id: null, categoryName: '', description: '' }); // 清空数据
};
</script>