import React, { useState, useEffect } from 'react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';
import {
    BookOpen,
    Users,
    CheckCircle2,
    Award,
    TrendingUp,
    RefreshCw,
    GraduationCap,
    School,
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
    LinearProgress,
    TextField,
    MenuItem,
} from '@mui/material';

export default function VacantesOfertadasPage() {
    const [procesos, setProcesos] = useState([]);
    const [selectedProcesoId, setSelectedProcesoId] = useState('');
    const [procesoDetalle, setProcesoDetalle] = useState(null);
    const [postulaciones, setPostulaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadProcesos();
    }, []);

    useEffect(() => {
        if (selectedProcesoId) {
            loadDetalleYPostulaciones(selectedProcesoId);
        }
    }, [selectedProcesoId]);

    const loadProcesos = async () => {
        try {
            const res = await admissionService.getProcesos();
            const list = res.data || [];
            setProcesos(list);

            const abierta = list.find((p) => p.estado === 'CONVOCATORIA_ABIERTA') || list[0];
            if (abierta) {
                setSelectedProcesoId(abierta.id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const loadDetalleYPostulaciones = async (id) => {
        setLoading(true);
        try {
            const [detalle, postRes] = await Promise.all([
                admissionService.getProceso(id),
                admissionService.getPostulaciones({ admision_proceso_id: id, per_page: 200 }),
            ]);
            setProcesoDetalle(detalle);
            setPostulaciones(postRes.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const programasOfertados = procesoDetalle?.programas_ofertados || [];
    const totalVacantes = programasOfertados.reduce((acc, p) => acc + (p.vacantes || 0), 0);
    const totalPostulantes = postulaciones.length;
    const totalInscritosOficiales = postulaciones.filter((p) => p.estado_inscripcion === 'INSCRITO').length;
    const vacantesRestantes = Math.max(0, totalVacantes - totalInscritosOficiales);

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
                        <BookOpen size={22} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5, color: THEME_COLORS.textLight }}>
                            Vacantes Ofertadas — Programas Pedagógicos
                        </Typography>
                        <Typography variant="caption" sx={{ color: THEME_COLORS.textMuted }}>
                            Distribución oficial de vacantes por programa institucional autorizado
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TextField
                        select
                        size="small"
                        label="Convocatoria"
                        value={selectedProcesoId}
                        onChange={(e) => setSelectedProcesoId(e.target.value)}
                        sx={{
                            minWidth: 260,
                            bgcolor: THEME_COLORS.darkNavySurface,
                            borderRadius: 1.5,
                            '& .MuiInputBase-input': { color: '#ffffff', fontWeight: 600, fontSize: 13 },
                            '& .MuiInputLabel-root': { color: THEME_COLORS.textMuted },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME_COLORS.darkNavyBorder },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: THEME_COLORS.accent },
                            '& .MuiSvgIcon-root': { color: '#ffffff' },
                        }}
                    >
                        {procesos.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.codigo} — {p.nombre}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="outlined"
                        onClick={() => loadDetalleYPostulaciones(selectedProcesoId)}
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
                </Box>
            </Paper>

            {/* Tarjetas de Métricas Globales */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME_COLORS.border}`, bgcolor: THEME_COLORS.surface }}>
                        <Typography variant="caption" fontWeight={700} color={THEME_COLORS.textSecondary} display="block">
                            TOTAL VACANTES OFERTADAS
                        </Typography>
                        <Typography variant="h4" fontWeight={900} color={THEME_COLORS.primary} sx={{ my: 0.5 }}>
                            {totalVacantes}
                        </Typography>
                        <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                            Distribuidas en 2 carreras pedagógicas
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME_COLORS.border}`, bgcolor: THEME_COLORS.surface }}>
                        <Typography variant="caption" fontWeight={700} color={THEME_COLORS.textSecondary} display="block">
                            POSTULANTES REGISTRADOS
                        </Typography>
                        <Typography variant="h4" fontWeight={900} color={THEME_COLORS.textPrimary} sx={{ my: 0.5 }}>
                            {totalPostulantes}
                        </Typography>
                        <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                            En fases del trámite
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME_COLORS.border}`, bgcolor: THEME_COLORS.surface }}>
                        <Typography variant="caption" fontWeight={700} color={THEME_COLORS.textSecondary} display="block">
                            INSCRITOS OFICIALES
                        </Typography>
                        <Typography variant="h4" fontWeight={900} color={THEME_COLORS.success} sx={{ my: 0.5 }}>
                            {totalInscritosOficiales}
                        </Typography>
                        <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                            Expediente y pago completos
                        </Typography>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: `1px solid ${THEME_COLORS.border}`, bgcolor: THEME_COLORS.surface }}>
                        <Typography variant="caption" fontWeight={700} color={THEME_COLORS.textSecondary} display="block">
                            VACANTES DISPONIBLES
                        </Typography>
                        <Typography variant="h4" fontWeight={900} color={vacantesRestantes > 0 ? THEME_COLORS.info : THEME_COLORS.warning} sx={{ my: 0.5 }}>
                            {vacantesRestantes}
                        </Typography>
                        <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                            Por adjudicar en el examen
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Detalle por Programa Pedagógico Autorizado */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={36} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {programasOfertados.map((po) => {
                        const isInicial = po.programa.toLowerCase().includes('inicial');
                        const postulantesPrograma = postulaciones.filter(
                            (p) => p.programa_ofertado?.programa === po.programa || p.admision_programa_ofertado_id === po.id
                        );
                        const inscritosPrograma = postulantesPrograma.filter((p) => p.estado_inscripcion === 'INSCRITO').length;
                        const porcentaje = po.vacantes > 0 ? Math.min(100, Math.round((inscritosPrograma / po.vacantes) * 100)) : 0;

                        return (
                            <Grid item xs={12} md={6} key={po.id}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 3,
                                        border: `1px solid ${THEME_COLORS.border}`,
                                        bgcolor: THEME_COLORS.surface,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    borderRadius: 2.5,
                                                    bgcolor: isInicial ? 'rgba(236, 72, 153, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                                                    color: isInicial ? '#db2777' : '#059669',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <GraduationCap size={26} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={800} color={THEME_COLORS.textPrimary}>
                                                    {po.programa}
                                                </Typography>
                                                <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                                                    Modalidad: {po.modalidad} • Nivel Superior Pedagógico
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Chip
                                            label={`${po.vacantes} Vacantes`}
                                            sx={{
                                                bgcolor: THEME_COLORS.primaryLight,
                                                color: THEME_COLORS.primary,
                                                fontWeight: 800,
                                                fontSize: 12,
                                            }}
                                        />
                                    </Box>

                                    <Divider sx={{ my: 2 }} />

                                    {/* Estadísticas del Programa */}
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color={THEME_COLORS.textMuted} display="block">
                                                Registrados
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={800} color={THEME_COLORS.textPrimary}>
                                                {postulantesPrograma.length}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color={THEME_COLORS.textMuted} display="block">
                                                Inscritos Oficiales
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={800} color={THEME_COLORS.success}>
                                                {inscritosPrograma}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="caption" color={THEME_COLORS.textMuted} display="block">
                                                Disponibilidad
                                            </Typography>
                                            <Typography variant="subtitle1" fontWeight={800} color={THEME_COLORS.primary}>
                                                {Math.max(0, po.vacantes - inscritosPrograma)}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    {/* Barra de Ocupación */}
                                    <Box sx={{ mt: 1 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="caption" fontWeight={700} color={THEME_COLORS.textSecondary}>
                                                Avance de Inscripciones Oficiales
                                            </Typography>
                                            <Typography variant="caption" fontWeight={800} color={THEME_COLORS.primary}>
                                                {porcentaje}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={porcentaje}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: '#e2e8f0',
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: isInicial ? '#ec4899' : '#10b981',
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </Container>
    );
}
