const [body, setBody] = useState({
    contaninerPadre: {
    type: "Container",
    name: "containerPadre",
    style: {
        maxWidth: "400px",
        margin: "0 auto",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        backgroundColor: "gray"
    },
    children: [
        {
        type: "Text",
        name: "headerText",
        text: "Iniciar Sesión",
        style: {
            textAlign: "center",
            marginBottom: "20px",
            fontSize: '50px',
            color: 'red'
        }
        },
        {
        type: "Container",
        name: "formContainer",
        style: {
            display: "flex",
            flexDirection: "column"
        },
        children: [
            {
            type: "Container",
            name: "emailContainer",
            style: {
                marginBottom: "15px"
            },
            children: [
                {
                type: "Label",
                name: "emailLabel",
                valor: "Correo Electrónico",
                },
                {
                type: "Input",
                name: "emailInput",
                inputType: "email",
                id: "email",
                required: true,
                style: {
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    background: 'red'
                },
                value: '',
                onValueChange: (value) =>   [ changeBody(
                                                    HandleComponentChange, 
                                                    'emailInput', 
                                                    body, 
                                                    (component) => {
                                                        component.value = value
                                                    }
                                                ), 
                                                saveObjectsNameInEdition({object:'Input', name: 'emailInput'}),
                                            ]
                },
            ]
            },
            {
            type: "Container",
            name: "passwordContainer",
            style: {
                marginBottom: "15px"
            },
            children: [
                {
                type: "Label",
                name: "passwordLabel",
                valor: "Contraseña",
                },
                {
                type: "Container",
                name: "passwordInputContainer",
                style: {
                    display: "flex",
                    alignItems: "center"
                },
                children: [
                    {
                    type: "Input",
                    name: "passwordInput",
                    inputType: "password",
                    
                    required: true,
                    style: {
                        width: "100%",
                        padding: "10px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: 'gold'
                    },
                    value: '',
                    onValueChange: (value) =>   [ changeBody(
                                                        HandleComponentChange, 
                                                        'passwordInput', 
                                                        body, 
                                                        (component) => {
                                                            component.value = value
                                                        }
                                                    ), 
                                                    saveObjectsNameInEdition({object:'Input', name: 'passwordInput'}),
                                                ]
                    },
                    {
                    type: "Button",
                    name: "showPasswordButton",
                    buttonType: "button",
                    style: {
                        marginLeft: "10px",
                        padding: "10px",
                        border: "none",
                        background: "white",
                        cursor: "pointer",
                        color: "black"
                    },
                    onClick:[     
                                    () => changeBody(
                                        HandleComponentChange, 
                                        'passwordInput', 
                                        body, 
                                        (component) => {
                                            component.inputType = "text";
                                        }
                                    ),
                                    () => changeBody(
                                        HandleComponentChange, 
                                        'passwordRepeatInput', 
                                        body, 
                                        (component) => {
                                            component.inputType = "text";
                                        }
                                    ),
                                    () => {
                                        changeInputType('mostrar', 'text', 'password', body.contaninerPadre, body, 'showPasswordButtonText', 'passwordInput', 'inputType')
                                    },
                                    () => {
                                        changeText(body.contaninerPadre, 'showPasswordButtonText', 'mostrar', 'ocultar')
                                    },
                            ],
                    children: [
                        {
                        type: "Text",
                        name: "showPasswordButtonText",
                        text: "mostrar",
                        style: {
                            textAlign: "center",
                            fontSize: '15px'
                        }
                        }
                    ]
                    }
                ]
                }
            ]
            },
            {
            type: "Container",
            name: "passwordRepeatContainer",
            style: {
                display: "flex",
                alignItems: "center",
                marginBottom: "20px"
            },
            children: [
                {
                type: "Input",
                name: "passwordRepeatInput",
                inputType: "password",
                id: "passwordRepeat",
                required: true,
                style: {
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                },
                value: '',
                onValueChange: (value) =>   [ changeBody(
                                                    HandleComponentChange, 
                                                    'passwordRepeatInput', 
                                                    body, 
                                                    (component) => {
                                                        component.value = value
                                                    }
                                                ), 
                                                saveObjectsNameInEdition({object:'Input', name: 'passwordRepeatInput'}),
                                            ]
                }
            ]
            },
            {
            type: "Container",
            name: "newAccountContainer",
            style: {
                display: "flex",
                alignItems: "center",
                marginBottom: "20px"
            },
            children: [
                {
                type: "Input",
                name: "newAccountCheckbox",
                inputType: "checkbox",
                id: "newAccount",
                required: true,
                style: {
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "20px",
                    background: 'red'
                },
                onValueChange: (value) => Alert(value),
                },
                {
                type: "Label",
                name: "newAccountLabel",
                valor: "Crear nueva cuenta",
                }
            ]
            },
            {
                type: "Button",
                name: "submitButton",
                style: {
                    padding: "10px",
                    borderRadius: "4px",
                    border: "none",
                    backgroundColor: "#007BFF",
                    color: "#fff",
                    cursor: "pointer"
                },
                onClick: [  () => Alert('iniciar'),
                            () => Alert(sum(1,2)),
                            () => changeBody(HandleComponentChange, 'emailInput', body, (component) => {
                                component.style= {
                                    width: "100%",
                                    padding: "10px",
                                    borderRadius: "4px",
                                    border: "1px solid #ccc",
                                    background: 'blue'
                                };
                            }),
                            () => changeBody(HandleComponentChange, 'headerText', body, (component) => {
                                component.style= {
                                    textAlign: "center",
                                    marginBottom: "20px",
                                    fontSize: '50px',
                                    color: 'green'
                                };
                            })
                    ],
                children: [
                    {
                    type: "Text",
                    name: "submitButtonText",
                    text: "Iniciar",
                    style: {
                        textAlign: "center",
                        fontSize: '16px'
                    }
                    }
                ]
            }
        ]
        }
    ]
    }
}
);