import React, { useState, useEffect } from 'react';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const TextArea = ({ id, style, required, onValueChange, value, name, className }) => {
    const [textValue, setTextValue] = useState(value);

    useEffect(() => {
        setTextValue(value);
    }, [value]);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setTextValue(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <textarea
            id={id}
            style={{ ...style, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}
            required={required}
            value={textValue}
            name={name}
            onChange={handleChange}
            className={extractArrayContentToStrings(className)}
            rows="10"
            cols="50"
        />
    );
};

export default TextArea;

