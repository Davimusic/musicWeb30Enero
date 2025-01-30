import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import importAllFunctions from "@/functions/general/importAllLocalFunctions";
'../estilos/general/general.css'

let functions = importAllFunctions()

let login={
    "type": "Container",
    "name": "containerPadre",
    "style": {},
    "className": [
        "horizontalCenter",
        "center",
    ],
    "children": [
        {
            "type": "Container",
            "name": "formContainer",
            "style": {},
            "className": [
                "color3",
                "block",
                "maxWidth400",
                "margin1",
                "padding1",
                "borders1",
                
            ],
            "children": [
                {
                    "type": "Text",
                    "name": "headerText",
                    "text": "Iniciar Sesión",
                    "style": {
                        "textAlign": "center",
                        "marginBottom": "20px",
                        "fontSize": "50px",
                        "color": "red"
                    }
                },
                {
                    "type": "Container",
                    "name": "emailContainer",
                    "style": {
                        "marginBottom": "15px"
                    },
                    "children": [
                        {
                            "type": "Label",
                            "name": "emailLabel",
                            "valor": "Correo Electrónico"
                        },
                        {
                            "type": "Input",
                            "name": "Input1",
                            "inputType": "email",
                            "id": "Input1",
                            "required": true,
                            "style": {},
                            "className": [
                                "borders1",
                                "width100",
                                "padding1",
                                "borderNone"
                            ],
                            "value": "",
                            "onValueChange": `(value) => functions.handleMultipleFunctions([
                                functions.setEmail(value)
                            ])`
                        }
                    ]
                },
                {
                    "type": "Container",
                    "name": "passwordContainer",
                    "style": {
                        "marginBottom": "15px"
                    },
                    "children": [
                        {
                            "type": "Label",
                            "name": "passwordLabel",
                            "valor": "Contraseña"
                        },
                        {
                            "type": "Container",
                            "name": "passwordInputContainer",
                            "style": {
                                "display": "flex",
                                "alignItems": "center"
                            },
                            "children": [
                                {
                                    "type": "Input",
                                    "name": "Input2",
                                    "inputType": "password",
                                    "id": "Input2",
                                    "required": true,
                                    "style": {},
                                    "className": [
                                        "borders1",
                                        "width100",
                                        "padding1",
                                        "borderNone"
                                    ],
                                    "value": "",
                                    "onValueChange": `(value) => functions.handleMultipleFunctions([
                                functions.setPassword(value)
                                    ])`
                                }
                            ]
                        }
                    ]
                },
                {
                    "type": "Container",
                    "name": "passwordInputContainer",
                    "style": {
                        "display": "flex",
                        "alignItems": "center"
                    },
                    className: ['center'],
                    "children": [
                        {
                            "type": "Button",
                            "name": "submitButton",
                            "style": {
                                "padding": "10px",
                                "borderRadius": "4px",
                                "border": "none",
                                "backgroundColor": "#007BFF",
                                "color": "#fff",
                                "cursor": "pointer"
                            },
                            "onClick": `() => functions.handleMultipleFunctions([
                                                functions.evaluteAction(functions.checkTheLogin(functions.email(), functions.password()), 
                                                                        () =>    functions.checkTheLoginInDb(functions.email(), functions.password(), functions.router()),
                                                                        () =>    functions.alert('login errado'))
                                            ])`,
                            'className': [''],
                            "children": [
                                {
                                    "type": "Text",
                                    "text": "hola",
                                    "style": {color: 'blue'},
                                    onClick: `() => ''`,
                                    className: ['']
                                },
                            ]
                        }
                    ]
                },
            ]
        }
    ]
}


functions.localStorageAcces('POST', 'multifunctions', login)

export default function LoginMold() {
    
    const [body, setBody] = useState({});
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    functions['setEmail'] = (value) => setEmail(value);
    functions['email'] = () => email;
    functions['setPassword'] = (value) => setPassword(value);
    functions['password'] = () => password;
    functions['router'] = () => router;

    console.log(functions);
    const router = useRouter();

    useEffect(() => {
        functions.convertStringFunctionsToOperables('multifunctions', functions, setBody)
        functions.inyectClassNamesToDOM(functions.importClassNames()); 
    }, []);

    useEffect(() => {
        functions.evaluteAction(functions.localStorageAcces('GET', 'loggingStatus'),()=> router.push('/first'),()=> console.log('login'))
    }, [router]);  

    return body
}



