
import api from './api';

export const alumnoService = {
    listar: async (params = {}) => {
        const response = await api.get('/alumnos', { params });
        return response.data;
    },

    obtener: async (id) => {
        const response = await api.get(`/alumnos/${id}`);
        return response.data.data;
    },

    registrar: async (datos) => {
        const response = await api.post('/alumnos', datos);
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await api.put(`/alumnos/${id}`, datos);
        return response.data;
    },
};