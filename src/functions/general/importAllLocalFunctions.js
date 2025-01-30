export default function importAllFunctions() {
    const contexts = [
        require.context('./', true, /\.js$/),
        require.context('../BackendConnectors/', true, /\.js$/),
        require.context('../security/', true, /\.js$/)
    ];

    // Crea un objeto con todas las funciones
    const functions = contexts.reduce((acc, context) => {
        context.keys().forEach((key) => {
            const functionName = key.replace('./', '').replace('.js', '').replace(/\//g, '_');
            acc[functionName] = context(key).default;
        });
        return acc;
    }, {});

    console.log(functions);

    return functions;
}




