// pages/index.js
"use client"; // Asegúrate de marcar este componente como del lado del cliente
import { useState } from 'react';
import '../estilos/general/general.css'

export default function score() {
    // Estados para manejar los valores del formulario
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // Función para manejar el envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault(); // Evitar que el formulario se envíe automáticamente

        // Validar que los campos no estén vacíos
        if (!name || !email) {
            setMessage('Por favor, completa todos los campos.');
            return;
        }

        // Validar el formato del correo electrónico
        if (!/\S+@\S+\.\S+/.test(email)) {
            setMessage('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        // Enviar los datos a un endpoint (simulado aquí)
        try {
            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                setMessage('Formulario enviado correctamente.');
                setName('');
                setEmail('');
            } else {
                setMessage('Hubo un error al enviar el formulario.');
            }
        } catch (error) {
            setMessage('Hubo un error al enviar el formulario.');
        }
    };

    return (
        <div className='backgroundColor3' style={{height: '100vh', display: 'flex', alignItems: 'center'}}>
            <div className="container backgroundColor5" style={{}}>
                <h1>Formulario de Contacto</h1>
                <form onSubmit={handleSubmit} className="form">
                    <div className="form-group">
                        <label htmlFor="name">Nombre:</label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Correo Electrónico:</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input"
                            required
                        />
                    </div>
                    <button type="submit" className="button">
                        Enviar
                    </button>
                </form>
                {message && (
                    <p className={`message ${message.includes('error') ? 'error' : 'success'}`}>
                        {message}
                    </p>
                )}

                {/* Estilos con Styled JSX */}
                <style jsx>{`
                    .container {
                        max-width: 400px;
                        margin: 0 auto;
                        padding: 20px;
                        background: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }

                    h1 {
                        text-align: center;
                        color: #333;
                        margin-bottom: 20px;
                        font-size: 24px;
                    }

                    .form {
                        display: flex;
                        flex-direction: column;
                    }

                    .form-group {
                        margin-bottom: 15px;
                    }

                    label {
                        font-size: 14px;
                        color: #555;
                        margin-bottom: 5px;
                        display: block;
                    }

                    .input {
                        width: 100%;
                        padding: 10px;
                        font-size: 14px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                        outline: none;
                        transition: border-color 0.3s ease;
                    }

                    .input:focus {
                        border-color: #0070f3;
                    }

                    .button {
                        width: 100%;
                        padding: 10px;
                        background-color: #0070f3;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        font-size: 16px;
                        cursor: pointer;
                        transition: background-color 0.3s ease;
                    }

                    .button:hover {
                        background-color: #005bb5;
                    }

                    .message {
                        margin-top: 15px;
                        padding: 10px;
                        border-radius: 5px;
                        text-align: center;
                        font-size: 14px;
                    }

                    .message.success {
                        background-color: #d4edda;
                        color: #155724;
                        border: 1px solid #c3e6cb;
                    }

                    .message.error {
                        background-color: #f8d7da;
                        color: #721c24;
                        border: 1px solid #f5c6cb;
                    }
                `}</style>
            </div>
        </div>
    );
}