const MACRONAME = "Alchemists_Fire.js"
/*****************************************************************************************
 * Alchemist's Fire
 * 
 *   This sticky, adhesive fluid ignites when exposed to air. As an action, you can throw 
 *   this flask up to 20 feet, shattering it on impact. Make a ranged attack against a 
 *   creature or object, treating the alchemist's fire as an improvised weapon.
 * 
 *   On a hit, the target takes 1d4 fire damage at the end of each of its turns. A creature 
 *   can end this damage by using its action to make a DC 10 Dexterity check to extinguish 
 *   the flames.
 * 
 * 04/21/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
let msg = "";
const GAME_RND = game.combat ? game.combat.round : 0;
let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
const CONDITION="Alchemist's Fire"
const CHK_DC = "10";
const CHK_TYPE = "dex"    
const VFX_LOOP = "jb2a.flames.green.01";
const VFX_NAME = `${MACRO}-${aToken.name}`
const VFX_SCALE = 2.4
const VFX_OPACITY = 0.6
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
//if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
if (args[0] === "on") await doOn();                   
if (args[0] === "each") doEach();					  
if (args[0] === "off") await doOff();          
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
jez.log(`============== Finishing === ${MACRONAME} =================`);
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs every turn
 * 
 * Need to offer a choice to spend action this turn to remove (scrape off) the fire effect
 ***************************************************************************************************/
 async function doEach() {
    let d = Dialog.confirm({
        title: `${aToken.name} attempt to extinguish fire?`,
        content: `<p>Does ${aToken.name} want to spend its action this turn to attempt to extinguish
        the ${CONDITION}?<br><br>This would be a DC${CHK_DC} ${CHK_TYPE} skill check.<br></p>`,
        yes: () => dCallback(CONDITION, CHK_TYPE, CHK_DC),
        no: () => console.log("You choose ... to burn"),
        defaultYes: false
       });
    return;
}
/***************************************************************************************************
 * Start a Fire VFX on out victim
 ***************************************************************************************************/
 async function doOn() {
    const FUNCNAME = "doOn()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    new Sequence()
    .effect()
        .file(VFX_LOOP)
        .attachTo(aToken)
        //.atLocation(aToken)
        .opacity(VFX_OPACITY)
        //.scale(VFX_SCALE)
        .scaleToObject(VFX_SCALE)
        //.belowTokens()
        .persist()
        .name(VFX_NAME)             
        .fadeIn(1000)  
        .fadeOut(1000)   
    .play()
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Perform the code that runs when this macro is removed by DAE, set Off
 ***************************************************************************************************/
 async function doOff() {
    const FUNCNAME = "doOff()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    Sequencer.EffectManager.endEffects({ name: VFX_NAME });
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return;
  }
/***************************************************************************************************
 * Dialog callback to attempt to exinguish the fire
 ***************************************************************************************************/
 async function dCallback(CONDITION, CHK_TYPE, CHK_DC) {
    const FLAVOR = `Attempting ${CHK_TYPE.toUpperCase()} DC${CHK_DC} to extinguish ${CONDITION}`
    let check = (await aToken.actor.rollAbilityTest(CHK_TYPE,
        { flavor: FLAVOR, chatMessage: true, fastforward: true })).total;
    if (check >= CHK_DC)  {
        jez.log("aToken.actor.effects",aToken.actor.effects)
        let effect = await aToken.actor.effects.find(ef => ef.data.label === CONDITION) ?? null
        await effect.delete();
        jez.postMessage({color: "firebrick", fSize: 14, icon: aToken.data.img,
            msg: `<b>${aToken.name}</b> succeeded in extinguishing <b>${CONDITION}</b>.
                Skill check of <b>${check}</b> beats the ${CHK_TYPE.toUpperCase()} DC${CHK_DC}.
                <br><br>This used <b>${aToken.name}</b>'s action.`,
            title: `${aToken.name} extiguish ${CONDITION}`,
            token: aToken
        })
    } else {
        jez.postMessage({
            color: "firebrick", fSize: 14, icon: aToken.data.img,
            msg: `<b>${aToken.name}</b> fails to extinguish <b>${CONDITION}</b>.
                Skill check of <b>${check}</b> fell short of the ${CHK_TYPE.toUpperCase()} DC${CHK_DC}. 
                <br><br>This used <b>${aToken.name}</b>'s action.`,
            title: `${aToken.name} continues to burn.`,
            token: aToken
        })
    }
 }
 /***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
  async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    if (!await preCheck()) return (false)
    else jez.log("Continue....")
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    msg = `${tToken.name} is splashed with ${CONDITION} and starts to burn.`
    postResults(msg)
    return (true);
}
/***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
 async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        await postResults(msg)
        ui.notifications.warn(msg)
        jez.log(msg)
        return(false);
    }
    return (true)
}
 /***************************************************************************************
 * Post results to the chat card
 ***************************************************************************************/
async function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    await jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}