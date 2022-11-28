const MACRONAME = "Tentacles.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Add grapple element of an Octopus tentacle hit.
 * 
 *  On a hit the target is grappled, escape dc 10 Until this grapple ends, the octopus can't use its 
 *  tentacles on another target.
 * 
 * 11/29/22 0.1 JGB Created from Grapple_Initiate_1.3.js
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
 const TAG = `${MACRO} |`
 const TL = 1;                               // Trace Level for this macro
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
 let aActor = aToken.actor; 
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
  * Check the setup of things.  Post bad message and return false fr bad, true for ok!
  *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function preCheck() {
     if (args[0].targets.length !== 1)       // If not exactly one target 
         return jez.badNews(`Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`,"w");
     if (LAST_ARG.hitTargets.length === 0)   // If target was missed, return
         return jez.badNews(`Target was missed.`, "w")
     return(true)
 }
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/ 
 async function doOnUse(options={}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0] 
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL===1) jez.trace(`${TAG} --- Starting ---`);
    if (TL>1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,"options",options);
    await jez.wait(100)
    //-----------------------------------------------------------------------------------------------
    if (!await preCheck()) return(false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    let tActor = tToken?.actor;
    //-----------------------------------------------------------------------------------------------
    // If the originator of the grapple is already grappling, may not again
    //
    if (aToken.actor.effects.find(ef => ef.data.label === "Grappling")) {
        msg = `${aToken.name} may not initiate a grapple while already grappling.`
        postResults(msg);
        return jez.badNews(msg,'i')
    }
    /**************************************************************************
     *  Apply Grappled Condition
     *************************************************************************/
        if (TL>1) jez.trace(`${TAG} Apply grappled condition`);
        jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
        let message = `<b>${aToken.name}</b> has grappled <b>${tToken.name}</b>`
        if (TL>1) jez.trace(`${TAG} ${message}`);
        postResults(message);

    /**************************************************************************
     *  Apply Grappling Condition
     *************************************************************************/
        if (TL>1) jez.trace(`${TAG} Apply grappled condition`);
        await jez.wait(250)
        jezcon.add({ effectName: 'Grappling', uuid: aToken.actor.uuid })
        //-------------------------------------------------------------------------------
        // Find the two just added effect data objects so they can be paired, to expire 
        // together.
        //
        await jez.wait(100)
        let tEffect = tToken.actor.effects.find(ef => ef.data.label === "Grappled" && ef.data.origin === aActor.uuid)
        if (!tEffect) return jez.badNews(`Sadly, there was no Grappled effect from ${aToken.name} found on ${tToken.name}.`, "warn")
        let oEffect = aToken.actor.effects.find(ef => ef.data.label === "Grappling")
        if (!oEffect) return jez.badNews(`Sadly, there was no Grappling effect found on ${aToken.name}.`, "warn")
        const GM_PAIR_EFFECTS = jez.getMacroRunAsGM("PairEffects")
        if (!GM_PAIR_EFFECTS) { return false }
        await jez.wait(500)
        await GM_PAIR_EFFECTS.execute(oEffect.uuid, tEffect.uuid)
        //-------------------------------------------------------------------------------
        // Create an Action Item to allow the target to attempt escape
        //
        const GM_MACRO = jez.getMacroRunAsGM(jez.GRAPPLE_ESCAPE_MACRO)
        if (!GM_MACRO) { return false }
        await GM_MACRO.execute("create", aToken.document.uuid, tToken.document.uuid, aToken.actor.uuid)
    // }
    await jez.wait(250)
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
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