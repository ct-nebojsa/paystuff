<template>
    <Navbar />
    <div class="main-wrapper">
        <div class="wrapper">
            <h1>Paygate Playground</h1>
            <div class="parameters">
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Environment:</strong>
                    <select name="environment" id="environment" disabled>
                        <option value="dev">DEV</option>
                        <option value="test">TEST</option>
                        <option value="prod">PROD</option>
                    </select>
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Pay type:</strong>
                    <select name="paytype" id="paytype" v-model="paytype">
                        <option value="HPP">HPP</option>
                        <option value="payssl">payssl</option>
                        <option value="paytweak">paytweak</option>
                        <option value="direct">S2S</option>
                        <option value="SimplePay">SimplePay</option>
                    </select>
                </p>
                <hr style="opacity: .2;">
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">MsgVer=2.0:</strong>
                    <input type="checkbox" v-model="isMsgVer2">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; font-size: 12px;">Encryption password:</strong>
                    <input type="text" class="simple-input" v-model="secret_test">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">HMAC password:</strong>
                    <input type="text" placeholder="optional" class="simple-input" v-model="hmac_password">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Merchant ID:</strong>
                    <input type="text" class="simple-input" v-model="merchantid">
                </p>
                <p style="margin: 2px; display: flex;">
                    <strong style="display: inline-block; width: 150px;">Transaction ID:</strong>
                    <input type="text" class="simple-input narrow" v-model="transid">
                    <button @click="generate_transid" class="generate-button">Generate TransID</button>
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Amount:</strong>
                    <input type="text" class="simple-input" v-model="amount">
                </p>
                <p style="margin: 0;">
                    <strong style="display: inline-block; width: 150px;">Currency:</strong>
                    <input type="text" class="simple-input" v-model="currency">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">URLSuccess:</strong>
                    <input type="text" class="simple-input" v-model="urlsuccess">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">URLFailure:</strong>
                    <input type="text" class="simple-input" v-model="urlfailure">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">URLNotify:</strong>
                    <input type="text" class="simple-input" v-model="urlnotify">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Preauth:</strong>
                    <input type="checkbox" v-model="preauth_flag" disabled> <!-- disabled for now -->
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">OrderDesc:</strong>
                    <input type="text" class="simple-input" v-model="orderdesc">
                </p>
                <div style="margin: 2px; display: flex; flex-direction: column;">
                    <div>
                        <strong style="display: inline-block; width: 150px;">Card:</strong>
                        <input type="checkbox" v-model="isCard">
                    </div>
                    <div><textarea class="custom-height" v-if="isCard" rows="2" name="card" id="card"
                            v-model="card"></textarea></div>
                </div>
                <div style="margin: 2px; display: flex; flex-direction: column;">
                    <div>
                        <strong style="display: inline-block; width: 150px;">COF:</strong>
                        <input type="checkbox" v-model="isCredentialOnFile">
                    </div>
                    <div><textarea class="custom-height" v-if="isCredentialOnFile" name="cof" id="cof"
                            v-model="credentialOnFile"></textarea>
                    </div>
                </div>
                <div style="margin: 2px; display: flex; flex-direction: column;">
                    <div>
                        <strong style="display: inline-block; width: 150px;">threeDsData:</strong>
                        <input type="checkbox" v-model="isThreeDsData">
                    </div>
                    <div><textarea class="custom-height" v-if="isThreeDsData" name="threeDsData" id="threeDsData"
                            v-model="threeDsData"></textarea>
                    </div>
                </div>
                <p v-if="paytype === 'paytweak'" style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Service (Paytweak):</strong>
                    <input type="text" class="simple-input" v-model="paytweak_service">
                </p>
                <p style="margin: 2px;">
                    <button @click="encryptData(plaintext)" class="simple-button">Enrypt</button>
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Plain text:</strong>
                    <textarea name="" id="">{{ plaintext }}</textarea>
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Len:</strong>
                    <span>{{ len }}</span>
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Encrypted data:</strong>
                    <textarea v-if="encrypted_data" name="" id="">{{ encrypted_data }}</textarea>
                </p>
                <!-- <button @click="callaspx">CALLLL</button> -->
            </div>
        </div>
        <div style="margin: 0;">
            <div class="wrapper">
                <h3>Some Payment calls</h3>
                <div style="margin: 2px; display: flex; flex-direction: column;">
                    <strong style="display: inline-block; width: 150px;">{{ this.paytype }}:</strong>
                    <span class="redirect-url">{{ testurl_ohne_data }}</span>
                    <a v-if="isDataEncrypted" :href=testurl target="_blank">Call {{ this.paytype }}</a>
                </div>
            </div>
            <div v-if="isDataEncrypted" class="wrapper">
                <iframe :src="testurl" width="700" height="650" ref="paymentIframe" @load="onIframeLoad"></iframe>
            </div>
        </div>
    </div>
</template>

<script>
import CryptoJS from "crypto-js";
import axios from 'axios'
import Navbar from '@/components/Navbar.vue'
export default {
    data() {
        return {
            merchantid: '',
            transid: '',
            amount: '1000',
            currency: 'EUR',
            orderdesc: 'test:nebojsa',
            urlsuccess: 'http://127.0.0.1:3005/success',
            urlfailure: 'http://127.0.0.1:3005/failure',
            urlnotify: 'http://127.0.0.1:3005/urlnotify',
            secret_test: '',
            encrypted_data: '',
            plain_text: '',
            len: 0,
            paytype: 'HPP',
            paytweak_service: 'link',
            preauth_flag: false,
            isCard: false,
            card: '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"4111111111111111","brand":"VISA"}',
            isMsgVer2: true,
            isDataEncrypted: false,
            isCredentialOnFile: false,
            isThreeDsData: false,
            threeDsData: '{"challengeRequestInd":"04"}',
            credentialOnFile: '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2025-09-14","recurringExpiryDate":"2025-09-14"}},"initialPayment":true}',
            hmac_password: '',
        }
    },
    components: {
        Navbar
    },
    computed: {
        hmac_data() {
            return `*${this.merchantid}*${this.transid}*${this.amount}*${this.currency}` 
        },
        plaintext() {
            const params = {
                "MerchantID": this.merchantid,
                "TransID": this.transid,
                "Amount": this.amount,
                "Currency": this.currency,
                "URLSuccess": this.urlsuccess,
                "URLFailure": this.urlfailure,
                "URLNotify": this.urlnotify,
                "OrderDesc": this.orderdesc,
            };

            if (this.isMsgVer2) {
                params.MsgVer = "2.0";
            }

            if (this.paytype === 'paytweak') {
                params.Service = this.paytweak_service;
            }

            if (this.preauth_flag) {
                params.TxType = 'preauth';
            }

            if (this.isCard) {
                params.card = btoa(this.card);
            }

            if (this.isCredentialOnFile) {
                params.credentialOnFile = btoa(this.credentialOnFile);
            }

            if (this.isThreeDsData) {
                params.threeDsData = btoa(this.threeDsData);
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
        frontend() {
            if (this.paytype === 'HPP') {
                this.isDataEncrypted = false
                return 'paymentpage'
            } else if (this.paytype === 'payssl') {
                this.isDataEncrypted = false
                return 'payssl'
            } else if (this.paytype === 'paytweak') {
                this.isDataEncrypted = false
                return 'paybylinkexternal'
            } else if (this.paytype === 'direct') {
                this.isDataEncrypted = false
                return 'direct'
            }
            else {
                this.isDataEncrypted = false
                return '...'
            }
        },
        testurl_ohne_data() {
            return `https://test.computop-paygate.com/${this.frontend}.aspx?MerchantID=${this.merchantid}&Len=${this.len}&Data=[EncryptedData]`
        },
        testurl() {
            return `https://test.computop-paygate.com/${this.frontend}.aspx?MerchantID=${this.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`
        }
    },
    methods: {
        generate_transid() {
            let transid = '';
            for (let i = 0; i < 10; i++) {
                transid += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
            }
            this.transid = transid
            this.isDataEncrypted = false
        },
        encryptData(data) {
            this.encrypted_data = CryptoJS.Blowfish.encrypt(data, CryptoJS.enc.Utf8.parse(this.secret_test), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }).ciphertext.toString(CryptoJS.enc.Hex);
            this.isDataEncrypted = true
        },
        async callaspx() {
            await axios.get(`https://test.computop-paygate.com/paybylinkexternal.aspx?MerchantId=${this.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`)
                .then(response => {
                    console.log('Response:', response.data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
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
        generateHMAC(hmac_data, secret) {
            return CryptoJS.HmacSHA256(hmac_data, secret).toString(CryptoJS.enc.Hex);
        },
    },
    mounted() {
        this.generate_transid()
    }
}
</script>

<style scoped>
.main-wrapper {
    display: flex;
    width: 1200px;
    margin: auto;
    gap: 20px;
}

.wrapper {
    background-color: white;
    margin: auto;
    width: 700px;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 0 1px 1px #d4d4d4;
    margin-top: 0;
    margin-bottom: 20px;
}

select {
    width: 200px;
    padding: 4px;
    border: 1px solid;
    border-radius: 5px;
    background-color: white;
    border-color: #d4d4d4;

}

textarea {
    width: 500px;
    height: 200px;
    resize: none;
    border-radius: 10px;
    outline: none;
    padding: 5px;
    border: 1px solid;
    border-color: #d4d4d4;
}

.custom-height {
    height: 50px;
}

.simple-input {
    padding: 4px;
    border-radius: 5px;
    border: 1px solid;
    border-color: #d4d4d4;
    width: 300px;
    border-color: #d4d4d4;
}

.simple-button {
    border: none;
    background-color: tomato;
    border-radius: 5px;
    padding: 5px 20px 5px 20px;
    cursor: pointer;
}

.narrow {
    width: 200px;
}

.redirect-url {
    width: 600px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
}

.generate-button {
    border: none;
    border-radius: 5px;
    background-color: #1e5582;
    color: white;
    margin-left: 5px;
    font-size: 12px;
    cursor: pointer;
    padding: 0 5px 0 5px;
}

iframe {
    border: none;
    border-radius: 5px;
}
</style>