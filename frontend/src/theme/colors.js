/**
 * THEME_COLORS — Paleta de colores centralizada del ERP Instituto.
 *
 * Todos los componentes que necesiten colores personalizados deben importar
 * desde este archivo en lugar de definir constantes locales.
 *
 * Uso:
 *   import { THEME_COLORS } from '@/theme/colors';
 */
export const THEME_COLORS = {
    // Primarios
    primary: '#1976d2',
    primaryHover: '#1565c0',

    // Secundarios
    secondary: '#475569',
    secondaryHover: '#334155',

    // Fondos y superficies
    background: '#f8fafc',
    surface: '#ffffff',

    // Texto
    textPrimary: '#0f172a',
    textSecondary: '#64748b',

    // Bordes
    border: '#e2e8f0',

    // Error
    error: '#d32f2f',
    errorBg: '#ffebee',
    errorLight: '#fef2f2',
    errorText: '#991b1b',

    // Éxito
    success: '#2e7d32',
    successLight: '#f0fdf4',
    successText: '#166534',

    // Información
    info: '#0284c7',
    infoLight: '#e0f2fe',
    infoText: '#0369a1',
};

