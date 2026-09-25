import React, { useState, useEffect } from 'react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';
import ModalInscripcionFlujo from './ModalInscripcionFlujo';
import DocumentViewerModal from './DocumentViewerModal';
import {
    Award,
    Users,
    Calendar,
    FileText,
    Plus,
    Search,
    RefreshCw,
    CheckCircle2,
    GraduationCap,
    Download,
    ExternalLink,
    Printer,
    ShieldCheck,
    CreditCard,
    Check,
    X,
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Tooltip,
    InputAdornment,
    Tabs,
    Tab,
    Grid,
    Card,
    CardContent,
    MenuItem,
} from '@mui/material';

export default function AdmissionDashboard() {
    const [currentTab, setCurrentTab] = useState(0);

    // Admission process state
    const [procesos, setProcesos] = useState([]);
    const [selectedProcesoId, setSelectedProcesoId] = useState('');
    const [procesoDetalle, setProcesoDetalle] = useState(null);

    // Postulantes state
    const [postulaciones, setPostulaciones] = useState([]);
    const [loadingPostulantes, setLoadingPostulantes] = useState(false);
    const [searchPostulante, setSearchPostulante] = useState('');

    // Cuadro de Merito state
    const [cuadroMerito, setCuadroMerito] = useState([]);
    const [loadingMerito, setLoadingMerito] = useState(false);

    // Modal Asistente Flujo de Inscripción (6 pasos)
    const [showWizardModal, setShowWizardModal] = useState(false);

    // Modal Visor de Documentos (FUT y Declaración Jurada)
    const [docViewerModal, setDocViewerModal] = useState({
        open: false,
        title: '',
        printUrl: '',
    });

    // Modal Rápido de Validación de Pago
    const [pagoModal, setPagoModal] = useState({
        open: false,
        postulacionId: null,
        codigoTesoreria: '',
        comprobante: '',
        monto: '150.00',
    });
    const [pagoLoading, setPagoLoading] = useState(false);

    // Alerts
    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        loadProcesos();
    }, []);

    useEffect(() => {
        if (selectedProcesoId) {
            loadProcesoDetalle(selectedProcesoId);
            if (currentTab === 0) loadPostulaciones();
            if (currentTab === 1) loadCuadroMerito();
        }
    }, [selectedProcesoId, currentTab]);

    const loadProcesos = async () => {
        try {
            const res = await admissionService.getProcesos();
            const list = res.data || [];
            setProcesos(list);
            if (list.length > 0) {
                setSelectedProcesoId(list[0].id);
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al cargar los procesos de admisión.' });
        }
    };

    const loadProcesoDetalle = async (id) => {
        try {
            const data = await admissionService.getProceso(id);
            setProcesoDetalle(data);
        } catch (err) {
            console.error('Error al cargar detalle del proceso:', err);
        }
    };

    const loadPostulaciones = async () => {
        if (!selectedProcesoId) return;
        setLoadingPostulantes(true);
        try {
            const res = await admissionService.getPostulaciones({
                admision_proceso_id: selectedProcesoId,
                search: searchPostulante.trim(),
            });
            setPostulaciones(res.data || []);
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al cargar postulantes.' });
        } finally {
            setLoadingPostulantes(false);
        }
    };

    const loadCuadroMerito = async () => {
        if (!selectedProcesoId) return;
        setLoadingMerito(true);
        try {
            const res = await admissionService.getCuadroMerito(selectedProcesoId);
            setCuadroMerito(res.data || []);
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al cargar el cuadro de méritos.' });
        } finally {
            setLoadingMerito(false);
        }
    };

    const handleOpenDocViewer = (title, printUrl) => {
        setDocViewerModal({
            open: true,
            title,
            printUrl,
        });
    };

    const handleOpenPagoModal = (p) => {
        setPagoModal({
            open: true,
            postulacionId: p.id,
            codigoTesoreria: p.codigo_tesoreria || p.persona?.numero_documento,
            comprobante: `REC-${new Date().getFullYear()}-${p.persona?.numero_documento?.slice(-4) || '001'}`,
            monto: '150.00',
        });
    };

    const handleConfirmarPagoRapido = async (e) => {
        e.preventDefault();
        setPagoLoading(true);
        try {
            const res = await admissionService.validarPago(pagoModal.postulacionId, {
                comprobante_pago: pagoModal.comprobante,
                monto_pago: pagoModal.monto,
                fecha_pago: new Date().toISOString().split('T')[0],
            });
            setFeedback({
                type: 'success',
                message: `Pago validado exitosamente. Se emitió el FUT: ${res.numero_fut}`,
            });
            setPagoModal({ open: false, postulacionId: null, codigoTesoreria: '', comprobante: '', monto: '150.00' });
            loadPostulaciones();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Error al validar el pago.' });
        } finally {
            setPagoLoading(false);
        }
    };

    const handleEmitirConstancia = async (postulacionId) => {
        try {
            const res = await admissionService.emitirConstancia(postulacionId);
            setFeedback({
                type: 'success',
                message: `${res.message} Código: ${res.data.codigo_constancia}`,
            });
            loadCuadroMerito();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Error al emitir constancia.' });
        }
    };

    const handleRatificarMatricula = async (postulacionId) => {
        if (!window.confirm('¿Confirmar ratificación de ingreso y pase al Módulo Académico como Estudiante?')) {
            return;
        }

        try {
            const res = await admissionService.ratificarMatricula(postulacionId);
            setFeedback({
                type: 'success',
                message: `${res.message} Código Estudiante: ${res.data.codigo_estudiante}`,
            });
            loadCuadroMerito();
        } catch (err) {
            setFeedback({ type: 'error', message: err.response?.data?.message || 'Error al ratificar matrícula.' });
        }
    };

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
                    <Box
                        sx={{
                            backgroundColor: THEME_COLORS.primaryLight,
                            color: THEME_COLORS.primary,
                            p: 1.2,
                            borderRadius: 2,
                            display: 'flex',
                        }}
                    >
                        <Award size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary }}>
                            Módulo de Admisión (IESP Público)
                        </Typography>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                            Flujo oficial: Pre-inscripción, Código Tesorería (DNI), Retorno de Pago, FUT, Declaración Jurada y Evaluaciones.
                        </Typography>
                    </Box>
                </Box>

                {/* Selector de Proceso y Botón Inscribir */}
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <TextField
                        select
                        size="small"
                        label="Convocatoria Activa"
                        value={selectedProcesoId}
                        onChange={(e) => setSelectedProcesoId(e.target.value)}
                        sx={{ minWidth: 280 }}
                    >
                        {procesos.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.codigo} — {p.nombre}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Button
                        variant="contained"
                        startIcon={<Plus size={18} />}
                        onClick={() => setShowWizardModal(true)}
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
                        Inscribir Postulante (Flujo Oficial)
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

            {/* Navigation Tabs */}
            <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, borderRadius: 2 }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, val) => setCurrentTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab
                        label="Padrón Oficial de Postulantes"
                        icon={<Users size={18} />}
                        iconPosition="start"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    />
                    <Tab
                        label="Cuadro de Mérito y Resultados"
                        icon={<Award size={18} />}
                        iconPosition="start"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    />
                    <Tab
                        label="Convocatoria y Vacantes Ofertadas"
                        icon={<Calendar size={18} />}
                        iconPosition="start"
                        sx={{ textTransform: 'none', fontWeight: 600 }}
                    />
                </Tabs>
            </Paper>

            {/* TAB 0: Postulantes (Padrón Oficial de Base de Datos) */}
            {currentTab === 0 && (
                <Box>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            mb: 2.5,
                            borderRadius: 2,
                            border: `1px solid ${THEME_COLORS.border}`,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 2,
                        }}
                    >
                        <TextField
                            placeholder="Buscar por DNI, Nombres, N° de FUT, Código o Cód. Modular..."
                            size="small"
                            value={searchPostulante}
                            onChange={(e) => setSearchPostulante(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadPostulaciones()}
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
                                onClick={loadPostulaciones}
                                size="small"
                                sx={{ textTransform: 'none' }}
                            >
                                Buscar
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<RefreshCw size={16} />}
                                onClick={() => {
                                    setSearchPostulante('');
                                    loadPostulaciones();
                                }}
                                size="small"
                                sx={{ textTransform: 'none', color: THEME_COLORS.secondary }}
                            >
                                Limpiar
                            </Button>
                        </Box>
                    </Paper>

                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                        <Table sx={{ minWidth: 900 }}>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Código / Postulante</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>N° de FUT</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>DNI / Tesorería</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Programa Ofertado</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Colegio / Cód. Modular</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Pago Tesorería</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Requisitos</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Formatos Oficiales</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingPostulantes ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                            <CircularProgress size={30} />
                                        </TableCell>
                                    </TableRow>
                                ) : postulaciones.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                            No se encontraron postulantes registrados con los criterios seleccionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    postulaciones.map((p) => {
                                        const escolar = p.expediente_escolar || {};
                                        const reqs = p.requisitos_verificados || {};

                                        return (
                                            <TableRow key={p.id} hover>
                                                {/* Código y Nombre */}
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>
                                                        {p.codigo_postulante}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
                                                        {p.persona?.nombre_completo}
                                                    </Typography>
                                                </TableCell>

                                                {/* N° FUT */}
                                                <TableCell>
                                                    {p.numero_fut ? (
                                                        <Chip
                                                            label={p.numero_fut}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 800,
                                                                backgroundColor: '#fef2f2',
                                                                color: '#b91c1c',
                                                                border: '1px solid #fecaca',
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip label="Sin emitir" size="small" variant="outlined" />
                                                    )}
                                                </TableCell>

                                                {/* DNI / Código de Tesorería */}
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {p.persona?.numero_documento}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                                        Cód: {p.codigo_tesoreria || p.persona?.numero_documento}
                                                    </Typography>
                                                </TableCell>

                                                {/* Programa Ofertado */}
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                        {p.programa_postulado?.nombre}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                                        {p.programa_postulado?.modalidad}
                                                    </Typography>
                                                </TableCell>

                                                {/* Colegio y Cód Modular */}
                                                <TableCell>
                                                    <Typography variant="body2" fontSize={12} sx={{ fontWeight: 500 }}>
                                                        {escolar.colegio || 'No registrado'}
                                                    </Typography>
                                                    {escolar.codigo_modular && (
                                                        <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600 }}>
                                                            Mod: {escolar.codigo_modular} ({escolar.anio_egreso || '—'})
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                {/* Pago Tesorería */}
                                                <TableCell>
                                                    {p.estado_pago === 'PAGADO' ? (
                                                        <Box>
                                                            <Chip
                                                                label="PAGADO"
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: THEME_COLORS.successLight,
                                                                    color: THEME_COLORS.successText,
                                                                    fontWeight: 700,
                                                                }}
                                                            />
                                                            {p.comprobante_pago && (
                                                                <Typography variant="caption" sx={{ display: 'block', fontSize: 10, color: '#475569' }}>
                                                                    {p.comprobante_pago}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    ) : (
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            color="warning"
                                                            startIcon={<CreditCard size={14} />}
                                                            onClick={() => handleOpenPagoModal(p)}
                                                            sx={{ textTransform: 'none', fontSize: 11, py: 0.2 }}
                                                        >
                                                            Validar Pago
                                                        </Button>
                                                    )}
                                                </TableCell>

                                                {/* Requisitos Checklist */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                        <Tooltip title={reqs.tiene_copia_dni_color ? 'Copia DNI a Color: Sí' : 'Copia DNI: No'}>
                                                            <Chip
                                                                label="DNI"
                                                                size="small"
                                                                sx={{
                                                                    fontSize: 10,
                                                                    height: 20,
                                                                    backgroundColor: reqs.tiene_copia_dni_color ? '#ecfdf5' : '#f1f5f9',
                                                                    color: reqs.tiene_copia_dni_color ? '#047857' : '#94a3b8',
                                                                    fontWeight: 700,
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title={reqs.tiene_partida_nacimiento ? 'Partida Nacimiento: Sí' : 'Partida Nacimiento: No'}>
                                                            <Chip
                                                                label="Partida"
                                                                size="small"
                                                                sx={{
                                                                    fontSize: 10,
                                                                    height: 20,
                                                                    backgroundColor: reqs.tiene_partida_nacimiento ? '#ecfdf5' : '#f1f5f9',
                                                                    color: reqs.tiene_partida_nacimiento ? '#047857' : '#94a3b8',
                                                                    fontWeight: 700,
                                                                }}
                                                            />
                                                        </Tooltip>
                                                        <Tooltip title={reqs.tiene_certificado_nacimiento_original ? 'Certificado Original: Sí' : 'Certificado Original: No'}>
                                                            <Chip
                                                                label="Certif."
                                                                size="small"
                                                                sx={{
                                                                    fontSize: 10,
                                                                    height: 20,
                                                                    backgroundColor: reqs.tiene_certificado_nacimiento_original ? '#ecfdf5' : '#f1f5f9',
                                                                    color: reqs.tiene_certificado_nacimiento_original ? '#047857' : '#94a3b8',
                                                                    fontWeight: 700,
                                                                }}
                                                            />
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>

                                                {/* Estado de Inscripción */}
                                                <TableCell>
                                                    <Chip
                                                        label={p.estado_inscripcion}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: p.estado_inscripcion === 'INSCRITO' || p.estado_inscripcion === 'APTO_EVALUACION'
                                                                ? THEME_COLORS.successLight
                                                                : '#fef3c7',
                                                            color: p.estado_inscripcion === 'INSCRITO' || p.estado_inscripcion === 'APTO_EVALUACION'
                                                                ? THEME_COLORS.successText
                                                                : '#92400e',
                                                            fontWeight: 700,
                                                            fontSize: 11,
                                                        }}
                                                    />
                                                </TableCell>

                                                {/* Acciones Oficiales (FUT y Declaración Jurada) */}
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<FileText size={14} />}
                                                            onClick={() => handleOpenDocViewer(
                                                                `Formulario Único de Trámite (FUT) — ${p.numero_fut || p.codigo_postulante}`,
                                                                admissionService.getFutPrintUrl(p.id)
                                                            )}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: 11,
                                                                color: '#0284c7',
                                                                borderColor: '#bae6fd',
                                                                '&:hover': { borderColor: '#0284c7', backgroundColor: '#f0f9ff' },
                                                            }}
                                                        >
                                                            FUT
                                                        </Button>

                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<ShieldCheck size={14} />}
                                                            onClick={() => handleOpenDocViewer(
                                                                `Declaración Jurada de Antecedentes — ${p.persona?.numero_documento}`,
                                                                admissionService.getDeclaracionPrintUrl(p.id)
                                                            )}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: 11,
                                                                color: '#0f172a',
                                                                borderColor: '#cbd5e1',
                                                                '&:hover': { borderColor: '#0f172a', backgroundColor: '#f8fafc' },
                                                            }}
                                                        >
                                                            Dec. Jurada
                                                        </Button>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* TAB 1: Cuadro de Mérito y Resultados */}
            {currentTab === 1 && (
                <Box>
                    <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                        <Table sx={{ minWidth: 750 }}>
                            <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Mérito</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Código</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Documento</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Postulante</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Programa Ofertado</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Puntaje Final</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Condición</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones Oficiales</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingMerito ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                            <CircularProgress size={30} />
                                        </TableCell>
                                    </TableRow>
                                ) : cuadroMerito.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 5, color: THEME_COLORS.textSecondary }}>
                                            Aún no se han consolidado ni publicado resultados para este proceso.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    cuadroMerito.map((r) => (
                                        <TableRow key={r.id} hover>
                                            <TableCell sx={{ fontWeight: 700 }}>#{r.orden_merito}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{r.codigo_postulante}</TableCell>
                                            <TableCell>{r.documento}</TableCell>
                                            <TableCell sx={{ fontWeight: 600 }}>{r.postulante}</TableCell>
                                            <TableCell>{r.programa}</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: r.puntaje_final >= 11 ? THEME_COLORS.successText : THEME_COLORS.errorText }}>
                                                {r.puntaje_final.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={r.condicion}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: r.condicion === 'INGRESANTE' ? THEME_COLORS.successLight : '#f1f5f9',
                                                        color: r.condicion === 'INGRESANTE' ? THEME_COLORS.successText : '#64748b',
                                                        fontWeight: 700,
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                {r.condicion === 'INGRESANTE' && (
                                                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<FileText size={15} />}
                                                            onClick={() => handleEmitirConstancia(r.id)}
                                                            sx={{ textTransform: 'none', fontSize: 12 }}
                                                        >
                                                            {r.tiene_constancia ? 'Ver Constancia' : 'Emitir Constancia'}
                                                        </Button>

                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            startIcon={<GraduationCap size={15} />}
                                                            onClick={() => handleRatificarMatricula(r.id)}
                                                            sx={{
                                                                textTransform: 'none',
                                                                fontSize: 12,
                                                                backgroundColor: THEME_COLORS.success,
                                                                '&:hover': { backgroundColor: '#15803d' },
                                                            }}
                                                        >
                                                            Ratificar Estudiante
                                                        </Button>
                                                    </Box>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* TAB 2: Convocatoria y Vacantes */}
            {currentTab === 2 && procesoDetalle && (
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    {procesoDetalle.nombre} ({procesoDetalle.codigo})
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Periodo Lectivo: <strong>{procesoDetalle.periodo}</strong> | Estado: <strong>{procesoDetalle.estado}</strong>
                                </Typography>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 2 }}>
                                    <Typography variant="body2">
                                        📅 Inscripciones: <strong>{procesoDetalle.fecha_inicio_inscripcion}</strong> al <strong>{procesoDetalle.fecha_fin_inscripcion}</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        📝 Fecha de Examen: <strong>{procesoDetalle.fecha_evaluacion}</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        🏆 Publicación de Resultados: <strong>{procesoDetalle.fecha_publicacion_resultados}</strong>
                                    </Typography>
                                    <Typography variant="body2">
                                        ⚖️ Nota Mínima Aprobatoria: <strong>{procesoDetalle.puntaje_minimo_aprobatorio} puntos</strong>
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Card elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                    Vacantes Ofertadas por Programa
                                </Typography>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Programa de Estudios</TableCell>
                                            <TableCell>Modalidad</TableCell>
                                            <TableCell align="right">Vacantes</TableCell>
                                            <TableCell align="right">Inscritos</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {procesoDetalle.programas_ofertados?.map((po) => (
                                            <TableRow key={po.id}>
                                                <TableCell sx={{ fontWeight: 600 }}>{po.programa}</TableCell>
                                                <TableCell>{po.modalidad}</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{po.vacantes}</TableCell>
                                                <TableCell align="right">{po.postulantes_inscritos}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Asistente Flujo de Inscripción Guiado (6 pasos) */}
            <ModalInscripcionFlujo
                open={showWizardModal}
                onClose={() => setShowWizardModal(false)}
                procesoId={selectedProcesoId}
                procesoDetalle={procesoDetalle}
                onSuccess={() => {
                    setFeedback({ type: 'success', message: 'Postulante inscrito con éxito en el sistema.' });
                    loadPostulaciones();
                }}
                onViewDocument={handleOpenDocViewer}
            />

            {/* Visor Modal de Documentos (FUT y Declaración Jurada) */}
            <DocumentViewerModal
                open={docViewerModal.open}
                onClose={() => setDocViewerModal((prev) => ({ ...prev, open: false }))}
                title={docViewerModal.title}
                printUrl={docViewerModal.printUrl}
            />

            {/* Dialog Rápido para Validar Pago */}
            <Dialog open={pagoModal.open} onClose={() => setPagoModal((prev) => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
                <form onSubmit={handleConfirmarPagoRapido}>
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        Validar Pago en Tesorería
                    </DialogTitle>
                    <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            Código de Tesorería (DNI): <strong>{pagoModal.codigoTesoreria}</strong>
                        </Typography>

                        <TextField
                            label="N° de Recibo u Operación"
                            value={pagoModal.comprobante}
                            onChange={(e) => setPagoModal((prev) => ({ ...prev, comprobante: e.target.value }))}
                            required
                            fullWidth
                            size="small"
                        />

                        <TextField
                            type="number"
                            label="Monto Abonado (S/)"
                            value={pagoModal.monto}
                            onChange={(e) => setPagoModal((prev) => ({ ...prev, monto: e.target.value }))}
                            required
                            fullWidth
                            size="small"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setPagoModal((prev) => ({ ...prev, open: false }))} disabled={pagoLoading}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={pagoLoading}
                            sx={{
                                backgroundColor: THEME_COLORS.success,
                                '&:hover': { backgroundColor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            {pagoLoading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar y Emitir FUT'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
}
