import React, { useState } from 'react';
import CopyIcon from './copyIcon';
import WhatsAppIcon from './whatsAppIcon';

const ShareComponent = ({ link }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEmbedCopied, setIsEmbedCopied] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Generar el código de embed (iframe)
  const embedCode = `<iframe src="${link}" width="560" height="315" style="border: none;" allowFullScreen></iframe>`;

  // Copiar el enlace al portapapeles
  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Ocultar el mensaje después de 2 segundos
    });
  };

  // Copiar el código de embed al portapapeles
  const copyEmbedToClipboard = () => {
    navigator.clipboard.writeText(embedCode).then(() => {
      setIsEmbedCopied(true);
      setTimeout(() => setIsEmbedCopied(false), 2000); // Ocultar el mensaje después de 2 segundos
    });
  };

  // Compartir en WhatsApp
  const shareOnWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(link)}`;
    window.open(url, '_blank');
  };

  // Manejar errores del iframe
  const handleIframeError = () => {
    setIframeError(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      {/* Botones para copiar y compartir */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Botón para copiar el enlace */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            onClick={copyToClipboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <CopyIcon /> Copy Link
          </button>
        </div>

        {/* Botón para copiar el código de embed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            onClick={copyEmbedToClipboard}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#007bff',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <CopyIcon /> Copy Embed
          </button>
        </div>

        {/* Botón para compartir en WhatsApp */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button
            onClick={shareOnWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#25D366',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            <WhatsAppIcon /> Share via WhatsApp
          </button>
        </div>
      </div>

      {/* Mensajes de "Copiado" debajo de los botones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        {isCopied && <span style={{ color: 'white' }}>Link copied!</span>}
        {isEmbedCopied && <span style={{ color: 'white' }}>Embed code copied!</span>}
      </div>

      {/* Vista previa del iframe */}
      <div style={{ marginTop: '20px' }}>
        <h2>Preview</h2>
        {iframeError ? (
          <div style={{ color: 'white', padding: '10px', backgroundColor: '#ff4444', borderRadius: '8px' }}>
            The content cannot be displayed directly. Please visit the link.
          </div>
        ) : (
          <iframe
            src={link}
            width="100%"
            height="315"
            style={{ border: 'none', borderRadius: '8px' }}
            allowFullScreen
            onError={handleIframeError} // Manejar errores del iframe
          />
        )}
      </div>
    </div>
  );
};

export default ShareComponent;