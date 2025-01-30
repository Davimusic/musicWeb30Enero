const toggleContainerSize = (containerIds, transitionClass) => {
    containerIds.forEach(id => {
        const container = document.getElementById(id);
        if (container) {
            const isShrunk = container.getAttribute('data-shrunk') === 'true';

            if (isShrunk) {
                // Expandir el contenedor
                container.style.height = '100%';
                container.style.width = '100%';
                container.style.overflow = 'visible';
                container.setAttribute('data-shrunk', 'false');
            } else {
                // Contraer el contenedor
                container.style.height = '0px';
                container.style.width = '0px';
                container.style.overflow = 'hidden';
                container.setAttribute('data-shrunk', 'true');
            }
            container.classList.add(transitionClass);
        }
    });
};

export default toggleContainerSize