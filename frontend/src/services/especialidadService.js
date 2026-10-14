import api from './api';

export const especialidadService = {
    listar: async (params = {}) => {
        const response = await api.get('/especialidades', { params });
        return response.data;
    },

    obtener: async (codigo) => {
        const response = await api.get(`/especialidades/${encodeURIComponent(codigo)}`);
        return response.data.data;
    },

    registrar: async (datos) => {
        const response = await api.post('/especialidades', datos);
        return response.data;
    },

    actualizar: async (codigo, datos) => {
        const response = await api.put(`/especialidades/${encodeURIComponent(codigo)}`, datos);
        return response.data;
    },

    eliminar: async (codigo) => {
        const response = await api.delete(`/especialidades/${encodeURIComponent(codigo)}`);
        return response.data;
    },
};