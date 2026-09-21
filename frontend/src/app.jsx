import '../styles/app.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardLayout from './layouts/DashboardLayout'
import Login from './pages/auth/Login'
import DashboardHome from './pages/dashboard/DashboardHome'
import UsersList from './pages/users/UsersList'
import RolesList from './pages/roles/RolesList'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    
                    {/* Protected Routes wrapped in DashboardLayout */}
                    <Route element={<ProtectedRoute />}>
                        <Route element={<DashboardLayout />}>
                            <Route path="/" element={<DashboardHome />} />
                            
                            {/* Role restricted routes */}
                            <Route element={<ProtectedRoute requiredRoles={['superadmin', 'admin']} />}>
                                <Route path="/users" element={<UsersList />} />
                                <Route path="/roles" element={<RolesList />} />
                            </Route>
                        </Route>
                    </Route>

                    {/* Fallback Catch-all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
)