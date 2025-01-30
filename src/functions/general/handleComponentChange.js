export default function HandleComponentChange(componentName, body, action) {
    //console.log(`componentName: ${componentName}, body: ${body}, action: ${action}`);
    function traverseAndModify(component) {
        if (component && component.name === componentName) {
            //console.log('Componente encontrado:', component.name); // Para depuración
            action(component);
        }
        if (component && component.children) {
            component.children.forEach(traverseAndModify);
        }
    }

    traverseAndModify(body.contaninerPadre); // Asegúrate de empezar desde el nivel correcto
    return body;
}


