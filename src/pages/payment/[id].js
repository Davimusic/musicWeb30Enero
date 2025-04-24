/*/ pages/notFound.js o donde desees integrarlo
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import StripeButton from "@/components/complex/stripeButton";

const stripePromise = loadStripe("pk_test_51Mm2l3Hb6LFSD03O1seZ4YYZlm5E6pJAzYlOs4H8i1KbrzlGENHjav7f7MsWhbn9P0UwZbxxLvuGZuU7KAUXrtAt00GctWWZFu");

const NotFound = () => {
  return (
    <Elements stripe={stripePromise}>
      <StripeButton amount={10.00} />
    </Elements>
  );
};

export default NotFound;
*/



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
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          minHeight: '90vh', 
          width: '90vw',
          maxWidth: '1200px',
          gap: '2em',
          flexWrap: 'wrap',
        }}
      >
        {/* Contenedor de PayPal */}
        <div 
          className="paypal-container backgroundColor3" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            height: '80vh',
            borderRadius: '0.7em',
            padding: '1em',
            overflowY: 'auto',
            scrollbarWidth: 'none',
          }}
        >
          <style>{`
            .backgroundColor3::-webkit-scrollbar {
              display: none; 
            }

            @media (max-width: 768px) {
              .container {
                display: block; 
              }

              .paypal-container {
                width: 100%; 
                height: auto; 
                margin-bottom: 2em; 
              }
            }
          `}</style>
          <PayPalButton/>
        </div>

        {/* Contenedor de la descripción */}
        <div 
          className="backgroundColor3"
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'flex-start',
            flex: 1,
            height: '80vh',
            borderRadius: '0.7em',
            padding: '1em',
            overflowY: 'auto',
            minWidth: '300px',
            scrollbarWidth: 'none',
          }}
        >
          <style>{`
            .backgroundColor3::-webkit-scrollbar {
              display: none; 
            }
          `}</style>
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




