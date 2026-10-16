import api from './api';

export const seccionService = {
    // Listar todas las secciones o filtrar por carrera
    listar: async (params = {}) => {
        const response = await api.get('/secciones', { params });
        return response.data;
    },

    // Obtener detalle de una sección por su código
    obtener: async (codigo) => {
        const response = await api.get(`/secciones/${encodeURIComponent(codigo)}`);
        return response.data.data;
    },

    // Registrar sección general
    registrar: async (datos) => {
        const response = await api.post('/secciones', datos);
        return response.data;
    },

    // Registrar sección asociándola a una carrera/especialidad puntual
    registrarEnCarrera: async (datos) => {
        // Envía el payload con código de carrera/especialidad
        const response = await api.post('/secciones', {
            codigo: datos.codigo,
            nombre: datos.nombre,
            estado: datos.estado || 'ACTIVO',
            carrera_id: datos.carrera_id || datos.especialidad_codigo,
            especialidad_codigo: datos.especialidad_codigo || datos.carrera_id,
        });
        return response.data;
    },

    // Actualizar datos de la sección
    actualizar: async (codigo, datos) => {
        const response = await api.put(`/secciones/${encodeURIComponent(codigo)}`, datos);
        return response.data;
    },

    // Eliminar sección global por código
    eliminar: async (codigo) => {
        const response = await api.delete(`/secciones/${encodeURIComponent(codigo)}`);
        return response.data;
    },

    // Eliminar o desvincular sección de una carrera específica
    eliminarDeCarrera: async (carreraCodigo, seccionCodigo) => {
        const response = await api.delete(`/secciones/${encodeURIComponent(seccionCodigo)}`, {
            params: { 
                carrera_id: carreraCodigo,
                especialidad_codigo: carreraCodigo 
            }
        });
        return response.data;
    },
};