import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, FormControlLabel, Checkbox
} from '@mui/material';
import {
    Plus, Search, RefreshCw, Pencil, Trash2, X, BookOpen, AlertTriangle, FileText
} from 'lucide-react';

import { planEstudioService } from '../../services/planEstudioService';
import { THEME_COLORS } from '../../theme/colors';

const FORMULARIO_VACIO = {
    curricula: '',
    resolucion: '',
    estado: 'ACTIVO',
};

function obtenerErrores(error) {
    const errores = error.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error.response?.data?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

export default function PlanesEstudio() {
    const [planes, setPlanes] = useState([]);
    
    // Estados de búsqueda, filtro y paginación
    const [busqueda, setBusqueda] = useState('');
    const [soloActivos, setSoloActivos] = useState(false);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    // Estados de carga
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);

    // Estados del Modal Crear / Editar
    const [modalAbierto, setModalAbierto] = useState(false);
    const [curriculaEdicion, setCurriculaEdicion] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    // Estado del Modal de Confirmación de Eliminación
    const [planAEliminar, setPlanAEliminar] = useState(null);

    // Alertas tipo Feedback
    const [feedback, setFeedback] = useState(null);

    const cargarPlanes = useCallback(async () => {
        setCargando(true);
        try {
            const params = {};
            if (busqueda.trim()) params.buscar = busqueda.trim();
            if (soloActivos) params.solo_activos = 1;

            const respuesta = await planEstudioService.listar(params);
            const resultado = Array.isArray(respuesta) ? respuesta : (respuesta?.data || []);
            setPlanes(resultado);
        } catch (error) {
            setPlanes([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, soloActivos]);

    useEffect(() => {
        cargarPlanes();
    }, [cargarPlanes]);

    const abrirNuevoPlan = () => {
        setCurriculaEdicion(null);
        setFormulario({ ...FORMULARIO_VACIO });
        setModalAbierto(true);
    };

    const abrirEdicionPorCurricula = async (curricula) => {
        try {
            const encontrada = await planEstudioService.obtener(curricula);
            setCurriculaEdicion(encontrada.curricula);
            setFormulario({
                curricula: encontrada.curricula || '',
                resolucion: encontrada.resolucion || '',
                estado: encontrada.estado || 'ACTIVO',
            });
            setModalAbierto(true);
        } catch (error) {
            const local = planes.find((item) => item.curricula === curricula);
            if (local) {
                setCurriculaEdicion(local.curricula);
                setFormulario({
                    curricula: local.curricula,
                    resolucion: local.resolucion || '',
                    estado: local.estado || 'ACTIVO',
                });
                setModalAbierto(true);
            } else {
                setFeedback({ type: 'error', message: obtenerErrores(error) });
            }
        }
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
        setCurriculaEdicion(null);
    };

    const actualizarCampo = (campo, valor) =>
        setFormulario((prev) => ({ ...prev, [campo]: valor }));

    const guardarPlan = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const datos = {
            curricula: formulario.curricula.trim(),
            resolucion: formulario.resolucion.trim(),
            estado: formulario.estado,
        };

        try {
            if (curriculaEdicion !== null) {
                await planEstudioService.actualizar(curriculaEdicion, datos);
                setFeedback({
                    type: 'success',
                    message: `Plan de Estudio "${curriculaEdicion}" actualizado correctamente en el sistema.`,
                });
            } else {
                await planEstudioService.registrar(datos);
                setFeedback({
                    type: 'success',
                    message: 'Plan de Estudio registrado correctamente en el sistema.',
                });
            }
            setModalAbierto(false);
            setCurriculaEdicion(null);
            await cargarPlanes();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!planAEliminar) return;
        setEliminando(true);

        try {
            await planEstudioService.eliminar(planAEliminar.curricula);
            setFeedback({
                type: 'success',
                message: `Plan de Estudio "${planAEliminar.curricula}" eliminado correctamente.`,
            });
            setPlanAEliminar(null);
            await cargarPlanes();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    const planesPaginados = planes.slice(
        pagina * filasPorPagina,
        pagina * filasPorPagina + filasPorPagina
    );

    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>

            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2,
                    mb: 3,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary }}>
                            Planes de Estudio Registrados
                        </Typography>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                            Gestión oficial de currículas, resoluciones y estado de disponibilidad académica.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={abrirNuevoPlan}
                        sx={{
                            backgroundColor: THEME_COLORS.primary,
                            '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 2.5,
                            borderRadius: 2,
                            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                        }}
                    >
                        Agregar Plan
                    </Button>
                </Box>
            </Box>

            {/* Feedback Alert */}
            {feedback && (
                <Alert
                    severity={feedback.type}
                    onClose={() => setFeedback(null)}
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    {feedback.message}
                </Alert>
            )}

            {/* Barra de Búsqueda y Filtros */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2.5,
                    borderRadius: 2,
                    border: `1px solid ${THEME_COLORS.border}`,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                }}
            >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', flex: 1 }}>
                    <TextField
                        placeholder="Buscar por currícula (ej. 2020) o resolución..."
                        size="small"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(0);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && cargarPlanes()}
                        sx={{ width: { xs: '100%', sm: 420 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} style={{ color: THEME_COLORS.textSecondary }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={soloActivos}
                                onChange={(e) => {
                                    setSoloActivos(e.target.checked);
                                    setPagina(0);
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, fontWeight: 500 }}>
                                Solo activos
                            </Typography>
                        }
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Search size={16} />}
                        onClick={() => { setPagina(0); cargarPlanes(); }}
                        size="small"
                        sx={{ textTransform: 'none' }}
                    >
                        Buscar
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshCw size={16} />}
                        onClick={() => {
                            setBusqueda('');
                            setSoloActivos(false);
                            setPagina(0);
                        }}
                        size="small"
                        sx={{ textTransform: 'none', color: THEME_COLORS.textSecondary, borderColor: THEME_COLORS.border }}
                    >
                        Limpiar
                    </Button>
                </Box>
            </Paper>

            {/* Tabla Principal */}
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                <Table sx={{ minWidth: 700 }}>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, width: '20%' }}>Currícula</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: '40%' }}>Resolución</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, width: '20%' }}>Estado</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, width: '20%' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : planesPaginados.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                    <FileText size={40} color={THEME_COLORS.border} style={{ marginBottom: 16 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>No se encontraron planes de estudio</Typography>
                                    <Typography variant="body2">Ajusta los criterios de búsqueda o registra un nuevo plan.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            planesPaginados.map((item) => (
                                <TableRow hover key={item.curricula}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>
                                            {item.curricula}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
                                            {item.resolucion || '—'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell align="center">
                                        <Chip
                                            label={item.estado}
                                            size="small"
                                            sx={{
                                                fontWeight: 700,
                                                fontSize: '0.72rem',
                                                backgroundColor: item.estado === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                color: item.estado === 'ACTIVO' ? '#166534' : '#991b1b',
                                            }}
                                        />
                                    </TableCell>

                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Editar Plan de Estudio">
                                                <IconButton
                                                    onClick={() => abrirEdicionPorCurricula(item.curricula)}
                                                    size="small"
                                                    sx={{
                                                        color: THEME_COLORS.primary,
                                                        backgroundColor: '#f0f9ff',
                                                        borderRadius: 2,
                                                        '&:hover': { backgroundColor: '#e0f2fe' },
                                                    }}
                                                >
                                                    <Pencil size={16} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Eliminar Plan de Estudio">
                                                <IconButton
                                                    onClick={() => setPlanAEliminar(item)}
                                                    size="small"
                                                    sx={{
                                                        color: '#dc2626',
                                                        backgroundColor: '#fef2f2',
                                                        borderRadius: 2,
                                                        '&:hover': { backgroundColor: '#fee2e2' },
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={planes.length}
                    page={pagina}
                    onPageChange={(e, newPage) => setPagina(newPage)}
                    rowsPerPage={filasPorPagina}
                    onRowsPerPageChange={(e) => {
                        setFilasPorPagina(parseInt(e.target.value, 10));
                        setPagina(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    sx={{ borderTop: `1px solid ${THEME_COLORS.border}` }}
                />
            </TableContainer>

            {/* MODAL DE REGISTRO/EDICIÓN */}
            <Dialog
                open={modalAbierto}
                onClose={cerrarModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box component="form" onSubmit={guardarPlan}>
                    <DialogTitle sx={{ p: 3, borderBottom: `1px solid ${THEME_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ backgroundColor: THEME_COLORS.primary, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
                                <BookOpen size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, lineHeight: 1.2 }}>
                                    {curriculaEdicion !== null ? `Actualizar Plan (${curriculaEdicion})` : 'Nuevo Plan de Estudio'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                    Datos oficiales del plan curricular académico
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton onClick={cerrarModal} size="small" sx={{ backgroundColor: '#f1f5f9' }}>
                            <X size={18} />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: THEME_COLORS.textSecondary }}>
                                    1. Información del Plan
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Currícula (Año)"
                                    placeholder="Ej. 2020"
                                    size="small"
                                    value={formulario.curricula}
                                    disabled={curriculaEdicion !== null}
                                    onChange={(e) => actualizarCampo('curricula', e.target.value)}
                                    sx={inputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label="Estado"
                                    size="small"
                                    value={formulario.estado}
                                    onChange={(e) => actualizarCampo('estado', e.target.value)}
                                    sx={inputStyle}
                                >
                                    <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                    <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Resolución"
                                    placeholder="Ej. RVM 147-2020-MINEDU"
                                    size="small"
                                    value={formulario.resolucion}
                                    onChange={(e) => actualizarCampo('resolucion', e.target.value)}
                                    sx={inputStyle}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: `1px solid ${THEME_COLORS.border}`, gap: 1 }}>
                        <Button
                            onClick={cerrarModal}
                            disabled={guardando}
                            sx={{ color: THEME_COLORS.textSecondary, fontWeight: 600, textTransform: 'none' }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={guardando}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                borderRadius: 2,
                                px: 3,
                                textTransform: 'none',
                                fontWeight: 700,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                            }}
                        >
                            {guardando ? 'Guardando...' : curriculaEdicion !== null ? 'Guardar Cambios' : 'Guardar Plan'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <Dialog
                open={Boolean(planAEliminar)}
                onClose={() => !eliminando && setPlanAEliminar(null)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ backgroundColor: '#fef2f2', color: '#dc2626', p: 1, borderRadius: 2, display: 'flex' }}>
                        <AlertTriangle size={20} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Confirmar Eliminación
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2 }}>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                        ¿Estás seguro de que deseas eliminar el plan de estudio <strong>{planAEliminar?.curricula}</strong>? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME_COLORS.border}`, gap: 1 }}>
                    <Button
                        onClick={() => setPlanAEliminar(null)}
                        disabled={eliminando}
                        sx={{ color: THEME_COLORS.textSecondary, fontWeight: 600, textTransform: 'none' }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={confirmarEliminacion}
                        variant="contained"
                        disabled={eliminando}
                        sx={{
                            backgroundColor: '#dc2626',
                            '&:hover': { backgroundColor: '#b91c1c' },
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 700,
                        }}
                    >
                        {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}