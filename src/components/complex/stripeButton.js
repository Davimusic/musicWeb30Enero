// components/complex/stripeButton.js
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { useState } from "react";

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#424770",
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const StripeButton = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    // Llama a la API de Next.js para generar el PaymentIntent
    const response = await fetch("/api/payments/stripeBack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(amount * 100) }), // monto en centavos
    });
    
    const data = await response.json();
    const clientSecret = data.clientSecret;

    // Confirma el pago usando el clientSecret obtenido
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
    });

    setLoading(false);

    if (error) {
      console.error("Error en el pago:", error);
      alert("Error en el pago: " + error.message);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      alert("¡Pago exitoso!");
    }
  };

  return (
    <div style={{
      maxWidth: '450px',
      margin: '2em auto',
      padding: '2em',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
      backgroundColor: '#fff'
    }}>
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2em',
      }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Proceso de Pago</h2>
        <div style={{
          padding: '1em',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <button
          type="submit"
          disabled={!stripe || loading}
          style={{
            padding: '12px',
            backgroundColor: '#6772e5',
            border: 'none',
            borderRadius: '4px',
            color: '#fff',
            fontSize: '16px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#5469d4'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#6772e5'}
        >
          {loading ? 'Procesando...' : `Pagar $${amount}`}
        </button>
      </form>
    </div>
  );
};

export default StripeButton;
