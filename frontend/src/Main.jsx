import React, { useEffect, useState } from 'react';

export default function Main() {
    const [status, setStatus] = useState('Verificando conexión...');

    useEffect(() => {
        // Ejemplo de comunicación sencilla React -> Laravel API
        fetch('/api/status')
            .then(res => res.json())
            .then(data => {
                setStatus(data.message || 'Conectado con la API, pero el mensaje es inesperado.');
            })
            .catch(error => {
                console.error('Error al conectar con la API:', error);
                setStatus('Error al conectar con la API. Revisa la consola.');
            });
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">ERP Instituto</h1>
                <p className="text-gray-600 mb-6">Estado de la conexión Backend ↔ Frontend:</p>
                <div className={`p-4 rounded font-medium ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {status}
                </div>
            </div>
        </div>
    );
}
