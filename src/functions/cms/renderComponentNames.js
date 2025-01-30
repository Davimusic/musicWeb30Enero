import React, { useState } from 'react';
import Image from "next/image";
import ComponentTableNames from "./componentTableNames";
import ComponentToggle from "./componentToggle";
import findObjectById from '@/functions/general/findObjectById';
import udpateBodies from './udpateBodies';
import toggleStyleById from '@/functions/general/toggleStyleById';
import colorPalette from './colorPalette';


const RenderComponentNames = ({
    component,
    handleButtonClick,
    selectedId,
    setIsModalOpen,
    setModalContent,
    setBody,
    setIsReinjected,
    cloneId,
    body,
    setId,
    /*setBodyEdit,
    setBodyTest,*/
    bodyTest,
    checkBox,
    isWrapChildren,
    check2,
    isMoveComponentsActivated,
    selectedComponent,
    setSelectedComponent
}) => {
    const { type, id, children } = component;
    let depth = 0;
    let checkBoxRendered = false;

    const modal = (id) => {
        setId(id);
        setIsModalOpen(true);
        setModalContent(
            <ComponentTableNames 
                body={body}
                setBody={setBody}
                id={cloneId}
                setIsReinjected={setIsReinjected}
                setIsModalOpen={setIsModalOpen}
                /*setBodyEdit={setBodyEdit}
                setBodyTest={setBodyTest}*/
                bodyTest={bodyTest}
                isWrapChildren={isWrapChildren}
            />
        );
    };

    const shouldRenderCheckBox = !checkBoxRendered;
    if (shouldRenderCheckBox) {
        checkBoxRendered = true;
    }

    const uniqueId = `container-${id}`;

    const handleComponentClick = (e, id) => {
        e.stopPropagation();
        if (isMoveComponentsActivated) {
            if (!selectedComponent) {
                setSelectedComponent(id);
                toggleStyleById(`${id}Component`, 'background', colorPalette()['color3'], true);
            } else {
                if (selectedComponent === id) {
                    console.log("No se puede mover el componente a sí mismo.");
                    return;
                }
                const obj = { ...body };
                const sourceComponent = findObjectById(obj, selectedComponent);
                const targetComponent = findObjectById(obj, id);
                if (sourceComponent && targetComponent) {
                    const removeComponent = (component, id) => {
                        if (component.children) {
                            component.children = component.children.filter(child => {
                                if (child.id === id) {
                                    return false;
                                }
                                if (child.children) {
                                    child.children = removeComponent(child, id);
                                }
                                return true;
                            });
                        }
                        return component.children;
                    };
                    obj.children = removeComponent(obj, selectedComponent);
                    if (targetComponent.type === 'Container' && targetComponent.children) {
                        targetComponent.children.push(sourceComponent);
                    } else {
                        const insertAfterComponent = (component, targetId, sourceComponent) => {
                            if (component.children) {
                                for (let i = 0; i < component.children.length; i++) {
                                    if (component.children[i].id === targetId) {
                                        component.children.splice(i + 1, 0, sourceComponent);
                                        return component.children;
                                    }
                                    if (component.children[i].children) {
                                        component.children[i].children = insertAfterComponent(
                                            component.children[i],
                                            targetId,
                                            sourceComponent
                                        );
                                    }
                                }
                            }
                            return component.children;
                        };
                        obj.children = insertAfterComponent(obj, id, sourceComponent);
                    }
                    toggleStyleById(`${selectedComponent}Component`, 'background', colorPalette()['color3'], false);
                    udpateBodies({ ...obj }, { ...obj }, true, setIsReinjected, setBody);
                    setSelectedComponent(null);
                }
            }
        } else {
            handleButtonClick(id);
        }
    };

    return (
        <div id={`${id}Component`} style={{ marginLeft: depth * 2, paddingLeft: '5px' }}>
            {shouldRenderCheckBox && checkBox}
            {shouldRenderCheckBox && check2}
            {isWrapChildren}
            <div
                className={`${selectedId === id ? 'borders1' : ''} cursor`}
                style={{ background: selectedId === id ? 'black' : 'none', padding: '10px' }}
                onClick={(e) => handleComponentClick(e, id)}
            >
                {type}
                {type === 'Container' ? (
                    <Image
                        onClick={() => modal(id)}
                        src='https://res.cloudinary.com/dplncudbq/image/upload/v1729718949/plus_b987af.png'
                        style={{ marginLeft: '20px', width: '30px', height: '30px', background: 'white', borderRadius: '50%' }}
                        width={30}
                        height={30}
                    />
                ) : null}
            </div>
            {children && (
                <>
                    <ComponentToggle id={uniqueId} />
                    <div id={uniqueId} className="borders1" style={{ background: '#33303083' }}>
                        {children.map((child, index) => (
                            <div key={index}>
                                <RenderComponentNames
                                    component={child}
                                    handleButtonClick={handleButtonClick}
                                    selectedId={selectedId}
                                    setIsModalOpen={setIsModalOpen}
                                    setModalContent={setModalContent}
                                    setBody={setBody}
                                    setIsReinjected={setIsReinjected}
                                    cloneId={cloneId}
                                    body={body}
                                    setId={setId}
                                    /*setBodyEdit={setBodyEdit}
                                    setBodyTest={setBodyTest}*/
                                    bodyTest={bodyTest}
                                    checkBox={false}
                                    isWrapChildren={isWrapChildren}
                                    check2={false}
                                    isMoveComponentsActivated={isMoveComponentsActivated}
                                    selectedComponent={selectedComponent}
                                    setSelectedComponent={setSelectedComponent}
                                />
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default RenderComponentNames;













