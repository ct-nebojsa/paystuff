<template>
    <div
        style="width: 100%; background-color: #141932; display: flex; align-items: center; justify-content: flex-start;">
        <div style="margin: 0; padding: 10px 0;">
            <div style="margin: 0;">
                <a href="/" target="_blank"><img src="@/assets/images/logo/Logo.svg" width="60%" alt=""></a>
            </div>
        </div>
        <div class="navbar-wrapper">
            <ul class="navbar">
                <li><router-link to="/">Encryption</router-link></li>
                <li><router-link to="/decrypt">Decryption</router-link></li>
                <li><router-link to="/other">Other actions</router-link></li>
                <li @click="routeTo('cb2a')">CB2A</li>
            </ul>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        routeTo(name) {
            this.$router.push({ name: name })
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

a {
    text-decoration: none;
    color: white;
    width: 150px;
    display: flex;
}

.navbar-wrapper {
    margin: 0;
    text-align: center;
    display: flex;
}

.navbar {
    display: flex;
    list-style: none;
    margin: auto;
}

li {
    width: 120px;
    color: white;
    cursor: pointer;
    text-align: center;
}

li:hover {
    text-decoration: underline;
}
</style>