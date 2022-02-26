const MACRONAME = "OnUse_Envornment_0.4"
/*****************************************************************************************
 * Exercise the information available in the environment of ItemMacro's.  This is based
 * on Tim Posney's documentation.
 * 
 * https://gitlab.com/tposney/midi-qol#notes-for-macro-writers
 * 
 * 12/07/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
if (DEBUG) {
    log(` ---------------- starting ${MACRONAME} ----------------------------------------`);
    log(` args[0] ==>`, args[0]);
}
log(``);

//----------------------------------------------------------------------------------------
// actorData = actor.data (the actor using the item).
// actor = actor.data (same as above, kept for backwards compatibility)
// actorUuid = actor.uuid
log(`********************* Actor Information *************************************`,
    `actor`, actor,
    `actor.name`, actor.name,
    `args[0].actorData, actor using the item`, args[0].actorData, // Undefined???
    `args[0].actor.data, same but old`, args[0].actor.data,
    `args[0].actorUuid, actor.uuid`, args[0].actorUuid);
log(``);

//----------------------------------------------------------------------------------------
//  tokenId
//  tokenUuid
log(`************************* Token Information **********************************`,
    `token ==>`, token,
    `token.name ==>`, token.name,
    `args[0].tokenId ==>`, args[0].tokenId,
    `args[0].tokenUuid ==>`, args[0].tokenUuid);
log(``);

//----------------------------------------------------------------------------------------
//  targets = [token.data] (an array of token data taken from game.user.targets)
//  targetUuids = [uuid]
log(`************************* Target(s) Information ******************************`,
    `args[0].targets Array ==>`, args[0].targets,
    `args[0].targetUuids Array ==>`, args[0].targetUuids,
    `Number of Targets ==>`, args[0].targets.length);
for (let i = 0; i < args[0].targets.length; i++) {
    const TARGET = args[0].targets[i];
    log(` ${i} Token Name: ${TARGET.data.name}, Actor Name: ${TARGET.data.actorData.name}`);
}


//----------------------------------------------------------------------------------------
//  hitTargets = [token.data] (an array of token data taken from targets that were hit)
//  hitTargetUuids [uuid]
log(`************************* hitTarget(s) Information ****************************`,
    `args[0].hitTargets Array ==>`, args[0].hitTargets,
    `args[0].hitTargetUuids Array ==>`, args[0].hitTargetUuids,
    `Number of hitTargets ==>`, args[0].hitTargets.length);
for (let i = 0; i < args[0].hitTargets.length; i++) {
    const TARGET = args[0].hitTargets[i];
    log(` ${i} Token Name: ${TARGET.data.name}, Actor Name: ${TARGET.data.actorData.name}`);
}
log(``);


//----------------------------------------------------------------------------------------
// saves= [token.data] (an array of token data taken from targets that made a save)
// saveUuids = [uuid]
// failedSaves = [token.data] (an array of token data taken from targets that failed the save)
// failedSaveUuids = [uuid]
// criticalSaves = [token.data]
// criticalSaveUuids = [uuid]
// fumbleSaves = [token.data]
// fumbleSaveUuids = [uuid]
log(`************************* Save(s) Information ********************************`,
    `args[0].saves Array (${args[0].saves.length}) ==>`, args[0].saves,
    `args[0].saveUuids Array (${args[0].saveUuids.length}) ==>`, args[0].saveUuids,
    `args[0].failedSaves Array (${args[0].failedSaves.length}) ==>`, args[0].failedSaves,
    `args[0].failedSaveUuids Array (${args[0].failedSaveUuids.length}) ==>`, args[0].failedSaveUuids,
    `args[0].criticalSaves Array (${args[0].criticalSaves.length}) ==>`, args[0].criticalSaves,
    `args[0].criticalSaveUuids Array (${args[0].criticalSaveUuids.length}) ==>`, args[0].criticalSaveUuids,
    `args[0].fumbleSaves Array (${args[0].fumbleSaves.length}) ==>`, args[0].fumbleSaves,
    `args[0].fumbleSaveUuids Array (${args[0].fumbleSaveUuids.length}) ==>`, args[0].fumbleSaveUuids);
log(``);

//----------------------------------------------------------------------------------------
// attackRoll = the Roll object for the attack roll (if any)
// attackTotal: this.attackTotal,
// rollData: this.actor.getRollData(),
// isCritical = true/false
// isFumble = true/false
// spellLevel = spell/item level
log(`************************* Attack Information **********************************`,
    `attackRoll Object ==>`, args[0].attackRoll,
    `rollData Object ==>`, args[0].rollData,
    `isCritical Boolean ==>`, args[0].isCritical,
    `isFumble Boolean ==>`, args[0].isFumble,
    `spellLevel Integer? ==>`, args[0].spellLevel);
log(``);


/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    } else {            // Even number of arguments
        console.log(parms[i], ":", parms[i + 1]);
        i = 2;
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    }
}
