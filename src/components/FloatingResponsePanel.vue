<template>
  <div class="floating-panel" :style="{ top: position.top + 'px', left: position.left + 'px' }">
    <div class="floating-panel-header" @mousedown="startDrag">
      <span>{{ title }}</span>
      <button type="button" class="floating-panel-toggle" @mousedown.stop @click="collapsed = !collapsed">{{ collapsed ?
        '▢' : '—' }}</button>
    </div>
    <div v-show="!collapsed" class="floating-panel-body">
      <textarea class="response-input" rows="4" v-model="responseInput"
        placeholder="Paste the direct.aspx response (Len=...&Data=... or just the Data value) - it decrypts automatically"></textarea>
      <div v-if="decrypted.length" class="decrypted-rows">
        <DecryptedParams :params="decrypted" />
      </div>
      <div v-else-if="responseInput.trim().length > 0" class="floating-panel-error">Could not decrypt - check the
        pasted value and the encryption password.</div>
    </div>
  </div>
</template>

<script>
import DecryptedParams from '@/components/DecryptedParams.vue'
import { decryptResponseBody } from '@/utils/blowfish.js'

export default {
  name: 'FloatingResponsePanel',
  components: {
    DecryptedParams
  },
  props: {
    title: {
      type: String,
      default: 'Response decryption',
    },
    password: {
      type: String,
      default: '',
    },
  },
  emits: ['response-decrypted'],
  data() {
    return {
      collapsed: false,
      responseInput: '',
      loggedInput: '',
      position: {
        top: 90,
        left: Math.max(20, window.innerWidth - 680),
      },
      dragging: false,
      offset: { x: 0, y: 0 },
    }
  },
  computed: {
    decrypted() {
      return decryptResponseBody(this.responseInput, this.password)
    },
  },
  watch: {
    decrypted(value) {
      // emit once per distinct successfully-decrypted paste, not on every
      // keystroke while the value is still being typed/edited
      if (value.length > 0 && this.responseInput !== this.loggedInput) {
        this.loggedInput = this.responseInput
        this.$emit('response-decrypted', { params: value, raw: this.responseInput })
      }
    },
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

.floating-panel-toggle {
  border: none;
  background: rgba(30, 85, 130, 0.15);
  color: #1e5582;
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
  font-size: 11px;
}

.response-input {
  width: 100%;
  resize: vertical;
  border: 1px solid #d4d4d4;
  border-radius: 6px;
  padding: 6px;
  font-size: 11px;
  outline: none;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
}

.decrypted-rows {
  margin-top: 6px;
  font-family: ui-monospace, Menlo, Monaco, Consolas, monospace;
}

.floating-panel-error {
  margin-top: 6px;
  color: #d12f2f;
  font-size: 11px;
}
</style>
