import { useState, useEffect, useRef } from "react";
import { GlobalControls } from "../DAW2/controls";

export const useAudioControls = (props) => {
  const [editorHeight, setEditorHeight] = useState("100vh");
  const controlsRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (controlsRef.current) {
        setEditorHeight(`${window.innerHeight - controlsRef.current.offsetHeight}px`);
      }
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return {
    GlobalControlsComponent: () => <div ref={controlsRef}><GlobalControls {...props} /></div>,
    editorHeight
  };
};