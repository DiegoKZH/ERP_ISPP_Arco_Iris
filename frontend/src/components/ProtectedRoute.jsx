import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { isAuthenticated, hasRole, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && !hasRole(requiredRole)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white p-8 rounded-lg shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Acceso Denegado</h2>
                    <p className="text-gray-600 mb-6">No tienes los permisos necesarios para ver esta página.</p>
                    <button 
                        onClick={() => window.history.back()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;
