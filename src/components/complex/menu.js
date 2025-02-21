import React, { useState, useEffect } from 'react';
import Modal from './modal';

const Menu = ({ isOpen, onClose, className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedColorClass, setSelectedColorClass] = useState('backgroundColor1');
    const [selectedColor, setSelectedColor] = useState('#060606'); // Color seleccionado

    // Objeto para manejar los colores de fondo
    const [colors, setColors] = useState({
        backgroundColor1: '#060606',
        backgroundColor2: '#0c283f',
        backgroundColor3: '#1d6188',
        backgroundColor4: '#2b95c8',
        backgroundColor5: '#2bc6c8',
    });

    // Método para obtener el valor actual de una variable CSS
    const getCurrentColorValue = (colorClass) => {
        return getComputedStyle(document.documentElement).getPropertyValue(`--${colorClass}`).trim();
    };

    // Efecto para actualizar el color seleccionado cuando cambia la clase
    useEffect(() => {
        const currentColor = getCurrentColorValue(selectedColorClass);
        setSelectedColor(currentColor);
    }, [selectedColorClass]);

    // Método para actualizar un color
    const updateColor = (colorClass, hexValue) => {
        if (/^#([0-9A-Fa-f]{3}){1,2}$/i.test(hexValue)) {
            const updatedColors = { ...colors, [colorClass]: hexValue };
            setColors(updatedColors);
            return true; // Indica que la actualización fue exitosa
        }
        return false; // Indica que hubo un error
    };

    // Método para manejar la actualización del color
    const handleUpdateColor = () => {
        const success = updateColor(selectedColorClass, selectedColor);
        if (success) {
            // Actualizar la variable CSS correspondiente en el DOM
            document.documentElement.style.setProperty(`--${selectedColorClass}`, selectedColor);
            setIsModalOpen(false);
        } else {
            alert('Error: Valor hexadecimal no válido.');
        }
    };

    // Método para manejar cambios en el selector de colores
    const handleColorChange = (e) => {
        setSelectedColor(e.target.value); // Actualizar el color seleccionado
    };

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
                    <li style={{ marginBottom: '15px' }}>
                        <button 
                            onClick={() => setIsModalOpen(true)} 
                            style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            Cambiar color de fondo
                        </button>
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
            {/* Modal para cambiar el color de fondo */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h2 style={{ color: 'white' }}>Actualizar color de fondo</h2>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'white', marginRight: '10px' }}>Selecciona un color:</label>
                    <select 
                        value={selectedColorClass} 
                        onChange={(e) => setSelectedColorClass(e.target.value)}
                        style={{ padding: '5px', borderRadius: '4px' }}
                    >
                        <option value="backgroundColor1">Color 1</option>
                        <option value="backgroundColor2">Color 2</option>
                        <option value="backgroundColor3">Color 3</option>
                        <option value="backgroundColor4">Color 4</option>
                        <option value="backgroundColor5">Color 5</option>
                    </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'white', marginRight: '10px' }}>Color seleccionado:</label>
                    <input 
                        type="color" 
                        value={selectedColor} 
                        onChange={handleColorChange} 
                        style={{ marginRight: '10px', verticalAlign: 'middle' }}
                    />
                </div>
                <button 
                    className='backgroundColor1'
                    onClick={handleUpdateColor}
                    style={{ padding: '10px 20px', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Actualizar color
                </button>
            </Modal>
        </>
    );
};

export default Menu;