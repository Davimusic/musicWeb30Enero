export default async function generalConnector(path, method, body) {
    try {
        const response = await fetch(`/api/${path}`, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (!response.ok) {
            const message = `An error has occurred: ${response.status}, ${result.message}`;
            alert(message)
            console.error(message);
            throw new Error(message);
        }

        return result;
    } catch (error) {
        console.error('Error en la solicitud a la API:', error);
        throw error; // Devuelve el error
    }
}