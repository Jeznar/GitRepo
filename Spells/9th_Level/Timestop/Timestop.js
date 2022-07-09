const MACRONAME = "Timestop"
/*****************************************************************************************
 * This macro implments VFX and a widespread DAE effect for timestop. 
 * 
 * 04/13/22 0.1 Creation of Macro
 * 07/09/22 Replace CUB.addCondition with CE
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; 
else aActor = game.actors.get(LAST_ARG.actorId);
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const VFX_NAME = `${MACRO}-${aToken.name}`
const VFX_PULSE = 'jb2a.extras.tmfx.outpulse.circle.02.slow';
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0] === "off") await doOff();                   // DAE removal
if (args[0] === "on") await doOn();                     // DAE Application
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.log("Something could have been here")
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken }); // End VFX

    //----------------------------------------------------------------------------------------------
    // Remove the STOP (No_Actions) condition that isn't the current token
    //
    let tokenArrayOff = await getTokenArray(aToken)
    for (const element of tokenArrayOff) {
        jez.log("element", element)
        await jezcon.remove("No_Actions", element, {traceLvl: 5});    
        await jez.wait(100)    
    }
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
  
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    runVFX(aToken)
    let actorUuidArrayOn = await getTokenArray(aToken)
    let options = {
        allowDups: false, 
        replaceEx: true, 
        origin: aActor.uuid, 
        overlay: true, 
        traveLvl: 4
    }
    await jezcon.addCondition("No_Actions", actorUuidArrayOn ,options)
    return;
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const GAME_RND = game.combat ? game.combat.round : 0; // Added missing initilization -JGB
    //----------------------------------------------------------------------------------------------
    // Deternine how many round timestop will be up, silently.
    //
    let duration = getRandomInt(4) + 2 // 1d4+1 rounds -- Need one more to allow correct action cnt
    jez.log("duration", duration)
    //----------------------------------------------------------------------------------------------
    // Define the main effect that will be applied to active token
    //
    let effectData = [
        {
            label: aItem.name,
            icon: aItem.img,
            origin: args[0].uuid,
            disabled: false,
            duration: { rounds: duration, startRound: GAME_RND },
            flags: { dae: { specialDuration: ["DamageDealt"] } },
            changes: [
                { key: `macro.itemMacro`, mode: jez.CUSTOM, value: 0, priority: 20 },
            ]
        }];
    jez.log("effectData", effectData)
    MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aToken.actor.uuid, effects: effectData });

    msg = `<b>${aToken.name}</b> briefly stops the flow of time for everyone else for a brief time. 
    ${aToken.name} may act normally while time is frozen.<br><br>
    Effect ends if affect a creature other than yourself or an object being worn or carried by 
    someone other than you. Or if you move to a place more than 1,000 feet from the location where you 
    cast it.`
    postResults(msg)
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked each round by DAE
 ***************************************************************************************************/
 async function runVFX(token5e) {
    jez.runRuneVFX(token5e, jez.getSpellSchool(aItem))
    new Sequence()
    .effect()
        .file(VFX_PULSE)
        .attachTo(token5e)
        .scale(5)
        .opacity(1)
        .persist()
        .belowTokens(false)  
        .duration(5000)
        .name(VFX_NAME)
    .play()
    return (true);
}
/***************************************************************************************************
 * Return a random integer from 1 to max
 ***************************************************************************************************/
 function getRandomInt(max) {
    return (Math.floor(Math.random() * max) + 1);
}
/***************************************************************************************************
 * Build and return an array of all in scene tokens that are not the passed token.  Returning an 
 * array of actor.uuid's.
 ***************************************************************************************************/
async function getTokenArray(aToken) {
    let tokenArray = []
    for (const element of game.scenes.viewed.data.tokens) {
        if (aToken.id === element.id) {
            jez.log(`===> ${element.name}`, element)
        } else {
            jez.log(`==> ${element.name}`, element)
            tokenArray.push(element.actor.uuid)
        }
    }
    return (tokenArray);
}