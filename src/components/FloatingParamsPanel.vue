<template>
  <div class="floating-panel" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <div class="floating-panel-header" @mousedown="startDrag">
      <span>{{ title }}</span>
      <button type="button" class="floating-panel-toggle" @mousedown.stop @click="collapsed = !collapsed">{{ collapsed ? '▢' : '—' }}</button>
    </div>
    <div v-show="!collapsed" class="floating-panel-body">
      <div v-if="params.length === 0" class="floating-panel-empty">No parameters</div>
      <div v-for="(param, idx) in params" :key="idx" class="floating-panel-row">{{ param }}</div>
      <div v-if="showPaymentUrl" class="floating-panel-url-section">
        <div class="floating-panel-url-label">Payment URL</div>
        <div class="floating-panel-url-value">{{ paymentUrl }}</div>
        <div class="floating-panel-url-actions">
          <button type="button" class="floating-panel-action-btn" @click="$emit('copy-url')">{{ copied ? 'Copied!' : 'Copy' }}</button>
          <a class="floating-panel-action-btn floating-panel-open-btn" :href="paymentUrl" target="_blank">Open</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FloatingParamsPanel',
  props: {
    title: {
      type: String,
      default: 'Request parameters',
    },
    params: {
      type: Array,
      default: () => [],
    },
    paymentUrl: {
      type: String,
      default: '',
    },
    showPaymentUrl: {
      type: Boolean,
      default: false,
    },
    copied: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['copy-url'],
  data() {
    return {
      collapsed: false,
      position: {
        top: 90,
        left: Math.max(20, window.innerWidth - 340),
      },
      dragging: false,
      offset: { x: 0, y: 0 },
    }
  },
  methods: {
    startDrag(event) {
      this.dragging = true
      this.offset = {
        x: event.clientX - this.position.left,
        y: event.clientY - this.position.top,
      }
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDrag)
    },
    onDrag(event) {
      if (!this.dragging) {
        return
      }
      this.position = {
        left: event.clientX - this.offset.x,
        top: event.clientY - this.offset.y,
      }
    },
    stopDrag() {
      this.dragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDrag)
    },
  },
  beforeUnmount() {
    document.removeEventListener('mousemove', this.onDrag)
    document.removeEventListener('mouseup', this.stopDrag)
  },
}
</script>

<style scoped>
.floating-panel {
  position: fixed;
  width: 320px;
  max-height: 70vh;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  z-index: 200;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.floating-panel-header {
  background: #1e5582;
  color: white;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: move;
  user-select: none;
  font-weight: 600;
  font-size: 13px;
}

.floating-panel-toggle {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-radius: 4px;
  width: 22px;
  height: 22px;
  cursor: pointer;
  font-size: 12px;
  flex-shrink: 0;
}

.floating-panel-body {
  padding: 8px 10px;
  overflow-y: auto;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.floating-panel-row {
  padding: 3px 0;
  border-bottom: 1px solid #f0f0f0;
  word-break: break-all;
}

.floating-panel-row:last-child {
  border-bottom: none;
}

.floating-panel-empty {
  color: #999;
  font-style: italic;
  font-size: 12px;
}

.floating-panel-url-section {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e5e5;
}

.floating-panel-url-label {
  font-weight: 600;
  color: #1e5582;
  margin-bottom: 4px;
}

.floating-panel-url-value {
  word-break: break-all;
  color: #333;
  margin-bottom: 6px;
}

.floating-panel-url-actions {
  display: flex;
  gap: 6px;
}

.floating-panel-action-btn {
  border: none;
  border-radius: 5px;
  background-color: #a5f729;
  color: #1e5582;
  font-weight: 600;
  font-size: 11px;
  padding: 4px 10px;
  cursor: pointer;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
</style>
