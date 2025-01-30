import React, { useState } from 'react';
import ModernCheckbox from './ModernCheckbox';

const ComponentRenderCheckbox = (condition, id, labelTrue, labelFalse, handleChange, isChecked) => {
    const [state, setState] = useState(false);

    function localHandleChange() {
        setState(!state);
        handleChange();
    }

    return (
        <div style={{display: 'flex'}}>
            <ModernCheckbox
                id={id}
                actionFunction={localHandleChange}
                isCheckedInitially={isChecked}
            />
            {condition ? labelTrue : labelFalse}
        </div>
    );
};

export default ComponentRenderCheckbox;


