import { connectToDatabase } from "./connectToDatabase";

export default async function verifyUser(req, res) {
  const db = await connectToDatabase();
  const collection = db.collection('planFelipeMusical');

  // Obtener user y password del cuerpo de la solicitud
  const { user, password } = req.body;

  try {
    // Buscar el usuario por correo
    const existingUser = await collection.findOne({ correo: user });

    if (existingUser) {
      // Verificar si la contraseña es correcta
      if (existingUser.password === password) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al verificar el usuario en la base de datos:', error);
    return res.status(500).json({ error: 'Error al verificar el usuario en la base de datos' });
  }
}









/*import { connectToDatabase } from "./connectToDatabase";

export default async function createUser(req, res) {
  const db = await connectToDatabase();
  const collection = db.collection('planFelipeMusical');

  // Obtener user y password del cuerpo de la solicitud
  const { user, password } = req.body;

  try {
    // Crea un nuevo usuario con los datos proporcionados
    const newUser = {
      correo: user,
      password: password,
    };
    const result = await collection.insertOne(newUser);

    // Responde al cliente con el nuevo usuario
    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al guardar el usuario en la base de datos:', error);
    return res.status(500).json({ error: 'Error al guardar el usuario en la base de datos' });
  }
}*/






