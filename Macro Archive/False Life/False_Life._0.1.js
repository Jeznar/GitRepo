/**************************************************************
 * Macro to implment temp HP for False Life  
 * 
 * 10/26/21 0.1 JGB Creation 
 *************************************************************/
const macroName = "False_Life_0.1"
const debug = 2; 

if (debug) console.log("Starting: " + macroName); 
const numDice = 1;
const diceType = "d4";
let oldTempHP = 0;

const lastArg = args[args.length - 1];
// let itemD = lastArg.item;
let spellLevel = lastArg.spellLevel; // I have no idea why this works
if (debug && (spellLevel>1)) console.log(` upcast to level ${spellLevel}`); 

let macroActor = game.actors.get(args[0].actor._id);
if (debug>1) console.log(macroActor); 

const bonus = 4 + ((--spellLevel)*5); //Add 5 every level above 1
if (debug>1) console.log(` bonus to add: ${bonus}`); 

if (macroActor.data.data.attributes.hp.temp) {
    oldTempHP = macroActor.data.data.attributes.hp.temp;
    if (debug) console.log(` old Temp HP was ${oldTempHP}`); 
} else {
    if (debug) console.log(` using ${oldTempHP} as old Temp HP`);
}

// Roll the new temp HP
let newTempHP = new Roll(`${numDice}${diceType}+${bonus}`).evaluate({ async: false });
if (debug) console.log(" new Temp HP: " + newTempHP.total); 

if (newTempHP.total <= oldTempHP) {
    if (debug) console.log(` old temp HP was ${oldTempHP}, aborting`); 
    return;
} else { 
    await macroActor.update({
        'data.attributes.hp.temp' : newTempHP.total
        //,'data.attributes.hp.tempmax' : newTempHP.total
    })
}
