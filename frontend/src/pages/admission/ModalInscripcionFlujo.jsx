import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    TextField,
    MenuItem,
    Grid,
    CircularProgress,
    Alert,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Divider,
    Checkbox,
    FormControlLabel,
    Chip,
    Card,
    CardContent,
} from '@mui/material';
import {
    User,
    CreditCard,
    FileCheck,
    School,
    FileText,
    CheckCircle2,
    Printer,
    ExternalLink,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
} from 'lucide-react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';

const STEPS = [
    'Datos Personales',
    'Código Tesorería (DNI)',
    'Validación Pago & FUT',
    'Expediente Escolar',
    'Formatos Oficiales PDF',
    'Registro Concluido',
];

export default function ModalInscripcionFlujo({
    open,
    onClose,
    procesoId,
    procesoDetalle,
    onSuccess,
    onViewDocument,
}) {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [errors, setErrors] = useState({});

    // Postulacion state persisted across steps
    const [postulacionCreada, setPostulacionCreada] = useState(null);

    // Formulario Paso 1: Datos Iniciales
    const [formPaso1, setFormPaso1] = useState({
        admision_proceso_id: procesoId || '',
        admision_programa_ofertado_id: '',
        tipo_documento: 'DNI',
        numero_documento: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        fecha_nacimiento: '',
        sexo: 'M',
        direccion: '',
        celular: '',
        email_personal: '',
        observaciones: '',
    });

    // Formulario Paso 3: Validación de Pago
    const [formPaso3, setFormPaso3] = useState({
        comprobante_pago: '',
        monto_pago: '150.00',
        fecha_pago: new Date().toISOString().split('T')[0],
    });

    // Formulario Paso 4: Expediente Escolar
    const [formPaso4, setFormPaso4] = useState({
        colegio_fin_secundaria: '',
        codigo_modular_colegio: '',
        anio_egreso_colegio: new Date().getFullYear() - 1,
        colegio_tipo_gestion: 'PUBLICA',
        colegio_departamento: 'La Libertad',
        colegio_provincia: 'Trujillo',
        colegio_distrito: 'Trujillo',
        tiene_copia_dni_color: true,
        tiene_partida_nacimiento: true,
        tiene_certificado_nacimiento_original: true,
        foto_url: '',
    });

    // Handlers
    const handlePaso1Change = (e) => {
        const { name, value } = e.target;
        setFormPaso1((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handlePaso3Change = (e) => {
        const { name, value } = e.target;
        setFormPaso3((prev) => ({ ...prev, [name]: value }));
    };

    const handlePaso4Change = (e) => {
        const { name, value, type, checked } = e.target;
        setFormPaso4((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // 1 -> 2: Pre-inscripción
    const handlePreInscribir = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        setErrors({});

        try {
            const payload = {
                ...formPaso1,
                admision_proceso_id: procesoId,
            };
            const res = await admissionService.preInscribir(payload);
            setPostulacionCreada(res.data);
            // Default comprobante sugerido
            setFormPaso3((prev) => ({
                ...prev,
                comprobante_pago: `REC-${new Date().getFullYear()}-${res.data.persona.numero_documento.slice(-4)}`,
            }));
            setActiveStep(1); // Paso 2: Código de Tesorería
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrorMsg(err.response?.data?.message || 'Error al realizar la pre-inscripción.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 2 -> 3: Ir a validar pago
    const handleIrAValidarPago = () => {
        setActiveStep(2);
    };

    // 3 -> 4: Validar Pago y obtener FUT
    const handleConfirmarPago = async (e) => {
        e.preventDefault();
        if (!postulacionCreada?.id) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await admissionService.validarPago(postulacionCreada.id, formPaso3);
            setPostulacionCreada(res.data);
            setActiveStep(3); // Paso 4: Expediente Escolar
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al validar el pago en tesorería.');
        } finally {
            setLoading(false);
        }
    };

    // 4 -> 5: Completar Expediente Escolar
    const handleCompletarExpediente = async (e) => {
        e.preventDefault();
        if (!postulacionCreada?.id) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await admissionService.completarExpediente(postulacionCreada.id, formPaso4);
            setPostulacionCreada(res.data);
            setActiveStep(4); // Paso 5: Formatos Oficiales PDF
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al registrar el expediente escolar.');
        } finally {
            setLoading(false);
        }
    };

    // Finalizar flujo
    const handleFinalizar = () => {
        onSuccess?.();
        onClose?.();
        setActiveStep(0);
        setPostulacionCreada(null);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={700} color={THEME_COLORS.textPrimary}>
                            Inscripción Oficial de Postulante — Admisión {procesoDetalle?.codigo || '2026'}
                        </Typography>
                        <Typography variant="body2" color={THEME_COLORS.textSecondary}>
                            Flujo institucional regulado: Pre-inscripción, Tesorería (DNI), Retorno de Pago, FUT y Expediente.
                        </Typography>
                    </Box>
                    {postulacionCreada && (
                        <Chip
                            label={`Cód: ${postulacionCreada.codigo_postulante}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                        />
                    )}
                </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ backgroundColor: '#fcfdfd', p: 3 }}>
                {/* Stepper Superior */}
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
                    {STEPS.map((label, index) => (
                        <Step key={label}>
                            <StepLabel>
                                <Typography variant="caption" fontWeight={activeStep === index ? 700 : 500}>
                                    {label}
                                </Typography>
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {errorMsg && (
                    <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 2 }}>
                        {errorMsg}
                    </Alert>
                )}

                {/* PASO 1: Datos Personales Iniciales */}
                {activeStep === 0 && (
                    <form id="form-paso-1" onSubmit={handlePreInscribir}>
                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            1. Elección del Programa y Modalidad de Admisión
                        </Typography>

                        <TextField
                            select
                            label="Programa de Estudios Ofertado *"
                            name="admision_programa_ofertado_id"
                            value={formPaso1.admision_programa_ofertado_id}
                            onChange={handlePaso1Change}
                            required
                            fullWidth
                            size="small"
                            sx={{ mb: 2 }}
                            error={Boolean(errors.admision_programa_ofertado_id)}
                            helperText={errors.admision_programa_ofertado_id?.[0]}
                        >
                            {procesoDetalle?.programas_ofertados?.map((po) => (
                                <MenuItem key={po.id} value={po.id}>
                                    {po.programa} — {po.modalidad} ({po.vacantes} vacantes disponibles)
                                </MenuItem>
                            ))}
                        </TextField>

                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            2. Identidad Civil (DNI se registrará como Código de Tesorería)
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    label="Tipo Documento"
                                    name="tipo_documento"
                                    value={formPaso1.tipo_documento}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="DNI">DNI</MenuItem>
                                    <MenuItem value="CE">Carnet de Extranjería</MenuItem>
                                    <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="Número de Documento (DNI) *"
                                    name="numero_documento"
                                    value={formPaso1.numero_documento}
                                    onChange={handlePaso1Change}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="8 dígitos (será el código para pagar en Tesorería)"
                                    error={Boolean(errors.numero_documento)}
                                    helperText={errors.numero_documento?.[0]}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Nombres *"
                                    name="nombres"
                                    value={formPaso1.nombres}
                                    onChange={handlePaso1Change}
                                    required
                                    fullWidth
                                    size="small"
                                    error={Boolean(errors.nombres)}
                                    helperText={errors.nombres?.[0]}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Apellido Paterno *"
                                    name="apellido_paterno"
                                    value={formPaso1.apellido_paterno}
                                    onChange={handlePaso1Change}
                                    required
                                    fullWidth
                                    size="small"
                                    error={Boolean(errors.apellido_paterno)}
                                    helperText={errors.apellido_paterno?.[0]}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Apellido Materno *"
                                    name="apellido_materno"
                                    value={formPaso1.apellido_materno}
                                    onChange={handlePaso1Change}
                                    required
                                    fullWidth
                                    size="small"
                                    error={Boolean(errors.apellido_materno)}
                                    helperText={errors.apellido_materno?.[0]}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    label="Sexo"
                                    name="sexo"
                                    value={formPaso1.sexo}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="M">Masculino</MenuItem>
                                    <MenuItem value="F">Femenino</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    type="date"
                                    label="Fecha de Nacimiento"
                                    name="fecha_nacimiento"
                                    value={formPaso1.fecha_nacimiento}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Celular"
                                    name="celular"
                                    value={formPaso1.celular}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                    placeholder="Ej. 984512301"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Correo Electrónico Personal"
                                    name="email_personal"
                                    value={formPaso1.email_personal}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                    placeholder="ejemplo@gmail.com"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Dirección / Domicilio Real"
                                    name="direccion"
                                    value={formPaso1.direccion}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                    placeholder="Av. o Jr., Distrito"
                                />
                            </Grid>
                        </Grid>
                    </form>
                )}

                {/* PASO 2: Código de Tesorería Generado (DNI) */}
                {activeStep === 1 && postulacionCreada && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '50%',
                                backgroundColor: THEME_COLORS.primaryLight,
                                color: THEME_COLORS.primary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <CreditCard size={34} />
                        </Box>

                        <Typography variant="h6" fontWeight={800} gutterBottom>
                            ¡Pre-inscripción Exitosa! Código de Tesorería Generado
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                            El postulante debe acercarse a Caja/Tesorería o efectuar su abono indicando su número de documento de identidad como código único de pago.
                        </Typography>

                        <Card
                            elevation={0}
                            sx={{
                                maxWidth: 450,
                                mx: 'auto',
                                border: `2px dashed ${THEME_COLORS.primary}`,
                                borderRadius: 3,
                                backgroundColor: '#f0f9ff',
                                p: 2,
                                mb: 3,
                            }}
                        >
                            <CardContent sx={{ p: 1 }}>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#0369a1', fontWeight: 700 }}>
                                    Código de Pago para Tesorería (DNI)
                                </Typography>
                                <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', letterSpacing: 2, my: 1 }}>
                                    {postulacionCreada.codigo_tesoreria || postulacionCreada.persona?.numero_documento}
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <Grid container spacing={1} sx={{ textAlign: 'left', fontSize: 13 }}>
                                    <Grid item xs={6} color="text.secondary">Postulante:</Grid>
                                    <Grid item xs={6} fontWeight={600}>{postulacionCreada.persona?.nombre_completo}</Grid>
                                    <Grid item xs={6} color="text.secondary">Concepto:</Grid>
                                    <Grid item xs={6} fontWeight={600}>Derecho de Admisión 2026</Grid>
                                    <Grid item xs={6} color="text.secondary">Monto a Abonar:</Grid>
                                    <Grid item xs={6} fontWeight={800} color={THEME_COLORS.primary}>S/ 150.00</Grid>
                                    <Grid item xs={6} color="text.secondary">Estado Actual:</Grid>
                                    <Grid item xs={6}>
                                        <Chip label="PENDIENTE DE PAGO" size="small" color="warning" sx={{ fontWeight: 700 }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* PASO 3: Retorno de Tesorería (Pagado/Válido) & Emisión de FUT */}
                {activeStep === 2 && postulacionCreada && (
                    <form id="form-paso-3" onSubmit={handleConfirmarPago}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={800}>
                                Validación y Retorno de Pago de Tesorería
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ingrese el número de recibo o comprobante emitido por Tesorería para el código <strong>{postulacionCreada.codigo_tesoreria}</strong>. El sistema emitirá el número oficial de FUT.
                            </Typography>
                        </Box>

                        <Paper elevation={0} sx={{ p: 2.5, border: '1px solid #e2e8f0', borderRadius: 2, maxWidth: 500, mx: 'auto' }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        label="N° de Recibo / Operación de Tesorería *"
                                        name="comprobante_pago"
                                        value={formPaso3.comprobante_pago}
                                        onChange={handlePaso3Change}
                                        required
                                        fullWidth
                                        size="small"
                                        placeholder="Ej. REC-2026-0042 o 0984123"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        type="number"
                                        label="Monto Abonado (S/)"
                                        name="monto_pago"
                                        value={formPaso3.monto_pago}
                                        onChange={handlePaso3Change}
                                        fullWidth
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        type="date"
                                        label="Fecha de Pago"
                                        name="fecha_pago"
                                        value={formPaso3.fecha_pago}
                                        onChange={handlePaso3Change}
                                        fullWidth
                                        size="small"
                                        InputLabelProps={{ shrink: true }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </form>
                )}

                {/* PASO 4: Expediente Escolar (Colegio Modular) y Requisitos */}
                {activeStep === 3 && postulacionCreada && (
                    <form id="form-paso-4" onSubmit={handleCompletarExpediente}>
                        {postulacionCreada.numero_fut && (
                            <Alert severity="success" icon={<FileCheck size={20} />} sx={{ mb: 2.5, fontWeight: 600 }}>
                                ¡FUT Oficial Generado: <strong>{postulacionCreada.numero_fut}</strong>! Proceda a completar la procedencia escolar y verificar requisitos.
                            </Alert>
                        )}

                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            1. Datos de la Institución Educativa donde Concluyó Secundaria
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    label="Nombre del Colegio / I.E. de Egreso *"
                                    name="colegio_fin_secundaria"
                                    value={formPaso4.colegio_fin_secundaria}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="Ej. I.E. Gran Unidad Faustino Sánchez Carrión"
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Código Modular (7 dígitos) *"
                                    name="codigo_modular_colegio"
                                    value={formPaso4.codigo_modular_colegio}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="Ej. 0349812"
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    type="number"
                                    label="Año de Egreso *"
                                    name="anio_egreso_colegio"
                                    value={formPaso4.anio_egreso_colegio}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    label="Gestión"
                                    name="colegio_tipo_gestion"
                                    value={formPaso4.colegio_tipo_gestion}
                                    onChange={handlePaso4Change}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="PUBLICA">Pública</MenuItem>
                                    <MenuItem value="PRIVADA">Privada</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Departamento"
                                    name="colegio_departamento"
                                    value={formPaso4.colegio_departamento}
                                    onChange={handlePaso4Change}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Distrito"
                                    name="colegio_distrito"
                                    value={formPaso4.colegio_distrito}
                                    onChange={handlePaso4Change}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1 }}>
                            2. Verificación de Requisitos Físicos y Fotografía
                        </Typography>

                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Grid container spacing={1}>
                                <Grid item xs={12} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formPaso4.tiene_copia_dni_color}
                                                onChange={handlePaso4Change}
                                                name="tiene_copia_dni_color"
                                                color="primary"
                                            />
                                        }
                                        label="Fotocopia DNI a color"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formPaso4.tiene_partida_nacimiento}
                                                onChange={handlePaso4Change}
                                                name="tiene_partida_nacimiento"
                                                color="primary"
                                            />
                                        }
                                        label="Partida de Nacimiento"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formPaso4.tiene_certificado_nacimiento_original}
                                                onChange={handlePaso4Change}
                                                name="tiene_certificado_nacimiento_original"
                                                color="primary"
                                            />
                                        }
                                        label="Certificado Nacimiento Orig."
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Enlace / Ruta de Fotografía Tamaño Carnet (Fondo Blanco)"
                                        name="foto_url"
                                        value={formPaso4.foto_url}
                                        onChange={handlePaso4Change}
                                        fullWidth
                                        size="small"
                                        placeholder="Opcional: URL o identificador de foto digital"
                                        sx={{ mt: 1 }}
                                    />
                                </Grid>
                            </Grid>
                        </Paper>
                    </form>
                )}

                {/* PASO 5: Generación de Formatos Oficiales (FUT y Declaración Jurada) */}
                {activeStep === 4 && postulacionCreada && (
                    <Box sx={{ py: 1 }}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    backgroundColor: THEME_COLORS.successLight,
                                    color: THEME_COLORS.successText,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mx: 'auto',
                                    mb: 1.5,
                                }}
                            >
                                <CheckCircle2 size={32} />
                            </Box>
                            <Typography variant="h6" fontWeight={800}>
                                Formatos Oficiales Generados Exitosamente
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Imprima o guarde en PDF los documentos obligatorios reglamentarios del proceso de admisión.
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* Card FUT */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        border: '1.5px solid #0284c7',
                                        borderRadius: 2.5,
                                        backgroundColor: '#f8fafc',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <FileText size={22} color="#0284c7" />
                                            <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                                                Formulario Único de Trámite (FUT)
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 700, display: 'block', mb: 1 }}>
                                            N° OFICIAL: {postulacionCreada.numero_fut}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize={12} paragraph>
                                            Incluye datos completos del postulante, carrera ofertada, código modular del colegio y <strong>espacios en blanco para completar con lapicero</strong> por Mesa de Partes (folios, observaciones y firma).
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={<Printer size={16} />}
                                        onClick={() => onViewDocument(
                                            `FUT Oficial — ${postulacionCreada.numero_fut}`,
                                            admissionService.getFutPrintUrl(postulacionCreada.id)
                                        )}
                                        sx={{
                                            backgroundColor: '#0284c7',
                                            '&:hover': { backgroundColor: '#0369a1' },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            mt: 2,
                                        }}
                                    >
                                        Ver / Imprimir FUT (A4)
                                    </Button>
                                </Paper>
                            </Grid>

                            {/* Card Declaración Jurada */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        border: '1.5px solid #0f172a',
                                        borderRadius: 2.5,
                                        backgroundColor: '#f8fafc',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <ShieldCheck size={22} color="#0f172a" />
                                            <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                                                Declaración Jurada de Antecedentes
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mb: 1 }}>
                                            LEY N° 27444 — PROCEDIMIENTO ADMINISTRATIVO
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize={12} paragraph>
                                            Documento legal obligatorio donde el postulante declara bajo juramento no registrar antecedentes penales, judiciales ni policiales, con recuadros para <strong>firma manuscrita e índice derecho (huella dactilar)</strong>.
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={<Printer size={16} />}
                                        onClick={() => onViewDocument(
                                            `Declaración Jurada — ${postulacionCreada.persona?.numero_documento}`,
                                            admissionService.getDeclaracionPrintUrl(postulacionCreada.id)
                                        )}
                                        sx={{
                                            backgroundColor: '#0f172a',
                                            '&:hover': { backgroundColor: '#1e293b' },
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            mt: 2,
                                        }}
                                    >
                                        Ver / Imprimir Declaración Jurada
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* PASO 6: Registro Concluido */}
                {activeStep === 5 && postulacionCreada && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                        <Box
                            sx={{
                                width: 70,
                                height: 70,
                                borderRadius: '50%',
                                backgroundColor: THEME_COLORS.successLight,
                                color: THEME_COLORS.successText,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2,
                            }}
                        >
                            <CheckCircle2 size={40} />
                        </Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom>
                            ¡Postulante Registrado e Inscrito Correctamente!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 550, mx: 'auto', mb: 3 }}>
                            El expediente físico y digital se encuentra registrado en el sistema. El postulante ha sido incorporado al padrón oficial y se encuentra habilitado para la asignación de aulas y pruebas del proceso de admisión.
                        </Typography>

                        <Paper elevation={0} sx={{ p: 2, maxWidth: 450, mx: 'auto', border: '1px solid #e2e8f0', borderRadius: 2, textAlign: 'left', mb: 2 }}>
                            <Grid container spacing={1} fontSize={13}>
                                <Grid item xs={5} color="text.secondary">Código Postulante:</Grid>
                                <Grid item xs={7} fontWeight={700} color={THEME_COLORS.primary}>{postulacionCreada.codigo_postulante}</Grid>
                                <Grid item xs={5} color="text.secondary">Número de FUT:</Grid>
                                <Grid item xs={7} fontWeight={700} color="#b91c1c">{postulacionCreada.numero_fut}</Grid>
                                <Grid item xs={5} color="text.secondary">DNI / Tesorería:</Grid>
                                <Grid item xs={7} fontWeight={600}>{postulacionCreada.persona?.numero_documento}</Grid>
                                <Grid item xs={5} color="text.secondary">Estado de Pago:</Grid>
                                <Grid item xs={7} fontWeight={700} color="#166534">PAGADO (Recibo: {postulacionCreada.comprobante_pago})</Grid>
                                <Grid item xs={5} color="text.secondary">Estado Admisión:</Grid>
                                <Grid item xs={7}>
                                    <Chip label="INSCRITO / APTO EVALUACIÓN" size="small" color="success" sx={{ fontWeight: 700 }} />
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, justifyContent: 'space-between', borderTop: '1px solid #e2e8f0' }}>
                <Button
                    onClick={onClose}
                    disabled={loading}
                    sx={{ textTransform: 'none', color: THEME_COLORS.textSecondary }}
                >
                    {activeStep === 5 ? 'Cerrar' : 'Cancelar'}
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    {activeStep === 0 && (
                        <Button
                            type="submit"
                            form="form-paso-1"
                            variant="contained"
                            disabled={loading}
                            endIcon={<ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Generar Código de Tesorería (DNI)'}
                        </Button>
                    )}

                    {activeStep === 1 && (
                        <Button
                            variant="contained"
                            onClick={handleIrAValidarPago}
                            endIcon={<ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Validar Retorno de Pago de Tesorería
                        </Button>
                    )}

                    {activeStep === 2 && (
                        <Button
                            type="submit"
                            form="form-paso-3"
                            variant="contained"
                            disabled={loading}
                            endIcon={<ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.success,
                                '&:hover': { backgroundColor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Confirmar Pago y Emitir FUT'}
                        </Button>
                    )}

                    {activeStep === 3 && (
                        <Button
                            type="submit"
                            form="form-paso-4"
                            variant="contained"
                            disabled={loading}
                            endIcon={<ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {loading ? <CircularProgress size={20} color="inherit" /> : 'Guardar Expediente y Generar Documentos'}
                        </Button>
                    )}

                    {activeStep === 4 && (
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(5)}
                            endIcon={<ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            Continuar a Finalización
                        </Button>
                    )}

                    {activeStep === 5 && (
                        <Button
                            variant="contained"
                            onClick={handleFinalizar}
                            sx={{
                                backgroundColor: THEME_COLORS.success,
                                '&:hover': { backgroundColor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 600,
                                px: 3,
                            }}
                        >
                            Finalizar y Ver en el Padrón
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}

