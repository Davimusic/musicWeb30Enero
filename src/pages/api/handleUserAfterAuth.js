import { getAuth } from 'firebase-admin/auth';
import { connectToDatabase } from './connectToDatabase';
import admin from 'firebase-admin';

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  // Cargar credenciales desde variables de entorno
  const serviceAccount = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Reemplazar saltos de línea
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handleUserAfterAuth(req, res) {
  const db = await connectToDatabase();
  const collection = db.collection('users'); // Colección principal
  const { uid, email, authType } = req.body; // Recibir datos del frontend

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
      // Si el usuario ya existe, actualizar la fecha de modificación
      const updatedUser = {
        ...mainDoc.users[uid], // Mantener los datos existentes del usuario
        updatedAt: new Date(), // Actualizar la fecha de modificación
      };

      // Actualizar el documento principal para actualizar el usuario en el objeto "users"
      const updateResult = await collection.updateOne(
        { _id: mainDoc._id }, // Filtro para encontrar el documento principal
        { $set: { [`users.${uid}`]: updatedUser } } // Actualizar el usuario en el objeto "users"
      );

      console.log('Update result:', updateResult); // Depuración

      if (updateResult.modifiedCount === 0) {
        throw new Error('Failed to update the user.');
      }

      console.log('User updated in the database:', updatedUser); // Depuración
      return res.status(200).json({ 
        success: true, 
        message: 'User updated successfully.', 
        user: updatedUser,
        myLikes: updatedUser.myLikes || [], // Retornar el array myLikes
      });
    } else {
      // Si el usuario no existe, crear un nuevo objeto y agregarlo al objeto "users"
      const newUser = {
        uid,
        email,
        createdAt: new Date(),
        updatedAt: new Date(),
        compositions: [], // Array para composiciones
        myLikes: [], // Array para "me gusta"
        myPurchases: [], // Array para compras
        mySells: [], // Array para ventas
        myComments: [], // Array para comentarios
      };

      // Actualizar el documento principal para agregar el nuevo usuario al objeto "users"
      const updateResult = await collection.updateOne(
        { _id: mainDoc._id }, // Filtro para encontrar el documento principal
        { $set: { [`users.${uid}`]: newUser } } // Agregar el nuevo usuario al objeto "users"
      );

      console.log('Update result:', updateResult); // Depuración

      if (updateResult.modifiedCount === 0) {
        throw new Error('Failed to create the user.');
      }

      console.log('New user created in the database:', newUser); // Depuración
      return res.status(201).json({ 
        success: true, 
        message: 'User created successfully.', 
        user: newUser,
        myLikes: newUser.myLikes || [], // Retornar el array myLikes (vacío en este caso)
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