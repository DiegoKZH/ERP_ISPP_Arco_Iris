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
    Lock,
} from 'lucide-react';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';

const STEPS = [
    'Datos Personales',
    'Solicitud Inicial',
    'Código Tesorería (DNI)',
    'Validación Pago & FUT',
    'Expediente Escolar',
    'Formatos Oficiales PDF',
    'Ficha Integral & Expediente',
    'Formatos Oficiales A4',
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

    // Formulario Paso 1: Solicitud Inicial (SOLO DNI, Nombres y Apellidos)
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

    // Formulario Paso 4: Ficha Integral de Datos Personales y Expediente Escolar
    const [formPaso4, setFormPaso4] = useState({
        // Datos personales complementarios
        sexo: 'M',
        fecha_nacimiento: '',
        celular: '',
        email_personal: '',
        direccion: '',
        // Procedencia escolar
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

    // 1 -> 2: Registro inicial para generar código de tesorería (DNI)
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
                comprobante_pago: `REC-${new Date().getFullYear()}-${res.data.persona?.numero_documento?.slice(-4) || '0001'}`,
            }));
            setActiveStep(1); // Paso 2: Código de Tesorería
        } catch (err) {
            if (err.response?.status === 422 && err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setErrorMsg(err.response?.data?.message || 'Error al registrar la solicitud de admisión.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 2 -> 3: Ir a validar pago
    const handleIrAValidarPago = () => {
        setActiveStep(2);
    };

    // 3 -> 4: Validar Pago y emitir FUT
    const handleConfirmarPago = async (e) => {
        e.preventDefault();
        if (!postulacionCreada?.id) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await admissionService.validarPago(postulacionCreada.id, formPaso3);
            setPostulacionCreada(res.data);
            setActiveStep(3); // Paso 4: Ficha Integral de Datos Personales y Expediente
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al validar el pago en tesorería.');
        } finally {
            setLoading(false);
        }
    };

    // 4 -> 5: Completar Datos Personales y Expediente Escolar
    const handleCompletarExpediente = async (e) => {
        e.preventDefault();
        if (!postulacionCreada?.id) return;
        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await admissionService.completarExpediente(postulacionCreada.id, formPaso4);
            setPostulacionCreada(res.data);
            setActiveStep(4); // Paso 5: Formatos Oficiales A4
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al completar los datos personales y expediente.');
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

    // Programas autorizados disponibles
    const programasDisponibles = procesoDetalle?.programas_ofertados?.filter((po) => {
        const progName = (po.programa || '').toLowerCase();
        return progName.includes('inicial') || progName.includes('física') || progName.includes('fisica');
    }) || procesoDetalle?.programas_ofertados || [];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ pb: 1, borderBottom: '1px solid #e2e8f0' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h6" fontWeight={800} color={THEME_COLORS.textPrimary}>
                            Registro de Solicitud de Admisión — Convocatoria {procesoDetalle?.codigo || '2026'}
                        </Typography>
                        <Typography variant="body2" color={THEME_COLORS.textSecondary}>
                            Flujo institucional regulado: Solicitud Básica → Código Tesorería (DNI) → Retorno de Pago & FUT → Ficha Integral y Expediente.
                        </Typography>
                    </Box>
                    {postulacionCreada && (
                        <Chip
                            label={`Cód: ${postulacionCreada.codigo_postulante}`}
                            color="primary"
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 700 }}
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
                                <Typography variant="caption" fontWeight={activeStep === index ? 800 : 500}>
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
                {/* PASO 1: Solicitud Inicial (DNI, Nombres y Apellidos) */}
                {activeStep === 0 && (
                    <form id="form-paso-1" onSubmit={handlePreInscribir}>
                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            1. Selección de Programa Pedagógico Autorizado
                        </Typography>

                        <TextField
                            select
                            label="Programa de Estudios"
                            name="admision_programa_ofertado_id"
                            value={formPaso1.admision_programa_ofertado_id}
                            onChange={handlePaso1Change}
                            required
                            fullWidth
                            size="small"
                            sx={{ mb: 2.5 }}
                            error={Boolean(errors.admision_programa_ofertado_id)}
                            helperText={errors.admision_programa_ofertado_id?.[0]}
                        >
                            {programasDisponibles.map((po) => (
                                <MenuItem key={po.id} value={po.id}>
                                    {po.programa} — {po.modalidad} ({po.vacantes} vacantes ofertadas)
                                </MenuItem>
                            ))}
                        </TextField>

                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            2. Identificación Básica del Postulante
                        </Typography>

                        <Alert severity="info" sx={{ mb: 2, fontSize: 13, borderRadius: 2 }}>
                            Para emitir el Código de Pago de Tesorería, <strong>únicamente se requieren su documento de identidad y nombres completos</strong>. Los demás datos personales se completarán tras la emisión del Código FUT.
                        </Alert>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    select
                                    label="Tipo de Documento"
                                    name="tipo_documento"
                                    value={formPaso1.tipo_documento}
                                    onChange={handlePaso1Change}
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="DNI">DNI (Documento Nacional)</MenuItem>
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
                                    placeholder="8 dígitos para DNI (será su código de tesorería)"
                                    error={Boolean(errors.numero_documento)}
                                    helperText={errors.numero_documento?.[0] || 'Este número será su código único para pagar en Tesorería'}
                                />
                            </Grid>

                            {/* Nombres y apellidos */}
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
                        </Grid>
                    </form>
                )}

                {/* PASO 2: Código de Tesorería Generado (DNI) */}
                {/* PASO 2: Código de Tesorería Asignado (DNI) */}
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
                            Solicitud Registrada con Éxito
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mb: 3 }}>
                            Se ha generado la orden de pago en Tesorería. El postulante debe abonar el derecho de admisión indicando su DNI como código único de cobranza.
                        </Typography>

                        <Card
                            elevation={0}
                            sx={{
                                maxWidth: 460,
                                mx: 'auto',
                                border: `2px dashed ${THEME_COLORS.primary}`,
                                borderRadius: 3,
                                backgroundColor: '#f0f9ff',
                                p: 2,
                                mb: 3,
                            }}
                        >
                            <CardContent sx={{ p: 1 }}>
                                <Typography variant="caption" sx={{ textTransform: 'uppercase', color: '#0369a1', fontWeight: 800 }}>
                                    Código de Pago para Tesorería (DNI)
                                </Typography>
                                <Typography variant="h4" fontWeight={900} sx={{ color: '#0f172a', letterSpacing: 2, my: 1 }}>
                                    {postulacionCreada.codigo_tesoreria || postulacionCreada.persona?.numero_documento}
                                </Typography>
                                <Divider sx={{ my: 1.5 }} />
                                <Grid container spacing={1} sx={{ textAlign: 'left', fontSize: 13 }}>
                                    <Grid item xs={6} color="text.secondary">Postulante:</Grid>
                                    <Grid item xs={6} fontWeight={600}>{postulacionCreada.persona?.nombre_completo}</Grid>
                                    <Grid item xs={6} color="text.secondary">Carrera:</Grid>
                                    <Grid item xs={6} fontWeight={600}>{postulacionCreada.programa_ofertado?.programa}</Grid>
                                    <Grid item xs={6} color="text.secondary">Concepto:</Grid>
                                    <Grid item xs={6} fontWeight={600}>Derecho de Examen de Admisión</Grid>
                                    <Grid item xs={6} color="text.secondary">Monto a Abonar:</Grid>
                                    <Grid item xs={6} fontWeight={800} color={THEME_COLORS.primary}>S/ 150.00</Grid>
                                    <Grid item xs={6} color="text.secondary">Estado de Pago:</Grid>
                                    <Grid item xs={6}>
                                        <Chip label="PENDIENTE DE PAGO" size="small" color="warning" sx={{ fontWeight: 700 }} />
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* PASO 3: Retorno de Tesorería (Pagado/Válido) & Emisión de FUT */}
                {/* PASO 3: Validación de Pago en Tesorería & Emisión de FUT */}
                {activeStep === 2 && postulacionCreada && (
                    <form id="form-paso-3" onSubmit={handleConfirmarPago}>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="h6" fontWeight={800}>
                                Validación de Pago y Emisión de Código FUT
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Ingrese el número de comprobante emitido por Tesorería para el código <strong>{postulacionCreada.codigo_tesoreria}</strong>. El sistema emitirá el número reglamentario de FUT.
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
                                        placeholder="Ej. REC-2026-0042 o BOL-0012"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        type="number"
                                        label="Monto Abonado (S/) *"
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
                {/* PASO 4: Ficha Integral de Datos Personales y Expediente Escolar */}
                {activeStep === 3 && postulacionCreada && (
                    <form id="form-paso-4" onSubmit={handleCompletarExpediente}>
                        {postulacionCreada.numero_fut ? (
                            <Alert severity="success" icon={<FileCheck size={20} />} sx={{ mb: 2.5, fontWeight: 700 }}>
                                ¡Código Oficial de FUT Habilitado: <strong>{postulacionCreada.numero_fut}</strong>! Ahora complete la ficha integral de datos personales y expediente.
                            </Alert>
                        ) : (
                            <Alert severity="warning" icon={<Lock size={20} />} sx={{ mb: 2.5, fontWeight: 700 }}>
                                Debe validar el pago en Tesorería para habilitar el Código de FUT antes de completar sus datos personales y expediente.
                            </Alert>
                        )}

                        {/* 1. Datos Personales Complementarios */}
                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            1. Datos Personales Complementarios del Postulante
                        </Typography>

                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} sm={3}>
                                <TextField
                                    select
                                    label="Sexo *"
                                    name="sexo"
                                    value={formPaso4.sexo}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                >
                                    <MenuItem value="M">Masculino</MenuItem>
                                    <MenuItem value="F">Femenino</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    type="date"
                                    label="Fecha de Nacimiento *"
                                    name="fecha_nacimiento"
                                    value={formPaso4.fecha_nacimiento}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    label="Celular *"
                                    name="celular"
                                    value={formPaso4.celular}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="9 dígitos"
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <TextField
                                    type="email"
                                    label="Correo Electrónico"
                                    name="email_personal"
                                    value={formPaso4.email_personal}
                                    onChange={handlePaso4Change}
                                    fullWidth
                                    size="small"
                                    placeholder="postulante@gmail.com"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Dirección / Domicilio Real *"
                                    name="direccion"
                                    value={formPaso4.direccion}
                                    onChange={handlePaso4Change}
                                    required
                                    fullWidth
                                    size="small"
                                    placeholder="Av., Jr., Calle, Urbanización y Distrito"
                                />
                            </Grid>
                        </Grid>

                        {/* 2. Procedencia Escolar */}
                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1.5 }}>
                            2. Institución Educativa donde Concluyó Secundaria
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
                                    label="Tipo de Gestión *"
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

                        {/* 3. Requisitos Físicos */}
                        <Typography variant="subtitle2" sx={{ color: THEME_COLORS.primary, fontWeight: 700, mb: 1 }}>
                            2. Verificación de Requisitos Físicos y Fotografía
                            3. Verificación de Requisitos Documentarios Físicos
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
                                        label="Partida de Nacimiento Orig."
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
                                Formatos Oficiales Listos para Emisión
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Se han consolidado todos los datos. Proceda a imprimir o visualizar el FUT institucional y la Declaración Jurada reglamentaria.
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
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Formato oficial prellenado con el N° de FUT <strong>{postulacionCreada.numero_fut}</strong>, membrete ministerial, datos del postulante y casillas reglamentarias en blanco para Mesa de Partes.
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" fontSize={12} paragraph>
                                            Incluye datos completos del postulante, carrera ofertada, código modular del colegio y <strong>espacios en blanco para completar con lapicero</strong> por Mesa de Partes (folios, observaciones y firma).
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        startIcon={<Printer size={16} />}
                                        onClick={() => onViewDocument?.(
                                            `Formato Oficial de FUT — ${postulacionCreada.numero_fut}`,
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
                                        Ver e Imprimir FUT Oficial (A4)
                                    </Button>
                                </Paper>
                            </Grid>

                            {/* Card Declaración Jurada */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        border: '1.5px solid #475569',
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
                                            <ShieldCheck size={22} color="#334155" />
                                            <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                                                Declaración Jurada de Antecedentes
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" fontSize={12} paragraph>
                                            Documento legal obligatorio donde el postulante declara bajo juramento no registrar antecedentes penales, judiciales ni policiales, con recuadros para <strong>firma manuscrita e índice derecho (huella dactilar)</strong>.
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="outlined"
                                        startIcon={<Printer size={16} />}
                                        onClick={() => onViewDocument?.(
                                            `Declaración Jurada Oficial — ${postulacionCreada.persona?.numero_documento}`,
                                            admissionService.getDeclaracionPrintUrl(postulacionCreada.id)
                                        )}
                                        sx={{
                                            borderColor: '#475569',
                                            color: '#1e293b',
                                            '&:hover': { backgroundColor: '#f1f5f9', borderColor: '#0f172a' },
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            mt: 2,
                                        }}
                                    >
                                        Ver e Imprimir Dec. Jurada (A4)
                                    </Button>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* PASO 6: Registro Finalizado */}
                {activeStep === 5 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box
                            sx={{
                                width: 72,
                                height: 72,
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
                            <CheckCircle2 size={44} />
                        </Box>
                        <Typography variant="h5" fontWeight={800} gutterBottom>
                            ¡Postulante Inscrito Exitosamente!
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
                            El expediente del postulante ha quedado consolidado en el padrón oficial con su Código FUT, comprobante de pago de tesorería y procedencia escolar verificada.
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

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
                <Box>
                    {activeStep > 0 && activeStep < 5 && (
                        <Button
                            onClick={() => setActiveStep((prev) => prev - 1)}
                            startIcon={<ChevronLeft size={16} />}
                            disabled={loading}
                        >
                            Atrás
                        </Button>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Button onClick={onClose} disabled={loading} color="inherit">
                        Cerrar
                    </Button>

                    {activeStep === 0 && (
                        <Button
                            type="submit"
                            form="form-paso-1"
                            variant="contained"
                            disabled={loading}
                            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            {loading ? 'Generando...' : 'Generar Código Tesorería (DNI)'}
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
                                fontWeight: 700,
                            }}
                        >
                            Continuar a Validación de Pago
                        </Button>
                    )}

                    {activeStep === 2 && (
                        <Button
                            type="submit"
                            form="form-paso-3"
                            variant="contained"
                            disabled={loading}
                            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            {loading ? 'Validando...' : 'Confirmar Pago & Emitir FUT'}
                        </Button>
                    )}

                    {activeStep === 3 && (
                        <Button
                            type="submit"
                            form="form-paso-4"
                            variant="contained"
                            disabled={loading || !postulacionCreada?.numero_fut}
                            endIcon={loading ? <CircularProgress size={16} color="inherit" /> : <ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            {loading ? 'Guardando...' : 'Guardar Ficha Integral & Ver Formatos'}
                        </Button>
                    )}

                    {activeStep === 4 && (
                        <Button
                            variant="contained"
                            onClick={() => setActiveStep(5)}
                            endIcon={<ChevronRight size={16} />}
                            sx={{
                                backgroundColor: THEME_COLORS.success,
                                '&:hover': { backgroundColor: '#15803d' },
                                textTransform: 'none',
                                fontWeight: 700,
                            }}
                        >
                            Concluir y Ver Resumen
                        </Button>
                    )}

                    {activeStep === 5 && (
                        <Button
                            variant="contained"
                            onClick={handleFinalizar}
                            sx={{
                                backgroundColor: THEME_COLORS.primary,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 700,
                            }}
                        >
                            Finalizar y Volver al Padrón
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}

