const MACRONAME = "Last_Laugh.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * When the cackler dies, it releases a dying laugh that scars the minds of other nearby creatures.
 * Each creature within 10 feet of the cackler must succeed on a DC 11 WIS Save or take 2 (1d4) 
 * psychic damage.
 *  
 * This macro MUST be configured to run "Called before item is rolled" on the item card.  It does 
 * three things:
 *   1. Plays an explosion VFX
 *   2. Build a list of valid targets within range
 *   3. Sets the targeted tokens to match the list created.
 * 
 * 11/16/22 0.1 Creation of Macro from Death_Burst.0.1.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL>1) jez.trace(`${TAG} === Starting ===`);
if (TL>2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;         
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); 
else aToken = game.actors.get(LAST_ARG.tokenId);
//
// Set the value for the Active Item (aItem)
let aItem;         
if (args[0]?.item) aItem = args[0]?.item; 
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({traceLvl:TL});          // Midi ItemMacro On Use
if (TL>1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    if (TL>1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>2) jez.trace("postResults Parameters","msg",msg)
    //-----------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    if (TL>1) jez.trace(`${TAG}--- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse()";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //----------------------------------------------------------------------------------------------
    // Add some VFX
    //
    runVFX(aToken)
    //----------------------------------------------------------------------------------------------
    // Remove any preset targets
    //
    game.user.updateTokenTargets()  
    //---------------------------------------------------------------------------------------------------
    // Set function specific globals
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    //----------------------------------------------------------------------------------------------
    // Obtain the range of the effect
    //
    const RANGE = jez.getRange(aItem, ALLOWED_UNITS) + 3 // Adding a bit of fudge
    if (!RANGE) return jez.badNews(`Could not retrieve useable range (in feet) for ${aItem.name}`)
    //----------------------------------------------------------------------------------------------
    // Obtain an array of viable targets
    //
    let parms = {
        exclude: "Self",    // self, friendly, or none (self is default)
        traceLvl: TL,           // Trace level, integer typically 0 to 5
    }
    let candidateIds = []
    let candidates = await jez.inRangeTargets(aToken, RANGE, parms);
    if (candidates.length === 0) return jez.badNews(`No effectable targets in range`, "i")
    if (TL>1) for (let i = 0; i < candidates.length; i++) {
        jez.trace(`${FNAME} | Targeting: ${candidates[i].name}`)
        candidateIds.push(candidates[i].id)
    }
    //----------------------------------------------------------------------------------------------
    // Update the selected targets so item hits correct tokens.
    //
    game.user.updateTokenTargets(candidateIds)
    if (TL>1) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/***************************************************************************************************
 * Launch the VFX effects
 ***************************************************************************************************/
 async function runVFX(token) {
    new Sequence()
       .effect()
       .file("jb2a.template_circle.out_pulse.01.burst.purplepink")
       .attachTo(token)
       .scale(0.9)
       .play();
}