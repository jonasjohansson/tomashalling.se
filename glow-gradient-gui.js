// GUI for tweaking PostFX and visual params
import GUI from "https://cdn.jsdelivr.net/npm/lil-gui@0.21/+esm";

let gui = null;
let guiVisible = true;

function initGUI() {
  if (typeof window.PostFXParams === 'undefined') {
    setTimeout(initGUI, 100);
    return;
  }

  const pfx = window.PostFXParams;

  gui = new GUI({ title: 'Visual Controls' });
  gui.domElement.style.position = "fixed";
  gui.domElement.style.top = "10px";
  gui.domElement.style.right = "10px";
  gui.domElement.style.zIndex = "10000";
  gui.domElement.style.maxHeight = "90vh";
  gui.domElement.style.overflowY = "auto";

  // Post FX
  const fxFolder = gui.addFolder("Post FX");
  fxFolder.add(pfx, "saturate", 0, 3, 0.01).name("Saturation");
  fxFolder.add(pfx, "contrast", 0.5, 2, 0.01).name("Contrast");
  fxFolder.add(pfx, "brightness", 0.5, 2, 0.01).name("Brightness");
  fxFolder.add(pfx, "rgbShiftOpacity", 0, 1, 0.01).name("RGB Shift");
  fxFolder.add(pfx, "bgSpeed", 0.1, 5, 0.1).name("BG Drift Speed");
  fxFolder.add(pfx, "lightLeakOpacity", 0, 1, 0.01).name("Light Leaks");

  // Depth of Field
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
    if (!gui) return;
    if (guiVisible) {
      gui.hide();
      guiVisible = false;
    } else {
      gui.show();
      guiVisible = true;
    }
  }
});

// Init immediately (visible by default)
setTimeout(initGUI, 300);
