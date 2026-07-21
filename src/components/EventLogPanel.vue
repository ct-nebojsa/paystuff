<template>
    <div class="log-overlay" @mousedown.self="$emit('close')">
        <div class="log-modal">
            <div class="log-header">
                <h3>Event log</h3>
                <div class="log-header-actions">
                    <button class="btn-secondary" @click="copyLog">{{ copied ? 'Copied!' : 'Copy log' }}</button>
                    <button class="btn-secondary" @click="store.clear()">Clear</button>
                    <button type="button" class="log-close-btn" @click="$emit('close')">&times;</button>
                </div>
            </div>
            <p class="muted-text log-note">This session only - nothing here is saved or sent anywhere.</p>
            <div class="log-body" ref="logBody">
                <p v-if="store.entries.length === 0" class="muted-text log-empty">No requests logged yet this
                    session.</p>
                <div v-for="entry in store.entries" :key="entry.id" class="log-entry">
                    <div class="log-entry-head">
                        <span class="log-badge" :class="'log-badge-' + entry.kind">{{ entry.kind.toUpperCase()
                        }}</span>
                        <span class="log-time" :title="new Date(entry.timestamp).toLocaleString()">{{
                            formatTime(entry.timestamp) }}</span>
                        <span class="log-page">{{ entry.page }}</span>
                        <span v-if="entry.aspx" class="log-aspx">{{ entry.aspx }}.aspx</span>
                    </div>
                    <p v-if="entry.message" class="validation-error log-message">{{ entry.message }}</p>
                    <p v-if="entry.url" class="log-url">{{ entry.url }}</p>
                    <div v-if="entry.params && entry.params.length" class="log-params">
                        <DecryptedParams :params="entry.params" />
                    </div>
                    <textarea v-else-if="entry.raw" readonly class="field-textarea log-raw" rows="2">{{ entry.raw }}</textarea>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DecryptedParams from '@/components/DecryptedParams.vue'
import useEventLogStore from '@/stores/eventLog.js'

export default {
    name: 'EventLogPanel',
    components: {
        DecryptedParams
    },
    emits: ['close'],
    data() {
        return {
            store: useEventLogStore(),
            copied: false,
        }
    },
    watch: {
        'store.entries.length'() {
            this.$nextTick(() => this.scrollToEnd())
        },
    },
    mounted() {
        this.scrollToEnd()
    },
    methods: {
        scrollToEnd() {
            const el = this.$refs.logBody
            if (el) {
                el.scrollTop = el.scrollHeight
            }
        },
        formatTime(ts) {
            return new Date(ts).toLocaleTimeString()
        },
        entryText(entry) {
            const lines = [`[${new Date(entry.timestamp).toLocaleString()}] ${entry.kind.toUpperCase()} - ${entry.page}${entry.aspx ? ' - ' + entry.aspx + '.aspx' : ''}`]
            if (entry.message) lines.push(entry.message)
            if (entry.url) lines.push(entry.url)
            if (entry.params && entry.params.length) {
                lines.push(...entry.params)
            } else if (entry.raw) {
                lines.push(entry.raw)
            }
            return lines.join('\n')
        },
        async copyLog() {
            const text = this.store.entries.map(this.entryText).join('\n\n')
            try {
                await navigator.clipboard.writeText(text)
            } catch (e) {
                const ta = document.createElement('textarea')
                ta.value = text
                document.body.appendChild(ta)
                ta.select()
                document.execCommand('copy')
                document.body.removeChild(ta)
            }
            this.copied = true
            setTimeout(() => { this.copied = false }, 1500)
        },
    },
}
</script>

<style scoped>
.log-overlay {
    position: fixed;
    inset: 0;
    background: rgba(20, 25, 50, 0.45);
    z-index: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.log-modal {
    width: 100%;
    max-width: 640px;
    max-height: 80vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.35);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.log-header {
    background: #a5f729;
    color: #1e5582;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-shrink: 0;
}

.log-header h3 {
    font-size: 15px;
    font-weight: 700;
    margin: 0;
}

.log-header-actions {
    display: flex;
    align-items: center;
    gap: 6px;
}

.log-close-btn {
    border: none;
    background: rgba(30, 85, 130, 0.15);
    color: #1e5582;
    border-radius: 4px;
    width: 24px;
    height: 24px;
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
}

.log-note {
    padding: 6px 14px 0;
    font-size: 11px;
    flex-shrink: 0;
}

.log-body {
    padding: 10px 14px 14px;
    overflow-y: auto;
    flex: 1;
}

.log-empty {
    text-align: center;
    padding: 30px 0;
}

.log-entry {
    background: #f7f9fb;
    border: 1px solid #e7edf2;
    border-radius: 8px;
    padding: 8px 10px;
    margin-bottom: 8px;
    font-size: 11px;
}

.log-entry-head {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
    flex-wrap: wrap;
}

.log-badge {
    font-weight: 700;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.03em;
}

.log-badge-request {
    background: #1e5582;
    color: white;
}

.log-badge-response {
    background: #a5f729;
    color: #1e5582;
}

.log-badge-error {
    background: #d12f2f;
    color: white;
}

.log-time {
    color: #666;
    font-variant-numeric: tabular-nums;
}

.log-page {
    color: #1e5582;
    font-weight: 600;
}

.log-aspx {
    color: #666;
}

.log-message {
    margin: 2px 0 4px;
}

.log-url {
    word-break: break-all;
    color: #666;
    margin-bottom: 4px;
}

.log-raw {
    width: 100%;
    font-size: 11px;
}
</style>
