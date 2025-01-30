export default function checkTheLogin(user, password) {
    console.log(user);
    console.log(password);

    user = user.trim(); // Eliminar espacios en blanco adicionales
    password = password.trim();

    if (!user || !password) { // Verificar si el usuario o la contraseña están vacíos
        alert("Error: El usuario y la contraseña no pueden estar vacíos.");
        return false;
    }

    return true;
}
