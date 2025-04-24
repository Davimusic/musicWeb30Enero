import { connectToDatabase } from './connectToDatabase';

// Función para transformar el correo, reemplazando "@" y "." por "_"
function sanitizeEmail(email) {
  return email.replace(/[@.]/g, '_');
}

export default async function getAllDAWSampleCategories(req, res) {
  try {
    const { user } = req.body;
    
    if (!user || !user.email) {
      return res.status(400).json({ message: "User information is required" });
    }

    const db = await connectToDatabase();
    const collection = db.collection('SamplesCollection');
    const container = await collection.findOne({ _id: "samplesContainer" });
    
    // Convertir el correo al formato usado en la DB
    const sanitizedEmail = sanitizeEmail(user.email);
    
    // Primero se busca en los samples públicos
    let userContent = container?.publicSamples?.[sanitizedEmail];

    // Si no se encontró en públicos, buscar en userSamples directamente (no dentro de "personal")
    if (!userContent || Object.keys(userContent).length === 0) {
      userContent = container?.userSamples?.[sanitizedEmail] || {};
    }
    
    // Si aún se sigue sin encontrar información, se retorna un error 404
    if (!userContent || Object.keys(userContent).length === 0) {
      return res.status(404).json({ message: "No samples found for this user" });
    }
    
    // Retornar únicamente la llave (correo sanitizado) con su contenido
    return res.status(200).json({ [sanitizedEmail]: userContent });
    
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

