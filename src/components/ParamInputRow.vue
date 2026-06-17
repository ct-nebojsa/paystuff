<template>
  <p class="field-row">
    <strong class="field-label">{{ label }}:</strong>
    <input
      :type="type"
      :class="inputClass"
      :placeholder="placeholder"
      :value="modelValue"
      :disabled="!includeValue"
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
      default: 'field-input',
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
.narrow {
  width: 190px;
}
</style>
