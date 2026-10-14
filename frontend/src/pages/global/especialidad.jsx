import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, FormControlLabel, Checkbox
} from '@mui/material';
import {
    Plus, Search, RefreshCw, Pencil, Trash2, X, GraduationCap, BookOpen, AlertTriangle
} from 'lucide-react';

import { especialidadService } from '../../services/especialidadService';
import { THEME_COLORS } from '../../theme/colors';

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    estado: 'ACTIVO',
};

function obtenerErrores(error) {
    const errores = error.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error.response?.data?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

export default function Especialidades() {
    const [especialidades, setEspecialidades] = useState([]);
    
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
    const [codigoEdicion, setCodigoEdicion] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    // Estado del Modal de Confirmación de Eliminación
    const [especialidadAEliminar, setEspecialidadAEliminar] = useState(null);

    // Alertas tipo Feedback
    const [feedback, setFeedback] = useState(null);

    const cargarEspecialidades = useCallback(async () => {
        setCargando(true);
        try {
            const params = {};
            if (busqueda.trim()) params.buscar = busqueda.trim();
            if (soloActivos) params.solo_activos = 1;

            const respuesta = await especialidadService.listar(params);
            const resultado = Array.isArray(respuesta) ? respuesta : (respuesta?.data || []);
            setEspecialidades(resultado);
        } catch (error) {
            setEspecialidades([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, soloActivos]);

    useEffect(() => {
        cargarEspecialidades();
    }, [cargarEspecialidades]);

    const abrirNuevaEspecialidad = () => {
        setCodigoEdicion(null);
        setFormulario({ ...FORMULARIO_VACIO });
        setModalAbierto(true);
    };

    const abrirEdicionPorCodigo = async (codigo) => {
        try {
            const encontrada = await especialidadService.obtener(codigo);
            setCodigoEdicion(encontrada.codigo);
            setFormulario({
                codigo: encontrada.codigo || '',
                nombre: encontrada.nombre || '',
                estado: encontrada.estado || 'ACTIVO',
            });
            setModalAbierto(true);
        } catch (error) {
            // Respaldo con el registro de la tabla si falla o no está activo el endpoint show()
            const local = especialidades.find((item) => item.codigo === codigo);
            if (local) {
                setCodigoEdicion(local.codigo);
                setFormulario({
                    codigo: local.codigo,
                    nombre: local.nombre,
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
        setCodigoEdicion(null);
    };

    const actualizarCampo = (campo, valor) =>
        setFormulario((prev) => ({ ...prev, [campo]: valor }));

    const guardarEspecialidad = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const datos = {
            codigo: formulario.codigo.trim().toUpperCase(),
            nombre: formulario.nombre.trim(),
            estado: formulario.estado,
        };

        try {
            if (codigoEdicion !== null) {
                await especialidadService.actualizar(codigoEdicion, datos);
                setFeedback({
                    type: 'success',
                    message: `Especialidad "${codigoEdicion}" actualizada correctamente en el sistema.`,
                });
            } else {
                await especialidadService.registrar(datos);
                setFeedback({
                    type: 'success',
                    message: 'Especialidad registrada correctamente en el sistema.',
                });
            }
            setModalAbierto(false);
            setCodigoEdicion(null);
            await cargarEspecialidades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!especialidadAEliminar) return;
        setEliminando(true);

        try {
            await especialidadService.eliminar(especialidadAEliminar.codigo);
            setFeedback({
                type: 'success',
                message: `Especialidad "${especialidadAEliminar.codigo}" eliminada correctamente.`,
            });
            setEspecialidadAEliminar(null);
            await cargarEspecialidades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    // Paginación local sobre los resultados
    const especialidadesPaginadas = especialidades.slice(
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
                            Catálogo de Especialidades (IESPP ARCO IRIS)
                        </Typography>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                            Gestión oficial de carreras, códigos de especialidad y estado de disponibilidad académica.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={abrirNuevaEspecialidad}
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
                        Nueva Especialidad
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
                        placeholder="Buscar por código (ej. EF, EI) o nombre de especialidad..."
                        size="small"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(0);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && cargarEspecialidades()}
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
                                Solo activas
                            </Typography>
                        }
                    />
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Search size={16} />}
                        onClick={() => { setPagina(0); cargarEspecialidades(); }}
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
                            <TableCell sx={{ fontWeight: 700, width: '20%' }}>Código Especialidad</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: '50%' }}>Nombre de la Especialidad</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, width: '15%' }}>Estado</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, width: '15%' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : especialidadesPaginadas.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                    <GraduationCap size={40} color={THEME_COLORS.border} style={{ marginBottom: 16 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>No se encontraron especialidades</Typography>
                                    <Typography variant="body2">Ajusta los criterios de búsqueda o registra una nueva especialidad.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            especialidadesPaginadas.map((item) => (
                                <TableRow hover key={item.codigo}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>
                                            {item.codigo}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
                                            {item.nombre}
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
                                            <Tooltip title="Editar Especialidad por Código">
                                                <IconButton
                                                    onClick={() => abrirEdicionPorCodigo(item.codigo)}
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

                                            <Tooltip title="Eliminar Especialidad">
                                                <IconButton
                                                    onClick={() => setEspecialidadAEliminar(item)}
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
                    count={especialidades.length}
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

            {/* MODAL DE REGISTRO/EDICIÓN POR CÓDIGO (DIALOG) */}
            <Dialog
                open={modalAbierto}
                onClose={cerrarModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box component="form" onSubmit={guardarEspecialidad}>

                    {/* Header del Modal */}
                    <DialogTitle sx={{ p: 3, borderBottom: `1px solid ${THEME_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ backgroundColor: THEME_COLORS.primary, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
                                <BookOpen size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, lineHeight: 1.2 }}>
                                    {codigoEdicion !== null ? `Actualizar Especialidad (${codigoEdicion})` : 'Nueva Especialidad'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                    Datos oficiales de la especialidad académica
                                </Typography>
                            </Box>
                        </Stack>
                        <IconButton onClick={cerrarModal} size="small" sx={{ backgroundColor: '#f1f5f9' }}>
                            <X size={18} />
                        </IconButton>
                    </DialogTitle>

                    {/* Cuerpo del Modal */}
                    <DialogContent sx={{ p: 3 }}>
                        <Grid container spacing={2.5}>
                            <Grid item xs={12}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: THEME_COLORS.textSecondary }}>
                                    1. Información de la Especialidad
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Código"
                                    placeholder="Ej. EF, EI, ESP-01"
                                    size="small"
                                    value={formulario.codigo}
                                    disabled={codigoEdicion !== null}
                                    onChange={(e) => actualizarCampo('codigo', e.target.value.toUpperCase())}
                                    sx={inputStyle}
                                />
                            </Grid>

                            <Grid item xs={12} sm={7}>
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
                                    required
                                    label="Nombre de la Especialidad"
                                    placeholder="Ej. EDUCACIÓN FÍSICA"
                                    size="small"
                                    value={formulario.nombre}
                                    onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                    sx={inputStyle}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>

                    {/* Footer del Modal */}
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
                            {guardando ? 'Guardando...' : codigoEdicion !== null ? 'Guardar Cambios' : 'Guardar Especialidad'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <Dialog
                open={Boolean(especialidadAEliminar)}
                onClose={() => !eliminando && setEspecialidadAEliminar(null)}
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
                        ¿Estás seguro de que deseas eliminar la especialidad <strong>{especialidadAEliminar?.codigo} - {especialidadAEliminar?.nombre}</strong>? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME_COLORS.border}`, gap: 1 }}>
                    <Button
                        onClick={() => setEspecialidadAEliminar(null)}
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