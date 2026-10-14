import api from './api';

const ENDPOINT = '/nombre-ruta'; // Ej: '/especialidades', '/alumnos', '/cursos'

export const nombreModuloService = {
    listar: async (params = {}) => {
        const response = await api.get(ENDPOINT, { params });
        return response.data;
    },

    obtener: async (idOCodigo) => {
        const response = await api.get(`${ENDPOINT}/${encodeURIComponent(idOCodigo)}`);
        return response.data.data ?? response.data;
    },

    registrar: async (datos) => {
        const response = await api.post(ENDPOINT, datos);
        return response.data;
    },

    actualizar: async (idOCodigo, datos) => {
        const response = await api.put(`${ENDPOINT}/${encodeURIComponent(idOCodigo)}`, datos);
        return response.data;
    },

    eliminar: async (idOCodigo) => {
        const response = await api.delete(`${ENDPOINT}/${encodeURIComponent(idOCodigo)}`);
        return response.data;
    },
};