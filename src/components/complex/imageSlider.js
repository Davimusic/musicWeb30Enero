import { useState, useEffect } from "react";
import Modal from "./modal";
import NextBeforeIcon from "./nextBeforeIcon";
import TogglePlayPause from "./TogglePlayPause";
import ShuffleButton from "./ShuffleButton";
import EffectsIcon from "./effectsIcon";
import "../../estilos/general/imageSlider.css";
import "../../estilos/general/general.css";

const ImageSlider = ({
  images = [],
  // Si showControls es false, la barra de controles (y el modal) NO se renderizan.
  showControls = true,
  // Objeto para definir qué controles se muestran. Valores por defecto:
  controls = {
    showPrevious: true,
    showPlayPause: true,
    showNext: true,
    showShuffle: true,
    showEffects: true,
  },
  // Si se pasa fixedEffect, se usará siempre ese efecto y se deshabilitará la opción de cambiarlo.
  fixedEffect,
  timeToShow = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  // Bandera para el modo aleatorio (shuffle).
  const [isShuffle, setIsShuffle] = useState(false);
  // Valores posibles para transitionEffect:
  // "none", "fade", "slide", "zoom", "rotate", "flip", "blur", "slideDown", "slideUp", "random"
  // Se inicia con fixedEffect (si existe) o con "fade" por defecto.
  const [transitionEffect, setTransitionEffect] = useState(fixedEffect || "fade");
  const [currentRandomEffect, setCurrentRandomEffect] = useState("none");

  // Si se pasa fixedEffect, forzamos el efecto.
  useEffect(() => {
    if (fixedEffect) {
      setTransitionEffect(fixedEffect);
    }
  }, [fixedEffect]);

  // Auto-play: cambia la imagen cada 2 segundos. Si está en modo shuffle, elige el siguiente índice aleatoriamente.
  useEffect(() => {
    if (!isPlaying || images.length === 0) return;
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (isShuffle) {
          let randomImgIndex = Math.floor(Math.random() * images.length);
          if (images.length > 1 && randomImgIndex === prevIndex) {
            randomImgIndex = (prevIndex + 1) % images.length;
          }
          return randomImgIndex;
        } else {
          return (prevIndex + 1) % images.length;
        }
      });
    }, timeToShow);
    return () => clearInterval(intervalId);
  }, [images, isPlaying, isShuffle]);

  // Si el efecto seleccionado es "random", se elige un efecto aleatorio para cada cambio.
  useEffect(() => {
    if (transitionEffect === "random") {
      const availableEffects = [
        "fade",
        "slide",
        "zoom",
        "rotate",
        "flip",
        "blur",
        "slideDown",
        "slideUp",
      ];
      const randomIndex = Math.floor(Math.random() * availableEffects.length);
      setCurrentRandomEffect(availableEffects[randomIndex]);
    }
  }, [currentIndex, transitionEffect]);

  // Navegación manual: permite especificar si se pausa el autoplay (por defecto sí, salvo para acciones de shuffle).
  const handleManualNavigation = (newIndex, pauseAutoplay = true) => {
    setCurrentIndex(newIndex);
    if (pauseAutoplay && isPlaying) {
      setIsPlaying(false);
    }
  };

  const goToNext = () => {
    if (isShuffle) {
      let randomImgIndex = Math.floor(Math.random() * images.length);
      if (images.length > 1 && randomImgIndex === currentIndex) {
        randomImgIndex = (currentIndex + 1) % images.length;
      }
      handleManualNavigation(randomImgIndex, true);
    } else {
      handleManualNavigation((currentIndex + 1) % images.length, true);
    }
  };

  const goToPrevious = () => {
    if (isShuffle) {
      let randomImgIndex = Math.floor(Math.random() * images.length);
      if (images.length > 1 && randomImgIndex === currentIndex) {
        randomImgIndex = (currentIndex - 1 + images.length) % images.length;
      }
      handleManualNavigation(randomImgIndex, true);
    } else {
      handleManualNavigation((currentIndex - 1 + images.length) % images.length, true);
    }
  };

  // Con el botón de shuffle SOLO se activa o desactiva el modo aleatorio; no cambia la imagen inmediatamente.
  const toggleShuffle = () => {
    setIsShuffle((prev) => !prev);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const handleEffectSelection = (effect) => {
    setTransitionEffect(effect);
    setModalOpen(false);
  };

  // Mapeo de clases para la imagen principal.
  const effectClasses = {
    none: "",
    fade: "fadeTransition",
    slide: "slideTransition",
    zoom: "zoomTransition",
    rotate: "rotateTransition",
    flip: "flipTransition",
    blur: "blurTransition",
    slideDown: "slideDownTransition",
    slideUp: "slideUpTransition",
  };

  // Mapeo de clases para la imagen de fondo.
  const bgEffectClasses = {
    none: "",
    fade: "bg-fadeTransition",
    slide: "bg-slideTransition",
    zoom: "bg-zoomTransition",
    rotate: "bg-rotateTransition",
    flip: "bg-flipTransition",
    blur: "bg-blurTransition",
    slideDown: "bg-slideDownTransition",
    slideUp: "bg-slideUpTransition",
  };

  const chosenEffect =
    transitionEffect === "random" ? currentRandomEffect : transitionEffect;
  const effectClass = effectClasses[chosenEffect] || "";
  const bgEffectClass = bgEffectClasses[chosenEffect] || "";

  if (images.length === 0) {
    return <div className="slider-container">No images available.</div>;
  }

  return (
    <div className="slider-container">
      <div className="slider">
        <div className="image-wrapper">
          {/* Imagen de fondo */}
          <img
            key={`bg-${currentIndex}-${chosenEffect}`}
            src={images[currentIndex]}
            alt={`Background image ${currentIndex}`}
            className={`background-image ${bgEffectClass}`}
          />
          {/* Imagen principal */}
          <img
            key={`${currentIndex}-${chosenEffect}`}
            src={images[currentIndex]}
            alt={`Image ${currentIndex}`}
            className={`slideImage ${effectClass}`}
          />
        </div>
      </div>
      {showControls && (
        <div className="controls backgroundColor1">
          {controls.showPrevious && (
            <NextBeforeIcon size={30} direction="left" onToggle={goToPrevious} />
          )}
          {controls.showPlayPause && (
            <TogglePlayPause size={30} isPlaying={isPlaying} onToggle={handlePlayPause} />
          )}
          {controls.showNext && (
            <NextBeforeIcon size={30} direction="right" onToggle={goToNext} />
          )}
          {controls.showShuffle && (
            <ShuffleButton size={30} isShuffle={isShuffle} toggleShuffle={toggleShuffle} />
          )}
          {(!fixedEffect && controls.showEffects) && (
            <EffectsIcon size={30} onClick={openModal} />
          )}
        </div>
      )}
      {(!fixedEffect && showControls) && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
          <h2 style={{ color: "#fff", textAlign: "center", marginBottom: "15px" }}>
            Select a transition effect
          </h2>
          <div className="modal-options">
            <button onClick={() => handleEffectSelection("random")}>
              Random effect
            </button>
            <button onClick={() => handleEffectSelection("none")}>
              No effect
            </button>
            <button onClick={() => handleEffectSelection("fade")}>Fade</button>
            <button onClick={() => handleEffectSelection("slide")}>Slide</button>
            <button onClick={() => handleEffectSelection("zoom")}>Zoom</button>
            <button onClick={() => handleEffectSelection("rotate")}>
              Rotate
            </button>
            <button onClick={() => handleEffectSelection("flip")}>Flip</button>
            <button onClick={() => handleEffectSelection("blur")}>Blur</button>
            <button onClick={() => handleEffectSelection("slideDown")}>
              Slide down
            </button>
            <button onClick={() => handleEffectSelection("slideUp")}>
              Slide up
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ImageSlider;


