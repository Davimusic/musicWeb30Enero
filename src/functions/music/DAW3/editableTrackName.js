// Track.jsx
import React, { useEffect, useRef, useState } from 'react';
'../../../estilos/music/audioEditor.css'
//import drawWaveform from './drawWaveform';
const EditableTrackName = ({ name, onChange, className, style}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(name);
    const inputRef = useRef();
  
    const handleClick = () => {
      setIsEditing(true);
    };
  
    const handleBlur = () => {
      setIsEditing(false);
      onChange(editValue);
    };
  
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        setIsEditing(false);
        onChange(editValue);
      }
    };
  
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, [isEditing]);
  
    return (
      <div className={className} onClick={handleClick} style={style} >
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span>{name || 'Unnamed Track'}</span>
        )}
      </div>
    );
  };



export default EditableTrackName;