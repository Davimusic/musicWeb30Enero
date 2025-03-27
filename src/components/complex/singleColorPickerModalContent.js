import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import '../../estilos/music/music.css';

const SingleColorPickerModalContent = ({ initialColor, onColorUpdate, onClose }) => {
    const [selectedColor, setSelectedColor] = useState(initialColor);

    // Actualizar el color seleccionado si initialColor cambia
    useEffect(() => {
        setSelectedColor(initialColor);
    }, [initialColor]);

    // Función para manejar la actualización del color
    const handleUpdateColor = () => {
        if (/^#([0-9A-Fa-f]{3}){1,2}$/i.test(selectedColor)) {
            onColorUpdate(selectedColor);
            onClose();
        } else {
            alert('Error: Invalid hexadecimal value.');
        }
    };

    return (
        <div className='color2' style={{ padding: '30px' }}>
            <p className='title-md'>Update color</p>

            {/* Mostrar el color actual */}
            <div style={{ marginBottom: '20px' }}>
                <p className='text-general'>Current color:</p>
                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: initialColor,
                        border: '1px solid #000',
                        borderRadius: '4px',
                        margin: '10px 0'
                    }}
                />
            </div>

            {/* Selector de color */}
            <div style={{ marginBottom: '20px' }}>
                <label className='text-general' style={{ marginRight: '10px' }}>Select new color:</label>
                <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ marginBottom: '20px' }}
                />
            </div>

            {/* Vista previa del nuevo color */}
            <div style={{ marginBottom: '20px' }}>
                <p className='text-general'>New color preview:</p>
                <div
                    style={{
                        width: '60px',
                        height: '60px',
                        backgroundColor: selectedColor,
                        border: '1px solid #000',
                        borderRadius: '4px',
                        margin: '10px 0'
                    }}
                />
            </div>

            {/* Botones de acción */}
            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    className='backgroundColor3 text-general color2'
                    onClick={handleUpdateColor}
                    style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#020202a8' }}
                >
                    Update color
                </button>
                <button
                    className='backgroundColor3 text-general color2'
                    onClick={onClose}
                    style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#020202a8' }}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default SingleColorPickerModalContent;