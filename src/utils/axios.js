import axiosy from 'axios';
/**
 * Стаднартная настройка для ajax запросов
 */
let axios = axiosy.create({
    params: {
        // viewer_id: $_GET["viewer_id"],
        // access_token: $_GET["access_token"],
        // auth_key: $_GET["auth_key"]
    },
    baseURL: process.env.NODE_ENV === 'production'? "" : "http://shop.local/"
});

export default axios;