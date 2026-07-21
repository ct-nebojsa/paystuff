<template>
    <div class="qt-main-wrapper">
        <div class="card qt-wrapper">
            <h3 class="page-title">Quick testing</h3>
            <h4 class="warning-text">One-click S2S tests via direct.aspx</h4>
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
                        <textarea readonly class="field-textarea" :rows="Math.ceil(plaintext.length / 69) + 1">{{ plaintext }}</textarea>
                    </p>
                    <div class="flex gap-2 items-center justify-center mt-2">
                        <a class="payment-url-button" :href="requestUrl" target="_blank"><span>Open</span>
                            direct.aspx</a>
                        <button class="btn-secondary" @click="copyUrl">{{ copied ? 'Copied!' : 'Copy URL' }}</button>
                    </div>
                </div>
                <h4 class="section-title">Paygate response</h4>
                <iframe :src="requestUrl" width="100%" height="150"></iframe>
                <h4 class="section-title mt-3">Decrypt response</h4>
                <textarea class="field-textarea" rows="4" v-model="responseInput"
                    placeholder="Paste the response from above (Len=...&Data=... or just the Data value) - it decrypts automatically"></textarea>
                <div v-if="decryptedResponse.length" class="subsection mt-2">
                    <DecryptedParams :params="decryptedResponse" />
                </div>
                <p v-else-if="responseInput.trim().length > 0" class="validation-error">Could not decrypt - check the
                    pasted value and the encryption password.</p>
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
const THREE_DS_ECI05 = '{"acsProtocolVersion":"2.2.0","authenticationValue":"kAMACEJBakKSOSzNLnxNiZeBQnf+","eci":"02","threeDSServerTransID":"a3dd2b66-6c06-423b-acd4-1cc19697a08f","dsTransID":"9e0e91c0-24e3-423c-a136-97023269d580","intermediateStatus":"Y","finalStatus":"Y"}'

const QUICK_TESTS = [
    {
        value: 'card', label: 'Card (VISA test card)',
        params: () => ({
            card: btoa(CARD),
            browserInfo: btoa(BROWSER_INFO),
            threeDsData: btoa(THREE_DS_ECI05),
        }),
    },
    {
        value: 'cb2a', label: 'CB2A',
        params: () => ({
            PayType: 'CB2A',
            card: btoa(CARD),
            browserInfo: btoa(BROWSER_INFO),
            threeDsData: btoa(THREE_DS_ECI05),
        }),
    },
    {
        value: 'googlepay', label: 'Google Pay (tokenized card)',
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
            responseInput: '',
        }
    },
    computed: {
        baseurl() {
            return getBaseUrl(this.auth.partner, this.auth.environment)
        },
        canRun() {
            return !!this.auth.merchantid && !!this.auth.bf_password
        },
        requestUrl() {
            return `https://${this.baseurl}/direct.aspx?MerchantID=${this.auth.merchantid}&Len=${this.plaintext.length}&Data=${this.encrypted_data}`
        },
        decryptedResponse() {
            return decryptResponseBody(this.responseInput, this.auth.bf_password)
        },
    },
    methods: {
        runTest() {
            this.isRun = false
            this.responseInput = ''
            let transid = 'NEBO_'
            for (let i = 0; i < 10; i++) {
                transid += Math.floor(Math.random() * 10)
            }
            this.transid = transid

            let orderdescSuffix = ''
            for (let i = 0; i < 6; i++) {
                orderdescSuffix += Math.floor(Math.random() * 10)
            }

            const test = QUICK_TESTS.find(t => t.value === this.testtype)
            const params = {
                MerchantID: this.auth.merchantid,
                TransID: this.transid,
                Amount: this.amount,
                Currency: this.currency,
                URLNotify: 'https://paygate-test.vercel.app/notify',
                OrderDesc: `test:${orderdescSuffix}`,
                MsgVer: '2.0',
                ...test.params(),
            }
            this.plaintext = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join('&')
            this.encrypted_data = encryptBlowfish(this.plaintext, this.auth.bf_password)
            this.isRun = true
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

.payment-url-button {
    text-decoration: none;
    font-size: 11px;
    font-weight: 600;
    color: #1e5582;
    background-color: #a5f729;
    padding: 5px 10px;
    border-radius: 5px;
    display: flex;
    gap: 4px;
    align-items: center;
}

iframe {
    border: 1px solid #d4d4d4;
    border-radius: 8px;
}
</style>
