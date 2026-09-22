import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { roleService } from '../../services/roleService';
import { Plus, Edit2, UserX, UserCheck, LogOut } from 'lucide-react';
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
    MenuItem,
    Tooltip,
} from '@mui/material';


const UsersList = () => {
    const { user, hasRole} = useAuth();
    const [users, setUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        role: 'admin',
    });

    const isSuperAdmin = hasRole('superadmin');
    const isAdmin = hasRole('admin');

    useEffect(() => {
        loadUsers();
        loadRoles();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await userService.getUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const loadRoles = async () => {
        try {
            const data = await roleService.getRoles();
            // Exclude 'superadmin' from assignable roles in user creation
            setAvailableRoles(data.filter((r) => r.slug !== 'superadmin'));
        } catch (err) {
            console.error('Error al cargar roles disponibles', err);
        }
    };

    const handleToggleStatus = async (targetUser) => {
        if (
            !confirm(
                `¿Estás seguro de que deseas ${targetUser.is_active ? 'deshabilitar' : 'reactivar'
                } a este usuario?`
            )
        )
            return;

        try {
            await userService.toggleStatus(targetUser.id);
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al cambiar estado');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                await userService.updateUser(editingUser.id, formData);
            } else {
                await userService.createUser(formData);
            }
            setShowModal(false);
            loadUsers();
        } catch (err) {
            alert(err.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const openCreate = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            username: '',
            password: '',
            role: 'admin',
        });
        setShowModal(true);
    };

    const openEdit = (userToEdit) => {
        setEditingUser(userToEdit);
        setFormData({
            name: userToEdit.name,
            email: userToEdit.email,
            username: userToEdit.username,
            password: '',
            role: userToEdit.roles?.[0]?.slug || 'admin',
        });
        setShowModal(true);
    };

    return (
        <Box
            sx={{
                backgroundColor: THEME_COLORS.background,
                minHeight: '100vh',
                py: 4,
            }}
        >
            <Container maxWidth="lg">
                {/* Cabecera y Controles */}
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
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{ fontWeight: 800, color: THEME_COLORS.textPrimary }}
                        >
                            Gestión de Usuarios
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: THEME_COLORS.textSecondary, mt: 0.5 }}
                        >
                            Sesión actual: {user?.name} ({user?.roles?.[0]?.name})
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {(isSuperAdmin || isAdmin) && (
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
                                Nuevo Usuario
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Alerta de Error */}
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

                {/* Tabla de Usuarios */}
                <TableContainer
                    component={Paper}
                    elevation={1}
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${THEME_COLORS.border}`,
                        overflow: 'hidden',
                    }}
                >
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead sx={{ backgroundColor: THEME_COLORS.background }}>
                            <TableRow>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: THEME_COLORS.textSecondary,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Usuario
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: THEME_COLORS.textSecondary,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Rol
                                </TableCell>
                                <TableCell
                                    sx={{
                                        fontWeight: 700,
                                        color: THEME_COLORS.textSecondary,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Estado
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{
                                        fontWeight: 700,
                                        color: THEME_COLORS.textSecondary,
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Acciones
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: THEME_COLORS.textSecondary }}
                                        >
                                            No hay usuarios
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((u) => (
                                    <TableRow
                                        key={u.id}
                                        hover
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                        }}
                                    >
                                        <TableCell>
                                            <Box>
                                                <Typography
                                                    variant="subtitle2"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: THEME_COLORS.textPrimary,
                                                    }}
                                                >
                                                    {u.name}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{ color: THEME_COLORS.textSecondary }}
                                                >
                                                    {u.email} | {u.username}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={u.roles?.[0]?.name || 'N/A'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: THEME_COLORS.infoLight,
                                                    color: THEME_COLORS.infoText,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={u.is_active ? 'Activo' : 'Inactivo'}
                                                size="small"
                                                sx={{
                                                    backgroundColor: u.is_active
                                                        ? THEME_COLORS.successLight
                                                        : THEME_COLORS.errorLight,
                                                    color: u.is_active
                                                        ? THEME_COLORS.successText
                                                        : THEME_COLORS.errorText,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {(isSuperAdmin ||
                                                (isAdmin &&
                                                    u.roles?.[0]?.slug !== 'superadmin')) && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'flex-end',
                                                            gap: 1,
                                                        }}
                                                    >
                                                        <Tooltip title="Editar">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => openEdit(u)}
                                                                sx={{ color: THEME_COLORS.primary }}
                                                            >
                                                                <Edit2 size={18} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        {user?.id !== u.id && (
                                                            <Tooltip
                                                                title={u.is_active ? 'Deshabilitar' : 'Activar'}
                                                            >
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleToggleStatus(u)}
                                                                    sx={{
                                                                        color: u.is_active
                                                                            ? THEME_COLORS.error
                                                                            : THEME_COLORS.success,
                                                                    }}
                                                                >
                                                                    {u.is_active ? (
                                                                        <UserX size={18} />
                                                                    ) : (
                                                                        <UserCheck size={18} />
                                                                    )}
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Box>
                                                )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Modal Crear / Editar */}
                <Dialog
                    open={showModal}
                    onClose={() => setShowModal(false)}
                    maxWidth="xs"
                    fullWidth
                >
                    <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                        {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                    </DialogTitle>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <DialogContent
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 2,
                                pt: 1,
                            }}
                        >
                            <TextField
                                label="Nombre"
                                required
                                fullWidth
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                            />
                            <TextField
                                label="Email"
                                type="email"
                                required
                                fullWidth
                                value={formData.email}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                            />
                            <TextField
                                label="Username"
                                required
                                fullWidth
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData({ ...formData, username: e.target.value })
                                }
                            />
                            <TextField
                                label="Contraseña"
                                type="password"
                                required={!editingUser}
                                helperText={
                                    editingUser ? '(Dejar en blanco para no cambiar)' : ''
                                }
                                fullWidth
                                value={formData.password}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                            />
                            <TextField
                                select
                                label="Rol"
                                value={formData.role}
                                onChange={(e) =>
                                    setFormData({ ...formData, role: e.target.value })
                                }
                                fullWidth
                            >
                                {availableRoles.map((r) => (
                                    <MenuItem key={r.id || r.slug} value={r.slug}>
                                        {r.name}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2.5 }}>
                            <Button
                                onClick={() => setShowModal(false)}
                                sx={{ color: THEME_COLORS.textSecondary, textTransform: 'none' }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                sx={{
                                    backgroundColor: THEME_COLORS.primary,
                                    '&:hover': { backgroundColor: THEME_COLORS.primaryHover },
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Guardar
                            </Button>
                        </DialogActions>
                    </Box>
                </Dialog>
            </Container>
        </Box>
    );
};

export default UsersList;