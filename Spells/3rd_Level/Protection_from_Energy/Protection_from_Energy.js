const MACRONAME = "Protection_from_Energy"
/*****************************************************************************************
 * Spell Description:
 * 
 * For the duration, the willing creature you touch has resistance to one damage type of 
 * your choice: acid, cold, fire, lightning, or thunder.
 * 
 * 1. Look for one of the damage types in the item name, if found, that is the selection
 * 2. Pop a dialog if no selection made in title
 * 3. Apply as appropriate DAE effect.
 * 4. Apply a VFX on target representing the protection.
 * 5. Remove the VFX on effect removal.
 * 
 * 04/01/22 0.1 Creation of Macro
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
const VFX_NAME  = `${MACRO}-${aToken.id}`
const VFX_LOOP  = "modules/jb2a_patreon/Library/Generic/Token_Stage/TokenStageRound01_04_Regular_Blue_400x400.webm";
const VFX_OPACITY = 1.0;
const VFX_SCALE = 1.8;
let energyTypeArray = ["acid", "cold", "fire", "lightning", "thunder"]

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
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (!preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    let energySel = ""
    let aitemname = aItem.name.toLowerCase()
    //----------------------------------------------------------------------------------------------
    // Scan the aItem.name for energy type strings, if one found, make it the energySel
    //
    for (let energyType of energyTypeArray) {
        jez.log(`Scanning for ${energyType}`)
        if (aitemname.includes(energyType.toLowerCase())) {
            jez.log(`Found specific energy type in item name: ${energyType}`)
            energySel = energyType
            break
        }
    }
    //----------------------------------------------------------------------------------------------
    // If energy type was preselected, call the function to modify existing effect and then exit
    //
    if (energySel) {
        modExistingEffect(tToken, energySel)
        msg = `Energy type selected: ${energySel}`
        postResults(msg)
        return(true)
    }
    //----------------------------------------------------------------------------------------------
    // Pop that sweet sweet dialog and get a selection
    //
    const DIALOG_TITLE = "Energy to protect against?"
    const DIALOG_TEXT = "Pick one from the list"
    jez.pickRadioListArray(DIALOG_TITLE, DIALOG_TEXT, dialogCallBack, energyTypeArray.sort());
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
    /***********************************************************************************************
    * Check the setup of things.  Setting the global errorMsg and returning true for ok!
    ***********************************************************************************************/
    function preCheck() {
        if (args[0].targets.length !== 1) {     // If not exactly one target, return
            msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
            postResults(msg);
            return (false);
        }
        return (true)
    }
    /***************************************************************************************************
    * COOL-THING: Modify existing effect to include a midi-qol restance effect
    ***************************************************************************************************/
    async function modExistingEffect(token5e, energyType) {
        //const EFFECT = aItem.name
        const EFFECT = 'Protection from Energy'

        //----------------------------------------------------------------------------------------------
        // Seach the token to find the just added effect
        //
        await jez.wait(100)
        let effect = await token5e.actor.effects.find(i => i.data.label === EFFECT);
        jez.log("effect", effect
        )
        //----------------------------------------------------------------------------------------------
        // Define the desired modification to existing effect. In this case, a world macro that will be
        // given arguments: VFX_Name and Token.id for all affected tokens
        //    
        jez.log("energyType", energyType)
        effect.data.changes.push({ key: `data.traits.dr.value`, mode: jez.ADD, value: energyType, priority: 20 })
        effect.data.label = `Protection from Energy: ${capitalizeFirstLetter(energyType)}`
        jez.log(`effect.data`, effect.data)
        //----------------------------------------------------------------------------------------------
        // Apply the modification to existing effect
        //
        const result = await effect.update({ 
            'changes': effect.data.changes,
            'label' : effect.data.label
        });
        if (result) jez.log(`Active Effect ${EFFECT} updated!`, result);
    }
    /***************************************************************************************************
    * 
    ***************************************************************************************************/
    async function dialogCallBack(selection) {
        jez.log("typeCallBack", selection)
        msg = `The item named <b>"${selection}"</b> was selected in the dialog`
        //--------------------------------------------------------------------------------------------
        // Find all the item of type "selection"
        //
        if (!selection) {
            if (selection === null) { // User selected Cancel on the dialog
                let concEffect = aToken.actor.effects.find(ef => ef.data.label === "Concentrating") 
                jez.log(` Removing concentrating from ${aToken.name}`);
                await concEffect.delete();
                return (true)
            }
            //----------------------------------------------------------------------------------------------
            // Try to get that selection again...
            //
            const DIALOG_TITLE = "Energy to protect against?"
            const DIALOG_TEXT = "Pick one from the list, seriously, need to pick one."
            jez.pickRadioListArray(DIALOG_TITLE, DIALOG_TEXT, dialogCallBack, energyTypeArray.sort());
            return (false)
        }
        //--------------------------------------------------------------------------------------------
        // Proceed with the modification of the effect
        //
        modExistingEffect(tToken, selection)
        msg = `Energy type selected: ${selection}`
        postResults(msg)
        return(true)
    }
}
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    Sequencer.EffectManager.endEffects({ name: VFX_NAME, object: aToken });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
} 
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set On
 ***************************************************************************************************/
async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    jez.runRuneVFX(aToken, jez.getSpellSchool(aItem), "blue")

    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        .scaleToObject(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .fadeIn(1000)
        .fadeOut(1000)
        .belowTokens(false)  
        .persist()
        .name(VFX_NAME)         // Give the effect a uniqueish name
        .extraEndDuration(800)  // Time padding on exit to connect to Outro effect
    .play()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }