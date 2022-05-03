const MACRONAME = "Howling_Babble.js"
/*****************************************************************************************
 * Implments the Allip's ability of same name.
 * 
 *   Each creature within 30 feet of the user of this ability that can hear it must make a 
 *   DC 14 Wisdom saving throw. On a failed save, a target takes 12 (2d8 + @mod) psychic 
 *   damage, and it is  Stunned until the end of its next turn. On a successful save, it 
 *   takes half as much damage and isn’t stunned.
 * 
 *   Constructs and undead are immune to this effect.
 * 
 * 04/14/22 0.1 Creation of Macro
 * 05/02/22 0.2 Update for Foundry 9.x
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
    const SAVE_TYPE = "wis"
    const SAVE_DC = jez.getSpellDC(aToken)
    const DAM_DICE = "2d8"
    const DAM_TYPE = "psychic"
    let failSaves = []  // Array to contain the tokens that failed their saving throws
    let madeSaves = []  // Array to contain the tokens that made their saving throws
    //----------------------------------------------------------------------------------
    // Build array of tokens in range
    //
    const ALLOWED_UNITS = ["", "ft", "any"];
    let range = jez.getRange(aItem, ALLOWED_UNITS)
    jez.log("range", range)
    let tokensArray = await jez.tokensInRange(aToken, range)
    let susceptibleArray = []
    //----------------------------------------------------------------------------------
    // Exit if no tokens in range
    // 
    if (!tokensArray || tokensArray.length === 0) {
        postResults("No tokens in range");
        return (false)
    }
    //----------------------------------------------------------------------------------
    // Build array of tokens that can be affected
    //
    for (const ELEMENT of tokensArray) {
        let race = jez.getRace(ELEMENT)
        if (race.includes("construct")) continue    // Skip ahead if construct and immune
        if (race.includes("undead")) continue    // Skip ahead if undead and immune
        susceptibleArray.push(ELEMENT)                // Add affecteable element to array
    }
    //----------------------------------------------------------------------------------
    // Build an array of the affectable tokens and IDs, wrapped in parens
    //
    let dialogEntries = []
    for (const ELEMENT of susceptibleArray) {
        const LINE = `${ELEMENT.name}      ${ELEMENT.id}`
        dialogEntries.push(LINE)
    }
    //----------------------------------------------------------------------------------
    // Pop Dialog to allow selection of targets that can hear the effect.  Processing 
    // will continue in the call back function from that dialog.
    //
    popDialog();
    function popDialog() {
        const Q_TITLE = "Select Tokens that can Hear the Effect"
        const Q_TEXT = `Check all the creatures that can hear ${aToken.name}'s 
        ${aItem.name} effect.  Not the ones that you want to be affected, but all
        that can hear the effect.`
        jez.pickCheckListArray(Q_TITLE, Q_TEXT, callBack, dialogEntries.sort());
        jez.log(``)
        return
    }
    //----------------------------------------------------------------------------------
    // Following is the call back function
    //
    async function callBack(selection) {
        let targetedArray = []
        if (selection === null) return
        if (selection.length === 0) { popDialog(); return }
        jez.runRuneVFX(aToken, jez.getSpellSchool(aItem))
        //----------------------------------------------------------------------------------
        // Build targetedArray of tokens from all those tasty token.ids selected
        //
        for (let i = 0; i < selection.length; i++) {
            msg += `${i + 1}) ${selection[i]}<br>`
            const ELEMENTS = selection[i].split(" ")
            jez.log('Last token', ELEMENTS[ELEMENTS.length - 1])
            targetedArray.push(game.scenes.viewed.data.tokens.get(ELEMENTS[ELEMENTS.length - 1]))
        }
        //----------------------------------------------------------------------------------
        // Determine how much damage is to be done
        //
        let damageRoll = new Roll(`${DAM_DICE}+${jez.getCastMod(aToken)}`).evaluate({async:false});
        game.dice3d?.showForRoll(damageRoll);
        jez.log("damageRoll", damageRoll)
        //----------------------------------------------------------------------------------
        // Step through affectable tokens, making a list of those that saved and failed
        //
        jez.log(targetedArray)
        for (const ELEMENT of targetedArray) {
            jez.log(`Affectable: ${ELEMENT.name}`)
            let save = await ELEMENT.actor.rollAbilitySave(SAVE_TYPE, {FLAVOR:"Something", chatMessage:true, fastforward:true});
            jez.log("save", save)
            if (save.total >= SAVE_DC) {
                jez.log(`Saved:  ${ELEMENT.name} with a ${save.total}`)
                madeSaves.push(ELEMENT)
            } else {
               jez.log(`Failed: ${ELEMENT.name} with a ${save.total}`)
               failSaves.push(ELEMENT)
            }
        } 
        //---------------------------------------------------------------------------------------------
        // Process Tokens that Made Saves. Apply the prescribed damage.
        //
        if (madeSaves.length > 0) {
            //-----------------------------------------------------------------------------------------------
            // Create a fake roll, fudged to come up with half the damage for when target saves
            //
            let damageRollSaved = new Roll(`${Math.floor(damageRoll.total / 2)}`).evaluate({async:false});
            //-----------------------------------------------------------------------------------------------
            // Apply damage to those that saved
            //
            await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total,
                DAM_TYPE, madeSaves, damageRollSaved,
                {
                    flavor: `(${CONFIG.DND5E.healingTypes[DAM_TYPE]})`,
                    itemCardId: args[0].itemCardId,
                    useOther: false
                }
            )
        }
        //---------------------------------------------------------------------------------------------
        // Process Tokens that Failed Saves. Apply the prescribed damage.
        //
        if (failSaves.length > 0) {
            runDizzyVFXonTargets(failSaves)
            //-----------------------------------------------------------------------------------------------
            // Apply damage to those that saved
            //
            await new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total,
                DAM_TYPE, failSaves, damageRoll,
                {
                    flavor: `(${CONFIG.DND5E.healingTypes[DAM_TYPE]})`,
                    itemCardId: args[0].itemCardId,
                    useOther: false
                }
            )
            //-----------------------------------------------------------------------------------------------
            // Apply Stunned condition to each failed token
            //
            for (const ELEMENT of failSaves) {
                let effectData = [{
                    label: `Stunned by Howling Babble`,
                    icon: aItem.img,
                    origin: LAST_ARG.uuid,
                    disabled: false,
                    duration: { seconds: 12, startTime: game.time.worldTime },
                    flags: { dae: { itemData: aItem, specialDuration: ["turnEnd", "newDay", "longRest", "shortRest"] } },
                    changes: [
                        { key: `macro.CUB`, mode: jez.CUSTOM, value: `Stunned`, priority: 20 },
                    ]
                }];
                await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:ELEMENT.uuid, effects: effectData });
            }
        }
        return (true);
    }
}
/***************************************************************************************************
 * Run Dizzy VFX on Targets
 ***************************************************************************************************/
 async function runDizzyVFXonTargets(targets) {
    const VFX_LOOP = "jb2a.dizzy_stars.400px.blueorange"
    for (const element of targets) {
        new Sequence()
            .effect()
            .file(VFX_LOOP)
            .atLocation(element)
            .scaleToObject(1.5)
            .duration(6000)
            .play();
    }
 }