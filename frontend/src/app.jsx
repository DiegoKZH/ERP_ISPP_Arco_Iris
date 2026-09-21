import '../styles/app.css';
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/auth/Login'
import UsersList from './pages/users/UsersList'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route element={<ProtectedRoute />}>
                        <Route path="/*" element={<UsersList />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    </React.StrictMode>,
)