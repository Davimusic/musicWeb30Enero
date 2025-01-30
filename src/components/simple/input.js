import React, { useState, useEffect, useRef } from 'react';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Input = ({ inputType, id, style, required, onValueChange, value, name, className }) => {
    const [inputValue, setInputValue] = useState(value);

    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleChange = (event) => {
        event.stopPropagation();
        const newValue = event.target.value;
        setInputValue(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <input
            type={inputType}
            id={id}
            style={style}
            required={required}
            value={inputValue}
            name={name}
            onChange={handleChange}
            className={extractArrayContentToStrings(className)}
        />
    );
};

export default Input;







