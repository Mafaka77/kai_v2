const axios = require('axios');
const api = axios.create({ baseURL: 'http://192.168.0.221:5001/web' });
console.log(api.getUri({ url: '/auth/login' }));
