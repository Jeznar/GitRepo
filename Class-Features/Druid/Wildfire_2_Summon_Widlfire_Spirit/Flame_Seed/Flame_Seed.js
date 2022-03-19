const MACRONAME = "Flame_Seed.js"
/*****************************************************************************************
 * Run a two seto VFX that changes based on target hit or miss
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
const LAST_ARG = args[args.length - 1];
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
    else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
    else aItem = LAST_ARG.efData?.flags?.dae?.itemData;

//-----------------------------------------------------------------------------------------
// Determine primary color
//
// COOL-THING: Double VFX with color selected by token or item token
let color = ""      // projectile color
let expColor = ""   // explosion color
color = extractColor(aToken.data.img);
if (!color) color = extractColor(aItem.img);
if (!color) color = "orange";
//-----------------------------------------------------------------------------------------
// Determine explosion color based on primary
//
if     (color === "blue")       { expColor="blueyellow" }
else if(color ==="dark_green")  { expColor="green" }
else if(color ==="green02")     { expColor="green" }
else if(color ==="green")       { expColor="greenorange" }
else if(color ==="dark_red")    { expColor="dark_red" }
else if(color ==="orange")      { expColor="orange" }
else if(color ==="purple")      { expColor="purple" }
else                            { expColor="orange" }  // No color was found in img names
//-----------------------------------------------------------------------------------------
// Play the VFX
//
if (args[0].hitTargets[0]) { // Target was hit
    jez.log(`Color ${color}, ExpColor ${expColor}`)
    new Sequence()
        .effect()
            .file(`jb2a.fire_bolt.${color}`)
            .atLocation(aToken)
            .stretchTo(args[0].targets[0])
            //.missed(args[0].hitTargets.length === 0) // Keeping this for reference
            .waitUntilFinished(-750) 
        .effect()
            .file(`jb2a.explosion.${expColor}.0`)
            .scale(0.5)
            .atLocation(args[0].hitTargets[0])
        .play()
} else {    // Target was missed
    new Sequence()
        .effect()
            .file(`jb2a.fire_bolt.${color}`)
            .atLocation(aToken)
            .stretchTo(args[0].targets[0])
            .missed(args[0].hitTargets.length === 0)
        .play()
}
/*****************************************************************************************
 * Search the passed string for one of the supported color strings.  Return empty string
 * if no supported color is found.
 * 
 * Note this will return the first color string matched in the PARM.
 * 
 * Supported colors: Blue, Dark_Green, Green02, Green, Dark_Red, Orange, Purple
 *****************************************************************************************/
function extractColor(parm) {
    let color = "";
    let parmLC = parm.toLowerCase();
    if (parmLC.includes("blue")) { color = "blue" }
    else if (parmLC.includes("dark_green")) { color = "dark_green" }
    else if (parmLC.includes("green02")) { color = "green02" }
    else if (parmLC.includes("green")) { color = "green" }
    else if (parmLC.includes("dark_red")) { color = "dark_red" }
    else if (parmLC.includes("orange")) { color = "orange" }
    else if (parmLC.includes("purple")) { color = "purple" }
    jez.log("Returning color", color)
    return (color)
}


