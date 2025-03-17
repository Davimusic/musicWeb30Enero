import { useState, useEffect, useRef } from "react";

const ResponsiveContent = ({ children, showContent }) => {
  const [isMobile, setIsMobile] = useState(false);
  const contentRef = useRef(null);
  const [maxHeight, setMaxHeight] = useState("0px");

  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Configuración inicial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Control de la altura basado en showContent
  useEffect(() => {
    if (showContent) {
      if (contentRef.current) {
        setMaxHeight(`${contentRef.current.scrollHeight}px`);
      }
    } else {
      setMaxHeight("0px");
    }
  }, [showContent]);

  // Estilos dinámicos
  const contentStyle = {
    overflow: "hidden",
    transition: "all 0.3s ease-out",
    maxHeight: isMobile ? maxHeight : "none",
    opacity: showContent ? 1 : 0,
    transform: `translateY(${showContent ? 0 : "-10px"})`,
  };

  return (
    <div>
      {/* Mostrar children solo si showContent es true */}
      {showContent && (
        <div ref={contentRef} style={contentStyle}>
          {children}
        </div>
      )}
    </div>
  );
};

export default ResponsiveContent;
