<template>
  <div>
    <p>InboundRecordForm 正在开发中...</p>
    <el-button @click="$emit('cancel')">取消</el-button>
    <el-button type="primary" @click="$emit('submit-success')">提交（占位）</el-button>
  </div>
</template>

<script setup>
// 这个组件现在是空的，后续会添加逻辑
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  inboundRecordId: {
    type: Number,
    default: null
  }
});

const emits = defineEmits(['submit-success', 'cancel']);

// console.log('InboundRecordForm 接收到的 ID:', props.inboundRecordId);
</script>

<style scoped>
/* 样式 */
</style>