import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import '../../estilos/music/music.css';

const SingleColorPickerModalContent = ({ initialColor, onColorUpdate, onClose }) => {
    // Normaliza el color (acepta HEX, RGB, RGBA)
    const normalizeColor = (color) => {
        if (!color) return { hex: '#000000', opacity: 100 };
        
        // Si es RGBA/RGB
        if (color.startsWith('rgb')) {
            const rgba = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
            if (rgba) {
                const r = parseInt(rgba[1]).toString(16).padStart(2, '0');
                const g = parseInt(rgba[2]).toString(16).padStart(2, '0');
                const b = parseInt(rgba[3]).toString(16).padStart(2, '0');
                const alpha = rgba[4] ? Math.round(parseFloat(rgba[4]) * 100) : 100;
                return { hex: `#${r}${g}${b}`, opacity: alpha };
            }
        }
        
        // Si es HEX de 3 dígitos
        if (color.length === 4 && color.startsWith('#')) {
            return { 
                hex: `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`, 
                opacity: 100 
            };
        }
        
        // Si no tiene # pero es válido
        if (/^[0-9A-Fa-f]{3,6}$/.test(color)) {
            return { hex: `#${color}`, opacity: 100 };
        }
        
        // HEX válido
        if (color.length === 7 && color.startsWith('#')) return { hex: color, opacity: 100 };
        
        // Valor por defecto si no es reconocido
        return { hex: '#000000', opacity: 100 };
    };

    // Convierte a RGBA si hay transparencia
    const applyOpacity = (hex, opacity) => {
        if (opacity < 100) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
        }
        return hex;
    };

    const initialNormalized = normalizeColor(initialColor);
    const [selectedColor, setSelectedColor] = useState(initialNormalized.hex);
    const [opacity, setOpacity] = useState(initialNormalized.opacity);

    // Componente para mostrar color con transparencia
    const ColorPreview = ({ color, opacity, size = 'medium' }) => {
        const sizes = {
            small: { width: 40, height: 40 },
            medium: { width: 60, height: 60 },
            large: { width: 80, height: 80 }
        };
        
        return (
            <div style={{
                ...sizes[size],
                position: 'relative',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                {/* Fondo de transparencia */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `
                        linear-gradient(45deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(-45deg, #e0e0e0 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #e0e0e0 75%),
                        linear-gradient(-45deg, transparent 75%, #e0e0e0 75%)
                    `,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0'
                }} />
                {/* Color aplicado */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: color,
                    opacity: opacity / 100
                }} />
            </div>
        );
    };

    // Función para manejar la actualización del color
    const handleUpdateColor = () => {
        const finalColor = applyOpacity(selectedColor, opacity);
        onColorUpdate(finalColor);
        onClose();
    };

    return (
        <div className='color2' style={{ 
            maxWidth: '400px',
            margin: '0 auto'
        }}>
            <p className='title-md' style={{ 
                textAlign: 'center',
                
            }}>Color Configuration</p>

            {/* Color actual */}
            <div style={{ marginBottom: '5px' }}>
                <p className='text-general' style={{ 
                    marginBottom: '12px',
                    fontWeight: '500'
                }}>Current color:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ColorPreview 
                        color={initialNormalized.hex} 
                        opacity={initialNormalized.opacity}
                        size="medium"
                    />
                    <span className='text-general' style={{ fontFamily: 'monospace' }}>
                        {initialColor}
                    </span>
                </div>
            </div>

            {/* Selector de color */}
            <div style={{ marginBottom: '25px' }}>
                <label className='text-general' style={{ 
                    display: 'block',
                    marginBottom: '15px',
                    fontWeight: '500'
                }}>Select new color:</label>
                
                <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ 
                        width: '100%',
                        marginBottom: '20px'
                    }}
                />

                {/* Control de opacidad */}
                <div style={{ marginTop: '20px' }}>
                    <div style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                    }}>
                        <span className='text-general'>Opacity</span>
                        <span className='text-general'>{opacity}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={opacity}
                        onChange={(e) => setOpacity(parseInt(e.target.value))}
                        style={{ 
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            accentColor: selectedColor
                        }}
                    />
                </div>
            </div>

            {/* Vista previa del nuevo color */}
            <div style={{ marginBottom: '25px' }}>
                <p className='text-general' style={{ 
                    marginBottom: '12px',
                    fontWeight: '500'
                }}>New color preview:</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ColorPreview 
                        color={selectedColor} 
                        opacity={opacity}
                        size="medium"
                    />
                    <span className='text-general' style={{ fontFamily: 'monospace' }}>
                        {opacity < 100 
                            ? applyOpacity(selectedColor, opacity)
                            : selectedColor}
                    </span>
                </div>
            </div>

            {/* Botones de acción */}
            <div style={{ 
                display: 'flex',
                gap: '10px',
                justifyContent: 'flex-end'
            }}>
                <button
                    onClick={onClose}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: 'transparent',
                        color: '#333',
                        border: '1px solid #ccc',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdateColor}
                    style={{ 
                        padding: '10px 20px',
                        backgroundColor: selectedColor,
                        color: getContrastColor(selectedColor),
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        transition: 'all 0.2s',
                        ':hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                        }
                    }}
                >
                    Update Color
                </button>
            </div>
        </div>
    );
};

// Función para determinar color de texto contrastante
function getContrastColor(hexColor) {
    if (!hexColor || !hexColor.startsWith('#')) return '#000';
    
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000' : '#FFF';
}

export default SingleColorPickerModalContent;