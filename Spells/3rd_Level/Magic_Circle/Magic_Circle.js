const MACRONAME = "Magic_Circle.js"
/*****************************************************************************************
 * Manage a VFX indicating the area of effect of this spell
 * 
 * 02/25/22 0.1 Creation of Macro
 *****************************************************************************************/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (LAST_ARG.tokenId) aActor = canvas.tokens.get(LAST_ARG.tokenId).actor; else aActor = game.actors.get(LAST_ARG.actorId);
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId); else aToken = game.actors.get(LAST_ARG.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
let msg = "";
//----------------------------------------------------------------------------------
// Fire off the dialog that does everything else
//
popDialog()
jez.log(`============== Finishing === ${MACRONAME} =================`);
return;
/***************************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
// COOL-THING: Effect will appear at template, center
async function runVFX(color) {
    const FUNCNAME = "runVFX(color)";
    const VFX_NAME = `${MACRO}-${aToken.name}`
    const VFX_INTRO = `modules/jb2a_patreon/Library/Generic/Magic_Signs/AbjurationCircleIntro_02_Regular_${color}_800x800.webm`
    const VFX_LOOP = `modules/jb2a_patreon/Library/Generic/Magic_Signs/AbjurationCircleLoop_02_Regular_${color}_800x800.webm`
    const VFX_OUTRO = `modules/jb2a_patreon/Library/Generic/Magic_Signs/AbjurationCircleOutro_02_Regular_${color}_800x800.webm`
    const VFX_OPACITY = 1.0;
    const VFX_SCALE = 0.55;
    jez.log(`-------------- Starting --- ${MACRONAME} ${FUNCNAME} -----------------`);
    const templateID = args[0].templateId
    jez.log('templateID', templateID)
    jez.log("canvas.templates.objects.children", canvas.templates.objects.children)
    //------------------------------------------------------------------------------------------
    // COOL-THING: Fetch the X,Y coordinates from a targeting template. Delet template after.
    //
    let fetchedTemplate = canvas.templates.objects.children.find(i => i.data._id === templateID);
    let x = fetchedTemplate.center.x
    let y = fetchedTemplate.center.y
    jez.log(`fetchedTemplate x,y ${x},${y}`,fetchedTemplate)
    canvas.templates.get(templateID).document.delete()
    //------------------------------------------------------------------------------------------
    // COOL-THING: Define a three phase VFX sequence
    //
    new Sequence()
        .effect()
            .file(VFX_INTRO)
            .atLocation({ x:x, y:y }) 
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .waitUntilFinished(-500) 
        .effect()
            .file(VFX_LOOP)
            .atLocation({ x:x, y:y })
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .persist()
            //.duration(4000)
            .name(VFX_NAME) 
            .waitUntilFinished(-500) 
        .effect()
            .file(VFX_OUTRO)
            .scale(VFX_SCALE)
            .opacity(VFX_OPACITY)
            .atLocation({ x:x, y:y })
        .play();
    jez.log(`-------------- Finished --- ${MACRONAME} ${FUNCNAME} -----------------`);
    return (true);
}
/***************************************************************************************************
 * Pop a Dialog to ask for mode this spell is being case.
 ***************************************************************************************************/
async function popDialog() {
    const TITLE  = "What variety of Magic Circle is being cast?"
    const QUERY1 = "Select the type of creature that will be warded by this spell"
    const LIST1  = [
        "Celestial (Yellow)",
        "Elemental (Blue)",
        "Fey (Green)",
        "Fiend (Red)",
        "Undead (Purple)",
    ]
    const QUERY2 = "Prevent warded creature type entrance or exit from circle?"
    const LIST2 = [
        'Entrance',
        'Exit'
    ]
    pickDoubleDialog(TITLE, QUERY1, QUERY2, pickDoubleCallBack, LIST1, LIST2)
}
/***************************************************************************************
 * Create and process double radio button dialog, passing it onto specified callback 
 * 
 * const queryTitle = "Select Item in Question"
 * const queryText1 = "Pick one from following list"
 * pickCallBack = call back function
 * options1 array of strings to be offered as choices, perhaps pre-sorted
 * 
 * Sample Call:
 *   const queryTitle = "Select Item in Question"
 *   const queryText1 = "Pick one from the list" 
 *   pickRadioListArray(queryTitle, queryText1, pickRadioCallBack, actorItems.sort());
 ***************************************************************************************/
async function pickDoubleDialog(queryTitle, queryText1, queryText2, pickCallBack, options1, options2) {
    const FUNCNAME = "pickDoubleDialog(queryTitle, queryText1, queryText2, pickCallBack, options1, options2)";
    jez.log("---------Starting ---${FUNCNAME}-----",
        `queryTitle`, queryTitle,
        `queryText1`, queryText1,
        `queryText2`, queryText2,
        `pickCallBack`, pickCallBack,
        `options1`, options1,
        `options2`, options2);
    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, first radio box
    //
    let template = `
<div>
<label>${queryText1}</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option of options1) {
        template += `<input type="radio" id="${option}" name="selectedLine1" value="${option}"> <label for="${option}">${option}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    //----------------------------------------------------------------------------------------------------
    // Build HTML Template, second radio box
    //
    template += `
    <div>
    <label>${queryText2}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
    for (let option2 of options2) {
        template += `<input type="radio" id="${option2}" name="selectedLine2" value="${option2}"> <label for="${option2}">${option2}</label><br>
`   // Back tick on its on line to make the console output better formatted
    }
    template += `</div></div>`
    //----------------------------------------------------------------------------------------------------
    // Build Dialog 
    //
    new Dialog({
        title: queryTitle,
        content: template,
        buttons: {
            ok: {
                icon: '<i class="fas fa-check"></i>',
                label: 'OK',
                callback: async (html) => {
                    jez.log("html contents", html)
                    const SELECTED_OPTION1 = html.find("[name=selectedLine1]:checked").val();
                    jez.log("Radio Button Selection", SELECTED_OPTION1)
                    jez.log('selected option', SELECTED_OPTION1)
                    const SELECTED_OPTION2 = html.find("[name=selectedLine2]:checked").val();
                    jez.log("Radio Button Selection", SELECTED_OPTION2)
                    jez.log('selected option', SELECTED_OPTION2)
                    pickCallBack(SELECTED_OPTION1, SELECTED_OPTION2)
                },
            },
            cancel: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: async (html) => {
                    jez.log('canceled')
                    pickCallBack(null)
                },
            },
        },
        default: 'cancel',
    }).render(true)
    jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
    return;
}
/***************************************************************************************************
 * 
 ***************************************************************************************************/
function pickDoubleCallBack(sel1, sel2) {
    jez.log("pickDoubleCallBack", "sel1", sel1, "sel2", sel2)
    //----------------------------------------------------------------------------------------------
    // Parse sel1 into type of creature and color of the VFX
    // Selction to be of form: "Type (Color)"
    //
    const SEL_ARRAY = sel1.split(" ")
    const TYPE = SEL_ARRAY[0]
    let color = SEL_ARRAY[1].substring(1)   // Chop first character from the string
    color = color.slice(0, -1)              // Chop last character from the string
    jez.log(`Type of creature: ${TYPE}, Color of circle: ${color}`)
    //----------------------------------------------------------------------------------------------
    // Launch the VFX for the spell
    //
    runVFX(color)
    //----------------------------------------------------------------------------------------------
    // Second selection should be simply a string: "Entrance" or "Exit"
    //
    jez.log(`Warding to prevent ${sel2} of ${TYPE} creatures and effects`)
    let direction = "<b>Entrance</b> to"
    if (sel2 === "Exit") direction = "<b>Exit</b> from"
    //----------------------------------------------------------------------------------------------
    // Create and display appropriate message to chat card
    //
    msg=`<b>${aToken.name}</b> has created a magic circle against <b>${TYPE}</b> creatures and 
        their effects, warding against ${direction} the circle.`
    let CHAT_MSG = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(CHAT_MSG, {
        color: jez.randomDarkColor(),
        fSize: 14,
        msg: msg,
        tag: "saves"
    })
}