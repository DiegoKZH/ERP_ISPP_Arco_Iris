import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { admissionService } from '../../services/admissionService';
import { THEME_COLORS } from '../../theme/colors';
import DocumentViewerModal from './DocumentViewerModal';
import {
    UserPlus,
    CreditCard,
    CheckCircle2,
    FileText,
    Printer,
    ArrowLeft,
    ChevronRight,
    ChevronLeft,
    Search,
    ShieldCheck,
    Lock,
    Unlock,
    Upload,
    Calendar,
    Award,
    School,
    FileCheck,
    Check,
    AlertCircle,
    Info,
    Trash2,
    Image as ImageIcon,
} from 'lucide-react';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    TextField,
    MenuItem,
    Grid,
    Alert,
    CircularProgress,
    Card,
    CardContent,
    Divider,
    Checkbox,
    FormControlLabel,
    Chip,
    InputAdornment,
    Tooltip,
} from '@mui/material';

const STEPS = [
    { number: 1, title: 'Datos', subtitle: 'Información personal' },
    { number: 2, title: 'Foto', subtitle: 'Imagen de perfil' },
    { number: 3, title: 'Especialidad', subtitle: 'Carrera profesional' },
    { number: 4, title: 'Colegio', subtitle: 'Institución educativa' },
    { number: 5, title: 'Documentos', subtitle: 'Requisitos' },
    { number: 6, title: 'Pago', subtitle: 'Voucher / Formatos' },
];

export default function InscripcionPostulantePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const queryDni = searchParams.get('dni') || '';
    const fileInputRef = useRef(null);

    // Estados de Convocatoria
    const [procesos, setProcesos] = useState([]);
    const [selectedProcesoId, setSelectedProcesoId] = useState('');
    const [procesoDetalle, setProcesoDetalle] = useState(null);
    const [loadingProceso, setLoadingProceso] = useState(false);

    // Estado de paso activo (0 a 5)
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [buscandoDni, setBuscandoDni] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const [infoMsg, setInfoMsg] = useState(null);

    // Postulacion state (persistida tras registro inicial o recuperación)
    const [postulacion, setPostulacion] = useState(null);

    // Paso 1: Datos Personales (todos los campos del backend y modelo Persona)
    const [formDatos, setFormDatos] = useState({
        tipo_documento: 'DNI',
        numero_documento: '',
        fecha_inscripcion: new Date().toISOString().split('T')[0],
        pais: 'PERÚ',
        email_personal: '',
        nombres: '',
        apellido_paterno: '',
        apellido_materno: '',
        sexo: '',
        fecha_nacimiento: '',
        departamento: 'Cusco',
        provincia: 'Cusco',
        distrito: 'Cusco',
        lengua_materna: 'Castellano',
        segunda_lengua: 'Quechua',
        departamento_domicilio: 'Cusco',
        provincia_domicilio: 'Cusco',
        distrito_domicilio: 'Cusco',
        direccion: '',
        celular: '',
        celular_emergencia: '',
    });

    // Paso 2: Foto (subida real de archivo + URL de soporte)
    const [fotoUrl, setFotoUrl] = useState('');
    const [fotoFile, setFotoFile] = useState(null);

    // Paso 3: Especialidad / Carrera
    const [selectedProgramaOfertadoId, setSelectedProgramaOfertadoId] = useState('');

    // Paso 4: Colegio / Procedencia Escolar
    const [formColegio, setFormColegio] = useState({
        colegio_fin_secundaria: '',
        codigo_modular_colegio: '',
        anio_egreso_colegio: new Date().getFullYear() - 1,
        colegio_tipo_gestion: 'PUBLICA',
        colegio_departamento: 'Cusco',
        colegio_provincia: 'Cusco',
        colegio_distrito: 'Cusco',
    });

    // Paso 5: Documentos Requisitos
    const [formDocumentos, setFormDocumentos] = useState({
        tiene_copia_dni_color: true,
        tiene_partida_nacimiento: true,
        tiene_certificado_nacimiento_original: true,
    });

    // Paso 6: Pago y Comprobante
    const [formPago, setFormPago] = useState({
        comprobante_pago: '',
        monto_pago: '150.00',
        fecha_pago: new Date().toISOString().split('T')[0],
    });

    // Visor de Documentos (FUT y Declaración Jurada)
    const [docViewerModal, setDocViewerModal] = useState({
        open: false,
        title: '',
        printUrl: '',
    });

    // Cargar Convocatorias al montar
    useEffect(() => {
        loadProcesos();
    }, []);

    // Cargar datos si vino con parámetros en la URL
    useEffect(() => {
        if (queryDni && selectedProcesoId) {
            handleBuscarDni(queryDni);
        }
    }, [queryDni, selectedProcesoId]);

    const loadProcesos = async () => {
        try {
            setLoadingProceso(true);
            const res = await admissionService.getProcesos();
            const list = res.data || [];
            setProcesos(list);

            const abierta = list.find((p) => p.estado === 'CONVOCATORIA_ABIERTA') || list[0];
            if (abierta) {
                setSelectedProcesoId(abierta.id);
                loadProcesoDetalle(abierta.id);
            }
        } catch (err) {
            setErrorMsg('No se pudieron cargar las convocatorias de admisión.');
        } finally {
            setLoadingProceso(false);
        }
    };

    const loadProcesoDetalle = async (id) => {
        try {
            const detalle = await admissionService.getProceso(id);
            setProcesoDetalle(detalle);
            if (detalle.programas_ofertados?.length > 0 && !selectedProgramaOfertadoId) {
                setSelectedProgramaOfertadoId(detalle.programas_ofertados[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleProcesoChange = (e) => {
        const id = e.target.value;
        setSelectedProcesoId(id);
        loadProcesoDetalle(id);
        setPostulacion(null);
    };

    // Consulta de DNI o documento para reanudación de flujo
    const handleBuscarDni = async (dniToSearch = null) => {
        const doc = dniToSearch || formDatos.numero_documento;
        if (!doc || doc.trim().length < 5) {
            setErrorMsg('Ingrese un número de documento válido para consultar.');
            return;
        }

        setBuscandoDni(true);
        setErrorMsg(null);
        setInfoMsg(null);

        try {
            const res = await admissionService.consultarPorDni(doc.trim(), selectedProcesoId);
            
            if (res.encontrado && res.data) {
                const post = res.data;
                setPostulacion(post);
                
                // Precargar datos personales
                if (post.persona) {
                    setFormDatos((prev) => ({
                        ...prev,
                        tipo_documento: post.persona.tipo_documento || prev.tipo_documento,
                        numero_documento: post.persona.numero_documento || doc,
                        nombres: post.persona.nombres || '',
                        apellido_paterno: post.persona.apellido_paterno || '',
                        apellido_materno: post.persona.apellido_materno || '',
                        sexo: post.persona.sexo || '',
                        fecha_nacimiento: post.persona.fecha_nacimiento ? post.persona.fecha_nacimiento.split('T')[0] : '',
                        email_personal: post.persona.email_personal || '',
                        celular: post.persona.celular || '',
                        direccion: post.persona.direccion || '',
                    }));
                }

                // Precargar colegio
                if (post.colegio_fin_secundaria) {
                    setFormColegio({
                        colegio_fin_secundaria: post.colegio_fin_secundaria || '',
                        codigo_modular_colegio: post.codigo_modular_colegio || '',
                        anio_egreso_colegio: post.anio_egreso_colegio || new Date().getFullYear() - 1,
                        colegio_tipo_gestion: post.colegio_tipo_gestion || 'PUBLICA',
                        colegio_departamento: post.colegio_departamento || 'Cusco',
                        colegio_provincia: post.colegio_provincia || 'Cusco',
                        colegio_distrito: post.colegio_distrito || 'Cusco',
                    });
                }

                if (post.foto_url) setFotoUrl(post.foto_url);
                if (post.admision_programa_ofertado_id) setSelectedProgramaOfertadoId(post.admision_programa_ofertado_id);

                setFormPago((prev) => ({
                    ...prev,
                    comprobante_pago: post.comprobante_pago || `REC-${new Date().getFullYear()}-${doc.slice(-4)}`,
                    monto_pago: post.monto_pago || '150.00',
                }));

                if (post.estado_inscripcion === 'INSCRITO') {
                    setInfoMsg(`¡El postulante ya está oficialmente inscrito con Código FUT: ${post.numero_fut}! Todos sus datos están consolidados.`);
                    setActiveStep(5);
                } else if (post.estado_pago === 'PAGADO' || post.numero_fut) {
                    setInfoMsg(`¡Pago validado en Tesorería con Código FUT: ${post.numero_fut}! Puede continuar completando los datos de su ficha y expediente.`);
                    setActiveStep(1);
                } else {
                    setInfoMsg(`Se encontró una solicitud previa para este documento (Código de Tesorería: ${doc}). Estado: Pendiente de pago.`);
                }
            } else if (res.persona) {
                setFormDatos((prev) => ({
                    ...prev,
                    tipo_documento: res.persona.tipo_documento || prev.tipo_documento,
                    numero_documento: res.persona.numero_documento || doc,
                    nombres: res.persona.nombres || '',
                    apellido_paterno: res.persona.apellido_paterno || '',
                    apellido_materno: res.persona.apellido_materno || '',
                    sexo: res.persona.sexo || '',
                    fecha_nacimiento: res.persona.fecha_nacimiento ? res.persona.fecha_nacimiento.split('T')[0] : '',
                    email_personal: res.persona.email_personal || '',
                    celular: res.persona.celular || '',
                    direccion: res.persona.direccion || '',
                }));
                setInfoMsg('Datos de la persona encontrados en la base de datos institucional. Proceda a iniciar la solicitud.');
            } else {
                setInfoMsg('Documento disponible para nuevo registro. Complete sus datos personales.');
            }
        } catch (err) {
            console.error(err);
            setErrorMsg('Error al consultar el documento. Verifique su conexión.');
        } finally {
            setBuscandoDni(false);
        }
    };

    const handleConsultarReniec = () => {
        handleBuscarDni(formDatos.numero_documento);
    };

    const handleDatosChange = (e) => {
        const { name, value } = e.target;
        setFormDatos((prev) => ({ ...prev, [name]: value }));
    };

    const handleColegioChange = (e) => {
        const { name, value } = e.target;
        setFormColegio((prev) => ({ ...prev, [name]: value }));
    };

    // Subida real de fotografía desde el equipo
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrorMsg('El archivo seleccionado debe ser una imagen válida (JPG, PNG).');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMsg('La fotografía seleccionada supera los 5 MB permitidos.');
                return;
            }
            setFotoFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFotoUrl(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveFoto = () => {
        setFotoUrl('');
        setFotoFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Guardar Paso 1: Solicitud Inicial en BD (Código de Tesorería = DNI / Documento)
    const handleGuardarPaso1 = async (e) => {
        if (e) e.preventDefault();
        if (!formDatos.numero_documento || !formDatos.nombres || !formDatos.apellido_paterno || !formDatos.apellido_materno) {
            setErrorMsg('Tipo de documento, Número, Nombres y Apellidos completos son obligatorios.');
            return;
        }

        setLoading(true);
        setErrorMsg(null);
        setInfoMsg(null);

        try {
            const payload = {
                admision_proceso_id: selectedProcesoId,
                admision_programa_ofertado_id: selectedProgramaOfertadoId || undefined,
                tipo_documento: formDatos.tipo_documento || 'DNI',
                numero_documento: formDatos.numero_documento.trim(),
                nombres: formDatos.nombres,
                apellido_paterno: formDatos.apellido_paterno,
                apellido_materno: formDatos.apellido_materno,
                fecha_nacimiento: formDatos.fecha_nacimiento || null,
                sexo: formDatos.sexo || null,
                direccion: formDatos.direccion || null,
                celular: formDatos.celular || null,
                email_personal: formDatos.email_personal || null,
            };

            const res = await admissionService.preInscribir(payload);
            setPostulacion(res.data);
            setInfoMsg('¡Datos personales registrados! Código de Tesorería asignado: ' + res.codigo_tesoreria);
            setActiveStep(1); // Pasar al Paso 2: Foto
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al registrar los datos iniciales.');
        } finally {
            setLoading(false);
        }
    };

    // Validar Pago directamente en Paso 6
    const handleConfirmarPago = async () => {
        if (!postulacion?.id) return;
        if (!formPago.comprobante_pago) {
            setErrorMsg('Ingrese el número de comprobante o recibo emitido por Tesorería.');
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await admissionService.validarPago(postulacion.id, formPago);
            setPostulacion(res.data);
            setInfoMsg(`¡Pago validado exitosamente! Código reglamentario de FUT emitido: ${res.numero_fut}`);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al validar el pago.');
        } finally {
            setLoading(false);
        }
    };

    // Guardar Expediente Completo (Paso 4 y 5 hacia 6)
    const handleFinalizarExpediente = async () => {
        if (!postulacion?.id) {
            setErrorMsg('Primero debe completar la solicitud inicial.');
            return;
        }

        if (!postulacion.numero_fut || postulacion.estado_pago !== 'PAGADO') {
            setErrorMsg('Debe contar con el Código de FUT habilitado en Tesorería para consolidar la inscripción.');
            setActiveStep(5);
            return;
        }

        if (!formColegio.colegio_fin_secundaria || !formColegio.codigo_modular_colegio) {
            setErrorMsg('Los datos del colegio y código modular de secundaria son requeridos.');
            setActiveStep(3);
            return;
        }

        setLoading(true);
        setErrorMsg(null);

        try {
            // Manejo de URL para no exceder los 255 chars de la columna en BD si se subió un DataURL base64
            let fotoParaEnviar = fotoUrl || null;
            if (fotoParaEnviar && fotoParaEnviar.startsWith('data:image')) {
                fotoParaEnviar = `/storage/fotos/postulante_${formDatos.numero_documento || postulacion.id}.jpg`;
            }

            const payload = {
                admision_programa_ofertado_id: selectedProgramaOfertadoId || undefined,
                colegio_fin_secundaria: formColegio.colegio_fin_secundaria,
                codigo_modular_colegio: formColegio.codigo_modular_colegio,
                anio_egreso_colegio: parseInt(formColegio.anio_egreso_colegio),
                colegio_tipo_gestion: formColegio.colegio_tipo_gestion,
                colegio_departamento: formColegio.colegio_departamento,
                colegio_provincia: formColegio.colegio_provincia,
                colegio_distrito: formColegio.colegio_distrito,
                foto_url: fotoParaEnviar,
                tiene_copia_dni_color: Boolean(formDocumentos.tiene_copia_dni_color),
                tiene_partida_nacimiento: Boolean(formDocumentos.tiene_partida_nacimiento),
                tiene_certificado_nacimiento_original: Boolean(formDocumentos.tiene_certificado_nacimiento_original),
                fecha_nacimiento: formDatos.fecha_nacimiento || null,
                sexo: formDatos.sexo || null,
                celular: formDatos.celular || null,
                email_personal: formDatos.email_personal || null,
                direccion: formDatos.direccion || null,
                observaciones: JSON.stringify({
                    pais: formDatos.pais,
                    lengua_materna: formDatos.lengua_materna,
                    segunda_lengua: formDatos.segunda_lengua,
                    celular_emergencia: formDatos.celular_emergencia,
                    domicilio_ubicacion: `${formDatos.departamento_domicilio} - ${formDatos.provincia_domicilio} - ${formDatos.distrito_domicilio}`,
                }),
            };

            const res = await admissionService.completarExpediente(postulacion.id, payload);
            setPostulacion(res.data);
            setInfoMsg('¡Postulante oficialmente inscrito en el padrón! Ya puede emitir sus formatos oficiales.');
            setActiveStep(5);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Error al completar el expediente.');
        } finally {
            setLoading(false);
        }
    };

    const isConvocatoriaCerrada = procesoDetalle?.estado === 'CONVOCATORIA_CERRADA';
    const programasOfertados = procesoDetalle?.programas_ofertados || [];

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
                    boxShadow: '0 4px 15px rgba(10, 17, 26, 0.25)',
                    border: `1px solid ${THEME_COLORS.darkNavyBorder}`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ArrowLeft size={16} />}
                        onClick={() => navigate('/admission')}
                        sx={{
                            color: THEME_COLORS.textLight,
                            borderColor: THEME_COLORS.darkNavyBorder,
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: THEME_COLORS.darkNavyHover, borderColor: THEME_COLORS.accent },
                        }}
                    >
                        Volver al Padrón
                    </Button>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <UserPlus size={24} color={THEME_COLORS.accent} />
                        <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: 0.5, color: THEME_COLORS.textLight }}>
                            Registro de Postulante
                        </Typography>
                    </Box>
                </Box>

                {/* Selector de Convocatoria */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <TextField
                        select
                        size="small"
                        label="Convocatoria Activa"
                        value={selectedProcesoId}
                        onChange={handleProcesoChange}
                        disabled={loadingProceso}
                        sx={{
                            minWidth: 260,
                            bgcolor: THEME_COLORS.darkNavySurface,
                            borderRadius: 1.5,
                            '& .MuiInputBase-input': { color: THEME_COLORS.textLight, fontWeight: 600, fontSize: 13 },
                            '& .MuiInputLabel-root': { color: THEME_COLORS.textMuted },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: THEME_COLORS.darkNavyBorder },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: THEME_COLORS.accent },
                            '& .MuiSvgIcon-root': { color: THEME_COLORS.textLight },
                        }}
                    >
                        {procesos.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                                {p.codigo} — {p.nombre} ({p.estado === 'CONVOCATORIA_ABIERTA' ? 'ABIERTA' : 'CERRADA'})
                            </MenuItem>
                        ))}
                    </TextField>

                    {procesoDetalle && (
                        <Chip
                            label={procesoDetalle.estado === 'CONVOCATORIA_ABIERTA' ? 'ABIERTA' : 'CERRADA'}
                            size="small"
                            color={procesoDetalle.estado === 'CONVOCATORIA_ABIERTA' ? 'success' : 'error'}
                            sx={{ fontWeight: 800, fontSize: 11 }}
                        />
                    )}
                </Box>
            </Paper>

            {/* Alertas de Estado */}
            {isConvocatoriaCerrada && (
                <Alert severity="warning" icon={<Lock size={20} />} sx={{ mb: 3, borderRadius: 2, fontWeight: 700 }}>
                    Esta convocatoria se encuentra actualmente <strong>CERRADA</strong>. No se admiten nuevas inscripciones.
                </Alert>
            )}

            {errorMsg && (
                <Alert severity="error" onClose={() => setErrorMsg(null)} sx={{ mb: 3, borderRadius: 2 }}>
                    {errorMsg}
                </Alert>
            )}

            {infoMsg && (
                <Alert severity="info" onClose={() => setInfoMsg(null)} sx={{ mb: 3, borderRadius: 2, fontWeight: 600 }}>
                    {infoMsg}
                </Alert>
            )}

            {/* STEPPER VISUAL CON RECIPIENTES */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, md: 3 },
                    borderRadius: 3,
                    border: `1px solid ${THEME_COLORS.border}`,
                    mb: 3,
                    bgcolor: THEME_COLORS.surface,
                }}
            >
                {/* Barra de Progreso Superior */}
                <Box sx={{ width: '100%', height: 6, bgcolor: THEME_COLORS.border, borderRadius: 3, mb: 3, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            width: `${((activeStep + 1) / STEPS.length) * 100}%`,
                            height: '100%',
                            bgcolor: THEME_COLORS.primary,
                            transition: 'width 0.4s ease-in-out',
                        }}
                    />
                </Box>

                {/* Íconos y etiquetas de los 6 Pasos */}
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
                        gap: 2,
                    }}
                >
                    {STEPS.map((s, idx) => {
                        const isActive = activeStep === idx;
                        const isDone = activeStep > idx || (postulacion && idx < 2);

                        return (
                            <Box
                                key={s.number}
                                onClick={() => {
                                    if (postulacion || idx <= activeStep) {
                                        setActiveStep(idx);
                                    }
                                }}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    cursor: (postulacion || idx <= activeStep) ? 'pointer' : 'default',
                                    opacity: (!postulacion && idx > activeStep) ? 0.5 : 1,
                                    p: 1,
                                    borderRadius: 2,
                                    bgcolor: isActive ? THEME_COLORS.primaryLight : 'transparent',
                                    border: isActive ? `1px solid ${THEME_COLORS.primaryBorder}` : '1px solid transparent',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: '50%',
                                        bgcolor: isDone || isActive ? THEME_COLORS.primary : THEME_COLORS.textMuted,
                                        color: THEME_COLORS.textLight,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 800,
                                        fontSize: 15,
                                        flexShrink: 0,
                                        boxShadow: isActive ? '0 2px 8px rgba(37, 99, 235, 0.35)' : 'none',
                                    }}
                                >
                                    {isDone && !isActive ? <Check size={18} strokeWidth={3} /> : s.number}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        variant="body2"
                                        fontWeight={isActive ? 800 : 700}
                                        noWrap
                                        sx={{ color: isActive ? THEME_COLORS.textPrimary : THEME_COLORS.secondary, fontSize: 13 }}
                                    >
                                        {s.title}
                                    </Typography>
                                    <Typography variant="caption" noWrap sx={{ color: THEME_COLORS.textMuted, display: 'block', fontSize: 11 }}>
                                        {s.subtitle}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Paper>

            {/* CONTENIDO PRINCIPAL POR PASOS */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2.5, md: 4 },
                    borderRadius: 3,
                    border: `1px solid ${THEME_COLORS.border}`,
                    bgcolor: THEME_COLORS.surface,
                }}
            >
                {/* ========================================================
                    PASO 1: DATOS (INFORMACIÓN PERSONAL)
                   ======================================================== */}
                {activeStep === 0 && (
                    <Box component="form" onSubmit={(e) => handleGuardarPaso1(e)}>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                1. Información Personal del Postulante
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                Ingrese el tipo y número de documento para consultar registros previos en RENIEC o en la institución. Se generará automáticamente el Código de Tesorería.
                            </Typography>
                        </Box>

                        <Grid container spacing={2.5}>
                            {/* Fila 1: Tipo Documento, Número con botón RENIEC, Fecha Inscripción, País */}
                            <Grid item xs={12} sm={3}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Tipo de Documento *
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    name="tipo_documento"
                                    value={formDatos.tipo_documento}
                                    onChange={handleDatosChange}
                                >
                                    <MenuItem value="DNI">DNI - Documento Nacional de Identidad</MenuItem>
                                    <MenuItem value="CE">Carné de Extranjería (CE)</MenuItem>
                                    <MenuItem value="PASAPORTE">Pasaporte</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Número de Documento (Código de Tesorería) *
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder={formDatos.tipo_documento === 'DNI' ? '87654321' : 'Número de Documento'}
                                        name="numero_documento"
                                        value={formDatos.numero_documento}
                                        onChange={handleDatosChange}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleConsultarReniec())}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FileText size={16} color={THEME_COLORS.textSecondary} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        onClick={handleConsultarReniec}
                                        disabled={buscandoDni}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 800,
                                            borderColor: THEME_COLORS.primary,
                                            color: THEME_COLORS.primary,
                                            px: 2,
                                            borderRadius: 1.5,
                                            '&:hover': { bgcolor: THEME_COLORS.primaryLight, borderColor: THEME_COLORS.primaryHover },
                                        }}
                                    >
                                        {buscandoDni ? <CircularProgress size={16} /> : 'COMPROBAR'}
                                    </Button>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sm={2.5}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Fecha de Inscripción
                                </Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    fullWidth
                                    name="fecha_inscripcion"
                                    value={formDatos.fecha_inscripcion}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={2.5}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    País
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="pais"
                                    value={formDatos.pais}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            {/* Fila 2: Correo Electrónico, Nombres, Apellido Paterno */}
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Correo Electrónico
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="usuario@gmail.com"
                                    name="email_personal"
                                    value={formDatos.email_personal}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Nombres *
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    name="nombres"
                                    value={formDatos.nombres}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Apellido Paterno *
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    name="apellido_paterno"
                                    value={formDatos.apellido_paterno}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            {/* Fila 3: Apellido Materno, Sexo, Fecha Nacimiento */}
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Apellido Materno *
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    name="apellido_materno"
                                    value={formDatos.apellido_materno}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Sexo
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    name="sexo"
                                    value={formDatos.sexo}
                                    onChange={handleDatosChange}
                                >
                                    <MenuItem value="">Seleccione</MenuItem>
                                    <MenuItem value="M">Masculino</MenuItem>
                                    <MenuItem value="F">Femenino</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Fecha Nacimiento
                                </Typography>
                                <TextField
                                    type="date"
                                    size="small"
                                    fullWidth
                                    name="fecha_nacimiento"
                                    value={formDatos.fecha_nacimiento}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            {/* Fila 4: Departamento, Provincia, Distrito Nacimiento */}
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Departamento Nacimiento
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="departamento"
                                    value={formDatos.departamento}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Provincia Nacimiento
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="provincia"
                                    value={formDatos.provincia}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Distrito Nacimiento
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="distrito"
                                    value={formDatos.distrito}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            {/* Fila 5: Lengua Materna, Segunda Lengua */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Lengua Materna
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="lengua_materna"
                                    value={formDatos.lengua_materna}
                                    onChange={handleDatosChange}
                                    placeholder="Castellano / Quechua / Aimara..."
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Segunda Lengua
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="segunda_lengua"
                                    value={formDatos.segunda_lengua}
                                    onChange={handleDatosChange}
                                    placeholder="Quechua / Inglés / Ninguna..."
                                />
                            </Grid>

                            {/* Fila 6: Ubicación Domicilio */}
                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Departamento Domicilio
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="departamento_domicilio"
                                    value={formDatos.departamento_domicilio}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Provincia Domicilio
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="provincia_domicilio"
                                    value={formDatos.provincia_domicilio}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Distrito Domicilio
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="distrito_domicilio"
                                    value={formDatos.distrito_domicilio}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            {/* Fila 7: Dirección y Celulares */}
                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Dirección Domiciliaria
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Av. o Jr., N° de lote, urbanización..."
                                    name="direccion"
                                    value={formDatos.direccion}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Celular Postulante
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="984123456"
                                    name="celular"
                                    value={formDatos.celular}
                                    onChange={handleDatosChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={3}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Celular de Emergencia
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="987654321"
                                    name="celular_emergencia"
                                    value={formDatos.celular_emergencia}
                                    onChange={handleDatosChange}
                                />
                            </Grid>
                        </Grid>

                        {/* Botón Guardar / Continuar Paso 1 */}
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading || isConvocatoriaCerrada}
                                endIcon={<ChevronRight size={18} />}
                                sx={{
                                    bgcolor: THEME_COLORS.primary,
                                    '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                    py: 1,
                                    borderRadius: 2,
                                }}
                            >
                                {loading ? 'Guardando...' : postulacion ? 'Actualizar Datos y Continuar' : 'Generar Código Tesorería y Continuar'}
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* ========================================================
                    PASO 2: FOTO (IMAGEN DE PERFIL)
                   ======================================================== */}
                {activeStep === 1 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                2. Fotografía del Postulante
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                La fotografía se utilizará para el carnet de postulante y formatos reglamentarios (FUT y Declaración Jurada).
                            </Typography>
                        </Box>

                        <Grid container spacing={3} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        width: 200,
                                        height: 240,
                                        mx: 'auto',
                                        border: `2px dashed ${fotoUrl ? THEME_COLORS.primary : THEME_COLORS.textMuted}`,
                                        borderRadius: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        overflow: 'hidden',
                                        bgcolor: THEME_COLORS.background,
                                    }}
                                >
                                    {fotoUrl ? (
                                        <Box
                                            component="img"
                                            src={fotoUrl}
                                            alt="Foto postulante"
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <Box sx={{ textAlign: 'center', p: 2 }}>
                                            <Upload size={36} color={THEME_COLORS.textSecondary} />
                                            <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary, display: 'block', mt: 1, fontWeight: 600 }}>
                                                Sin fotografía seleccionada
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {fotoUrl && (
                                    <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={handleRemoveFoto}
                                            startIcon={<Trash2 size={14} />}
                                            sx={{ textTransform: 'none', fontWeight: 700 }}
                                        >
                                            Quitar Fotografía
                                        </Button>
                                    </Box>
                                )}
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                                    <strong>Requisitos de la Fotografía Oficial:</strong>
                                    <ul style={{ margin: '4px 0 0', paddingLeft: 20 }}>
                                        <li>Tamaño carnet oficial, tomada de frente con vestimenta formal.</li>
                                        <li>Fondo blanco sin accesorios (lentes oscuros, gorras o prendas que cubran el rostro).</li>
                                        <li>Formatos aceptados: JPG, JPEG o PNG (máximo 5 MB).</li>
                                    </ul>
                                </Alert>

                                {/* Input de archivo oculto */}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    accept="image/png, image/jpeg, image/jpg"
                                    style={{ display: 'none' }}
                                    onChange={handleFileChange}
                                />

                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Upload size={18} />}
                                        onClick={() => fileInputRef.current?.click()}
                                        sx={{
                                            bgcolor: THEME_COLORS.primary,
                                            '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            borderRadius: 2,
                                            px: 3,
                                            py: 1,
                                        }}
                                    >
                                        Subir Fotografía desde el equipo
                                    </Button>
                                    {fotoFile && (
                                        <Typography variant="caption" sx={{ color: THEME_COLORS.successText, fontWeight: 700 }}>
                                            ✓ Archivo: {fotoFile.name}
                                        </Typography>
                                    )}
                                </Box>

                                <TextField
                                    label="O ingresar Enlace / URL de la Fotografía (Opcional)"
                                    fullWidth
                                    size="small"
                                    value={fotoUrl}
                                    onChange={(e) => setFotoUrl(e.target.value)}
                                    placeholder="https://ejemplo.com/fotos/postulante.jpg"
                                    helperText="Puede cargar la imagen directamente desde su equipo o ingresar un enlace."
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft size={18} />}
                                onClick={() => setActiveStep(0)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<ChevronRight size={18} />}
                                onClick={() => setActiveStep(2)}
                                sx={{
                                    bgcolor: THEME_COLORS.primary,
                                    '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                }}
                            >
                                Continuar a Especialidad
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* ========================================================
                    PASO 3: ESPECIALIDAD (CARRERA PROFESIONAL)
                   ======================================================== */}
                {activeStep === 2 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                3. Selección de Especialidad Pedagógica
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                La prueba de admisión institucional es común, pero el postulante competirá por las vacantes del programa seleccionado.
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {programasOfertados.map((po) => {
                                const isSelected = selectedProgramaOfertadoId === po.id;
                                const isInicial = po.programa.toLowerCase().includes('inicial');

                                return (
                                    <Grid item xs={12} sm={6} key={po.id}>
                                        <Card
                                            onClick={() => setSelectedProgramaOfertadoId(po.id)}
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                borderRadius: 3,
                                                cursor: 'pointer',
                                                border: isSelected ? `2px solid ${THEME_COLORS.primary}` : `1px solid ${THEME_COLORS.border}`,
                                                bgcolor: isSelected ? THEME_COLORS.primaryLight : THEME_COLORS.surface,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    borderColor: THEME_COLORS.primary,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.1)',
                                                },
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <Box
                                                        sx={{
                                                            width: 44,
                                                            height: 44,
                                                            borderRadius: 2,
                                                            bgcolor: isInicial ? 'rgba(236, 72, 153, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                                                            color: isInicial ? '#db2777' : '#059669',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <Award size={24} />
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                                            {po.programa}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                                            Modalidad: {po.modalidad}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                {isSelected && (
                                                    <Chip
                                                        icon={<Check size={14} />}
                                                        label="Seleccionado"
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 800, fontSize: 11 }}
                                                    />
                                                )}
                                            </Box>

                                            <Divider sx={{ my: 1.5 }} />

                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                                    Vacantes Ofertadas:
                                                </Typography>
                                                <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.primary }}>
                                                    {po.vacantes} vacantes
                                                </Typography>
                                            </Box>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft size={18} />}
                                onClick={() => setActiveStep(1)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<ChevronRight size={18} />}
                                onClick={() => setActiveStep(3)}
                                sx={{
                                    bgcolor: THEME_COLORS.primary,
                                    '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                }}
                            >
                                Continuar a Colegio
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* ========================================================
                    PASO 4: COLEGIO (INSTITUCIÓN EDUCATIVA)
                   ======================================================== */}
                {activeStep === 3 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                4. Datos de Procedencia Escolar
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                Información de la institución educativa de nivel secundaria donde culminó sus estudios.
                            </Typography>
                        </Box>

                        <Grid container spacing={2.5}>
                            <Grid item xs={12} sm={8}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Nombre del Colegio de Secundaria *
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    placeholder="Ej. Colegio Nacional de Ciencias"
                                    name="colegio_fin_secundaria"
                                    value={formColegio.colegio_fin_secundaria}
                                    onChange={handleColegioChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Código Modular MINEDU (7 dígitos) *
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    required
                                    placeholder="0234567"
                                    name="codigo_modular_colegio"
                                    value={formColegio.codigo_modular_colegio}
                                    onChange={handleColegioChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Año de Egreso de Secundaria *
                                </Typography>
                                <TextField
                                    type="number"
                                    size="small"
                                    fullWidth
                                    required
                                    name="anio_egreso_colegio"
                                    value={formColegio.anio_egreso_colegio}
                                    onChange={handleColegioChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Tipo de Gestión
                                </Typography>
                                <TextField
                                    select
                                    size="small"
                                    fullWidth
                                    name="colegio_tipo_gestion"
                                    value={formColegio.colegio_tipo_gestion}
                                    onChange={handleColegioChange}
                                >
                                    <MenuItem value="PUBLICA">Pública (Estatal)</MenuItem>
                                    <MenuItem value="PRIVADA">Privada (Particular)</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Departamento del Colegio
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="colegio_departamento"
                                    value={formColegio.colegio_departamento}
                                    onChange={handleColegioChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Provincia del Colegio
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="colegio_provincia"
                                    value={formColegio.colegio_provincia}
                                    onChange={handleColegioChange}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <Typography variant="caption" fontWeight={700} sx={{ color: THEME_COLORS.textPrimary, mb: 0.5, display: 'block' }}>
                                    Distrito del Colegio
                                </Typography>
                                <TextField
                                    size="small"
                                    fullWidth
                                    name="colegio_distrito"
                                    value={formColegio.colegio_distrito}
                                    onChange={handleColegioChange}
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft size={18} />}
                                onClick={() => setActiveStep(2)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<ChevronRight size={18} />}
                                onClick={() => setActiveStep(4)}
                                sx={{
                                    bgcolor: THEME_COLORS.primary,
                                    '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                }}
                            >
                                Continuar a Documentos
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* ========================================================
                    PASO 5: DOCUMENTOS (REQUISITOS)
                   ======================================================== */}
                {activeStep === 4 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                5. Verificación de Expediente Documentario
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                Marque los requisitos físicos comprobados por el responsable de recepción de expedientes.
                            </Typography>
                        </Box>

                        <Paper elevation={0} sx={{ p: 3, border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2.5, bgcolor: THEME_COLORS.background }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formDocumentos.tiene_copia_dni_color}
                                                onChange={(e) => setFormDocumentos((prev) => ({ ...prev, tiene_copia_dni_color: e.target.checked }))}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>
                                                    Copia ampliada de Documento de Identidad (DNI / CE) a color
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                                    Vigente y legible por ambos lados.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formDocumentos.tiene_partida_nacimiento}
                                                onChange={(e) => setFormDocumentos((prev) => ({ ...prev, tiene_partida_nacimiento: e.target.checked }))}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>
                                                    Partida o Acta de Nacimiento Original / Certificada
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                                    Emitida por RENIEC o Registro Civil Municipal.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={formDocumentos.tiene_certificado_nacimiento_original}
                                                onChange={(e) => setFormDocumentos((prev) => ({ ...prev, tiene_certificado_nacimiento_original: e.target.checked }))}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>
                                                    Certificado Oficial de Estudios Secundarios Completos (1° al 5°)
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                                                    Visado por la UGEL correspondiente o emitido por la plataforma MINEDU.
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft size={18} />}
                                onClick={() => setActiveStep(3)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="contained"
                                endIcon={<ChevronRight size={18} />}
                                onClick={() => {
                                    if (postulacion?.estado_pago === 'PAGADO') {
                                        handleFinalizarExpediente();
                                    } else {
                                        setActiveStep(5);
                                    }
                                }}
                                disabled={loading}
                                sx={{
                                    bgcolor: THEME_COLORS.primary,
                                    '&:hover': { bgcolor: THEME_COLORS.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 3,
                                }}
                            >
                                {postulacion?.estado_pago === 'PAGADO' ? 'Consolidar Expediente e Ir a Formatos' : 'Continuar al Paso de Pago'}
                            </Button>
                        </Box>
                    </Box>
                )}

                {/* ========================================================
                    PASO 6: PAGO (VOUCHER / MONTO & FORMATOS OFICIALES)
                   ======================================================== */}
                {activeStep === 5 && (
                    <Box>
                        <Box sx={{ mb: 3, textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                6. Validación de Pago en Tesorería y Emisión de Formatos Oficiales
                            </Typography>
                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                El derecho de admisión se asocia directamente al número de documento del postulante (Código de Tesorería).
                            </Typography>
                        </Box>

                        {/* ESTADO 1: PAGO PENDIENTE */}
                        {(!postulacion || postulacion.estado_pago !== 'PAGADO') && (
                            <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                                <Alert severity="warning" icon={<CreditCard size={22} />} sx={{ mb: 3, borderRadius: 2 }}>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                        Código de Cobranza en Tesorería: {postulacion?.codigo_tesoreria || formDatos.numero_documento || 'DOCUMENTO'}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        El postulante debe acercarse a Caja/Tesorería e indicar su documento para efectuar el abono reglamentario de S/ 150.00.
                                    </Typography>
                                </Alert>

                                <Paper elevation={0} sx={{ p: 3, border: `1px solid ${THEME_COLORS.border}`, borderRadius: 2.5, bgcolor: THEME_COLORS.background, mb: 3 }}>
                                    <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2 }}>
                                        Validación Rápida con Comprobante de Caja
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                label="N° de Comprobante / Recibo *"
                                                placeholder="REC-2026-0042"
                                                value={formPago.comprobante_pago}
                                                onChange={(e) => setFormPago((prev) => ({ ...prev, comprobante_pago: e.target.value }))}
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                size="small"
                                                fullWidth
                                                label="Monto Abonado (S/)"
                                                value={formPago.monto_pago}
                                                disabled
                                            />
                                        </Grid>
                                    </Grid>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        onClick={handleConfirmarPago}
                                        disabled={loading || !postulacion}
                                        sx={{
                                            mt: 2.5,
                                            bgcolor: THEME_COLORS.success,
                                            '&:hover': { bgcolor: THEME_COLORS.successHover },
                                            fontWeight: 800,
                                            textTransform: 'none',
                                            py: 1,
                                            borderRadius: 2,
                                        }}
                                    >
                                        {loading ? 'Validando...' : 'Confirmar Pago y Habilitar Código de FUT'}
                                    </Button>
                                </Paper>
                            </Box>
                        )}

                        {/* ESTADO 2: PAGO CONFIRMADO & FORMATOS */}
                        {postulacion?.estado_pago === 'PAGADO' && (
                            <Box>
                                <Alert severity="success" icon={<CheckCircle2 size={24} />} sx={{ mb: 3, borderRadius: 2, fontWeight: 700 }}>
                                    ¡Derecho de Examen de Admisión Validado! Código Reglamentario de FUT: <strong>{postulacion.numero_fut}</strong>
                                </Alert>

                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                    {/* Card FUT */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={0} sx={{ p: 3, border: `2px solid ${THEME_COLORS.info}`, borderRadius: 3, bgcolor: THEME_COLORS.infoLight }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <FileText size={24} color={THEME_COLORS.info} />
                                                <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                                    Formulario Único de Trámite (FUT)
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: THEME_COLORS.infoText, fontWeight: 800, display: 'block', mb: 1 }}>
                                                N° OFICIAL: {postulacion.numero_fut}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }} paragraph>
                                                Formato prellenado en formato A4 con membrete ministerial, datos del postulante, carrera y casillas reglamentarias para Mesa de Partes.
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                startIcon={<Printer size={16} />}
                                                onClick={() => setDocViewerModal({
                                                    open: true,
                                                    title: `FUT Oficial — ${postulacion.numero_fut}`,
                                                    printUrl: admissionService.getFutPrintUrl(postulacion.id),
                                                })}
                                                sx={{
                                                    bgcolor: THEME_COLORS.info,
                                                    '&:hover': { bgcolor: THEME_COLORS.infoText },
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    borderRadius: 2,
                                                    mt: 1,
                                                }}
                                            >
                                                Ver e Imprimir FUT (A4)
                                            </Button>
                                        </Card>
                                    </Grid>

                                    {/* Card Declaración Jurada */}
                                    <Grid item xs={12} md={6}>
                                        <Card elevation={0} sx={{ p: 3, border: `2px solid ${THEME_COLORS.secondary}`, borderRadius: 3, bgcolor: THEME_COLORS.background }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                                <ShieldCheck size={24} color={THEME_COLORS.secondary} />
                                                <Typography variant="h6" fontWeight={800} sx={{ color: THEME_COLORS.textPrimary }}>
                                                    Declaración Jurada de Antecedentes
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" sx={{ color: THEME_COLORS.secondary, fontWeight: 800, display: 'block', mb: 1 }}>
                                                LEY N° 27444 — PROCEDIMIENTO ADMINISTRATIVO
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }} paragraph>
                                                Declaración legal bajo juramento de no registrar antecedentes, con recuadros para firma manuscrita y huella dactilar.
                                            </Typography>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Printer size={16} />}
                                                onClick={() => setDocViewerModal({
                                                    open: true,
                                                    title: `Declaración Jurada — ${postulacion.persona?.numero_documento}`,
                                                    printUrl: admissionService.getDeclaracionPrintUrl(postulacion.id),
                                                })}
                                                sx={{
                                                    borderColor: THEME_COLORS.secondary,
                                                    color: THEME_COLORS.secondary,
                                                    '&:hover': { bgcolor: THEME_COLORS.surface, borderColor: THEME_COLORS.textPrimary },
                                                    textTransform: 'none',
                                                    fontWeight: 800,
                                                    borderRadius: 2,
                                                    mt: 1,
                                                }}
                                            >
                                                Ver e Imprimir Declaración Jurada (A4)
                                            </Button>
                                        </Card>
                                    </Grid>
                                </Grid>

                                {postulacion.estado_inscripcion !== 'INSCRITO' && (
                                    <Box sx={{ textAlign: 'center', my: 2 }}>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={handleFinalizarExpediente}
                                            disabled={loading}
                                            sx={{
                                                bgcolor: THEME_COLORS.success,
                                                '&:hover': { bgcolor: THEME_COLORS.successHover },
                                                fontWeight: 800,
                                                px: 4,
                                                py: 1.2,
                                                borderRadius: 2,
                                                textTransform: 'none',
                                            }}
                                        >
                                            {loading ? 'Consolidando...' : 'Consolidar e Inscribir Oficialmente en el Padrón'}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="outlined"
                                startIcon={<ChevronLeft size={18} />}
                                onClick={() => setActiveStep(4)}
                                sx={{ textTransform: 'none', fontWeight: 600 }}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/admission')}
                                sx={{
                                    bgcolor: THEME_COLORS.darkNavy,
                                    '&:hover': { bgcolor: THEME_COLORS.darkNavySurface },
                                    textTransform: 'none',
                                    fontWeight: 800,
                                    px: 3,
                                }}
                            >
                                Finalizar y Volver al Padrón
                            </Button>
                        </Box>
                    </Box>
                )}
            </Paper>

            {/* Modal Visor de Documentos (FUT y Declaración Jurada) */}
            <DocumentViewerModal
                open={docViewerModal.open}
                onClose={() => setDocViewerModal((prev) => ({ ...prev, open: false }))}
                title={docViewerModal.title}
                printUrl={docViewerModal.printUrl}
            />
        </Container>
    );
}
