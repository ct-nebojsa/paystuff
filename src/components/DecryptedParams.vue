<template>
    <p v-for="(param, idx) in params" :key="idx" class="param-line">
        <span class="param-text">{{ displayed(param, idx) }}</span>
        <button v-if="base64Value(param) !== null" class="btn-chip decode-btn" @click="toggle(idx)">
            {{ decodedIdx[idx] ? 'Original' : 'Decode' }}</button>
    </p>
</template>

<script>
export default {
    name: 'DecryptedParams',
    props: {
        params: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            decodedIdx: {},
        }
    },
    watch: {
        params() {
            this.decodedIdx = {}
        },
    },
    methods: {
        splitParam(param) {
            const i = param.indexOf('=')
            return i === -1 ? [param, ''] : [param.slice(0, i), param.slice(i + 1)]
        },
        // returns the decoded text when the value is base64-encoded readable
        // text (Paygate uses base64 for JSON blobs like card), otherwise null
        base64Value(param) {
            const value = this.splitParam(param)[1]
            if (value.length < 12 || value.length % 4 !== 0) return null
            if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) return null
            try {
                const decoded = atob(value)
                if (decoded.length === 0) return null
                const printable = [...decoded].every(c => {
                    const n = c.charCodeAt(0)
                    return (n >= 32 && n <= 126) || n === 9 || n === 10 || n === 13
                })
                return printable ? decoded : null
            } catch (e) {
                return null
            }
        },
        displayed(param, idx) {
            if (!this.decodedIdx[idx]) return param
            const [key] = this.splitParam(param)
            return `${key}=${this.base64Value(param)}`
        },
        toggle(idx) {
            this.decodedIdx[idx] = !this.decodedIdx[idx]
        },
    },
}
</script>

<style scoped>
.param-line {
    margin-bottom: 2px;
}

.param-text {
    word-break: break-all;
}

.decode-btn {
    margin-left: 6px;
    vertical-align: middle;
}
</style>
