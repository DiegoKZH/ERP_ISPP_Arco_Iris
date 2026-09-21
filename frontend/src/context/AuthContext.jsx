import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial load: check if token exists and fetch user profile
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data.data); // data.data because of UserResource wrapper
                } catch (err) {
                    console.error('Auth verification failed', err);
                    localStorage.removeItem('auth_token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await api.post('/auth/login', credentials);
            
            const { token, user: userData } = response.data;
            
            // Store token in localStorage
            localStorage.setItem('auth_token', token);
            
            // Set user state
            setUser(userData);
            
            return { success: true };
        } catch (err) {
            console.error('Login failed', err);
            setError(err.response?.data?.message || 'Error al iniciar sesión');
            return { 
                success: false, 
                error: err.response?.data?.message || 'Error al iniciar sesión' 
            };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            localStorage.removeItem('auth_token');
            setUser(null);
            window.location.href = '/login';
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        isAuthenticated: !!user,
        hasRole: (role) => user?.roles?.some(r => r.slug === role) || user?.roles?.some(r => r.slug === 'superadmin'),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
