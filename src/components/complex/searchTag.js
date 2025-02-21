import React, { useState, useEffect, useRef } from 'react';
import GlassIcon from './glassIcon';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import Modal from './modal';

const SearchTagInDb = ({ path, setContent, setMusicContent, setIsEndedVideo, componentInUse, setTags, tags }) => {
    const [searchResults, setSearchResults] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    // Función para manejar la búsqueda
    const handleSearch = async (tag, setContent, setMusicContent) => {
        setIsSearching(true);
        const result = await searchTagInDb(tag, setContent, setMusicContent, setTags);
        setIsSearching(false);

        if (componentInUse === 'video' && result === true) {
            setIsEndedVideo(true);
        }

        setShowModal(result === false);
    };

    // Función para manejar cambios en el input
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchResults(value);

        // Filtrar sugerencias basadas en lo que el usuario escribe
        const filteredSuggestions = tags.filter(tag => 
            tag.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    };

    // Función para manejar la selección de una sugerencia
    const handleSuggestionClick = (suggestion) => {
        setSearchResults(suggestion); // Actualizar el input con la sugerencia seleccionada
        setSuggestions([]); // Ocultar sugerencias al seleccionar una
        inputRef.current.focus(); // Mantener el foco en el input
    };

    // Efecto para manejar el foco y el clic fuera del input/sugerencias
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                inputRef.current && 
                !inputRef.current.contains(e.target) && 
                suggestionsRef.current && 
                !suggestionsRef.current.contains(e.target)
            ) {
                setSuggestions([]); // Ocultar sugerencias si se hace clic fuera
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Efecto para manejar cambios en `path`
    useEffect(() => {
        if (path) {
            setSearchResults(path);
            handleSearch(path, setContent, setMusicContent);
        }
    }, [path]);

    // Estilos locales
    const styles = {
        container: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%', // Ocupa el 100% del ancho disponible
            maxWidth: '50vw', // Limita el ancho máximo en pantallas grandes
        },
        input: {
            flex: 1, // Ocupa el 70% del espacio disponible
            width: '70%', // Ancho reducido en un 30%
            padding: '5px',
            border: 'none',
            borderRadius: '10px',
            outline: 'none',
            fontFamily: 'Montserrat Alternates, sans-serif',
            fontSize: '1rem', // Tamaño de fuente responsivo
        },
        icon: {
            marginLeft: '10px', // Espacio entre el input y el icono
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.5rem', // Tamaño del icono responsivo
        },
        spinAnimation: {
            animation: 'spin 1s linear infinite',
        },
        '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
        },
        modalText: {
            fontFamily: 'Roboto Slab, sans-serif',
        },
    };

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Dancing+Script&family=Montserrat+Alternates:ital,wght@0,300;1,100&family=PT+Serif:ital@1&family=Playfair+Display:ital,wght@1,500&family=Roboto+Slab:wght@100..900&family=Rubik+Vinyl&display=swap');

                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }

                    input::placeholder {
                        font-family: 'Caprasimo', sans-serif;
                    }

                    .suggestions {
                        position: absolute;
                        background: #fff;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        width: 70%; // Mismo ancho que el input
                        max-height: 150px;
                        overflow-y: auto;
                        z-index: 1000;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        top: 100%; // Se posiciona debajo del input
                        margin-top: 5px;
                    }

                    .suggestion-item {
                        padding: 10px;
                        cursor: pointer;
                        color: #333;
                        font-family: 'Montserrat Alternates', sans-serif;
                        font-weight: bold; // Negrilla
                    }

                    .suggestion-item:hover {
                        background-color: #f0f0f0;
                    }

                    /* Estilos responsivos */
                    @media (max-width: 768px) {
                        .container {
                            max-width: 90vw; // Más ancho en móviles
                        }

                        .input {
                            width: 60%; // Ancho reducido en móviles
                            font-size: 0.9rem; // Tamaño de fuente más pequeño en móviles
                        }

                        .icon {
                            font-size: 1.2rem; // Tamaño del icono más pequeño en móviles
                        }
                    }
                `}
            </style>

            <div style={styles.container}>
                <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchResults}
                    style={styles.input}
                    onChange={handleInputChange}
                    onFocus={() => setIsInputFocused(true)}
                    onBlur={() => setIsInputFocused(false)}
                    ref={inputRef}
                />
                <GlassIcon 
                    onClick={() => handleSearch(searchResults, setContent, setMusicContent)} 
                    style={isSearching ? { ...styles.icon, ...styles.spinAnimation } : styles.icon}
                />
                
                {suggestions.length > 0 && isInputFocused && (
                    <div className="suggestions" ref={suggestionsRef}>
                        {suggestions.map((suggestion, index) => (
                            <div 
                                key={index} 
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                {suggestion}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {showModal && (
                <Modal isOpen={true} onClose={() => setShowModal(false)}>
                    <div style={{ padding: '20px' }}>
                        <p style={styles.modalText}>No results were found for the tag: {searchResults}</p>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default SearchTagInDb;








