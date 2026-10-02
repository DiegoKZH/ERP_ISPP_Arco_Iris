import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Box,
    CssBaseline,
    Divider,
    Chip,
    Collapse,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    Menu as MenuIcon,
    LayoutDashboard,
    Users,
    GraduationCap,
    LogOut,
    UserCheck,
    Award,
    CreditCard,
    ChevronDown,
    ChevronRight,
    UserPlus,
    Calendar,
    BookOpen,
    BarChart3,
    FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { THEME_COLORS } from '../theme/colors';

const DRAWER_WIDTH = 250;

export default function DashboardLayout() {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    // Estado para acordeones / secciones desplegables
    const [openMenus, setOpenMenus] = useState({
        users: location.pathname.startsWith('/users') || location.pathname.startsWith('/roles'),
        admission: location.pathname.startsWith('/admission'),
    });

    useEffect(() => {
        if (location.pathname.startsWith('/users') || location.pathname.startsWith('/roles')) {
            setOpenMenus((prev) => ({ ...prev, users: true }));
        }
        if (location.pathname.startsWith('/admission')) {
            setOpenMenus((prev) => ({ ...prev, admission: true }));
        }
    }, [location.pathname]);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleToggleMenu = (menuKey) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuKey]: !prev[menuKey],
        }));
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    // Estructura de navegación jerárquica con acordeones y rutas independientes
    const navigationGroups = [
        {
            type: 'single',
            text: 'Inicio',
            icon: <LayoutDashboard size={18} />,
            path: '/',
            show: true,
        },
        {
            type: 'group',
            id: 'users',
            text: 'Usuarios y Roles',
            icon: <Users size={18} />,
            show: hasRole('superadmin') || hasRole('admin'),
            children: [
                {
                    text: 'Gestión de Usuarios',
                    icon: <Users size={16} />,
                    path: '/users',
                },
                {
                    text: 'Gestión de Roles',
                    icon: <UserCheck size={16} />,
                    path: '/roles',
                },
            ],
        },
        {
            type: 'group',
            id: 'admission',
            text: 'Admisión',
            icon: <Award size={18} />,
            show: hasRole('superadmin') || hasRole('admin'),
            children: [
                {
                    text: 'Padrón de Postulantes',
                    icon: <FileSpreadsheet size={16} />,
                    path: '/admission',
                },
                {
                    text: 'Inscripción de Postulantes',
                    icon: <UserPlus size={16} />,
                    path: '/admission/inscribir',
                },
                {
                    text: 'Gestión de Convocatorias',
                    icon: <Calendar size={16} />,
                    path: '/admission/convocatorias',
                },
                {
                    text: 'Vacantes Ofertadas',
                    icon: <BookOpen size={16} />,
                    path: '/admission/vacantes',
                },
                {
                    text: 'Cuadro de Mérito y Resultados',
                    icon: <BarChart3 size={16} />,
                    path: '/admission/resultados',
                },
            ],
        },
        {
            type: 'single',
            text: 'Módulo de Tesorería',
            icon: <CreditCard size={18} />,
            path: '/treasury',
            show: hasRole('superadmin') || hasRole('admin'),
        },
    ];

    const isCurrentActive = (item) => {
        return location.pathname === item.path;
    };

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: THEME_COLORS.darkNavy, color: '#f8fafc' }}>
            {/* Header del Drawer */}
            <Toolbar sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 1.5, borderBottom: `1px solid ${THEME_COLORS.darkNavyBorder}` }}>
                <Box
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        bgcolor: 'rgba(2, 132, 199, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#38bdf8',
                    }}
                >
                    <GraduationCap size={22} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="subtitle2" fontWeight={800} sx={{ letterSpacing: 0.5, color: '#ffffff', lineHeight: 1.2 }}>
                        ERP IESPP
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.7rem' }}>
                        ARCO IRIS
                    </Typography>
                </Box>
            </Toolbar>

            {/* Perfil del Usuario Compacto */}
            <Box sx={{ p: 1.5, m: 1.5, bgcolor: THEME_COLORS.darkNavySurface, borderRadius: 2, border: `1px solid ${THEME_COLORS.darkNavyBorder}` }}>
                <Typography variant="caption" sx={{ color: '#94a3b8', display: 'block', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>
                    Usuario Conectado
                </Typography>
                <Typography variant="body2" fontWeight={700} noWrap sx={{ color: '#ffffff' }}>
                    {user?.name || 'Usuario'}
                </Typography>
                <Box sx={{ mt: 0.8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {user?.roles?.map((role) => (
                        <Chip
                            key={role.id || role.slug}
                            label={role.name}
                            size="small"
                            sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                bgcolor: 'rgba(56, 189, 248, 0.15)',
                                color: '#38bdf8',
                                fontWeight: 700,
                                border: 'none',
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {/* Lista de Navegación Compacta con Acordeones */}
            <List sx={{ px: 1, flexGrow: 1, overflowY: 'auto' }}>
                {navigationGroups
                    .filter((group) => group.show)
                    .map((item) => {
                        if (item.type === 'single') {
                            const isSelected = isCurrentActive(item);
                            return (
                                <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        selected={isSelected}
                                        onClick={() => {
                                            navigate(item.path);
                                            if (isMobile) setMobileOpen(false);
                                        }}
                                        sx={{
                                            borderRadius: 2,
                                            py: 0.8,
                                            px: 1.5,
                                            color: isSelected ? '#ffffff' : '#cbd5e1',
                                            bgcolor: isSelected ? '#0284c7 !important' : 'transparent',
                                            '&:hover': {
                                                bgcolor: isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                                                color: '#ffffff',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32, color: isSelected ? '#ffffff' : '#94a3b8' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{ fontSize: 13, fontWeight: isSelected ? 700 : 500 }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        }

                        // Acordeón / Grupo colapsable
                        const isExpanded = Boolean(openMenus[item.id]);
                        const isChildActive = item.children.some((child) => isCurrentActive(child));

                        return (
                            <React.Fragment key={item.id}>
                                <ListItem disablePadding sx={{ mb: 0.5 }}>
                                    <ListItemButton
                                        onClick={() => handleToggleMenu(item.id)}
                                        sx={{
                                            borderRadius: 2,
                                            py: 0.8,
                                            px: 1.5,
                                            color: isChildActive ? '#38bdf8' : '#cbd5e1',
                                            bgcolor: isChildActive ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                                            '&:hover': {
                                                bgcolor: 'rgba(255, 255, 255, 0.06)',
                                                color: '#ffffff',
                                            },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 32, color: isChildActive ? '#38bdf8' : '#94a3b8' }}>
                                            {item.icon}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.text}
                                            primaryTypographyProps={{ fontSize: 13, fontWeight: isChildActive ? 700 : 600 }}
                                        />
                                        {isExpanded ? (
                                            <ChevronDown size={15} color="#94a3b8" />
                                        ) : (
                                            <ChevronRight size={15} color="#94a3b8" />
                                        )}
                                    </ListItemButton>
                                </ListItem>

                                {/* Sub-elementos colapsables */}
                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <List component="div" disablePadding sx={{ pl: 2, borderLeft: '1px solid rgba(255, 255, 255, 0.1)', ml: 2.2, mb: 1 }}>
                                        {item.children.map((sub) => {
                                            const isSelected = isCurrentActive(sub);
                                            return (
                                                <ListItem key={sub.text} disablePadding sx={{ mb: 0.3 }}>
                                                    <ListItemButton
                                                        selected={isSelected}
                                                        onClick={() => {
                                                            navigate(sub.path);
                                                            if (isMobile) setMobileOpen(false);
                                                        }}
                                                        sx={{
                                                            borderRadius: 1.5,
                                                            py: 0.6,
                                                            px: 1.2,
                                                            color: isSelected ? '#ffffff' : '#94a3b8',
                                                            bgcolor: isSelected ? '#0284c7 !important' : 'transparent',
                                                            '&:hover': {
                                                                bgcolor: isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.06)',
                                                                color: '#ffffff',
                                                            },
                                                        }}
                                                    >
                                                        <ListItemIcon sx={{ minWidth: 26, color: isSelected ? '#ffffff' : '#64748b' }}>
                                                            {sub.icon}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={sub.text}
                                                            primaryTypographyProps={{ fontSize: 12.2, fontWeight: isSelected ? 700 : 500 }}
                                                        />
                                                    </ListItemButton>
                                                </ListItem>
                                            );
                                        })}
                                    </List>
                                </Collapse>
                            </React.Fragment>
                        );
                    })}
            </List>

            {/* Botón Cerrar Sesión */}
            <Box sx={{ p: 1.5, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{
                        borderRadius: 2,
                        py: 0.8,
                        color: '#f87171',
                        '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.12)' },
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 32, color: '#f87171' }}>
                        <LogOut size={18} />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f1f5f9' }}>
            <CssBaseline />

            {/* Top Navigation Bar — Azul Oscuro Institucional */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: THEME_COLORS.darkNavy,
                    color: '#ffffff',
                    borderBottom: `1px solid ${THEME_COLORS.darkNavyBorder}`,
                }}
            >
                <Toolbar sx={{ minHeight: '56px !important', px: 2.5 }}>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon size={20} />
                    </IconButton>

                    <Typography variant="subtitle1" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 0.3 }}>
                        {location.pathname === '/admission/inscribir'
                            ? 'Admisión — Registro e Inscripción de Postulante'
                            : location.pathname.startsWith('/admission')
                            ? 'Módulo de Admisión — Convocatorias y Postulantes'
                            : location.pathname.startsWith('/treasury')
                            ? 'Módulo de Tesorería — Caja y Cobranzas'
                            : location.pathname.startsWith('/users')
                            ? 'Gestión de Usuarios del Sistema'
                            : location.pathname.startsWith('/roles')
                            ? 'Gestión de Roles y Permisos'
                            : 'ERP IESPP Arco Iris — Panel General'}
                    </Typography>

                    {/* Perfil usuario arriba a la derecha */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#94a3b8', display: { xs: 'none', sm: 'block' }, mr: 0.5 }}>
                            {user?.email}
                        </Typography>
                        <IconButton onClick={handleMenuOpen} size="small" sx={{ p: 0.5 }}>
                            <Avatar sx={{ bgcolor: '#0284c7', width: 34, height: 34, fontSize: 14, fontWeight: 800 }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                sx: {
                                    mt: 1,
                                    borderRadius: 2,
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    minWidth: 180,
                                },
                            }}
                        >
                            <MenuItem disabled sx={{ py: 1 }}>
                                <Box>
                                    <Typography variant="body2" fontWeight={700}>
                                        {user?.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {user?.email}
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main', py: 1 }}>
                                <ListItemIcon>
                                    <LogOut size={16} color="#d32f2f" />
                                </ListItemIcon>
                                <Typography variant="body2" fontWeight={600} color="error">
                                    Cerrar Sesión
                                </Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
                aria-label="navegacion principal"
            >
                {/* Mobile Drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            borderRight: 'none',
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Permanent Desktop Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            borderRight: 'none',
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: 7,
                    minHeight: 'calc(100vh - 56px)',
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
