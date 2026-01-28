<template>
    <div class="other-main-wrapper">
        <div class="other-wrapper">
            <div>
                <h1>Capture</h1>
                <p>n/a</p>
            </div>
            <hr style="opacity: .3;">
            <div>
                <h1>Increment</h1>
                <p>n/a</p>
            </div>
            <hr style="opacity: .3;">
            <div>
                <h1>Credit</h1>
                <p>n/a</p>
            </div>
            <hr style="opacity: .3;">
            <div>
                <h1>Inquiry</h1>
                <div>
                    <div class="mini-wrapper">
                        <strong style="width: 200px; display: inline-block;">MerchantID</strong>
                        <input type="text" class="simple-input" v-model="merchantid">
                    </div>
                    <div class="mini-wrapper">
                        <strong style="width: 200px; display: inline-block;">Encryption password</strong>
                        <input type="text" class="simple-input" v-model="secret_test">
                    </div>
                    <div class="mini-wrapper">
                        <strong style="width: 200px; display: inline-block;">PayID</strong>
                        <input type="text" class="simple-input" v-model="payid">
                    </div>
                    <div class="mini-wrapper">
                        <strong style="width: 200px; display: inline-block;">TransID</strong>
                        <input type="text" class="simple-input" v-model="transid">
                    </div>
                    <div class="wrapper narrower">
                        <p style="margin: 2px;">
                            <strong style="display: inline-block; width: 200px;">Plain text:</strong>
                            <textarea name="" id="">{{ plaintext }}</textarea>
                        </p>
                        <p style="margin: 2px;">
                            <strong style="display: inline-block; width: 200px;">Len:</strong>
                            <span>{{ len }}</span>
                        </p>
                        <p style="margin: 2px;">
                            <strong style="display: inline-block; width: 200px;">Encrypted data:</strong>
                            <textarea v-if="encrypted_data" name="" id="">{{ encrypted_data }}</textarea>
                        </p>
                    </div>
                </div>
                <!-- <div><p>{{ inquire_url }}</p></div> -->
                <div style="text-align: center;">
                <button @click="encryptData(plaintext)" class="simple-button">Encrypt</button>
            </div>
            <div class="response">
                <h3>Paygate inquire response</h3>
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
export default {
    data() {
        return {
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
        inquire_url() {
            return `https://test.computop-paygate.com/inquire.aspx?MerchantID=${this.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`
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
    }
}
</script>

<style scoped>
h1,
h2,
h3 {
    color: #1e5582;
}

.other-main-wrapper {
    width: 100%;
    margin: auto;
    display: flex;
}

.other-wrapper {
    padding: 20px;
    width: 600px;
    background-color: white;
    border-radius: 10px;
    margin: auto;
}

.simple-input {
    padding: 4px;
    border-radius: 5px;
    border: 1px solid;
    border-color: #d4d4d4;
    width: 300px;
    border-color: #d4d4d4;
    outline: none;
}

.simple-button {
    border: none;
    background-color: #a5f729;
    border-radius: 5px;
    padding: 10px 45px 10px 45px;
    cursor: pointer;
    font-size: 16px;
    color: #1e5582;
    font-weight: 600;
    margin-top: 10px;
    margin-bottom: 10px;
}

textarea {
    width: 500px;
    height: 50px;
    resize: none;
    border-radius: 10px;
    outline: none;
    padding: 5px;
    border: 1px solid;
    border-color: #d4d4d4;
}

.mini-wrapper {
    margin-bottom: 5px;
}

iframe {
    border: none;
    overflow: hidden;
    word-break: break-all;
}
</style>