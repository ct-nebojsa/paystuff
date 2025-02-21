<template>
    
    <div v-if="!this.auth.isAuthenticated" class="modal-overlay">
        <div class="modal-content">
            <h2 style="margin-bottom: 10px; user-select: none;">Login</h2>
            <p style="margin-bottom: 5px;">
                <strong style="display: inline-block; width: 150px;">Username:</strong>
                <input class="simple-input" v-model="username" type="text">
            </p>
            <p style="margin-bottom: 5px;">
                <strong style="display: inline-block; width: 150px;">Password:</strong>
                <input class="simple-input" v-model="password" type="password">
            </p>
            <div>
                <div style="display: flex; flex-direction: column; text-align: center;">
                <button v-if="this.username.length > 0 && this.password.length > 0" class="simple-button" @click="login">Login</button>
                <button v-else class="simple-button-disabled">Login</button>
                <span style="color: red; font-weight: 500; display: inline-block; margin-top: 10px;">{{ errorMessage }}</span>
                {{ auth }}
            </div>
            </div>
        </div>
    </div>
</template>

<script>
import useAuthStore from '@/stores/auth.js'
export default {
    data() {
        return {
            auth: useAuthStore(),
            username: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_USERNAME : '',
            password: import.meta.env.VITE_ENVIRONMENT === 'development' ? import.meta.env.VITE_PASSWORD : '',
            errorMessage: '',
        }
    },
    methods: {
        login() {
            if (this.username === this.auth.username && this.password === this.auth.password) {
                this.auth.isAuthenticated = true 
            } else [
                this.errorMessage = 'Check your credentials'
            ]
        },
    },
    mounted() {
        // this.auth.isAuthenticated
    }

}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    /* Semi-transparent background */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    backdrop-filter: blur(10px);
    /* Apply blur effect */
    -webkit-backdrop-filter: blur(40px);
    /* For Safari */
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    width: 400px;
    max-width: 90%;
    position: relative;
    text-align: center;
}

.simple-input {
    padding: 5px;
    border-color: #c1c1c1;
    border-width: 1px;
    outline: none;
    border-radius: 5px;
}

.simple-button {
    margin: auto;
    margin-top: 10px;
    padding: 10px 30px 10px 30px;
    background-color: #1e5582;
    color: white;
    cursor: pointer;
    border: none;
    border-radius: 5px;
    width: 150px;
    text-align: center;
}

.simple-button-disabled {
    margin: auto;
    margin-top: 10px;
    padding: 10px 30px 10px 30px;
    background-color: #ececec;
    color: white;
    cursor: not-allowed;
    border: none;
    border-radius: 5px;
    width: 150px;
    text-align: center;
}
</style>