import React, { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
//import Modal from './Modal'; // Importa el componente Modal existente
//import ColorPickerModalContent from './ColorPickerModalContent'; // Importa el nuevo componente
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import '../../estilos/general/general.css';
import checkUserName from '@/functions/music/checkUserName';

const Menu = ({ isOpen, onClose, className = '', openUpdateBackgroundColor }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userImage, setUserImage] = useState('');
    const [userMyLikes, setUserMyLikes] = useState([]);
    const router = useRouter();

    // State to store current colors
    const [colors, setColors] = useState({
        backgroundColor1: '',
        backgroundColor2: '',
        backgroundColor3: '',
        backgroundColor4: '',
        backgroundColor5: '',
    });

    // Get user data from sessionStorage
    useEffect(() => {
        const name = sessionStorage.getItem('userName') || '';
        const image = sessionStorage.getItem('userImage') || '';
        const myLikes = sessionStorage.getItem('userMyLikes') || '';
        setUserName(name);
        setUserImage(image);
        setUserMyLikes(myLikes)
    }, []);

    // Get colors from CSS variables
    useEffect(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const newColors = {
            backgroundColor1: rootStyles.getPropertyValue('--backgroundColor1').trim(),
            backgroundColor2: rootStyles.getPropertyValue('--backgroundColor2').trim(),
            backgroundColor3: rootStyles.getPropertyValue('--backgroundColor3').trim(),
            backgroundColor4: rootStyles.getPropertyValue('--backgroundColor4').trim(),
            backgroundColor5: rootStyles.getPropertyValue('--backgroundColor5').trim(),
        };
        setColors(newColors);
    }, []);

    // Function to update a color
    const updateColor = (colorClass, hexValue) => {
        if (/^#([0-9A-Fa-f]{3}){1,2}$/i.test(hexValue)) {
            const updatedColors = { ...colors, [colorClass]: hexValue };
            setColors(updatedColors);
            document.documentElement.style.setProperty(`--${colorClass}`, hexValue);
            return true;
        }
        return false;
    };

    // Function to handle logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            sessionStorage.removeItem('userName');
            sessionStorage.removeItem('userImage');
            router.push('/');
            onClose();
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    // Prevent click propagation to child elements
    const handleMenuClick = (e) => e.stopPropagation();

    return (
        <>
            {/* Side menu */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: isOpen ? 0 : '-300px',
                    width: '300px',
                    height: '100vh',
                    zIndex: 9990,
                    transition: 'left 0.3s ease, visibility 0.3s ease, opacity 0.3s ease',
                    padding: '20px',
                    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.5)',
                    visibility: isOpen ? 'visible' : 'hidden',
                    opacity: isOpen ? 1 : 0,
                }}
                className={className}
                onClick={onClose}
            >
                <div onClick={handleMenuClick}>
                    <p className='title-sm color2' style={{ margin: 0 }}>{userMyLikes}</p>
                    <p className='title-md color2' style={{ marginBottom: '20px' }}>Menu</p>
                    {userName && (
                        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                            {userImage && (
                                <img 
                                    src={userImage} 
                                    alt="User" 
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
                                />
                            )}
                            <p className='title-sm color2' style={{ margin: 0 }}>{userName}</p>
                        </div>
                    )}
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Home', 'Explore', 'Favorites', 'Settings'].map((item, index) => (
                            <li key={index} style={{ marginBottom: '15px' }}>
                                <a href="#" style={{ textDecoration: 'none' }} className='title-sm color2'>{item}</a>
                            </li>
                        ))}
                        <li style={{ marginBottom: '15px' }}>
                            <p onClick={() => openUpdateBackgroundColor()} className='title-sm color2'>Change background color</p>
                        </li>
                        <li style={{ marginBottom: '15px' }}>
                            <p onClick={handleLogout} className='title-sm color2' style={{ cursor: 'pointer' }}>Log out</p>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Overlay to close the menu */}
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


        </>
    );
};

export default Menu;

/**
 * 
 <Modal className={'backgroundColor2 color2'} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
 <ColorPickerModalContent
     colors={colors}
     onUpdateColor={updateColor}
     onClose={() => setIsModalOpen(false)}
 />
</Modal>
 */