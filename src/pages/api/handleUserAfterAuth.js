import { connectToDatabase } from './connectToDatabase';

export default async function handleUserAfterAuth(req, res) {
  const db = await connectToDatabase();
  const collection = db.collection('users'); // Colección principal
  const { uid, email, authType } = req.body; // authType puede ser 'login' o 'signIn'

  try {
    console.log('Handling user after auth:', uid, email, authType); // Depuración

    // Buscar el documento principal
    const mainDoc = await collection.findOne({});
    if (!mainDoc) {
      console.error('Main document not found in the database.'); // Depuración
      return res.status(404).json({ 
        success: false, 
        message: 'Main document not found in the database.' 
      });
    }

    // Verificar si el usuario ya existe en el objeto "users"
    const userExists = mainDoc.users && mainDoc.users[uid];

    if (userExists) {
      // Si el usuario ya existe
      console.log('User already exists in the database:', uid); // Depuración
      return res.status(200).json({ 
        success: true, 
        message: 'User already exists.', 
        user: mainDoc.users[uid]
      });
    } else {
      // Si el usuario no existe, crear un nuevo objeto y agregarlo al objeto "users"
      const newUser = {
        uid,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        compositions: [] // Puedes agregar más campos según sea necesario
      };

      // Actualizar el documento principal para agregar el nuevo usuario al objeto "users"
      await collection.updateOne(
        { _id: mainDoc._id }, // Filtro para encontrar el documento principal
        { $set: { [`users.${uid}`]: newUser } } // Agregar el nuevo usuario al objeto "users"
      );

      console.log('New user created in the database:', newUser); // Depuración
      return res.status(201).json({ 
        success: true, 
        message: 'User created successfully.', 
        user: newUser 
      });
    }
  } catch (error) {
    console.error('Error handling user after auth:', error); // Depuración
    return res.status(500).json({ 
      success: false, 
      error: 'Error handling user after auth',
      details: error.message // Detalles del error
    });
  }
}