import PayPalButton from "@/components/complex/paypalButton";
import '../../estilos/general/general.css';
import React from 'react';

const NotFound = () => {
  return (
    <div 
      className="backgroundColor2"
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh', 
        padding: '1em', 
      }}
    >
      <div 
        className="container"
        style={{ 
          display: 'flex', 
          flexDirection: 'row', // Por defecto, disposición en fila
          justifyContent: 'space-between', // Espacio entre las columnas
          alignItems: 'stretch', // Asegura que ambas columnas tengan la misma altura
          minHeight: '90vh', 
          width: '90vw', // Ancho del contenedor principal
          maxWidth: '1200px', // Ancho máximo para evitar que se expanda demasiado
          gap: '2em', // Espacio entre las columnas
          flexWrap: 'wrap', // Permitir que los elementos se envuelvan en pantallas pequeñas
        }}
      >
        {/* Columna izquierda: Contenido (PayPal) */}
        <div 
          className="paypal-container backgroundColor3" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', // Alinear contenido al inicio
            height: '80vh', // Altura fija para el contenedor
            borderRadius: '0.7em',
            padding: '1em',
            overflowY: 'auto', // Scroll independiente para esta columna
            scrollbarWidth: 'none', // Ocultar barra de scroll en Firefox
          }}
        >
          {/* Estilos para ocultar la barra de scroll en WebKit (Chrome, Safari, Edge) */}
          <style>
            {`
              .backgroundColor3::-webkit-scrollbar {
                display: none; /* Ocultar barra de scroll */
              }

              /* Estilos para móviles */
              @media (max-width: 768px) {
                .container {
                  display: block; /* Cambia a bloque en móviles */
                }

                .paypal-container {
                  width: 100%; /* Ocupa el 100% del ancho en móviles */
                  height: auto; /* Altura automática */
                  margin-bottom: 2em; /* Espacio debajo del contenedor */
                }
              }
            `}
          </style>
          <PayPalButton/>
        </div>

        {/* Columna derecha: Descripción */}
        <div 
          className="backgroundColor3"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start', // Alinear contenido al inicio
            flex: 1, // Ocupa el espacio disponible
            height: '80vh', // Altura fija para el contenedor
            borderRadius: '0.7em',
            padding: '1em',
            overflowY: 'auto', // Scroll independiente para esta columna
            minWidth: '300px', // Ancho mínimo para evitar que se encoja demasiado
            scrollbarWidth: 'none', // Ocultar barra de scroll en Firefox
          }}
        >
          {/* Estilos para ocultar la barra de scroll en WebKit (Chrome, Safari, Edge) */}
          <style>
            {`
              .backgroundColor3::-webkit-scrollbar {
                display: none; /* Ocultar barra de scroll */
              }
            `}
          </style>
          <h2>Descripción de la venta</h2>
          <p>
            Este es un texto de prueba que describe lo que se está vendiendo.
            Puedes agregar más detalles aquí, como características del producto,
            precios, o cualquier información relevante.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;



