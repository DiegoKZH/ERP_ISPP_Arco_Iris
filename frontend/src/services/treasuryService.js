import api from './api';

export const treasuryService = {
    /**
     * Listar pagos y postulaciones para control de tesorería y cobranzas.
     */
    getPagos: async (params = {}) => {
        const response = await api.get('/tesoreria/pagos-admision', { params });
        return response.data;
    },

    /**
     * Consultar postulación por DNI / Código de Tesorería.
     */
    consultarDni: async (dni) => {
        const response = await api.get(`/tesoreria/pagos-admision/consultar/${dni}`);
        return response.data.data;
    },

    /**
     * Registrar abono en tesorería y emitir / habilitar número de FUT.
     */
    registrarPago: async (postulacionId, data) => {
        const response = await api.post(`/tesoreria/pagos-admision/${postulacionId}/registrar-pago`, data);
        return response.data;
    },
};
