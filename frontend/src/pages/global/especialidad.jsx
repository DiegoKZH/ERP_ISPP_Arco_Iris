import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Button, Checkbox, Container, Dialog, DialogActions, DialogContent,
    DialogTitle, FormControlLabel, Grid, IconButton, MenuItem, Paper, Select,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography, Chip, Alert, CircularProgress
} from '@mui/material';
import { X, Pencil, Trash2, Plus, ChevronDown } from 'lucide-react';
import { especialidadService } from '../../services/especialidadService';
import { THEME_COLORS } from '../../theme/colors';

const FORMULARIO_VACIO = {
    codigo: '',
    nombre: '',
    estado: 'ACTIVO',
    agil: 'NO',
    calendario: 'SI',
    admision: 'SI',
    solicitar_datos: 'SI',
    email_coordinador: '',
    grado_bachiller: '',
    grado_titulo: ''
};

function obtenerErrores(error) {
    const errores = error.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error.response?.data?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

export default function GestionCarrera() {
    const [especialidades, setEspecialidades] = useState([]);
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [verSoloActivos, setVerSoloActivos] = useState(true);
    const [filtroPrograma, setFiltroPrograma] = useState(1); // 1: Ciencias Pedagógicas por defecto
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);
    const [especialidadSeleccionada, setEspecialidadSeleccionada] = useState(null);

    const [feedback, setFeedback] = useState(null);

    const cargarEspecialidades = useCallback(async () => {
        setCargando(true);
        try {
            const respuesta = await especialidadService.listar({
                programa_academico_id: filtroPrograma,
                solo_activos: verSoloActivos ? 1 : 0
            });
            setEspecialidades(Array.isArray(respuesta) ? respuesta : (respuesta.data || []));
        } catch (error) {
            setEspecialidades([]);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [filtroPrograma, verSoloActivos]);

    useEffect(() => {
        cargarEspecialidades();
    }, [cargarEspecialidades]);

    const abrirModalNuevo = () => {
        setEspecialidadSeleccionada(null);
        setFormulario(FORMULARIO_VACIO);
        setModalAbierto(true);
    };

    const abrirModalEdicion = (item) => {
        setEspecialidadSeleccionada(item);
        setFormulario({
            ...FORMULARIO_VACIO,
            ...item,
            codigo: item.codigo || item.carrera || ''
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
        setEspecialidadSeleccionada(null);
    };

    const handleChange = (campo, valor) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
    };

    const guardarEspecialidad = async (e) => {
        e.preventDefault();
        setGuardando(true);

        const datos = {
            ...formulario,
            programa_academico_id: filtroPrograma,
            codigo: formulario.codigo.trim().toUpperCase(),
            nombre: formulario.nombre.trim(),
            email_coordinador: formulario.email_coordinador ? formulario.email_coordinador.trim() : null,
            grado_bachiller: formulario.grado_bachiller ? formulario.grado_bachiller.trim() : null,
            grado_titulo: formulario.grado_titulo ? formulario.grado_titulo.trim() : null,
        };

        try {
            if (especialidadSeleccionada) {
                await especialidadService.actualizar(especialidadSeleccionada.id, datos);
                setFeedback({ type: 'success', message: 'Especialidad actualizada correctamente.' });
            } else {
                await especialidadService.registrar(datos);
                setFeedback({ type: 'success', message: 'Especialidad registrada correctamente.' });
            }
            setModalAbierto(false);
            await cargarEspecialidades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

    const eliminarEspecialidad = async (id) => {
        if (!window.confirm('¿Está seguro de eliminar esta especialidad?')) return;
        try {
            await especialidadService.eliminar(id);
            setFeedback({ type: 'success', message: 'Especialidad eliminada correctamente.' });
            await cargarEspecialidades();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        }
    };

    // Estilos para el formulario horizontal
    const labelStyle = {
        display: 'flex',
        alignItems: 'center',
        color: THEME_COLORS.textSecondary,
        fontSize: '0.85rem',
        fontWeight: 600
    };

    const inputProps = {
        size: 'small',
        fullWidth: true,
        sx: { '& .MuiOutlinedInput-root': { borderRadius: 1, bgcolor: '#fff' } }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
            
            {/* PANEL DE FILTROS SUPERIOR */}
            <Paper elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2, mb: 3, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: '#337ab7', color: '#fff', px: 2.5, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" fontWeight={700}>GESTION Carrera</Typography>
                    <ChevronDown size={18} />
                </Box>
                
                <Box sx={{ p: 3, bgcolor: '#fbfbfb' }}>
                    <Grid container spacing={2} sx={{ maxWidth: 600 }}>
                        <Grid item xs={12}>
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 1, color: THEME_COLORS.textSecondary }}>
                                Seleccionar Prog. Académico:
                            </Typography>
                            <Select
                                size="small"
                                fullWidth
                                value={filtroPrograma}
                                onChange={(e) => setFiltroPrograma(e.target.value)}
                                sx={{ bgcolor: '#fff', borderRadius: 1 }}
                            >
                                <MenuItem value={1}>CIENCIAS PEDAGÓGICAS</MenuItem>
                                <MenuItem value={2}>CIENCIAS DE LA SALUD</MenuItem>
                            </Select>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControlLabel
                                control={<Checkbox checked={verSoloActivos} onChange={(e) => setVerSoloActivos(e.target.checked)} color="primary" size="small" />}
                                label={<Typography variant="body2" color={THEME_COLORS.textSecondary} fontWeight={600}>Ver Solo Activos</Typography>}
                                sx={{ ml: 0.5 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                onClick={cargarEspecialidades}
                                sx={{ bgcolor: '#5cb85c', color: '#fff', textTransform: 'none', px: 3, fontWeight: 700, '&:hover': { bgcolor: '#4cae4c' } }}
                            >
                                Ver Carrera
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Paper>

            {/* Feedback Alert */}
            {feedback && (
                <Alert severity={feedback.type} onClose={() => setFeedback(null)} sx={{ mb: 3, borderRadius: 2 }}>
                    {feedback.message}
                </Alert>
            )}

            {/* PANEL DE TABLA: ESPECIALIDADES */}
            <Paper elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2, overflow: 'hidden' }}>
                <Box sx={{ px: 3, py: 2.5, borderBottom: `1px solid ${THEME_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
                    <Typography variant="h6" color={THEME_COLORS.textSecondary} fontWeight={600}>Especialidades</Typography>
                    <Button 
                        variant="contained" 
                        startIcon={<Plus size={16} />}
                        onClick={abrirModalNuevo}
                        sx={{ bgcolor: '#5bc0de', color: '#fff', textTransform: 'none', fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#31b0d5', boxShadow: 'none' } }}
                    >
                        Especialidad Independiente
                    </Button>
                </Box>
                
                <TableContainer>
                    <Table sx={{ minWidth: 900 }}>
                        <TableHead>
                            <TableRow sx={{ '& th': { borderBottom: `2px solid ${THEME_COLORS.border}`, color: '#333', fontWeight: 700, fontSize: '0.8rem', bgcolor: '#f8fafc' } }}>
                                <TableCell>CARRERA</TableCell>
                                <TableCell>Nombre</TableCell>
                                <TableCell align="center">Ágil</TableCell>
                                <TableCell align="center">Calendario</TableCell>
                                <TableCell align="center">Admisión</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {cargando ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : especialidades.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                        No se encontraron especialidades registradas.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                especialidades.map((row) => (
                                    <TableRow key={row.id} hover sx={{ '& td': { color: '#334155', fontSize: '0.85rem', borderBottom: '1px solid #f1f5f9' } }}>
                                        <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>{row.codigo}</TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                <span style={{ fontWeight: 600 }}>{row.nombre}</span>
                                                {row.estado === 'ACTIVO' && (
                                                    <Chip label="Activo" size="small" sx={{ bgcolor: '#a3d977', color: '#fff', height: 20, fontSize: '0.7rem', fontWeight: 700, borderRadius: 1 }} />
                                                )}
                                            </Box>
                                        </TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>{row.agil}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>{row.calendario}</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 600 }}>{row.admision}</TableCell>
                                        <TableCell align="center">
                                            <IconButton size="small" onClick={() => abrirModalEdicion(row)} sx={{ bgcolor: '#f0ad4e', color: '#fff', borderRadius: 1, p: 0.5, mr: 1, '&:hover': { bgcolor: '#eea236' } }}>
                                                <Pencil size={14} />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => eliminarEspecialidad(row.id)} sx={{ bgcolor: '#d9534f', color: '#fff', borderRadius: 1, p: 0.5, '&:hover': { bgcolor: '#c9302c' } }}>
                                                <Trash2 size={14} />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* MODAL HORIZONTAL DE REGISTRO / EDICIÓN */}
            <Dialog 
                open={modalAbierto} 
                onClose={cerrarModal} 
                maxWidth="md" 
                fullWidth 
                PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
            >
                <form onSubmit={guardarEspecialidad}>
                    <DialogTitle sx={{ bgcolor: '#1abc9c', color: '#fff', p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            {especialidadSeleccionada ? 'Editar Especialidad Independiente' : 'Agregar Especialidad Independiente'}
                        </Typography>
                        <IconButton size="small" onClick={cerrarModal} sx={{ color: '#fff' }}>
                            <X size={20} />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 4 }}>
                        <Grid container spacing={2.5}>
                            <Grid item xs={4} sx={labelStyle}>Codigo</Grid>
                            <Grid item xs={8}><TextField {...inputProps} required value={formulario.codigo} onChange={e => handleChange('codigo', e.target.value.toUpperCase())} placeholder="Ej. EF" /></Grid>

                            <Grid item xs={4} sx={labelStyle}>Nombre</Grid>
                            <Grid item xs={8}><TextField {...inputProps} required value={formulario.nombre} onChange={e => handleChange('nombre', e.target.value)} placeholder="Ej. EF - EDUCACIÓN FÍSICA" /></Grid>

                            <Grid item xs={4} sx={labelStyle}>Estado</Grid>
                            <Grid item xs={8}>
                                <Select {...inputProps} value={formulario.estado} onChange={e => handleChange('estado', e.target.value)}>
                                    <MenuItem value="ACTIVO">ACTIVO</MenuItem>
                                    <MenuItem value="INACTIVO">INACTIVO</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={4} sx={labelStyle}>Ágil</Grid>
                            <Grid item xs={8}>
                                <Select {...inputProps} value={formulario.agil} onChange={e => handleChange('agil', e.target.value)}>
                                    <MenuItem value="SI">SI</MenuItem>
                                    <MenuItem value="NO">NO</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={4} sx={labelStyle}>Calendario</Grid>
                            <Grid item xs={8}>
                                <Select {...inputProps} value={formulario.calendario} onChange={e => handleChange('calendario', e.target.value)}>
                                    <MenuItem value="SI">SI</MenuItem>
                                    <MenuItem value="NO">NO</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={4} sx={labelStyle}>¿Disponible en Admisión?</Grid>
                            <Grid item xs={8}>
                                <Select {...inputProps} value={formulario.admision} onChange={e => handleChange('admision', e.target.value)}>
                                    <MenuItem value="SI">SI</MenuItem>
                                    <MenuItem value="NO">NO</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={4} sx={labelStyle}>Solicitar los datos del alumno de forma obligatoria:</Grid>
                            <Grid item xs={8}>
                                <Select {...inputProps} value={formulario.solicitar_datos} onChange={e => handleChange('solicitar_datos', e.target.value)}>
                                    <MenuItem value="SI">SI</MenuItem>
                                    <MenuItem value="NO">NO</MenuItem>
                                </Select>
                            </Grid>

                            <Grid item xs={4} sx={labelStyle}>Email coordinador</Grid>
                            <Grid item xs={8}><TextField {...inputProps} type="email" value={formulario.email_coordinador} onChange={e => handleChange('email_coordinador', e.target.value)} /></Grid>

                            <Grid item xs={4} sx={labelStyle}>Denominación de Grado Bachiller</Grid>
                            <Grid item xs={8}><TextField {...inputProps} value={formulario.grado_bachiller} onChange={e => handleChange('grado_bachiller', e.target.value)} /></Grid>

                            <Grid item xs={4} sx={labelStyle}>Denominación de Grado Título</Grid>
                            <Grid item xs={8}><TextField {...inputProps} value={formulario.grado_titulo} onChange={e => handleChange('grado_titulo', e.target.value)} /></Grid>
                        </Grid>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, borderTop: `1px solid ${THEME_COLORS.border}`, justifyContent: 'center', gap: 1.5, bgcolor: '#f8fafc' }}>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={guardando}
                            sx={{ bgcolor: '#5cb85c', color: '#fff', textTransform: 'none', px: 4, fontWeight: 700, '&:hover': { bgcolor: '#4cae4c' } }}
                        >
                            {guardando ? 'Guardando...' : (especialidadSeleccionada ? 'Actualizar' : 'Agregar')}
                        </Button>
                        <Button 
                            type="button"
                            onClick={cerrarModal} 
                            disabled={guardando}
                            variant="contained" 
                            sx={{ bgcolor: '#bdc3c7', color: '#fff', textTransform: 'none', px: 4, fontWeight: 700, boxShadow: 'none', '&:hover': { bgcolor: '#aab7b7', boxShadow: 'none' } }}
                        >
                            Volver
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}