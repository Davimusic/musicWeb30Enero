import { useEffect } from 'react';
import interact from 'interactjs';
'../estilos/draggableComponent.css'


const DraggableComponent = () => {
  useEffect(() => {
    interact('.draggable')
      .draggable({
        listeners: {
          start(event) {
            event.target.classList.add('active');
          },
          move(event) {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
          end(event) {
            event.target.classList.remove('active');
          },
        },
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        listeners: {
          move(event) {
            const target = event.target;
            let x = (parseFloat(target.getAttribute('data-x')) || 0);
            let y = (parseFloat(target.getAttribute('data-y')) || 0);

            target.style.width = `${event.rect.width}px`;
            target.style.height = `${event.rect.height}px`;

            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          },
        },
      });
  }, []);

  return (
    <div>
    <div className="draggable"
      style={{
        width: '100px',
        height: '100px',
        backgroundColor: 'red',
        position: 'absolute',
        cursor: 'move',
        border: '2px solid transparent',
      }}></div>
      
    
      <div
        className="resize-handle top-left"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: 'blue',
          position: 'absolute',
          top: '-5px',
          left: '-5px',
          cursor: 'nwse-resize',
        }}
      ></div>
      <div
        className="resize-handle top-right"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: 'blue',
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          cursor: 'nesw-resize',
        }}
      ></div>
      <div
        className="resize-handle bottom-left"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: 'blue',
          position: 'absolute',
          bottom: '-5px',
          left: '-5px',
          cursor: 'nesw-resize',
        }}
      ></div>
      <div
        className="resize-handle bottom-right"
        style={{
          width: '10px',
          height: '10px',
          backgroundColor: 'blue',
          position: 'absolute',
          bottom: '-5px',
          right: '-5px',
          cursor: 'nwse-resize',
        }}
      ></div>
    </div>
  );
};

export default DraggableComponent


