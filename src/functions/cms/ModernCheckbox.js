import React, { useState, useEffect } from 'react';

const ModernCheckbox = ({ id, actionFunction, isCheckedInitially }) => {
    const [isChecked, setIsChecked] = useState(isCheckedInitially);

    const handleCheckboxClick = (e) => {
        e.stopPropagation();
        setIsChecked(!isChecked);
        actionFunction(e);
    };

    useEffect(() => {
        setIsChecked(isCheckedInitially);
    }, [isCheckedInitially]);

    return (
        <div
            id={id}
            onClick={handleCheckboxClick}
            style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid #ccc',
                background: isChecked ? 'green' : 'red',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.5s, border-color 0.5s'
            }}
        ></div>
    );
};

export default ModernCheckbox;





/*import React, { useState, useEffect } from 'react';

const ModernCheckbox = ({ id, actionFunction, isCheckedInitially }) => {
    const [isChecked, setIsChecked] = useState(isCheckedInitially);

    const handleCheckboxClick = () => {
        setIsChecked(!isChecked);
        actionFunction(id);
    };

    useEffect(() => {
        setIsChecked(isCheckedInitially);
    }, [isCheckedInitially]);

    return (
        <div
            id={id}
            onClick={handleCheckboxClick}
            style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid #ccc',
                background: isChecked ? 'green' : 'red',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.5s, border-color 0.5s'
            }}
        ></div>
    );
};

export default ModernCheckbox;*/
