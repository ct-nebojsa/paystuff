<template>
    <Header />
    <Navbar />
    <div class="main-wrapper">
        <div class="wrapper narrower">
            <h1 style="color: #1e5582; font-weight: 600;">Paygate Playground</h1>
            <h3 style="color: tomato;">Data is not stored on any server.</h3>
            <div class="parameters">
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Environment:</strong>
                    <select name="environment" id="environment" disabled style="width: 250px;">
                        <option value="dev">DEV disabled for now.</option>
                        <option value="test">TEST</option>
                        <option value="prod">PROD</option>
                    </select>
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Pay type:</strong>
                    <select name="paytype" id="paytype" v-model="paytype" style="width: 250px;">
                        <option value="mandateform">EasyCollect (mandateform.aspx)</option>
                        <option value="floapay">Floapay (floapay.aspx)</option>
                        <option value="paymentpage">HPP (paymentpage.aspx)</option>
                        <option value="instanea">Instanea (instanea.aspx)</option>
                        <option value="klarnapayments">KlarnaPM (klarnapayments.aspx)</option>
                        <option value="payssl">payssl (payssl.aspx)</option>
                        <option value="paybylink">paybylink (paybylink.aspx)</option>
                        <option value="paytweak">paytweak (paybylinkexternal.aspx)</option>
                        <option value="direct">S2S (direct.aspx)</option>
                        <option value="simplepay">SimplePay (simplepay.aspx)</option>
                    </select>
                </p>
                <hr style="opacity: .2; margin: 10px;">
                <h3 style="color: #1e5582; font-weight: 600;">Encrypted parameters:</h3>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">MsgVer=2.0:</strong>
                    <input type="checkbox" v-model="isMsgVer2">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; font-size: 12px; user-select: none;">Encryption
                        password <strong title="Received from Computop" class="qm-tooltip">?</strong></strong>
                    <input type="text" class="simple-input" v-model="secret_test" placeholder="mandatory">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; user-select: none;">HMAC password:</strong>
                    <input type="text" placeholder="optional" class="simple-input" v-model="hmac_password">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; user-select: none;">Merchant ID:</strong>
                    <input type="text" class="simple-input" v-model="merchantid" placeholder="mandatory">
                </p>
                <p style="margin: 2px; display: flex;">
                    <strong style="display: inline-block; width: 150px;">Transaction ID:</strong>
                    <input type="text" class="simple-input narrow" v-model="transid">
                    <button @click="generate_transid" class="generate-button">Generate TransID</button>
                </p>
                <p style="margin: 2px; display: flex;">
                    <strong style="display: inline-block; width: 150px;">RefNr:</strong>
                    <input type="text" class="simple-input" v-model="refnr">
                </p>
                <p style="margin: 2px; display: flex;">
                    <strong style="display: inline-block; width: 150px;">Channel:</strong>
                    <input type="text" class="simple-input" v-model="channel">
                </p>
                <p style="margin: 2px; display: flex;">
                    <strong style="display: inline-block; width: 150px;">Customer ID:</strong>
                    <input type="text" class="simple-input" v-model="customerid">
                </p>
                <p style="margin: 2px; display: flex;">
                    <strong style="display: inline-block; width: 150px;">Amount:</strong>
                    <input type="text" class="simple-input" v-model="amount" placeholder="mandatory">
                </p>
                <p style="margin: 0;">
                    <strong style="display: inline-block; width: 150px;">Currency:</strong>
                    <input type="text" class="simple-input" v-model="currency" placeholder="mandatory">
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
                    <strong style="display: inline-block; width: 150px;">URLBack:</strong>
                    <input type="text" class="simple-input" v-model="urlnotify">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">URLNotify:</strong>
                    <input type="text" class="simple-input" v-model="urlback">
                </p>
                <p v-if="paytype === 'paytweak'" style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; font-size: 13px;">Service (Paytweak) <strong
                            title="Values: link|email|sms" class="qm-tooltip">?</strong></strong>
                    <input type="text" class="simple-input" v-model="paytweak_service">
                </p>
                <p v-if="paytype === 'paybylink'" style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; font-size: 13px;">PBL expiration date:</strong>
                    <input type="text" class="simple-input" v-model="paybylinkexpiration"
                        placeholder="YYYY-MM-DD HH:MM:SS">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Email:</strong>
                    <input type="text" class="simple-input" v-model="email">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Preauth:</strong>
                    <input type="checkbox" v-model="preauth_flag" disabled> <!-- disabled for now -->
                </p>
                <div style="margin: 2px;">
                    <div>
                        <strong style="display: inline-block; width: 150px;">OrderDesc:</strong>
                        <input type="text" class="simple-input" v-model="orderdesc">
                    </div>
                    <div class="order-desc-buttons">
                        <button class="order-desc-button" @click="this.orderdesc = 'test:0000'"
                            title="Use this for simulating successful payment">test:0000</button>
                        <button class="order-desc-button" @click="this.orderdesc = 'test:0305'">test:0305</button>
                    </div>
                </div>
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
                        <strong style="display: inline-block; width: 150px; font-size: 14px;">credentialOnFile:</strong>
                        <input type="checkbox" v-model="isCredentialOnFile">
                    </div>
                    <div><textarea class="custom-height" v-if="isCredentialOnFile" name="cof" id="cof"
                            v-model="credentialOnFile"></textarea>
                    </div>
                    <div v-if="isCredentialOnFile" class="cof-buttons">
                        <button class="cof-button">MIT</button>
                        <button class="cof-button">CIT</button>
                    </div>
                </div>
                <div style="margin: 2px; display: flex; flex-direction: column;">
                    <div>
                        <strong style="display: inline-block; width: 150px;">billToCustomer:</strong>
                        <input type="checkbox" v-model="isBillToCustomer">
                    </div>
                    <div><textarea style="height: 150px;" v-if="isBillToCustomer" name="billToCustomer"
                            id="billToCustomer" v-model="billToCustomer"></textarea>
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
                <div style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px; font-size: 13px;">Other parameters <strong
                            title="Use this field to manually add payment specific parameters. Example: key1=value1&key2=value2. It will automatically be parsed and included in the request. Or click on Show all parameters button to add parameters on a click."
                            class="qm-tooltip">?</strong></strong>
                    <input type="text" class="simple-input" v-model="otherparams" placeholder="">
                    <div style="display: flex; margin-top: 4px; justify-content: center;">
                        <button class="show-all-button" @click="isParametersModal = true">Show all parameters</button>
                        <button class="show-all-button" @click="this.otherparams = ''">Clear field</button>
                    </div>
                </div>
                <hr style="opacity: .2; margin: 10px;">
                <h3 style="color: #1e5582; font-weight: 600;">Unencrypted parameters:</h3>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Template:</strong>
                    <input type="text" class="simple-input" v-model="template">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">CCTemplate:</strong>
                    <input type="text" class="simple-input" v-model="cctemplate">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Pay Types:</strong>
                    <input type="text" class="simple-input" v-model="hpppaytypes">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">Language:</strong>
                    <input type="text" class="simple-input" v-model="language">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">CustomField1:</strong>
                    <input type="text" class="simple-input" v-model="customfield1">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">CustomField2:</strong>
                    <input type="text" class="simple-input" v-model="customfield2">
                </p>
                <p style="margin: 2px;">
                    <strong style="display: inline-block; width: 150px;">CustomField4:</strong>
                    <input type="text" class="simple-input" v-model="customfield4">
                </p>
                <div style="margin: 2px;">
                    <div class="only-text-align">
                        <button v-if="this.merchantid.length !== 0 && this.secret_test.length !== 0"
                            @click="encryptData(plaintext)" class="simple-button">Encrypt</button>
                        <button v-else class="simple-button-disabled">Encrypt</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="wrapper narrower">
            <p style="margin: 2px;">
                <strong style="display: inline-block; width: 150px;">Plain text:</strong>
                <textarea readonly name="" id="">{{ plaintext }}</textarea>
            </p>
            <p style="margin: 2px;">
                <strong style="display: inline-block; width: 150px;">Len:</strong>
                <span>{{ len }}</span>
            </p>
            <p style="margin: 2px;">
                <strong style="display: inline-block; width: 150px;">Encrypted data:</strong>
                <textarea v-if="encrypted_data" name="" id="">{{ encrypted_data }}</textarea>
            </p>
        </div>
        <div style="margin: 0;">
            <div class="wrapper wider">
                <h3 style="color: #1e5582; font-weight: 600;">Payment call (click on the button below to open in a new
                    tab)</h3>
                <div style="margin: 2px; display: flex; flex-direction: column;">
                    <strong style="display: inline-block; width: 150px;">{{ this.paytype }}:</strong>
                    <div style="display: flex; align-items: center;">
                        <span class="redirect-url">{{ testurl_ohne_data }}</span>
                        <a class="payment-url-button" v-if="isDataEncrypted" :href=testurl target="_blank">Call {{
                            this.paytype }}</a>
                    </div>
                    <div style="align-items: center; display: flex;" v-if="isDataEncrypted">
                        <canvas ref="qrcodeCanvas"></canvas>
                        <button class="simpler-button" @click="generateQR()" v-if="!this.isQRCodeGenerated">Generate QR code</button>
                    </div>
                </div>
            </div>
            <div v-if="isDataEncrypted" class="wrapper wider">
                <h3 style="color: #1e5582; font-weight: 600;">Embedded in iframe:</h3>
                <iframe :src="testurl" width="750" height="650" ref="paymentIframe" @load="onIframeLoad"></iframe>
            </div>
        </div>
    </div>
    <LoginModal />
    <ParametersModal v-show="isParametersModal" @close="isParametersModal = false"
        @setparameter="handleReceivedParameter" />
</template>

<script>
import CryptoJS from "crypto-js";
import axios from 'axios'
import Navbar from '@/components/Navbar.vue'
import LoginModal from "@/components/LoginModal.vue";
import Header from "@/components/Header.vue";
import ParametersModal from "@/components/ParametersModal.vue";
import QRCode from "qrcode";
export default {
    data() {
        return {
            merchantid: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_MERCHANTID : '',
            transid: '',
            refnr: '',
            amount: '1000',
            currency: 'EUR',
            orderdesc: 'test:payment',
            urlsuccess: 'http://127.0.0.1:3005/success',
            urlfailure: 'http://127.0.0.1:3005/failure',
            urlnotify: 'http://127.0.0.1:3005/urlnotify',
            urlback: 'http://127.0.0.1:3005/back',
            email: import.meta.env.VITE_ENVIRONMENT === 'development' ? 'nebojsa.pesic@computop.com' : '',
            secret_test: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_SECRET : '',
            encrypted_data: '',
            plain_text: '',
            len: 0,
            paytype: 'paymentpage',
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
            template: '',
            cctemplate: '',
            hpppaytypes: '',
            isBillToCustomer: false,
            billToCustomer: '{"consumer":{"salutation":"Mr","firstName":"John","lastName":"Doe"},"phone":{"countryCode":"49","subscriberNumber":"12345678910"},"mobilePhone":{"countryCode":"49","subscriberNumber":"12345678910"}}',
            customfield1: '',
            customfield2: '',
            customfield4: '',
            channel: '',
            customerid: '',
            language: '',
            otherparams: '',
            paybylinkexpiration: '2099-12-31 23:59:59',
            articlelist: '{"order_lines":[{"name":"Advanced Care","quantity":1,"quantity_unit":"STK","reference":"1452906","tax_rate":1900,"total_amount":500,"type":"physical","unit_price":500}]}',
            isParametersModal: false,
            receivedParameter: null,
            isQRCodeGenerated: false,
        }
    },
    components: {
        Header,
        Navbar,
        LoginModal,
        ParametersModal
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
                "URLBack": this.urlback,
                "email": this.email,
                "OrderDesc": this.orderdesc,
            };

            if (this.isMsgVer2) {
                params.MsgVer = "2.0";
            }

            if (this.paytype === 'paytweak') {
                params.Service = this.paytweak_service;
            }

            if (this.paytype === 'mandate') {
                //
            }

            if (this.paytype === 'paybylink') {
                params.ExpirationDate = this.paybylinkexpiration;
            }

            if (this.paytype === 'floapay') {
                Object.assign(params, {
                    Homepage: 'https://localhost:3005/homepage',
                    CustomerID: this.customerid,
                    LastName: 'User',
                    FirstName: 'Test',
                    AddrCountryCode: '276',
                    Date: '2025/01/01',
                    NumberArticles: '2',
                });
            }

            if (this.paytype === 'klarnapayments') {
                Object.assign(params, {
                    ArticleList: btoa(this.articlelist),
                    TaxAmount: '100',
                    URLConfirm: 'https://localhost:3005/confirm',
                    bdCountryCode: 'DE',
                    Account: '1',
                });
            }

            if (this.preauth_flag) {
                params.TxType = 'preauth';
            }

            if (this.channel.length > 0) {
                params.Channel = this.channel;
            }

            if (this.refnr.length > 0) {
                params.RefNr = this.refnr;
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

            if (this.isBillToCustomer) {
                params.billToCustomer = btoa(this.billToCustomer);
            }

            if (this.hmac_password.length > 0) {
                params.MAC = this.generateHMAC(this.hmac_data, this.hmac_password)
            }

            this.otherparamsarray.forEach(element => {
                let [key, value] = element.split('=');
                if (key) params[key] = value;
            });

            // Convert the object to a query string format
            this.plain_text = Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join("&") + "&";  // Adds the trailing '&'

            this.len = this.plain_text.slice(0, -1).length;
            return this.plain_text.slice(0, -1);
        },
        otherparamsarray() {
            return this.otherparams ? this.otherparams.split('&') : [];
        },
        frontend() {
            if (this.paytype === 'paymentpage') {
                this.isMsgVer2 = true
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'paymentpage'
            } else if (this.paytype === 'payssl') {
                this.isMsgVer2 = true
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'payssl'
            } else if (this.paytype === 'paytweak') {
                this.isMsgVer2 = true
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'paybylinkexternal'
            } else if (this.paytype === 'mandateform') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'mandateform'
            } else if (this.paytype === 'direct') {
                this.isMsgVer2 = true
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'direct'
            } else if (this.paytype === 'instanea') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'instanea'
            } else if (this.paytype === 'paybylink') {
                this.isMsgVer2 = true
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'paybylink'
            } else if (this.paytype === 'simplepay') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'simplepay'
            } else if (this.paytype === 'klarnapayments') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'klarnapayments'
            }
            else if (this.paytype === 'floapay') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'floapay'
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
            let base_url = `https://test.computop-paygate.com/${this.frontend}.aspx?MerchantID=${this.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`
            if (this.template.length > 0) {
                base_url = base_url + `&Template=${this.template}`
            }
            if (this.cctemplate.length > 0) {
                base_url = base_url + `&CCTemplate=${this.cctemplate}`
            }
            if (this.hpppaytypes.length > 0) {
                base_url = base_url + `&PayTypes=${this.hpppaytypes}`

            }
            if (this.language.length > 0) {
                base_url = base_url + `&Language=${this.language}`

            }
            if (this.customfield1.length > 0) {
                base_url = base_url + `&CustomField1=${this.customfield1}`

            }
            if (this.customfield2.length > 0) {
                base_url = base_url + `&CustomField2=${this.customfield2}`

            }
            return base_url
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
            this.isQRCodeGenerated = false
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
        generateQR() {
            QRCode.toCanvas(this.$refs.qrcodeCanvas, `https://test.computop-paygate.com/${this.paytype}.aspx?MerchantId=${this.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`, {
                width: 200
            });
            this.isQRCodeGenerated = true
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
        handleReceivedParameter(value) {
            if (this.otherparams.length === 0) {
                this.otherparams += value + '='
            } else {
                this.otherparams += '&' + value + '='
            }

        }
    },
    mounted() {
        this.generate_transid()
        console.log(import.meta.env.MODE)
    },
    watch: {
        paytype() {
            if (this.paytype === 'simplepay') {
                this.currency = 'HUF'
            }
        },
        customerid() {
            if (this.customerid.length > 0 && this.paytype === 'floapay') {
                this.inputClass = 'simple-input'
            } else if (this.customerid.length === 0 && this.paytype === 'floapay') {
                this.inputClass = 'simple-input-mandatory'
            }
        },
        otherparams(newValue) {
            if (newValue.endsWith('&')) {
                this.otherparams = newValue.slice(0, -1);
            }
            if (newValue.startsWith('&')) {
                this.otherparams = newValue.slice(0);
            }
        }
    }
}
</script>

<style scoped>
.main-wrapper {
    display: flex;
    width: 2000px;
    margin: auto;
    gap: 20px;
    margin-top: 10px;
    position: relative;
}

.wrapper {
    background-color: white;
    margin: auto;
    width: 700px;
    padding: 30px;
    border-radius: 10px;
    margin-top: 0;
    margin-bottom: 20px;
}

.narrower {
    width: 500px;
    margin-left: 0;
}

.wider {
    width: 750px;
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
    outline: none;
}

.simple-input-mandatory {
    padding: 4px;
    border-radius: 5px;
    border: 1px solid;
    border-color: #d4d4d4;
    width: 300px;
    outline: none;
    background-color: #ff857c;
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
    outline: none;
}

.simpler-button {
    border: none;
    background-color: #a5f729;
    border-radius: 5px;
    padding: 5px 15px 5px 15px;
    cursor: pointer;
    font-size: 12px;
    color: #1e5582;
    font-weight: 600;
    outline: none;
}

.simple-button-disabled {
    border: none;
    background-color: #ececec;
    border-radius: 5px;
    padding: 10px 45px 10px 45px;
    cursor: not-allowed;
    font-size: 16px;
    color: white;
    font-weight: 600;
}

.only-text-align {
    text-align: center;
    margin-top: 10px;
}

.narrow {
    width: 190px;
}

.redirect-url {
    width: 700px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 12px;
}

.payment-url-button {
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    color: #1e5582;
    background-color: #a5f729;
    padding: 5px 15px;
    border-radius: 5px;
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

.show-all-button {
    border: none;
    border-radius: 5px;
    background-color: #1e5582;
    color: white;
    margin-left: 5px;
    font-size: 12px;
    cursor: pointer;
    padding: 2px 7px 2px 7px;
}

iframe {
    border: none;
    border-radius: 5px;
}

.cof-button {
    border: none;
    margin-right: 6px;
    background-color: #a5f729;
    padding: 1px 2px;
    border-radius: 3px;
    cursor: pointer;
}

.qm-tooltip {
    display: inline-block;
    background-color: #1e5582;
    color: white;
    border-radius: 50px;
    min-width: 15px;
    min-height: 15px;
    text-align: center;
    cursor: pointer;
}

.order-desc-buttons {
    text-align: center;
}

.order-desc-button {
    border: none;
    margin-right: 6px;
    background-color: #a5f729;
    padding: 1px 2px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}
</style>