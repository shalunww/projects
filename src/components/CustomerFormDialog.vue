<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑客户' : '新增客户'"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="customerForm" :rules="rules" ref="customerFormRef" label-width="100px">
      <el-form-item label="客户名称" prop="customerName">
        <el-input v-model="customerForm.customerName"></el-input>
      </el-form-item>
      <el-form-item label="联系人" prop="contactPerson">
        <el-input v-model="customerForm.contactPerson"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="contactPhone">
        <el-input v-model="customerForm.contactPhone"></el-input>
      </el-form-item>
      <el-form-item label="地址" prop="address">
        <el-input v-model="customerForm.address"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEditMode ? '更新' : '新增' }}
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  editData: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:visible', 'success']);

const dialogVisible = ref(props.visible);
const isEditMode = ref(false);

const customerFormRef = ref(null);
// 客户表单数据，字段名与后端 Customer 实体类属性名保持一致
const customerForm = reactive({
  id: null,
  customerName: '',
  contactPerson: '',
  contactPhone: '',
  address: '',
  // createTime 和 updateTime 不在表单中，由后端自动处理
});

// 表单验证规则
const rules = reactive({
  customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  contactPerson: [{ required: true, message: '请输入联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
});

// 监听 visible prop 变化，控制弹窗显示和初始化表单数据
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      if (props.editData) {
        isEditMode.value = true;
        // 深拷贝 editData 到 customerForm，避免直接修改 prop
        Object.assign(customerForm, JSON.parse(JSON.stringify(props.editData)));
      } else {
        isEditMode.value = false;
        // 使用 nextTick 确保DOM更新后执行 resetFields，避免有时无法清空
        nextTick(() => {
          customerFormRef.value?.resetFields(); // 重置表单验证和字段
          // 重置为初始默认值
          Object.assign(customerForm, {
            id: null,
            customerName: '',
            contactPerson: '',
            contactPhone: '',
            address: '',
          });
        });
      }
    }
  },
  { immediate: true } // 立即执行一次，确保初始状态正确
);

// 监听 dialogVisible 变化，同步回父组件的 visible prop
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  // 使用 nextTick 确保DOM更新后执行 resetFields，避免有时无法清空
  nextTick(() => {
    customerFormRef.value?.resetFields(); // 重置表单验证和字段
    // 再次重置为初始默认值，确保下次打开时干净
    Object.assign(customerForm, {
      id: null,
      customerName: '',
      contactPerson: '',
      contactPhone: '',
      address: '',
    });
  });
};

// 提交表单
const submitForm = () => {
  customerFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        if (isEditMode.value) {
          // 编辑模式，调用 PUT /api/customers 接口
          response = await axios.put('http://localhost:8080/api/customers', customerForm);
          // 后端返回具体的成功消息
          if (response.data.includes("成功")) {
            ElMessage.success('客户更新成功！');
          } else {
            ElMessage.error(`更新失败: ${response.data}`);
          }
        } else {
          // 新增模式，调用 POST /api/customers 接口
          response = await axios.post('http://localhost:8080/api/customers', customerForm);
          // 后端返回具体的成功消息
          if (response.data.includes("成功")) {
            ElMessage.success('客户新增成功！');
          } else {
            ElMessage.error(`新增失败: ${response.data}`);
          }
        }
        console.log('操作成功响应:', response.data);
        emit('success'); // 通知父组件操作成功，可以刷新列表
        handleClose(); // 关闭弹窗
      } catch (error) {
        console.error('提交客户数据失败:', error);
        ElMessage.error(`操作失败: ${error.response?.data || error.message}`);
      }
    } else {
      ElMessage.error('请检查表单输入！');
      return false;
    }
  });
};

// 引入 nextTick 用于清空表单
import { nextTick } from 'vue';
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>