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

    const normalizeColor = (color) => {
        if (!color) return { hex: '#000000', opacity: 100 };
        
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
        
        if (color.length === 4 && color.startsWith('#')) {
            return { 
                hex: `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`, 
                opacity: 100 
            };
        }
        
        if (!color.startsWith('#')) {
            return { hex: `#${color}`, opacity: 100 };
        }
        
        if (color.length === 7) return { hex: color, opacity: 100 };
        
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

    useEffect(() => {
        const normalized = normalizeColor(colors[selectedColorClass]);
        setSelectedColor(normalized.hex);
        setOpacity(normalized.opacity);
    }, [selectedColorClass, colors]);

    const updateColor = () => {
        const finalColor = applyOpacity(selectedColor, opacity);
        document.documentElement.style.setProperty(`--${selectedColorClass}`, finalColor);
        onClose();
    };

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

    return (
        <div className='color2' style={{ 
            maxWidth: '400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <p className='title-md' style={{ 
                textAlign: 'center',
                fontSize: '1.2rem',
                fontWeight: '600'
            }}>Color Configuration</p>

            {/* Selector de color */}
            <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                    <p className='text-general' style={{ 
                        margin: '0 0 8px 0',
                        fontWeight: '500',
                        fontSize: '0.95rem'
                    }}>Select color to edit:</p>
                    
                    <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
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
                
                {/* Vista previa del color seleccionado */}
                <div style={{ maxWidth: '100px'}}>
                    <p className='text-general' style={{ 
                        margin: '0 0 8px 0',
                        fontWeight: '500',
                        fontSize: '0.95rem'
                    }}>Selected color:</p>
                    
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

            {/* Editor de color */}
            <div>
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px'
                }}>
                    <p className='text-general' style={{ 
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        margin: 0
                    }}>Color Editor</p>
                </div>

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

            {/* Botón de acción */}
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
                    onClick={updateColor}
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
                    Apply Changes
                </button>
            </div>
        </div>
    );
};



export default ColorPickerModalContent;