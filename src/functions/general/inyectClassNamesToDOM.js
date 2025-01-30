const inyectClassNamesToDOM = (styles) => {
    const styleSheet = document.createElement('style');
    styleSheet.type = 'text/css';
  
    for (const className in styles) {
      if (styles.hasOwnProperty(className)) {
        let styleString = `.${className} {`;
        const styleObj = styles[className];
        for (const property in styleObj) {
          if (styleObj.hasOwnProperty(property)) {
            const kebabProperty = property.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
            styleString += `${kebabProperty}: ${styleObj[property]}; `;
          }
        }
        styleString += '}';
        styleSheet.innerHTML += styleString;
      }
    }
  
    document.head.appendChild(styleSheet);
  };

  export default inyectClassNamesToDOM