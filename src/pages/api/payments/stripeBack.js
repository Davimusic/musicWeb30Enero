// pages/api/create-payment-intent.js
import Stripe from "stripe";

// Usar directamente la clave secreta (esto es solo para pruebas; luego usa variables de entorno)
const stripe = new Stripe("clavesecreta");

export default async function stripeBack(req, res) {
  if (req.method === "POST") {
    const { amount } = req.body; // El monto debe venir en centavos (ejemplo: $10.00 ⇒ 1000)
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
      });
      res.status(200).json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error creando el PaymentIntent:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader("Allow", "POST");
    res.status(405).end("Method Not Allowed");
  }
}
