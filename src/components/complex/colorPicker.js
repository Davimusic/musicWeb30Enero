import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import '../../estilos/music/music.css';

const ColorPickerModalContent = ({ onClose }) => {
    const [selectedColorClass, setSelectedColorClass] = useState('backgroundColor1');
    const [selectedColor, setSelectedColor] = useState('#060606');
    const [opacity, setOpacity] = useState(100);
    const [colors, setColors] = useState({
        backgroundColor1: '#000000',
        backgroundColor2: '#000000',
        backgroundColor3: '#000000',
        backgroundColor4: '#000000',
        backgroundColor5: '#000000',
    });

    // Normaliza el color y maneja transparencias
    const normalizeColor = (color) => {
        if (!color) return { hex: '#000000', opacity: 100 };
        
        // Si es RGBA
        if (color.startsWith('rgba')) {
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
        
        // Si no tiene #
        if (!color.startsWith('#')) {
            return { hex: `#${color}`, opacity: 100 };
        }
        
        // HEX válido
        if (color.length === 7) return { hex: color, opacity: 100 };
        
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

    // Carga colores iniciales
    useEffect(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const newColors = {
            backgroundColor1: rootStyles.getPropertyValue('--backgroundColor1').trim(),
            backgroundColor2: rootStyles.getPropertyValue('--backgroundColor2').trim(),
            backgroundColor3: rootStyles.getPropertyValue('--backgroundColor3').trim(),
            backgroundColor4: rootStyles.getPropertyValue('--backgroundColor4').trim(),
            backgroundColor5: rootStyles.getPropertyValue('--backgroundColor5').trim(),
        };
        
        setColors(newColors);
        const normalized = normalizeColor(newColors[selectedColorClass]);
        setSelectedColor(normalized.hex);
        setOpacity(normalized.opacity);
    }, []);

    // Actualiza al cambiar de color
    useEffect(() => {
        const normalized = normalizeColor(colors[selectedColorClass]);
        setSelectedColor(normalized.hex);
        setOpacity(normalized.opacity);
    }, [selectedColorClass, colors]);

    // Guarda el color
    const updateColor = () => {
        const finalColor = applyOpacity(selectedColor, opacity);
        document.documentElement.style.setProperty(`--${selectedColorClass}`, finalColor);
        onClose();
    };

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

    return (
        <div className='color2' style={{ 
            
            maxWidth: '400px',
            margin: '0 auto'
        }}>
            <p className='title-md' style={{ 
                textAlign: 'center',
                
            }}>Color Configuration</p>

            {/* Selector de color */}
            <div style={{ marginBottom: '5px' }}>
                <p className='text-general' style={{ 
                    marginBottom: '12px',
                    fontWeight: '500'
                }}>Select color to edit:</p>
                <div style={{ 
                    display: 'flex', 
                    gap: '12px', 
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }}>
                    {Object.entries(colors).map(([key, value]) => {
                        const normalized = normalizeColor(value);
                        return (
                            <div
                                key={key}
                                onClick={() => setSelectedColorClass(key)}
                                style={{
                                    cursor: 'pointer',
                                    position: 'relative',
                                    ...(selectedColorClass === key && {
                                        outline: '2px solid #2bc6c8',
                                        outlineOffset: '2px'
                                    })
                                }}
                            >
                                <ColorPreview 
                                    color={normalized.hex} 
                                    opacity={normalized.opacity}
                                    size="small"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Editor de color */}
            <div style={{ marginBottom: '25px' }}>
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                }}>
                    <p className='text-general' style={{ fontWeight: '500' }}>Color Editor</p>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <ColorPreview 
                            color={selectedColor} 
                            opacity={opacity}
                            size="small"
                        />
                        <span className='text-general' style={{ fontFamily: 'monospace' }}>
                            {opacity < 100 
                                ? applyOpacity(selectedColor, opacity)
                                : selectedColor}
                        </span>
                    </div>
                </div>

                <HexColorPicker
                    color={selectedColor}
                    onChange={setSelectedColor}
                    style={{ 
                        width: '100%',
                        marginBottom: '20px'
                    }}
                />

                {/* Control de opacidad */}
                <div>
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

            {/* Botón de acción */}
            <button
                onClick={updateColor}
                style={{ 
                    display: 'block',
                    width: '100%',
                    padding: '12px',
                    backgroundColor: selectedColor,
                    color: getContrastColor(selectedColor),
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                    }
                }}
            >
                Apply Changes
            </button>
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

export default ColorPickerModalContent;