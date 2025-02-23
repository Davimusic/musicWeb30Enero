/*import { signIn } from 'next-auth/react';

export default function Content() {
    return (
        <div style={{height:'100%'}}>
            <button onClick={() => signIn('google')}>Iniciar sesión con Google</button>
        </div>
    );
}*/








import React from 'react';
import { useEffect } from "react";
import RenderElement from '@/functions/renderElement';
import LoginMold from '@/molds/login';
import '../estilos/general/general.css'

export function Content() {  
     
    return (
    <div style={{height:'100%'}}>
            {RenderElement(LoginMold())}
        </div>
    );
}




