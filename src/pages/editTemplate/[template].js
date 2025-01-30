import RenderElement from "@/functions/renderElement";
import importAllFunctions from "@/functions/general/importAllLocalFunctions";
import React, { useState, useEffect } from 'react';
import { Menu } from "@/components/menu";
import injectLabelIntoJSON from "@/functions/cms/injectLabelIntoJSON";
import traverseAndReplaceOnClick from "@/functions/cms/traverseAndReplaceOnClick";
import RenderComponentNames from "@/functions/cms/renderComponentNames";
import ComponentRendererAttributes from "@/functions/cms/componentRendererAttributes";
import items from "@/functions/cms/itemsTest";
import Modal from "@/components/complex/modal";
import UploadFileToCloudinary from "@/functions/cms/uploadFileToCloudinary";
import Image from "@/components/simple/image";
import Input from "@/components/simple/input";
import SettingControls from "@/functions/cms/settingControls";
import FileBrowser from "@/functions/cms/fileBrowser";
import findObjectById from "@/functions/general/findObjectById";
import Text from "@/components/simple/text";
import ModernCheckbox from "@/functions/cms/ModernCheckbox";
import ComponentRenderCheckbox from "@/functions/cms/componentRenderCheckbox";
import generalConnector from "@/functions/BackendConnectors/generalConnector";
import udpateBodies from "@/functions/cms/udpateBodies";
import colorPalette from "@/functions/cms/colorPalette";
import CmsMenuContent from "@/functions/cms/cmsMenuContentTest";
import getMenuContent from "@/functions/general/getMenuContent";

import updateObjectValueByKey from "@/functions/cms/updateObjectValueByKey";
import useCustomState from "@/functions/general/useCustomState";

import importRemoteFunctions from "@/functions/general/importRemoteFunctions";


//hacer que en prueba los links tambien no tengan activacion
const functions = importAllFunctions()


export default function hi(){
    //guardan los estados de los objetos 
    const [body, setBody] = useState({});//el que todo el tiempo se ve en ejecucion
    //const [bodyTest, setBodyTest] = useState({});//el que siempre tiene con todas sus funcionalidades finales
    //const [bodyEdit, setBodyEdit] = useState({});//el que siempre tiene el modo edicion
    
    const [isInjected, setIsInjected] = useState(false);//permite la actualizacion de los bodies
    const [isReinjected, setIsReinjected] = useState(false);//activa las funciones del template
    const [id, setId] = useState(0);//contiene el id del objeto seleccionado
    const [selectedId, setSelectedId] = useState(null);
    const [availableClasses, setAvailableClasses] = useState([])//clases traidas de la nuve para usar
    const [selectedClassName, setSelectedClassName] = useState('')//clase seleccionada a usar
    const [classNames, setClassNames] = useState([]);//las clases del objeto seleccionado
    const [modalContent, setModalContent] = useState(null);//contenido del modal
    const [resourceType, setResourceType] = useState('image');//tipo de recurso a usar nube cloudinary
    const [srcToInject, setSrcToInject] = useState('');
    const [editionState, setEditionState] = useState('editTemplate');//estado en uso como edicion o test con sus funciones
    
    
    const [isRearrangeComponents, setIsRearrangeComponents] = useState(false)
    const [isWrapChildren, setIsWrapChildren] = useState(false)
    const [isMoveComponentsActivated, setIsMoveComponentsActivated] = useState(false)//para reubicar componentes


    const [objectMolds, setObjectMolds] = useState([])//nombres de los templates ya creados
    const [objectMoldsInUse, setObjectMoldsInUse] = useState(objectMolds[0])//template en uso
    const [objectMoldsDb, setObjectMoldsDb]= useState({})//todos los templates de base de datos

    const [selectedComponent, setSelectedComponent] = useState(null);//para resaltar el componente de renderComponentNames seleccionado para reubicarlo
    
    const [isModalOpen, setIsModalOpen] = useState(false);//modal
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    

    /*function traverseAndEval(obj) {
        if (typeof obj !== 'object' || obj === null) return obj;
    
        for (const key in obj) {
            if (key === 'onClick' && typeof obj[key] === 'string') {
                obj[key] = eval(`(${obj[key]})`);
            } else if (typeof obj[key] === 'object') {
                traverseAndEval(obj[key]);
            }
        }
        return obj;
    }*/

    const handleButtonClick = (id) => {
        setSelectedId(id);
        setId(id)
        updateClassForOnlyOneComponent(id, 'frame')
    };
    


    function traverseAndEval(obj) {///tambien està en [id], debe ser global esta funcion
        if (typeof obj !== 'object' || obj === null) return obj;
    
        for (const key in obj) {
            if (key === 'onClick' && typeof obj[key] === 'string') {
                console.log(obj[key]);
    
                const match = obj[key].match(/{([\s\S]*)}/);
                if (match) {
                    const functionBody = match[1].trim();
                    if (functionBody.includes('importRemoteFunctions')) {
                        obj[key] = new Function('importRemoteFunctions', `return function(event) {${functionBody}}`)(importRemoteFunctions);
                    } else {
                        obj[key] = eval(`(${obj[key]})`);
                    }
                } else {
                    console.error(`Failed to match function body in string: ${obj[key]}`);
                }
            } else if (typeof obj[key] === 'object') {
                traverseAndEval(obj[key]);
            }
        }
        return obj;
    }
    

    function updateClassForOnlyOneComponent(id, className) {
        functions.removeClassFromElements(functions.getElementsByClass(className), className);
        functions.addClassToElement(id, className);
    }

    async function fetchTemplates() {
        try {
            const result = await generalConnector('getTemplates', 'GET');
            console.log(result.templates);
            setObjectMoldsDb(result.templates)
            setObjectMolds(functions.sortArrayAlphabetically(functions.extractKeys(result.templates)))
        } catch (error) {
            console.error('Error:', error);
        }
    }

    useEffect(() => {
        console.log(editionState);
        if(editionState === 'editTemplate'){
            functions.injectDocumentStyle('frame', 'border: 5px solid blue;')
            setBody(body)
        } else if(editionState === 'testTemplate'){
            functions.removeDocumentClass('frame')
            setBody(body)
        }
        
    }, [editionState]);

    useEffect(() => {
        if (objectMoldsDb[objectMoldsInUse] !== undefined) {
            const obj = { ...objectMoldsDb[objectMoldsInUse] };
            console.log(obj);
            
            setBody(traverseAndEval(obj));
            if(Object.keys(obj).length === 0 && obj.constructor === Object){
                console.log('tiene....');
            }else {
                //setBodyEdit(traverseAndReplaceOnClick(injectLabelIntoJSON(obj, items), handleButtonClick))
                //setBodyTest(traverseAndEval(obj))
            }
            const bright = editionState
            const functiones = [
                { function: () => setEditionState('editTemplate'), setInterval: 1000 },
                { function: () => setEditionState('testTemplate'), setInterval: 1000 },
                { function: () => setEditionState('editTemplate'), setInterval: 1000 },
                { function: () => setEditionState(bright), setInterval: 1000 },
                { function: () => console.log('actualizó'), setInterval: 1000 }
            ];
            
            functions.executeFunctionsAtInterval(functiones)
        }
    }, [objectMoldsInUse]);//actualiza cada que se selecciona un nuevo objeto de la base de datos


    function closeAtributeTools(){
        console.log('entra');
        const containerIds = ['onclickId', 'classNameId', 'styleId', 'textId', 'ValueID', 'srcID'];
        const transitionClass = 'transition';
        containerIds.forEach(id => {
            const container = document.getElementById(id);
            if (container) {
                // Configurar contenedores para estar cerrados inicialmente
                container.style.height = '0px';
                container.style.width = '0px';
                container.style.overflow = 'hidden';
                container.setAttribute('data-shrunk', 'true');
            }
        });
    }

    useEffect(() => {
        //console.log('id: '+id);
        const foundObject = functions.findObjectById(body, id);
        if (foundObject) {
            setClassNames(foundObject.className)
            if(foundObject.type === 'Video'){
                setResourceType('video')
            } else if(foundObject.type === 'Image'){
                setResourceType('image')
            }
            closeAtributeTools()
        } else {
            console.log('Object not found');
        }
    }, [id]);

    useEffect(() => {
        //functions.convertStringFunctionsToOperables('multifunctions', functions, setBody)
        functions.injectDocumentStyle('frame', 'border: 5px solid blue;')
        functions.inyectClassNamesToDOM(functions.importClassNames())
        setAvailableClasses(functions.sortArrayAlphabetically(functions.getObjectKeysArray(functions.importClassNames(), '@')))
        fetchTemplates()
    }, []);

    useEffect(() => {
        setObjectMolds(functions.sortArrayAlphabetically(functions.extractKeys(objectMoldsDb)))
    }, [objectMoldsDb]);//al actualizarse los los templates hace que tambien se actualize los titulos de estos templates que estàn en setObjectMolds

    useEffect(() => {
        if (Object.keys(body).length !== 0) { 
            if (!isInjected) {
                setIsInjected(true);
                //const obj = traverseAndReplaceOnClick(injectLabelIntoJSON({...body}, items), handleButtonClick)
                //setBody(obj)
            }
        }
    }, [body, isInjected]);

    useEffect(() => {
        if(isReinjected === true){
            setIsReinjected(false);
            
            //setBody(traverseAndReplaceOnClick(body, handleButtonClick))
        }
    }, [body, isReinjected]);

    useEffect(() => {
        console.log(body);
    }, [body]);


    //let divstyle = { width: '20%', minWidth: '200px', maxWidth: '400px', height: '90%', background:  colorPalette()['color3'], padding: '20px', border: 'none', opacity: editionState === 'testTemplate' ? 0 : 1, visibility: editionState === 'testTemplate' ? 'hidden' : 'visible', transition: 'opacity 0.5s, visibility 0.5s' }
    let divstyle = { width: functions.isSmallScreen(800) ? '100%' : '20%', minWidth: '200px', maxWidth: '400px', height: '90%', background: colorPalette()['color3'], padding: '20px', border: 'none' }
    const cloneId = { cloneId: id };

    function handleCheckboxChange(){
        setIsRearrangeComponents(!isRearrangeComponents)
        setIsWrapChildren(!isWrapChildren)
    }

    function handleCheckboxChange2(){
        setIsMoveComponentsActivated(!isMoveComponentsActivated)
    }

    const check = ComponentRenderCheckbox(isWrapChildren, 'moveComponents', 'crear hijo envuelto', 'crear hijo separado', handleCheckboxChange, isRearrangeComponents);
    const check2 = ComponentRenderCheckbox(isMoveComponentsActivated, 'moveComponents2', 'mover componente', 'sin uso', handleCheckboxChange2, isMoveComponentsActivated);
    
    

    /*const MyComponent = () => {
        const actions = {
            'resizeOpen': () => functions.importRemoteFunctions('changeStyle', 'new_1729617774293', { width: '100px', height: '100px', transition: 'all 0.5s ease' }),
            'resizeClose': () => functions.importRemoteFunctions('changeStyle', 'new_1729617774293', { width: '50px', height: '50px', transition: 'all 0.5s ease' }),
            'resizeOpen2': () => functions.importRemoteFunctions('changeStyle', 'myElementId', { width: '100px', height: '100px', transition: 'all 0.5s ease' }),
            'resizeClose2': () => functions.importRemoteFunctions('changeStyle', 'myElementId', { width: '50px', height: '50px', transition: 'all 0.5s ease' }),
            'changeColorBlue': () => functions.importRemoteFunctions('changeStyle', 'myElementId', { color: 'blue', transition: 'all 0.5s ease' }),
            'changeColorWhite': () => functions.importRemoteFunctions('changeStyle', 'myElementId', { color: 'white', transition: 'all 0.5s ease' }),
            '1': () => functions.importRemoteFunctions('move', 'new_1730497731284', 100, 'left')
        };
        
        const [state, setCustomState] = useCustomState('initial', actions);
        
        return (
            <div>
                <div id="myElementId" style={{ width: '200px', height: '200px', background: 'red', position: 'relative' }}>
                    This is my element
                </div>
                <button onclick={()=> importRemoteFunctions('moveGallery', '1', 'left')}>Previous</button> 
                <button onclick={()=> importRemoteFunctions('moveGallery', '1', 'right')}>Next</button>
            </div>
        );
    };*/
    
        



    return (
        <div style={{background: colorPalette()['color1'], width: '100vw', height: '100vh'}}>
            <Menu zIndex={'999999999'} backgroundColor={colorPalette()['color4']} body={<SettingControls id={id} body={body} setIsModalOpen={setIsModalOpen} setModalContent={setModalContent} setEditionState={setEditionState} objectMolds={objectMolds} setIsReinjected={setIsReinjected} setBody={setBody}  objectMoldsDb={objectMoldsDb} handleButtonClick={handleButtonClick} setObjectMoldsInUse={setObjectMoldsInUse} objectMoldsInUse={objectMoldsInUse} setObjectMoldsDb={setObjectMoldsDb}/>} imageLink={'https://res.cloudinary.com/dplncudbq/image/upload/v1729800824/menu2_rtbvzo.png'}>
                <div className='center scroll borders1' style={{padding:'1vh',  width: '95vw', height: '95.8vh', display: functions.isSmallScreen(800) ? 'block' : 'flex', background: colorPalette()['color1']}}>
                    <div className='scroll borders1' style={divstyle}>
                    <RenderComponentNames component={body} handleButtonClick={handleButtonClick} selectedId={selectedId} setIsModalOpen={setIsModalOpen} setModalContent={setModalContent} setBody={setBody} setIsReinjected={setIsReinjected} cloneId={cloneId} body={body} setId={setId}  checkBox={check} isWrapChildren={isWrapChildren} check2={check2} isMoveComponentsActivated={isMoveComponentsActivated} selectedComponent={selectedComponent} setSelectedComponent={setSelectedComponent} />
                    </div>
                    <div className='' style={{width: '55%', height: '90%', background: 'transparent', border: 'none', position: 'relative'}}>
                        <Menu zIndex={'99'} backgroundColor={colorPalette()['color1']} body={<CmsMenuContent/>} imageLink={'https://res.cloudinary.com/dplncudbq/image/upload/v1701542645/menu1_ui2fw4.png'}>
                            {RenderElement(body)}
                        </Menu>
                    </div>
                    <div className='scroll borders1' style={divstyle}>
                        <ComponentRendererAttributes component={body} targetId={id} classNames={classNames} setClassNames={setClassNames} setBody={setBody} availableClasses={availableClasses} selectedClassName={selectedClassName} setSelectedClassName={setSelectedClassName} setIsReinjected={setIsReinjected} setIsModalOpen={setIsModalOpen} setModalContent={setModalContent} resourceType={resourceType} setSrcToInject={setSrcToInject} />    
                    </div>
                    <Modal isOpen={isModalOpen}  onClose={closeModal} children={modalContent}/>
                </div>
            </Menu>
        </div>
    )  
}











