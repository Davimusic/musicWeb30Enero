import Input from "@/components/simple/input";
import importAllFunctions from "@/functions/general/importAllLocalFunctions";
import findObjectById from "@/functions/general/findObjectById";
import React from 'react';
import TextArea from "@/components/simple/textArea";
import Select from "@/components/simple/selects";
import FileBrowser from "./fileBrowser";
import sortArrayAlphabetically from "@/functions/general/sortArrayAlphabetically";
import ComponentToggle from "./componentToggle";
import udpateBodies from "./udpateBodies";
import deleteComponent from "./deleteComponent";
import colorPalette from "./colorPalette";
import updateObjectValueByKey from "./updateObjectValueByKey";

let functions = importAllFunctions()

const ComponentRendererAttributes = ({
    component,
    targetId,
    classNames,
    setClassNames,
    setBody,
    availableClasses,
    selectedClassName,
    setSelectedClassName,
    setIsReinjected,
    setIsModalOpen,
    setModalContent,
    resourceType,
    setSrcToInject,
    setBodyEdit,
    setBodyTest,
    bodyTest
}) => {
    const filteredComponent = traverseAndFilter(component, targetId);

    function traverseAndFilter(node, targetId) {
        if (node.id === targetId) {
            return node;
        }
        if (node.children) {
            for (let child of node.children) {
                const result = traverseAndFilter(child, targetId);
                if (result) {
                    return result;
                }
            }
        }
        return null;
    }

    const formatNode = (node) => {
        const removeClass = (classToRemove) => {
            const newArray = functions.removeStringFromArray(findObjectById(component, targetId).className, classToRemove);
            setClassNames(newArray);
            let editObj = functions.updateObjectKeyById(targetId, component, 'className', newArray);
            let testObj = functions.updateObjectKeyById(targetId, { ...bodyTest }, 'className', newArray);
            udpateBodies(editObj, testObj, false, setIsReinjected, setBody, setBodyEdit, setBodyTest);
        };

        const addClass = () => {
            const newArray = functions.addElementToArray(classNames, selectedClassName);
            setClassNames(newArray);
            let editObj = functions.updateObjectKeyById(targetId, component, 'className', newArray);
            let testObj = functions.updateObjectKeyById(targetId, { ...bodyTest }, 'className', newArray);
            udpateBodies(editObj, testObj, false, setIsReinjected, setBody, setBodyEdit, setBodyTest);
        };

        const deleteStyle = (styleKey) => {
            let obj = functions.deepClone(component);
            function removeStyleById(styleKey, targetId, obj) {
                if (!obj) return; // Asegúrate de que obj no sea null o undefined
                if (obj.id === targetId && obj.style) {
                    delete obj.style[styleKey];
                }
                if (obj.children) {
                    obj.children = obj.children.map(child => removeStyleById(styleKey, targetId, child));
                }
                return obj;
            }
            let editObj = removeStyleById(styleKey, targetId, functions.deepClone(component));
            let testObj = removeStyleById(styleKey, targetId, bodyTest);
            udpateBodies(editObj, testObj, true, setIsReinjected, setBody, setBodyEdit, setBodyTest);
        };

        const injectStyle = () => {
            const newKeyValue = document.getElementById('styleInput').value;
            let obj = functions.deepClone(component); // Asegúrate de hacer una copia profunda de component
            function addStyleById(newKeyValue, targetId, obj) {
                if (!obj) return; // Asegúrate de que obj no sea null o undefined
                console.log(newKeyValue);
                console.log(targetId);
                console.log(obj);
        
                if (obj.id === targetId) {
                    const [key, value] = newKeyValue.split(':');
                    if (obj.style) {
                        obj.style[key.trim()] = value.trim();
                    } else {
                        obj.style = { [key.trim()]: value.trim() };
                    }
                } 
        
                if (obj.children) {
                    obj.children = obj.children.map(child => addStyleById(newKeyValue, targetId, child));
                }
        
                return obj;
            }
        
            let editObj = addStyleById(newKeyValue, targetId, obj); // Usar obj directamente que es la copia profunda de component
            let testObj = addStyleById(newKeyValue, targetId, functions.deepClone(bodyTest)); // Hacer copia profunda de bodyTest también
        
            udpateBodies(editObj, testObj, true, setIsReinjected, setBody, setBodyEdit, setBodyTest);
        };
        
        


        /*const injectStyle = () => {
            const newKeyValue = document.getElementById('styleInput').value;
            let obj = {...component}
            function addStyleById(newKeyValue, targetId, obj) {
                console.log(newKeyValue);
                console.log(targetId);
                console.log(obj);
                
                if (obj.id === targetId) {
                    const [key, value] = newKeyValue.split(':');
                    if (obj.style) {
                        obj.style[key.trim()] = value.trim();
                    } else {
                        obj.style = { [key.trim()]: value.trim() };
                    }
                }
                if (obj.children) {
                    obj.children = obj.children.map(child => addStyleById(newKeyValue, targetId, child));
                }
                return obj;
            }
            let editObj = addStyleById(newKeyValue, targetId, functions.deepClone(component));
            let testObj = addStyleById(newKeyValue, targetId, bodyTest);
            udpateBodies(editObj, testObj, true, setIsReinjected, setBody, setBodyEdit, setBodyTest);
        };*/

        const setStyleInputValue = (key, value) => {
            document.getElementById('styleInput').value = `${key}: ${value}`;
        };

        const updateSrcValue = (a) => {
            updateObjectValueByKey('src', a.secure_url, component, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId);
        };

        if (!node) return null;

        return (
            <div key={node.id} style={{}}>
                <div>Type: {node.type}</div>
                <div className="marginTop1">
                    onClick: 
                    <ComponentToggle id={'onclickId'}/>
                    <div id='onclickId'>
                        <Input 
                            className={['borders1', 'cursor']} 
                            type="text" 
                            value={node.onClick ? node.onClick.toString() : ''} 
                            style={{ marginRight: '10px', padding: '10px', fontSize: '100%' }}
                        />
                    </div>
                </div>
                {node.hasOwnProperty('className') && (
                    <div style={{ display: 'block', background: colorPalette()['color4'] }} className='borders1 padding1 marginTop1'>
                        ClassName:
                        <ComponentToggle id={'classNameId'}/>
                        <div id='classNameId'>
                            <Select 
                                id={'selectFileBrowser'} 
                                style={{ marginRight: '10px', padding: '10px', fontSize: '100%', maxWidth: '100%', boxSizing: 'border-box' }} 
                                className={[]} 
                                name={'selectFileBrowser'} 
                                value={selectedClassName} 
                                event={(e) => setSelectedClassName(e.target.value)} 
                                options={['Select class', ...functions.sortArrayAlphabetically(availableClasses)]} 
                            />
                            <button className='borders1 cursor' onClick={addClass} style={{ marginRight: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                                Add class
                            </button>
                            {node.className.map((className, index) => (
                                <div className='borders1 center' style={{ margin: '10px', background: 'black', padding: '10px', display: 'flex' }} key={index}>
                                    {className} 
                                    <button className='borders1 cursor' onClick={() => removeClass(className)} style={{ margin: '10px', background: colorPalette()['color3'], padding: '10px', fontSize: '100%' }}>
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {node.hasOwnProperty('style') && (
                    <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                        Style:
                        <ComponentToggle id={'styleId'}/>
                        <div id='styleId'>
                            <Input 
                                id={'styleInput'} 
                                className={['borders1', 'cursor', 'marginTop1']} 
                                onValueChange={() => {}} 
                                type="text" 
                                value={''} 
                                style={{ marginRight: '10px', padding: '10px', fontSize: '100%', width: '100%' }}
                            />
                            <button className='borders1 cursor' onClick={injectStyle} style={{ margin: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                                add new style
                            </button>
                            {Object.entries(node.style).map(([key, value], index) => (
                                <div onClick={() => setStyleInputValue(key, value)} key={index} style={{ display: 'block', background: colorPalette()['color5'], margin: '10px' }} className='borders1'>
                                    <div className='borders1 center scroll' style={{ background: 'black', padding: '10px', display: 'flex' }}>
                                        {key}   
                                        <button className='borders1 cursor' onClick={() => deleteStyle(key)} style={{ margin: '10px', background: colorPalette()['color3'], padding: '10px', fontSize: '100%' }}>
                                            x
                                        </button>
                                    </div>
                                    <p className='center'>{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {node.hasOwnProperty('text') && (
                    <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                        Text: 
                        <ComponentToggle id={'textId'}/>
                        <div id='textId'>                                                                                  
                            <Input 
                                id={'styleInput'} 
                                className={['borders1', 'cursor', 'marginTop1']} 
                                onValueChange={(e) => updateObjectValueByKey('text', e, component, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId )} 
                                type="text" 
                                value={node.text || ''} 
                                style={{ marginRight: '10px', padding: '10px', fontSize: '100%', width: '100%' }}
                            />
                        </div>
                    </div>
                )}
                {node.hasOwnProperty('value') && (
                    <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                        Value:
                        <ComponentToggle id={'ValueID'}/>
                        <div id='ValueID'>    
                            <TextArea 
                                id={'styleTextArea'} 
                                className={['borders1', 'cursor', 'marginTop1']} 
                                onValueChange={(e) => updateObjectValueByKey('value', e, component, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId )} 
                                type="text" 
                                value={node.value || ''} 
                                style={{ marginRight: '10px', padding: '10px', fontSize: '100%', width: '100%' }}
                            />
                        </div>
                    </div>
                )}
                {node.hasOwnProperty('src') && (
                    <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                        src:
                        <ComponentToggle id={'srcId'}/>
                        <div id='srcId'>  
                            <button className='borders1 cursor' onClick={() => { setIsModalOpen(true); setModalContent(<FileBrowser type={resourceType} showControls={false} actionFunction={updateSrcValue} path={'davipianof@gmail.com/plan felipe musical'} />); }} style={{ margin: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                                change src file
                            </button>
                        </div>
                    </div>
                )}
                {node.hasOwnProperty('id') && (
                    <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                        id:
                        <ComponentToggle id={'id'}/>
                        <div id='id'>  
                            {node.id}
                        </div>
                    </div>
                )}
                <button className='borders1 cursor marginTop1' onClick={() => deleteComponent(targetId, component, setIsReinjected, setBody, setBodyEdit, setBodyTest, bodyTest, true)} style={{ marginRight: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                    Delete component
                </button>
            </div>
        );
    };

    return (
        <div>
            {formatNode(filteredComponent)}
        </div>
    );
};

export default ComponentRendererAttributes;


    











/*const componentRendererAttributes = (component, targetId, classNames, setClassNames, setBody, availableClasses, selectedClassName, setSelectedClassName, setIsReinjected, setIsModalOpen, setModalContent, resourceType, setSrcToInject, setBodyEdit, setBodyTest, bodyTest) => {
    
    const filteredComponent = traverseAndFilter(component, targetId);
    return (
        <div>
            {formatNode(filteredComponent, component, targetId, classNames, setClassNames, setBody, availableClasses, selectedClassName, setSelectedClassName, setIsReinjected, setIsModalOpen, setModalContent, resourceType, setSrcToInject, setBodyEdit, setBodyTest, bodyTest)}
        </div>
    );
};

function traverseAndFilter(node, targetId) {
    if (node.id === targetId) {
        return node;
    }
    if (node.children) {
        for (let child of node.children) {
            const result = traverseAndFilter(child, targetId);
            if (result) {
                return result;
            }
        }
    }
    return null;
}

const formatNode = (node, component, targetId, classNames, setClassNames, setBody, availableClasses, selectedClassName, setSelectedClassName, setIsReinjected, setIsModalOpen, setModalContent, resourceType, setSrcToInject, setBodyEdit, setBodyTest, bodyTest) => {

    const removeClass = (classToRemove) => {
        const newArray = functions.removeStringFromArray(findObjectById(component, targetId).className, classToRemove)
        setClassNames(newArray)
        //setBody(functions.updateObjectKeyById(targetId, component, 'className', newArray))
        let editObj = functions.updateObjectKeyById(targetId, component, 'className', newArray)
        let testObj = functions.updateObjectKeyById(targetId, {...bodyTest}, 'className', newArray)
        //udpateBodies(editObj, testObj, false)
        udpateBodies(editObj, testObj, false, setIsReinjected, setBody, setBodyEdit, setBodyTest)
    };

    const addClass = () => {
        const newArray = functions.addElementToArray(classNames, selectedClassName)
        setClassNames(newArray)
        //setBody(functions.updateObjectKeyById(targetId, component, 'className', newArray))
        let editObj = functions.updateObjectKeyById(targetId, component, 'className', newArray)
        let testObj = functions.updateObjectKeyById(targetId, {...bodyTest}, 'className', newArray)
        udpateBodies(editObj, testObj, false, setIsReinjected, setBody, setBodyEdit, setBodyTest)
    }


    function deleteStyle(styleKey) {
        const obj = component
        
        // Función recursiva para eliminar el estilo
        function removeStyleById(styleKey, targetId, obj) {
            console.log(styleKey);
            console.log(targetId);
            console.log(obj);
            
            if (obj.id === targetId && obj.style) {
                delete obj.style[styleKey];
            }
            if (obj.children) {
                obj.children = obj.children.map(child => removeStyleById(styleKey, targetId, child));
            }
            return obj;
        }
    
        //const clonedObj = clone(obj);
        //reloadBodyWithTraverseAndReplaceOnClick(removeStyleById(styleKey, targetId, clonedObj))
        let editObj = removeStyleById(styleKey, targetId, functions.deepClone(obj))
        let testObj = removeStyleById(styleKey, targetId, bodyTest)
        udpateBodies(editObj, testObj, true, setIsReinjected, setBody, setBodyEdit, setBodyTest)
    }

    function injectStyle() {
        const newKeyValue = document.getElementById('styleInput').value;
    
        function addStyleById(newKeyValue, targetId, obj) {
            if (obj.id === targetId) {
                const [key, value] = newKeyValue.split(':');
                if (obj.style) {
                    obj.style[key.trim()] = value.trim();
                } else {
                    obj.style = { [key.trim()]: value.trim() };
                }
            }
            if (obj.children) {
                obj.children = obj.children.map(child => addStyleById(newKeyValue, targetId, child));
            }
            return obj;
        }
    
        //const clonedObj = clone(component);
        //reloadBodyWithTraverseAndReplaceOnClick(addStyleById(newKeyValue, targetId, clonedObj))
        let editObj = addStyleById(newKeyValue, targetId, functions.deepClone(component))
        let testObj = addStyleById(newKeyValue, targetId, bodyTest)
        udpateBodies(editObj, testObj, true, setIsReinjected, setBody, setBodyEdit, setBodyTest)
    }

    const setStyleInputValue = (key, value) => {
        document.getElementById('styleInput').value = `${key}: ${value}`
    }


    function updateSrcValue(a){
        //updateValueByKey('src', a.secure_url)
        updateObjectValueByKey('src', a.secure_url, component, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId )
    }

    if (!node) return null;

    return (
        <div key={node.id} style={{}}>
            <div>Type: {node.type}</div>
            <div className="marginTop1">
                onClick: 
                <ComponentToggle id={'onclickId'}/>
                <div id='onclickId'>
                    <Input 
                        className={['borders1', 'cursor']} 
                        type="text" 
                        value={node.onClick ? node.onClick.toString() : ''} 
                        style={{ marginRight: '10px', padding: '10px', fontSize: '100%' }}
                    />
                </div>
            </div>
            {node.hasOwnProperty('className') && (
                <div style={{ display: 'block', background: colorPalette()['color4'] }} className='borders1 padding1 marginTop1'>
                    ClassName:
                    <ComponentToggle id={'classNameId'}/>
                    <div id='classNameId'>
                        <Select 
                            id={'selectFileBrowser'} 
                            style={{ marginRight: '10px', padding: '10px', fontSize: '100%', maxWidth: '100%', boxSizing: 'border-box' }} 
                            className={[]} 
                            name={'selectFileBrowser'} 
                            value={selectedClassName} 
                            event={(e) => setSelectedClassName(e.target.value)} 
                            options={['Select class', ...sortArrayAlphabetically(availableClasses)]} 
                        />
                        <button className='borders1 cursor' onClick={addClass} style={{ marginRight: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                            Add class
                        </button>
                        {node.className.map((className, index) => (
                            <div className='borders1 center' style={{ margin: '10px', background: 'black', padding: '10px', display: 'flex' }} key={index}>
                                {className} 
                                <button className='borders1 cursor' onClick={() => removeClass(className)} style={{ margin: '10px', background: colorPalette()['color3'], padding: '10px', fontSize: '100%' }}>
                                    x
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {node.hasOwnProperty('style') && (
                <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                    Style:
                    <ComponentToggle id={'styleId'}/>
                    <div id='styleId'>
                        <Input 
                            id={'styleInput'} 
                            className={['borders1', 'cursor', 'marginTop1']} 
                            onValueChange={() => {}} 
                            type="text" 
                            value={''} 
                            style={{ marginRight: '10px', padding: '10px', fontSize: '100%', width: '100%' }}
                        />
                        <button className='borders1 cursor' onClick={injectStyle} style={{ margin: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                            add new style
                        </button>
                        {Object.entries(node.style).map(([key, value], index) => (
                            <div onClick={() => setStyleInputValue(key, value)} key={index} style={{ display: 'block', background: colorPalette()['color5'], margin: '10px' }} className='borders1'>
                                <div className='borders1 center scroll' style={{ background: 'black', padding: '10px', display: 'flex' }}>
                                    {key}   
                                    <button className='borders1 cursor' onClick={() => deleteStyle(key)} style={{ margin: '10px', background: colorPalette()['color3'], padding: '10px', fontSize: '100%' }}>
                                        x
                                    </button>
                                </div>
                                <p className='center'>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {node.hasOwnProperty('text') && (
                <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                    Text: 
                    <ComponentToggle id={'textId'}/>
                    <div id='textId'>                                                                                  
                        <Input 
                            id={'styleInput'} 
                            className={['borders1', 'cursor', 'marginTop1']} 
                            onValueChange={(e) => updateObjectValueByKey('text', e, component, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId )} 
                            type="text" 
                            value={node.text || ''} 
                            style={{ marginRight: '10px', padding: '10px', fontSize: '100%', width: '100%' }}
                        />
                    </div>
                </div>
            )}
            {node.hasOwnProperty('value') && (
                <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                    Value:
                    <ComponentToggle id={'ValueID'}/>
                    <div id='ValueID'>    
                        <TextArea 
                            id={'styleTextArea'} 
                            className={['borders1', 'cursor', 'marginTop1']} 
                            onValueChange={(e) => updateObjectValueByKey('value', e, component, bodyTest, udpateBodies, setIsReinjected, setBody, setBodyEdit, setBodyTest, targetId )} 
                            type="text" 
                            value={node.value || ''} 
                            style={{ marginRight: '10px', padding: '10px', fontSize: '100%', width: '100%' }}
                        />
                    </div>
                </div>
            )}
            {node.hasOwnProperty('src') && (
                <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                    src:
                    <ComponentToggle id={'srcId'}/>
                    <div id='srcId'>  
                        <button className='borders1 cursor' onClick={() => { setIsModalOpen(true); setModalContent(<FileBrowser type={resourceType} showControls={false} actionFunction={updateSrcValue} path={'davipianof@gmail.com/plan felipe musical'} />); }} style={{ margin: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                            change scr file
                        </button>
                    </div>
                </div>
            )}
            {node.hasOwnProperty('id') && (
                <div className='borders1 padding1 marginTop1' style={{ background: colorPalette()['color4'] }}>
                    id:
                    <ComponentToggle id={'id'}/>
                    <div id='id'>  
                        {node.id}
                    </div>
                </div>
            )}
            <button className='borders1 cursor marginTop1' onClick={()=> deleteComponent(targetId, component, setIsReinjected, setBody, setBodyEdit, setBodyTest, bodyTest, true)} style={{ marginRight: '10px', background: colorPalette()['color5'], padding: '10px', fontSize: '100%', color: 'white' }}>
                Delete component
            </button>
        </div>
    );
};

export default componentRendererAttributes*/