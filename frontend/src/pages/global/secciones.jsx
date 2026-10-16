import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Grid, MenuItem, InputAdornment, Stack,
    Chip, FormControlLabel, Checkbox, Fade, IconButton
} from '@mui/material';
import {
    Plus, Search, RefreshCw, X, Layers, BookOpen, AlertTriangle, Bookmark, Hash, AlignLeft
} from 'lucide-react';

import { seccionService } from '../../services/seccionesService';
import { especialidadService } from '../../services/especialidadService';
import { THEME_COLORS } from '../../theme/colors';

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    especialidad_codigo: '',
    estado: 'ACTIVO',
};

function obtenerErrores(error) {
    const errores = error?.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error?.response?.data?.message || error?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

function extraerArreglo(respuesta) {
    if (Array.isArray(respuesta)) return respuesta;
    if (respuesta?.data && Array.isArray(respuesta.data)) return respuesta.data;
    if (respuesta?.data?.data && Array.isArray(respuesta.data.data)) return respuesta.data.data;
    return [];
}

export default function SeccionesPorEspecialidad() {
    // Estado principal de datos agrupados
    const [carrerasAgrupadas, setCarrerasAgrupadas] = useState([]);
    
    // Estados de búsqueda, filtro y paginación
    const [busqueda, setBusqueda] = useState('');
    const [soloActivos, setSoloActivos] = useState(false);
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    // Estados de carga y retroalimentación
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);
    const [eliminando, setEliminando] = useState(false);
    const [feedback, setFeedback] = useState(null);

    // Estados de Modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
    const [seccionAEliminar, setSeccionAEliminar] = useState(null);

    // Carga de datos: Especialidades y sus Secciones
    const cargarDatos = useCallback(async () => {
        setCargando(true);
        setFeedback(null);
        try {
            // 1. Obtener especialidades
            const paramsEsp = {};
            if (soloActivos) paramsEsp.solo_activos = 1;
            const respEsp = await especialidadService.listar(paramsEsp);
            let listaEsp = extraerArreglo(respEsp);

            // Filtro local de búsqueda
            if (busqueda.trim()) {
                const term = busqueda.toLowerCase().trim();
                listaEsp = listaEsp.filter(e => 
                    (e.codigo && String(e.codigo).toLowerCase().includes(term)) || 
                    (e.nombre && String(e.nombre).toLowerCase().includes(term))
                );
            }

            // 2. Obtener todas las secciones
            let listaSec = [];
            try {
                const respSec = await seccionService.listar();
                listaSec = extraerArreglo(respSec);
            } catch (err) {
                console.warn('No se pudieron obtener secciones globales:', err);
            }

            // 3. Agrupar Secciones dentro de Especialidades
            const agrupado = listaEsp.map((esp) => {
                const codEsp = String(esp.codigo || esp.id).trim();
                const secAsociadas = listaSec.filter(sec => String(sec.especialidad_codigo || sec.carrera_id).trim() === codEsp);
                return {
                    codigo: codEsp,
                    nombre: esp.nombre || 'Sin nombre',
                    estado: esp.estado || 'ACTIVO',
                    secciones: secAsociadas
                };
            });

            setCarrerasAgrupadas(agrupado);
        } catch (error) {
            setCarrerasAgrupadas([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, soloActivos]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    // Abrir modal preseleccionando la especialidad de la fila
    const abrirNuevaSeccion = (carrera) => {
        setCarreraSeleccionada(carrera);
        setFormulario({
            ...FORMULARIO_VACIO,
            especialidad_codigo: carrera.codigo
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
    };

    const actualizarCampo = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }));

    const guardarSeccion = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const codigoSec = formulario.codigo.trim().toUpperCase();
        const datos = {
            codigo: codigoSec,
            nombre: formulario.nombre.trim() || `SECCIÓN ${codigoSec}`,
            especialidad_codigo: formulario.especialidad_codigo,
            carrera_id: formulario.especialidad_codigo,
            estado: formulario.estado,
        };

        try {
            if (seccionService.registrarEnCarrera) {
                await seccionService.registrarEnCarrera(datos);
            } else {
                await seccionService.registrar(datos);
            }

            setFeedback({ type: 'success', message: `Sección "${codigoSec}" registrada en ${formulario.especialidad_codigo}.` });
            setModalAbierto(false);
            await cargarDatos();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const confirmarEliminacion = async () => {
        if (!seccionAEliminar) return;
        setEliminando(true);

        try {
            if (seccionService.eliminarDeCarrera) {
                await seccionService.eliminarDeCarrera(seccionAEliminar.especialidad_codigo, seccionAEliminar.codigo);
            } else {
                await seccionService.eliminar(seccionAEliminar.codigo);
            }
            
            setFeedback({ type: 'success', message: `Sección "${seccionAEliminar.codigo}" eliminada correctamente.` });
            setSeccionAEliminar(null);
            await cargarDatos();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setEliminando(false);
        }
    };

    const carrerasPaginadas = carrerasAgrupadas.slice(
        pagina * filasPorPagina,
        pagina * filasPorPagina + filasPorPagina
    );

    const inputStyle = { 
        '& .MuiOutlinedInput-root': { 
            borderRadius: 2,
            transition: '0.3s ease-in-out',
            backgroundColor: '#ffffff',
            '&:hover fieldset': { borderColor: THEME_COLORS.primary },
            '&.Mui-focused fieldset': { boxShadow: `0 0 0 3px ${THEME_COLORS.primary}20` }
        } 
    };

    return (
        <Fade in={true} timeout={500}>
            <Container maxWidth="xl" sx={{ mt: { xs: 2, md: 4 }, mb: 4 }}>

                {/* --- HEADER MODERNIZADO --- */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: 2,
                        mb: 4,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box 
                            sx={{ 
                                p: 1.5, 
                                borderRadius: 3, 
                                backgroundColor: '#e0f2fe', 
                                color: THEME_COLORS.primary,
                                display: 'flex'
                            }}
                        >
                            <Layers size={26} />
                        </Box>
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary, letterSpacing: '-0.5px' }}>
                                Gestión de Secciones por Especialidad
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, fontWeight: 500 }}>
                                Administra los grupos operativos vinculados a cada programa de estudio.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {feedback && (
                    <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        {feedback.message}
                    </Alert>
                )}

                {/* --- BARRA DE BÚSQUEDA FLOTANTE --- */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 2.5,
                        mb: 3,
                        borderRadius: 3,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'stretch', md: 'center' },
                        gap: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center', flex: 1 }}>
                        <TextField
                            placeholder="Buscar especialidad por código o nombre..."
                            size="small"
                            value={busqueda}
                            onChange={(e) => {
                                setBusqueda(e.target.value);
                                setPagina(0);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && cargarDatos()}
                            sx={{ 
                                width: { xs: '100%', sm: 400 },
                                '& .MuiOutlinedInput-root': { borderRadius: 2.5, backgroundColor: '#f8fafc' }
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color="#94a3b8" />
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
                                    sx={{ color: THEME_COLORS.primary, '&.Mui-checked': { color: THEME_COLORS.primary } }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ color: THEME_COLORS.textPrimary, fontWeight: 600 }}>
                                    Solo especialidades activas
                                </Typography>
                            }
                        />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Button
                            variant="outlined"
                            startIcon={<Search size={16} />}
                            onClick={() => { setPagina(0); cargarDatos(); }}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, px: 2 }}
                        >
                            Buscar
                        </Button>
                        <Button
                            variant="text"
                            startIcon={<RefreshCw size={16} />}
                            onClick={() => {
                                setBusqueda('');
                                setSoloActivos(false);
                                setPagina(0);
                                cargarDatos();
                            }}
                            sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 600, color: '#64748b' }}
                        >
                            Limpiar
                        </Button>
                    </Box>
                </Paper>

                {/* --- TABLA PRINCIPAL AGRUPADA --- */}
                <TableContainer 
                    component={Paper} 
                    elevation={0} 
                    sx={{ 
                        borderRadius: 3, 
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                        overflow: 'hidden'
                    }}
                >
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', py: 2, width: '10%' }}>Cód.</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '30%' }}>Especialidad</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '10%' }}>Estado</TableCell>
                                <TableCell sx={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50%' }}>Secciones Operativas</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} thickness={5} sx={{ color: THEME_COLORS.primary }} />
                                    </TableCell>
                                </TableRow>
                            ) : carrerasPaginadas.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 8, color: '#94a3b8' }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'inline-flex' }}>
                                                <Layers size={32} color="#cbd5e1" />
                                            </Box>
                                            <Typography variant="body1" sx={{ fontWeight: 600, color: '#475569', mt: 1 }}>No se encontraron especialidades</Typography>
                                            <Typography variant="body2">Ajusta tu búsqueda o crea un nuevo registro en el módulo de Especialidades.</Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                carrerasPaginadas.map((carrera) => (
                                    <TableRow hover key={carrera.codigo} sx={{ '& td': { borderColor: '#f1f5f9' }, transition: 'backgroundColor 0.2s' }}>
                                        <TableCell>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Box sx={{ backgroundColor: '#f0f9ff', p: 0.5, borderRadius: 1.5, color: THEME_COLORS.primary }}>
                                                    <Bookmark size={16} />
                                                </Box>
                                                <Typography variant="body2" sx={{ fontWeight: 800, color: '#334155' }}>
                                                    {carrera.codigo}
                                                </Typography>
                                            </Stack>
                                        </TableCell>

                                        <TableCell>
                                            <Typography variant="body2" sx={{ fontWeight: 700, color: '#475569' }}>
                                                {carrera.nombre}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={carrera.estado}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: '0.7rem',
                                                    letterSpacing: '0.5px',
                                                    borderRadius: '8px',
                                                    px: 1,
                                                    backgroundColor: String(carrera.estado).toUpperCase() === 'ACTIVO' ? '#dcfce7' : '#fee2e2',
                                                    color: String(carrera.estado).toUpperCase() === 'ACTIVO' ? '#166534' : '#991b1b',
                                                }}
                                            />
                                        </TableCell>

                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                                                
                                                {/* Botón "+ Nueva" integrado en la fila de la especialidad */}
                                                <Button
                                                    type="button"
                                                    size="small"
                                                    startIcon={<Plus size={14} />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        abrirNuevaSeccion(carrera);
                                                    }}
                                                    sx={{
                                                        backgroundColor: '#f59e0b',
                                                        color: '#ffffff',
                                                        '&:hover': { backgroundColor: '#d97706' },
                                                        textTransform: 'none',
                                                        fontWeight: 800,
                                                        fontSize: '0.72rem',
                                                        px: 1.2,
                                                        py: 0.35,
                                                        borderRadius: '6px',
                                                        boxShadow: 'none',
                                                        minHeight: 28,
                                                        mr: 0.5
                                                    }}
                                                >
                                                    Nueva
                                                </Button>

                                                {/* Pastillas celestes de secciones con botón X */}
                                                {(carrera.secciones || []).map((sec) => {
                                                    const codigoSec = typeof sec === 'string' ? sec : sec.codigo;
                                                    return (
                                                        <Box
                                                            key={codigoSec}
                                                            sx={{
                                                                display: 'inline-flex',
                                                                alignItems: 'stretch',
                                                                height: 28,
                                                                borderRadius: '6px',
                                                                overflow: 'hidden',
                                                                border: '1px solid #e0f2fe'
                                                            }}
                                                        >
                                                            <Box
                                                                sx={{
                                                                    backgroundColor: '#38bdf8',
                                                                    color: '#ffffff',
                                                                    fontWeight: 800,
                                                                    fontSize: '0.75rem',
                                                                    px: 1.8,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    letterSpacing: 0.5
                                                                }}
                                                            >
                                                                {codigoSec}
                                                            </Box>
                                                            <Tooltip title={`Eliminar sección ${codigoSec}`}>
                                                                <Box
                                                                    component="button"
                                                                    type="button"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSeccionAEliminar({
                                                                            especialidad_codigo: carrera.codigo,
                                                                            especialidad_nombre: carrera.nombre,
                                                                            codigo: codigoSec
                                                                        });
                                                                    }}
                                                                    sx={{
                                                                        backgroundColor: '#ef4444',
                                                                        border: 'none',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        px: 0.8,
                                                                        color: '#ffffff',
                                                                        transition: '0.2s',
                                                                        '&:hover': { backgroundColor: '#b91c1c' }
                                                                    }}
                                                                >
                                                                    <X size={14} strokeWidth={3} />
                                                                </Box>
                                                            </Tooltip>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    
                    <Box sx={{ borderTop: '1px solid #f1f5f9', backgroundColor: '#fcfcfc' }}>
                        <TablePagination
                            component="div"
                            count={carrerasAgrupadas.length}
                            page={pagina}
                            onPageChange={(e, newPage) => setPagina(newPage)}
                            rowsPerPage={filasPorPagina}
                            onRowsPerPageChange={(e) => {
                                setFilasPorPagina(parseInt(e.target.value, 10));
                                setPagina(0);
                            }}
                            labelRowsPerPage="Especialidades por página:"
                        />
                    </Box>
                </TableContainer>

                {/* --- MODAL DE REGISTRO DE SECCIÓN (DISEÑO PREMIUM) --- */}
                <Dialog
                    open={modalAbierto}
                    onClose={cerrarModal}
                    fullWidth
                    maxWidth="sm"
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 24px 48px rgba(0,0,0,0.1)' } }}
                >
                    <Box component="form" onSubmit={guardarSeccion}>
                        {/* Cabecera del Modal */}
                        <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box sx={{ backgroundColor: '#f0f9ff', color: THEME_COLORS.primary, p: 1.5, borderRadius: 3, display: 'flex' }}>
                                    <Layers size={24} />
                                </Box>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>
                                        Añadir Nueva Sección
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', mt: 0.5 }}>
                                        Complete la información para habilitar el grupo.
                                    </Typography>
                                </Box>
                            </Stack>
                            <IconButton onClick={cerrarModal} size="small" sx={{ backgroundColor: '#f1f5f9', '&:hover':{backgroundColor:'#e2e8f0'} }}>
                                <X size={20} color="#64748b" />
                            </IconButton>
                        </DialogTitle>

                        <DialogContent sx={{ px: 3, pb: 4, pt: '10px !important' }}>
                            
                            {/* Banner Informativo de la Especialidad */}
                            <Paper 
                                elevation={0} 
                                sx={{ 
                                    p: 2, 
                                    mb: 3, 
                                    borderRadius: 3, 
                                    backgroundColor: '#f8fafc', 
                                    border: '1px solid #e2e8f0', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1.5 
                                }}
                            >
                                <Box sx={{ p: 1, borderRadius: 2, backgroundColor: '#ffffff', color: '#64748b', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                    <Bookmark size={20} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Programa de Estudio Seleccionado
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700, fontSize: '0.9rem' }}>
                                        {carreraSeleccionada?.codigo} — {carreraSeleccionada?.nombre}
                                    </Typography>
                                </Box>
                            </Paper>

                            {/* Campos del Formulario */}
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Código de Sección <span style={{color: '#ef4444'}}>*</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        required
                                        placeholder="Ej. A, B, UNICA"
                                        size="medium"
                                        value={formulario.codigo}
                                        onChange={(e) => actualizarCampo('codigo', e.target.value.toUpperCase())}
                                        sx={inputStyle}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Hash size={18} color="#94a3b8" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Estado Operativo <span style={{color: '#ef4444'}}>*</span>
                                    </Typography>
                                    <TextField
                                        select
                                        fullWidth
                                        required
                                        size="medium"
                                        value={formulario.estado}
                                        onChange={(e) => actualizarCampo('estado', e.target.value)}
                                        sx={inputStyle}
                                    >
                                        <MenuItem value="ACTIVO">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>ACTIVO</Typography>
                                            </Box>
                                        </MenuItem>
                                        <MenuItem value="INACTIVO">
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#ef4444' }} />
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>INACTIVO</Typography>
                                            </Box>
                                        </MenuItem>
                                    </TextField>
                                </Grid>

                                <Grid item xs={12}>
                                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1, color: '#475569' }}>
                                        Nombre Descriptivo <span style={{color: '#94a3b8', fontWeight: 500}}>(Opcional)</span>
                                    </Typography>
                                    <TextField
                                        fullWidth
                                        placeholder="Ej. SECCIÓN A - TURNO MAÑANA"
                                        size="medium"
                                        value={formulario.nombre}
                                        onChange={(e) => actualizarCampo('nombre', e.target.value)}
                                        sx={inputStyle}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <AlignLeft size={18} color="#94a3b8" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </DialogContent>

                        {/* Acciones del Modal */}
                        <DialogActions sx={{ p: 3, pt: 0, gap: 1.5, borderTop: '1px solid #f1f5f9', mt: 1 }}>
                            <Button
                                type="button"
                                onClick={cerrarModal}
                                disabled={guardando}
                                sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover':{backgroundColor: '#f1f5f9'} }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={guardando}
                                sx={{
                                    backgroundColor: THEME_COLORS.primary,
                                    borderRadius: 2.5,
                                    px: 4,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
                                    '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                }}
                            >
                                {guardando ? 'Guardando...' : 'Crear y Asignar'}
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>

                {/* --- MODAL DE CONFIRMACIÓN DE ELIMINACIÓN --- */}
                <Dialog
                    open={Boolean(seccionAEliminar)}
                    onClose={() => !eliminando && setSeccionAEliminar(null)}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' } }}
                >
                    <DialogTitle sx={{ p: 3, pb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ backgroundColor: '#fef2f2', color: '#ef4444', p: 2, borderRadius: '50%', display: 'flex' }}>
                            <AlertTriangle size={32} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: 'center', color: '#1e293b' }}>
                            ¿Eliminar Sección?
                        </Typography>
                    </DialogTitle>
                    <DialogContent sx={{ px: 4, pb: 3 }}>
                        <Typography variant="body1" sx={{ color: '#475569', textAlign: 'center', lineHeight: 1.5 }}>
                            Se desvinculará la sección <strong style={{color: '#000'}}>{seccionAEliminar?.codigo}</strong> de la especialidad <strong style={{color: '#000'}}>{seccionAEliminar?.especialidad_nombre}</strong>. Esta acción no se puede deshacer.
                        </Typography>
                    </DialogContent>
                    <DialogActions sx={{ p: 3, pt: 0, justifyContent: 'center', gap: 2 }}>
                        <Button
                            type="button"
                            onClick={() => setSeccionAEliminar(null)}
                            disabled={eliminando}
                            sx={{ color: '#64748b', fontWeight: 700, textTransform: 'none', px: 3, '&:hover':{backgroundColor: '#f1f5f9'} }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={confirmarEliminacion}
                            variant="contained"
                            disabled={eliminando}
                            sx={{
                                backgroundColor: '#ef4444',
                                '&:hover': { backgroundColor: '#dc2626' },
                                borderRadius: 2.5,
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 4,
                                py: 1,
                                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
                            }}
                        >
                            {eliminando ? 'Eliminando...' : 'Sí, Eliminar'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </Fade>
    );
}