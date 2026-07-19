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
                            <option v-for="pt in paytypes" :key="pt.value" :value="pt.value" :disabled="pt.divider">
                                {{ pt.divider ? '----------------' : pt.label }}</option>
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
                    <div class="field-row">
                        <strong class="field-label">Preset <strong
                                title="Quickly fill the form with a sample request for a specific flow"
                                class="qm-tooltip">?</strong></strong>
                        <select name="preset" id="preset" class="field-select" v-model="preset" @change="applyPreset">
                            <option value="">-- none --</option>
                            <option value="easycollect_payment">Easy Collect PAYMENT</option>
                            <option value="easycollect_mandate">Easy Collect MANDATE</option>
                            <option value="floa">Floa</option>
                            <option value="applepay_server">Apple Pay (Server)</option>
                        </select>
                    </div>
                    <div class="field-row" v-if="isEasyCollectPreset">
                        <strong class="field-label">Agreement Scheme <strong title="Required for Easy Collect"
                                class="qm-tooltip">?</strong></strong>
                        <select name="agreementScheme" id="agreementScheme" class="field-select"
                            v-model="agreementScheme">
                            <option value="">-- select --</option>
                            <option value="SMS">SMS</option>
                            <option value="EMAIL">EMAIL</option>
                        </select>
                    </div>
                </AccordionSection>

                <AccordionSection title="Encrypted parameters" v-model="accordionEncrypted">
                    <p class="field-row">
                        <strong class="field-label">MsgVer=2.0 <strong
                                title="This parameter is required to indicate that your implementation supports 3-D Secure processing"
                                class="qm-tooltip">?</strong></strong>
                        <input type="checkbox" v-model="isMsgVer2">
                    </p>
                    <p class="field-row">
                        <strong class="field-label">Duplication check <strong
                                title="Adds InvoiceId and OrderId parameters with random values"
                                class="qm-tooltip">?</strong></strong>
                        <input type="checkbox" v-model="isDuplicationCheck">
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
                        <div v-if="isCard" class="card-buttons">
                            <button class="btn-chip" @click="setCardVisa">VISA/CB</button>
                            <button class="btn-chip" @click="setCardMastercard">MC/CB</button>
                            <button class="btn-chip" @click="setCardVisaOnly">VISA</button>
                            <button class="btn-chip" @click="setCardMastercardOnly">Mastercard</button>
                        </div>
                        <div v-if="isCard" class="card-buttons">
                            <span class="muted-text text-xs">Brand only:</span>
                            <button class="btn-chip" @click="setCardBrand('VISA')">VISA</button>
                            <button class="btn-chip" @click="setCardBrand('MasterCard')">MasterCard</button>
                            <button class="btn-chip" @click="setCardBrand('Cartes Bancaires')">Cartes Bancaires</button>
                        </div>
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
                            <strong class="field-label">shipToCustomer:</strong>
                            <input type="checkbox" v-model="isShipToCustomer">
                        </div>
                        <div><textarea class="h-37.5 field-textarea" v-if="isShipToCustomer" name="shipToCustomer"
                                id="shipToCustomer" v-model="shipToCustomer" :rows="rows(shipToCustomer)"></textarea>
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
                            <strong class="field-label">shippingAddress:</strong>
                            <input type="checkbox" v-model="isShippingAddress">
                        </div>
                        <div><textarea class="h-37.5 field-textarea" v-if="isShippingAddress" name="shippingAddress"
                                id="shippingAddress" v-model="shippingAddress" :rows="rows(shippingAddress)"></textarea>
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
                        <div v-if="isTokenData">
                            <button class="btn-chip" @click="setTokenRequestor('applepay')">ApplePay</button>
                            <button class="btn-chip" @click="setTokenRequestor('googlepay')">GooglePay</button>
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
                        <div class="mt-1.5">
                            <button class="btn-chip"
                                @click="appendOtherParams('CCNr=4111111111111111&CCBrand=VISA&CCExpiry=202906&CCCVC=123')">Card</button>
                            <button class="btn-chip"
                                @click="appendOtherParams('AccVerify=yes&delayedShipment=initial')">Delayed
                                Shipment</button>
                        </div>
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
            <div class="action-buttons">
                <button @click="resetForm" class="btn-secondary action-btn-lg">Reset</button>
                <button @click="generate_transid" class="btn-secondary action-btn-lg">Generate TransID</button>
                <button @click="encryptData(plaintext)" class="btn-primary" :disabled="!canEncrypt">Encrypt</button>
                <p v-if="!canEncrypt" class="validation-error">{{ encryptDisabledReason }}</p>
            </div>
            <a class="payment-url-button" v-if="isDataEncrypted" :href="testurl" target="_blank">
                <span>Open</span> {{ this.paytype }}
            </a>
        </div>
    </div>

    <ParametersModal v-show="isParametersModal" @close="isParametersModal = false" ref="menu"
        @setparameter="handleReceivedParameter" />
    <FloatingParamsPanel title="Request parameters" :params="plaintextParams" :payment-url="testurl"
        :show-payment-url="isDataEncrypted" :copied="copiedField === 'url'" @copy-url="copyText(testurl, 'url')" />
</template>

<script>
import CryptoJS from "crypto-js";
import Navbar from '@/components/Navbar.vue'
import Header from "@/components/Header.vue";
import ParametersModal from "@/components/ParametersModal.vue";
import ParamInputRow from "@/components/ParamInputRow.vue";
import AccordionSection from "@/components/AccordionSection.vue";
import FloatingParamsPanel from "@/components/FloatingParamsPanel.vue";
import useAuthStore from '@/stores/auth.js'
import QRCode from "qrcode";
import { PARTNERS, getBaseUrl } from '@/utils/partners.js'
import { PAYTYPES, getPaytypeConfig } from '@/config/paytypes.js'
export default {
    data() {
        return {
            auth: useAuthStore(),
            partners: PARTNERS,
            paytypes: PAYTYPES,
            // merchantid: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_MERCHANTID : '',
            transid: '',
            refnr: '',
            amount: '1000',
            currency: 'EUR',
            orderdesc: 'test:payment',
            urlsuccess: 'https://paygate-test.vercel.app/success',
            urlfailure: 'https://paygate-test.vercel.app/failure',
            urlnotify: 'https://paygate-test.vercel.app/notify',
            urlback: 'https://paygate-test.vercel.app/back',
            email: import.meta.env.VITE_ENVIRONMENT === 'development' ? 'nebojsa.pesic@computop.com' : '',
            // secret_test: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_SECRET : '',
            encrypted_data: '',
            paytype: 'paymentpage',
            paytweak_service: 'link',
            paytweak_reminder_email: '{"ResendAfterDays":"1","MaxAttempts":"1"}',
            isCard: false,
            card: '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"4111111111111111","brand":"VISA"}',
            isMsgVer2: true,
            isDuplicationCheck: false,
            duplicationOrderId: '',
            duplicationInvoiceId: '',
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
            isShipToCustomer: false,
            shipToCustomer: '{"customerNumber":"customer123456","email":"john.doe@example.com","phone":{"countryCode":"49","subscriberNumber":"12345678910"}}',
            preset: '',
            agreementScheme: '',
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
            shippingAddress: '{"city":"Cacakongma","country":{"countryA3":"SRB","countryA2":"SR"},"postalCode":"80331","addressLine1":{"street":"test street","streetNumber":"10"}}',
            isShippingAddress: false,
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

            if (this.isEasyCollectPreset && !this.agreementScheme) {
                errors.push('Agreement Scheme is required.');
            }

            return errors;
        },
        canEncrypt() {
            return this.validationErrors.length === 0;
        },
        encryptDisabledReason() {
            return this.validationErrors[0] || '';
        },
        isEasyCollectPreset() {
            return this.preset === 'easycollect_payment' || this.preset === 'easycollect_mandate';
        },
        otherparamsarray() {
            return this.otherparams ? this.otherparams.split('&') : [];
        },
        plaintextParams() {
            return this.plaintext ? this.plaintext.split('&').filter(p => p.length > 0) : [];
        },
        frontend() {
            const cfg = getPaytypeConfig(this.paytype)
            return cfg ? (cfg.aspx || cfg.value) : '...'
        },
        testurl_ohne_data() {
            return `https://${this.baseurl}/${this.replaceFrontEnd}.aspx?MerchantID=${this.auth.merchantid}&Len=${this.len}&Data=[EncryptedData]`
        },
        testurl() {
            let base_url = `https://${this.baseurl}/${this.replaceFrontEnd}.aspx?MerchantID=${this.auth.merchantid}&Len=${this.len}&Data=${this.encrypted_data}`
            const unencryptedParams = {
                Template: this.template,
                CCTemplate: this.cctemplate,
                PayTypes: this.hpppaytypes,
                Language: this.language,
                CustomField1: this.customfield1,
                CustomField2: this.customfield2,
                CustomField3: this.customfield3,
                CustomField4: this.customfield4,
                CustomField5: this.customfield5,
                CustomField6: this.customfield6,
                CustomField7: this.customfield7,
                CustomField8: this.customfield8,
            }
            for (const [key, value] of Object.entries(unencryptedParams)) {
                if (value.length > 0) {
                    base_url = base_url + `&${key}=${encodeURIComponent(value)}`
                }
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

            if (this.isDuplicationCheck) {
                params.InvoiceId = this.duplicationInvoiceId;
                params.OrderId = this.duplicationOrderId;
            }

            const paytypeConfig = getPaytypeConfig(this.paytype);
            if (paytypeConfig && paytypeConfig.buildParams) {
                paytypeConfig.buildParams(this, params);
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

            if (this.isShippingAddress) {
                params.shippingAddress = btoa(this.shippingAddress);
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

            if (this.isShipToCustomer) {
                params.shipToCustomer = btoa(this.shipToCustomer);
            }

            if (this.isEasyCollectPreset && this.agreementScheme) {
                params.agreementScheme = this.agreementScheme;
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
        applyPreset() {
            if (this.preset === 'easycollect_payment' || this.preset === 'easycollect_mandate') {
                this.isOtherPaymentMethod = false
                this.paytype = 'paymentpage'
                this.agreementScheme = ''

                this.includeURLSuccess = true
                this.urlsuccess = 'http://localhost:4000/success'
                this.includeURLFailure = true
                this.urlfailure = 'http://localhost:4000/failure'
                this.includeURLNotify = true
                this.urlnotify = 'http://localhost:4000/notify'
                this.includeURLBack = true
                this.urlback = 'http://localhost:4000/back'

                this.includeTransID = true
                this.generate_transid()
                this.includeAmount = true
                this.amount = '1599'
                this.includeCurrency = true
                this.currency = 'EUR'

                this.isBillToCustomer = true
                this.billToCustomer = '{"customerNumber":"customerNumberDummy123","email":"nebojsa.pesic@computop.com","consumer":{"firstName":"Jane","lastName":"Doe"},"phone":{"countryCode":"+33","subscriberNumber":"600000000"}}'

                this.isOtherParameters = true
                this.otherparams = 'DueDate=2026-07-15&IBAN=DE02120300000000202051&EMail=nebojsa.pesic@computop.com&FirstName=Jane&LastName=Doe&bdStreet=Example Street&bdStreetNr=5&bdZip=10115&bdCity=Berlin&bdCountryCode=FR&phone=+4915163709420&DocumentSignature=false&GoogleAnalyticsConsent=false&SignatureBySca=false&Sps=false&Validation=True&EventToken=Payment'
            } else if (this.preset === 'floa') {
                this.isOtherPaymentMethod = false
                this.paytype = 'paymentpage'

                const randomCustomerId = 'customerNumber' + this.random_digits(6)
                const randomOrderId = 'merchantReference' + this.random_digits(5)
                const today = new Date()
                const todayFormatted = String(today.getDate()).padStart(2, '0') + '/' + String(today.getMonth() + 1).padStart(2, '0') + '/' + today.getFullYear()

                this.includeTransID = true
                this.generate_transid()
                this.includeAmount = true
                this.amount = '50000'
                this.includeCurrency = true
                this.currency = 'EUR'

                this.includeCustomerID = true
                this.customerid = randomCustomerId

                this.includeURLSuccess = true
                this.urlsuccess = 'http://localhost:4000/success'
                this.includeURLFailure = true
                this.urlfailure = 'http://localhost:4000/failure'
                this.includeURLNotify = true
                this.urlnotify = 'http://localhost:4000/notify'
                this.includeURLBack = true
                this.urlback = 'http://localhost:4000/back'

                this.isBillToCustomer = true
                this.billToCustomer = `{"customerNumber":"${randomCustomerId}","email":"nebojsa.pesic@computop.com","consumer":{"firstName":"NEBO","lastName":"TEST"},"phone":{"countryCode":"+33","subscriberNumber":"764445110"}}`

                this.isShipToCustomer = true
                this.shipToCustomer = `{"customerNumber":"${randomCustomerId}","email":"nebojsa.pesic@computop.com","phone":{"countryCode":"+33","subscriberNumber":"764445110"}}`

                this.includeEmail = true
                this.email = 'nebojsa.pesic@computop.com'

                this.includeChannel = true
                this.channel = 'DESKTOP'

                this.isOtherParameters = true
                this.otherparams = `OrderID=${randomOrderId}&InvoiceID=invoiceId123&FirstName=NEBO&LastName=TEST&MobileNr=+33764445110&AddrStreet=Bubbu Collange&AddrZip=92300&AddrCity=Levallois-Perret&AddrCountryCode=FR&Date=${todayFormatted}&NumberArticles=2&Homepage=https://example.com`
            } else if (this.preset === 'applepay_server') {
                this.isOtherPaymentMethod = false
                this.paytype = 'applepay'

                this.includeURLSuccess = false
                this.includeURLFailure = false
                this.includeURLBack = false
                this.includeURLNotify = true
                this.urlnotify = 'http://localhost:4000/notify'

                this.includeTransID = true
                this.generate_transid()
                this.includeAmount = true
                this.amount = '1599'
                this.includeCurrency = true
                this.currency = 'EUR'

                this.includeOrderDesc = true
                this.orderdesc = 'test:payment'

                this.includeChannel = true
                this.channel = 'WEBSITE'

                // Sample PKPaymentToken from Computop's Apple Pay docs (https://developer.computop.com/display/EN/Apple+Pay)
                const applePayToken = {
                    paymentData: {
                        data: 'GiZiyzsI6r6lnPYUeceR6itk2PDyBozl2Xy77c5u2X8Ze7l5EasyyH4Q6BoAevrvBfe0FnUNARBEXRySLwqqnpUHO6Du/amZEECRXxlrH91wFqH4oXry2CTDRu7TaIlmnR+s3ien5JI8iWo9hoEW7hyJOE7QGaS6rfR1CtQ4DWJEUq/tFnW98tj3kwKU6iOAAvE467boopMDGBS1fK5HzGXs4hH/6r+LPRfSOKBi1L5VWAexs9Bzw3ByyG69i52doRuFb1xOcMOJbmPg40hap13IjBW6dnj1phbsqP2i/JxvWPV3EcuqpuIoVZr5w53w//pPsl54kmeXNddIjVD5dIhhOKZ8AznD4eL2dbzkp6bic8xScBf3G8hrKXTRTL7V+KT2S+TQliHN0SNXrFu6B6o=',
                        signature: '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',
                        header: {
                            publicKeyHash: 'OgiD2qBTWYf/a+LDshFeQcPq6tOmePu0epHpP4ZkNicc=',
                            ephemeralPublicKey: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEc/HxA3lJZrC+B0ITom0Iji+gFdn7ivGtpI+fl2u8n8XByPgBaVK2b44qUvsGigoNd0OFLNXo0Q07R2B54eIdS3A==',
                            transactionId: '156632b2aadf355d4958d9051a42bf62e07aea5716e72083aa64247944f6e3e14d'
                        },
                        version: 'EC_v1'
                    },
                    paymentMethod: {
                        displayName: 'MasterCard 0063',
                        network: 'MasterCard',
                        type: 'debit'
                    },
                    transactionIdentifier: '156632B2AAD12F355D4958D9051A42BF62E07AE5716E720AA6424794F6E3E14567D'
                }

                this.isOtherParameters = true
                this.otherparams = `TokenExt=${btoa(JSON.stringify(applePayToken))}`
            }
        },
        seEci07() {
            this.threeDsData = ''
            this.threeDsData = '{"acsProtocolVersion":"2.2.0","eci":"07"}'
        },
        seEci05() {
            this.threeDsData = ''
            this.threeDsData = '{"acsProtocolVersion":"2.2.0","authenticationValue":"kAMACEJBakKSOSzNLnxNiZeBQnf+","eci":"02","threeDSServerTransID":"a3dd2b66-6c06-423b-acd4-1cc19697a08f","dsTransID":"9e0e91c0-24e3-423c-a136-97023269d580","intermediateStatus":"Y","finalStatus":"Y"}'
        },
        setCardVisa() {
            this.card = ''
            this.card = '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"4111111111111111","brand":"VISA"}'
        },
        setCardMastercard() {
            this.card = ''
            this.card = '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"5555555555554444","brand":"MASTERCARD"}'
        },
        setCardVisaOnly() {
            this.card = ''
            this.card = '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"4000000000000002","brand":"VISA"}'
        },
        setCardMastercardOnly() {
            this.card = ''
            this.card = '{"securityCode":"123","expiryDate":"202906","cardholderName":"John Doe","number":"5200000000000007","brand":"MASTERCARD"}'
        },
        setTokenRequestor(requestor) {
            let parsed;
            try {
                parsed = JSON.parse(this.tokenData);
            } catch (e) {
                parsed = { eci: '07', tokenCryptogram: 'AgAAAAAAAIR8CQrXcIhbQAAAAAA=', tokenRequestorID: '40000000082' };
            }
            parsed.tokenRequestor = requestor;
            this.tokenData = ''
            this.tokenData = JSON.stringify(parsed);
        },
        setCardBrand(brand) {
            let parsed;
            try {
                parsed = JSON.parse(this.card);
            } catch (e) {
                parsed = { securityCode: '123', expiryDate: '202906', cardholderName: 'John Doe', number: '4111111111111111' };
            }
            parsed.brand = brand;
            this.card = ''
            this.card = JSON.stringify(parsed);
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
        resetForm() {
            window.location.reload()
        },
        random_digits(length) {
            let digits = '';
            for (let i = 0; i < length; i++) {
                digits += Math.floor(Math.random() * 10);
            }
            return digits
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
            QRCode.toCanvas(this.$refs.qrcodeCanvas, this.testurl, {
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
        appendOtherParams(pairs) {
            if (this.otherparams.length === 0) {
                this.otherparams = pairs
            } else {
                this.otherparams += '&' + pairs
            }
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
        this.duplicationOrderId = 'ORD' + this.random_digits(8)
        this.duplicationInvoiceId = 'INV' + this.random_digits(8)
        document.addEventListener('mousedown', this.handleParentClick)
    },
    beforeUnmount() {
        document.removeEventListener('mousedown', this.handleParentClick)
    },
    watch: {
        paytype(newVal) {
            const cfg = getPaytypeConfig(newVal)
            if (!cfg) {
                this.isDataEncrypted = false
                return
            }
            this.isMsgVer2 = cfg.msgVer2
            this.isDataEncrypted = false
            this.encrypted_data = ''
            if (cfg.onSelect) {
                cfg.onSelect(this)
            }
        },
        otherparams(newValue) {
            if (newValue.endsWith('&')) {
                this.otherparams = newValue.slice(0, -1);
            }
            if (newValue.startsWith('&')) {
                this.otherparams = newValue.slice(1);
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
        'auth.merchantid'(newVal, oldVal) {
            if (newVal != oldVal) {
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

.action-buttons {
    display: flex;
    align-items: center;
    gap: 12px;
}

.action-btn-lg {
    font-size: 14px;
    padding: 10px 16px;
}
</style>
