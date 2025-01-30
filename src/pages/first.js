"use client";
// src/pages/WordViewer.js
import { Menu } from '@/components/menu';
import handleMenuActivation from '@/functions/utils/menuUtils';
import validateMultipurposeAccess from '@/functions/security/validateMultipurposeAccess';
import { useState, useEffect } from "react";
import '../estilos/general/general.css'

import { useRouter } from 'next/router';

const WordViewer = () => {
    
    const router = useRouter();
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        setHasAccess(validateMultipurposeAccess('loggingStatus', true));
    }, []);

    if (!hasAccess) {
        return <div style={{backgroundColor: 'red'}}>No tienes acceso para ver este contenido.</div>;
    }

    return (
        <Menu>
            <div className='' style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <iframe 
                    src="https://docs.google.com/gview?url=https://res.cloudinary.com/dplncudbq/raw/upload/v1725627563/planFelipeMusical/MANUAL_Ministerio_Alabanza_Adoracio%CC%81n_ICCESE_zzfq1x.docx&embedded=true" 
                    style={{ width: '90vw', height: '90vh', border: 'none', backgroundColor: 'transparent' }}
                    title="Word Document Viewer"
                    className='borders1'
                ></iframe>
            </div>
        </Menu>
    );
};

export default WordViewer;