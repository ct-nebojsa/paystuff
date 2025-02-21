<template>
    <div style="width: 100%; background-color: #141932; display: flex;">
        <div style="width: 2000px; margin: auto; display: flex; padding: 10px 0;">
            <div>
                <a href="https://computop.com/de/" target="_blank"><img src="@/assets/images/logo/Logo.svg" width="60%" alt=""></a>
            </div>
            <div v-if="auth.isAuthenticated" class="header-wrapper">
                User:
                {{ this.auth.getUsername }}
                <button class="logout-button" @click="logout">Logout</button>
            </div>
        </div>
    </div>
    <!-- <div class="debug">
    {{ auth.getMerchantid }}<span>/</span>{{ auth.getBfpassword }}
</div> -->
</template>

<script>
import useAuthStore from '@/stores/auth';
export default {
    data() {
        return {
            auth: useAuthStore(),
        }
    },
    methods: {
        logout() {
            this.auth.isAuthenticated = false
            this.auth.bf_password = null
        }
    }
}
</script>

<style scoped>
.header-wrapper {
    margin: auto;
    width: 2000px;
    background-color: #141932;
    color: white;
    text-align: right;
    padding: 4px 0 4px 0;
    position: relative;
}

.logout-button {
    border: none;
    background-color: #a5f729;
    padding: 3px 10px 3px 10px;
    border-radius: 4px;
}

.logout-button:hover {
    text-decoration: underline;
    cursor: pointer;
}

.debug {
    position: absolute;
    color: white;
    top: 0;
}
</style>