import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', {
    state: () => ({
        merchantid: null,
        bf_password: null,
        hmac_password: null,
        partner: 'computop',
        environment: 'test'
    }),

    getters: {
        getMerchantid: (state) => state.merchantid,
        getBfpassword: (state) => state.bf_password,
        getHmacpassword: (state) => state.hmac_password,
    },

    persist: true,
});

export default useAuthStore;
