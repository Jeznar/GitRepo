/**************************************************************
 * Macro to implment temp HP for Fiendish Vigor  
 * 
 * 10/26/21 0.1 JGB Creation 
 *************************************************************/
const macroName = "Fiendish_Vigor_0.1"
const debug = 2; 

if (debug) console.log("Starting: " + macroName); 
const numDice = 1;
const diceType = "d4";
let oldTempHP = 0;

let macroActor = game.actors.get(args[0].actor._id);
if (debug>1) console.log(macroActor); 

const bonus = 4; 
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
