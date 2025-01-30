import React from 'react';
import Image from "@/components/simple/image"; // Adjust the import path as needed
import toggleContainerSize from "./toggleContainerSize";

class ComponentToggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isToggled: false
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick(event) {
        toggleContainerSize([this.props.id], 'transition');
        this.setState(prevState => ({
            isToggled: !prevState.isToggled
        }));
    }

    render() {
        const { isToggled } = this.state;
        const imageStyle = {
            width: '4vh',
            height: '4vh',
            transform: isToggled ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
        };

        return (
            <div
                className="center"
                style={{
                    
                    width: '4vh',
                    height: '4vh',
                    
                }}
                onClick={this.handleClick}
            >
                <Image
                    src={'https://res.cloudinary.com/dplncudbq/image/upload/v1729720338/menu_u90gbh.png'}
                    style={imageStyle}
                    width={50}
                    height={50}
                    alt={'upload files'}
                />
            </div>
        );
    }
}

export default ComponentToggle;







/*import toggleContainerSize from "./toggleContainerSize";

export default function ComponentToggle( id ) {
    //console.log(id);
    
    function all(event) {
        toggleContainerSize([id], 'transition');
        const currentText = event.target.innerText;
        event.target.innerText = currentText === 'x' ? '+' : 'x';
    }

    return (
        <div className="center" style={{ background: 'white', color: 'black', fontSize: '3vh', borderRadius: '50%', width: '4vh', border: 'solid 2px black', padding: '2px', margin: '2px'  }} onClick={all}>
            x
        </div>
    );
    
}*/


