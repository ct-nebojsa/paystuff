<template>
    <div class="navbar-wrapper">
    <ul class="navbar">
        <li><router-link to="/">Encryption</router-link></li>
        <li><router-link to="/decrypt">Decryption</router-link></li>
        <li>Other actions</li>
    </ul>
</div>
</template>

<script></script>

<style scoped>
a {
    text-decoration: none;
    color: white;
}
.navbar-wrapper {
    margin: auto;
    width: 1500px;
    text-align: center;
}

.navbar {
    display: flex;
    list-style: none;
}

li {
    width: 130px;
    background-color: #1e5582;
    color: white;
    padding: 10px 30px 10px 30px;
    text-align: center;
}

li:hover {
    text-decoration: underline;
}


</style>