import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // Ajustar según el entorno en el futuro
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Remove token and redirect to login if unauthorized
            localStorage.removeItem('auth_token');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
