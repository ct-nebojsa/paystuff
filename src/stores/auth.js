// Change the export to default
import { defineStore } from 'pinia';

const useAuthStore = defineStore('auth', {
    state: () => ({
        isAuthenticated: false,
        username: 'ct_productmanagement',
        password: 'kogDwjYjVUTX8Gp8HHqv',
        merchantid: null,
        bf_password: null,
    }),

    actions: {
        logout() {
            this.username = null;
            this.isAuthenticated = false;
            this.merchantid = null;
            this.bf_password = null;
        },
    },

    getters: {
        getUsername: (state) => state.username,
        getPassword: (state) => state.password,
        getMerchantid: (state) => state.merchantid,
        getBfpassword: (state) => state.bf_password,
        isLoggedIn: (state) => state.isAuthenticated,
    },

    persist: true,
});

export default useAuthStore;  // Default export
