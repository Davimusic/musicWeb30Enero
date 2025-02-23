import React, { useState, useEffect, useRef } from 'react';
import GlassIcon from './glassIcon';
import { searchTagInDb } from '@/functions/music/searchTagInDb';
import Modal from './modal';

const SearchTagInDb = ({ path, setContent, setMusicContent, setIsEndedVideo, componentInUse, setTags, tags, setIsModalOpen, setContentModal }) => {
    const [searchResults, setSearchResults] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const handleSearch = async (tag, setContent, setMusicContent) => {
        setIsSearching(true);
        const result = await searchTagInDb(tag, setContent, setMusicContent, setTags);
        setIsSearching(false);

        if (componentInUse === 'video' && result === true) {
            setIsEndedVideo(true);
        }

        if(result === false){
            setIsModalOpen(true)
            setContentModal(<p style={{padding: '30px'}}>No results were found for the tag: {searchResults}</p>)
        }
        //setShowModal(result === false);
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchResults(value);

        const filteredSuggestions = tags.filter(tag => 
            tag.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchResults(suggestion);
        setSuggestions([]);
        inputRef.current.focus();
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                inputRef.current && 
                !inputRef.current.contains(e.target) && 
                suggestionsRef.current && 
                !suggestionsRef.current.contains(e.target)
            ) {
                setSuggestions([]);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (path) {
            setSearchResults(path);
            handleSearch(path, setContent, setMusicContent);
        }
    }, [path]);

    const styles = {
        container: {
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: '50vw',
        },
        input: {
            flex: 1,
            width: '70%',
            padding: '5px',
            border: 'none',
            borderRadius: '10px',
            outline: 'none',
            fontFamily: 'Montserrat Alternates, sans-serif',
            fontSize: '1rem',
        },
        icon: {
            marginLeft: '10px',
            color: '#fff',
            cursor: 'pointer',
            fontSize: '1.5rem',
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
                        width: 70%;
                        max-height: 150px;
                        overflow-y: auto;
                        z-index: 1000;
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

                        .input {
                            width: 60%;
                            font-size: 0.9rem;
                        }

                        .icon {
                            font-size: 1.2rem;
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
                    ref={inputRef}
                />
                <GlassIcon 
                    onClick={() => {
                        handleSearch(searchResults, setContent, setMusicContent);
                        setSuggestions([]); // Ocultar sugerencias al hacer clic en el icono de búsqueda
                    }} 
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
            
            
        </>
    );
};

export default SearchTagInDb;








