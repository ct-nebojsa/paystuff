<template>
    <div class="other-main-wrapper">
        <div class="card other-wrapper">
            <div class="subsection">
                <h1 class="section-title">Capture</h1>
                <p class="muted-text">n/a</p>
            </div>
            <div class="subsection">
                <h1 class="section-title">Increment</h1>
                <p class="muted-text">n/a</p>
            </div>
            <div class="subsection">
                <h1 class="section-title">Credit</h1>
                <p class="muted-text">n/a</p>
            </div>
            <div>
                <h1 class="section-title">Inquiry</h1>
                <div class="subsection">
                    <div class="field-row">
                        <strong class="field-label w-50! text-left!">Partner</strong>
                        <select name="partner" id="partner" class="field-select" v-model="auth.partner">
                            <option v-for="p in partners" :key="p.value" :value="p.value">{{ p.label }}</option>
                        </select>
                    </div>
                    <div class="field-row">
                        <strong class="field-label w-50! text-left!">MerchantID</strong>
                        <input type="text" class="field-input" v-model="merchantid">
                    </div>
                    <div class="field-row">
                        <strong class="field-label w-50! text-left!">Encryption password</strong>
                        <input type="text" class="field-input" v-model="secret_test">
                    </div>
                    <div class="field-row">
                        <strong class="field-label w-50! text-left!">PayID</strong>
                        <input type="text" class="field-input" v-model="payid">
                    </div>
                    <div class="field-row">
                        <strong class="field-label w-50! text-left!">TransID</strong>
                        <input type="text" class="field-input" v-model="transid">
                    </div>
                    <div class="card narrower mt-3">
                        <p class="field-row">
                            <strong class="field-label w-50! text-left!">Plain text:</strong>
                            <textarea name="" id="" class="field-textarea result-textarea">{{ plaintext }}</textarea>
                            <button type="button" class="btn-secondary" @click="copyText(plaintext, 'plaintext')">{{ copiedField === 'plaintext' ? 'Copied!' : 'Copy' }}</button>
                        </p>
                        <p class="field-row">
                            <strong class="field-label w-50! text-left!">Len:</strong>
                            <span>{{ len }}</span>
                        </p>
                        <p class="field-row" v-if="encrypted_data">
                            <strong class="field-label w-50! text-left!">Encrypted data:</strong>
                            <textarea name="" id="" class="field-textarea result-textarea">{{ encrypted_data }}</textarea>
                            <button type="button" class="btn-secondary" @click="copyText(encrypted_data, 'encrypted')">{{ copiedField === 'encrypted' ? 'Copied!' : 'Copy' }}</button>
                        </p>
                    </div>
                </div>
                <div class="text-center">
                    <button @click="encryptData(plaintext)" class="btn-primary">Encrypt</button>
                </div>
                <div class="response">
                    <h3 class="section-title">Paygate inquire response</h3>
                    <iframe v-if="isInquired" :src="inquire_url" width="500" height="150" ref="paymentIframe" @load="onIframeLoad"></iframe>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Navbar from '@/components/Navbar.vue'
import LoginModal from "@/components/LoginModal.vue";
import Header from "@/components/Header.vue";
import CryptoJS from "crypto-js";
import { PARTNERS, getBaseUrl } from '@/utils/partners.js'
import useAuthStore from '@/stores/auth.js'
export default {
    data() {
        return {
            auth: useAuthStore(),
            partners: PARTNERS,
            merchantid: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_MERCHANTID : '',
            payid: '',
            transid: '',
            secret_test: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_SECRET : '',
            encrypted_data: '',
            plain_text: '',
            len: 0,
            hmac_password: '',
            isDataEncrypted: false,
            isInquired: false,
            copiedField: '',
        }
    },
    components: {
        Header,
        Navbar
    },
    computed: {
        plaintext() {
            const params = {
                "MerchantID": this.merchantid
            }

            if (this.payid.length > 0) {
                params.PayID = this.payid
            }

            if (this.transid.length > 0) {
                params.TransID = this.transid
            }

            if (this.hmac_password.length > 0) {
                params.MAC = this.generateHMAC(this.hmac_data, this.hmac_password)
            }

            // Convert the object to a query string format
            this.plain_text = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join("&") + "&";  // Adds the trailing '&'

            this.len = this.plain_text.slice(0, -1).length;
            return this.plain_text.slice(0, -1);
        },
        baseurl() {
            return getBaseUrl(this.auth.partner, 'test')
        },
        inquire_url() {
            return `https://${this.baseurl}/inquire.aspx?MerchantID=${this.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`
        }
    },
    methods: {
        encryptData(data) {
            this.isInquired = false
            this.encrypted_data = CryptoJS.Blowfish.encrypt(data, CryptoJS.enc.Utf8.parse(this.secret_test), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }).ciphertext.toString(CryptoJS.enc.Hex);
            this.isDataEncrypted = true
            this.isInquired = true
        },
        onIframeLoad() {
            const iframe = this.$refs.paymentIframe;
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                console.log(iframeDoc.body); // Access the <body> of the iframe
            } catch (error) {
                console.error("Cannot access iframe contents due to cross-origin restrictions.", error);
            }
        },
        async copyText(text, field) {
            try {
                await navigator.clipboard.writeText(text);
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
            this.copiedField = field;
            setTimeout(() => {
                if (this.copiedField === field) {
                    this.copiedField = '';
                }
            }, 1500);
        },
    }
}
</script>

<style scoped>
.other-main-wrapper {
    width: 100%;
    margin: auto;
    display: flex;
    padding: 0 16px;
}

.other-wrapper {
    width: 600px;
    margin: auto;
}

.narrower {
    width: 100%;
}

.result-textarea {
    width: 100%;
    height: 50px;
    resize: none;
}

iframe {
    border: none;
    overflow: hidden;
    word-break: break-all;
}
</style>