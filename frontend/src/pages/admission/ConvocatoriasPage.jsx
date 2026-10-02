import React, { useState, useEffect } from 'react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';
import ModalCrearConvocatoria from './ModalCrearConvocatoria';
import {
    Calendar,
    Plus,
    Lock,
    Unlock,
    RefreshCw,
    Award,
    CheckCircle2,
    Clock,
    AlertCircle,
} from 'lucide-react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    Chip,
    Alert,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';

export default function ConvocatoriasPage() {
    const [procesos, setProcesos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModalCrear, setShowModalCrear] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Modal para confirmar alternancia de estado (Abrir / Cerrar)
    const [toggleModal, setToggleModal] = useState({
        open: false,
        proceso: null,
        loading: false,
    });

    useEffect(() => {
        loadProcesos();
    }, []);

    const loadProcesos = async () => {
        setLoading(true);
        try {
            const res = await admissionService.getProcesos();
            setProcesos(res.data || []);
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al consultar las convocatorias de admisión.' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmToggleEstado = async () => {
        if (!toggleModal.proceso) return;
        setToggleModal((prev) => ({ ...prev, loading: true }));
        try {
            const res = await admissionService.toggleEstadoProceso(toggleModal.proceso.id);
            setFeedback({ type: 'success', message: res.message || 'Estado de la convocatoria actualizado.' });
            setToggleModal({ open: false, proceso: null, loading: false });
            loadProcesos();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Error al cambiar el estado de la convocatoria.',
            });
            setToggleModal((prev) => ({ ...prev, loading: false }));
        }
    };

    return (
        <Container maxWidth="xl" sx={{ pb: 6 }}>
            {/* ENCABEZADO SUPERIOR — Barra Azul Oscuro */}
            <Paper
                elevation={0}
                sx={{
                    bgcolor: THEME_COLORS.darkNavy,
                    color: THEME_COLORS.textLight,
                    p: 2.2,
                    borderRadius: 2.5,
                    mb: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 2,
                    boxShadow: '0 4px 15px rgba(10, 17, 26, 0.2)',
                    border: `1px solid ${THEME_COLORS.darkNavyBorder}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            bgcolor: THEME_COLORS.accentGlow,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: THEME_COLORS.accent,
                        }}
                    >
                        <Calendar size={22} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5, color: THEME_COLORS.textLight }}>
                            Gestión de Convocatorias de Admisión
                        </Typography>
                        <Typography variant="caption" sx={{ color: THEME_COLORS.textMuted }}>
                            Apertura, cierre y administración de períodos oficiales de admisión
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        onClick={loadProcesos}
                        disabled={loading}
                        startIcon={<RefreshCw size={16} />}
                        sx={{
                            color: '#ffffff',
                            borderColor: THEME_COLORS.darkNavyBorder,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: THEME_COLORS.darkNavyHover, borderColor: '#ffffff' },
                        }}
                    >
                        Actualizar
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setShowModalCrear(true)}
                        sx={{
                            bgcolor: THEME_COLORS.primary,
                            '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                        }}
                    >
                        Nueva Convocatoria
                    </Button>
                </Box>
            </Paper>

            {/* Alertas */}
            {feedback && (
                <Alert
                    severity={feedback.type}
                    onClose={() => setFeedback(null)}
                    sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
                >
                    {feedback.message}
                </Alert>
            )}

            {/* Listado de Convocatorias */}
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress size={36} />
                    <Typography variant="body2" sx={{ mt: 2, color: THEME_COLORS.textSecondary }}>
                        Cargando convocatorias...
                    </Typography>
                </Box>
            ) : procesos.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2.5, border: `1px solid ${THEME_COLORS.border}` }}>
                    <AlertCircle size={40} color={THEME_COLORS.textMuted} style={{ margin: '0 auto 12px' }} />
                    <Typography variant="h6" fontWeight={700} color={THEME_COLORS.textPrimary}>
                        No existen convocatorias registradas
                    </Typography>
                    <Typography variant="body2" color={THEME_COLORS.textSecondary} sx={{ mt: 0.5, mb: 2 }}>
                        Cree su primera convocatoria institucional para iniciar el proceso de admisión.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setShowModalCrear(true)}
                        sx={{ bgcolor: THEME_COLORS.primary, textTransform: 'none', fontWeight: 700 }}
                    >
                        Crear Primera Convocatoria
                    </Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {procesos.map((p) => {
                        const isAbierta = p.estado === 'CONVOCATORIA_ABIERTA';

                        return (
                            <Grid item xs={12} md={6} key={p.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: `1px solid ${THEME_COLORS.border}`,
                                        bgcolor: THEME_COLORS.surface,
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: isAbierta ? '0 4px 15px rgba(37, 99, 235, 0.08)' : 'none',
                                    }}
                                >
                                    {/* Indicador superior de estado */}
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            height: 4,
                                            bgcolor: isAbierta ? THEME_COLORS.success : THEME_COLORS.error,
                                        }}
                                    />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="h6" fontWeight={800} color={THEME_COLORS.textPrimary}>
                                                    {p.codigo}
                                                </Typography>
                                                <Chip
                                                    label={isAbierta ? 'ABIERTA' : 'CERRADA'}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 800,
                                                        fontSize: 10,
                                                        bgcolor: isAbierta ? THEME_COLORS.successLight : THEME_COLORS.errorLight,
                                                        color: isAbierta ? THEME_COLORS.successText : THEME_COLORS.errorText,
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color={THEME_COLORS.textSecondary} sx={{ mt: 0.5 }}>
                                                {p.nombre}
                                            </Typography>
                                        </Box>

                                        {/* Botón de Alternar Estado (Aperturar / Cerrar) */}
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={isAbierta ? <Lock size={14} /> : <Unlock size={14} />}
                                            onClick={() => setToggleModal({ open: true, proceso: p, loading: false })}
                                            sx={{
                                                textTransform: 'none',
                                                fontSize: 12,
                                                fontWeight: 700,
                                                color: isAbierta ? THEME_COLORS.error : THEME_COLORS.success,
                                                borderColor: isAbierta ? THEME_COLORS.errorBorder : THEME_COLORS.successBorder,
                                                '&:hover': {
                                                    bgcolor: isAbierta ? THEME_COLORS.errorLight : THEME_COLORS.successLight,
                                                    borderColor: isAbierta ? THEME_COLORS.error : THEME_COLORS.success,
                                                },
                                            }}
                                        >
                                            {isAbierta ? 'Cerrar Convocatoria' : 'Aperturar Convocatoria'}
                                        </Button>
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Fechas Reglamentarias */}
                                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="caption" color={THEME_COLORS.textMuted} display="block">
                                                Inscripción
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color={THEME_COLORS.textPrimary}>
                                                {p.fecha_inicio_inscripcion || '—'} al {p.fecha_fin_inscripcion || '—'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6} sm={4}>
                                            <Typography variant="caption" color={THEME_COLORS.textMuted} display="block">
                                                Examen
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color={THEME_COLORS.textPrimary}>
                                                {p.fecha_examen || '—'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={4}>
                                            <Typography variant="caption" color={THEME_COLORS.textMuted} display="block">
                                                Puntaje Mínimo
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700} color={THEME_COLORS.primary}>
                                                {p.puntaje_minimo_aprobatorio || 11.00} pts.
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {/* Oferta Académica */}
                                    <Box sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                        <Typography variant="caption" fontWeight={700} color={THEME_COLORS.textSecondary} display="block" sx={{ mb: 0.8 }}>
                                            Programas de Estudio Ofertados:
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                icon={<Award size={14} />}
                                                label="Educación Inicial (30 vacantes)"
                                                size="small"
                                                sx={{ bgcolor: '#eff6ff', color: '#1e40af', fontWeight: 700, fontSize: 11 }}
                                            />
                                            <Chip
                                                icon={<Award size={14} />}
                                                label="Educación Física (30 vacantes)"
                                                size="small"
                                                sx={{ bgcolor: '#ecfdf5', color: '#065f46', fontWeight: 700, fontSize: 11 }}
                                            />
                                        </Box>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Modal Crear Convocatoria */}
            <ModalCrearConvocatoria
                open={showModalCrear}
                onClose={() => setShowModalCrear(false)}
                onSuccess={() => {
                    setShowModalCrear(false);
                    setFeedback({ type: 'success', message: '¡Convocatoria creada exitosamente con los 2 programas autorizados!' });
                    loadProcesos();
                }}
            />

            {/* Modal Confirmación Toggle Estado */}
            <Dialog
                open={toggleModal.open}
                onClose={() => !toggleModal.loading && setToggleModal({ open: false, proceso: null, loading: false })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>
                    {toggleModal.proceso?.estado === 'CONVOCATORIA_ABIERTA' ? 'Cerrar Convocatoria' : 'Aperturar Convocatoria'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: THEME_COLORS.textPrimary, fontSize: 14 }}>
                        {toggleModal.proceso?.estado === 'CONVOCATORIA_ABIERTA'
                            ? `¿Está seguro de CERRAR la convocatoria ${toggleModal.proceso?.codigo}? Se bloqueará la recepción de nuevas solicitudes de inscripción.`
                            : `¿Está seguro de APERTURAR la convocatoria ${toggleModal.proceso?.codigo}? Se habilitará el registro de postulantes.`}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setToggleModal({ open: false, proceso: null, loading: false })}
                        disabled={toggleModal.loading}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmToggleEstado}
                        disabled={toggleModal.loading}
                        variant="contained"
                        sx={{
                            bgcolor: toggleModal.proceso?.estado === 'CONVOCATORIA_ABIERTA' ? THEME_COLORS.error : THEME_COLORS.success,
                            '&:hover': {
                                bgcolor: toggleModal.proceso?.estado === 'CONVOCATORIA_ABIERTA' ? THEME_COLORS.errorHover : THEME_COLORS.successHover,
                            },
                            textTransform: 'none',
                            fontWeight: 700,
                        }}
                    >
                        {toggleModal.loading ? <CircularProgress size={16} color="inherit" /> : 'Confirmar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
