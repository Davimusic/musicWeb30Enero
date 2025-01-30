const handleMenuActivation = (setIsMenuOpen) => (isOpen) => {
    setIsMenuOpen(isOpen);
    console.log(isOpen ? 'El menú se ha abierto.' : 'El menú se ha cerrado.');
};

export default handleMenuActivation;


