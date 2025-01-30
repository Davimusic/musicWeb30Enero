import React from 'react';
import Text from '@/components/simple/text';
import Video from '@/components/simple/video';
import Audio from '@/components/simple/audio';
import Link from 'next/link';
import Container from '@/components/simple/container';
import Label from '@/components/simple/label';
import Button from '@/components/simple/button';
import Icon from '@/components/simple/icon';
import Input from '@/components/simple/input'
import Image from '@/components/simple/image';
import TextArea from '@/components/simple/textArea';
import Select  from '@/components/simple/selects';


const RenderElement = (element) => {
    
    switch (element.type) {
        case 'Text':
            return <Text id={element.id} onClick={element.onClick} text={element.text} style={element.style} className={element.className} />;
        case 'Video':
            return <Video id={element.id} onClick={element.onClick} src={element.src} style={element.style} className={element.className} />;
        case 'Audio':
            return <Audio id={element.id} autoPlay={element.autoPlay} loop={element.loop} controlsList={element.controlsList} src={element.src} className={element.className} />;
        case 'Link':
            return <Link id={element.id} style={element.style} href={element.href} className={element.className}>{element.text}</Link>;
        case 'Button':
                return <Button children={element.children} id={element.id} onClick={element.onClick} style={element.style} className={element.className}/>
        case 'Icon':
            return <Icon iconType={element.iconType} style={element.style} className={element.className} />;
        case 'Input':
            return <Input  inputType={element.inputType} id={element.id} style={element.style} required={element.required} onValueChange={element.onValueChange} value={element.value} name={element.name} className={element.className} />;
        case 'Label':
            return <Label id={element.id} style={element.style} value={element.value} onValueChange={element.onValueChange || (() => {})} className={element.className} name={element.name}/>;
            
            case 'TextArea': 
            return <TextArea id={element.id} style={element.style} required={element.required} onValueChange={element.onValueChange} value={element.value} name={element.name} className={element.className} />;
        case 'Image':
            return <Image id={element.id} onClick={element.onClick} src={element.src} alt={element.alt} className={element.className} style={element.style} height={element.height} width={element.width} />;
        case 'Select': 
            return <Select id={element.id} name={element.name} value={element.value} options={element.options} event={element.event} style={element.style} className={element.className} />;
        case 'Container':
            return (
                <Container id={element.id} onClick={element.onClick} style={element.style} className={element.className}>
                    {element.children.map((child, index) => (
                        <React.Fragment key={index}>{RenderElement(child)}</React.Fragment>
                    ))}
                </Container>
            );       
        default:
            return null;
    }
};

export default RenderElement;
