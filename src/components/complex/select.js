import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const Select = ({
  id,
  name,
  value,
  onChange,
  onBlur,
  disabled,
  required,
  className,
  children,
  placeholder,
  style,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Configurar la etiqueta seleccionada según el value y el placeholder
  useEffect(() => {
    let found = false;
    if (children) {
      React.Children.forEach(children, (child) => {
        if (child.props.value === value) {
          setSelectedLabel(child.props.children);
          found = true;
        }
      });
    }
    if (!found && placeholder) {
      setSelectedLabel(placeholder);
    }
  }, [value, children, placeholder]);

  // Cerrar el dropdown cuando se hace clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpenRef.current) {
        const isInsideSelect = selectRef.current?.contains(event.target);
        const isInsideDropdown = dropdownRef.current?.contains(event.target);
        
        if (!isInsideSelect && !isInsideDropdown) {
          setIsOpen(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Manejo de teclado para mejorar la accesibilidad
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }
      
      const options = dropdownRef.current?.querySelectorAll('[role="option"]');
      if (!options || options.length === 0) return;
      
      const currentIndex = Array.from(options).findIndex(
        (option) => option.getAttribute('data-value') === value?.toString()
      );
      
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          options[nextIndex].focus();
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          options[prevIndex].focus();
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          if (document.activeElement.getAttribute('role') === 'option') {
            handleOptionSelect(
              document.activeElement.getAttribute('data-value'),
              document.activeElement.textContent
            );
          }
          break;
        }
        case 'Escape': {
          e.preventDefault();
          setIsOpen(false);
          selectRef.current.querySelector('[role="combobox"]').focus();
          break;
        }
        case 'Tab': {
          setIsOpen(false);
          break;
        }
        default:
          break;
      }
    };

    const element = selectRef.current;
    if (element) {
      element.addEventListener('keydown', handleKeyDown);
      return () => element.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, value]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleOptionSelect = (newValue, label) => {
    setIsOpen(false);
    setSelectedLabel(label);
    
    if (onChange) {
      onChange({
        target: {
          name,
          value: newValue,
          type: 'select-one',
        },
      });
    }
    
    if (onBlur) {
      onBlur({
        target: {
          name,
          value: newValue,
        },
      });
    }
  };

  // Renderizamos el dropdown con React Portal para posicionarlo de forma flotante
  const dropdown = isOpen && selectRef.current
    ? ReactDOM.createPortal(
        <div
          ref={(node) => {
            dropdownRef.current = node;
          }}
          id={`${id}-dropdown`}
          role="listbox"
          className={`
            z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg
            max-h-60 overflow-auto py-1 transition-all duration-200 ease-out
          `}
          style={{
            position: 'absolute',
            width: selectRef.current.getBoundingClientRect().width,
            top: selectRef.current.getBoundingClientRect().bottom + window.scrollY,
            left: selectRef.current.getBoundingClientRect().left,
            backgroundColor: 'white',
            padding: '5px',
            borderRadius: '0.7em',
            maxHeight: '50vh',
            overflow: 'auto'
          }}
        >
          {React.Children.map(children, (child) => {
            if (!React.isValidElement(child)) return null;
            const isSelected = child.props.value === value;
            return (
              <div
                key={child.props.value}
                role="option"
                aria-selected={isSelected}
                data-value={child.props.value}
                style={{ paddingBottom: '10px' }}
                className={`
                  px-4 py-2 cursor-pointer transition-colors duration-150
                  ${isSelected ? 'bg-blue-500 text-white' : 'hover:bg-gray-100 hover:text-gray-900'}
                  whitespace-nowrap
                `}
                onClick={() => handleOptionSelect(child.props.value, child.props.children)}
                onMouseEnter={(e) => e.currentTarget.focus()}
                tabIndex={-1}
              >
                {child.props.children}
              </div>
            );
          })}
        </div>,
        document.body
      )
    : null;

  return (
    <div
      ref={selectRef}
      className={`relative ${className || ''}`}
      style={{ ...style, minWidth: '120px' }}
      {...props}
    >
      <div
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        aria-disabled={disabled}
        className={`
          w-full px-4 py-2 pr-8 border rounded-md bg-white text-gray-700
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'cursor-pointer'}
          flex items-center justify-between transition-all duration-200
          hover:border-gray-400 hover:shadow-sm
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
        onClick={handleToggle}
        tabIndex={disabled ? -1 : 0}
      >
        <span className="truncate">
          {selectedLabel || 'Seleccione una opción'}
        </span>
        <svg
          style={{ width: '10px', height: '20px' }}
          className={`w-5 h-5 ml-2 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {dropdown}
    </div>
  );
};

Select.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node,
  placeholder: PropTypes.string,
  style: PropTypes.object,
};

export default Select;

