import React, { useState, useEffect } from 'react';
import GlassIcon from './glassIcon'; // Asegúrate de que la ruta sea correcta
import { searchTagInDb } from '@/functions/music/searchTagInDb'; // Asegúrate de que la ruta sea correcta
import Modal from './modal'; // Asegúrate de que la ruta sea correcta
'../../estilos/general/general.css'

const SearchTagInDb = ({ path, setContent, setMusicContent }) => {
    const [searchResults, setSearchResults] = useState('');
    const [showModal, setShowModal] = useState(false);

    async function reponse(tag, setContent, setMusicContent) {
        const result = await searchTagInDb(tag, setContent, setMusicContent);
        setShowModal(result === false ? true : false);
    }

    useEffect(() => {
        if (path) {
            setSearchResults(path);
            reponse(path, setContent, setMusicContent);
        }
    }, [path]);

    return (
        <>
            <input 
                type="text" 
                placeholder="Search" 
                value={searchResults}
                style={{
                    width: '50vw',
                    padding: '5px',
                    border: 'none',
                    borderRadius: '10px',
                    outline: 'none',
                }}
                onChange={(e) => setSearchResults(e.target.value)} 
            />
            <GlassIcon onClick={() => reponse(searchResults, setContent, setMusicContent)} style={{ marginLeft: '5px', color: '#fff' }} />
            
            {showModal && (
                <Modal isOpen={true} onClose={() => setShowModal(false)}>
                    <div style={{ padding: '20px' }}>
                        <p>No results were found for the tag: {searchResults}</p>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default SearchTagInDb;

