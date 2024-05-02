<template>
  <el-dialog v-model="visible" :title="title" :width>
    <slot>
      <component :is="component" />
    </slot>
    <template #footer>
            <span class="dialog-footer">
                <el-button :disabled="confirmLoading" @click="handleCancel">
                {{ cancelText }}</el-button>
                <el-button
                  :loading="confirmLoading"
                  type="primary"
                  @click="$emit('confirm')"
                >{{ confirmText }}</el-button>
            </span>
    </template>
  </el-dialog>
</template>

<script setup>
import {computed, ref} from 'vue';
import {ElButton, ElDialog} from 'element-plus';

const props = defineProps({
  modelValue: false,
  width: {
    type: String,
    default: '50%',
  },
  title: '',
  cancelText: {
    type: String,
    default: '取消',
  },
  confirmText: {
    type: String,
    default: '确定',
  },
  loading: false,
  component: {
    type: String,
  },
});

const emits = defineEmits(['update:modelValue', 'cancel', 'close']);

const _loading = ref(false);
const confirmLoading = computed(() => {
  return props.loading || _loading.value;
});

const visible = computed({
  get() {
    return props.modelValue;
  },
  set(val) {
    emits('update:modelValue', val);
  },
});

// methods
const handleCancel = () => {
  emits('cancel');
  visible.value = false;
};

const showLoading = () => {
  _loading.value = true;
};

const hideLoading = () => {
  _loading.value = false;
};

defineExpose({showLoading, hideLoading});
</script>
