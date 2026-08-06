<template>
    <div class="main-wrapper">
        <div class="card mx-auto">
            <div class="title-row">
                <div class="title-actions">
                    <h3 class="page-title">Paygate Encryption Test Tool</h3>
                    <button type="button" class="btn-secondary tutorial-launch" @click="startTutorial">Show tutorial</button>
                </div>
                <div class="floating-params-dock" data-floating-params-dock></div>
                <button class="btn-secondary" @click="isLogOpen = true">Event log</button>
            </div>
            <div class="parameters" @keydown.enter="handleEnterKey">
                <AccordionSection title="General" v-model="accordionGeneral">
                    <div class="general-layout">
                        <section class="form-group" data-tour="request-setup">
                            <h4 class="form-group-title">Request setup</h4>
                            <div class="field-grid">
                                <label class="field-stack">
                                    <strong class="field-label-top">Partner</strong>
                                    <select name="partner" id="partner" class="field-select" v-model="auth.partner">
                                        <option v-for="p in partners" :key="p.value" :value="p.value">{{ p.label }}</option>
                                    </select>
                                </label>
                                <label class="field-stack" data-tour="environment">
                                    <strong class="field-label-top">Environment</strong>
                                    <select name="environment" id="environment" class="field-select" v-model="auth.environment">
                                        <option value="dev">DEV</option>
                                        <option value="test">TEST</option>
                                        <option value="prod">PRODUCTION</option>
                                    </select>
                                </label>
                                <div class="field-stack sm:col-span-2" data-tour="paytype">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Pay type</strong>
                                        <label class="checkbox-label">
                                            <input type="checkbox" v-model="isOtherPaymentMethod">
                                            Use custom pay type
                                            <strong title="Use this if payment method is not listed below"
                                                class="qm-tooltip">?</strong>
                                        </label>
                                    </div>
                                    <select v-if="!isOtherPaymentMethod" name="paytype" id="paytype" v-model="paytype"
                                        class="field-select field-control-wide">
                                        <option v-for="pt in paytypes" :key="pt.value" :value="pt.value" :disabled="pt.divider">
                                            {{ pt.divider ? '----------------' : pt.label }}</option>
                                    </select>
                                    <div v-else class="custom-paytype-row">
                                        <input class="field-input field-control-wide" type="text"
                                            v-model="otherpaymentmethod" placeholder="example (example.aspx)">
                                        <button type="button" class="btn-chip"
                                            @click="otherpaymentmethod = 'reverse'">reverse.aspx</button>
                                        <button type="button" class="btn-chip"
                                            @click="otherpaymentmethod = 'credit'">credit.aspx</button>
                                    </div>
                                </div>
                                <label class="field-stack">
                                    <strong class="field-label-top">Preset <strong
                                            title="Quickly fill the form with a sample request for a specific flow"
                                            class="qm-tooltip">?</strong></strong>
                                    <select name="preset" id="preset" class="field-select" v-model="preset"
                                        @change="applyPreset">
                                        <option value="">-- none --</option>
                                        <option value="easycollect_payment">Easy Collect PAYMENT</option>
                                        <option value="easycollect_mandate">Easy Collect MANDATE</option>
                                        <option value="floa">Floa</option>
                                        <option value="applepay_server">Apple Pay (Server)</option>
                                        <option value="mit_installment">MIT Installment</option>
                                        <option value="mit_delayed_shipment">MIT Delayed shipment</option>
                                    </select>
                                </label>
                        <div class="field-stack" v-if="isEasyCollectPreset">
                            <strong class="field-label-top">Agreement Scheme <strong title="Required for Easy Collect"
                                    class="qm-tooltip">?</strong></strong>
                            <select name="agreementScheme" id="agreementScheme" class="field-select"
                                v-model="agreementScheme">
                                <option value="">-- select --</option>
                                <option value="SMS">SMS</option>
                                <option value="EMAIL">EMAIL</option>
                            </select>
                        </div>
                            </div>
                        </section>

                        <section class="form-group" data-tour="credentials">
                            <h4 class="form-group-title">Merchant credentials</h4>
                            <div class="credential-grid">
                                <label class="field-stack" data-tour="merchant-id">
                                    <strong class="field-label-top">Merchant ID</strong>
                                    <input type="text" class="field-input field-control-wide"
                                        v-model="this.auth.merchantid" placeholder="Required">
                                </label>
                                <div class="quick-values">
                                    <span>Quick values</span>
                                    <button type="button" class="btn-chip" @click="this.auth.merchantid = 'npesic_test'">npesic_test</button>
                                    <button type="button" class="btn-chip" @click="this.auth.merchantid = 'ing_test_nebo'">ing_test_nebo</button>
                                    <button type="button" class="btn-chip" @click="this.auth.merchantid = 'Nexi_test_merchant'">Nexi_test_merchant</button>
                                </div>
                                <label class="field-stack" data-tour="encryption-password">
                                    <strong class="field-label-top">Encryption password <strong
                                            title="Received from Computop" class="qm-tooltip">?</strong></strong>
                                    <div class="input-action-row">
                                        <input type="text" class="field-input field-control-wide min-w-0"
                                            v-model="this.auth.bf_password" placeholder="Required">
                                        <button type="button" class="btn-secondary shrink-0"
                                            @click="this.auth.bf_password = 'AaAaAaAaAaAaAaAa'">Use test password</button>
                                    </div>
                                </label>
                                <label class="field-stack">
                                    <strong class="field-label-top">HMAC password <span class="optional-label">Optional</span></strong>
                                    <input type="text" class="field-input field-control-wide"
                                        v-model="hmac_password" placeholder="Optional">
                                </label>
                            </div>
                        </section>
                    </div>
                </AccordionSection>

                <AccordionSection title="Encrypted parameters" v-model="accordionEncrypted">
                    <div class="encrypted-options">
                        <label class="checkbox-card">
                            <input type="checkbox" v-model="isMsgVer2">
                            <span><strong>3-D Secure (MsgVer 2.0)</strong><small>Enable 3-D Secure processing</small></span>
                        </label>
                        <label class="checkbox-card">
                            <input type="checkbox" v-model="isDuplicationCheck">
                            <span><strong>Duplication check</strong><small>Add random InvoiceId and OrderId values</small></span>
                        </label>
                    </div>

                    <div class="parameter-layout">
                        <section class="form-group" data-tour="transaction">
                            <h4 class="form-group-title">Transaction</h4>
                            <div class="parameter-grid">
                                <ParamInputRow label="Transaction ID" v-model="transid" v-model:includeValue="includeTransID">
                                    <button type="button" @click="generate_transid" class="btn-secondary">Generate</button>
                                </ParamInputRow>
                                <ParamInputRow label="Reference number" v-model="refnr" v-model:includeValue="includeRefNr" />
                                <ParamInputRow label="Channel" v-model="channel" v-model:includeValue="includeChannel" />
                                <ParamInputRow label="Customer ID" v-model="customerid" v-model:includeValue="includeCustomerID" />
                                <div data-tour="amount">
                                    <ParamInputRow label="Amount" v-model="amount" v-model:includeValue="includeAmount"
                                        placeholder="Required" />
                                </div>
                                <div data-tour="currency">
                                    <ParamInputRow label="Currency" v-model="currency" v-model:includeValue="includeCurrency"
                                        placeholder="Required" />
                                </div>
                            </div>
                        </section>

                        <section class="form-group" data-tour="urls">
                            <h4 class="form-group-title">Redirect URLs</h4>
                            <div class="parameter-grid">
                                <ParamInputRow label="Success URL" v-model="urlsuccess" v-model:includeValue="includeURLSuccess" />
                                <ParamInputRow label="Failure URL" v-model="urlfailure" v-model:includeValue="includeURLFailure" />
                                <ParamInputRow label="Notify URL" v-model="urlnotify" v-model:includeValue="includeURLNotify" />
                                <ParamInputRow label="Back URL" v-model="urlback" v-model:includeValue="includeURLBack" />
                            </div>
                        </section>

                        <section class="form-group parameter-span">
                            <h4 class="form-group-title">Order data</h4>
                            <div class="parameter-grid">
                                <div class="field-stack parameter-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Article list</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isArticleList"> Include</label>
                                    </div>
                                    <textarea class="field-textarea" v-model="articlelist" :rows="rows(articlelist)"
                                        :disabled="!isArticleList"></textarea>
                                </div>
                                <div class="field-stack parameter-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Order item</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isOrderItem"> Include</label>
                                    </div>
                                    <textarea class="field-textarea" v-model="orderitem" :rows="rows(orderitem)"
                                        :disabled="!isOrderItem"></textarea>
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
                    <div class="parameter-grid mt-4">
                        <div class="parameter-field">
                            <ParamInputRow label="Email" v-model="email" v-model:includeValue="includeEmail" />
                            <div class="order-desc-buttons">
                                <button class="btn-chip" @click="this.email = this.email + '@computop.com'"
                                    title="Use this for simulating successful payment">@computop.com</button>
                                <button class="btn-chip"
                                    @click="this.email = this.email + '@gmail.com'">@gmail.com</button>
                            </div>
                        </div>
                        <div class="parameter-field">
                            <ParamInputRow label="OrderDesc" v-model="orderdesc" v-model:includeValue="includeOrderDesc" />
                            <div class="order-desc-buttons">
                                <button class="btn-chip" @click="this.orderdesc = 'test:0000'"
                                    title="Use this for simulating successful payment">test:0000</button>
                                <button class="btn-chip" @click="this.orderdesc = 'test:0305'">test:0305</button>
                            </div>
                        </div>
                    </div>
                        </section>
                    </div>
                </AccordionSection>

                <AccordionSection title="Advanced / 3DS &amp; tokens" v-model="accordionAdvanced">
                    <div class="advanced-layout">
                        <section class="form-group advanced-span">
                            <h4 class="form-group-title">Payment instrument</h4>
                            <div class="advanced-grid">
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Card</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isCard"> Include</label>
                                    </div>
                                    <template v-if="isCard">
                                        <textarea class="custom-height field-textarea" :rows="rows(card)" name="card"
                                            id="card" v-model="card"></textarea>
                                        <div class="preset-row">
                                            <span class="preset-label">Card + brand</span>
                                            <button class="btn-chip" @click="setCardVisa">VISA/CB</button>
                                            <button class="btn-chip" @click="setCardMastercard">MC/CB</button>
                                            <button class="btn-chip" @click="setCardVisaOnly">VISA</button>
                                            <button class="btn-chip" @click="setCardMastercardOnly">Mastercard</button>
                                        </div>
                                        <div class="preset-row">
                                            <span class="preset-label">Brand only</span>
                                            <button class="btn-chip" @click="setCardBrand('VISA')">VISA</button>
                                            <button class="btn-chip" @click="setCardBrand('MasterCard')">MasterCard</button>
                                            <button class="btn-chip" @click="setCardBrand('Cartes Bancaires')">Cartes Bancaires</button>
                                        </div>
                                    </template>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Credential on file</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isCredentialOnFile"> Include</label>
                                    </div>
                                    <template v-if="isCredentialOnFile">
                                        <textarea class="custom-height field-textarea" name="cof" id="cof"
                                            v-model="credentialOnFile" :rows="rows(credentialOnFile)"></textarea>
                                        <div class="preset-row">
                                            <button class="btn-chip" @click="setCit">CIT</button>
                                            <button class="btn-chip" @click="setCitC">CIT (RTF=C)</button>
                                            <button class="btn-chip" @click="setMitE">MIT (RTF=E)</button>
                                            <button class="btn-chip" @click="setMitM">MIT (RTF=M)</button>
                                            <button class="btn-chip" @click="setInstallments">Installments (RTF=I)</button>
                                            <button class="btn-chip" @click="setInstallmentsR">Installments (RTF=R)</button>
                                            <button class="btn-chip" @click="setRecurring">Recurring (RTF=I)</button>
                                            <button class="btn-chip" @click="setRecurringR">Recurring (RTF=R)</button>
                                            <button class="btn-chip" @click="setRecurringFixed">useCase=fixed (02)</button>
                                            <button class="btn-chip" @click="setRecurringFlexibleAmount">useCase=flexibleAmount (05)</button>
                                            <button class="btn-chip" @click="setRecurringFlexibleFrequency">useCase=flexibleFrequency (05)</button>
                                            <button class="btn-chip" @click="setCofInitialPayment(true)">initialPayment=true</button>
                                            <button class="btn-chip" @click="setCofInitialPayment(false)">initialPayment=false</button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </section>

                        <section class="form-group">
                            <h4 class="form-group-title">Customer &amp; addresses</h4>
                            <div class="advanced-grid">
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Bill-to customer</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isBillToCustomer"> Include</label>
                                    </div>
                                    <textarea v-if="isBillToCustomer" class="field-textarea" name="billToCustomer"
                                        id="billToCustomer" v-model="billToCustomer" :rows="rows(billToCustomer)"></textarea>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Ship-to customer</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isShipToCustomer"> Include</label>
                                    </div>
                                    <textarea v-if="isShipToCustomer" class="field-textarea" name="shipToCustomer"
                                        id="shipToCustomer" v-model="shipToCustomer" :rows="rows(shipToCustomer)"></textarea>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Billing address</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isBillingAddress"> Include</label>
                                    </div>
                                    <textarea v-if="isBillingAddress" class="field-textarea" name="billingAddress"
                                        id="billingAddress" v-model="billingAddress" :rows="rows(billingAddress)"></textarea>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Shipping address</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isShippingAddress"> Include</label>
                                    </div>
                                    <textarea v-if="isShippingAddress" class="field-textarea" name="shippingAddress"
                                        id="shippingAddress" v-model="shippingAddress" :rows="rows(shippingAddress)"></textarea>
                                </div>
                            </div>
                        </section>

                        <section class="form-group">
                            <h4 class="form-group-title">Authentication &amp; tokens</h4>
                            <div class="advanced-stack">
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">3DS data</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isThreeDsData"> Include</label>
                                    </div>
                                    <template v-if="isThreeDsData">
                                        <textarea class="field-textarea" name="threeDsData" id="threeDsData"
                                            v-model="threeDsData" :rows="rows(threeDsData)"></textarea>
                                        <div class="preset-row">
                                            <button class="btn-chip" @click="seEci07()">ECI=07/04</button>
                                            <button class="btn-chip" @click="seEci05()">ECI=05/02</button>
                                        </div>
                                    </template>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">3DS policy</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isThreeDsPolicy"> Include</label>
                                    </div>
                                    <template v-if="isThreeDsPolicy">
                                        <textarea class="custom-height field-textarea" name="threeDsPolicy"
                                            id="threeDsPolicy" v-model="threeDsPolicy"></textarea>
                                        <div class="preset-row">
                                            <button class="btn-chip" @click="setSkipThreeDs">Skip 3DS</button>
                                            <button class="btn-chip" @click="mandateChallenge">Mandate challenge</button>
                                            <button class="btn-chip" @click="tra">TRA</button>
                                            <button class="btn-chip" @click="lowvalue">Low Value</button>
                                        </div>
                                    </template>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Browser info</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isBrowserInfo"> Include</label>
                                    </div>
                                    <textarea v-if="isBrowserInfo" class="custom-height field-textarea" name="browserInfo"
                                        id="browserInfo" v-model="browserInfo"></textarea>
                                </div>
                                <div class="advanced-field">
                                    <div class="field-heading-row">
                                        <strong class="field-label-top">Token data</strong>
                                        <label class="checkbox-label"><input type="checkbox" v-model="isTokenData"> Include</label>
                                    </div>
                                    <template v-if="isTokenData">
                                        <textarea class="custom-height field-textarea" name="tokenData" id="tokenData"
                                            v-model="tokenData"></textarea>
                                        <div class="preset-row">
                                            <button class="btn-chip" @click="setTokenRequestor('applepay')">ApplePay</button>
                                            <button class="btn-chip" @click="setTokenRequestor('googlepay')">GooglePay</button>
                                        </div>
                                    </template>
                                </div>
                            </div>
                        </section>
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
                            <button type="button" class="btn-chip" @click="template = 'npesic_test'">npesic_test</button>
                            <button type="button" class="btn-chip" @click="template = 'ct_PaymentPageDropDown_v1'">ct_PaymentPageDropDown_v1</button>
                            <button type="button" class="btn-chip" @click="template = 'ing_PaymentPageDropDown_v1'">ing_PaymentPageDropDown_v1</button>                            <button type="button" class="btn-chip" @click="template = 'ct_paymentpagelogos_v1'">ct_paymentpagelogos_v1</button>
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

    <aside v-if="isSuggestionContactVisible" class="suggestion-contact" aria-label="Product feedback contact">
        <div class="suggestion-contact-image-wrapper">
            <img :src="neboImage" alt="Nebo" class="suggestion-contact-image">
            <button type="button" class="suggestion-contact-close" aria-label="Close product feedback contact"
                @click="dismissSuggestionContact">Close</button>
        </div>
        <div class="suggestion-contact-pill">Any suggestions? Message your favorite PM! ⬆️⬆️⬆️</div>
    </aside>

    <div class="action-bar">
        <div class="action-bar-inner">
            <div class="action-buttons">
                <button @click="resetForm" class="btn-secondary action-btn-lg">Reset</button>
                <button @click="generate_transid" class="btn-secondary action-btn-lg">Generate TransID</button>
                <button @click="encryptData(plaintext)" class="btn-primary" data-tour="encrypt"
                    :disabled="!canEncrypt">Encrypt</button>
                <p v-if="!canEncrypt" class="validation-error">{{ encryptDisabledReason }}</p>
            </div>
            <div v-if="isBulkAvailable" class="bulk-run">
                <label class="bulk-run-field">
                    <span class="bulk-run-label">Runs</span>
                    <input type="number" class="field-input bulk-run-input" min="1" :max="BULK_RUN_MAX" step="1"
                        v-model.number="bulkCount" :disabled="isBulkRunning">
                </label>
                <button type="button" class="btn-secondary action-btn-lg bulk-run-button" @click="runBulk"
                    :disabled="!canRunBulk">
                    <span v-if="isBulkRunning" class="spinner" aria-hidden="true"></span>
                    {{ isBulkRunning ? `Running ${bulkCompleted} of ${bulkTotal}` : 'Run bulk' }}
                </button>
                <button v-if="isBulkRunning" type="button" class="btn-secondary" @click="stopBulk">Stop</button>
                <p v-if="bulkStatus" class="bulk-run-status" :class="{ 'bulk-run-status-error': bulkFailed > 0 }"
                    role="status" aria-live="polite">{{ bulkStatus }}</p>
            </div>
            <a class="payment-url-button" v-if="isDataEncrypted" :href="testurl" target="_blank">
                <span>Open</span> {{ this.paytype }}
            </a>
        </div>
    </div>

    <ParametersModal v-show="isParametersModal" @close="isParametersModal = false" ref="menu"
        @setparameter="handleReceivedParameter" />
    <FloatingParamsPanel title="Request parameters" :params="plaintextParams" :endpoint="requestEndpoint"
        :payment-url="testurl" :show-payment-url="isDataEncrypted" :copied="copiedField === 'url'"
        @copy-url="copyText(testurl, 'url')" />
    <FloatingResponsePanel v-if="replaceFrontEnd === 'direct' || replaceFrontEnd === 'paybylinkexternal'"
        :password="auth.bf_password" @response-decrypted="logResponse" />
    <EventLogPanel v-if="isLogOpen" @close="isLogOpen = false" />

    <template v-if="tutorialActive">
        <div class="tutorial-backdrop" aria-hidden="true"></div>
        <aside class="tutorial-dialog" role="dialog" aria-modal="true" aria-labelledby="tutorial-title">
            <div class="tutorial-progress">Step {{ tutorialStep + 1 }} of {{ tutorialSteps.length }}</div>
            <h4 id="tutorial-title">{{ currentTutorialStep.title }}</h4>
            <p>{{ currentTutorialStep.text }}</p>
            <div class="tutorial-controls">
                <button type="button" class="tutorial-stop" @click="stopTutorial">Stop tutorial</button>
                <div class="tutorial-navigation">
                    <button v-if="tutorialStep > 0" type="button" class="btn-secondary"
                        @click="previousTutorialStep">Back</button>
                    <button type="button" class="btn-primary tutorial-next" @click="nextTutorialStep">
                        {{ tutorialStep === tutorialSteps.length - 1 ? 'Finish' : 'Next' }}
                    </button>
                </div>
            </div>
        </aside>
    </template>
</template>

<script>
import CryptoJS from "crypto-js";
import Navbar from '@/components/Navbar.vue'
import Header from "@/components/Header.vue";
import ParametersModal from "@/components/ParametersModal.vue";
import ParamInputRow from "@/components/ParamInputRow.vue";
import AccordionSection from "@/components/AccordionSection.vue";
import FloatingParamsPanel from "@/components/FloatingParamsPanel.vue";
import FloatingResponsePanel from "@/components/FloatingResponsePanel.vue";
import EventLogPanel from "@/components/EventLogPanel.vue";
import useEventLogStore from '@/stores/eventLog.js'
import useAuthStore from '@/stores/auth.js'
import QRCode from "qrcode";
import neboImage from '@/assets/images/logo/nebo.png'
import { PARTNERS, getBaseUrl } from '@/utils/partners.js'
import { PAYTYPES, getPaytypeConfig } from '@/config/paytypes.js'
import { decryptResponseBody } from '@/utils/blowfish.js'

const SUGGESTION_CONTACT_DISMISSED_KEY = 'suggestion-contact-dismissed'
const BULK_RUN_MAX = 100
const PROXY_UNREACHABLE = 'Could not reach the proxy - this only works when deployed on Vercel (or via `vercel dev` locally).'

export default {
    data() {
        return {
            auth: useAuthStore(),
            eventLog: useEventLogStore(),
            neboImage,
            BULK_RUN_MAX,
            bulkCount: 5,
            isBulkRunning: false,
            bulkStopRequested: false,
            bulkTotal: 0,
            bulkCompleted: 0,
            bulkSucceeded: 0,
            bulkFailed: 0,
            bulkStatus: '',
            isSuggestionContactVisible: true,
            isLogOpen: false,
            tutorialActive: false,
            tutorialStep: 0,
            tutorialSteps: [
                {
                    target: 'paytype',
                    title: 'Choose the pay type',
                    text: 'Select the payment endpoint you want to test. The pay type determines which additional parameters may be needed for your use case.',
                    accordion: 'accordionGeneral',
                },
                {
                    target: 'environment',
                    title: 'Choose the environment',
                    text: 'Select DEV, TEST, or PRODUCTION. Make sure the environment matches the merchant credentials you will use.',
                    accordion: 'accordionGeneral',
                },
                {
                    target: 'merchant-id',
                    title: 'Enter the merchant ID',
                    text: 'Enter the merchant ID assigned for the selected environment.',
                    accordion: 'accordionGeneral',
                },
                {
                    target: 'encryption-password',
                    title: 'Enter the encryption password',
                    text: 'Enter the Blowfish encryption password associated with this merchant ID.',
                    accordion: 'accordionGeneral',
                },
                {
                    target: 'amount',
                    title: 'Set the amount',
                    text: 'Enter the payment amount in the smallest currency unit—for example, 1000 for EUR 10.00.',
                    accordion: 'accordionEncrypted',
                },
                {
                    target: 'currency',
                    title: 'Set the currency',
                    text: 'Enter the three-letter ISO currency code, such as EUR or USD.',
                    accordion: 'accordionEncrypted',
                },
                {
                    target: 'urls',
                    title: 'Provide redirect URLs',
                    text: 'Check the success, failure, notification, and back URLs used by the payment flow. Other parameters depend on the selected pay type and your use case.',
                    accordion: 'accordionEncrypted',
                },
                {
                    target: 'encrypt',
                    title: 'Encrypt the request',
                    text: 'Review the required values, then select Encrypt to prepare the request. You can add any use-case or pay-type-specific parameters before this step.',
                },
            ],
            partners: PARTNERS,
            paytypes: PAYTYPES,
            // merchantid: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_MERCHANTID : '',
            transid: '',
            refnr: '',
            amount: '1000',
            currency: 'EUR',
            orderdesc: 'test:paymentpage',
            urlsuccess: 'https://paygate-test.vercel.app/success',
            urlfailure: 'https://paygate-test.vercel.app/failure',
            urlnotify: 'https://paygate-test.vercel.app/api/notify',
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
            includeEmail: false,
            includeOrderDesc: false,
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
        FloatingParamsPanel,
        FloatingResponsePanel,
        EventLogPanel
    },
    computed: {
        currentTutorialStep() {
            return this.tutorialSteps[this.tutorialStep]
        },
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
        // bulk sending only makes sense for the S2S endpoint: direct.aspx answers
        // in the response body, the redirect pay types answer in the browser
        isBulkAvailable() {
            return this.replaceFrontEnd === 'direct';
        },
        canRunBulk() {
            return this.canEncrypt && !this.isBulkRunning && Number(this.bulkCount) >= 1;
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
        requestEndpoint() {
            return `https://${this.baseurl}/${this.replaceFrontEnd}.aspx`
        },
        testurl_ohne_data() {
            return `${this.requestEndpoint}?MerchantID=${this.auth.merchantid}&Len=${this.len}&Data=[EncryptedData]`
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
        dismissSuggestionContact() {
            this.isSuggestionContactVisible = false
            sessionStorage.setItem(SUGGESTION_CONTACT_DISMISSED_KEY, 'true')
        },
        startTutorial() {
            this.tutorialStep = 0
            this.tutorialActive = true
            document.addEventListener('keydown', this.handleTutorialKeydown)
            this.showTutorialStep()
        },
        stopTutorial() {
            this.tutorialActive = false
            this.clearTutorialHighlight()
            document.removeEventListener('keydown', this.handleTutorialKeydown)
        },
        nextTutorialStep() {
            if (this.tutorialStep === this.tutorialSteps.length - 1) {
                this.stopTutorial()
                return
            }
            this.tutorialStep += 1
            this.showTutorialStep()
        },
        previousTutorialStep() {
            if (this.tutorialStep === 0) return
            this.tutorialStep -= 1
            this.showTutorialStep()
        },
        handleTutorialKeydown(event) {
            if (event.key === 'Escape') this.stopTutorial()
            if (event.key === 'ArrowRight') this.nextTutorialStep()
            if (event.key === 'ArrowLeft') this.previousTutorialStep()
        },
        clearTutorialHighlight() {
            document.querySelectorAll('.tutorial-highlight').forEach((element) => {
                element.classList.remove('tutorial-highlight')
            })
            document.querySelectorAll('.tutorial-layer').forEach((element) => {
                element.classList.remove('tutorial-layer')
            })
        },
        showTutorialStep() {
            this.clearTutorialHighlight()
            const step = this.currentTutorialStep
            if (step.accordion) this[step.accordion] = true

            this.$nextTick(() => {
                const target = document.querySelector(`[data-tour="${step.target}"]`)
                if (!target) return
                target.classList.add('tutorial-highlight')
                target.closest('.action-bar')?.classList.add('tutorial-layer')
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
            })
        },
        // payssl sends the amount/currency in CustomField1, with the amount in
        // major units: Amount=1000 & Currency=EUR -> "10.00 EUR"
        syncPaysslCustomField1() {
            if (this.paytype !== 'payssl') {
                return
            }
            this.customfield1 = `${(Number(this.amount) / 100).toFixed(2)} ${this.currency}`
        },
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
                        signature: 'MIAGCSqGSIb3DQEHAqCAMIACAQExDzANBglghkgBZQMEAgEFADCABgkqhkiG9w0BBwEAAKCAMIID4zCCA4igAwIBAgIITDBBSVGdVDYwCgYIKoZIzj0EAwIwejEuMCwGA1UEAwwlQXBwbGUgQXBwbGljYXRpb24gSW50ZWdyYXRpb24gQ0EgLSBHMzEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMB4XDTE5MDUxODAxMzI1N1oXDTI0MDUxNjAxMzI1N1owXzElMCMGA1UEAwwcZWNjLXNtcC1icm9rZXItc2lnbl9VQzQtUFJPRDEUMBIGA1UECwwLaU9TIFN5c3RlbXMxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEwhV37evWx7Ihj2jdcJChIY3HsL1vLCg9hGCV2Ur0pUEbg0IO2BHzQH6DMx8cVMP36zIg1rrV1O/0komJPnwPE6OCAhEwggINMAwGA1UdEwEB/wQCMAAwHwYDVR0jBBgwFoAUI/JJxE+T5O8n5sT2KGw/orv9LkswRQYIKwYBBQUHAQEEOTA3MDUGCCsGAQUFBzABhilodHRwOi8vb2NzcC5hcHBsZS5jb20vb2NzcDA0LWFwcGxlYWljYTMwMjCCAR0GA1UdIASCARQwggEQMIIBDAYJKoZIhvdjZAUBMIH+MIHDBggrBgEFBQcCAjCBtgyBs1JlbGlhbmNlIG9uIHRoaXMgY2VydGlmaWNhdGUgYnkgYW55IHBhcnR5IGFzc3VtZXMgYWNjZXB0YW5jZSBvZiB0aGUgdGhlbiBhcHBsaWNhYmxlIHN0YW5kYXJkIHRlcm1zIGFuZCBjb25kaXRpb25zIG9mIHVzZSwgY2VydGlmaWNhdGUgcG9saWN5IGFuZCBjZXJ0aWZpY2F0aW9uIHByYWN0aWNlIHN0YXRlbWVudHMuMDYGCCsGAQUFBwIBFipodHRwOi8vd3d3LmFwcGxlLmNvbS9jZXJ0aWZpY2F0ZWF1dGhvcml0eS8wNAYDVR0fBC0wKzApoCegJYYjaHR0cDovL2NybC5hcHBsZS5jb20vYXBwbGVhaWNhMy5jcmwwHQYDVR0OBBYEFJRX22/VdIGGiYl2L35XhQfnm1gkMA4GA1UdDwEB/wQEAwIHgDAPBgkqhkiG92NkBh0EAgUAMAoGCCqGSM49BAMCA0kAMEYCIQC+CVcf5x4ec1tV5a+stMcv60RfMBhSIsclEAK2Hr1vVQIhANGLNQpd1t1usXRgNbEess6Hz6Pmr2y9g4CJDcgs3apjMIIC7jCCAnWgAwIBAgIISW0vvzqY2pcwCgYIKoZIzj0EAwIwZzEbMBkGA1UEAwwSQXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcNMTQwNTA2MjM0NjMwWhcNMjkwNTA2MjM0NjMwWjB6MS4wLAYDVQQDDCVBcHBsZSBBcHBsaWNhdGlvbiBJbnRlZ3JhdGlvbiBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9uIEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAATwFxGEGddkhdUaXiWBB3bogKLv3nuuTeCN/EuT4TNW1WZbNa4i0Jd2DSJOe7oI/XYXzojLdrtmcL7I6CmE/1RFo4H3MIH0MEYGCCsGAQUFBwEBBDowODA2BggrBgEFBQcwAYYqaHR0cDovL29jc3AuYXBwbGUuY29tL29jc3AwNC1hcHBsZXJvb3RjYWczMB0GA1UdDgQWBBQj8knET5Pk7yfmxPYobD+iu/0uSzAPBgNVHRMBAf8EBTADAQH/MB8GA1UdIwQYMBaAFLuw3qFYM4iapIqZ3r6966/ayySrMDcGA1UdHwQwMC4wLKAqoCiGJmh0dHA6Ly9jcmwuYXBwbGUuY29tL2FwcGxlcm9vdGNhZzMuY3JsMA4GA1UdDwEB/wQEAwIBBjAQBgoqhkiG92NkBgIOBAIFADAKBggqhkjOPQQDAgNnADBkAjA6z3KDURaZsYb7NcNWymK/9Bft2Q91TaKOvvGcgV5Ct4n4mPebWZ+Y1UENj53pwv4CMDIt1UQhsKMFd2xd8zg7kGf9F3wsIW2WT8ZyaYISb1T4en0dbmcubCYkhYQaZDwmSHQAAMYIBizCCAYcCAQEwgYYwejEuMCwGA1UEAwwlQXBwbGUgQXBwbGljYXRpb24gSW50ZWdyYXRpb24gQ0EgLSBHMzEmMCQGA1UECwwdQXBwbGUgQ2VydGlmaWNhdGlvbiBBdXRob3JpdHkxEzARBgNVBAoMCkFwcGxlIEluYy4xCzAJBgNVBAYTAlVTAghMMEFJUZ1UNjANBglghkgBZQMEAgEFAKCBlTAYBgkqhkiG9w0BCQMxCwYJKoZIhvcNAQcBMBwGCSqGSIb3DQEJBTEPFw0yMjAyMjMxMDMyMzFaMCoGCSqGSIb3DQEJNDEdMBswDQYJYIZIAWUDBAIBBQChCgYIKoZIzj0EAwIwLwYJKoZIhvcNAQkEMSIEIKELTeQBJkyBdJ9Ge0BlmVOTIqU4sV75S/aC6sJMIHxbMAoGCCqGSM49BAMCBEYwRAIgC0iKpRgZQE2vMCSczjMRe+4b0aqiO79D2d0+9CKMmA8CICnC+e7RBgIPVbA32ZsKOV8e3iTdvm1OaH/ABCDEFGHIJKL',
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
            } else if (this.preset === 'mit_installment') {
                this.isOtherPaymentMethod = false
                this.paytype = 'installment'

                this.isThreeDsData = false
                this.isBrowserInfo = false
                this.isCard = false

                this.includeURLSuccess = false
                this.includeURLFailure = false
                this.includeURLBack = false

                this.includeTransID = true
                this.generate_transid()
                this.includeAmount = true
                this.amount = '10000'
                this.includeCurrency = true
                this.currency = 'EUR'

                this.isOtherParameters = true
                this.otherparams = 'CCNr=4111111111111111&CCBrand=VISA&CCExpiry=202906&CCCVC=123&PayID=123123'
                // credentialOnFile is set by the 'installment' paytype's onSelect (watch.paytype), which
                // already matches the MIT Installment value and fires after this synchronous code runs.
            } else if (this.preset === 'mit_delayed_shipment') {
                this.isOtherPaymentMethod = false
                this.paytype = 'direct'

                this.includeURLSuccess = false
                this.includeURLFailure = false
                this.includeURLBack = false

                this.includeTransID = true
                this.generate_transid()
                this.includeAmount = true
                this.amount = '10000'
                this.includeCurrency = true
                this.currency = 'EUR'

                // The 'direct' paytype's watch.paytype handler sets isMsgVer2=true and its onSelect forces
                // isCard/isThreeDsData/isBrowserInfo true and resets otherparams; it fires asynchronously,
                // so override it via nextTick.
                this.$nextTick(() => {
                    this.isMsgVer2 = false
                    this.isCredentialOnFile = false
                    this.isCard = false
                    this.isThreeDsData = false
                    this.isBrowserInfo = false
                    this.otherparams = 'PayID=123123&industrySpecificTxType=Reauthorization'
                })
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
        setRecurringFixed() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2026-09-14","recurringExpiryDate":"2027-09-14"}},"initialPayment":true, "useCase": "fixed"}'
        },
        setRecurringFlexibleAmount() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2026-09-14","recurringExpiryDate":"2027-09-14"}},"initialPayment":true, "useCase": "flexibleAmount"}'
        },
        setRecurringFlexibleFrequency() {
            this.credentialOnFile = ''
            this.credentialOnFile = '{"type":{"recurring":{"recurringFrequency":30,"recurringStartDate":"2026-09-14","recurringExpiryDate":"2027-09-14"}},"initialPayment":true, "useCase": "flexibleFrequency"}'
        },
        setCofInitialPayment(value) {
            let parsed;
            try {
                parsed = JSON.parse(this.credentialOnFile);
            } catch (e) {
                parsed = { type: { unscheduled: 'CIT' } };
            }
            parsed.initialPayment = value;
            this.credentialOnFile = ''
            this.credentialOnFile = JSON.stringify(parsed);
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
            this.eventLog.log({
                page: 'Encryption',
                kind: 'request',
                aspx: this.replaceFrontEnd,
                url: this.testurl,
                params: data.split('&'),
            })
        },
        // Sends the current form as N direct.aspx calls, one after the other.
        // Every run is prepared the same way the Encrypt button prepares a single
        // request: buildParams() -> plaintext -> Blowfish, only with a fresh
        // TransID per run so Paygate does not reject the repeats as duplicates.
        async runBulk() {
            if (!this.canRunBulk) {
                return;
            }

            const total = Math.min(Math.max(Math.floor(Number(this.bulkCount) || 0), 1), BULK_RUN_MAX);
            this.bulkCount = total;
            this.bulkTotal = total;
            this.bulkCompleted = 0;
            this.bulkSucceeded = 0;
            this.bulkFailed = 0;
            this.bulkStatus = '';
            this.bulkStopRequested = false;
            this.isBulkRunning = true;

            let unreachable = false;

            try {
                for (let i = 0; i < total; i++) {
                    if (this.includeTransID) {
                        this.generate_transid();
                    }
                    if (this.isDuplicationCheck) {
                        this.duplicationOrderId = 'ORD' + this.random_digits(8);
                        this.duplicationInvoiceId = 'INV' + this.random_digits(8);
                    }

                    const plaintext = this.plaintext;
                    this.encryptData(plaintext);

                    const result = await this.sendDirectRequest(plaintext, this.encrypted_data);
                    this.bulkCompleted += 1;

                    if (result === 'ok') {
                        this.bulkSucceeded += 1;
                    } else {
                        this.bulkFailed += 1;
                    }

                    // a dead proxy fails every remaining run the same way, so stop
                    if (result === 'unreachable') {
                        unreachable = true;
                        break;
                    }
                    if (this.bulkStopRequested) {
                        break;
                    }
                }
            } finally {
                this.isBulkRunning = false;
            }

            this.bulkStatus = this.bulkStatusText(total, unreachable);
        },
        bulkStatusText(total, unreachable) {
            if (unreachable) {
                return PROXY_UNREACHABLE;
            }
            const failed = this.bulkFailed > 0 ? `, ${this.bulkFailed} failed` : '';
            if (this.bulkCompleted < total) {
                return `Stopped after ${this.bulkCompleted} of ${total}: ${this.bulkSucceeded} sent${failed}. Open the event log for details.`;
            }
            return `${this.bulkSucceeded} of ${total} sent${failed}. Open the event log for details.`;
        },
        stopBulk() {
            this.bulkStopRequested = true;
        },
        async sendDirectRequest(plaintext, data) {
            const query = new URLSearchParams({
                partner: this.auth.partner,
                environment: this.auth.environment,
                merchantid: this.auth.merchantid,
                aspx: 'direct',
                len: String(plaintext.length),
                data,
            });

            try {
                const res = await fetch(`/api/direct-proxy?${query.toString()}`);
                const json = await res.json();

                if (!res.ok) {
                    this.eventLog.log({
                        page: 'Encryption',
                        kind: 'error',
                        aspx: 'direct',
                        message: json.error || 'Request failed.',
                    });
                    return 'failed';
                }

                this.logResponse({ params: decryptResponseBody(json.body, this.auth.bf_password), raw: json.body });
                return 'ok';
            } catch (e) {
                this.eventLog.log({
                    page: 'Encryption',
                    kind: 'error',
                    aspx: 'direct',
                    message: PROXY_UNREACHABLE,
                });
                return 'unreachable';
            }
        },
        logResponse({ params, raw }) {
            this.eventLog.log({
                page: 'Encryption',
                kind: 'response',
                aspx: this.replaceFrontEnd,
                params,
                raw: params.length ? '' : raw,
                message: params.length ? '' : 'Could not decrypt response - raw body shown below.',
            })
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
        this.isSuggestionContactVisible = sessionStorage.getItem(SUGGESTION_CONTACT_DISMISSED_KEY) !== 'true'
        this.generate_transid()
        this.duplicationOrderId = 'ORD' + this.random_digits(8)
        this.duplicationInvoiceId = 'INV' + this.random_digits(8)
        document.addEventListener('mousedown', this.handleParentClick)
    },
    beforeUnmount() {
        document.removeEventListener('mousedown', this.handleParentClick)
        document.removeEventListener('keydown', this.handleTutorialKeydown)
        this.clearTutorialHighlight()
    },
    watch: {
        paytype(newVal) {
            this.orderdesc = `test:${newVal}`
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
        amount() {
            this.syncPaysslCustomField1()
        },
        currency() {
            this.syncPaysslCustomField1()
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
    max-width: 1200px;
    padding: 0 16px 90px;
}

.parameters {
    margin-top: 10px;
}

.title-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
}

.title-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 10px;
}

.floating-params-dock {
    margin-left: auto;
}

.tutorial-launch {
    padding: 4px 9px;
}

.tutorial-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    background: rgba(7, 22, 34, 0.76);
}

.tutorial-dialog {
    position: fixed;
    top: 72px;
    right: 24px;
    z-index: 104;
    width: min(380px, calc(100vw - 32px));
    padding: 20px;
    border: 1px solid #dce7ed;
    border-radius: 12px;
    background: white;
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.28);
}

.tutorial-dialog h4 {
    margin: 3px 0 8px;
    color: #1e5582;
    font-size: 17px;
}

.tutorial-dialog p {
    color: #405866;
    font-size: 13px;
    line-height: 1.5;
}

.tutorial-progress {
    color: #718691;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
}

.tutorial-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-top: 18px;
}

.tutorial-navigation {
    display: flex;
    align-items: center;
    gap: 8px;
}

.tutorial-stop {
    border: 0;
    background: transparent;
    color: #637985;
    cursor: pointer;
    font-size: 12px;
    text-decoration: underline;
}

.tutorial-next {
    padding: 6px 15px;
    font-size: 12px;
}

:global(.tutorial-highlight) {
    position: relative;
    z-index: 103;
    border-radius: 8px;
    background-color: white;
    box-shadow: 0 0 0 4px #a5f729, 0 8px 28px rgba(0, 0, 0, 0.35);
}

:global(.btn-primary.tutorial-highlight),
:global(.btn-primary.tutorial-highlight:disabled) {
    background-color: #a5f729;
    color: #1e5582;
}

:global(.action-bar.tutorial-layer) {
    z-index: 102;
}

@media (max-width: 640px) {
    .tutorial-dialog {
        top: auto;
        right: 16px;
        bottom: 16px;
        left: 16px;
        width: auto;
    }
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

.suggestion-contact {
    position: fixed;
    right: 18px;
    bottom: 76px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
    width: 190px;
}

.suggestion-contact-image {
    width: 92px;
    height: 92px;
    object-fit: cover;
    border: 3px solid #1e5582;
    border-radius: 50%;
    background: white;
    box-shadow: 0 5px 16px rgba(0, 0, 0, 0.22);
}

.suggestion-contact-image-wrapper {
    position: relative;
}

.suggestion-contact-close {
    position: absolute;
    top: -7px;
    right: -25px;
    padding: 3px 7px;
    border: 1px solid #1e5582;
    border-radius: 999px;
    background: white;
    color: #1e5582;
    box-shadow: 0 2px 7px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    font-size: 10px;
    font-weight: 600;
}

.suggestion-contact-close:hover {
    background: #f2f7fa;
}

.suggestion-contact-close:focus-visible {
    outline: 2px solid #1e5582;
    outline-offset: 2px;
}

.suggestion-contact-pill {
    padding: 6px 11px;
    border: 1px solid #d7e3e9;
    border-radius: 999px;
    background: white;
    color: #1e5582;
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.16);
    font-size: 11px;
    font-weight: 600;
    line-height: 1.25;
    text-align: center;
}

@media (max-width: 760px) {
    .suggestion-contact {
        right: 10px;
        bottom: 84px;
        width: 150px;
    }

    .suggestion-contact-image {
        width: 70px;
        height: 70px;
    }
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
    flex-wrap: wrap;
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

.bulk-run {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    padding-left: 16px;
    border-left: 1px solid #d4d4d4;
}

.bulk-run-field {
    display: flex;
    align-items: center;
    gap: 6px;
}

.bulk-run-label {
    font-size: 12px;
    font-weight: 600;
    color: #1e5582;
}

.bulk-run-input {
    width: 68px;
    padding: 8px;
    text-align: right;
}

.bulk-run-button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

.bulk-run-button:disabled {
    background-color: #8ba6bd;
    cursor: not-allowed;
}

.bulk-run-status {
    flex-basis: 100%;
    font-size: 11px;
    color: #4a4a4a;
}

.bulk-run-status-error {
    color: #d12f2f;
}

.spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.4);
    border-top-color: white;
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

@media (max-width: 640px) {
    .bulk-run {
        padding-left: 0;
        border-left: none;
    }
}
</style>
