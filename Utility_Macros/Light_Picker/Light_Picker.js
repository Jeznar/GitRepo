const MACRONAME = "Light_Picker_0.3"
/*****************************************************************************************
 * Sample Macro that sets token Lighting
 * 
 * 12/13/21 0.1 Copy macro from compendium
 * 12/14/21 0.2 Add some debug/trace statements
 * 05/02/22 0.3 Update for FoundryVTT 9.x
 *****************************************************************************************/
const DEBUG = true;

function tokenUpdate(data) {
    if (DEBUG) {
        console.log(`tokenUpdate start`, data)
        console.log(`token `, token)
    }
    canvas.tokens.controlled.map(token => token.document.update(data));
    if (DEBUG) {
        console.log(`tokenUpdate stop`, data)
        console.log(`token `, token)
    }
}

let torchAnimation = {"type": "torch", "speed": 1, "intensity": 1};

let dialogEditor = new Dialog({
  title: `Token Light Picker`,
  content: `Pick the light source the selected token is holding.`,
  buttons: {
    none: {
      label: `None`,
      callback: () => {
        tokenUpdate({"dimLight": 0, "brightLight": 0, "lightAngle": 360,});
        dialogEditor.render(true);
      }
    },
    torch: {
      label: `Torch`,
      callback: () => {
        tokenUpdate({"dimLight": 40, "brightLight": 20, "lightAngle": 360, "lightAnimation": torchAnimation});
        dialogEditor.render(true);
      }
    },
    light: {
      label: `Light cantrip`,
      callback: () => {
        tokenUpdate({"dimLight": 40, "brightLight": 20, "lightAngle": 360, "lightAnimation": {"type": "none"}});
        dialogEditor.render(true);
      }
    },
    lamp: {
      label: `Lamp`,
      callback: () => {
        tokenUpdate({"dimLight": 45, "brightLight": 15, "lightAngle": 360, "lightAnimation": torchAnimation});
        dialogEditor.render(true);
      }
    },
    bullseye: {
      label: `Bullseye Lantern`,
      callback: () => {
        tokenUpdate({"dimLight": 120, "brightLight": 60, "lightAngle": 45, "lightAnimation": torchAnimation});
        dialogEditor.render(true);
      }
    },
    hoodedOpen: {
      label: `Hooded Lantern (Open)`,
      callback: () => {
        tokenUpdate({"dimLight": 60, "brightLight": 30, "lightAngle": 360, "lightAnimation": torchAnimation});
        dialogEditor.render(true);
      }
    },
    hoodedClosed: {
      label: `Hooded Lantern (Closed)`,
      callback: () => {
        tokenUpdate({"dimLight": 5, "brightLight": 0, "lightAngle": 360, "lightAnimation": torchAnimation});
        dialogEditor.render(true);
      }
    },
    darkness: {
      label: `Darkness spell`,
      callback: () => {
        tokenUpdate({"dimLight": 0, "brightLight": -15, "lightAngle": 360, "lightAnimation": {"type": "none"}});
        dialogEditor.render(true);
      }
    },
    close: {
      icon: "<i class='fas fa-tick'></i>",
      label: `Close`
    },
  },
  default: "close",
  close: () => {}
});

dialogEditor.render(true)