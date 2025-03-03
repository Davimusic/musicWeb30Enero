import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import '../../estilos/music/music.css'

const ColorPickerModalContent = ({ onClose }) => {
    const [selectedColorClass, setSelectedColorClass] = useState('backgroundColor1');
    const [selectedColor, setSelectedColor] = useState('#060606');
    const [colors, setColors] = useState({
        backgroundColor1: '',
        backgroundColor2: '',
        backgroundColor3: '',
        backgroundColor4: '',
        backgroundColor5: '',
    });

    // Get colors from CSS variables
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
    }, []);

    // Update selected color when class changes
    useEffect(() => {
        setSelectedColor(colors[selectedColorClass]);
    }, [selectedColorClass, colors]);

    // Function to update a color
    const updateColor = (colorClass, hexValue) => {
        if (/^#([0-9A-Fa-f]{3}){1,2}$/i.test(hexValue)) {
            const updatedColors = { ...colors, [colorClass]: hexValue };
            setColors(updatedColors);
            document.documentElement.style.setProperty(`--${colorClass}`, hexValue);
            return true;
        }
        return false;
    };

    // Function to handle color update
    const handleUpdateColor = () => {
        if (updateColor(selectedColorClass, selectedColor)) {
            onClose();
        } else {
            alert('Error: Invalid hexadecimal value.');
        }
    };

    return (
        <div className='color2' style={{ padding: '30px' }}>
            <p className='title-md'>Update background color</p>

            {/* Show current colors as selectable buttons */}
            <div style={{ marginBottom: '20px' }}>
                <p className='text-general'>Select a color to update:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {Object.entries(colors).map(([key, value]) => (
                        <div
                            key={key}
                            onClick={() => setSelectedColorClass(key)} // Select color on click
                            style={{
                                width: '40px',
                                height: '40px',
                                backgroundColor: value,
                                border: selectedColorClass === key ? '3px solid #2bc6c8' : '1px solid #000',
                                cursor: 'pointer',
                                borderRadius: '4px',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* Show color picker only if a color is selected */}
            {selectedColorClass && (
                <div style={{ marginBottom: '20px' }}>
                    <label className='text-general' style={{ marginRight: '10px' }}>Edit selected color:</label>
                    <HexColorPicker
                        color={selectedColor}
                        onChange={setSelectedColor}
                        style={{ marginBottom: '20px' }}
                    />
                </div>
            )}

            {/* Button to update the color */}
            <button
                className='backgroundColor3 text-general color2'
                onClick={handleUpdateColor}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Update color
            </button>
        </div>
    );
};

export default ColorPickerModalContent;