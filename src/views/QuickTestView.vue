<template>
    <div class="qt-main-wrapper">
        <div class="card qt-wrapper">
            <h3 class="page-title">Quick testing</h3>
            <h4 class="warning-text">One-click S2S tests</h4>
            <div class="subsection">
                <div class="field-row">
                    <strong class="field-label w-50! text-left!">Environment</strong>
                    <select class="field-select" v-model="auth.environment">
                        <option value="dev">DEV</option>
                        <option value="test">TEST</option>
                        <option value="prod">PRODUCTION</option>
                    </select>
                </div>
                <div class="field-row">
                    <strong class="field-label w-50! text-left!">Merchant ID</strong>
                    <input type="text" class="field-input" v-model="auth.merchantid" placeholder="(mandatory)">
                </div>
                <div class="field-row">
                    <strong class="field-label w-50! text-left!">Encryption password</strong>
                    <input type="text" class="field-input" v-model="auth.bf_password" placeholder="(mandatory)">
                </div>
                <div class="field-row">
                    <strong class="field-label w-50! text-left!">Amount</strong>
                    <input type="text" class="field-input" v-model="amount">
                </div>
                <div class="field-row">
                    <strong class="field-label w-50! text-left!">Currency</strong>
                    <input type="text" class="field-input" v-model="currency">
                </div>
                <div class="field-row">
                    <strong class="field-label w-50! text-left!">Pay type</strong>
                    <select class="field-select" v-model="testtype">
                        <option v-for="t in quicktests" :key="t.value" :value="t.value">{{ t.label }}</option>
                    </select>
                </div>
            </div>
            <div class="text-center">
                <button class="btn-primary" :disabled="!canRun" @click="runTest">Run test</button>
                <p v-if="!canRun" class="validation-error">Merchant ID and encryption password are required.</p>
            </div>
            <div v-if="isRun" class="mt-3">
                <div class="subsection">
                    <p class="field-row">
                        <strong class="field-label w-50! text-left!">TransID:</strong>
                        <span>{{ transid }}</span>
                    </p>
                    <p class="field-row">
                        <strong class="field-label w-50! text-left!">Plain text:</strong>
                        <textarea readonly class="field-textarea" :rows="plaintextRows">{{ displayedPlaintext }}</textarea>
                    </p>
                    <div class="text-center">
                        <button class="btn-chip" @click="oneParamPerLine = !oneParamPerLine">{{ oneParamPerLine ?
                            'Single line' : 'One param per line' }}</button>
                    </div>
                    <div class="flex gap-2 items-center justify-center mt-2">
                        <button class="btn-secondary" @click="copyUrl">{{ copied ? 'Copied!' : 'Copy URL' }}</button>
                    </div>
                </div>
                <h4 class="section-title">Paygate response</h4>
                <div v-if="isLoading" class="flex items-center gap-2">
                    <span class="spinner" aria-hidden="true"></span>
                    <p class="muted-text">Calling {{ aspxPage }}.aspx...</p>
                </div>
                <p v-else-if="responseError" class="validation-error">{{ responseError }}</p>
                <div v-else-if="responseBody" class="subsection">
                    <DecryptedParams v-if="decryptedResponse.length" :params="decryptedResponse" />
                    <template v-else>
                        <p class="validation-error">Received a response but could not decrypt it - raw body below.
                        </p>
                        <textarea readonly class="field-textarea mt-2" rows="3">{{ responseBody }}</textarea>
                    </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import DecryptedParams from '@/components/DecryptedParams.vue'
import useAuthStore from '@/stores/auth.js'
import { getBaseUrl } from '@/utils/partners.js'
import { encryptBlowfish, decryptResponseBody } from '@/utils/blowfish.js'

const CARD = '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"4111111111111111","brand":"VISA"}'
const BROWSER_INFO = '{"timeZoneOffset":"120","acceptHeaders":"text","ipAddress":"93.176.166.240","javaEnabled":false,"javaScriptEnabled":true,"language":"US","colorDepth":32,"screenWidth":1060,"screenHeight":1050,"userAgent":"Mozilla/5.0"}'

const ORDERDESC_WORDS = ['checkout', 'payment', 'order', 'purchase', 'invoice', 'cart', 'sale', 'txn',
    'billing', 'settlement', 'refund', 'subscription', 'webstore', 'pos', 'wallet', 'receipt']

function randomOrderDescSuffix() {
    const a = ORDERDESC_WORDS[Math.floor(Math.random() * ORDERDESC_WORDS.length)]
    const b = ORDERDESC_WORDS[Math.floor(Math.random() * ORDERDESC_WORDS.length)]
    return `${a}-${b}`
}

function randomUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}

// a fresh threeDSServerTransID/dsTransID each call, so repeated test runs
// don't replay the same 3DS authentication session
function freshThreeDsData() {
    return btoa(JSON.stringify({
        acsProtocolVersion: '2.2.0',
        authenticationValue: 'kAMACEJBakKSOSzNLnxNiZeBQnf+',
        eci: '02',
        threeDSServerTransID: randomUuid(),
        dsTransID: randomUuid(),
        intermediateStatus: 'Y',
        finalStatus: 'Y',
    }))
}

const QUICK_TESTS = [
    {
        value: 'card', label: 'Card (VISA test card)', aspx: 'direct',
        params: () => ({
            card: btoa(CARD),
            browserInfo: btoa(BROWSER_INFO),
            threeDsData: freshThreeDsData(),
        }),
    },
    {
        value: 'cb2a', label: 'CB2A', aspx: 'direct',
        params: () => ({
            PayType: 'CB2A',
            card: btoa(CARD),
            browserInfo: btoa(BROWSER_INFO),
            threeDsData: freshThreeDsData(),
        }),
    },
    {
        value: 'googlepay', label: 'Google Pay (tokenized card)', aspx: 'direct',
        omit: ['MsgVer'],
        params: () => ({
            PayType: 'GooglePay',
            GooglePayMethod: 'TOKENIZED_CARD',
            TOKENIZED_CARD: 'yes',
            ECI: '05',
            TokenECIOriginal: '05',
            ccFraud: 'ignore',
            CCExpiry: '202801',
            vbv: 'no',
            CCNr: '4300029510000001',
            RTF: 'C',
            CAVV: 'kAMACEJBakKSOSzNLnxNiZeBQnf+',
            CCBrand: 'VISA',
        }),
    },
    {
        value: 'paytweak', label: 'Paytweak PBL', aspx: 'paybylinkexternal',
        omit: ['URLNotify'],
        params: () => ({
            email: '',
            Service: 'link',
            Language: 'en',
            externalLanguage: 'US',
            bdEmail: 'nebojsa.pesic@computop.com',
        }),
    },
]

export default {
    components: {
        DecryptedParams
    },
    data() {
        return {
            auth: useAuthStore(),
            quicktests: QUICK_TESTS,
            testtype: 'card',
            amount: '1000',
            currency: 'EUR',
            transid: '',
            plaintext: '',
            encrypted_data: '',
            isRun: false,
            copied: false,
            isLoading: false,
            responseBody: '',
            responseError: '',
            oneParamPerLine: false,
        }
    },
    computed: {
        baseurl() {
            return getBaseUrl(this.auth.partner, this.auth.environment)
        },
        canRun() {
            return !!this.auth.merchantid && !!this.auth.bf_password
        },
        activeTest() {
            return QUICK_TESTS.find(t => t.value === this.testtype)
        },
        aspxPage() {
            return this.activeTest ? this.activeTest.aspx : 'direct'
        },
        requestUrl() {
            return `https://${this.baseurl}/${this.aspxPage}.aspx?MerchantID=${this.auth.merchantid}&Len=${this.plaintext.length}&Data=${this.encrypted_data}`
        },
        decryptedResponse() {
            return decryptResponseBody(this.responseBody, this.auth.bf_password)
        },
        displayedPlaintext() {
            return this.oneParamPerLine ? this.plaintext.split('&').join('\r') : this.plaintext
        },
        plaintextRows() {
            return this.oneParamPerLine
                ? this.plaintext.split('&').length
                : Math.ceil(this.plaintext.length / 69) + 1
        },
    },
    methods: {
        async runTest() {
            this.isRun = false
            this.responseBody = ''
            this.responseError = ''
            let transid = 'NEBO_'
            for (let i = 0; i < 10; i++) {
                transid += Math.floor(Math.random() * 10)
            }
            this.transid = transid

            const test = QUICK_TESTS.find(t => t.value === this.testtype)
            const params = {
                MerchantID: this.auth.merchantid,
                TransID: this.transid,
                Amount: this.amount,
                Currency: this.currency,
                URLNotify: 'https://paygate-test.vercel.app/notify',
                OrderDesc: `test:${randomOrderDescSuffix()}`,
                MsgVer: '2.0',
                ...test.params(),
            }
            if (test.omit) {
                test.omit.forEach(key => delete params[key])
            }
            this.plaintext = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            this.encrypted_data = encryptBlowfish(this.plaintext, this.auth.bf_password)
            this.isRun = true

            this.isLoading = true
            try {
                const query = new URLSearchParams({
                    partner: this.auth.partner,
                    environment: this.auth.environment,
                    merchantid: this.auth.merchantid,
                    aspx: this.aspxPage,
                    len: String(this.plaintext.length),
                    data: this.encrypted_data,
                })
                const res = await fetch(`/api/direct-proxy?${query.toString()}`)
                const json = await res.json()
                if (!res.ok) {
                    this.responseError = json.error || 'Request failed.'
                } else {
                    this.responseBody = json.body
                }
            } catch (e) {
                this.responseError = 'Could not reach the proxy - this only works when deployed on Vercel (or via `vercel dev` locally).'
            } finally {
                this.isLoading = false
            }
        },
        async copyUrl() {
            try {
                await navigator.clipboard.writeText(this.requestUrl)
            } catch (e) {
                const ta = document.createElement('textarea')
                ta.value = this.requestUrl
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
.qt-main-wrapper {
    width: 100%;
    margin: auto;
    display: flex;
    padding: 0 16px;
    margin-top: 20px;
}

.qt-wrapper {
    width: 600px;
    margin: auto;
}

.validation-error {
    margin-top: 4px;
    font-size: 11px;
    color: #d12f2f;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid #d4d4d4;
    border-top-color: #1e5582;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
    flex-shrink: 0;
}

@media (prefers-reduced-motion: reduce) {
    .spinner {
        animation: none;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
