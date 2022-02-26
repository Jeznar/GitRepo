const MACRONAME = "test_pickRadioListArray"
/*******************************************************************************************
 * This macro is a testing harness for the pickFromListRadio function.
 * 
 * It is intended to be run as an ItemMacro from an actor's item and will present a list 
 * of all the actor's Weapons and Equipment to choose from. 
 * 
 *******************************************************************************************/
 const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
 jez.log(`------------- Starting ${MACRONAME} --------------------`)
 for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
 const lastArg = args[args.length - 1];
 let aActor;         // Acting actor, creature that invoked the macro
 let aToken;         // Acting token, token for creature that invoked the macro
 let aItem;          // Active Item information, item invoking this macro
 if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
 if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
 if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
 jez.log("------- Global Values Set -------",
     `Active Token (aToken) ${aToken?.name}`, aToken,
     `Active Actor (aActor) ${aActor?.name}`, aActor,
     `Active Item (aItem) ${aItem?.name}`, aItem)
//----------------------------------------------------------------------------------
//
let actorItems = [];
const EXCLUDED_TYPES = ["spell", "feat", "class"]
const INCLUDED_TYPES = ["weapon", "equipment"]
//----------------------------------------------------------------------------------
//
for (let i = 0; i < aActor.items.contents.length; i++) {
    if (INCLUDED_TYPES.includes(aActor.items.contents[i].type)) {
        jez.log(` ${i}) ${aActor.items.contents[i].name} ${aActor.items.contents[i].type}`);
        actorItems.push(aActor.items.contents[i].name);
    }
}
for (let i = 0; i < actorItems.length; i++) {
    jez.log(` Item ${i}) ${actorItems[i]}`);
}
//----------------------------------------------------------------------------------
//
const queryTitle = "Select Item in Question"
const queryText = "Pick one from the list"
jez.pickRadioListArray(queryTitle, queryText, pickRadioCallBack, actorItems.sort());
return
//----------------------------------------------------------------------------------
//
function pickRadioCallBack(selection) {
    jez.log("pickRadioCallBack", selection)
    jez.postMessage({
        color: "green",
        fSize: 14,
        icon: aToken.data.img,
        msg: `${aToken.name} selected <b>"${selection}"</b> in the dialog`,
        title: `${aToken.name} made a pick`,
        token: aToken
    })
}