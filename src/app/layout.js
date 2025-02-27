// app/layout.js
'use client'; // Indica que este archivo es del lado del cliente

import { Root } from './root'; // Importa el componente Root

export default function RootLayout({ children }) {
  return (
    <Root>{children}</Root> 
  );
}





/*"use client"

import { Root } from './root';


export default function RootLayout() {
  return (
    <Root></Root>
  );
}*/
