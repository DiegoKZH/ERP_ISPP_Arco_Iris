//import './bootstrap'; 
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';

function LandingPage() {
    const [backendData, setBackendData] = useState(null);
    const [loading, setLoading] = useState(true);

    // useEffect se ejecuta cuando el componente se monta en pantalla
    useEffect(() => {
        // Hacemos la petición a la ruta que creamos en Laravel
        fetch('/api/landing-stats')
            .then(response => response.json())
            .then(data => {
                setBackendData(data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error conectando con Laravel:", error);
                setLoading(false);
            });
    }, []);

    return (
        <div style={{ padding: '50px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
            <h1 style={{ color: '#1e3a8a' }}>Bienvenido a ERP-INSTITUTO</h1>
            <p style={{ color: '#4b5563', fontSize: '18px' }}>
                Esta interfaz está renderizada por <strong>React</strong> gracias al empaquetador Vite.
            </p>

            <div style={{ marginTop: '40px', padding: '20px', display: 'inline-block', minWidth: '300px' }}>
                {loading ? (
                    <p style={{ color: '#f59e0b' }}>Consultando al backend de Laravel...</p>
                ) : backendData ? (
                    <div style={{ background: '#fff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#10b981', margin: '0 0 15px 0' }}>¡Conexión Exitosa con el Servidor! ✅</h3>
                        <p><strong>Proyecto:</strong> {backendData.sistema}</p>
                        <p><strong>Stack detectado:</strong> {backendData.versiones}</p>
                        <p><strong>Alumnos en Base de Datos (Simulados):</strong> {backendData.alumnos_matriculados}</p>
                    </div>
                ) : (
                    <p style={{ color: '#dc2626' }}>No se pudo obtener respuesta del backend.</p>
                )}
            </div>
        </div>
    );
}

// Vinculamos el componente de React con el div de Blade
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<LandingPage />);