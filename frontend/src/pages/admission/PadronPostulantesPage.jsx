import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';
import DocumentViewerModal from './DocumentViewerModal';
import {
    Users,
    Plus,
    Search,
    RefreshCw,
    CheckCircle2,
    Printer,
    FileText,
    ShieldCheck,
    CreditCard,
    Lock,
    Trash2,
    AlertCircle,
    UserCheck,
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
    Tooltip,
    InputAdornment,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';

export default function PadronPostulantesPage() {
    const navigate = useNavigate();

    // Estados
    const [procesos, setProcesos] = useState([]);
    const [selectedProcesoId, setSelectedProcesoId] = useState('');
    const [procesoDetalle, setProcesoDetalle] = useState(null);

    const [postulaciones, setPostulaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [filtroEstado, setFiltroEstado] = useState('TODOS');

    // Modal Visor de Documentos
    const [docViewerModal, setDocViewerModal] = useState({
        open: false,
        title: '',
        printUrl: '',
    });

    // Modal de Confirmación para Eliminar Postulante
    const [deleteModal, setDeleteModal] = useState({
        open: false,
        postulacion: null,
        loading: false,
    });

    // Alertas
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        loadProcesos();
    }, []);

    useEffect(() => {
        if (selectedProcesoId) {
            loadPostulaciones();
            loadProcesoDetalle(selectedProcesoId);
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
            setFeedback({ type: 'error', message: 'Error al cargar las convocatorias.' });
        }
    };

    const loadProcesoDetalle = async (id) => {
        try {
            const detalle = await admissionService.getProceso(id);
            setProcesoDetalle(detalle);
        } catch (err) {
            console.error(err);
        }
    };

    const loadPostulaciones = async () => {
        if (!selectedProcesoId) return;
        setLoading(true);
        try {
            const params = {
                admision_proceso_id: selectedProcesoId,
                search: search.trim() || undefined,
                estado_inscripcion: filtroEstado !== 'TODOS' ? filtroEstado : undefined,
                per_page: 50,
            };
            const res = await admissionService.getPostulaciones(params);
            setPostulaciones(res.data || []);
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al consultar el padrón de postulantes.' });
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.postulacion) return;
        setDeleteModal((prev) => ({ ...prev, loading: true }));
        try {
            const res = await admissionService.deletePostulacion(deleteModal.postulacion.id);
            setFeedback({ type: 'success', message: res.message || 'Postulante eliminado y correlativo liberado.' });
            setDeleteModal({ open: false, postulacion: null, loading: false });
            loadPostulaciones();
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Error al eliminar al postulante.',
            });
            setDeleteModal((prev) => ({ ...prev, loading: false }));
        }
    };

    const isConvocatoriaCerrada = procesoDetalle?.estado === 'CONVOCATORIA_CERRADA';

    return (
        <Container maxWidth="xl" sx={{ pb: 6 }}>
            {/* ENCABEZADO SUPERIOR — Estilo Barra Azul Oscuro */}
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
                        <Users size={22} />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5, color: THEME_COLORS.textLight }}>
                            Padrón Oficial de Postulantes
                        </Typography>
                        <Typography variant="caption" sx={{ color: THEME_COLORS.textMuted }}>
                            Registro y control oficial de postulantes de admisión
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <TextField
                        select
                        size="small"
                        label="Convocatoria Activa"
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
                                {p.codigo} — {p.nombre} ({p.estado === 'CONVOCATORIA_ABIERTA' ? 'ABIERTA' : 'CERRADA'})
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        disabled={isConvocatoriaCerrada}
                        onClick={() => navigate('/admission/inscribir')}
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
                        Inscribir Postulante
                    </Button>
                </Box>
            </Paper>

            {/* Alertas */}
            {isConvocatoriaCerrada && (
                <Alert severity="warning" icon={<Lock size={20} />} sx={{ mb: 3, borderRadius: 2, fontWeight: 700 }}>
                    Esta convocatoria se encuentra actualmente <strong>CERRADA</strong>. Se ha pausado la recepción de nuevas solicitudes.
                </Alert>
            )}

            {feedback && (
                <Alert
                    severity={feedback.type}
                    onClose={() => setFeedback(null)}
                    sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}
                >
                    {feedback.message}
                </Alert>
            )}

            {/* Barra de Filtros y Búsqueda */}
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
                <Box sx={{ display: 'flex', gap: 1.5, flexGrow: 1, maxWidth: 650 }}>
                    <TextField
                        placeholder="Buscar por DNI, Nombres, N° de FUT o Código de Postulante..."
                        size="small"
                        fullWidth
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && loadPostulaciones()}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search size={18} color={THEME_COLORS.textSecondary} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="outlined"
                        onClick={loadPostulaciones}
                        disabled={loading}
                        sx={{
                            borderColor: THEME_COLORS.border,
                            color: THEME_COLORS.textPrimary,
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 2,
                        }}
                    >
                        Buscar
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TextField
                        select
                        size="small"
                        label="Estado"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        sx={{ minWidth: 170 }}
                    >
                        <MenuItem value="TODOS">Todos los Estados</MenuItem>
                        <MenuItem value="PENDIENTE_PAGO">Pendiente de Pago</MenuItem>
                        <MenuItem value="PAGO_VALIDADO">Pago Validado</MenuItem>
                        <MenuItem value="INSCRITO">Inscrito Oficial</MenuItem>
                    </TextField>

                    <IconButton onClick={loadPostulaciones} title="Actualizar padrón" size="small">
                        <RefreshCw size={18} color={THEME_COLORS.textSecondary} />
                    </IconButton>
                </Box>
            </Paper>

            {/* TABLA OFICIAL DEL PADRÓN */}
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
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Código / FUT</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Postulante (DNI & Nombres)</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Especialidad Ofertada</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Colegio Procedencia</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Tesorería (Pago)</TableCell>
                            <TableCell sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Estado</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={32} />
                                    <Typography variant="body2" sx={{ mt: 1, color: THEME_COLORS.textSecondary }}>
                                        Cargando padrón oficial...
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : postulaciones.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    <AlertCircle size={36} color={THEME_COLORS.textMuted} style={{ margin: '0 auto 8px' }} />
                                    <Typography variant="body1" fontWeight={700} color={THEME_COLORS.textPrimary}>
                                        No se encontraron postulantes registrados
                                    </Typography>
                                    <Typography variant="body2" color={THEME_COLORS.textSecondary}>
                                        Inicie un nuevo registro con el botón "Inscribir Postulante".
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            postulaciones.map((p) => {
                                const persona = p.persona || {};
                                const programa = p.programa_ofertado?.programa || 'Por definir';
                                const isPagado = p.estado_pago === 'PAGADO';
                                const isInscrito = p.estado_inscripcion === 'INSCRITO';

                                return (
                                    <TableRow key={p.id} hover sx={{ '&:hover': { bgcolor: '#f8fafc' } }}>
                                        {/* Código / FUT */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={800} color={THEME_COLORS.primary}>
                                                {p.codigo_postulante}
                                            </Typography>
                                            {p.numero_fut ? (
                                                <Chip
                                                    label={p.numero_fut}
                                                    size="small"
                                                    sx={{
                                                        fontSize: 10,
                                                        height: 20,
                                                        bgcolor: THEME_COLORS.infoLight,
                                                        color: THEME_COLORS.infoText,
                                                        fontWeight: 800,
                                                        mt: 0.5,
                                                    }}
                                                />
                                            ) : (
                                                <Typography variant="caption" color="text.secondary">
                                                    Sin FUT
                                                </Typography>
                                            )}
                                        </TableCell>

                                        {/* Postulante */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color={THEME_COLORS.textPrimary}>
                                                {persona.apellido_paterno} {persona.apellido_materno}, {persona.nombres}
                                            </Typography>
                                            <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                                                {persona.tipo_documento || 'DNI'}: <strong>{persona.numero_documento}</strong>
                                                {persona.celular ? ` • Cel: ${persona.celular}` : ''}
                                            </Typography>
                                        </TableCell>

                                        {/* Especialidad */}
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600} color={THEME_COLORS.textPrimary}>
                                                {programa}
                                            </Typography>
                                            <Typography variant="caption" color={THEME_COLORS.textSecondary}>
                                                {p.programa_ofertado?.modalidad || 'Ordinario'}
                                            </Typography>
                                        </TableCell>

                                        {/* Colegio */}
                                        <TableCell>
                                            <Typography variant="body2" fontSize={12} fontWeight={500}>
                                                {p.colegio_fin_secundaria || 'No registrado'}
                                            </Typography>
                                            {p.codigo_modular_colegio && (
                                                <Typography variant="caption" color={THEME_COLORS.infoText} fontWeight={600}>
                                                    Mod: {p.codigo_modular_colegio} ({p.anio_egreso_colegio || '—'})
                                                </Typography>
                                            )}
                                        </TableCell>

                                        {/* Pago Tesorería */}
                                        <TableCell>
                                            <Chip
                                                label={isPagado ? 'PAGADO' : 'PENDIENTE'}
                                                size="small"
                                                sx={{
                                                    bgcolor: isPagado ? THEME_COLORS.successLight : THEME_COLORS.warningLight,
                                                    color: isPagado ? THEME_COLORS.successText : THEME_COLORS.warningText,
                                                    fontWeight: 800,
                                                    fontSize: 10,
                                                }}
                                            />
                                            {p.comprobante_pago && (
                                                <Typography variant="caption" sx={{ display: 'block', fontSize: 10, color: THEME_COLORS.textSecondary, mt: 0.3 }}>
                                                    {p.comprobante_pago}
                                                </Typography>
                                            )}
                                        </TableCell>

                                        {/* Estado de Inscripción */}
                                        <TableCell>
                                            <Chip
                                                label={p.estado_inscripcion}
                                                size="small"
                                                sx={{
                                                    bgcolor: isInscrito ? THEME_COLORS.successLight : '#f1f5f9',
                                                    color: isInscrito ? THEME_COLORS.successText : THEME_COLORS.textSecondary,
                                                    fontWeight: 700,
                                                    fontSize: 10,
                                                }}
                                            />
                                        </TableCell>

                                        {/* Acciones */}
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                {!isInscrito && (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        onClick={() => navigate(`/admission/inscribir?dni=${persona.numero_documento || p.codigo_tesoreria}&postulacion_id=${p.id}`)}
                                                        sx={{
                                                            bgcolor: THEME_COLORS.primary,
                                                            '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            py: 0.4,
                                                            borderRadius: 1.5,
                                                        }}
                                                    >
                                                        Continuar
                                                    </Button>
                                                )}

                                                {p.numero_fut && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<FileText size={13} />}
                                                        onClick={() => setDocViewerModal({
                                                            open: true,
                                                            title: `Formulario Único de Trámite (FUT) — ${p.numero_fut}`,
                                                            printUrl: admissionService.getFutPrintUrl(p.id),
                                                        })}
                                                        sx={{
                                                            color: THEME_COLORS.info,
                                                            borderColor: THEME_COLORS.infoBorder,
                                                            '&:hover': { bgcolor: THEME_COLORS.infoLight, borderColor: THEME_COLORS.info },
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            py: 0.4,
                                                            borderRadius: 1.5,
                                                        }}
                                                    >
                                                        FUT
                                                    </Button>
                                                )}

                                                {isInscrito && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        startIcon={<ShieldCheck size={13} />}
                                                        onClick={() => setDocViewerModal({
                                                            open: true,
                                                            title: `Declaración Jurada — ${persona.numero_documento}`,
                                                            printUrl: admissionService.getDeclaracionPrintUrl(p.id),
                                                        })}
                                                        sx={{
                                                            color: THEME_COLORS.textPrimary,
                                                            borderColor: THEME_COLORS.border,
                                                            '&:hover': { bgcolor: '#f8fafc', borderColor: THEME_COLORS.textPrimary },
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            py: 0.4,
                                                            borderRadius: 1.5,
                                                        }}
                                                    >
                                                        DJ
                                                    </Button>
                                                )}

                                                {/* Botón Eliminar Postulante */}
                                                <Tooltip title="Eliminar postulante y liberar código / FUT">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => setDeleteModal({ open: true, postulacion: p, loading: false })}
                                                        sx={{
                                                            color: THEME_COLORS.error,
                                                            '&:hover': { bgcolor: THEME_COLORS.errorLight },
                                                        }}
                                                    >
                                                        <Trash2 size={16} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Modal de Confirmación para Eliminar Postulante */}
            <Dialog
                open={deleteModal.open}
                onClose={() => !deleteModal.loading && setDeleteModal({ open: false, postulacion: null, loading: false })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 800, color: THEME_COLORS.errorText, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Trash2 size={20} color={THEME_COLORS.error} />
                    Confirmar Eliminación
                </DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ color: THEME_COLORS.textPrimary, fontSize: 14 }}>
                        ¿Está seguro de eliminar la postulación de{' '}
                        <strong>
                            {deleteModal.postulacion?.persona?.nombres} {deleteModal.postulacion?.persona?.apellido_paterno}
                        </strong>{' '}
                        (Código: <strong>{deleteModal.postulacion?.codigo_postulante}</strong>)?
                    </DialogContentText>
                    <Alert severity="warning" sx={{ mt: 2, fontSize: 12, borderRadius: 2 }}>
                        El cupo del código y su número de FUT quedarán liberados para que una futura inscripción pueda reutilizarlos.
                    </Alert>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setDeleteModal({ open: false, postulacion: null, loading: false })}
                        disabled={deleteModal.loading}
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        disabled={deleteModal.loading}
                        variant="contained"
                        color="error"
                        sx={{ textTransform: 'none', fontWeight: 700 }}
                    >
                        {deleteModal.loading ? <CircularProgress size={16} color="inherit" /> : 'Eliminar y Liberar Cupo'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Visor de Documentos */}
            <DocumentViewerModal
                open={docViewerModal.open}
                onClose={() => setDocViewerModal((prev) => ({ ...prev, open: false }))}
                title={docViewerModal.title}
                printUrl={docViewerModal.printUrl}
            />
        </Container>
    );
}
