<template>
    <div class="main-wrapper">
        <div class="card mx-auto">
            <h3 class="page-title">Paygate Encryption Test Tool</h3>
            <h4 class="warning-text">Data is not stored on any server.</h4>
            <div class="parameters" @keydown.enter="handleEnterKey">
                <AccordionSection title="General" v-model="accordionGeneral">
                    <div class="field-row">
                        <strong class="field-label">Partner:</strong>
                        <select name="partner" id="partner" class="field-select" v-model="auth.partner">
                            <option v-for="p in partners" :key="p.value" :value="p.value">{{ p.label }}</option>
                        </select>
                    </div>
                    <div class="field-row">
                        <strong class="field-label">Environment:</strong>
                        <select name="environment" id="environment" class="field-select" v-model="auth.environment">
                            <option value="dev">DEV</option>
                            <option value="test">TEST</option>
                            <option value="prod">PRODUCTION</option>
                        </select>
                    </div>
                    <p v-if="!isOtherPaymentMethod" class="field-row">
                        <strong class="field-label">Pay type:</strong>
                        <select name="paytype" id="paytype" v-model="paytype" class="field-select"
                            @click="isOtherPaymentMethod = false">
                            <option value="mandateform">EasyCollect (mandateform.aspx)</option>
                            <option value="floapay">Floapay (floapay.aspx)</option>
                            <option value="paymentpage">HPP (paymentpage.aspx)</option>
                            <option value="installment">CB2A Installments (installment.aspx)</option>
                            <option value="instanea">Instanea (instanea.aspx)</option>
                            <option value="klarnapayments">KlarnaPM (klarnapayments.aspx)</option>
                            <option value="payssl">payssl (payssl.aspx)</option>
                            <option value="paybylink">paybylink (paybylink.aspx)</option>
                            <option value="paytweak">paytweak (paybylinkexternal.aspx)</option>
                            <option value="direct">S2S (direct.aspx)</option>
                            <option value="simplepay">SimplePay (simplepay.aspx)</option>
                            <option value="twintpp">TWINT via PPRO (twintpp.aspx)</option>
                            <option value="---" disabled>----------------</option>
                            <option value="credit">Refund (credit.aspx)</option>
                            <option value="increment">Increment (increment.aspx)</option>
                        </select>
                    </p>
                    <div class="field-row">
                        <strong class="field-label">Other pay type <strong
                                title="Use this if payment method not listed in above dropdown"
                                class="qm-tooltip">?</strong></strong>
                        <input type="checkbox" v-model="isOtherPaymentMethod">
                        <div v-if="isOtherPaymentMethod" class="other-wrapper">
                            <input class="field-input w-68.75" type="text" v-model="otherpaymentmethod"
                                placeholder="example (example.aspx)">
                            <div class="flex gap-1.5 mt-1.5">
                                <button class="btn-chip" @click="otherpaymentmethod = 'reverse'">reverse.aspx</button>
                                <button class="btn-chip" @click="otherpaymentmethod = 'credit'">credit.aspx</button>
                            </div>
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Encrypted parameters" v-model="accordionEncrypted">
                    <p class="field-row">
                        <strong class="field-label">MsgVer=2.0 <strong
                                title="This parameter is required to indicate that your implementation supports 3-D Secure processing"
                                class="qm-tooltip">?</strong></strong>
                        <input type="checkbox" v-model="isMsgVer2">
                    </p>
                    <div class="field-row">
                        <strong class="field-label">Encryption
                            password <strong title="Received from Computop" class="qm-tooltip">?</strong></strong>
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <input type="text" class="field-input" v-model="this.auth.bf_password"
                                placeholder="(mandatory)">
                            <button class="btn-secondary" @click="this.auth.bf_password = 'AaAaAaAaAaAaAaAa'">AaAaAaAaAaAaAaAa</button>
                        </div>
                    </div>
                    <p class="field-row">
                        <strong class="field-label">HMAC password:</strong>
                        <input type="text" placeholder="(optional)" class="field-input" v-model="hmac_password">
                    </p>
                    <div class="mb-1.5">
                        <p class="field-row">
                            <strong class="field-label">Merchant ID:</strong>
                            <input type="text" class="field-input" v-model="this.auth.merchantid"
                                placeholder="(mandatory)">
                        </p>
                        <div class="order-desc-buttons">
                            <button type="button" class="btn-chip" @click="this.auth.merchantid = 'npesic_test'">npesic_test</button>
                        </div>
                    </div>
                    <ParamInputRow label="Transaction ID" v-model="transid" v-model:includeValue="includeTransID"
                        input-class="field-input narrow">
                        <button @click="generate_transid" class="btn-secondary custom-padding">Generate
                            TransID</button>
                    </ParamInputRow>
                    <ParamInputRow label="RefNr" v-model="refnr" v-model:includeValue="includeRefNr" />
                    <ParamInputRow label="Channel" v-model="channel" v-model:includeValue="includeChannel" />
                    <ParamInputRow label="Customer ID" v-model="customerid" v-model:includeValue="includeCustomerID" />
                    <ParamInputRow label="Amount" v-model="amount" v-model:includeValue="includeAmount"
                        placeholder="(mandatory)" />
                    <ParamInputRow label="Currency" v-model="currency" v-model:includeValue="includeCurrency"
                        placeholder="(mandatory)" />
                    <ParamInputRow label="URLSuccess" v-model="urlsuccess" v-model:includeValue="includeURLSuccess" />
                    <ParamInputRow label="URLFailure" v-model="urlfailure" v-model:includeValue="includeURLFailure" />
                    <ParamInputRow label="URLNotify" v-model="urlnotify" v-model:includeValue="includeURLNotify" />
                    <ParamInputRow label="URLBack" v-model="urlback" v-model:includeValue="includeURLBack" />
                    <div class="flex gap-2 mb-1.5 mt-1.5">
                        <strong class="field-label">ArticleList:</strong>
                        <div class="field-row mb-0!">
                            <input type="text" class="field-input" v-model="articlelist" :disabled="!isArticleList">
                            <input type="checkbox" v-model="isArticleList">
                        </div>
                    </div>
                    <div class="flex gap-2 mb-1.5">
                        <strong class="field-label">OrderItem:</strong>
                        <div class="flex gap-1.5">
                            <input type="text" class="field-input" v-model="orderitem" :disabled="!isOrderItem">
                            <input type="checkbox" v-model="isOrderItem">
                        </div>
                    </div>
                    <p v-if="paytype === 'paytweak'" class="field-row">
                        <strong class="field-label">Service (Paytweak) <strong title="Values: link|email|sms"
                                class="qm-tooltip">?</strong></strong>
                        <input type="text" class="field-input" v-model="paytweak_service" :disabled="!includePaytweakService">
                        <input type="checkbox" v-model="includePaytweakService">
                    </p>
                    <p v-if="paytype === 'paytweak'" class="field-row">
                        <strong class="field-label">Reminder email</strong>
                        <input type="text" class="field-input" v-model="paytweak_reminder_email" :disabled="!includePaytweakReminderEmail">
                        <input type="checkbox" v-model="includePaytweakReminderEmail">
                    </p>
                    <p v-if="paytype === 'paybylink'" class="field-row">
                        <strong class="field-label">PBL expiration date:</strong>
                        <input type="text" class="field-input" v-model="paybylinkexpiration"
                            placeholder="YYYY-MM-DD HH:MM:SS" :disabled="!includeExpirationDate">
                        <input type="checkbox" v-model="includeExpirationDate">
                    </p>
                    <div class="mb-1.5">
                        <ParamInputRow label="Email" v-model="email" v-model:includeValue="includeEmail" />
                        <div class="order-desc-buttons only-margin">
                            <button class="btn-chip" @click="this.email = this.email + '@computop.com'"
                                title="Use this for simulating successful payment">@computop.com</button>
                            <button class="btn-chip"
                                @click="this.email = this.email + '@gmail.com'">@gmail.com</button>
                        </div>
                    </div>
                    <div class="mb-1.5">
                        <ParamInputRow label="OrderDesc" v-model="orderdesc" v-model:includeValue="includeOrderDesc" />
                        <div class="order-desc-buttons">
                            <button class="btn-chip" @click="this.orderdesc = 'test:0000'"
                                title="Use this for simulating successful payment">test:0000</button>
                            <button class="btn-chip" @click="this.orderdesc = 'test:0305'">test:0305</button>
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Advanced / 3DS &amp; tokens" v-model="accordionAdvanced">
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">Card:</strong>
                            <input type="checkbox" v-model="isCard">
                        </div>
                        <div><textarea class="custom-height field-textarea" v-if="isCard" :rows="rows(card)" name="card" id="card"
                                v-model="card"></textarea></div>
                    </div>
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">credentialOnFile:</strong>
                            <input type="checkbox" v-model="isCredentialOnFile">
                        </div>
                        <div><textarea class="custom-height field-textarea" v-if="isCredentialOnFile" name="cof" id="cof"
                                v-model="credentialOnFile" :rows="rows(credentialOnFile)"></textarea>
                        </div>
                        <div v-if="isCredentialOnFile" class="cof-buttons">
                            <button class="btn-chip" @click="setCit">CIT</button>
                            <button class="btn-chip" @click="setCitC">CIT (RTF=C)</button>
                            <button class="btn-chip" @click="setMitE">MIT (RTF=E)</button>
                            <button class="btn-chip" @click="setMitM">MIT (RTF=M)</button>
                            <button class="btn-chip" @click="setInstallments">Installments (RTF=I)</button>
                            <button class="btn-chip" @click="setInstallmentsR">Installments (RTF=R)</button>
                            <button class="btn-chip" @click="setRecurring">Recurring (RTF=I)</button>
                            <button class="btn-chip" @click="setRecurringR">Recurring (RTF=R)</button>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">billToCustomer:</strong>
                            <input type="checkbox" v-model="isBillToCustomer">
                        </div>
                        <div><textarea class="h-37.5 field-textarea" v-if="isBillToCustomer" name="billToCustomer"
                                id="billToCustomer" v-model="billToCustomer" :rows="rows(billToCustomer)"></textarea>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">billingAddress:</strong>
                            <input type="checkbox" v-model="isBillingAddress">
                        </div>
                        <div><textarea class="h-37.5 field-textarea" v-if="isBillingAddress" name="billToCustomer"
                                id="billToCustomer" v-model="billingAddress" :rows="rows(billingAddress)"></textarea>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">threeDsData:</strong>
                            <input type="checkbox" v-model="isThreeDsData">
                        </div>
                        <div v-if="isThreeDsData"><textarea class="custom-height field-textarea" name="threeDsData" id="threeDsData"
                                v-model="threeDsData"></textarea>
                            <div class="field-row">
                                <button class="btn-chip" @click="seEci07()">ECI=07/04</button>
                                <button class="btn-chip" @click="seEci05()">ECI=05/02</button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">threeDsPolicy:</strong>
                            <input type="checkbox" v-model="isThreeDsPolicy">
                        </div>
                        <div><textarea class="custom-height field-textarea" v-if="isThreeDsPolicy" name="threeDsData" id="threeDsData"
                                v-model="threeDsPolicy"></textarea>
                            <div v-if="isThreeDsPolicy">
                                <button class="btn-chip" @click="setSkipThreeDs">Skip 3DS</button>
                                <button class="btn-chip" @click="mandateChallenge">Mandate challenge</button>
                                <button class="btn-chip" @click="tra">TRA</button>
                                <button class="btn-chip" @click="lowvalue">Low Value</button>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5 mb-1.5">
                        <div class="field-row">
                            <strong class="field-label">browserInfo:</strong>
                            <input type="checkbox" v-model="isBrowserInfo">
                        </div>
                        <div><textarea class="custom-height field-textarea" v-if="isBrowserInfo" name="browserIno" id="browserInfo"
                                v-model="browserInfo"></textarea>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <div class="field-row">
                            <strong class="field-label">tokenData:</strong>
                            <input type="checkbox" v-model="isTokenData">
                        </div>
                        <div><textarea class="custom-height field-textarea" v-if="isTokenData" name="tokenData" id="tokenData"
                                v-model="tokenData"></textarea>
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Other parameters" v-model="accordionOther">
                    <div class="flex items-center gap-2">
                        <strong class="field-label w-auto! text-left!">Manual entry <strong
                                title="Use this field to manually add payment specific parameters. Example: key1=value1&key2=value2. It will automatically be parsed and included in the request. Or click on Show all parameters button to add parameters on a click."
                                class="qm-tooltip">?</strong></strong>
                        <input type="checkbox" v-model="isOtherParameters">
                    </div>
                    <div v-if="isOtherParameters" class="mt-1.5">
                        <textarea class="only-height field-textarea" type="text" v-model="otherparams"
                            :rows="this.otherparams.length / 75" placeholder=""></textarea>
                        <div class="flex gap-2 mt-1.5 justify-center">
                            <button class="btn-secondary" @click="isParametersModal = true">Show all
                                parameters</button>
                            <button class="btn-secondary" @click="this.otherparams = ''">Clear field</button>
                        </div>
                    </div>
                </AccordionSection>

                <AccordionSection title="Unencrypted parameters" v-model="showUnencryptedParamsDiv">
                    <div class="mb-1.5">
                        <p class="field-row">
                            <strong class="field-label">Template:</strong>
                            <input type="text" class="field-input" v-model="template">
                        </p>
                        <div class="order-desc-buttons">
                            <button type="button" class="btn-chip" @click="template = 'ct_cards_v2'">ct_cards_v2</button>
                            <button type="button" class="btn-chip" @click="template = 'ct_PaymentPageDropDown_v1'">ct_PaymentPageDropDown_v1</button>
                        </div>
                    </div>
                    <p class="field-row">
                        <strong class="field-label">CCTemplate:</strong>
                        <input type="text" class="field-input" v-model="cctemplate">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">Pay Types:</strong>
                        <input type="text" class="field-input" v-model="hpppaytypes">
                    </p>
                    <div class="mb-1.5">
                        <p class="field-row">
                            <strong class="field-label">Language:</strong>
                            <input type="text" class="field-input" v-model="language">
                        </p>
                        <div class="order-desc-buttons">
                            <button type="button" class="btn-chip" v-for="lang in ['en', 'de', 'fr', 'it', 'es']" :key="lang"
                                @click="language = lang">{{ lang }}</button>
                        </div>
                    </div>
                    <div class="mb-1.5">
                        <p class="field-row">
                            <strong class="field-label">CustomField1:</strong>
                            <input type="text" class="field-input" v-model="customfield1">
                        </p>
                        <div class="order-desc-buttons">
                            <button type="button" class="btn-chip" @click="customfield1 = '1.00 EUR'">1.00 EUR</button>
                        </div>
                    </div>
                    <p class="field-row">
                        <strong class="field-label">CustomField2:</strong>
                        <input type="text" class="field-input" v-model="customfield2">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">CustomField3:</strong>
                        <input type="text" class="field-input" v-model="customfield3">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">CustomField4:</strong>
                        <input type="text" class="field-input" v-model="customfield4">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">CustomField5:</strong>
                        <input type="text" class="field-input" v-model="customfield5">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">CustomField6:</strong>
                        <input type="text" class="field-input" v-model="customfield6">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">CustomField7:</strong>
                        <input type="text" class="field-input" v-model="customfield7">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">CustomField8:</strong>
                        <input type="text" class="field-input" v-model="customfield8">
                    </p>
                </AccordionSection>

                <AccordionSection title="Result" v-model="accordionResult">
                    <p class="field-row">
                        <strong class="field-label">Plain text:</strong>
                        <textarea readonly name="" id="" class="field-textarea" :rows="rows(plaintext)">{{ plaintext }}</textarea>
                        <button type="button" class="btn-secondary" @click="copyText(plaintext, 'plaintext')">{{ copiedField === 'plaintext' ? 'Copied!' : 'Copy' }}</button>
                    </p>
                    <p class="field-row">
                        <strong class="field-label">Len:</strong>
                        <span>{{ len }}</span>
                    </p>
                    <p class="field-row" v-if="encrypted_data">
                        <strong class="field-label">Encrypted data:</strong>
                        <textarea name="" id="" class="field-textarea"
                            :rows="rows(encrypted_data)">{{ encrypted_data }}</textarea>
                        <button type="button" class="btn-secondary" @click="copyText(encrypted_data, 'encrypted')">{{ copiedField === 'encrypted' ? 'Copied!' : 'Copy' }}</button>
                    </p>
                    <div>
                        <h4 class="section-title">Payment request (click to open in a new tab)</h4>
                        <div class="flex flex-col gap-2 mb-1.5">
                            <strong>{{ this.paytype }}:</strong>
                            <div class="flex flex-col gap-2">
                                <p class="redirect-url">{{ testurl_ohne_data }}</p>
                                <div class="flex items-center gap-1.5" v-if="isDataEncrypted">
                                    <a class="payment-url-button" :href=testurl
                                        target="_blank"><span>Call</span> {{
                                            this.paytype }}</a>
                                    <button type="button" class="btn-secondary" @click="copyText(testurl, 'url')">{{ copiedField === 'url' ? 'Copied!' : 'Copy URL' }}</button>
                                </div>
                            </div>
                            <div class="field-row" v-if="isDataEncrypted">
                                <canvas ref="qrcodeCanvas"></canvas>
                                <p v-if="!this.isQRCodeGenerated" class="flex muted-text text-xs">Or
                                    generate QR code with payment URL:</p>
                                <button class="simpler-button" @click="generateQR()" v-if="!this.isQRCodeGenerated">Generate
                                    QR
                                    code</button>
                            </div>
                        </div>
                    </div>
                </AccordionSection>
            </div>
        </div>
    </div>

    <div class="action-bar">
        <div class="action-bar-inner">
            <div>
                <button @click="encryptData(plaintext)" class="btn-primary" :disabled="!canEncrypt">Encrypt</button>
                <p v-if="!canEncrypt" class="validation-error">{{ encryptDisabledReason }}</p>
            </div>
            <a class="payment-url-button" v-if="isDataEncrypted" :href="testurl" target="_blank">
                <span>Open</span> {{ this.paytype }}
            </a>
        </div>
    </div>

    <!-- <LoginModal /> -->
    <ParametersModal v-show="isParametersModal" @close="isParametersModal = false" ref="menu"
        @setparameter="handleReceivedParameter" />
    <FloatingParamsPanel title="Request parameters" :params="plaintextParams" :payment-url="testurl"
        :show-payment-url="isDataEncrypted" :copied="copiedField === 'url'" @copy-url="copyText(testurl, 'url')" />
</template>

<script>
import CryptoJS from "crypto-js";
import Navbar from '@/components/Navbar.vue'
// import LoginModal from "@/components/LoginModal.vue";
import Header from "@/components/Header.vue";
import ParametersModal from "@/components/ParametersModal.vue";
import ParamInputRow from "@/components/ParamInputRow.vue";
import AccordionSection from "@/components/AccordionSection.vue";
import FloatingParamsPanel from "@/components/FloatingParamsPanel.vue";
import useAuthStore from '@/stores/auth.js'
import QRCode from "qrcode";
import { PARTNERS, getBaseUrl } from '@/utils/partners.js'
export default {
    data() {
        return {
            auth: useAuthStore(),
            partners: PARTNERS,
            // merchantid: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_MERCHANTID : '',
            transid: '',
            refnr: '',
            amount: '1000',
            currency: 'EUR',
            orderdesc: 'test:payment',
            urlsuccess: 'https://localhost/urls/success.php',
            urlfailure: 'https://localhost/urls/failure.php',
            urlnotify: 'https://localhost/urls/notify.php',
            urlback: 'https://localhost/urls/back.php',
            email: import.meta.env.VITE_ENVIRONMENT === 'development' ? 'nebojsa.pesic@computop.com' : '',
            // secret_test: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_SECRET : '',
            encrypted_data: '',
            paytype: 'paymentpage',
            paytweak_service: 'link',
            paytweak_reminder_email: '{"ResendAfterDays":"1","MaxAttempts":"1"}',
            isCard: false,
            card: '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"4111111111111111","brand":"VISA"}',
            isMsgVer2: true,
            isDataEncrypted: false,
            isCredentialOnFile: false,
            isThreeDsData: false,
            // threeDsData: '{"challengeRequestInd":"04"}',
            threeDsData: '{"acsProtocolVersion":"2.2.0","authenticationValue":"kAMACEJBakKSOSzNLnxNiZeBQnf+","eci":"02","threeDSServerTransID":"a3dd2b66-6c06-423b-acd4-1cc19697a08f","dsTransID":"9e0e91c0-24e3-423c-a136-97023269d580","intermediateStatus":"Y","finalStatus":"Y"}',
            credentialOnFile: '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2025-09-14","recurringExpiryDate":"2025-09-14"}},"initialPayment":true}',
            hmac_password: '',
            template: '',
            cctemplate: '',
            hpppaytypes: '',
            isBillToCustomer: false,
            billToCustomer: '{"consumer":{"salutation":"Mr","firstName":"John","lastName":"Doe"},"phone":{"countryCode":"49","subscriberNumber":"12345678910"},"mobilePhone":{"countryCode":"49","subscriberNumber":"12345678910"}}',
            customfield1: '',
            customfield2: '',
            customfield3: '',
            customfield4: '',
            customfield5: '',
            customfield6: '',
            customfield7: '',
            customfield8: '',
            channel: '',
            customerid: '',
            language: '',
            otherparams: '',
            paybylinkexpiration: '2099-12-31 23:59:59',
            articlelist: '{"order_lines":[{"name":"Advanced Care","quantity":1,"quantity_unit":"STK","reference":"1452906","tax_rate":1900,"total_amount":500,"type":"physical","unit_price":500}]}',
            orderitem: '{"items":[{"name":"Advanced Care","quantity":1,"quantity_unit":"STK","reference":"1452906","tax_rate":1900,"total_amount":500,"type":"physical","unit_price":500}]}',
            isParametersModal: false,
            isQRCodeGenerated: false,
            isOtherParameters: false,
            isOtherPaymentMethod: false,
            otherpaymentmethod: '',
            browserInfo: '{"timeZoneOffset":"120","acceptHeaders":"text","ipAddress":"93.176.166.240","javaEnabled":false,"javaScriptEnabled":true,"language":"US","colorDepth":32,"screenWidth":1060,"screenHeight":1050,"userAgent":"Mozilla/5.0"}',
            isBrowserInfo: false,
            isThreeDsPolicy: false,
            isTokenData: false,
            threeDsPolicy: '{"skipThreeDS":"thisTransaction","threeDSExemption":{"exemptionReason":"transactionRiskAnalysis"},"challengePreference":"noPreference"}',
            billingAddress: '{"city":"Cacakongma","country":{"countryA3":"SRB","countryA2":"SR"},"postalCode":"80331","addressLine1":{"street":"test street","streetNumber":"10"}}',
            isBillingAddress: false,
            tokenData: '{"eci":"07","tokenCryptogram":"AgAAAAAAAIR8CQrXcIhbQAAAAAA=","tokenRequestorID":"40000000082","tokenRequestor":"schemetokenization"}',
            isArticleList: false,
            isOrderItem: false,
            includeTransID: true,
            includeRefNr: false,
            includeChannel: false,
            includeCustomerID: false,
            includeAmount: true,
            includeCurrency: true,
            includeURLSuccess: true,
            includeURLFailure: true,
            includeURLNotify: true,
            includeURLBack: true,
            includeEmail: true,
            includeOrderDesc: true,
            includePaytweakService: true,
            includePaytweakReminderEmail: true,
            includeExpirationDate: true,
            showUnencryptedParamsDiv: false,
            accordionGeneral: true,
            accordionResult: true,
            accordionEncrypted: true,
            accordionAdvanced: false,
            accordionOther: false,
            copiedField: '',
        }
    },
    components: {
        Header,
        Navbar,
        // LoginModal,
        ParametersModal,
        ParamInputRow,
        AccordionSection,
        FloatingParamsPanel
    },
    computed: {
        hmac_data() {
            return `*${this.transid}*${this.auth.merchantid}*${this.amount}*${this.currency}`
        },
        baseurl() {
            return getBaseUrl(this.auth.partner, this.auth.environment)
        },
        replaceFrontEnd() {
            if (this.isOtherPaymentMethod && this.otherpaymentmethod.length > 0) {
                this.paytype = ''
                return this.otherpaymentmethod
            } else {
                return this.frontend
            }
        },
        plaintext() {
            const params = this.buildParams();
            return Object.entries(params)
                .map(([key, value]) => `${key}=${value}`)
                .join("&");
        },
        len() {
            return this.plaintext.length;
        },
        validationErrors() {
            const errors = [];

            if (!this.auth.merchantid) {
                errors.push('Merchant ID is required.');
            }

            if (!this.auth.bf_password) {
                errors.push('Encryption password is required.');
            }

            if (this.includeTransID && !this.transid) {
                errors.push('Transaction ID is required when included.');
            }

            if (this.includeAmount && !this.amount) {
                errors.push('Amount is required when included.');
            }

            if (this.includeCurrency && !this.currency) {
                errors.push('Currency is required when included.');
            }

            return errors;
        },
        canEncrypt() {
            return this.validationErrors.length === 0;
        },
        encryptDisabledReason() {
            return this.validationErrors[0] || '';
        },
        otherparamsarray() {
            return this.otherparams ? this.otherparams.split('&') : [];
        },
        plaintextParams() {
            return this.plaintext ? this.plaintext.split('&').filter(p => p.length > 0) : [];
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
                this.isOtherParameters = true
                this.otherparams = 'Language=en&externalLanguage=US&bdEmail=nebojsa.pesic@computop.com'
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
                this.isOtherParameters = true
                this.otherparams = 'PayType=CB2A'
                this.isBrowserInfo = true
                this.isThreeDsData = true
                this.isCard = true
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
            else if (this.paytype === 'installment') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'installment'
            }
            else if (this.paytype === 'twintpp') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                return 'twintpp'
            }
            else if (this.paytype === 'credit') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                this.urlsuccess = ''
                this.urlfailure = ''
                this.urlback = ''
                this.urlnotify = ''
                this.isOtherParameters = true
                return 'credit'

            }

            else if (this.paytype === 'increment') {
                this.isMsgVer2 = false
                this.isDataEncrypted = false
                this.encrypted_data = ''
                this.urlsuccess = ''
                this.urlfailure = ''
                this.urlback = ''
                this.urlnotify = ''
                this.isOtherParameters = true
                this.otherparams = 'PayID='
                return 'increment'

            }

            else {
                this.isDataEncrypted = false
                return '...'
            }
        },
        testurl_ohne_data() {
            return `https://${this.baseurl}/${this.replaceFrontEnd}.aspx?MerchantID=${this.auth.merchantid}&Len=${this.len}&Data=[EncryptedData]`
        },
        testurl() {
            let base_url = `https://${this.baseurl}/${this.replaceFrontEnd}.aspx?MerchantID=${this.auth.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`
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
            if (this.customfield3.length > 0) {
                base_url = base_url + `&CustomField3=${this.customfield3}`

            }
            if (this.customfield4.length > 0) {
                base_url = base_url + `&CustomField4=${this.customfield4}`

            }
            if (this.customfield5.length > 0) {
                base_url = base_url + `&CustomField5=${this.customfield5}`

            }
            return base_url
        },
    },
    methods: {
        buildParams() {
            const params = {
                MerchantID: this.auth.merchantid,
            };

            if (this.includeTransID) {
                params.TransID = this.transid;
            }

            if (this.includeAmount) {
                params.Amount = this.amount;
            }

            if (this.includeCurrency) {
                params.Currency = this.currency;
            }

            if (this.includeURLSuccess) {
                params.URLSuccess = this.urlsuccess;
            }

            if (this.includeURLFailure) {
                params.URLFailure = this.urlfailure;
            }

            if (this.includeURLNotify) {
                params.URLNotify = this.urlnotify;
            }

            if (this.includeURLBack) {
                params.URLBack = this.urlback;
            }

            if (this.includeEmail) {
                params.email = this.email;
            }

            if (this.includeOrderDesc) {
                params.OrderDesc = this.orderdesc;
            }

            if (this.isOrderItem) {
                params.OrderItem = btoa(this.orderitem);
            }

            if (this.isArticleList) {
                params.ArticleList = btoa(this.articlelist);
            }

            if (this.isMsgVer2) {
                params.MsgVer = "2.0";
            }

            if (this.paytype === 'paytweak') {
                if (this.includePaytweakService) {
                    params.Service = this.paytweak_service;
                }
                if (this.includePaytweakReminderEmail) {
                    params.reminderEmail = btoa(this.paytweak_reminder_email);
                }
                delete params.URLSuccess;
                delete params.URLFailure;
                delete params.URLBack;
                delete params.URLNotify;
            }

            if (this.paytype === 'direct') {
                delete params.URLSuccess;
                delete params.URLFailure;
                delete params.URLBack;
            }

            if (this.paytype === 'paybylink' && this.includeExpirationDate) {
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

            if (this.paytype === 'twintpp') {
                Object.assign(params, {
                    AccOwner: 'Nebojsa Pesic'
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

            if (this.otherpaymentmethod === 'reverse') {
                delete params.URLSuccess;
                delete params.URLFailure;
                delete params.URLBack;
                delete params.URLNotify;
                delete params.ArticleList;
                delete params.OrderDesc;
                delete params.MsgVer;
                delete params.email;
            }

            if (this.includeChannel && this.channel.length > 0) {
                params.Channel = this.channel;
            }

            if (this.includeCustomerID && this.customerid.length > 0) {
                params.CustomerID = this.customerid;
            }

            if (this.includeRefNr && this.refnr.length > 0) {
                params.RefNr = this.refnr;
            }

            if (this.isCard) {
                params.card = btoa(this.card);
            }

            if (this.isBillingAddress) {
                params.billingAddress = btoa(this.billingAddress);
            }

            if (this.isCredentialOnFile) {
                params.credentialOnFile = btoa(this.credentialOnFile);
            }

            if (this.isThreeDsData) {
                params.threeDsData = btoa(this.threeDsData);
            }

            if (this.isThreeDsPolicy) {
                params.threeDsPolicy = btoa(this.threeDsPolicy);
            }

            if (this.isBrowserInfo) {
                params.browserInfo = btoa(this.browserInfo);
            }

            if (this.isTokenData) {
                params.tokenData = btoa(this.tokenData);
            }

            if (this.isBillToCustomer) {
                params.billToCustomer = btoa(this.billToCustomer);
            }

            if (this.hmac_password.length > 0) {
                params.MAC = this.generateHMAC(this.hmac_data, this.hmac_password);
            }

            this.otherparamsarray.forEach(element => {
                const idx = element.indexOf('=');
                if (idx !== -1) {
                    const key = element.substring(0, idx);
                    const value = element.substring(idx + 1);
                    params[key] = value;
                }
            });

            return params;
        },
        seEci07() {
            this.threeDsData = ''
            this.threeDsData = '{"acsProtocolVersion":"2.2.0","eci":"07"}'
        },
        seEci05() {
            this.threeDsData = ''
            this.threeDsData = '{"acsProtocolVersion":"2.2.0","authenticationValue":"kAMACEJBakKSOSzNLnxNiZeBQnf+","eci":"02","threeDSServerTransID":"a3dd2b66-6c06-423b-acd4-1cc19697a08f","dsTransID":"9e0e91c0-24e3-423c-a136-97023269d580","intermediateStatus":"Y","finalStatus":"Y"}'
        },
        setCit() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"unscheduled":"CIT"},"initialPayment":true}'
        },
        setCitC() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"unscheduled":"CIT"},"initialPayment":false}'
        },
        setMitE() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"unscheduled":"MIT"},"initialPayment":true}'
        },
        setMitM() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"unscheduled":"MIT"},"initialPayment":false}'
        },
        setInstallments() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"installments":{"total":3,"curIdx":1,"purchaseAmount":10000}},"initialPayment":true}'
        },
        setInstallmentsR() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"installments":{"total":3,"curIdx":1,"purchaseAmount":10000}},"initialPayment":false}'
        },
        setRecurring() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2026-09-14","recurringExpiryDate":"2027-09-14"}},"initialPayment":true}'
        },
        setRecurringR() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2026-09-14","recurringExpiryDate":"2027-09-14"}},"initialPayment":false}'
        },
        setSkipThreeDs() {
            this.threeDsPolicy = ''
            this.threeDsPolicy = '{"skipThreeDS":"thisTransaction"}'
        },
        mandateChallenge() {
            this.threeDsPolicy = ''
            this.threeDsPolicy = '{"challengePreference": "mandateChallenge"}'
        },
        tra() {
            this.threeDsPolicy = ''
            this.threeDsPolicy = '{"threeDSExemption": {"exemptionReason": "transactionRiskAnalysis", "merchantFraudRate": 4}}'
        },
        lowvalue() {
            this.threeDsPolicy = ''
            this.threeDsPolicy = '{"threeDSExemption": {"exemptionReason": "lowValue"}}'
        },
        generate_transid() {
            let transid = 'NEBO_';
            for (let i = 0; i < 10; i++) {
                transid += Math.floor(Math.random() * 10); // Generates a random digit (0-9)
            }
            this.transid = transid
            this.isDataEncrypted = false
            this.encrypted_data = ''
        },
        encryptData(data) {
            this.encrypted_data = CryptoJS.Blowfish.encrypt(data, CryptoJS.enc.Utf8.parse(this.auth.bf_password), {
                mode: CryptoJS.mode.ECB,
                padding: CryptoJS.pad.Pkcs7
            }).ciphertext.toString(CryptoJS.enc.Hex);
            this.isDataEncrypted = true
            this.isQRCodeGenerated = false
        },
        generateQR() {
            QRCode.toCanvas(this.$refs.qrcodeCanvas, `https://${this.baseurl}/${this.paytype}.aspx?MerchantId=${this.auth.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`, {
                width: 200
            });
            this.isQRCodeGenerated = true
        },
        handleEnterKey(event) {
            if (event.target.tagName === 'TEXTAREA') {
                return;
            }
            event.preventDefault();
            if (this.canEncrypt) {
                this.encryptData(this.plaintext);
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
        generateHMAC(hmac_data, secret) {
            return CryptoJS.HmacSHA256(hmac_data, secret).toString(CryptoJS.enc.Hex);
        },
        handleReceivedParameter(value) {
            if (this.otherparams.length === 0) {
                this.otherparams += value + '='
            } else {
                this.otherparams += '&' + value + '='
            }

        },
        handleParentClick(event) {
            if (!this.isParametersModal) {
                return;
            }
            const menu = this.$refs.menu;
            const el = menu?.$el || menu; // use $el if it's a component
            if (el && !el.contains(event.target)) {
                this.isParametersModal = false;
            }
        },
        rows(e) {
            return Math.ceil(e.length / 69) + 1
        },
    },
    mounted() {
        this.generate_transid()
        document.addEventListener('mousedown', this.handleParentClick)
    },
    beforeUnmount() {
        document.removeEventListener('mousedown', this.handleParentClick)
    },
    watch: {
        paytype() {
            if (this.paytype === 'simplepay') {
                this.currency = 'HUF'
            }
        },
        otherparams(newValue) {
            if (newValue.endsWith('&')) {
                this.otherparams = newValue.slice(0, -1);
            }
            if (newValue.startsWith('&')) {
                this.otherparams = newValue.slice(0);
            }
        },
        isOtherParameters(newVal) {
            if (!newVal) {
                this.otherparams = '';
            }
        },
        'auth.environment'(newVal) {
            if (newVal) {
                this.generate_transid()
                this.isDataEncrypted = false
                this.encrypted_data = ''
            }

        },
        'auth.merchantid'(oldVal, newVal) {
            if (oldVal != newVal) {
                this.isDataEncrypted = false
                this.encrypted_data = ''
            }
        }
    },
}
</script>

<style scoped>
.main-wrapper {
    display: flex;
    margin: auto;
    margin-top: 20px;
    position: relative;
    width: 100%;
    max-width: 800px;
    padding: 0 16px 90px;
}

.parameters {
    margin-top: 10px;
}

.custom-height {
    height: 50px;
}

.validation-error {
    margin-top: 4px;
    font-size: 11px;
    color: #d12f2f;
}

.narrow {
    width: 190px;
}

.redirect-url {
    width: 100%;
    white-space: normal;
    overflow-wrap: break-word;
    font-size: 11px;
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

.custom-padding {
    padding: 5px;
}

.qm-tooltip {
    display: inline-block;
    background-color: #1e5582;
    color: white;
    border-radius: 50px;
    min-width: 15px;
    min-height: 15px;
    max-height: 15px;
    text-align: center;
    cursor: pointer;
    font-size: 11px;
}

.order-desc-buttons {
    text-align: center;
    margin-top: 6px;
}

.only-margin {
    margin-left: 60px;
}

.simpler-button {
    border: none;
    background-color: #a5f729;
    border-radius: 5px;
    padding: 5px 15px 5px 15px;
    cursor: pointer;
    font-size: 11px;
    color: #1e5582;
    font-weight: 600;
    outline: none;
}

.action-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: white;
    border-top: 1px solid #d4d4d4;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
    z-index: 50;
}

.action-bar-inner {
    max-width: 800px;
    margin: 0 auto;
    padding: 10px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
}
</style>
