<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEditMode ? '编辑用户' : '新增用户'"
    width="50%"
    :before-close="handleClose"
  >
    <el-form :model="userForm" :rules="rules" ref="userFormRef" label-width="100px">
      <el-form-item label="用户名" prop="username">
        <el-input v-model="userForm.username" :disabled="isEditMode"></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" v-model="userForm.password" show-password placeholder="留空则不修改密码"></el-input>
      </el-form-item>
      <el-form-item label="姓名" prop="fullName">
        <el-input v-model="userForm.fullName"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="userForm.email"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="userForm.phone"></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select v-model="userForm.roleId" placeholder="请选择角色" style="width: 100%;">
          <el-option
            v-for="role in roles"
            :key="role.id"
            :label="role.description"
            :value="role.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="userForm.status">
          <el-radio label="ACTIVE">启用</el-radio>
          <el-radio label="INACTIVE">禁用</el-radio>
        </el-radio-group>
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

const userFormRef = ref(null);
const userForm = reactive({
  id: null,
  username: '',
  password: '',
  fullName: '', // 对应后端 User 实体中的 fullName
  email: '',
  phone: '',
  roleId: 1, // 默认角色ID，根据后端默认值或业务需求设置
  status: 'ACTIVE', // 默认状态
});

// 定义角色选项 (与后端 role 表的 ID 和你前端的 roleMap 对应)
const roles = ref([
  { id: 1, description: '管理员' },
  { id: 2, description: '仓库管理员' },
  { id: 3, description: '售后客服' },
  // 确保这里包含了你数据库中所有可能的 roleId 及其描述
]);

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    {
      validator: (rule, value, callback) => {
        if (!isEditMode.value && !value) { // 新增模式下密码必填
          callback(new Error('请输入密码'));
        } else if (value && value.length < 6) { // 如果输入了密码，则验证长度
          callback(new Error('密码至少 6 位'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  fullName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' },
  ],
  roleId: [{ required: true, message: '请选择角色', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
});

// 监听 visible prop 变化来控制弹窗显示和初始化表单
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      if (props.editData) {
        isEditMode.value = true;
        // 深拷贝 editData 到 userForm，确保不影响原始数据
        Object.assign(userForm, JSON.parse(JSON.stringify(props.editData)));
        userForm.password = ''; // 编辑时清空密码，让用户选择是否修改
      } else {
        isEditMode.value = false;
        userFormRef.value?.resetFields(); // 重置表单验证和字段
        // 重置为初始默认值
        Object.assign(userForm, {
          id: null,
          username: '',
          password: '',
          fullName: '',
          email: '',
          phone: '',
          roleId: 1, // 默认管理员
          status: 'ACTIVE',
        });
      }
    }
  },
  { immediate: true } // 立即执行一次，确保初始状态正确
);

// 监听 dialogVisible 变化，更新父组件的 visible prop
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  userFormRef.value?.resetFields(); // 重置表单验证和字段
  // 重置为初始默认值
  Object.assign(userForm, {
    id: null,
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    roleId: 1,
    status: 'ACTIVE',
  });
};

// 提交表单
const submitForm = () => {
  userFormRef.value?.validate(async (valid) => {
    if (valid) {
      try {
        let response;
        const dataToSend = { ...userForm }; // 复制一份数据进行处理

        // 编辑模式下，如果密码为空，则不发送密码字段到后端
        if (isEditMode.value && (dataToSend.password === null || dataToSend.password === '')) {
          delete dataToSend.password;
        }

        if (isEditMode.value) {
          response = await axios.put('http://localhost:8080/api/users', dataToSend);
          ElMessage.success('用户更新成功！');
        } else {
          response = await axios.post('http://localhost:8080/api/users', dataToSend);
          ElMessage.success('用户新增成功！');
        }
        console.log('操作成功响应:', response.data);
        emit('success'); // 通知父组件操作成功，可以刷新列表
        handleClose(); // 关闭弹窗
      } catch (error) {
        console.error('提交用户数据失败:', error);
        ElMessage.error(`操作失败: ${error.response?.data?.message || error.message}`);
      }
    } else {
      ElMessage.error('请检查表单输入！');
      return false;
    }
  });
};
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
</style>