<template>
    <div class="decrypt-wrapper">
        <div class="card decrypt">
            <h2 class="page-title">Test Paygate Decryption</h2>
            <p class="warning-text">Data is not stored on any server.</p>
            <div class="subsection data-wrapper">
                <p class="field-label w-37.5!">Data</p>
                <textarea class="field-textarea custom-width" v-model="encryptedData"></textarea>
                <p>Encrypted Data only <span class="info-span" title="Textbox should contain only encrypted data (without Data=) and not Len+Data">?</span></p>
            </div>
            <div class="field-row mt-2.5">
                <p class="field-label w-37.5!">Encryption password:</p>
                <input class="field-input" type="text" v-model="this.auth.bf_password">
            </div>
            <div class="field-row mt-2.5">
                <p class="field-label w-37.5!">Len (optional):</p>
                <input class="field-input" type="text" v-model="len"
                    placeholder="Len value received with the Data">
            </div>
            <div class="mt-2.5 text-center">
                <button class="btn-primary" @click="decryptData(encryptedData)">Decrypt</button>
            </div>
        </div>
        <div v-if="isDecrypted" class="card decrypt">
            <p v-for="parameter in this.decryptedDataArray" :key="parameter.id">{{ parameter }}</p>
        </div>
    </div>
</template>

<script>
import Header from '@/components/Header.vue';
import Navbar from '@/components/Navbar.vue'
import useAuthStore from '@/stores/auth.js'
import { decryptBlowfish } from '@/utils/blowfish.js'
export default {
    data() {
        return {
            auth: useAuthStore(),
            encryptedData: '',
            decryptedData: '',
            decryptedDataArray: [],
            isDecrypted: false,
            len: '',
            // secret_test: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_TEST_SECRET : '',
        }
    },
    components: {
        Header,
        Navbar
    },
    methods: {
        decryptData(encryptedData) {
            this.decryptedData = decryptBlowfish(encryptedData, this.auth.bf_password, parseInt(this.len, 10) || 0);
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
    width: 100%;
    max-width: 900px;
    display: flex;
    margin: auto;
    margin-top: 20px;
    flex-direction: column;
    gap: 20px;
    padding: 0 16px;
}

.decrypt {
    margin: auto;
}

.data-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 10px;
}

textarea {
    resize: none;
    height: 250px;
    font-size: 11px;
}

.custom-width {
    width: 100%;
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