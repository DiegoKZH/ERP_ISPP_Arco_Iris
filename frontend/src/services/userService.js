import api from './api';

export const userService = {
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data.data;
    },
    
    createUser: async (userData) => {
        const response = await api.post('/users', userData);
        return response.data.data;
    },
    
    updateUser: async (id, userData) => {
        const response = await api.put(`/users/${id}`, userData);
        return response.data.data;
    },
    
    toggleStatus: async (id) => {
        const response = await api.patch(`/users/${id}/toggle-status`);
        return response.data;
    }
};
