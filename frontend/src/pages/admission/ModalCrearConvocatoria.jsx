import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Grid,
    Box,
    Typography,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Chip,
} from '@mui/material';
import { Calendar, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';

export default function ModalCrearConvocatoria({ open, onClose, onSuccess }) {
    const currentYear = new Date().getFullYear();

    const [form, setForm] = useState({
        nombre: `Proceso de Admisión Ordinario ${currentYear}-II`,
        codigo: `ADM-${currentYear}-2`,
        fecha_inicio_inscripcion: new Date().toISOString().split('T')[0],
        fecha_fin_inscripcion: '',
        fecha_evaluacion: '',
        fecha_publicacion_resultados: '',
        puntaje_minimo_aprobatorio: '11.00',
        estado: 'CONVOCATORIA_ABIERTA',
        vacantes_inicial: 30,
        vacantes_fisica: 30,
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await admissionService.createProceso(form);
            onSuccess?.(res.data);
            onClose();
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al crear la convocatoria de admisión.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                backgroundColor: THEME_COLORS.primaryLight,
                                color: THEME_COLORS.primary,
                                p: 1,
                                borderRadius: 2,
                                display: 'flex',
                            }}
                        >
                            <Calendar size={22} />
                        </Box>
                        <Box>
                            <Typography variant="h6" fontWeight={700} color={THEME_COLORS.textPrimary}>
                                Crear Nueva Convocatoria de Admisión
                            </Typography>
                            <Typography variant="body2" color={THEME_COLORS.textSecondary}>
                                Programación oficial del proceso. Oferta académica restringida a los 2 programas autorizados.
                            </Typography>
                        </Box>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 3, backgroundColor: '#fcfdfd' }}>
                    {errorMsg && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            {errorMsg}
                        </Alert>
                    )}

                    <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 2 }}>
                        1. Datos Generales de la Convocatoria
                    </Typography>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={8}>
                            <TextField
                                label="Nombre de la Convocatoria *"
                                name="nombre"
                                value={form.nombre}
                                onChange={handleChange}
                                required
                                fullWidth
                                size="small"
                                placeholder="Ej. Proceso de Admisión Ordinario 2026-II"
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                label="Código Único *"
                                name="codigo"
                                value={form.codigo}
                                onChange={handleChange}
                                required
                                fullWidth
                                size="small"
                                placeholder="Ej. ADM-2026-2"
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="date"
                                label="Fecha Inicio Inscripciones *"
                                name="fecha_inicio_inscripcion"
                                value={form.fecha_inicio_inscripcion}
                                onChange={handleChange}
                                required
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                type="date"
                                label="Fecha Fin Inscripciones *"
                                name="fecha_fin_inscripcion"
                                value={form.fecha_fin_inscripcion}
                                onChange={handleChange}
                                required
                                fullWidth
                                size="small"
                                slotProps={{
                                    inputLabel: {
                                    shrink: true,
                                },
                            }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                            type="date"
                            label="Fecha de Evaluación *"
                            name="fecha_evaluacion"
                            value={form.fecha_evaluacion}
                            onChange={handleChange}
                            required
                            fullWidth
                            size="small"
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                type="date"
                                label="Publicación Resultados *"
                                name="fecha_publicacion_resultados"
                                value={form.fecha_publicacion_resultados}
                                onChange={handleChange}
                                required
                                fullWidth
                                size="small"
                                slotProps={{
                                    inputLabel: {
                                    shrink: true,
                                },
                            }}
                            />
                        </Grid>

                        <Grid item xs={12} sm={4}>
                            <TextField
                                type="number"
                                label="Nota Mínima Aprobatoria"
                                name="puntaje_minimo_aprobatorio"
                                value={form.puntaje_minimo_aprobatorio}
                                onChange={handleChange}
                                fullWidth
                                size="small"
                                inputProps={{ step: '0.5', min: '0', max: '20' }}
                            />
                        </Grid>
                    </Grid>

                    {/* Programas Autorizados */}
                    <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                        2. Oferta Académica Autorizada (Solo 2 Programas Definidos)
                    </Typography>

                    <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                        Por disposición institucional, este instituto cuenta exclusivamente con dos programas pedagógicos activos. Se configurarán vacantes para ambos:
                    </Alert>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <Card elevation={0} sx={{ border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: 2 }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <GraduationCap size={20} color="#0284c7" />
                                        <Typography variant="subtitle1" fontWeight={700} color="#0369a1">
                                            Educación Inicial
                                        </Typography>
                                        <Chip label="EI-01" size="small" sx={{ ml: 'auto', fontWeight: 700, backgroundColor: '#e0f2fe' }} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5,}}>
                                        Modalidad Ordinaria (10 semestres)
                                    </Typography>
                                    <TextField
                                        type="number"
                                        label="Vacantes a Ofertars *"
                                        name="vacantes_inicial"
                                        value={form.vacantes_inicial}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: '1' }}
                                        sx={{mt:1}}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <Card elevation={0} sx={{ border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: 2 }}>
                                <CardContent sx={{ p: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <GraduationCap size={20} color="#0284c7" />
                                        <Typography variant="subtitle1" fontWeight={700} color="#0369a1">
                                            Educación Física
                                        </Typography>
                                        <Chip label="EF-01" size="small" sx={{ ml: 'auto', fontWeight: 700, backgroundColor: '#e0f2fe'}} />
                                    </Box>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                                        Modalidad Ordinaria (10 semestres)
                                    </Typography>
                                    <TextField
                                        type="number"
                                        label="Vacantes a Ofertar *"
                                        name="vacantes_fisica"
                                        value={form.vacantes_fisica}
                                        onChange={handleChange}
                                        required
                                        fullWidth
                                        size="small"
                                        inputProps={{ min: '1' }}
                                        sx={{mt:1}}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={16} />}
                        sx={{
                            backgroundColor: THEME_COLORS.primary,
                            '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                            fontWeight: 700,
                            textTransform: 'none',
                            px: 3,
                        }}
                    >
                        {loading ? 'Creando...' : 'Crear y Abrir Convocatoria'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}
