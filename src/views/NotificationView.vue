<template>
    <div class="notify-main-wrapper">
        <div class="card notify-wrapper">
            <h1 class="page-title" :class="statusClass">{{ title }}</h1>
            <p class="muted-text mb-3">Parameters received on this URL:</p>

            <div v-if="hasParams" class="subsection">
                <div class="field-row" v-for="(value, key) in query" :key="key">
                    <strong class="field-label w-37.5! text-left!">{{ key }}</strong>
                    <span class="param-value">{{ value }}</span>
                </div>
            </div>
            <p v-else class="muted-text">No query parameters were received on this URL.</p>

            <div v-if="query.Data && query.Len" class="subsection">
                <h2 class="section-title">Decrypt Data</h2>
                <div class="field-row">
                    <strong class="field-label w-37.5! text-left!">Encryption password:</strong>
                    <input type="text" class="field-input" v-model="auth.bf_password">
                </div>
                <div class="text-center mt-2">
                    <button class="btn-primary" @click="decryptData">Decrypt</button>
                </div>
                <div v-if="isDecrypted" class="mt-2">
                    <DecryptedParams :params="decryptedDataArray" />
                </div>
            </div>

            <div class="text-center mt-3">
                <router-link to="/" class="btn-secondary">Back to encryption tool</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import DecryptedParams from '@/components/DecryptedParams.vue'
import useAuthStore from '@/stores/auth.js'
import { decryptBlowfish } from '@/utils/blowfish.js'

export default {
    components: {
        DecryptedParams
    },
    props: {
        status: {
            type: String,
            required: true,
            validator: (v) => ['success', 'failure', 'back', 'notify'].includes(v)
        }
    },
    data() {
        return {
            auth: useAuthStore(),
            decryptedData: '',
            decryptedDataArray: [],
            isDecrypted: false,
        }
    },
    computed: {
        query() {
            return this.$route.query
        },
        hasParams() {
            return Object.keys(this.query).length > 0
        },
        title() {
            if (this.status === 'success') return 'Payment Successful'
            if (this.status === 'failure') return 'Payment Failed'
            if (this.status === 'notify') return 'Notification Received'
            return 'Redirected Back'
        },
        statusClass() {
            return `status-${this.status}`
        }
    },
    methods: {
        decryptData() {
            this.decryptedData = decryptBlowfish(this.query.Data, this.auth.bf_password, parseInt(this.query.Len, 10) || 0);
            this.decryptedDataArray = this.decryptedData.split('&')
            this.isDecrypted = true
        }
    }
}
</script>

<style scoped>
.notify-main-wrapper {
    width: 100%;
    margin: auto;
    display: flex;
    padding: 0 16px;
    margin-top: 20px;
}

.notify-wrapper {
    width: 600px;
    margin: auto;
}

.param-value {
    word-break: break-all;
    font-size: 11px;
}

.status-success {
    color: #2e8b30;
}

.status-failure {
    color: #d12f2f;
}

.status-back {
    color: #1e5582;
}

.status-notify {
    color: #1e5582;
}
</style>
