import React, { useState, useEffect } from 'react';
import extractArrayContentToStrings from '@/functions/general/extractArrayContentToStrings';

const Label = ({ id, style, onValueChange, value, name, className }) => {
    const [labelValue, setLabelValue] = useState(value);

    useEffect(() => {
        setLabelValue(value);
    }, [value]);

    const handleChange = (event) => {
        const newValue = event.target.value;
        setLabelValue(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <div>
            <label
                id={id}
                style={style}
                name={name}
                className={extractArrayContentToStrings(className)}
            >
                {labelValue}
            </label>
            <input
                type="text"
                value={labelValue}
                onChange={handleChange}
                style={{ display: 'none' }} // Oculta el input, pero permite cambiar el valor del label
            />
        </div>
    );
};

export default Label;

