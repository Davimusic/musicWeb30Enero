const checkUserName = (ifExists, ifNotExists) => {
    // Verifica que estamos en el cliente
    if (typeof window !== "undefined") {
      const userName = sessionStorage.getItem("userName");
  
      if (userName) {
        // Si existe, verifica si 'ifExists' es función o retorna su valor directamente
        return typeof ifExists === "function" ? ifExists(userName) : ifExists;
      } else {
        // Si no existe, verifica si 'ifNotExists' es función o retorna su valor directamente
        return typeof ifNotExists === "function" ? ifNotExists() : ifNotExists;
      }
    } else {
      console.log("sessionStorage no está disponible en el servidor.");
      return null; // Retorno por defecto si sessionStorage no está disponible
    }
  };
  
  export default checkUserName;
  