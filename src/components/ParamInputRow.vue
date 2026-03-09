<template>
  <p class="simple-wrapper">
    <strong class="strong-label">{{ label }}:</strong>
    <input
      :type="type"
      :class="inputClass"
      :placeholder="placeholder"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    >
    <input type="checkbox" :checked="includeValue" @change="$emit('update:includeValue', $event.target.checked)">
    <slot />
  </p>
</template>

<script>
export default {
  name: 'ParamInputRow',
  props: {
    label: {
      type: String,
      required: true,
    },
    modelValue: {
      type: String,
      default: '',
    },
    includeValue: {
      type: Boolean,
      default: true,
    },
    placeholder: {
      type: String,
      default: '',
    },
    inputClass: {
      type: String,
      default: 'simple-input',
    },
    type: {
      type: String,
      default: 'text',
    },
  },
  emits: ['update:modelValue', 'update:includeValue'],
}
</script>

<style scoped>
.simple-wrapper {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-bottom: 5px;
}

.strong-label {
  width: 160px;
  text-align: right;
  user-select: none;
  font-size: 14px;
}

.simple-input {
  padding: 3px;
  border-radius: 5px;
  border: 1px solid;
  border-color: #d4d4d4;
  width: 300px;
  outline: none;
}

.narrow {
  width: 190px;
}
</style>
