import axios from 'axios';

const Api = axios.create({
    baseURL: "https://localhost:8080/api/v1",
});

export default Api;