<template>
  <div class="field-stack parameter-field">
    <div class="field-heading-row">
      <strong class="field-label-top">{{ label }}</strong>
      <label class="checkbox-label">
        <input type="checkbox" :checked="includeValue"
          @change="$emit('update:includeValue', $event.target.checked)">
        Include
      </label>
    </div>
    <div class="input-action-row">
      <input
        :type="type"
        :class="inputClass"
        :placeholder="placeholder"
        :value="modelValue"
        :disabled="!includeValue"
        @input="$emit('update:modelValue', $event.target.value)"
      >
      <slot />
    </div>
  </div>
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
