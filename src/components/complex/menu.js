import React from 'react';

const Menu = ({ isOpen, onClose, className = '' }) => {
    return (
        <>
            {/* Menú lateral */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isOpen ? 0 : '-300px', // Desplazamiento del menú
                    width: '300px',
                    height: '100vh',
                    zIndex: 1000,
                    transition: 'left 0.3s ease',
                    padding: '20px',
                    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.5)',
                }}
                className={className}
            >
                <h2 style={{ color: 'white', marginBottom: '20px' }}>Menú</h2>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    <li style={{ marginBottom: '15px' }}>
                        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Inicio</a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Explorar</a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Favoritos</a>
                    </li>
                    <li style={{ marginBottom: '15px' }}>
                        <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Configuración</a>
                    </li>
                </ul>
            </div>
            {/* Overlay para cerrar el menú */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                    }}
                    onClick={onClose}
                />
            )}
        </>
    );
};

export default Menu;