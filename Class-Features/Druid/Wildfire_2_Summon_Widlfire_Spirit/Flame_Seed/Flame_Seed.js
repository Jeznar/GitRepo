const MACRONAME = "Flame_Seed.js"
/*****************************************************************************************
 * Basic Structure for a rather complete macro
 * 
 * 02/11/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
let msg = "";
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
jez.log("tToken",tToken)


// https://github.com/fantasycalendar/FoundryVTT-Sequencer/wiki/MidiQOL-&-JB2A-Fire-Bolt

let tokenD = canvas.tokens.get(args[0].tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;

// COOL-THING: Pick VFX color based on color of item image icon
let color = ""
const IMAGE = aItem.img.toLowerCase()
if(IMAGE.includes("blue")) color = "blue"
else if(IMAGE.includes("dark_green")) color = "dark_green"
else if(IMAGE.includes("green02")) color = "green02"
else if(IMAGE.includes("green")) color = "green"
else if(IMAGE.includes("dark_red")) color = "dark_red"
else if(IMAGE.includes("orange")) color = "orange"
else if(IMAGE.includes("purple")) color = "purple"
if (!color) color = "orange"

new Sequence()
    .effect()
        //.file("jb2a.fire_bolt.orange")
        .file(`jb2a.fire_bolt.${color}`)
        .atLocation(tokenD)
        .reachTowards(args[0].targets[0])
        .missed(args[0].hitTargets.length === 0)
    .play()