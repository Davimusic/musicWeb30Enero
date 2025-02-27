import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful'; // Importar el selector de colores
import Modal from './modal';
import { useRouter } from 'next/navigation'; // Importa useRouter de Next.js
import { signOut } from 'firebase/auth'; // Importa signOut de Firebase
import { auth } from '../../../firebase'
import '../../estilos/general/general.css';

const Menu = ({ isOpen, onClose, className = '' }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedColorClass, setSelectedColorClass] = useState('backgroundColor1');
    const [selectedColor, setSelectedColor] = useState('#060606'); // Color seleccionado
    const [userName, setUserName] = useState('');
    const [userImage, setUserImage] = useState('');
    const router = useRouter(); // Usa useRouter para redirecciones

    // Objeto para manejar los colores de fondo
    const [colors, setColors] = useState({
        backgroundColor1: '#060606',
        backgroundColor2: '#0c283f',
        backgroundColor3: '#1d6188',
        backgroundColor4: '#2b95c8',
        backgroundColor5: '#2bc6c8',
    });

    // Efecto para cargar los datos del usuario desde sessionStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            const name = sessionStorage.getItem('userName') || '';
            const image = sessionStorage.getItem('userImage') || '';
            setUserName(name);
            setUserImage(image);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Función para manejar el logout
    const handleLogout = async () => {
        try {
            await signOut(auth); // Cierra la sesión en Firebase
            sessionStorage.removeItem('userName'); // Limpiar sessionStorage al cerrar sesión
            sessionStorage.removeItem('userImage');
            router.push('/'); // Redirige a la página de login
            onClose(); // Cierra el menú
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Método para obtener el valor actual de una variable CSS
    const getCurrentColorValue = (colorClass) => {
        return getComputedStyle(document.documentElement).getPropertyValue(`--${colorClass}`).trim();
    };

    // Efecto para actualizar el color seleccionado cuando cambia la clase
    useEffect(() => {
        const currentColor = getCurrentColorValue(selectedColorClass);
        setSelectedColor(currentColor);
    }, [selectedColorClass]);

    // Método para actualizar un color
    const updateColor = (colorClass, hexValue) => {
        if (/^#([0-9A-Fa-f]{3}){1,2}$/i.test(hexValue)) {
            const updatedColors = { ...colors, [colorClass]: hexValue };
            setColors(updatedColors);
            return true; // Indica que la actualización fue exitosa
        }
        return false; // Indica que hubo un error
    };

    // Método para manejar la actualización del color
    const handleUpdateColor = () => {
        const success = updateColor(selectedColorClass, selectedColor);
        if (success) {
            // Actualizar la variable CSS correspondiente en el DOM
            document.documentElement.style.setProperty(`--${selectedColorClass}`, selectedColor);
            setIsModalOpen(false);
        } else {
            alert('Error: Valor hexadecimal no válido.');
        }
    };

    // Método para evitar que el clic se propague a los elementos hijos
    const handleMenuClick = (e) => {
        e.stopPropagation(); // Evita que el clic se propague al contenedor del menú
    };

    return (
        <>
            {/* Menú lateral */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isOpen ? 0 : '-300px', // Desplazamiento del menú
                    width: '300px',
                    height: '100vh',
                    zIndex: 9990,
                    transition: 'left 0.3s ease, visibility 0.3s ease, opacity 0.3s ease',
                    padding: '20px',
                    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.5)',
                    visibility: isOpen ? 'visible' : 'hidden', // Ocultar completamente el menú
                    opacity: isOpen ? 1 : 0, // Hacer el menú transparente cuando esté cerrado
                }}
                className={className}
                onClick={onClose} // Cerrar el menú al hacer clic en cualquier parte del contenedor
            >
                <div onClick={handleMenuClick}> {/* Evita que el clic se propague al contenedor del menú */}
                    <p className='title-md' style={{ marginBottom: '20px' }}>Menú</p>
                    {/* Mostrar nombre e imagen del usuario si están disponibles */}
                    {userName && (
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                            {userImage && (
                                <img 
                                    src={userImage} 
                                    alt="User" 
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                />
                            )}
                            <p className='title-sm' style={{ margin: 0 }}>{userName}</p>
                        </div>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        <li style={{ marginBottom: '15px' }}>
                            <a href="#" style={{textDecoration: 'none', color: 'white'}} className='title-sm'>Inicio</a>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <a href="#" style={{textDecoration: 'none', color: 'white'}} className='title-sm'>Explorar</a>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <a href="#" style={{textDecoration: 'none', color: 'white'}} className='title-sm'>Favoritos</a>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <a href="#" style={{textDecoration: 'none', color: 'white'}} className='title-sm'>Configuración</a>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <p onClick={() => setIsModalOpen(true)} className='title-sm'>Cambiar color de fondo</p>
                        </li>
                        {/* Botón de Logout */}
                        <li style={{ marginBottom: '15px' }}>
                            <p onClick={handleLogout} className='title-sm' style={{ cursor: 'pointer', color: 'white' }}>
                                Cerrar sesión
                            </p>
                        </li>
                    </ul>
                </div>
            </div>
            {/* Overlay para cerrar el menú */}
            {isOpen && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                    }}
                    onClick={onClose}
                />
            )}
            {/* Modal para cambiar el color de fondo */}
            <Modal className={'backgroundColor2'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <div style={{padding: '30px'}}>
                    <p className='title-md'>Actualizar color de fondo</p>
                    <div style={{ marginBottom: '20px' }}>
                        <label className='text-general' style={{ marginRight: '10px' }}>Selecciona un color:</label>
                        <select 
                            className='text-general'
                            value={selectedColorClass} 
                            onChange={(e) => setSelectedColorClass(e.target.value)}
                            style={{ padding: '5px', borderRadius: '4px' }}
                        >
                            <option value="backgroundColor1">Color 1</option>
                            <option value="backgroundColor2">Color 2</option>
                            <option value="backgroundColor3">Color 3</option>
                            <option value="backgroundColor4">Color 4</option>
                            <option value="backgroundColor5">Color 5</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label className='text-general' style={{ marginRight: '10px' }}>Color seleccionado:</label>
                        {/* Usar HexColorPicker en lugar del input de tipo color */}
                        <HexColorPicker 
                            color={selectedColor} 
                            onChange={setSelectedColor} 
                            style={{ marginBottom: '20px' }}
                        />
                    </div>
                    <button 
                        className='backgroundColor3 text-general'
                        onClick={handleUpdateColor}
                        style={{ padding: '10px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Actualizar color
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default Menu;