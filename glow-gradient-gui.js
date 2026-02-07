// Simple GUI for glow gradient editor
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm";

let gui = null;
let guiVisible = false;

// Wait for both glow-gradient.js AND script.js to set up
function initGUI() {
  if (typeof window.GlowGradientParams === 'undefined' || typeof window.PostFXParams === 'undefined') {
    setTimeout(initGUI, 100);
    return;
  }

  const params = window.GlowGradientParams;
  const params2 = window.GlowGradientParams2;
  const updateFunctions = window.GlowGradientUpdateFunctions || {};

  gui = new GUI();
  gui.domElement.style.position = "fixed";
  gui.domElement.style.top = "60px";
  gui.domElement.style.right = "10px";
  gui.domElement.style.zIndex = "10000";
  gui.domElement.style.maxHeight = "80vh";
  gui.domElement.style.overflowY = "auto";

  // Global settings
  const globalFolder = gui.addFolder("Global");
  if (updateFunctions.updateGlobalBlur) {
    globalFolder.add(params, "globalBlur", 0, 100, 0.5).name("Global Blur").onChange(() => {
      if (updateFunctions.updateGlobalBlur) updateFunctions.updateGlobalBlur();
    });
  }
  
  // Vignette
  if (!params.vignetteIntensity) params.vignetteIntensity = 0.4;
  if (!params.vignetteColor) params.vignetteColor = "#000000";
  if (!params.vignetteBlendMode) params.vignetteBlendMode = "normal";
  const vignetteFolder = globalFolder.addFolder("Vignette");
  vignetteFolder.add(params, "vignetteIntensity", 0, 1, 0.01).name("Intensity").onChange(() => {
    if (updateFunctions.updateVignette) updateFunctions.updateVignette();
  });
  vignetteFolder.addColor(params, "vignetteColor").name("Color").onChange(() => {
    if (updateFunctions.updateVignette) updateFunctions.updateVignette();
  });
  vignetteFolder.add(params, "vignetteBlendMode", ["normal", "multiply", "screen", "overlay", "soft-light", "hard-light", "color-dodge", "color-burn", "darken", "lighten", "difference", "exclusion"]).name("Blend Mode").onChange(() => {
    if (updateFunctions.updateVignette) updateFunctions.updateVignette();
  });
  
  if (updateFunctions.updateGrain) {
    const grainFolder = gui.addFolder("Grain");
    grainFolder.add(params, "grainOpacity", 0, 1, 0.01).name("Opacity").onChange(() => {
      if (updateFunctions.updateGrain) updateFunctions.updateGrain();
    });
    grainFolder.add(params, "grainScale", 0.1, 5, 0.1).name("Scale").onChange(() => {
      if (updateFunctions.updateGrain) updateFunctions.updateGrain();
    });
    grainFolder.add(params, "grainBlend", ["normal", "multiply", "screen", "overlay", "soft-light", "hard-light"]).name("Blend Mode").onChange(() => {
      if (updateFunctions.updateGrain) updateFunctions.updateGrain();
    });
  }

  // Layer 1
  const layer1Folder = gui.addFolder("Layer 1");
  const colorFolder1 = layer1Folder.addFolder("Colors");
  colorFolder1.addColor(params, "colorStop1").name("Color 1");
  colorFolder1.addColor(params, "colorStop2").name("Color 2");
  colorFolder1.addColor(params, "colorStop3").name("Color 3");
  colorFolder1.addColor(params, "colorStop4").name("Color 4");
  colorFolder1.addColor(params, "colorStop5").name("Color 5");
  
  const positionFolder1 = layer1Folder.addFolder("Position");
  positionFolder1.add(params, "positionPercentX", 0, 200, 1).name("X %");
  positionFolder1.add(params, "positionPercentY", 0, 200, 1).name("Y %");
  
  const shapeFolder1 = layer1Folder.addFolder("Shape");
  shapeFolder1.add(params, "scaleX", 0.25, 3.0, 0.01).name("Width");
  shapeFolder1.add(params, "scaleY", 0.25, 3.0, 0.01).name("Height");
  shapeFolder1.add(params, "blur", 0, 200, 1).name("Blur");
  shapeFolder1.add(params, "feather", 0, 100, 1).name("Feather");
  shapeFolder1.add(params, "waveHeight", 0, 200, 1).name("Wave Height");
  shapeFolder1.add(params, "waveSpeed", 0, 1, 0.01).name("Wave Speed");
  
  const patternFolder1 = layer1Folder.addFolder("Pattern");
  patternFolder1.add(params, "patternScale", 0, 2, 0.01).name("Scale");
  patternFolder1.add(params, "patternSpeed", 0, 2, 0.01).name("Speed");
  patternFolder1.add(params, "patternIntensity", 0, 2, 0.01).name("Intensity");
  patternFolder1.add(params, "patternContrast", 0, 3, 0.01).name("Contrast");

  // Layer 2
  const layer2Folder = gui.addFolder("Layer 2");
  const colorFolder2 = layer2Folder.addFolder("Colors");
  colorFolder2.addColor(params2, "colorStop1").name("Color 1");
  colorFolder2.addColor(params2, "colorStop2").name("Color 2");
  colorFolder2.addColor(params2, "colorStop3").name("Color 3");
  colorFolder2.addColor(params2, "colorStop4").name("Color 4");
  colorFolder2.addColor(params2, "colorStop5").name("Color 5");
  
  const positionFolder2 = layer2Folder.addFolder("Position");
  positionFolder2.add(params2, "positionPercentX", 0, 200, 1).name("X %");
  positionFolder2.add(params2, "positionPercentY", 0, 200, 1).name("Y %");
  
  const shapeFolder2 = layer2Folder.addFolder("Shape");
  shapeFolder2.add(params2, "scaleX", 0.25, 3.0, 0.01).name("Width");
  shapeFolder2.add(params2, "scaleY", 0.25, 3.0, 0.01).name("Height");
  shapeFolder2.add(params2, "blur", 0, 200, 1).name("Blur");
  shapeFolder2.add(params2, "feather", 0, 100, 1).name("Feather");
  shapeFolder2.add(params2, "waveHeight", 0, 200, 1).name("Wave Height");
  shapeFolder2.add(params2, "waveSpeed", 0, 1, 0.01).name("Wave Speed");
  
  const patternFolder2 = layer2Folder.addFolder("Pattern");
  patternFolder2.add(params2, "patternScale", 0, 2, 0.01).name("Scale");
  patternFolder2.add(params2, "patternSpeed", 0, 2, 0.01).name("Speed");
  patternFolder2.add(params2, "patternIntensity", 0, 2, 0.01).name("Intensity");
  patternFolder2.add(params2, "patternContrast", 0, 3, 0.01).name("Contrast");

  // Blend mode
  const blendFolder = gui.addFolder("Blending");
  blendFolder.add({ blendMode: params.blendMode || "screen" }, "blendMode", ["normal", "multiply", "screen", "overlay", "soft-light", "hard-light", "color-dodge", "color-burn", "darken", "lighten", "difference", "exclusion"]).name("Blend Mode").onChange((value) => {
    params.blendMode = value;
    if (updateFunctions.updateBlendMode) updateFunctions.updateBlendMode(value);
  });

  // Post FX folder
  const pfx = window.PostFXParams;
  const fxFolder = gui.addFolder("Post FX");
  fxFolder.add(pfx, "hueRotate", -180, 180, 1).name("Hue Rotate");
  fxFolder.add(pfx, "hueSpeed", 0, 3, 0.01).name("Hue Cycle Speed");
  fxFolder.add(pfx, "saturate", 0, 3, 0.01).name("Saturation");
  fxFolder.add(pfx, "contrast", 0.5, 2, 0.01).name("Contrast");
  fxFolder.add(pfx, "brightness", 0.5, 2, 0.01).name("Brightness");
  fxFolder.add(pfx, "scanlineOpacity", 0, 1, 0.01).name("Scanlines");
  fxFolder.add(pfx, "rgbShiftOpacity", 0, 1, 0.01).name("RGB Shift");
  fxFolder.add(pfx, "bgSpeed", 0.1, 5, 0.1).name("BG Drift Speed");
  fxFolder.add(pfx, "lightLeakOpacity", 0, 1, 0.01).name("Light Leaks");

  // Depth of Field folder
  const dofFolder = gui.addFolder("Depth of Field");
  dofFolder.add(pfx, "dofEnabled").name("Enabled");
  dofFolder.add(pfx, "dofMaxBlur", 0, 8, 0.5).name("Max Blur");
  dofFolder.add(pfx, "dofFocusRadius", 50, 600, 10).name("Focus Radius");

  gui.hide();
  guiVisible = false;
}

// Toggle GUI with Cmd+G (Mac) / Ctrl+G (other)
document.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "g") {
    e.preventDefault();
    if (!gui) {
      initGUI();
      // Show after init
      setTimeout(() => { if (gui) { gui.show(); guiVisible = true; } }, 600);
      return;
    }
    if (guiVisible) {
      gui.hide();
      guiVisible = false;
    } else {
      gui.show();
      guiVisible = true;
    }
  }
});

// Start initialization (hidden by default)
setTimeout(initGUI, 500);
