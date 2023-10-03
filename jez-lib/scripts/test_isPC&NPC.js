const MACRONAME = "test_isPC&NPC.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * 
 * 12/19/22 0.1 Creation 
 * 10/03/23 0.2 Generalization to accept subject not just UUID
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
let msg = "";                               // Global message string
let pcsString = "";
let npcsString = "";
const tempOnly = true;
//---------------------------------------------------------------------------------------------------------------------------------
const TOKEN_COUNT = jez.selectedTokens(MACRO)
if (!TOKEN_COUNT) return
//---------------------------------------------------------------------------------------------------------------------------------
for (let token of canvas.tokens.controlled) {
    console.log(`Token ${token.name}`,token.actor)
    if (await /*jez.*/isPC(token, { traceLvl: TL })) pcsString += `<br>${token.name}`
    if (await /*jez.*/isNPC(token.id, { traceLvl: TL })) npcsString += `<br>${token.name}`
}
msg = `Checked ${TOKEN_COUNT} tokens<br><br>
    These are PCs<br>-----------------${pcsString}<br><br>
    These are NPCs<br>------------------${npcsString}<br>`
jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png', title: 'Token Check PC/NPC Status', msg: msg })
//---------------------------------------------------------------------------------------------------------------------------------
// Next, try a few actors by name from the actor directory
//
pcsString = ''
npcsString = ''
const ACTOR_NAMES = [ 'Giant Eagle', 'Amend', 'Olivia Ironlocke', 'Zombie' ]
// const ACTOR_NAMES = [ 'Olivia Ironlocke', 'Zombie' ]
for (let i = 0; i < ACTOR_NAMES.length; i++) {
    actor5e = game.actors.getName(ACTOR_NAMES[i])
    console.log(`Actor ${actor5e.name}`,actor5e)
    if (await /*jez.*/isPC(actor5e.uuid, { traceLvl: TL })) pcsString += `<br>${actor5e.name}`
    if (await /*jez.*/isNPC(actor5e, { traceLvl: TL })) npcsString += `<br>${actor5e.name}`
}
msg = `Checked ${ACTOR_NAMES.length} actors<br><br>
    These are PCs<br>-----------------${pcsString}<br><br>
    These are NPCs<br>------------------${npcsString}<br>`
jez.postMessage({ color: jez.randomDarkColor(), fSize: 14, icon: 'Icons_JGB/Misc/Jez.png', title: 'Actor Check PC/NPC Status', msg: msg })


    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * isPC(subject) - Returns true if the identified actor is a PC (not a NPC), false otherwise
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
    // static async isPC(subject, options = {}) {
    async function isPC(subject, options = {}) {
        const FUNCNAME = "isPC(subject, options = {})";
        const FNAME = FUNCNAME.split("(")[0]
        const TAG = `jez.${FNAME} |`
        const TL = options.traceLvl ?? 0
        if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
        if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'subject', subject, "options", options);
        //-------------------------------------------------------------------------------------------------------------------------------
        // Fetch the data block for our subject
        //
        // const OBJ = await fromUuid(actorUuid)
        // if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'OBJ', OBJ)
        const ACTOR_OBJ = await jez.getActor5eDataObj(subject, { traceLvl: TL })
        if (!ACTOR_OBJ) return null // If subject didn't get us something, give up and quit.
        if (TL > 1) jez.trace(`${TAG} Actor Object received:`, ACTOR_OBJ)
        //-------------------------------------------------------------------------------------------------------------------------------
        // Do we have a Actor5e, TokenDocument5e object, or a problem?
        //
        const IS_ACTOR5E = (ACTOR_OBJ?.constructor.name === "Actor5e") ? true : false
        const IS_TOKENDOCUMENT5E = (ACTOR_OBJ?.constructor.name === "TokenDocument5e") ? true : false
        if (!IS_ACTOR5E && !IS_TOKENDOCUMENT5E) return jez.badNews(`${TAG} Bad object type: ${ACTOR_OBJ?.constructor.name}`)
        //-------------------------------------------------------------------------------------------------------------------------------
        // Set actor5e based on whether it is an Actor5e or TokenDosument5e
        //
        const ACTOR_TYPE = (IS_ACTOR5E) ? ACTOR_OBJ.type : ACTOR_OBJ.actor.type
        if (TL > 1) jez.trace(`${TAG} ACTOR_TYPE`, ACTOR_TYPE)
        //-------------------------------------------------------------------------------------------------------------------------------
        //
        return (ACTOR_TYPE === "character") ? true : false
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
     * isNPC(subject) - Returns true if the identified actor is a NPC (not a PC), false otherwise
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
        // static async isNPC(subject, options = {}) {
        async function isNPC(subject, options = {}) {
            const FUNCNAME = "isNPC(subject, options = {})";
            const FNAME = FUNCNAME.split("(")[0]
            const TAG = `jez.${FNAME} |`
            const TL = options.traceLvl ?? 0
            if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
            if (TL > 1) jez.trace(`${TAG} --- Starting ${FUNCNAME}`, 'subject', subject, "options", options);
            //-------------------------------------------------------------------------------------------------------------------------------
            // Fetch the data block for our Uuid
            //
            // const OBJ = await fromUuid(actorUuid)
            // if (TL > 1) jez.trace(`${TAG} Data Accessed`, 'OBJ', OBJ)
            const ACTOR_OBJ = await jez.getActor5eDataObj(subject, { traceLvl: TL })
            if (!ACTOR_OBJ) return null // If subject didn't get us something, give up and quit.
            if (TL > 1) jez.trace(`${TAG} Actor Object received:`, ACTOR_OBJ)
            //-------------------------------------------------------------------------------------------------------------------------------
            // Do we have a Actor5e, TokenDocument5e object, or a problem?
            //
            const IS_ACTOR5E = (ACTOR_OBJ?.constructor.name === "Actor5e") ? true : false
            const IS_TOKENDOCUMENT5E = (ACTOR_OBJ?.constructor.name === "TokenDocument5e") ? true : false
            if (!IS_ACTOR5E && !IS_TOKENDOCUMENT5E) return jez.badNews(`${TAG} Bad object type: ${ACTOR_OBJ?.constructor.name}`)
            //-------------------------------------------------------------------------------------------------------------------------------
            // Set actor5e based on whether it is an Actor5e or TokenDosument5e
            //
            const ACTOR_TYPE = (IS_ACTOR5E) ? ACTOR_OBJ.type : ACTOR_OBJ.actor.type
            if (TL > 1) jez.trace(`${TAG} ACTOR_TYPE`, ACTOR_TYPE)
            //-------------------------------------------------------------------------------------------------------------------------------
            //
            return (ACTOR_TYPE === "npc") ? true : false
        }