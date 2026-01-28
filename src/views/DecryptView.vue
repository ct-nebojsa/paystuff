<template>
    <div class="decrypt-wrapper">
        <div class="decrypt">
            <h2 style="color: #1e5582; font-weight: 700;">Test Paygate Decryption</h2>
            <p style="margin: 10px 0 10px 0; color: #1e5582;">Data is not stored on any server.</p>
            <div class="data-wrapper">
                <p style="width: 150px; text-align: right; margin-right: 10px;">Data</p>
                <textarea class="custom-width" v-model="encryptedData"></textarea>
                <p style="margin-left: 10px;">Encrypted Data only <span class="info-span" title="Textbox should contain only encrypted data (without Data=) and not Len+Data">?</span></p>
            </div>
            <div style="display: flex; margin-top: 10px;">
                <p style="width: 150px; text-align: right; margin-right: 10px;">Encryption password:</p>
                <input class="simple-input" type="text" v-model="this.auth.bf_password">
            </div>
            <div style="margin-top: 10px; text-align: center;">
                <button class="simple-button" @click="decryptData(encryptedData)">Decrypt</button>
            </div>
        </div>
        <div v-if="isDecrypted" class="decrypt">
        <p v-for="parameter in this.decryptedDataArray" :key="parameter.id">{{ parameter }}</p>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue'
import CryptoJS from "crypto-js";
import useAuthStore from '@/stores/auth.js'
export default {
    data() {
        return {
            auth: useAuthStore(),
            encryptedData: '',
            decryptedData: '',
            decryptedDataArray: [],
            isDecrypted: false,
            // secret_test: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_SECRET : '',
        }
    },
    components: {
        Header,
        Navbar
    },
    methods: {
        decryptData(encryptedData) {
            const decrypted = CryptoJS.Blowfish.decrypt(
                { ciphertext: CryptoJS.enc.Hex.parse(encryptedData) },
                CryptoJS.enc.Utf8.parse(this.auth.bf_password),
                {
                    mode: CryptoJS.mode.ECB,
                    padding: CryptoJS.pad.Pkcs7
                }
            );
            this.decryptedData = decrypted.toString(CryptoJS.enc.Utf8);
            this.decryptedDataArray = this.decryptedData.split('&')
            this.isDecrypted = true
        }

    },
    // mounted() {
    //     this.secret_test = this.auth.getBfpassword
    // }
}
</script>

<style scoped>
.decrypt-wrapper {
    width: 2100px;
    display: flex;
    margin: auto;
    flex-direction: column;
}

.decrypt {
    margin: auto;
    width: 850px;
    border-radius: 10px;
    background-color: white;
    padding: 20px;
    margin-top: 10px;
}

.data-wrapper {
    display: flex;
}

textarea {
    padding: 5px;
    outline: none;
    border-radius: 5px;
    border-width: 1px;
    border-color: #c7c7c7;
    resize: none;
    height: 250px;
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

.custom-width {
    width: 500px;
}

.simple-button {
    border: none;
    background-color: #a5f729;
    border-radius: 5px;
    padding: 10px 25px 10px 25px;
    cursor: pointer;
    font-size: 16px;
    color: #1e5582;
    font-weight: 600;
}

.info-span {
    background-color: #1e5582;
    border-radius: 20px;
    color: white;
    width: 20px;
    height: 20px;
    display: flex;
    text-align: center;
    justify-content: center;
    cursor: help;
}
</style>