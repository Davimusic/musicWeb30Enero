"use client";

import React, { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

// Opciones por defecto para el QR
const defaultOptions = {
  width: 250,
  height: 250,
  data: "https://example.com", // Valor por defecto
  image: "", // Deja vacío o provee la URL de un logo
  dotsOptions: {
    color: "#000000",
    type: "rounded", // Opciones: "dots", "rounded", "classy", etc.
  },
  cornersSquareOptions: {
    type: "extra-rounded", // Opciones: "dot", "square", "extra-rounded", etc.
  },
  backgroundOptions: {
    color: "#ffffff",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10,
  },
};

const QRGenerator = ({
  value = defaultOptions.data,
  width = defaultOptions.width,
  height = defaultOptions.height,
  image = defaultOptions.image,
  dotsColor = defaultOptions.dotsOptions.color,
  bgColor = defaultOptions.backgroundOptions.color,
  dotsType = defaultOptions.dotsOptions.type,
  cornersType = defaultOptions.cornersSquareOptions.type,
}) => {
  const qrRef = useRef(null);

  useEffect(() => {
    // Configuramos las opciones combinando lo recibido y lo por defecto
    const options = {
      width,
      height,
      data: value,
      image, // Si no deseas imagen, asegúrate de que este valor sea una cadena vacía ("")
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
      },
      cornersSquareOptions: {
        type: cornersType,
      },
      backgroundOptions: {
        color: bgColor,
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 5,
      },
    };

    // Instanciamos el QR Code con las opciones definidas
    const qrCode = new QRCodeStyling(options);

    // Limpiamos el contenedor y agregamos el QR generado
    if (qrRef.current) {
      qrRef.current.innerHTML = "";
      qrCode.append(qrRef.current);
    }

    // (Opcional) Limpiamos al desmontar el componente
    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = "";
      }
    };
  }, [value, width, height, image, dotsColor, bgColor, dotsType, cornersType]);

  return <div ref={qrRef} />;
};

export default QRGenerator;

