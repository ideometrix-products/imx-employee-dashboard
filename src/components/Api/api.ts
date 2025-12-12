import axios from 'axios';
const stage = 'prod';
const url = {
    dev: '/api/v1', // Use relative URL for development with Vite proxy
    prod: 'https://api.ideometrix.com/api/v1'
};
const BASE_URL = url[stage];
export const Instance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});
Instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
