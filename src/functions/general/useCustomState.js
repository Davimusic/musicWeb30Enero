import { useState } from 'react';

function useCustomState(initialValue, actions) {
    const [state, setState] = useState(initialValue);

    // Function to execute actions based on the state value
    const setCustomState = (newValue) => {
        setState(newValue);
        if (actions[newValue]) {
            actions[newValue]();
        }
    };

    return [state, setCustomState];
}

export default useCustomState;
