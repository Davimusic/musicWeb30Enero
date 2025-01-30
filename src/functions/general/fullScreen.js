export default function fullScreen(id) {
    console.log(id);
    let element
    if(id != null){
        element = document.getElementById(id)
    } else {
        element = document.documentElement; // Esto selecciona todo el documento
    }
  
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else if (element.mozRequestFullScreen) { // Firefox
      element.mozRequestFullScreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else if (element.webkitRequestFullscreen) { // Chrome, Safari y Opera
      element.webkitRequestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else if (element.msRequestFullscreen) { // IE/Edge
      element.msRequestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    }
  }
  
  
  