import React from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import { GraduationCap, User, ShieldAlert, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DashboardHome() {
    const { user, hasRole } = useAuth();

    // Contextual icon and information based on user role
    const getRoleBadge = () => {
        if (hasRole('superadmin')) {
            return {
                label: 'Super Administrador',
                color: 'error',
                icon: <ShieldAlert size={32} />,
                desc: 'Tiene control completo sobre todo el ERP y la configuración del sistema.',
            };
        }
        if (hasRole('admin')) {
            return {
                label: 'Administrador',
                color: 'primary',
                icon: <ShieldAlert size={32} />,
                desc: 'Tiene acceso a la gestión de usuarios y módulos administrativos asignados.',
            };
        }
        if (hasRole('docente')) {
            return {
                label: 'Docente',
                color: 'secondary',
                icon: <BookOpen size={32} />,
                desc: 'Acceso al portal docente y gestión académica de asignaturas.',
            };
        }
        if (hasRole('estudiante')) {
            return {
                label: 'Estudiante',
                color: 'info',
                icon: <GraduationCap size={32} />,
                desc: 'Acceso al portal del estudiante, notas, matrículas y trámites.',
            };
        }
        return {
            label: 'Usuario',
            color: 'default',
            icon: <User size={32} />,
            desc: 'Usuario institucional.',
        };
    };

    const roleInfo = getRoleBadge();

    return (
        <Box>
            {/* Header Banner */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    color: 'white',
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: 'white',
                                color: 'primary.main',
                                fontWeight: 'bold',
                                fontSize: '1.8rem',
                            }}
                        >
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h4" fontWeight="bold">
                            ¡Bienvenido(a), {user?.name}!
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                            Panel institucional del ERP de la Escuela Superior Pedagógica Arco Iris.
                        </Typography>
                    </Grid>
                </Grid>
            </Paper>

            {/* Profile & Role Info Cards */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                <Avatar sx={{ bgcolor: `${roleInfo.color}.light`, color: `${roleInfo.color}.main` }}>
                                    {roleInfo.icon}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6" fontWeight="bold">
                                        Perfil y Rol Asignado
                                    </Typography>
                                    <Chip
                                        label={roleInfo.label}
                                        color={roleInfo.color}
                                        size="small"
                                        sx={{ mt: 0.5, fontWeight: 'bold' }}
                                    />
                                </Box>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2" color="text.secondary">
                                {roleInfo.desc}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card sx={{ borderRadius: 3, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Datos de la Sesión Actual
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Typography variant="body2">
                                    <strong>Nombre:</strong> {user?.name}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Correo Electrónico:</strong> {user?.email}
                                </Typography>
                                <Typography variant="body2">
                                    <strong>Estado:</strong> {user?.is_active ? 'Activo' : 'Inactivo'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
