import React, { useCallback, useEffect, useState } from 'react';
import {
    Box, Container, Paper, Typography, Button, IconButton, Table, TableBody,
    TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, Tooltip, Alert, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions, Divider, Grid, MenuItem, InputAdornment, Avatar, Stack, Snackbar
} from '@mui/material';
import {
    Plus, Search, RefreshCw, Pencil, X, Users, UserRound, Mail, Phone, GraduationCap
} from 'lucide-react';

import { alumnoService } from '../../services/alumnoService';
import { THEME_COLORS } from '../../theme/colors';

const FORMULARIO_VACIO = {
    tipo_documento: 'DNI',
    numero_documento: '',
    nombres: '',
    apellido_paterno: '',
    apellido_materno: '',
    sexo: '',
    fecha_nacimiento: '',
    codigo_estudiante: '',
    celular: '',
    correo_institucional: '',
    correo_personal: '',
};

const TIPOS_DOCUMENTO = ['DNI', 'Carné de Extranjería', 'Pasaporte', 'PTP', 'CURP', 'Cédula'];

function obtenerErrores(error) {
    const errores = error.response?.data?.errors;
    if (errores) return Object.values(errores).flat().join(' ');
    return error.response?.data?.message || 'Ocurrió un error al comunicarse con el servidor.';
}

export default function GestionAlumnos() {
    const [alumnos, setAlumnos] = useState([]);
    const [total, setTotal] = useState(0);
    
    // Estados de búsqueda y paginación
    const [busqueda, setBusqueda] = useState('');
    const [pagina, setPagina] = useState(0);
    const [filasPorPagina, setFilasPorPagina] = useState(10);

    // Estados de carga
    const [cargando, setCargando] = useState(false);
    const [guardando, setGuardando] = useState(false);

    // Estados del Modal
    const [modalAbierto, setModalAbierto] = useState(false);
    const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);
    const [formulario, setFormulario] = useState(FORMULARIO_VACIO);

    // Alertas tipo Feedback
    const [feedback, setFeedback] = useState(null);

    const cargarAlumnos = useCallback(async () => {
        setCargando(true);
        try {
            const respuesta = await alumnoService.listar({
                buscar: busqueda.trim(),
                page: pagina + 1,
                per_page: filasPorPagina,
            });
            const resultado = respuesta.data;
            setAlumnos(Array.isArray(resultado) ? resultado : []);
            setTotal(respuesta.total ?? resultado?.length ?? 0);
        } catch (error) {
            setAlumnos([]);
            setTotal(0);
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setCargando(false);
        }
    }, [busqueda, pagina, filasPorPagina]);

    useEffect(() => {
        cargarAlumnos();
    }, [cargarAlumnos]);

    const abrirNuevoAlumno = () => {
        setAlumnoSeleccionado(null);
        setFormulario({ ...FORMULARIO_VACIO });
        setModalAbierto(true);
    };

    const abrirEdicion = (alumno) => {
        setAlumnoSeleccionado(alumno);
        setFormulario({
            ...FORMULARIO_VACIO,
            ...alumno,
            fecha_nacimiento: alumno.fecha_nacimiento ? String(alumno.fecha_nacimiento).slice(0, 10) : '',
            correo_institucional: alumno.correo_institucional || '',
            correo_personal: alumno.correo_personal || '',
            celular: alumno.celular || '',
            sexo: alumno.sexo || '',
        });
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        if (guardando) return;
        setModalAbierto(false);
        setAlumnoSeleccionado(null);
    };

    const actualizarCampo = (campo, valor) => setFormulario((prev) => ({ ...prev, [campo]: valor }));

    const guardarAlumno = async (event) => {
        event.preventDefault();
        setGuardando(true);

        const datos = {
            ...formulario,
            tipo_documento: formulario.tipo_documento.trim(),
            numero_documento: formulario.numero_documento.trim(),
            nombres: formulario.nombres.trim(),
            apellido_paterno: formulario.apellido_paterno.trim(),
            apellido_materno: formulario.apellido_materno ? formulario.apellido_materno.trim() : null,
            codigo_estudiante: formulario.codigo_estudiante.trim(),
            sexo: formulario.sexo || null,
            fecha_nacimiento: formulario.fecha_nacimiento || null,
            celular: formulario.celular.trim() || null,
            correo_institucional: formulario.correo_institucional.trim() || null,
            correo_personal: formulario.correo_personal.trim() || null,
        };

        try {
            if (alumnoSeleccionado) {
                await alumnoService.actualizar(alumnoSeleccionado.id, datos);
                setFeedback({ type: 'success', message: 'Estudiante actualizado correctamente en el sistema.' });
            } else {
                await alumnoService.registrar(datos);
                setFeedback({ type: 'success', message: 'Estudiante registrado correctamente en el sistema.' });
            }
            setModalAbierto(false);
            await cargarAlumnos();
        } catch (error) {
            setFeedback({ type: 'error', message: obtenerErrores(error) });
        } finally {
            setGuardando(false);
        }
    };

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
                            Directorio de Estudiantes (IESPP ARCO IRIS)
                        </Typography>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                            Gestión oficial de datos personales, identificación y contacto de los estudiantes matriculados.
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={abrirNuevoAlumno}
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
                        Nuevo Estudiante
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
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 2,
                }}
            >
                <TextField
                    placeholder="Buscar por DNI, Nombres o Código de Estudiante..."
                    size="small"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && cargarAlumnos()}
                    sx={{ width: { xs: '100%', sm: 460 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search size={18} style={{ color: THEME_COLORS.textSecondary }} />
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<Search size={16} />}
                        onClick={() => { setPagina(0); cargarAlumnos(); }}
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
                            setPagina(0);
                            setTimeout(() => cargarAlumnos(), 0);
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
                <Table sx={{ minWidth: 900 }}>
                    <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Código Estudiante</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Apellidos y Nombres</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Documento de Identidad</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Información de Contacto</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {cargando ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : alumnos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                    <Users size={40} color={THEME_COLORS.border} style={{ marginBottom: 16 }} />
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>No se encontraron estudiantes</Typography>
                                    <Typography variant="body2">Ajusta los criterios de búsqueda o registra un nuevo estudiante.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            alumnos.map((alumno) => (
                                <TableRow hover key={alumno.id}>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>
                                            {alumno.codigo_estudiante}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
                                            {`${alumno.apellido_paterno} ${alumno.apellido_materno || ''}, ${alumno.nombres}`}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                            {alumno.sexo || 'Sin especificar'}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {alumno.numero_documento}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                            {alumno.tipo_documento}
                                        </Typography>
                                    </TableCell>
                                    
                                    <TableCell>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: THEME_COLORS.textSecondary }}>
                                                <Mail size={12} /> {alumno.correo_institucional || '—'}
                                            </Typography>
                                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: THEME_COLORS.textSecondary }}>
                                                <Phone size={12} /> {alumno.celular || '—'}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    
                                    <TableCell align="center">
                                        <Tooltip title="Editar Datos del Estudiante">
                                            <IconButton 
                                                onClick={() => abrirEdicion(alumno)} 
                                                size="small"
                                                sx={{ 
                                                    color: THEME_COLORS.primary, 
                                                    backgroundColor: '#f0f9ff', 
                                                    borderRadius: 2, 
                                                    '&:hover': { backgroundColor: '#e0f2fe' } 
                                                }}
                                            >
                                                <Pencil size={16} />
                                            </IconButton>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
                <TablePagination
                    component="div"
                    count={total}
                    page={pagina}
                    onPageChange={(e, newPage) => setPagina(newPage)}
                    rowsPerPage={filasPorPagina}
                    onRowsPerPageChange={(e) => { setFilasPorPagina(parseInt(e.target.value, 10)); setPagina(0); }}
                    labelRowsPerPage="Filas por página:"
                    sx={{ borderTop: `1px solid ${THEME_COLORS.border}` }}
                />
            </TableContainer>

            {/* MODAL DE REGISTRO/EDICIÓN (DIALOG) */}
            <Dialog 
                open={modalAbierto} 
                onClose={cerrarModal} 
                fullWidth 
                maxWidth="md"
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <Box component="form" onSubmit={guardarAlumno}>
                    
                    {/* Header del Modal */}
                    <DialogTitle sx={{ p: 3, borderBottom: `1px solid ${THEME_COLORS.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box sx={{ backgroundColor: THEME_COLORS.primary, color: '#fff', p: 1, borderRadius: 2, display: 'flex' }}>
                                <UserRound size={20} />
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, lineHeight: 1.2 }}>
                                    {alumnoSeleccionado ? 'Actualizar Ficha' : 'Nuevo Estudiante'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                    Información personal y de contacto
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
                                    1. Identidad del Estudiante
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                                <TextField select fullWidth required label="Documento" size="small" value={formulario.tipo_documento} onChange={(e) => actualizarCampo('tipo_documento', e.target.value)} sx={inputStyle}>
                                    {TIPOS_DOCUMENTO.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField fullWidth required label="Nº Documento" size="small" value={formulario.numero_documento} onChange={(e) => actualizarCampo('numero_documento', e.target.value)} sx={inputStyle} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth required label="Nombres" size="small" value={formulario.nombres} onChange={(e) => actualizarCampo('nombres', e.target.value)} sx={inputStyle} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth required label="Apellido Paterno" size="small" value={formulario.apellido_paterno} onChange={(e) => actualizarCampo('apellido_paterno', e.target.value)} sx={inputStyle} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Apellido Materno (Opcional)" size="small" value={formulario.apellido_materno} onChange={(e) => actualizarCampo('apellido_materno', e.target.value)} sx={inputStyle} />
                            </Grid>
                            
                            <Grid item xs={12}><Divider sx={{ my: 1, borderColor: THEME_COLORS.border }} /></Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: THEME_COLORS.textSecondary }}>
                                    2. Datos Demográficos
                                </Typography>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                                <TextField select fullWidth label="Sexo" size="small" value={formulario.sexo} onChange={(e) => actualizarCampo('sexo', e.target.value)} sx={inputStyle}>
                                    <MenuItem value="MASCULINO">Masculino</MenuItem>
                                    <MenuItem value="FEMENINO">Femenino</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth type="date" label="Fecha Nac." size="small" value={formulario.fecha_nacimiento} onChange={(e) => actualizarCampo('fecha_nacimiento', e.target.value)} InputLabelProps={{ shrink: true }} sx={inputStyle} />
                            </Grid>

                            <Grid item xs={12}><Divider sx={{ my: 1, borderColor: THEME_COLORS.border }} /></Grid>
                            
                            <Grid item xs={12}>
                                <Typography variant="overline" sx={{ fontWeight: 800, color: THEME_COLORS.textSecondary }}>
                                    3. Institucional y Contacto
                                </Typography>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth required label="Cód. Estudiante" size="small" value={formulario.codigo_estudiante} onChange={(e) => actualizarCampo('codigo_estudiante', e.target.value)} sx={inputStyle} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Celular" size="small" value={formulario.celular} onChange={(e) => actualizarCampo('celular', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Phone size={16} /></InputAdornment> }} sx={inputStyle} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth type="email" label="Correo Institucional" size="small" value={formulario.correo_institucional} onChange={(e) => actualizarCampo('correo_institucional', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment> }} sx={inputStyle} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth type="email" label="Correo Personal" size="small" value={formulario.correo_personal} onChange={(e) => actualizarCampo('correo_personal', e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Mail size={16} /></InputAdornment> }} sx={inputStyle} />
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
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover } 
                            }}
                        >
                            {guardando ? 'Guardando...' : 'Guardar Ficha'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Container>
    );
}