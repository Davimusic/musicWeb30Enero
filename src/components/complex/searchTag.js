import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'; // Importa useRouter de Next.js
import GlassIcon from './glassIcon';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import Modal from './modal';
import '../../estilos/general/general.css';

const SearchTagInDb = ({
    path,
    setContent,
    setMusicContent,
    setIsEndedVideo,
    componentInUse,
    setTags,
    tags,
    setIsModalOpen,
    setContentModal,
    setCurrentTimeMedia,
    showComponent
}) => {
    const [searchResults, setSearchResults] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false); // Estado para manejar el enfoque
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);
    const router = useRouter(); // Obtén el objeto router

    const handleSearch = async (tag) => {
        // Navega a la nueva ruta
        router.push(`/music/tag=${tag}?&type=${showComponent}`);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchResults(value);

        // Filtrar sugerencias basadas en lo que el usuario escribe
        const filteredSuggestions = tags.filter((tag) =>
            tag.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchResults(suggestion); // Establecer la sugerencia seleccionada en el input
        setSuggestions([]); // Ocultar las sugerencias

        // Usar setTimeout para asegurar el enfoque
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus(); // Enfocar el input nuevamente
            }
        }, 500);
    };

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

    useEffect(() => {
        if (path) {
            setSearchResults(path); // Establecer el valor inicial del input si hay una ruta
        }
    }, [path]);

    const styles = {
        container: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '50vw',
            borderRadius: '0.7em',
            paddingLeft: '10px',
            paddingRight: '10px',
            paddingTop: '2px',
            padding: '2px',
        },
        inputContainer: {
            flex: 1,
            opacity: isInputFocused ? 1 : 0.2, // Opacidad dinámica para el input y sugerencias
            transition: 'opacity 0.3s ease', // Transición suave
        },
        input: {
            width: '100%',
            padding: '5px',
            border: 'none',
            borderRadius: '10px',
            outline: 'none',
            fontFamily: 'Montserrat Alternates, sans-serif',
            fontSize: '1rem',
            position: 'relative', // Asegura que el input tenga un contexto de apilamiento
            zIndex: 20, // El input debe tener un zIndex mayor que las sugerencias
        },
        icon: {
            marginLeft: '10px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.5rem',
            opacity: 1, // La lupa siempre tiene opacidad del 100%
        },
    };

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Dancing+Script&family=Montserrat+Alternates:ital,wght@0,300;1,100&family=PT+Serif:ital@1&family=Playfair+Display:ital,wght@1,500&family=Roboto+Slab:wght@100..900&family=Rubik+Vinyl&display=swap');

                    .container {
                        position: relative;
                        display: flex;
                        align-items: center;
                        width: 100%;
                        max-width: 50vw;
                        border-radius: 0.7em;
                        padding-left: 10px;
                        padding-right: 10px;
                        padding: 2px;
                    }

                    .input-container {
                        flex: 1;
                        opacity: ${isInputFocused ? 1 : 0.2}; /* Opacidad dinámica */
                        transition: opacity 0.3s ease; /* Transición suave */
                    }

                    input::placeholder {
                        font-family: 'Caprasimo', sans-serif;
                    }

                    input {
                        width: 100%;
                        padding: 5px;
                        border: none;
                        border-radius: 10px;
                        outline: none;
                        font-family: 'Montserrat Alternates', sans-serif;
                        font-size: 1rem;
                        position: relative; /* Asegura que el input tenga un contexto de apilamiento */
                        z-index: 20; /* El input debe tener un zIndex mayor que las sugerencias */
                    }

                    .suggestions {
                        position: absolute;
                        background: #fff;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        width: 100%;
                        max-height: 150px;
                        overflow-y: auto;
                        z-index: 10; /* Asegúrate de que este valor sea menor que el del input */
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        top: 100%;
                        margin-top: 5px;
                    }

                    .suggestion-item {
                        padding: 10px;
                        cursor: pointer;
                        color: #333;
                        font-family: 'Montserrat Alternates', sans-serif;
                        font-weight: bold;
                    }

                    .suggestion-item:hover {
                        background-color: #f0f0f0;
                    }

                    @media (max-width: 768px) {
                        .container {
                            max-width: 90vw;
                        }

                        .input-container {
                            width: 80%; /* Asegura que el input sea visible en móvil */
                        }

                        .icon {
                            margin-left: 0; /* La lupa se mantiene a la derecha */
                            margin-right: 10px; /* Espacio a la derecha */
                        }
                    }

                    .icon {
                        margin-left: 10px;
                        color: #fff;
                        cursor: pointer;
                        font-size: 1.5rem;
                        opacity: 1; /* La lupa siempre tiene opacidad del 100% */
                    }
                `}
            </style>

            <div className='container backgroundColor2' style={styles.container}>
                <div className='' style={styles.inputContainer}>
                    <input
                        type='text'
                        placeholder='Search'
                        value={searchResults}
                        style={styles.input}
                        onChange={handleInputChange}
                        onFocus={() => setIsInputFocused(true)}
                        onBlur={(e) => {
                            setTimeout(() => {
                                if (!e.relatedTarget?.classList.contains('suggestion-item')) {
                                    setIsInputFocused(false);
                                }
                            }, 100); // Retraso de 100ms para evitar conflictos
                        }}
                        ref={inputRef}
                    />
                    {suggestions.length > 0 && isInputFocused && (
                        <div className='suggestions' ref={suggestionsRef}>
                            {suggestions.map((suggestion, index) => (
                                <div
                                    key={index}
                                    className='suggestion-item'
                                    onClick={() => handleSuggestionClick(suggestion)}
                                >
                                    {suggestion}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <GlassIcon
                    onClick={() => {
                        handleSearch(searchResults);
                        setSuggestions([]); // Ocultar sugerencias al hacer clic en el icono de búsqueda
                    }}
                    style={styles.icon}
                />
            </div>
        </>
    );
};

export default SearchTagInDb;








