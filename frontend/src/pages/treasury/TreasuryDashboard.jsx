import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    TextField,
    Button,
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
    InputAdornment,
    IconButton,
    Tabs,
    Tab,
    Tooltip,
} from '@mui/material';
import {
    CreditCard,
    Search,
    DollarSign,
    CheckCircle2,
    Clock,
    FileText,
    RefreshCw,
    UserCheck,
    Receipt,
    GraduationCap,
    Landmark,
    Check,
} from 'lucide-react';
import { treasuryService } from '../../services/treasuryService';
import { THEME_COLORS } from '../../theme/colors';

export default function TreasuryDashboard() {
    const [pagos, setPagos] = useState([]);
    const [stats, setStats] = useState({
        total_recaudado: 0,
        total_pendientes: 0,
        total_pagados: 0,
    });
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState(''); // '' | 'PENDIENTE' | 'PAGADO'

    // Búsqueda rápida express por DNI
    const [dniSearch, setDniSearch] = useState('');
    const [dniLoading, setDniLoading] = useState(false);
    const [dniResult, setDniResult] = useState(null);

    // Modal de Cobro
    const [cobroModal, setCobroModal] = useState({
        open: false,
        postulacion: null,
        comprobante: '',
        monto: '150.00',
        fecha_pago: new Date().toISOString().split('T')[0],
    });
    const [cobroLoading, setCobroLoading] = useState(false);

    // Modal de Éxito con FUT Habilitado
    const [futSuccessModal, setFutSuccessModal] = useState({
        open: false,
        numeroFut: '',
        postulante: '',
        dni: '',
        comprobante: '',
    });

    const [feedback, setFeedback] = useState(null);

    useEffect(() => {
        loadPagos();
    }, [estadoFilter]);

    const loadPagos = async () => {
        setLoading(true);
        try {
            const params = {};
            if (estadoFilter) params.estado_pago = estadoFilter;
            if (search.trim()) params.search = search.trim();

            const res = await treasuryService.getPagos(params);
            setPagos(res.data || []);
            if (res.stats) {
                setStats(res.stats);
            }
        } catch (err) {
            setFeedback({ type: 'error', message: 'Error al cargar la lista de cobranzas de tesorería.' });
        } finally {
            setLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        loadPagos();
    };

    const handleConsultarDni = async (e) => {
        e.preventDefault();
        if (!dniSearch.trim()) return;
        setDniLoading(true);
        setDniResult(null);
        try {
            const data = await treasuryService.consultarDni(dniSearch.trim());
            setDniResult(data);
        } catch (err) {
            setFeedback({
                type: 'warning',
                message: err.response?.data?.message || `No se encontró postulante con DNI ${dniSearch}.`,
            });
        } finally {
            setDniLoading(false);
        }
    };

    const handleOpenCobro = (p) => {
        const lastDigits = p.persona?.numero_documento?.slice(-4) || '0001';
        setCobroModal({
            open: true,
            postulacion: p,
            comprobante: `REC-${new Date().getFullYear()}-${lastDigits}`,
            monto: '150.00',
            fecha_pago: new Date().toISOString().split('T')[0],
        });
    };

    const handleConfirmarCobro = async (e) => {
        e.preventDefault();
        if (!cobroModal.postulacion) return;
        setCobroLoading(true);

        try {
            const res = await treasuryService.registrarPago(cobroModal.postulacion.id, {
                comprobante_pago: cobroModal.comprobante,
                monto_pago: cobroModal.monto,
                fecha_pago: cobroModal.fecha_pago,
            });

            const futEmitido = res.numero_fut;
            const postulanteName = cobroModal.postulacion.persona?.nombre_completo;
            const dni = cobroModal.postulacion.persona?.numero_documento;

            setCobroModal({ open: false, postulacion: null, comprobante: '', monto: '150.00', fecha_pago: '' });
            loadPagos();

            if (dniResult && dniResult.id === cobroModal.postulacion.id) {
                setDniResult(res.data);
            }

            // Abrir modal de éxito con el FUT
            setFutSuccessModal({
                open: true,
                numeroFut: futEmitido,
                postulante: postulanteName,
                dni: dni,
                comprobante: cobroModal.comprobante,
            });
        } catch (err) {
            setFeedback({
                type: 'error',
                message: err.response?.data?.message || 'Error al registrar el cobro en tesorería.',
            });
        } finally {
            setCobroLoading(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            p: 1.2,
                            borderRadius: 2,
                            display: 'flex',
                        }}
                    >
                        <Landmark size={28} />
                    </Box>
                    <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>
                            Módulo de Tesorería & Caja (IESPP ARCO IRIS)
                        </Typography>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                            Control de cobranzas por Derecho de Admisión y habilitación reglamentaria de Códigos FUT.
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<RefreshCw size={16} />}
                    onClick={loadPagos}
                    sx={{ textTransform: 'none', borderRadius: 2 }}
                >
                    Actualizar
                </Button>
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

            {/* Stat Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    backgroundColor: '#ecfdf5',
                                    color: '#059669',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <DollarSign size={26} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                                    Total Recaudado (Admisión)
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="#0f172a">
                                    S/ {Number(stats.total_recaudado).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    backgroundColor: '#fffbeb',
                                    color: '#d97706',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Clock size={26} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                                    Cobros Pendientes
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="#b45309">
                                    {stats.total_pendientes} postulantes
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                        <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    backgroundColor: '#f0f9ff',
                                    color: '#0284c7',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <FileText size={26} />
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase">
                                    FUTs Oficiales Habilitados
                                </Typography>
                                <Typography variant="h5" fontWeight={800} color="#0369a1">
                                    {stats.total_pagados} emitidos
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Caja Express: Búsqueda Rápida por DNI */}
            <Paper elevation={0} sx={{ p: 2.5, mb: 3, border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} color={THEME_COLORS.textPrimary} sx={{ mb: 1.5 }}>
                    🔍 Consulta Rápida de Caja por DNI (Código de Tesorería)
                </Typography>
                <form onSubmit={handleConsultarDni}>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                        <TextField
                            size="small"
                            placeholder="Ingrese DNI del postulante (ej. 74839201)..."
                            value={dniSearch}
                            onChange={(e) => setDniSearch(e.target.value)}
                            sx={{ minWidth: { xs: '100%', sm: 350 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color="#64748b" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={dniLoading}
                            startIcon={dniLoading ? <CircularProgress size={16} color="inherit" /> : <Search size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 3,
                            }}
                        >
                            Consultar Caja
                        </Button>
                    </Box>
                </form>

                {/* Resultado de búsqueda rápida */}
                {dniResult && (
                    <Card elevation={0} sx={{ mt: 2, border: '1px solid #bae6fd', backgroundColor: '#f0f9ff', borderRadius: 2 }}>
                        <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                            <Box>
                                <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                                    {dniResult.persona?.nombre_completo}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    DNI / Cód. Tesorería: <strong>{dniResult.codigo_tesoreria || dniResult.persona?.numero_documento}</strong> | Carrera: <strong>{dniResult.programa_ofertado?.programa}</strong>
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Convocatoria: {dniResult.proceso?.codigo} — {dniResult.proceso?.nombre}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                {dniResult.estado_pago === 'PAGADO' ? (
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Chip
                                            label="PAGO VALIDADO"
                                            color="success"
                                            size="small"
                                            sx={{ fontWeight: 700, mb: 0.5 }}
                                        />
                                        <Typography variant="body2" fontWeight={800} color="#0284c7">
                                            FUT: {dniResult.numero_fut}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Comprobante: {dniResult.comprobante_pago}
                                        </Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Chip
                                            label="PENDIENTE DE COBRO"
                                            color="warning"
                                            size="small"
                                            sx={{ fontWeight: 700 }}
                                        />
                                        <Button
                                            variant="contained"
                                            size="small"
                                            startIcon={<CreditCard size={16} />}
                                            onClick={() => handleOpenCobro(dniResult)}
                                            sx={{
                                                backgroundColor: THEME_COLORS.success,
                                                '&:hover': { backgroundColor: '#15803d' },
                                                fontWeight: 700,
                                                textTransform: 'none',
                                            }}
                                        >
                                            Cobrar S/ 150.00 y Habilitar FUT
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Paper>

            {/* Padrón General de Cobranzas */}
            <Paper elevation={0} sx={{ border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2 }}>
                {/* Filtros de la Tabla */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, borderBottom: '1px solid #e2e8f0' }}>
                    <Tabs
                        value={estadoFilter}
                        onChange={(e, val) => setEstadoFilter(val)}
                        textColor="primary"
                        indicatorColor="primary"
                        sx={{ minHeight: 'unset' }}
                    >
                        <Tab label="Todos los Postulantes" value="" sx={{ textTransform: 'none', fontWeight: 600, py: 1 }} />
                        <Tab label="Pendientes de Pago" value="PENDIENTE" sx={{ textTransform: 'none', fontWeight: 600, py: 1 }} />
                        <Tab label="Pagados (Con FUT)" value="PAGADO" sx={{ textTransform: 'none', fontWeight: 600, py: 1 }} />
                    </Tabs>

                    <form onSubmit={handleSearchSubmit}>
                        <TextField
                            size="small"
                            placeholder="Buscar en padrón..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ width: 260 }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton size="small" type="submit">
                                            <Search size={16} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </form>
                </Box>

                {/* Tabla de Cobros */}
                <TableContainer>
                    <Table size="small">
                        <TableHead sx={{ backgroundColor: '#f8fafc' }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Código Tesorería (DNI)</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Postulante</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Programa Ofertado</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Estado Pago</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Comprobante</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Monto</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Código FUT Habilitado</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 700 }}>Acción</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={28} />
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Cargando registros de tesorería...
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : pagos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        No se encontraron registros de postulaciones para el filtro seleccionado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                pagos.map((p) => {
                                    const isPagado = p.estado_pago === 'PAGADO';
                                    return (
                                        <TableRow key={p.id} hover>
                                            {/* DNI */}
                                            <TableCell sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                                                {p.codigo_tesoreria || p.persona?.numero_documento}
                                            </TableCell>

                                            {/* Postulante */}
                                            <TableCell>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {p.persona?.nombre_completo}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    Cód: {p.codigo_postulante}
                                                </Typography>
                                            </TableCell>

                                            {/* Programa */}
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {p.programa_ofertado?.programa || 'Educación Inicial'}
                                                </Typography>
                                            </TableCell>

                                            {/* Estado Pago */}
                                            <TableCell>
                                                <Chip
                                                    label={isPagado ? 'PAGADO' : 'PENDIENTE'}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: isPagado ? '#ecfdf5' : '#fffbeb',
                                                        color: isPagado ? '#059669' : '#d97706',
                                                        fontWeight: 700,
                                                        fontSize: 11,
                                                    }}
                                                />
                                            </TableCell>

                                            {/* Comprobante */}
                                            <TableCell>
                                                {p.comprobante_pago ? (
                                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                        {p.comprobante_pago}
                                                    </Typography>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">
                                                        —
                                                    </Typography>
                                                )}
                                            </TableCell>

                                            {/* Monto */}
                                            <TableCell align="right" sx={{ fontWeight: 700, color: isPagado ? '#059669' : '#0f172a' }}>
                                                S/ {p.monto_pago ? Number(p.monto_pago).toFixed(2) : '150.00'}
                                            </TableCell>

                                            {/* Código FUT */}
                                            <TableCell>
                                                {p.numero_fut ? (
                                                    <Chip
                                                        label={p.numero_fut}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: '#e0f2fe',
                                                            color: '#0369a1',
                                                            fontWeight: 800,
                                                            fontFamily: 'monospace',
                                                        }}
                                                    />
                                                ) : (
                                                    <Chip
                                                        label="Pendiente de Cobro"
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ color: '#94a3b8', fontSize: 10 }}
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Acciones */}
                                            <TableCell align="center">
                                                {isPagado ? (
                                                    <Tooltip title="Pago confirmado y FUT habilitado">
                                                        <Chip
                                                            icon={<Check size={14} />}
                                                            label="Completado"
                                                            size="small"
                                                            color="success"
                                                            variant="outlined"
                                                            sx={{ fontSize: 11 }}
                                                        />
                                                    </Tooltip>
                                                ) : (
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        startIcon={<CreditCard size={14} />}
                                                        onClick={() => handleOpenCobro(p)}
                                                        sx={{
                                                            backgroundColor: THEME_COLORS.success,
                                                            '&:hover': { backgroundColor: '#15803d' },
                                                            textTransform: 'none',
                                                            fontSize: 11,
                                                            fontWeight: 700,
                                                            py: 0.3,
                                                        }}
                                                    >
                                                        Cobrar en Caja
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            {/* Dialog de Cobro en Tesorería */}
            <Dialog open={cobroModal.open} onClose={() => setCobroModal((prev) => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
                <form onSubmit={handleConfirmarCobro}>
                    <DialogTitle sx={{ fontWeight: 800, pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                        Registrar Cobro en Tesorería
                    </DialogTitle>
                    <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {cobroModal.postulacion && (
                            <Box sx={{ p: 1.5, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Postulante:
                                </Typography>
                                <Typography variant="subtitle2" fontWeight={800}>
                                    {cobroModal.postulacion.persona?.nombre_completo}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    DNI / Cód. Pago: <strong>{cobroModal.postulacion.codigo_tesoreria || cobroModal.postulacion.persona?.numero_documento}</strong>
                                </Typography>
                            </Box>
                        )}

                        <TextField
                            label="N° de Recibo de Caja u Operación *"
                            value={cobroModal.comprobante}
                            onChange={(e) => setCobroModal((prev) => ({ ...prev, comprobante: e.target.value }))}
                            required
                            fullWidth
                            size="small"
                            placeholder="Ej. REC-2026-0042 o BOL-0129"
                        />

                        <TextField
                            type="number"
                            label="Monto Abonado (S/) *"
                            value={cobroModal.monto}
                            onChange={(e) => setCobroModal((prev) => ({ ...prev, monto: e.target.value }))}
                            required
                            fullWidth
                            size="small"
                        />

                        <TextField
                            type="date"
                            label="Fecha de Pago *"
                            value={cobroModal.fecha_pago}
                            onChange={(e) => setCobroModal((prev) => ({ ...prev, fecha_pago: e.target.value }))}
                            required
                            fullWidth
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />

                        <Alert severity="info" sx={{ fontSize: 12 }}>
                            Al confirmar este cobro, el sistema generará y habilitará automáticamente el <strong>Código Oficial de FUT</strong> para que el postulante pueda completar sus datos personales y expediente.
                        </Alert>
                    </DialogContent>
                    <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
                        <Button onClick={() => setCobroModal((prev) => ({ ...prev, open: false }))} disabled={cobroLoading}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={cobroLoading}
                            startIcon={cobroLoading ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.success,
                                '&:hover': { backgroundColor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            {cobroLoading ? 'Validando...' : 'Confirmar Cobro y Habilitar FUT'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Modal de Éxito: FUT Habilitado */}
            <Dialog open={futSuccessModal.open} onClose={() => setFutSuccessModal((prev) => ({ ...prev, open: false }))} maxWidth="xs" fullWidth>
                <DialogContent sx={{ p: 3, textAlign: 'center' }}>
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            backgroundColor: '#ecfdf5',
                            color: '#059669',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <CheckCircle2 size={36} />
                    </Box>

                    <Typography variant="h6" fontWeight={800} gutterBottom>
                        ¡Pago Validado y FUT Habilitado!
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        El abono de <strong>{futSuccessModal.postulante}</strong> ha sido confirmado en caja con el comprobante <strong>{futSuccessModal.comprobante}</strong>.
                    </Typography>

                    <Card elevation={0} sx={{ border: '2px dashed #0284c7', backgroundColor: '#f0f9ff', p: 1.5, my: 2 }}>
                        <Typography variant="caption" color="#0369a1" fontWeight={700} textTransform="uppercase">
                            Código Oficial de FUT Emitido
                        </Typography>
                        <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', letterSpacing: 1.5, my: 0.5 }}>
                            {futSuccessModal.numeroFut}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Con este código el postulante queda habilitado para completar sus datos personales y expediente.
                        </Typography>
                    </Card>
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'center' }}>
                    <Button
                        variant="contained"
                        onClick={() => setFutSuccessModal((prev) => ({ ...prev, open: false }))}
                        sx={{
                            backgroundColor: THEME_COLORS.primary,
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 4,
                        }}
                    >
                        Entendido
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
