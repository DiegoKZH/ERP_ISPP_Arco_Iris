import api from './api';

export const admissionService = {
    /**
     * Get admission processes.
     */
    getProcesos: async (params = {}) => {
        const response = await api.get('/admision/procesos', { params });
        return response.data;
    },

    /**
     * Get single admission process.
     */
    getProceso: async (id) => {
        const response = await api.get(`/admision/procesos/${id}`);
        return response.data.data;
    },

    /**
     * Crear nueva convocatoria de admisión con los 2 programas autorizados.
     */
    createProceso: async (data) => {
        const response = await api.post('/admision/procesos', data);
        return response.data;
    },

    /**
     * Alternar estado entre Convocatoria Abierta y Convocatoria Cerrada.
     */
    toggleEstadoProceso: async (id) => {
        const response = await api.patch(`/admision/procesos/${id}/toggle-estado`);
        return response.data;
    },

    /**
     * Get list of applicant applications.
     */
    getPostulaciones: async (params = {}) => {
        const response = await api.get('/admision/postulaciones', { params });
        return response.data;
    },

    /**
     * Consultar postulación o datos de persona por DNI para reanudar el flujo.
     */
    consultarPorDni: async (dni, procesoId = null) => {
        const params = procesoId ? { admision_proceso_id: procesoId } : {};
        const response = await api.get(`/admision/postulaciones/consultar-dni/${dni}`, { params });
        return response.data;
    },

    /**
     * Eliminar postulación y liberar cupo correlativo y número de FUT.
     */
    deletePostulacion: async (id) => {
        const response = await api.delete(`/admision/postulaciones/${id}`);
        return response.data;
    },

    /**
     * Register a new applicant (creates/updates Persona & registers Postulacion).
     */
    createPostulacion: async (data) => {
        const response = await api.post('/admision/postulaciones', data);
        return response.data;
    },

    /**
     * Get merit table / admission results for a process.
     */
    getCuadroMerito: async (procesoId, params = {}) => {
        const response = await api.get(`/admision/procesos/${procesoId}/cuadro-merito`, { params });
        return response.data;
    },

    /**
     * Grade applicant across evaluations.
     */
    calificarPostulante: async (postulacionId, data) => {
        const response = await api.post(`/admision/postulaciones/${postulacionId}/calificar`, data);
        return response.data;
    },

    /**
     * Issue official admission certificate for admitted applicant.
     */
    emitirConstancia: async (postulacionId) => {
        const response = await api.post(`/admision/postulaciones/${postulacionId}/emitir-constancia`);
        return response.data;
    },

    /**
     * Paso 1 y 2: Pre-inscripción de postulante y código de tesorería (DNI).
     */
    preInscribir: async (data) => {
        const response = await api.post('/admision/postulaciones/pre-inscribir', data);
        return response.data;
    },

    /**
     * Paso 3: Retorno de tesorería (pagado/válido) y emisión de número de FUT.
     */
    validarPago: async (postulacionId, data) => {
        const response = await api.post(`/admision/postulaciones/${postulacionId}/validar-pago`, data);
        return response.data;
    },

    /**
     * Paso 4: Completar datos escolares (colegio/código modular) y expediente documentario.
     */
    completarExpediente: async (postulacionId, data) => {
        const response = await api.post(`/admision/postulaciones/${postulacionId}/completar-expediente`, data);
        return response.data;
    },

    /**
     * Paso 5: Obtener datos oficiales para el FUT.
     */
    getFutDocumento: async (postulacionId) => {
        const response = await api.get(`/admision/postulaciones/${postulacionId}/fut-documento`);
        return response.data;
    },

    /**
     * Paso 5: Obtener datos oficiales para la Declaración Jurada de Antecedentes.
     */
    getDeclaracionJurada: async (postulacionId) => {
        const response = await api.get(`/admision/postulaciones/${postulacionId}/declaracion-jurada`);
        return response.data;
    },

    /**
     * URLs para vista imprimible A4 / PDF
     */
    getFutPrintUrl: (postulacionId) => `/documentos/fut/${postulacionId}`,
    getDeclaracionPrintUrl: (postulacionId) => `/documentos/declaracion-jurada/${postulacionId}`,

    /**
     * Transfer admitted applicant into formal student in Academic module.
     */
    ratificarMatricula: async (postulacionId) => {
        const response = await api.post(`/admision/postulaciones/${postulacionId}/ratificar-matricula`);
        return response.data;
    },
};

