const MACRONAME = "Set_Familiar_Name.js"
/*****************************************************************************************
 * Obtain and store the name of actor's familiar as a DAE Flag
 * 
 * 03/15/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
let aItem;          // Active Item information, item invoking this macro
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
const FLAG_NAME = "Familiar_Name"
//----------------------------------------------------------------------------------
// Just for funz access some jez-lib constants
//
console.log(jez.ADD)
console.log(jez.OVERRIDE)
console.log(jez.DAEFLAG_FAMILIAR_NAME)
console.log(`${jez.ADD} + ${jez.OVERRIDE} =`,jez.ADD + jez.OVERRIDE)
//----------------------------------------------------------------------------------
// Obtain the current name of familiar
//
//let currentName = await DAE.getFlag(aToken.actor, jez.DAEFLAG_FAMILIAR_NAME);
//if (!currentName) currentName = ""
let currentName = await jez.familiarNameGet(aToken.actor)
jez.log("currentName",currentName)
//----------------------------------------------------------------------------------
// Pop a dialog to solicit new name input
//
let template = `<div><label>Enter the name of the familar in the box below, exactly as it 
                    is stored in the <b>Actors Directory</b></label>
                <div class="form-group" style="font-size: 14px; padding: 5px; 
                    border: 2px solid silver; margin: 5px;">
                    <input name="TEXT_SUPPLIED" style="width:350px" value=${currentName}></div>`
let d = new Dialog({
    title: `Set ${aToken.name}'s Familiar's Name`,
    content: template,
    buttons: {
        done: {
            label: "Store",
            callback: (html) => {
                callBackFunc(html, "chat");
            }
        },
        cancel: {
            label: "Cancel",
            callback: (html) => {
                msg = `Hopefully, you didn't really want to mess with the familiar's name.  Because I'm not going to.`;
                postResults(msg);
            }
        }
    },
    default: "cancel"
})
d.render(true)
return
//----------------------------------------------------------------------------------
// 
//
async function callBackFunc(html, mode) {
    const TEXT_SUPPLIED = html.find("[name=TEXT_SUPPLIED]")[0].value;
    if (TEXT_SUPPLIED === "") {
        msg = `Name supplied is an empty string.<br><br>So, I'll delete the flag`;
        postResults(msg);
        //await DAE.unsetFlag(aToken.actor, jez.DAEFLAG_FAMILIAR_NAME);
        await jez.familiarNameUnset(aToken.actor)
        return;
    }
    if (mode === "chat") {
        msg = `Name for ${aToken.name}'s familiar shall now be <b>'${TEXT_SUPPLIED}</b>.'
                <br><br>I hope you are happy now!`;
        postResults(msg);
        //await DAE.setFlag(aToken.actor, jez.DAEFLAG_FAMILIAR_NAME, TEXT_SUPPLIED);
        await jez.familiarNameSet(aToken.actor, TEXT_SUPPLIED)
        return;
    }
    msg = `Hopefully, you didn't really want to mess with the familiar's name.  
        Because you seemingly canceled the dialog.`;
    postResults(msg);
    return;
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}