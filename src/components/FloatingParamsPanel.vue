<template>
  <Teleport to="[data-floating-params-dock]" :disabled="!docked">
  <div ref="panel" class="floating-panel" :class="{ 'is-docked': docked }" :style="panelStyle">
    <div class="floating-panel-header" @mousedown="startDrag">
      <span>{{ title }}</span>
      <div class="floating-panel-controls">
        <button type="button" class="floating-panel-toggle floating-panel-dock" :title="docked ? 'Undock panel' : 'Dock left of Event log'"
          @mousedown.stop @click="toggleDock">{{ docked ? 'Float' : 'Dock' }}</button>
        <button v-if="!docked" type="button" class="floating-panel-toggle" title="Smaller text" @mousedown.stop
          @click="changeFontSize(-1)">A−</button>
        <button v-if="!docked" type="button" class="floating-panel-toggle" title="Larger text" @mousedown.stop
          @click="changeFontSize(1)">A+</button>
        <button v-if="!docked" type="button" class="floating-panel-toggle" @mousedown.stop
          @click="collapsed = !collapsed">{{ collapsed ? '▢' : '—' }}</button>
      </div>
    </div>
    <div v-show="!collapsed" class="floating-panel-body" :style="{ fontSize: fontSize + 'px' }">
      <div v-if="endpoint" class="floating-panel-endpoint">
        <span class="floating-panel-endpoint-label">Endpoint</span>
        <span class="floating-panel-endpoint-value">{{ endpoint }}</span>
      </div>
      <div v-if="params.length === 0" class="floating-panel-empty">No parameters</div>
      <TransitionGroup name="parameter-row">
        <div v-for="param in params" :key="paramKey(param)" class="floating-panel-row"
          :class="{ 'has-json': jsonValue(param) !== null }" @mouseenter="showJson(param, $event)"
          @mouseleave="hideJson">
          {{ displayed(param) }}
          <button v-if="base64Value(param) !== null" type="button" class="floating-panel-decode-btn"
            @click="toggleDecode(param)">{{ decodedKeys[paramKey(param)] ? 'Original' : 'Decode' }}</button>
        </div>
      </TransitionGroup>
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
    <button v-if="!docked" type="button" class="floating-panel-resize-handle" title="Resize panel"
      aria-label="Resize panel" @mousedown.stop.prevent="startResize"></button>
  </div>
  </Teleport>
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
    endpoint: {
      type: String,
      default: '',
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
      collapsed: true,
      docked: true,
      fontSize: 11,
      decodedKeys: {},
      hoverJson: null,
      hoverPos: { top: 0, left: 0 },
      position: {
        top: 90,
        left: Math.max(20, window.innerWidth - 340),
      },
      dragging: false,
      resizing: false,
      offset: { x: 0, y: 0 },
      size: { width: 320, height: null },
      resizeStart: { x: 0, y: 0, width: 320, height: 0 },
    }
  },
  computed: {
    panelStyle() {
      if (this.docked) return {}
      return {
        top: this.position.top + 'px',
        left: this.position.left + 'px',
        width: this.size.width + 'px',
        height: this.size.height === null ? undefined : this.size.height + 'px',
        maxHeight: this.size.height === null ? undefined : 'none',
      }
    },
  },
  methods: {
    changeFontSize(delta) {
      this.fontSize = Math.min(16, Math.max(8, this.fontSize + delta))
    },
    toggleDock() {
      if (!this.docked) {
        this.docked = true
        this.collapsed = true
        return
      }

      const rect = this.$refs.panel.getBoundingClientRect()
      this.position = {
        top: Math.max(8, Math.min(rect.top, window.innerHeight - 48)),
        left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
      }
      this.docked = false
      this.collapsed = false
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
      const panelRect = this.$refs.panel.getBoundingClientRect()
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
    startResize(event) {
      const rect = this.$refs.panel.getBoundingClientRect()
      this.resizing = true
      this.resizeStart = {
        x: event.clientX,
        y: event.clientY,
        width: rect.width,
        height: rect.height,
      }
      document.addEventListener('mousemove', this.onResize)
      document.addEventListener('mouseup', this.stopResize)
    },
    onResize(event) {
      if (!this.resizing) return
      const maxWidth = Math.max(240, window.innerWidth - this.position.left - 8)
      const maxHeight = Math.max(140, window.innerHeight - this.position.top - 8)
      this.size = {
        width: Math.min(maxWidth, Math.max(240, this.resizeStart.width + event.clientX - this.resizeStart.x)),
        height: Math.min(maxHeight, Math.max(140, this.resizeStart.height + event.clientY - this.resizeStart.y)),
      }
    },
    stopResize() {
      this.resizing = false
      document.removeEventListener('mousemove', this.onResize)
      document.removeEventListener('mouseup', this.stopResize)
    },
    startDrag(event) {
      if (this.docked) return
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
    document.removeEventListener('mousemove', this.onResize)
    document.removeEventListener('mouseup', this.stopResize)
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

.floating-panel-resize-handle {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: linear-gradient(135deg, transparent 45%, #1e5582 46%, #1e5582 54%, transparent 55%);
  cursor: nwse-resize;
  opacity: 0.65;
  z-index: 2;
}

.floating-panel-resize-handle:hover {
  opacity: 1;
}

.floating-panel.is-docked {
  position: static;
  width: 280px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
}

.floating-panel.is-docked .floating-panel-header {
  cursor: default;
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
  touch-action: none;
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

.floating-panel-dock {
  min-width: 38px;
  padding: 0 5px;
}

.floating-panel-body {
  padding: 8px 10px;
  overflow-y: auto;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
  font-size: 11px;
}

.floating-panel-endpoint {
  margin-bottom: 7px;
  padding: 7px 8px;
  border: 1px solid rgba(30, 85, 130, 0.2);
  border-radius: 6px;
  background: rgba(30, 85, 130, 0.06);
}

.floating-panel-endpoint-label {
  display: block;
  margin-bottom: 3px;
  color: #1e5582;
  font-weight: 700;
}

.floating-panel-endpoint-value {
  display: block;
  color: #333;
  word-break: break-all;
}

.floating-panel-row {
  padding: 3px 0;
  border-bottom: 1px solid #f0f0f0;
  word-break: break-all;
}

.parameter-row-enter-active,
.parameter-row-leave-active {
  max-height: 100px;
  overflow: hidden;
  transition:
    opacity 300ms ease,
    transform 300ms ease,
    max-height 300ms ease,
    padding 300ms ease,
    background-color 900ms ease;
}

.parameter-row-enter-from {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  transform: translateX(12px);
  background-color: rgba(165, 247, 41, 0.65);
}

.parameter-row-enter-to {
  background-color: transparent;
}

.parameter-row-leave-to {
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  opacity: 0;
  transform: translateX(-12px);
  background-color: rgba(255, 99, 99, 0.22);
}

@media (prefers-reduced-motion: reduce) {
  .parameter-row-enter-active,
  .parameter-row-leave-active {
    transition: none;
  }
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
