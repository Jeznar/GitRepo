const MACRONAME = "Fey_Step.0.2"
console.log(MACRONAME)
/*****************************************************************************************
 * Create a temporary attack item to use against the victim of Heat Metal
 * 
 * 01/13/22 0.1 Creation of Macro
 * 01/14/22 0.2 Add Fuming self buff
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
const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
log("------- Global Values Set -------",
    `Active Token (aToken) ${aToken?.name}`, aToken,
    `Active Actor (aActor) ${aActor?.name}`, aActor,
    `Active Item (aItem) ${aItem?.name}`, aItem)
let msg = "";
let errorMsg = "";

let nameParts = aToken.name.split(" ")
let mood = nameParts[nameParts.length - 2]
log(`${aToken.name} is a in a ==>${mood}<== mood.`)

PerformMoodSpecificSteps();

log(`============== Finishing === ${MACRONAME} =================`);
log("")
return;

async function PerformMoodSpecificSteps() {
        log("Starting Async Function");
        switch (mood) {
            case "Fuming":
                log("Do fuming stuff");

                const buff = `Fuming Feystep Advantage`
                let gameRound = game.combat ? game.combat.round : 0;
                let effectData = {
                    label: buff,
                    icon: aItem.img,
                    origin: aActor.uuid,
                    disabled: false,
                    duration: { turns: 1, startRound: gameRound },
                    flags: { dae: { macroRepeat: "none", specialDuration: ["turnStart", "1Attack"] } },
                    changes: [
                        { key: `flags.midi-qol.advantage.attack.all`, mode: ADD, value: 1, priority: 20 },
                    ]
                };
                await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: aActor.uuid, effects: [effectData] });
                break;
            case "Mirthful":
                log("do mirthful stuff");
                /* 
                 * Mirthful. The fey can force one creature it can see within 10 feet of it to make a Wisdom saving 
                 * throw against your spell save DC. Unless the save succeeds, the target is charmed by you and the 
                 * fey for 1 minute or until the target takes any damage.
                 */
                break;
            case "Tricksy":
                log("do tricksy stuff");



                // code block
                break;
            default:
                errorMsg = `Summoned Fey does not have an allowed "mood" (Fuming, Mirthful, or Tricksy)`;
                log(errorMsg);
                ui.notifications.error(errorMsg);
                return (false);

            // code block
        }

        return;
}

/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************/

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