<template>
    <p v-for="(param, idx) in params" :key="idx" class="param-line">
        <span class="param-text">{{ displayed(param, idx) }}</span>
        <button v-if="base64Value(param) !== null" class="btn-chip decode-btn" @click="toggle(idx)">
            {{ decodedIdx[idx] ? 'Original' : 'Decode' }}</button>
    </p>
</template>

<script>
import { splitParam, base64ParamValue } from '@/utils/base64.js'

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
        base64Value(param) {
            return base64ParamValue(param)
        },
        displayed(param, idx) {
            if (!this.decodedIdx[idx]) return param
            const [key] = splitParam(param)
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
