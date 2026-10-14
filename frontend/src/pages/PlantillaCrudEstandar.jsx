import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Divider, Grid, MenuItem, InputAdornment,
    Stack, Chip, FormControlLabel, Checkbox
} from '@mui/material';
import {
    Plus, Search, RefreshCw, Pencil, Trash2, X, Layers, AlertTriangle
} from 'lucide-react';

// ============================================================================
// 1. IMPORTAR EL SERVICIO Y TEMA DE COLORES
// ============================================================================
import { especialidadService as crudService } from '../../services/especialidadService';
import { THEME_COLORS } from '../../theme/colors';

// ============================================================================
// 2. CONFIGURACIÓN ESTÁNDAR DEL MÓDULO (CAMBIAR SEGÚN LA TABLA)
// ============================================================================
const CONFIG = {
    titulo: 'Catálogo de Especialidades (IESPP ARCO IRIS)',
    subtitulo: 'Gestión oficial de registros, códigos y estado de disponibilidad en el sistema.',
    entidadSingular: 'Especialidad',
    entidadPlural: 'especialidades',
    // Llave primaria del registro: usa 'id' (ej. Alumnos) o 'codigo' (ej. Especialidades)
    llavePrimaria: 'codigo',
    placeholderBusqueda: 'Buscar por código o nombre...',
    mostrarFiltroActivos: true, // true si la tabla maneja estado ACTIVO/INACTIVO
    tamanoModal: 'sm', // 'xs' | 'sm' | 'md' | 'lg'
    IconoModulo: Layers,
};

// ============================================================================
// 3. ESTADO INICIAL DEL FORMULARIO
// ============================================================================
const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    estado: 'ACTIVO',
};

// Función universal para extraer errores de validación de Laravel (422 / 500)
function obtenerErrores(error) {
    const errores = error.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error.response?.data?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

export default function ModuloEstandarPage() {
    // Estados de datos
    const [registros, setRegistros] = useState([]);
    const [totalServidor, setTotalServidor] = useState(null); // null = paginación local, número = paginación Laravel

    // Estados de filtros y paginación
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
    const [idEdicion, setIdEdicion] = useState(null); // Guarda el ID o Código original al editar
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    // Estados del Modal Confirmar Eliminación
    const [registroAEliminar, setRegistroAEliminar] = useState(null);

    // Alerta de Feedback
    const [feedback, setFeedback] = useState(null);

    const inputStyle = { '& .MuiOutlinedInput-root': { borderRadius: 2 } };
    const { IconoModulo } = CONFIG;

    // ------------------------------------------------------------------------
    // CARGAR REGISTROS (Soporta tanto get() como paginate() de Laravel)
    // ------------------------------------------------------------------------
    const cargarRegistros = useCallback(async () => {
        setCargando(true);
        try {
            const params = {
                page: pagina + 1,
                per_page: filasPorPagina,
            };
            if (busqueda.trim()) params.buscar = busqueda.trim();
            if (CONFIG.mostrarFiltroActivos && soloActivos) params.solo_activos = 1;

            const respuesta = await crudService.listar(params);

            if (Array.isArray(respuesta)) {
                // Cuando Laravel responde con ->get()
                setRegistros(respuesta);
                setTotalServidor(null);
            } else if (Array.isArray(respuesta?.data)) {
                // Cuando Laravel responde con ->paginate() o Resource
                setRegistros(respuesta.data);
                setTotalServidor(typeof respuesta.total === 'number' ? respuesta.total : null);
            } else {
                setRegistros([]);
                setTotalServidor(0);
            }
        } catch (error) {
            setRegistros([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, soloActivos, pagina, filasPorPagina]);

    useEffect(() => {
        cargarRegistros();
    }, [cargarRegistros]);

    // ------------------------------------------------------------------------
    // MANEJO DE FORMULARIO Y MODALES
    // ------------------------------------------------------------------------
    const actualizarCampo = (campo, valor) => {
        setFormulario((prev) => ({ ...prev, [campo]: valor }));
    };

    const abrirModalNuevo = () => {
        setIdEdicion(null);
        setFormulario({ ...FORMULARIO_VACIO });
        setModalAbierto(true);
    };

    const abrirModalEdicion = async (fila) => {
        const identificador = fila[CONFIG.llavePrimaria];
        try {
            const detalle = await crudService.obtener(identificador);
            setIdEdicion(identificador);
            setFormulario({ ...FORMULARIO_VACIO, ...detalle });
            setModalAbierto(true);
        } catch {
            // Respaldo inmediato con los datos de la fila si la API no tiene ruta show()
            setIdEdicion(identificador);
            setFormulario({ ...FORMULARIO_VACIO, ...fila });
            setModalAbierto(true);
        }
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
        setIdEdicion(null);
    };

    // ------------------------------------------------------------------------
    // GUARDAR (CREAR O ACTUALIZAR)
    // ------------------------------------------------------------------------
    const guardarRegistro = async (event) => {
        event.preventDefault();
        setGuardando(true);

        // Normalización automática de strings
        const payload = Object.keys(formulario).reduce((acc, key) => {
            const valor = formulario[key];
            acc[key] = typeof valor === 'string' ? valor.trim() : valor;
            return acc;
        }, {});

        if (payload.codigo) {
            payload.codigo = payload.codigo.toUpperCase();
        }

        try {
            if (idEdicion !== null) {
                const res = await crudService.actualizar(idEdicion, payload);
                setFeedback({
                    type: 'success',
                    message: res?.message || `${CONFIG.entidadSingular} actualizado(a) correctamente.`,
                });
            } else {
                const res = await crudService.registrar(payload);
                setFeedback({
                    type: 'success',
                    message: res?.message || `${CONFIG.entidadSingular} registrado(a) correctamente.`,
                });
            }
            setModalAbierto(false);
            setIdEdicion(null);
            await cargarRegistros();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    // ------------------------------------------------------------------------
    // ELIMINAR CON DIALOG DE CONFIRMACIÓN
    // ------------------------------------------------------------------------
    const confirmarEliminacion = async () => {
        if (!registroAEliminar) return;
        const identificador = registroAEliminar[CONFIG.llavePrimaria];
        setEliminando(true);

        try {
            const res = await crudService.eliminar(identificador);
            setFeedback({
                type: 'success',
                message: res?.message || `${CONFIG.entidadSingular} eliminado(a) correctamente.`,
            });
            setRegistroAEliminar(null);
            await cargarRegistros();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    // Si el servidor no pagina, paginamos en el cliente automáticamente
    const filasVisibles = totalServidor !== null
        ? registros
        : registros.slice(pagina * filasPorPagina, pagina * filasPorPagina + filasPorPagina);

    const totalRegistros = totalServidor !== null ? totalServidor : registros.length;

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>

            {/* 1. ENCABEZADO ESTÁNDAR */}
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
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary }}>
                        {CONFIG.titulo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                        {CONFIG.subtitulo}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Plus size={18} />}
                    onClick={abrirModalNuevo}
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
                    {`Nuevo(a) ${CONFIG.entidadSingular}`}
                </Button>
            </Box>

            {/* 2. ALERTA DE FEEDBACK */}
            {feedback && (
                <Alert
                    severity={feedback.type}
                    onClose={() => setFeedback(null)}
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    {feedback.message}
                </Alert>
            )}

            {/* 3. BARRA DE BÚSQUEDA Y FILTROS */}
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
                        placeholder={CONFIG.placeholderBusqueda}
                        size="small"
                        value={busqueda}
                        onChange={(e) => {
                            setBusqueda(e.target.value);
                            setPagina(0);
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && cargarRegistros()}
                        sx={{ width: { xs: '100%', sm: 420 } }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} style={{ color: THEME_COLORS.textSecondary }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    {CONFIG.mostrarFiltroActivos && (
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
                                    Mostrar solo activos
                                </Typography>
                            }
                        />
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Search size={16} />}
                        onClick={() => { setPagina(0); cargarRegistros(); }}
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

            {/* 4. TABLA DE DATOS (PERSONALIZAR COLUMNAS AQUÍ) */}
            <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                <Table sx={{ minWidth: 750 }}>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, width: '20%' }}>Código</TableCell>
                            <TableCell sx={{ fontWeight: 700, width: '50%' }}>Nombre / Descripción</TableCell>
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
                        ) : filasVisibles.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                    <IconoModulo size={40} color={THEME_COLORS.border} style={{ marginBottom: 16 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {`No se encontraron ${CONFIG.entidadPlural}`}
                                    </Typography>
                                    <Typography variant="body2">
                                        Ajusta los criterios de búsqueda o registra un nuevo elemento.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filasVisibles.map((item) => {
                                const clave = item[CONFIG.llavePrimaria];
                                return (
                                    <TableRow hover key={clave}>
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
                                                <Tooltip title={`Editar ${CONFIG.entidadSingular}`}>
                                                    <IconButton
                                                        onClick={() => abrirModalEdicion(item)}
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

                                                <Tooltip title={`Eliminar ${CONFIG.entidadSingular}`}>
                                                    <IconButton
                                                        onClick={() => setRegistroAEliminar(item)}
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
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                <TablePagination
                    component="div"
                    count={totalRegistros}
                    page={pagina}
                    onPageChange={(e, nuevaPagina) => setPagina(nuevaPagina)}
                    rowsPerPage={filasPorPagina}
                    onRowsPerPageChange={(e) => {
                        setFilasPorPagina(parseInt(e.target.value, 10));
                        setPagina(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    sx={{ borderTop: `1px solid ${THEME_COLORS.border}` }}
                />
            </TableContainer>

            {/* 5. MODAL DE CREACIÓN / EDICIÓN (PERSONALIZAR INPUTS AQUÍ) */}
            <Dialog
                open={modalAbierto}
                onClose={cerrarModal}
                fullWidth
                maxWidth={CONFIG.tamanoModal}
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box component="form" onSubmit={guardarRegistro}>
                    <DialogTitle sx={{ p: 3, borderBottom: `1px solid ${THEME_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ backgroundColor: THEME_COLORS.primary, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
                                <IconoModulo size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, lineHeight: 1.2 }}>
                                    {idEdicion !== null
                                        ? `Actualizar ${CONFIG.entidadSingular} (${idEdicion})`
                                        : `Nuevo(a) ${CONFIG.entidadSingular}`}
                                </Typography>
                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                    Completa los campos requeridos en el formulario
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
                                    1. Datos Generales
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={5}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Código"
                                    placeholder="Ej. EF, EI"
                                    size="small"
                                    value={formulario.codigo}
                                    disabled={idEdicion !== null && CONFIG.llavePrimaria === 'codigo'}
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
                                    label={`Nombre de ${CONFIG.entidadSingular}`}
                                    placeholder="Ingrese el nombre oficial"
                                    size="small"
                                    value={formulario.nombre}
                                    onChange={(e) => actualizarCampo('nombre', e.target.value)}
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
                            {guardando ? 'Guardando...' : idEdicion !== null ? 'Guardar Cambios' : 'Registrar'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>

            {/* 6. MODAL ESTÁNDAR DE CONFIRMACIÓN DE ELIMINACIÓN */}
            <Dialog
                open={Boolean(registroAEliminar)}
                onClose={() => !eliminando && setRegistroAEliminar(null)}
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
                        ¿Estás seguro de que deseas eliminar <strong>{registroAEliminar?.[CONFIG.llavePrimaria]}</strong>? Esta acción no se puede deshacer.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${THEME_COLORS.border}`, gap: 1 }}>
                    <Button
                        onClick={() => setRegistroAEliminar(null)}
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