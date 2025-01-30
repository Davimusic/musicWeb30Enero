import React from 'react';

const NotFound = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundImage: 'url(https://res.cloudinary.com/dplncudbq/image/upload/v1703698224/fondoo_ri7v9f.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h1 style={{ fontSize: '3rem', color: 'black', textAlign: 'center' }}>Página no encontrada</h1>
      <p style={{ fontSize: '1.5rem', color: 'black', textAlign: 'center' }}>La ruta que buscas no existe.</p>
    </div>
  );
};

export default NotFound;

