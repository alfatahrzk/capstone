const isLocal =
    window.location.hostname === "127.0.0.1"
    || window.location.hostname === "localhost";


window.APP_CONFIG = Object.freeze({

    API_BASE_URL: isLocal
        ? "http://127.0.0.1:8000"
        : "https://NAMA-BACKEND.onrender.com",

});