const MACRONAME = "Bestow_Curse_0.4.js"
/*****************************************************************************************
 * Implemention of Bestow Curse.
 * 
 * Description: long....go read it elsewhere.  The specific afllictions are:
 * 
 * (1) Choose one ability score. While cursed, the target has disadvantage on ability 
 *     checks and saving throws made with that ability score.
 * (2) While cursed, the target has disadvantage on attack rolls against you.
 * (3) While cursed, the target must make a Wisdom saving throw at the start of each of 
 *     its turns. If it fails, it wastes its action that turn doing nothing.
 * (4) While the target is cursed, your attacks and spells deal an extra 1d8 necrotic 
 *     damage to the target.
 * 
 * 1 is coded below.  
 * 2 & 3 are manual (for now?).  
 * 4 May be done with the right hook? (like hex, maybe?)
 * 
 * 12/15/21 0.1 Picking up non-working macro that Jon put together, adding heasders first
 * 12/15/21 0.2 Added some flavor text 
 * 05/02/22 0.4 Update for Foundry 9.x
 ******************************************************************************************/
const DEBUG = true;
const CURSENAME = "BestowCurse";
const itemD = args[0].item;
const player = canvas.tokens.get(args[0].tokenId);
const targetD = canvas.tokens.get(args[0].targets[0]?.id);
const CONDITION = "Cursed";
let msg = "";

if (DEBUG) {
    console.log(`Starting: ${MACRONAME}`);
    console.log(`   Curse: ${CURSENAME}`);
    console.log(`   itemD: `, itemD);
    console.log(`   itemD.img `, itemD.img);
    console.log(`  Player: `, player);
    console.log(` targetD: `, targetD);
}

// BetterCurses.curse(CURSENAME);

//---------------------------------------------------------------------------------------
// Make sure exactly one token was targeted
//
if (oneTarget()) {
    if (DEBUG) console.log(` one target is targeted (a good thing)`);
} else {
    if (DEBUG) console.log(` exception on number of targets selected: ${msg}`);
    await postResults(msg);
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}

//---------------------------------------------------------------------------------------
// Make sure target failed it's saving throw
//
if (failedCount() === 1) {
    if (DEBUG) console.log(` Target failed save, continue`);
} else {
    if (DEBUG) console.log(` Target passed save, exit`);
        await postResults("Target made its saving thow, no effects added");
    if (DEBUG) console.log(`Ending ${MACRONAME}`);
    return;
}

//---------------------------------------------------------------------------------------
// Pop dialog to selected affected stat and continue in the callback
//
const queryTitle = "Select Stat to be Afflicted"
const queryText  = "Pick one from drop down list"
pickStat(queryTitle, queryText, "Strength", "Dexterity", "Constitution", 
                                "Intelligence", "Wisdom", "Charisma");

//---------------------------------------------------------------------------------------
// Finish up this bit o'code
//
if (DEBUG) console.log(`Finishing: ${MACRONAME}`);
return;

 /***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Receive selected stat and continue main steps
 ***************************************************************************************/
async function selectionCallBack(selection) {
    console.log(`stubCallBack received: `, selection);

    // ---------------------------------------------------------------------------------------
    // Add cursed condition to target
    //
    const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
    let gameRound = game.combat ? game.combat.round : 0;
    let stat = "";

    //let statObject = { "Strength":"str", "Dexterity":"dex", "Constitution":"con", 
    //                   "Intelligence":"int", "Wisdom":"wis", "Charisma":"cha" };
    //let statObject = { Strength:"str", Dexterity:"dex", Constitution:"con", 
    //                   Intelligence:"int", Wisdom:"wis", Charisma:"cha" };

    switch(selection) {
        case "Strength"     : stat = "str"; break;
        case "Dexterity"    : stat = "dex"; break;
        case "Constitution" : stat = "con"; break;
        case "Intelligence" : stat = "int"; break;
        case "Wisdom"       : stat = "wis"; break;
        case "Charisma"     : stat = "cha"; break;
        default             : stat = "XYZ"; break;
    }                   

    if (DEBUG) console.log(` Short Stat Name: `, stat);
    
    // flags.midi-qol.disadvantage.ability.check.cha
    // flags.midi-qol.disadvantage.ability.save.cha

    let effectData = {
        label: CONDITION,
        icon: itemD.img,
        origin: player.actor.uuid,
        disabled: false,
        duration: { rounds: 99, startRound: gameRound },
        changes: [
            { key: `flags.midi-qol.disadvantage.ability.check.${stat}`, mode: ADD, value: 1, priority: 20 },
            { key: `flags.midi-qol.disadvantage.ability.save.${stat}`,  mode: ADD, value: 1, priority: 20 },
        ]
    };
    await MidiQOL.socket().executeAsGM("createEffects",{actorUuid:targetD.actor.uuid, effects: [effectData] });

    msg = `1) <b>${targetD.name}</b> is afflicted by <b>${player.name}'s</b> curse. Saves 
    and checks with <b>${selection}</b> are degraded.  
    <br><br>2) ${targetD.name} attacks against ${player.name} are <b>at disadvantage</b>. 
    <br><br>3) While afflicted ${targetD.name} must make a <b>wisdom save</b> against 
    <b>DC${itemD.data.save.dc}</b> at the beinnging of each of its turns or take no actions. 
    <br><br>4) ${player.name}'s attacks against it do more damage (<b>FoundryVTT</b> use: 
    @Item[bfGp5MZ6r1wsQ3r9]{Bestow Curse Damage} innate spell as a free action).`
    postResults(msg);

    return;
}

/****************************************************************************************
 * Create and process dialog
 ***************************************************************************************/
function pickStat(queryTitle, queryText, ...queryOptions) {
    if (DEBUG) {
        console.log(`Starting: pickStat`);
        console.log(`   queryTitle: ${queryTitle}`);
        console.log(`    queryText: ${queryText}`);
        console.log(` queryOptions: `, queryOptions);
    }

    if (!queryTitle || !queryText || !queryOptions) {
        return ui.notifications.error(
            `query-from-list arguments should be (queryTitle, queryText, ...queryOptions),` +
            `but yours are: ${queryTitle}, ${queryText}, ${queryOptions}`,
        )
    }

    let template = `
    <div>
    <div class="form-group">
        <label>${queryText}</label>
        <select id="selectedOption">`
    for (let option of queryOptions) {
        template += `<option value="${option}">${option}</option>`
    }
    template += `</select>
    </div></div>`

    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    const selectedOption = html.find('#selectedOption')[0].value
                    console.log('selected option', selectedOption)
                    selectionCallBack(selectedOption)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    console.log('canceled')
                    selectionCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
}

/***************************************************************************************
 * Post the results to chat card
 ***************************************************************************************/
 async function postResults(resultsString) {
    const lastArg = args[args.length - 1];

    if (DEBUG) console.log(`resultsString: ${resultsString}`)
    let chatmsg = game.messages.get(lastArg.itemCardId);
    let content = await duplicate(chatmsg.data.content);
    if (DEBUG) console.log(`chatmsg: `,chatmsg);
    const searchString = /<div class="end-midi-qol-saves-display">/g;
    const replaceString = `<div class="end-midi-qol-saves-display">${resultsString}`;
    content = await content.replace(searchString, replaceString);
    await chatmsg.update({ content: content });
    await ui.chat.scrollBottom();
    return;
}


/************************************************************************
 * Verify exactly one target selected, boolean return
*************************************************************************/
function oneTarget() {
    if (!game.user.targets) {
        msg = `Targeted nothing, must target single token to be acted upon`;
        // ui.notifications.warn(msg);
        if (DEBUG) console.log(msg);
        return (false);
    }
    if (game.user.targets.ids.length != 1) {
        msg = `Target a single token to be acted upon. Targeted ${game.user.targets.ids.length} tokens`;
        // ui.notifications.warn(msg);
        if (DEBUG) console.log(msg);
        return (false);
    }
    if (DEBUG) console.log(` targeting one target`);
    return (true);
}

/****************************************************************************************
 * Return the number of tokens that failed their saving throw
 ***************************************************************************************/
 function failedCount() {
    let failCount = args[0].failedSaves.length
    if (DEBUG) console.log(`${failCount} args[0].failedSaves: `, args[0].failedSaves)
    return (failCount);
}