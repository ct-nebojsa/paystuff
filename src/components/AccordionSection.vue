<template>
  <div class="subsection">
    <button type="button" class="accordion-header" @click="$emit('update:modelValue', !modelValue)">
      <span>{{ title }}</span>
      <span class="accordion-chevron" :class="{ open: modelValue }">▾</span>
    </button>
    <div v-show="modelValue" class="accordion-body">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccordionSection',
  props: {
    title: {
      type: String,
      required: true,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
}
</script>

<style scoped>
.accordion-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-weight: 600;
  font-size: 14px;
  color: #1e5582;
}

.accordion-chevron {
  transition: transform 0.15s ease;
}

.accordion-chevron.open {
  transform: rotate(180deg);
}

.accordion-body {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
