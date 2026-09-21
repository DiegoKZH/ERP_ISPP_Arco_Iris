import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress
} from '@mui/material';

// ==========================================
// ESTÁNDAR DE COLORES (VARIABLES DE COLOR)
// ==========================================
const THEME_COLORS = {
    primary: '#1976d2',
    primaryHover: '#1565c0',
    secondary: '#9c27b0',
    background: '#f4f6f8',
    surface: '#ffffff',
    textPrimary: '#1a202c',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    error: '#d32f2f',
    errorBg: '#ffebee',
};

const Login = () => {
    const { login, isAuthenticated } = useAuth();
    const [credentials, setCredentials] = useState({ login: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Redirect if already authenticated
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const result = await login(credentials);

        if (!result.success) {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: THEME_COLORS.background,
                py: 6,
                px: 2,
            }}
        >
            <Container maxWidth="xs">
                {/* Cabecera */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h4"
                        component="h1"
                        sx={{
                            fontWeight: 800,
                            color: THEME_COLORS.textPrimary,
                            mb: 1,
                        }}
                    >
                        ERP Instituto
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: THEME_COLORS.textSecondary }}
                    >
                        Inicia sesión para acceder al sistema
                    </Typography>
                </Box>

                {/* Tarjeta del Formulario */}
                <Paper
                    elevation={2}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        backgroundColor: THEME_COLORS.surface,
                        border: `1px solid ${THEME_COLORS.border}`,
                    }}
                >
                    {error && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                backgroundColor: THEME_COLORS.errorBg,
                                color: THEME_COLORS.error,
                            }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        noValidate
                        sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
                    >
                        <TextField
                            id="login"
                            name="login"
                            label="Usuario o Correo Electrónico"
                            type="text"
                            required
                            fullWidth
                            value={credentials.login}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                        />

                        <TextField
                            id="password"
                            name="password"
                            label="Contraseña"
                            type="password"
                            required
                            fullWidth
                            value={credentials.password}
                            onChange={handleChange}
                            variant="outlined"
                            size="medium"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            startIcon={
                                loading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <LogIn size={20} />
                                )
                            }
                            sx={{
                                mt: 1,
                                py: 1.5,
                                fontWeight: 600,
                                backgroundColor: THEME_COLORS.primary,
                                '&:hover': {
                                    backgroundColor: THEME_COLORS.primaryHover,
                                },
                                '&.Mui-disabled': {
                                    backgroundColor: THEME_COLORS.primary,
                                    opacity: 0.7,
                                    color: '#ffffff',
                                },
                            }}
                        >
                            Iniciar Sesión
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default Login;