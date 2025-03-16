import { useState, useEffect, useRef } from "react";

const ResponsiveContent = ({ children, hiddenContent, showContent }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [renderContent, setRenderContent] = useState(showContent);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Controlar la altura y renderizado
  useEffect(() => {
    let timeoutId;

    if (showContent) {
      setRenderContent(true);
      // Esperar a que el contenido se renderice para calcular la altura
      timeoutId = setTimeout(() => {
        if (contentRef.current) {
          setMaxHeight(`${contentRef.current.scrollHeight}px`);
        }
      }, 10);
    } else {
      setMaxHeight("0px");
      // Esperar a que termine la transición para desmontar
      timeoutId = setTimeout(() => setRenderContent(false), 300); // Ajusta este tiempo según la duración de la transición
    }

    // Cleanup function to clear the timeout
    return () => clearTimeout(timeoutId);
  }, [showContent]);

  // Estilos dinámicos
  const contentStyle = {
    overflow: "hidden",
    transition: "all 0.3s ease-out",
    maxHeight: isMobile ? maxHeight : "none",
    opacity: showContent ? 1 : 0,
    transform: `translateY(${showContent ? 0 : "-10px"})`,
    transitionProperty: "max-height, opacity, transform", // Especifica las propiedades que se animarán
  };

  return (
    <div>
      {!isMobile && children}
      
      {isMobile && (
        <div
          ref={contentRef}
          style={contentStyle}
        >
          {renderContent && (showContent ? children : hiddenContent)}
        </div>
      )}
    </div>
  );
};

export default ResponsiveContent;