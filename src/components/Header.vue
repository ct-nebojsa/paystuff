<template>
    <header class="header-bar">
        <a class="logo-link" href="/" target="_blank"><img class="logo" src="@/assets/images/logo/Logo.svg"
                alt="Computop"></a>
        <nav class="navbar-wrapper">
            <ul class="navbar">
                <li><router-link to="/">Encryption</router-link></li>
                <li><router-link to="/decrypt">Decryption</router-link></li>
                <li><router-link to="/other">Other actions</router-link></li>
                <li><router-link to="/quick-testing">Quick testing</router-link></li>
                <li><router-link to="/cb2a-builder">CB2A</router-link></li>
            </ul>
        </nav>
        <div class="header-spacer" aria-hidden="true"></div>
    </header>
</template>

<script>
export default {
}
</script>

<style scoped>
.header-bar {
    width: 100%;
    background-color: #141932;
    display: flex;
    align-items: center;
    padding: 8px 20px;
    gap: 16px;
    box-shadow: 0 1px 0 rgba(0, 0, 0, 0.35);
}

.logo-link {
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.logo {
    height: 34px;
    width: auto;
}

.header-spacer {
    /* mirrors the logo so the centered nav stays truly centered */
    flex-shrink: 1;
    width: 120px;
}

.navbar-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 0;
}

.navbar {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    list-style: none;
    gap: 6px;
}

.navbar a {
    display: block;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.75);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.01em;
    white-space: nowrap;
    padding: 7px 16px;
    border-radius: 6px;
    transition: background-color 0.15s ease, color 0.15s ease;
}

.navbar a:hover {
    color: #ffffff;
    background-color: rgba(255, 255, 255, 0.08);
}

.navbar a:focus-visible {
    outline: 2px solid #a5f729;
    outline-offset: 2px;
}

.navbar a.router-link-active {
    background-color: #a5f729;
    color: #1e5582;
    font-weight: 600;
}

@media (max-width: 640px) {
    .header-bar {
        flex-direction: column;
        gap: 8px;
        padding: 10px 12px;
    }

    .header-spacer {
        display: none;
    }

    .navbar a {
        padding: 6px 12px;
    }
}
</style>
