const BackgroundColorManager = {
    colors: {
        backgroundColor1: '#060606',
        backgroundColor2: '#0c283f',
        backgroundColor3: '#1d6188',
        backgroundColor4: '#2b95c8',
        backgroundColor5: '#2bc6c8',
    },

    // Método para actualizar un color
    updateColor: function (colorClass, hexValue) {
        if (this.colors[colorClass] && /^#([0-9A-F]{3}){1,2}$/i.test(hexValue)) {
            this.colors[colorClass] = hexValue;
            return true; // Indica que la actualización fue exitosa
        }
        return false; // Indica que hubo un error
    },

    // Método para obtener todos los colores
    getColors: function () {
        return this.colors;
    },
};

export default BackgroundColorManager;