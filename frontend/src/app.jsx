import '../styles/app.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';

// Páginas de autenticación y dashboard
import Login from './pages/auth/Login';
import DashboardHome from './pages/dashboard/DashboardHome';

// Páginas de usuarios y roles
import UsersList from './pages/users/UsersList';
import RolesList from './pages/roles/RolesList';

// Páginas de gestión de alumnos
import GestionAlumnos from './pages/alumnos/GestionAlumnos';

// Página de gestión de secciones
import SeccionesPage from './pages/global/secciones';

// Páginas de admisión
import PadronPostulantesPage from './pages/admission/PadronPostulantesPage';
import InscripcionPostulantePage from './pages/admission/InscripcionPostulantePage';
import ConvocatoriasPage from './pages/admission/ConvocatoriasPage';
import VacantesOfertadasPage from './pages/admission/VacantesOfertadasPage';
import CuadroMeritoPage from './pages/admission/CuadroMeritoPage';

// Páginas de Gestión Global
import GestionCarrera from './pages/global/especialidad';

// Página de tesorería
import TreasuryDashboard from './pages/treasury/TreasuryDashboard';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Acceso al sistema */}
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    {/* Rutas protegidas */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>

                            {/* Página principal */}
                            <Route
                                path="/"
                                element={<DashboardHome />}
                            />

                            {/* Módulos para administradores */}
                            <Route
                                element={
                                    <ProtectedRoute
                                        requiredRoles={['superadmin', 'admin']}
                                    />
                                }
                            >
                                {/* Usuarios y roles */}
                                <Route
                                    path="/users"
                                    element={<UsersList />}
                                />

                                <Route
                                    path="/roles"
                                    element={<RolesList />}
                                />

                                {/* Gestión de alumnos */}
                                <Route
                                    path="/alumnos"
                                    element={<GestionAlumnos />}
                                />

                                {/* Gestión de secciones */}
                                <Route
                                    path="/gestion-global/secciones"
                                    element={<SeccionesPage />}
                                />

                                {/* Admisión */}
                                <Route
                                    path="/admission"
                                    element={<PadronPostulantesPage />}
                                />

                                <Route
                                    path="/admission/inscribir"
                                    element={<InscripcionPostulantePage />}
                                />

                                <Route
                                    path="/admission/convocatorias"
                                    element={<ConvocatoriasPage />}
                                />

                                <Route
                                    path="/admission/vacantes"
                                    element={<VacantesOfertadasPage />}
                                />

                                <Route
                                    path="/admission/resultados"
                                    element={<CuadroMeritoPage />}
                                />

                                {/* Gestión Global */}
                                <Route
                                    path="/gestion-global/especialidad"
                                    element={<GestionCarrera />}
                                />

                                {/* Tesorería */}
                                <Route
                                    path="/treasury"
                                    element={<TreasuryDashboard />}
                                />
                            </Route>
                        </Route>
                    </Route>

                    {/* Redirigir las rutas desconocidas */}
                    <Route
                        path="*"
                        element={<Navigate to="/" replace />}
                    />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>
);