import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import '../../estilos/music/music.css';

const SingleColorPickerModalContent = ({ initialColor, onColorUpdate, onClose }) => {
    const normalizeColor = (color) => {
        if (!color) return { hex: '#000000', opacity: 100 };
        
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
        
        if (color.length === 4 && color.startsWith('#')) {
            return { 
                hex: `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`, 
                opacity: 100 
            };
        }
        
        if (/^[0-9A-Fa-f]{3,6}$/.test(color)) {
            return { hex: `#${color}`, opacity: 100 };
        }
        
        if (color.length === 7 && color.startsWith('#')) return { hex: color, opacity: 100 };
        
        return { hex: '#000000', opacity: 100 };
    };

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

    const ColorPreview = ({ color, opacity, size = 'medium' }) => {
        const sizes = {
            small: { width: 32, height: 32 },
            medium: { width: 50, height: 50 },
            large: { width: 70, height: 70 }
        };
        
        return (
            <div style={{
                ...sizes[size],
                position: 'relative',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
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

    const handleUpdateColor = () => {
        const finalColor = applyOpacity(selectedColor, opacity);
        onColorUpdate(finalColor);
        onClose();
    };

    return (
        <div className='color2' style={{ 
            maxWidth: '400px',
            margin: '0 auto',
            padding: '15px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        }}>
            <p className='title-md' style={{ 
                textAlign: 'center',
                margin: '0 0 10px 0',
                fontSize: '1.2rem',
                fontWeight: '600'
            }}>Color Configuration</p>

            {/* Color actual y nuevo */}
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <p className='text-general' style={{ 
                        margin: '0 0 8px 0',
                        fontWeight: '500',
                        fontSize: '0.95rem'
                    }}>Current color:</p>
                    
                    <ColorPreview 
                        color={initialNormalized.hex} 
                        opacity={initialNormalized.opacity}
                        size="medium"
                    />
                    <span className='text-general' style={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.9rem'
                    }}>
                        {initialColor}
                    </span>
                </div>
                
                {/* Vista previa del nuevo color */}
                <div style={{ maxWidth: '125px'}}>
                    <p className='text-general' style={{ 
                        margin: '0 0 8px 0',
                        fontWeight: '500',
                        fontSize: '0.95rem'
                    }}>New color preview:</p>
                    
                    <ColorPreview 
                        color={selectedColor} 
                        opacity={opacity}
                        size="medium"
                    />
                    <span className='text-general' style={{ 
                        fontFamily: 'monospace',
                        fontSize: '0.9rem',
                    }}>
                        {opacity < 100 
                            ? applyOpacity(selectedColor, opacity)
                            : selectedColor}
                    </span>
                </div>
            </div>

            {/* Selector de color */}
            <div>
                <label className='text-general' style={{ 
                    display: 'block',
                    margin: '0 0 8px 0',
                    fontWeight: '500',
                    fontSize: '0.95rem'
                }}>Select new color:</label>
                
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}>
                    <HexColorPicker
                        color={selectedColor}
                        onChange={setSelectedColor}
                        style={{ 
                            width: '300px',
                            height: '180px'
                        }}
                    />

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '5px',
                        height: '180px',
                        justifyContent: 'center'
                    }}>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={opacity}
                            onChange={(e) => setOpacity(parseInt(e.target.value))}
                            style={{ 
                                width: '100px',
                                height: '30px',
                                accentColor: selectedColor,
                                transform: 'rotate(270deg)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Botones de acción */}
            <div style={{ 
                display: 'flex',
                gap: '10px',
                justifyContent: 'space-between',
                marginTop: '10px'
            }}>
                <button
                    onClick={onClose}
                    style={{ 
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                    }}
                >
                    Cancel
                </button>
                <button
                    onClick={handleUpdateColor}
                    style={{ 
                        padding: '8px 16px',
                        backgroundColor: 'white',
                        color: 'black',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s'
                    }}
                >
                    Update Color
                </button>
            </div>
        </div>
    );
};

export default SingleColorPickerModalContent;