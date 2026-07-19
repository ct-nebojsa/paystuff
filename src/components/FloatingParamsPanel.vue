<template>
  <div class="floating-panel" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <div class="floating-panel-header" @mousedown="startDrag">
      <span>{{ title }}</span>
      <div class="floating-panel-controls">
        <button type="button" class="floating-panel-toggle" title="Smaller text" @mousedown.stop
          @click="changeFontSize(-1)">A−</button>
        <button type="button" class="floating-panel-toggle" title="Larger text" @mousedown.stop
          @click="changeFontSize(1)">A+</button>
        <button type="button" class="floating-panel-toggle" @mousedown.stop @click="collapsed = !collapsed">{{ collapsed ? '▢' : '—' }}</button>
      </div>
    </div>
    <div v-show="!collapsed" class="floating-panel-body" :style="{ fontSize: fontSize + 'px' }">
      <div v-if="params.length === 0" class="floating-panel-empty">No parameters</div>
      <div v-for="(param, idx) in params" :key="idx" class="floating-panel-row"
        :class="{ 'has-json': jsonValue(param) !== null }" @mouseenter="showJson(param, $event)"
        @mouseleave="hideJson">
        {{ displayed(param) }}
        <button v-if="base64Value(param) !== null" type="button" class="floating-panel-decode-btn"
          @click="toggleDecode(param)">{{ decodedKeys[paramKey(param)] ? 'Original' : 'Decode' }}</button>
      </div>
      <div v-if="showPaymentUrl" class="floating-panel-url-section">
        <div class="floating-panel-url-label">Payment URL</div>
        <div class="floating-panel-url-value">{{ paymentUrl }}</div>
        <div class="floating-panel-url-actions">
          <button type="button" class="floating-panel-action-btn" @click="$emit('copy-url')">{{ copied ? 'Copied!' : 'Copy' }}</button>
          <a class="floating-panel-action-btn floating-panel-open-btn" :href="paymentUrl" target="_blank">Open</a>
        </div>
      </div>
    </div>
    <div v-if="hoverJson" class="floating-panel-json-tooltip"
      :style="{ top: hoverPos.top + 'px', left: hoverPos.left + 'px' }">
      <pre>{{ hoverJson }}</pre>
    </div>
  </div>
</template>

<script>
import { splitParam, base64ParamValue } from '@/utils/base64.js'

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
      fontSize: 11,
      decodedKeys: {},
      hoverJson: null,
      hoverPos: { top: 0, left: 0 },
      position: {
        top: 90,
        left: Math.max(20, window.innerWidth - 340),
      },
      dragging: false,
      offset: { x: 0, y: 0 },
    }
  },
  methods: {
    changeFontSize(delta) {
      this.fontSize = Math.min(16, Math.max(8, this.fontSize + delta))
    },
    paramKey(param) {
      return splitParam(param)[0]
    },
    base64Value(param) {
      return base64ParamValue(param)
    },
    displayed(param) {
      if (!this.decodedKeys[this.paramKey(param)]) return param
      const decoded = this.base64Value(param)
      return decoded === null ? param : `${this.paramKey(param)}=${decoded}`
    },
    // pretty-printed JSON when the value is JSON text, either directly or
    // behind base64, otherwise null
    jsonValue(param) {
      const candidates = [splitParam(param)[1], this.base64Value(param)]
      for (const candidate of candidates) {
        if (!candidate) continue
        const trimmed = candidate.trim()
        if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) continue
        try {
          return JSON.stringify(JSON.parse(trimmed), null, 2)
        } catch (e) { /* not valid JSON, try the next candidate */ }
      }
      return null
    },
    showJson(param, event) {
      const json = this.jsonValue(param)
      if (json === null) return
      const panelRect = this.$el.getBoundingClientRect()
      const rowRect = event.currentTarget.getBoundingClientRect()
      const width = 380
      let left = panelRect.left - width - 10
      if (left < 8) {
        left = panelRect.right + 10
      }
      const top = Math.max(8, Math.min(rowRect.top, window.innerHeight - 320))
      this.hoverJson = json
      this.hoverPos = { top, left }
    },
    hideJson() {
      this.hoverJson = null
    },
    toggleDecode(param) {
      const key = this.paramKey(param)
      this.decodedKeys[key] = !this.decodedKeys[key]
    },
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
  background: #a5f729;
  color: #1e5582;
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

.floating-panel-controls {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

.floating-panel-toggle {
  border: none;
  background: rgba(30, 85, 130, 0.15);
  color: #1e5582;
  border-radius: 4px;
  min-width: 22px;
  height: 22px;
  padding: 0 3px;
  cursor: pointer;
  font-size: 11px;
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

.floating-panel-row.has-json {
  cursor: help;
}

.floating-panel-json-tooltip {
  position: fixed;
  width: 380px;
  max-height: 310px;
  overflow: hidden;
  background: white;
  border: 1px solid #1e5582;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  padding: 8px 10px;
  z-index: 300;
  pointer-events: none;
}

.floating-panel-json-tooltip pre {
  margin: 0;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
  white-space: pre-wrap;
  word-break: break-all;
}

.floating-panel-decode-btn {
  border: none;
  border-radius: 4px;
  background-color: #a5f729;
  color: #1e5582;
  font-weight: 600;
  font-size: 10px;
  padding: 1px 6px;
  margin-left: 4px;
  cursor: pointer;
  vertical-align: middle;
}
</style>
