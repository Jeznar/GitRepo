const MACRONAME = "Dialog_Specify_Item.0.1"
/*******************************************************************
 *  
 * 01/03/21 1.0 JGB Creation
 ******************************************************************/
 const DEBUG = true;
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 log("---------------------------------------------------------------------------",
     "Starting", `${MACRONAME}`);
 for (let i = 0; i < args.length; i++) log(`  args[${i}]`, args[i]);
 const lastArg = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
 if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
 const CUSTOM = 0, MULTIPLY = 1, ADD = 2, DOWNGRADE = 3, UPGRADE = 4, OVERRIDE = 5;
 const ATTACK_ITEM = "Heat Metal Damage";
 log("------- Global Values Set -------",
     `Active Token (aToken) ${aToken?.name}`, aToken,
     `Active Actor (aActor) ${aActor?.name}`, aActor,
     `Active Item (aItem) ${aItem?.name}`, aItem)
 let msg = "";
 let errorMsg = "";



//----------------------------------------------------------------------------------
// Below is the unique code for this macro
//
 const CAST = "Cast"
 const ABORT = "Cancel"

 PickItem();
 return

//----------------------------------------------------------------------------------
// 
async function PickItem() {
    let cast = false
    let selection = ABORT;             // default to cancel

    new Dialog({
        title: "Select Item to Heat",
        content: `
    <div><h3>What type of item is to be heated by ${aToken.name}'s Heat Metal spell?</h3><div>
    <div>Item Description (Optional): <input name="descText" style="width:350px"/><br><br></div>
    <div><input name="droppableItem" type="checkbox"/>Item is easily dropped?<br><br></div>
    <div>Choices are: <br>
    <p style="margin-left:5%; margin-right:5%;">
    (1) <b>Droppable</b>: Item that is droppable in a single action<br>
    (2) <b>Worn</b>: Worn or otherwise impossible to simply drop<br>
    (3) <b>Abort</b>: Abort the casting</p></div>
    `,

        buttons: {
            cast: {
                label: CAST,
                callback: (html) => {
                    PerformCallback(html, CAST)
                }
            },
            abort: {
                label: ABORT,
                callback: (html) => {
                    PerformCallback(html, ABORT)
                }
            },
        },
        default: "abort",
    }).render(true);

    //await wait(50)
    async function PerformCallback(html, mode) {
        log("PerformCallback() function executing.", "mode", mode, "html", html);

        //log("html", html)
        //log("mode", mode)
        const DESC_TEXT = html.find("[name=descText]")[0].value;
        log("DESC_TEXT", DESC_TEXT)

        const CHECKED = html.find("[name=droppableItem]")[0].checked;
        log("CHECKED", CHECKED)

        return;
    }
}

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