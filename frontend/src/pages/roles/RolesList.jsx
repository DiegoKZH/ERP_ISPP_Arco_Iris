import React, { useState, useEffect } from 'react';
import { roleService } from '../../services/roleService';
import { Plus, Edit2, Trash2, Shield, UserCheck } from 'lucide-react';
import { THEME_COLORS } from '../../theme/colors';
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
} from '@mui/material';

export default function RolesList() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
    });

    useEffect(() => {
        loadRoles();
    }, []);

    const loadRoles = async () => {
        try {
            setLoading(true);
            const data = await roleService.getRoles();
            setRoles(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar la lista de roles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (role) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar el rol "${role.name}"?`)) return;

        try {
            await roleService.deleteRole(role.id);
            loadRoles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al eliminar rol');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingRole) {
                await roleService.updateRole(editingRole.id, formData);
            } else {
                await roleService.createRole(formData);
            }
            setShowModal(false);
            loadRoles();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al guardar el rol');
        }
    };

    const openCreate = () => {
        setEditingRole(null);
        setFormData({ name: '', slug: '', description: '' });
        setShowModal(true);
    };

    const openEdit = (role) => {
        setEditingRole(role);
        setFormData({
            name: role.name,
            slug: role.slug,
            description: role.description || '',
        });
        setShowModal(true);
    };

    // Auto slug generator on name change for creation
    const handleNameChange = (e) => {
        const nameVal = e.target.value;
        if (!editingRole) {
            const slugVal = nameVal
                .toLowerCase()
                .trim()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9 -]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-');
            setFormData({ ...formData, name: nameVal, slug: slugVal });
        } else {
            setFormData({ ...formData, name: nameVal });
        }
    };

    return (
        <Box sx={{ backgroundColor: THEME_COLORS.background, minHeight: '100vh', py: 2 }}>
            <Container maxWidth="lg">
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 4,
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h4" component="h1" sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}>
                            Gestión de Roles
                        </Typography>
                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary, mt: 0.5 }}>
                            Administración de perfiles y roles de acceso del ERP
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={openCreate}
                        startIcon={<Plus size={18} />}
                        sx={{
                            backgroundColor: THEME_COLORS.primary,
                            '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                            textTransform: 'none',
                            fontWeight: 600,
                        }}
                    >
                        Nuevo Rol
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <TableContainer component={Paper} elevation={1} sx={{ borderRadius: 2, border: `1px solid ${THEME_COLORS.border}` }}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: THEME_COLORS.background }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    Nombre / Slug
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    Descripción
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    Tipo
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, color: THEME_COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    Usuarios
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, color: THEME_COLORS.textSecondary, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : roles.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                        <Typography variant="body2" sx={{ color: THEME_COLORS.textSecondary }}>
                                            No hay roles registrados
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                roles.map((role) => (
                                    <TableRow key={role.id} hover>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: THEME_COLORS.textPrimary }}>
                                                    {role.name}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary, fontFamily: 'monospace' }}>
                                                    {role.slug}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 300 }}>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {role.description || 'Sin descripción'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={role.is_system ? <Shield size={14} /> : null}
                                                label={role.is_system ? 'Sistema' : 'Personalizado'}
                                                size="small"
                                                color={role.is_system ? 'secondary' : 'primary'}
                                                variant="outlined"
                                                sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                icon={<UserCheck size={14} />}
                                                label={`${role.users_count || 0} usuarios`}
                                                size="small"
                                                sx={{ backgroundColor: THEME_COLORS.infoLight, color: THEME_COLORS.infoText, fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                {!role.is_system && (
                                                    <Tooltip title="Editar">
                                                        <IconButton size="small" onClick={() => openEdit(role)} sx={{ color: THEME_COLORS.primary }}>
                                                            <Edit2 size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                {!role.is_system && role.slug !== 'admin' && (
                                                    <Tooltip title="Eliminar">
                                                        <IconButton size="small" onClick={() => handleDelete(role)} sx={{ color: THEME_COLORS.error }}>
                                                            <Trash2 size={18} />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="xs" fullWidth>
                    <DialogTitle sx={{ fontWeight: 700 }}>
                        {editingRole ? 'Editar Rol' : 'Nuevo Rol'}
                    </DialogTitle>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                            <TextField
                                label="Nombre del Rol"
                                required
                                fullWidth
                                value={formData.name}
                                onChange={handleNameChange}
                            />
                            <TextField
                                label="Slug (Identificador)"
                                required
                                fullWidth
                                disabled={!!editingRole}
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            />
                            <TextField
                                label="Descripción"
                                multiline
                                rows={3}
                                fullWidth
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2.5 }}>
                            <Button onClick={() => setShowModal(false)} sx={{ color: THEME_COLORS.textSecondary, textTransform: 'none' }}>
                                Cancelar
                            </Button>
                            <Button type="submit" variant="contained" sx={{ backgroundColor: THEME_COLORS.primary, textTransform: 'none', fontWeight: 600 }}>
                                Guardar
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </Container>
        </Box>
    );
}
