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

// COOL-THING: Double VFX with color selected by item token
let color = ""
let expColor = ""
const IMAGE = aItem.img.toLowerCase()
if(IMAGE.includes("blue"))              {color ="blue";         expColor="blueyellow" }
else if(IMAGE.includes("dark_green"))   {color="dark_green";    expColor="green" }
else if(IMAGE.includes("green02"))      {color="green02";       expColor="green" }
else if(IMAGE.includes("green"))        {color="green";         expColor="greenorange" }
else if(IMAGE.includes("dark_red"))     {color="dark_red";      expColor="dark_red" }
else if(IMAGE.includes("orange"))       {color="orange";        expColor="orange" }
else if(IMAGE.includes("purple"))       {color="purple";        expColor="purple" }
if (!color)                             {color="orange";        expColor="orange" }

if (args[0].hitTargets[0]) { // Target was hit
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





