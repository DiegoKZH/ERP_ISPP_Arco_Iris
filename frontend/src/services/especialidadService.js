import axios from 'axios';

// Instancia o ruta base de tu API Laravel
const API_URL = 'http://localhost:8000/api'; 

export const especialidadService = {
    listar: async (params) => {
        const response = await axios.get(`${API_URL}/especialidades`, { 
            params,
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}` // O tu forma de autenticación con Sanctum
            }
        });
        return response.data;
    },

    registrar: async (datos) => {
        const response = await axios.post(`${API_URL}/especialidades`, datos, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    actualizar: async (id, datos) => {
        const response = await axios.put(`${API_URL}/especialidades/${id}`, datos, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    },

    eliminar: async (id) => {
        const response = await axios.delete(`${API_URL}/especialidades/${id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        });
        return response.data;
    }
};