import React, { useState } from 'react';
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
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { Menu as MenuIcon, LayoutDashboard, Users, GraduationCap, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 260;

export default function DashboardLayout() {
    const { user, logout, hasRole } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
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

    // Dinamic Navigation Items based on User Roles
    const navigationItems = [
        {
            text: 'Inicio',
            icon: <LayoutDashboard size={20} />,
            path: '/',
            show: true,
        },
        {
            text: 'Gestión de Usuarios',
            icon: <Users size={20} />,
            path: '/users',
            show: hasRole('superadmin') || hasRole('admin'),
        },
        {
            text: 'Gestión de Roles',
            icon: <User size={20} />,
            path: '/roles',
            show: hasRole('superadmin') || hasRole('admin'),
        },
    ];

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Toolbar sx={{ px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <GraduationCap size={28} color="#1976d2" />
                <Typography variant="h6" fontWeight="bold" color="primary" noWrap>
                    ERP Instituto
                </Typography>
            </Toolbar>
            <Divider />
            
            {/* User status badge in drawer */}
            <Box sx={{ p: 2, bgcolor: 'action.hover', m: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold" noWrap>
                    {user?.name || 'Usuario'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {user?.email}
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {user?.roles?.map((role) => (
                        <Chip
                            key={role.id || role.slug}
                            label={role.name}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontSize: '0.65rem', height: 20 }}
                        />
                    ))}
                </Box>
            </Box>
            <Divider />

            {/* Navigation List */}
            <List sx={{ px: 1, flexGrow: 1 }}>
                {navigationItems
                    .filter((item) => item.show)
                    .map((item) => {
                        const isSelected = location.pathname === item.path;
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
                                        '&.Mui-selected': {
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            '& .MuiListItemIcon-root': {
                                                color: 'primary.contrastText',
                                            },
                                            '&:hover': {
                                                bgcolor: 'primary.dark',
                                            },
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: isSelected ? 'inherit' : 'text.secondary',
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
            </List>

            <Divider />
            <Box sx={{ p: 1.5 }}>
                <ListItemButton
                    onClick={handleLogout}
                    sx={{ borderRadius: 2, color: 'error.main' }}
                >
                    <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
                        <LogOut size={20} />
                    </ListItemIcon>
                    <ListItemText primary="Cerrar Sesión" />
                </ListItemButton>
            </Box>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.100' }}>
            <CssBaseline />

            {/* Top Navigation Bar */}
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    ml: { md: `${DRAWER_WIDTH}px` },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    boxShadow: 1,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        {navigationItems.find((item) => item.path === location.pathname)?.text || 'Panel General'}
                    </Typography>

                    {/* User profile menu top right */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 1 }}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Avatar>
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        >
                            <MenuItem disabled>
                                <Typography variant="body2" color="text.secondary">
                                    Conectado como <strong>{user?.name}</strong>
                                </Typography>
                            </MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout}>
                                <ListItemIcon>
                                    <LogOut size={18} color="#d32f2f" />
                                </ListItemIcon>
                                <Typography color="error">Cerrar Sesión</Typography>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Drawer Navigation Sidebar */}
            <Box
                component="nav"
                sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
                aria-label="mailbox folders"
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
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop Permanent Drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                            borderRight: '1px solid',
                            borderColor: 'divider',
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
                    p: 3,
                    width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
                    mt: 8,
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
}
