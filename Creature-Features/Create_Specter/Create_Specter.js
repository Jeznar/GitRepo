const MACRONAME = "Create_Specter.js"
/*****************************************************************************************
 * Spawn a Specter into the scene at the location of a targeted (dead) token.  Name it 
 * in sequence and make sure there are only 7 or less specters for this actor.
 * 
 *   The wraith targets a humanoid within 10 feet of it that has been dead for no longer 
 *   than 1 minute and died violently. The target's spirit rises as a specter in the space 
 *   of its corpse or in the nearest unoccupied space. The specter is under the wraith's 
 *   control. The wraith can have no more than seven specters under its control at one time.
 * 
 * 04/23/22 0.1 Creation of Macro
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
//----------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse();          // Midi ItemMacro On Use
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Check the setup of things.  Setting the global errorMsg and returning true for ok!
 ***************************************************************************************************/
async function preCheck() {
    if (args[0].targets.length !== 1) {     // If not exactly one target, return
        msg = `Must target exactly one target.  ${args[0].targets.length} were targeted.`
        ui.notifications.warn(msg);
        await postResults(msg);
        return (false);
    }
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    const CUR_HP = tToken.actor?.data?.data?.attributes?.hp?.value;
    jez.log("CUR_HP",CUR_HP)
    if (CUR_HP !== 0) {
        msg = `${tToken.name} still has health points, not a suitable target.`
        ui.notifications.info(msg);
        postResults(msg);
        return(false);
    } else 
    if (!CUR_HP === null) {
        msg = `"${tToken?.name}" somehow doesn't know what its current health is...`
        ui.notifications.error(msg);
        postResults(msg);
        return(false);
    }
    return(true)
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 async function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
async function doOnUse() {
    const FUNCNAME = "doOnUse()";
    if (!await preCheck()) return (false);
    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
    jez.log(`Targeted ${tToken.name}`, tToken)
    const SOURCE_CRITTER = "Specter"
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    //---------------------------------------------------------------------------------------------
    // Get the name for the next Specter, up to 7, if all in use exit 
    //
    const SPECTER_NAME = await getSpecterName(aToken)
    if (!SPECTER_NAME) {
        msg = `${aToken.name} already has the maximum number of specters, can not summon another.`
        ui.notifications.error(msg);
        postResults(msg)
        return;
    }
    //---------------------------------------------------------------------------------------------
    // Make sure the creature to be summoned exists in the game
    //
    if (!game.actors.getName(SOURCE_CRITTER)) {   // If anchor not found, that's all folks
        msg = `Could not find "<b>${SOURCE_CRITTER}</b>" in the <b>Actors Directory</b>. 
        <br><br>Can not complete the ${aItem.name} action.`;
        ui.notifications.error(msg);
        postResults(msg);
        return (null);
    }
    //---------------------------------------------------------------------------------------------
    // Pop dialog asking if the target meets spell requirements
    //
    popDialog();
    return (true);
    /***************************************************************************************************
   * Pop a dialog to ask if target meets spell criteria.  If it does call the callback.
   ***************************************************************************************************/
    async function popDialog() {
        const DIALOG_TITLE = "Does Target Meet Spell Criteria?"
        const DIALOG_TEXT = `The target, <b>${tToken.name}</b>, must be a humanoid within 10 feet of 
        <b>${aToken.name}</b> that has been dead for no longer than 1 minute and died violently. <br><br>
        Is this true?<br><br>`
        new Dialog({
            title: DIALOG_TITLE,
            content: DIALOG_TEXT,
            buttons: {
                yes: {
                    label: "Yes", callback: async () => {
                        // Summon Specter to the field
                        summonCritter(SOURCE_CRITTER, SPECTER_NAME, tToken)
                        // Hide the token that was used as the source of the summon
                        tToken.update({ "hidden": true });
                        await jez.wait(1000)
                        tToken.refresh()
                        // Post exit message
                        msg = `<b>${aToken.name}</b> has summoned ${SPECTER_NAME}, which now serves it.`
                        postResults(msg)
                    }
                },
                no: { label: "No", callback: () => { 
                    // Post exit message
                    msg = `<b>${tToken.name} does not meet spell requirements.`
                    postResults(msg)

                } }
            },
            default: "yes",
        }).render(true);
    }
}
/***************************************************************************************************
 * Obtain name of Specter to be summoned, return empty string if no names are available.
 ***************************************************************************************************/
async function getSpecterName(activeToken) {
    // TODO: Scan the field making sure the name is not on use, going from 1 to 7
    let summonName = ""
    const BASE_NAME = `${activeToken.name}'s Specter`
    for (let i = 1; i <= 7; i++) {
        let CHECK_NAME = `${BASE_NAME} ${i}`
        jez.log("CHECK_NAME", CHECK_NAME)
        let nameTokenDoc = game.scenes.viewed.data.tokens.getName(CHECK_NAME)
        if (!nameTokenDoc) { 
            summonName = CHECK_NAME;
            break;
        }
    }
    return(summonName)
}
/***************************************************************************************************
 * Summon the actor and rename with a numeric suffix
 * 
 * https://github.com/trioderegion/warpgate
 ***************************************************************************************************/
 async function summonCritter(summons, name, TARGET_TOKEN) {
    let updates = { token : {name: name} }
    const OPTIONS = { controllingActor: aActor };
    // COOL-THING: Plays VFX before and after the warpgate summon.
    const CALLBACKS = {
      pre: async (template) => {
        preEffects(template);
        await warpgate.wait(500);
      },
      post: async (template) => {
        postEffects(template);
        await warpgate.wait(500);
      }
    };
    //updates = mergeObject(updates, choice);
    //await warpgate.spawn(summons, updates, CALLBACKS, OPTIONS);
    await warpgate.spawnAt(TARGET_TOKEN.center, summons, updates, CALLBACKS, OPTIONS);

  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function preEffects(template) {
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Explosion/Explosion_*_Green_400x400.webm"
    new Sequence()
      .effect()
      .file(VFX_FILE)
      .atLocation(template)
      .center()
      .scale(1.0)
      .play()
  }
  /***************************************************************************************************
   * 
   ***************************************************************************************************/
   async function postEffects(template) {
    const VFX_FILE = "modules/jb2a_patreon/Library/Generic/Smoke/SmokePuff01_*_Dark_Green_400x400.webm"
    new Sequence()
      .effect()
        .file(VFX_FILE)
        .atLocation(template)
        .center()
        .scale(1.0)
      .play()
  }
