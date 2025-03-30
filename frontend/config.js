function loadEnv() {
    return {
        API_URL: '%%API_URL%%'
    };
}

const config = {
    API_URL: loadEnv().API_URL.includes('%%') ? 'http://localhost:3000' : loadEnv().API_URL
};