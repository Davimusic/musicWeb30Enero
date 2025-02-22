// components/PayPalButton.js
import { useEffect, useState } from "react";
import { loadScript } from "@paypal/paypal-js";

const PayPalButton = () => {
  const [paypalLoaded, setPaypalLoaded] = useState(false);

  useEffect(() => {
    // Cargar la SDK de PayPal
    loadScript({ "client-id": "AfRslansxPG4byyTIVuoNn1Arfu4Z3DRvvBLD3DSaFP18hNrXFHkr8S7Uu2GgWdjwmCmkpioHVZhKeXd", currency: "USD" })
      .then((paypal) => {
        setPaypalLoaded(true);
        paypal
          .Buttons({
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: "10.00", // Monto del pago
                    },
                  },
                ],
              });
            },
            onApprove: (data, actions) => {
              return actions.order.capture().then((details) => {
                alert("Pago completado por " + details.payer.name.given_name);
                // Aquí puedes manejar la lógica post-pago en el frontend
              });
            },
            onError: (err) => {
              console.error("Error en el pago:", err);
              alert("Hubo un error al procesar el pago.");
            },
          })
          .render("#paypal-button-container"); // Renderizar el botón en este contenedor
      })
      .catch((err) => {
        console.error("Error al cargar la SDK de PayPal", err);
      });
  }, []);

  return (
    <div>
      {!paypalLoaded && <p>Cargando PayPal...</p>}
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalButton; 