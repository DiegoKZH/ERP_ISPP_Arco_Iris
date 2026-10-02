import React, { useState, useEffect } from 'react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';
import {
    Award,
    RefreshCw,
    Search,
    FileCheck,
    CheckCircle2,
    AlertCircle,
    UserCheck,
    Download,
    Trophy,
} from 'lucide-react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Alert,
    CircularProgress,
    TextField,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid,
} from '@mui/material';

export default function CuadroMeritoPage() {
    const [procesos, setProcesos] = useState([]);
    const [selectedProcesoId, setSelectedProcesoId] = useState('');
    const [cuadroMerito, setCuadroMerito] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filtroPrograma, setFiltroPrograma] = useState('TODOS');
    const [feedback, setFeedback] = useState(null);

    // Modal Calificar Postulante
    const [calificarModal, setCalificarModal] = useState({
        open: false,
        postulacion: null,
        puntajeEscrito: '',
        puntajeEntrevista: '',
        loading: false,
    });

    useEffect(() => {
        loadProcesos();
    }, []);

    useEffect(() => {
        if (selectedProcesoId) {
            loadCuadroMerito(selectedProcesoId);
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
            setFeedback({ type: 'error', message: 'Error al consultar las convocatorias.' });
        }
    };

    const loadCuadroMerito = async (id) => {
        setLoading(true);
        try {
            const res = await admissionService.getCuadroMerito(id);
            setCuadroMerito(res.data || []);
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al cargar el cuadro de méritos.' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCalificar = (item) => {
        setCalificarModal({
            open: true,
            postulacion: item,
            puntajeEscrito: item.puntaje_escrito || '',
            puntajeEntrevista: item.puntaje_vocacional || '',
            loading: false,
        });
    };

    const handleConfirmCalificar = async () => {
        if (!calificarModal.postulacion) return;
        setCalificarModal((prev) => ({ ...prev, loading: true }));
        try {
            const payload = {
                puntaje_escrito: parseFloat(calificarModal.puntajeEscrito) || 0,
                puntaje_vocacional: parseFloat(calificarModal.puntajeEntrevista) || 0,
            };
            await admissionService.calificarPostulante(calificarModal.postulacion.id, payload);
            setFeedback({ type: 'success', message: '¡Calificación registrada y cuadro de mérito actualizado!' });
            setCalificarModal({ open: false, postulacion: null, puntajeEscrito: '', puntajeEntrevista: '', loading: false });
            loadCuadroMerito(selectedProcesoId);
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Error al guardar la calificación.',
            });
            setCalificarModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleEmitirConstancia = async (postulacionId) => {
        try {
            await admissionService.emitirConstancia(postulacionId);
            setFeedback({ type: 'success', message: '¡Constancia de ingreso emitida satisfactoriamente!' });
            loadCuadroMerito(selectedProcesoId);
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Error al emitir constancia de ingreso.',
            });
        }
    };

    const filteredResultados = cuadroMerito.filter((item) => {
        if (filtroPrograma === 'TODOS') return true;
        return item.programa === filtroPrograma;
    });

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
                        <Trophy size={22} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5, color: THEME_COLORS.textLight }}>
                            Cuadro de Mérito y Resultados de Admisión
                        </Typography>
                        <Typography variant="caption" sx={{ color: THEME_COLORS.textMuted }}>
                            Calificaciones consolidadas, orden de mérito y condición de ingresantes
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
                        onClick={() => loadCuadroMerito(selectedProcesoId)}
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

            {/* Filtro por Programa */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2.5,
                    border: `1px solid ${THEME_COLORS.border}`,
                    bgcolor: THEME_COLORS.surface,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" fontWeight={700} color={THEME_COLORS.textPrimary}>
                        Filtrar por Especialidad Pedagógica:
                    </Typography>
                    <TextField
                        select
                        size="small"
                        value={filtroPrograma}
                        onChange={(e) => setFiltroPrograma(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="TODOS">Todos los Programas</MenuItem>
                        <MenuItem value="Educación Inicial">Educación Inicial</MenuItem>
                        <MenuItem value="Educación Física">Educación Física</MenuItem>
                    </TextField>
                </Box>

                <Typography variant="caption" color={THEME_COLORS.textSecondary} fontWeight={600}>
                    Total Evaluados: {filteredResultados.length} postulantes
                </Typography>
            </Paper>

            {/* TABLA OFICIAL DE RESULTADOS */}
            <TableContainer
                component={Paper}
                elevation={0}
                sx={{
                    borderRadius: 2.5,
                    border: `1px solid ${THEME_COLORS.border}`,
                    bgcolor: THEME_COLORS.surface,
                }}
            >
                <Table size="medium">
                    <TableHead sx={{ bgcolor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Puesto</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Código</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Postulante (DNI & Nombres)</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Programa Postulado</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }} align="center">Puntaje Final</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }} align="center">Condición Oficial</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} />
                                    <Typography variant="body2" sx={{ mt: 1, color: THEME_COLORS.textSecondary }}>
                                        Calculando cuadro de méritos...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : filteredResultados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <AlertCircle size={36} color={THEME_COLORS.textMuted} style={{ margin: '0 auto 8px' }} />
                                    <Typography variant="body1" fontWeight={700} color={THEME_COLORS.textPrimary}>
                                        No hay calificaciones registradas para esta convocatoria
                                    </Typography>
                                    <Typography variant="body2" color={THEME_COLORS.textSecondary}>
                                        Las notas deben registrarse tras la rendición del examen de admisión.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredResultados.map((item, index) => {
                                const isIngresante = item.condicion === 'ALCANZÓ VACANTE' || item.es_ingresante;

                                return (
                                    <TableRow key={item.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                        {/* Puesto */}
                                        <TableCell>
                                            <Chip
                                                label={`#${index + 1}`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 900,
                                                    fontSize: 12,
                                                    bgcolor: index === 0 ? '#fef3c7' : index === 1 ? '#f1f5f9' : index === 2 ? '#ffedd5' : '#f8fafc',
                                                    color: index === 0 ? '#92400e' : THEME_COLORS.textPrimary,
                                                }}
                                            />
                                        </TableCell>

                                        {/* Código */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color={THEME_COLORS.primary}>
                                                {item.codigo_postulante}
                                            </Typography>
                                        </TableCell>

                                        {/* Postulante */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color={THEME_COLORS.textPrimary}>
                                                {item.postulante_nombre}
                                            </Typography>
                                            <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                                                DNI: {item.numero_documento}
                                            </Typography>
                                        </TableCell>

                                        {/* Programa */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color={THEME_COLORS.textPrimary}>
                                                {item.programa}
                                            </Typography>
                                        </TableCell>

                                        {/* Puntaje */}
                                        <TableCell align="center">
                                            <Typography variant="subtitle2" fontWeight={800} color={THEME_COLORS.primary}>
                                                {item.puntaje_final ? Number(item.puntaje_final).toFixed(2) : '0.00'} pts.
                                            </Typography>
                                        </TableCell>

                                        {/* Condición */}
                                        <TableCell align="center">
                                            <Chip
                                                label={item.condicion || 'EVALUADO'}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: 11,
                                                    bgcolor: isIngresante ? THEME_COLORS.successLight : THEME_COLORS.warningLight,
                                                    color: isIngresante ? THEME_COLORS.successText : THEME_COLORS.warningText,
                                                }}
                                            />
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={() => handleOpenCalificar(item)}
                                                    sx={{ textTransform: 'none', fontSize: 11, fontWeight: 700 }}
                                                >
                                                    Calificar
                                                </Button>

                                                {isIngresante && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<FileCheck size={13} />}
                                                        onClick={() => handleEmitirConstancia(item.id)}
                                                        sx={{
                                                            bgcolor: THEME_COLORS.success,
                                                            '&:hover': { bgcolor: THEME_COLORS.successHover },
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                        }}
                                                    >
                                                        Constancia
                                                    </Button>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal Calificar Postulante */}
            <Dialog
                open={calificarModal.open}
                onClose={() => !calificarModal.loading && setCalificarModal((prev) => ({ ...prev, open: false }))}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>
                    Registrar Calificaciones
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Postulante: <strong>{calificarModal.postulacion?.postulante_nombre}</strong> (Código: {calificarModal.postulacion?.codigo_postulante})
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Examen Escrito de Conocimientos (0 - 20 pts)"
                                type="number"
                                fullWidth
                                size="small"
                                value={calificarModal.puntajeEscrito}
                                onChange={(e) => setCalificarModal((prev) => ({ ...prev, puntajeEscrito: e.target.value }))}
                                inputProps={{ min: 0, max: 20, step: 0.1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Entrevista / Evaluación Vocacional (0 - 20 pts)"
                                type="number"
                                fullWidth
                                size="small"
                                value={calificarModal.puntajeEntrevista}
                                onChange={(e) => setCalificarModal((prev) => ({ ...prev, puntajeEntrevista: e.target.value }))}
                                inputProps={{ min: 0, max: 20, step: 0.1 }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setCalificarModal((prev) => ({ ...prev, open: false }))}
                        disabled={calificarModal.loading}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmCalificar}
                        disabled={calificarModal.loading}
                        variant="contained"
                        sx={{ bgcolor: THEME_COLORS.primary, textTransform: 'none', fontWeight: 700 }}
                    >
                        {calificarModal.loading ? <CircularProgress size={16} color="inherit" /> : 'Guardar Calificación'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
