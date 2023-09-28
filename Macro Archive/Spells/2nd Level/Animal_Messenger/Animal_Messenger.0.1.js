const MACRONAME = "Animal_Messenger.0.1"
/*****************************************************************************************
 * Animal Messenger
 * 
 * 01/12/22 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
log("")
log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
let SAVE_DC = aItem.data.save.dc;
let SAVE_ABILITY = aItem.data.save.ability
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";
const VFX_NAME = `${MACRO}-${aToken.id}`
const VFX_LOOP = "modules/jb2a_patreon/Library/Generic/Token_Border/TokenBorderCircle_01_Regular_Blue_400x400.webm";
const VFX_OPACITY = 0.9;
const VFX_SCALE = 0.3;
const EFFECT_NAME = "Animal Messenger"


//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") doOnUse();          // Midi ItemMacro On Use
if (args[0] === "off")  doOff();                   // DAE removal
if (args[0] === "on")  doOn();                     // DAE Application

log(`============== Finishing === ${MACRONAME} =================`);
log("")

return;

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/


/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    log(`First Targeted Token (tToken) of ${args[0].targets?.length}, ${tToken?.name}`, tToken);
    log(`First Targeted Actor (tActor) ${tActor?.name}`, tActor);

    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    //
    if (!preCheckDoOnUse()) {
        if (tActor) {
            for (let i = 0; i < 20; i++) {
                await wait(50)         // Wiat long enough for the effect to appear
                let existingEffect = await tActor?.effects.find(ef => ef.data.label === EFFECT_NAME);
                log(`...${i} existingEffect`, existingEffect)
                if (existingEffect) {
                    await existingEffect.delete();
                    break
                }
            }
        }
        console.log(errorMsg)
        ui.notifications.error(errorMsg)
        return;
    }

    // https://www.w3schools.com/tags/ref_colornames.asp
    log(`${tToken.name} affected`)
    msg = `<p style="color:CornFlowerBlue;font-size:14px;">
        <b>${tToken.name}</b> is affected by ${aItem.name}.  It is now willing to receive and
        attempt to deliver a message.
        </p>`

    postResults(msg);
    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);

    //----------------------------------------------------------------------------------
    // Run the preCheck function to make sure things are setup as best I can check them
    //
    function preCheckDoOnUse() {
        let goodToGo = true
        // Check anything important...
        if (!oneTarget()) {
            let postMsg = '<p style="color:DarkRed;font-size:14px;">' + errorMsg + '</p>'
            log(postMsg)
            postResults(postMsg)
            goodToGo = false
        }
        if (goodToGo) {
            let tokenSize = jezGetSizeInfo(tToken)
            log(`tokenSize for ${tToken.name}`, tokenSize)
            if (tokenSize.key !== "tiny") {
                errorMsg = `${tToken.name} is size "<b>${tokenSize.nameStr}</b>" 
                            can not be affected by ${aItem.name}`
                goodToGo = false
                let postMsg = '<p style="color:DarkRed;font-size:14px;">' + errorMsg + '</p>'
                postResults(postMsg)
            }
        }
        if (goodToGo) {
            let creatureType = jezGetCreatureType(tActor)
            log("Creature Type", creatureType)
            if (creatureType.toLowerCase() !== "beast") {
                if (creatureType) {
                    errorMsg = `${tToken.name} is type <b>${creatureType}</b>, but needs 
                    to be type "beast" to be affected by ${aItem.name}`
                } else {
                    errorMsg = `${tToken.name} has no defined type, but needs 
                    to be type "beast" to be affected by ${aItem.name}`
                }
                goodToGo = false
                let postMsg = '<p style="color:DarkRed;font-size:14px;">' + errorMsg + '</p>'
                postResults(postMsg)
            }
        }
        log('All looks good, to quote Jean-Luc, "MAKE IT SO!"')
        return (goodToGo)
    }
}

/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        errorMsg = `Targeted nothing, must target single token to be acted upon`;
        log(errorMsg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        errorMsg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        log(errorMsg);
        return (false);
    }
    log(`Targeting one target, a good thing`);
    return (true);
}

/***************************************************************************************
 * Perform the steps that runs when this macro is executed by DAE to add to target
 ***************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    let existingEffect = null
    for (let i = 0; i < 20; i++) {
        await wait(10)         // Wait long enough for the effect to appear
        existingEffect = await aActor.effects.find(ef => ef.data.label === EFFECT_NAME);
        log(`polling for ${EFFECT_NAME}...${i}`, existingEffect)
        if (existingEffect) break;
    }
    if (!existingEffect) return

    new Sequence()
        /*.effect()
            .file(VFX_INTRO)
            .attachTo(eToken)
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)           
            .waitUntilFinished(-500) // Negative wait time (ms) clips the effect to avoid fadeout*/
        .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .fadeIn(1000)            // Fade in for specified time in milliseconds
        .fadeOut(1000)           // Fade out for specified time in milliseconds
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
        .play()

    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}

 /***************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************/
async function doOff() {
    const FUNCNAME = "doOff()";
    log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);

    log("aToken", aToken)
    log("aToken._object", aToken._object)
    for (let i = 0; i < 10; i++) {
        await wait(50);
        log(`Terminanting effect, try ${i}...`)
        if (await Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken._object })) {
            log('...got it')
            break;
        }
        /* new Sequence()
        .effect()
            .file(VFX_OUTRO)
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)  
            .attachTo(eToken)
        .play()*/
    }

    log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}


/****************************************************************************************
 * Return the race (character) or type (NPC)
 ***************************************************************************************/
 function jezGetCreatureType(actor5e) {
    log("jezGetCreatureType(actor5e)", actor5e)

    if (!jezIsactor5e(actor5e)) {
        errorMsg = `Parm passed was not a actor5e object, ${actor5e?.constructor.name}`
        log(errorMsg)
        ui.notifications.error(errorMsg);
        return(false)
    }
    if (actor5e.data.type === "character") {    // actor5e is a player character
        log(`${actor5e.name} is a character of type "${actor5e.data.data.details.race}"`)
        return(actor5e.data.data.details.race)
    } else {                                    // actor5e is a NPC
        log(`${actor5e.name} is an NPC of type ${actor5e.data.data.details.type.value}`)
        return(actor5e.data.data.details.type.value)
    }
 }

/****************************************************************************************
 * Return an object describing the size of a passed TokenID.  The object will contain:
 *   this.key     - short form of size used as a key to obtain other info
 *   this.value   - numeric value of size, 1 is tiny, 6 is gargantuan, 0 is error case
 *   this.namestr - size string in lowercase, e.g. medium
 *   this.nameStr - size string in mixedcase, e.g. Gargantuan
  ***************************************************************************************/
 function jezGetSizeInfo(token5E) {
    log("getSizeInfo(token5E)", token5E)

    if (!jezIsToken5e(token5E)) {
        errorMsg = `Parm passed was not a token5e object, ${token5E?.constructor.name}`
        log(errorMsg)
        ui.notifications.error(errorMsg);
        return(false)
    }

    class CreatureSizeInfo {
        constructor(size) {
            this.key = size;
            switch (size) {
                case "tiny":this.value = 1; 
                            this.namestr = "tiny";
                            this.nameStr = "Tiny";
                            break;
                case "sm":  this.value = 2; 
                            this.nameStr = "small";
                            this.nameStr = "Small";
                            break;
                case "med": this.value = 3; 
                            this.namestr = "medium";
                            this.nameStr = "Medium";
                            break;
                case "lg":  this.value = 4; 
                            this.nameStr = "large";
                            this.nameStr = "Large";
                            break;
                case "huge":this.value = 5; 
                            this.nameStr = "huge";
                            this.nameStr = "Huge";
                            break;
                case "grg": this.value = 6; 
                            this.nameStr = "gargantuan";
                            this.nameStr = "Gargantuan";
                            break;
                default:    this.value = 0;  // Error Condition
                            this.nameStr = "unknown";
                            this.nameStr = "Unknown";
            }
        }
    }
    let token5ESizeStr  = token5E.document?._actor.data.data.traits.size 
                        ? token5E.document?._actor.data.data.traits.size 
                        : token5E._actor.data.data.traits.size
    let token5ESizeInfo = new CreatureSizeInfo(token5ESizeStr);
    if (!token5ESizeInfo.value) {
        let message = `Size of ${token5E.name}, ${token5ESizeStr} failed to parse. End ${MACRONAME}<br>`;
        log(message);
        ui.notifications.error(message);
    }
    return(token5ESizeInfo);
}

/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsToken5e(obj) {
    if (obj?.constructor.name === "Token5e") return(true)
    return(false)
}

/***************************************************************************************************
 * Return true if passed argument is of object type "Token5e"
 ***************************************************************************************************/
 function jezIsactor5e(obj) {
    if (obj?.constructor.name === "Actor5e") return(true)
    return(false)
}

/***************************************************************************************************
 * Post the results to chat card
 ***************************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    let chatMessage = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatMessage.data.content);
    log(`chatMessage: `,chatMessage);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}

/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }