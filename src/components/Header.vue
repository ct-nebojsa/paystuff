<template>
    <div v-if="auth.isAuthenticated" class="header-wrapper">
        User:
        {{ this.auth.getUsername }}
        <button class="logout-button" @click="logout">Logout</button>
    </div>
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
        }
    }
}
</script>

<style scoped>
.header-wrapper {
    margin: auto;
    width: 2000px;
    background-color: #1e5582;
    color: white;
    text-align: right;
    padding: 4px 0 4px 0;
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
</style>