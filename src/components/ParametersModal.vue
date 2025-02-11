<template>
    <div class="parameters-wrapper">
        <div class="close-button-wrapper"><button class="close-button"
                @click="this.$emit('close')"><strong>X</strong></button>
            </div>
            <div>
                <h3 style="color: #1e5582; text-align: center; margin-bottom: 10px;">Click on a desired parameter - it will be added to Other parameters field</h3>
            </div>
        <div>
            <button class="simple-button" v-for="parameter in parameters"
                @click="this.$emit('setparameter', parameter)">{{ parameter }}</button>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            parameters: [
               "AccessToken", "Account", "AccountId", "AccOwner", "AccType", "AccVerify",
                "AddrCity",
                "AddressAddition", "AddressAddition2", "AddrStreet", "AddrStreet2",
                "AddrStreet3", "AddrStreetNr", "AddrStreetNr2", "AddrZIP",
                 "ArticleList", "ArticleList1", "ArticleList10", "ArticleList2", "ArticleList3", "ArticleList4",
                "ArticleList5", "ArticleList6", "ArticleList7", "ArticleList8", "ArticleList9", "ArticleNr",
                "bdAddressAddition", "bdCity",
                "bdCompanyOrPerson", "bdCountryCode", "bdCustomerId", "bdDateOfBirth", "bdDeviceToken", "bdDistrict",
                "bdEmail", "bdFax", "bdFirstName", "bdLastName", "bdMaidenName", "bdMiddleName", "bdMobileNr", "bdPhone",
                "bdPOBox", "bdSalutation", "bdState", "bdStreet", "bdStreet2", "bdStreetNr", "bdSuffix", "bdTaxNumber",
                "bdTitle", "bdZIP", "Brand", "Capture", "Card",
                "CardNumber", "CcBrand", "CCCVC", "CCExpiry", "CCNr", "CCNrEnc", "ccStartDate",
                "Channel", "ChargeAmount", "CHDesc", "CountryCode", "CustomerID", "delayedshipment",
                "DtOfSgntr", "DueDate", "Email", "Enddate", "EntryMode", "ETIID", "Event", "EventToken", "Expiration", "ExpirationDate", "ExpirationTime",
                "Expiry", "FirstName", "Gender", "Homepage", "IBAN", "industrySpecificTxType",
                "InvoiceNr", "InvoiceText", "IPAddr",
                "Language", "LastName", "LocalAmount", "LocalCurrency", "MAC", 
                "MandateID", "MobileNet", "MobileNr", "Month", "Name", "PayID",
                "PayType", "Phone", "PhoneAreaCode", "schemeReferenceID"
            ]
        }
    },
    emits: ['close']
}
</script>

<style scoped>
.parameters-wrapper {
    position: absolute;
    background-color: white;
    padding: 10px;
    width: 800px;
    top: 10%;
    left: 30%;
    border: solid;
    border-width: 1px;
    border-color: #1e5582;
    border-radius: 10px;
}

.simple-button {
    background-color: #a5f729;
    border: none;
    border-radius: 5px;
    margin-right: 5px;
    padding: 3px 6px;
    margin-top: 2px;
    font-size: 12px;
    color: #1e5582;
}

.simple-button:hover {
    cursor: pointer;
    text-decoration: underline;
}

.close-button-wrapper {
    margin: 5px 0;
    display: flex;
    justify-items: right;
    text-align: right;
    justify-content: right;
}

.close-button {
    width: 20px;
    height: 20px;
    border-radius: 50px;
    background-color: #1e5582;
    padding: 5px;
    color: white;
    display: flex;
    border: none;
    align-items: center;
    cursor: pointer;
}
</style>