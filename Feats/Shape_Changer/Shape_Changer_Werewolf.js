const MACRONAME = "Shape_Changer_Werewolf.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Macro that manages the changing of appearance and naming of a token to automate the shape change ability of a Werewolf
 * 
 * Armor Class 11 in humanoid form, 12 natural armor in wolf or hybrid form
 * Speed 30 ft., (40 ft. in wolf form)
 * 
 * o Build arrays of information that define
 *   - Names of Shapes
 *   - Short Descriptions
 *   - Location of file tyo use as the token image
 * o Present player with a list of the names & descriptions to choose from
 * o Start an animation to play for the transformation
 * o Rename the token per name selected
 * o Update the token image
 * o Post a chat log message
 * 
 * 03/24/23 0.1 reation of Macro from Shape_Changer_Wereraven.0.2
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 0;                               // Trace Level for this macro
const WAIT = 2500;                          // Time to play the VFX in ms
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set standard variables
//
const L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
let aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)
let aActor = aToken.actor;
let aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData
const VERSION = Math.floor(game.VERSION);
const GAME_RND = game.combat ? game.combat.round : 0;
const OLD_NAME = aToken.name
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
// Find a token to use as wolf
const WOLF_DIR = 'Tokens/Beasts/Wolf/'
const WOLF_IMG = await pickToken(WOLF_DIR, aActor.data.token.name, {traceLvl: TL})
//  Values for update object
let values = {
    baseName: aActor.data.token.name,
    baseImg: aActor.data.token.img,
    names: [aActor.data.token.name,
        "Werewolf",
        "Wolf",
    ],
    descs: [
        `${aActor.data.token.name}'s humanoid form`,
        "Hybrid human/animal",
        "Animal form",
    ],
    moves: [
        { burrow: 0, climb: 0, fly: 0, hover: false, swim: 0, units: "ft", walk: 30 },
        { burrow: 0, climb: 0, fly: 0, over: false, swim: 0, units: "ft", walk: 30 },
        { burrow: 0, climb: 0, fly: 0, hover: false, swim: 0, units: "ft", walk: 40 },
    ],
    images: [
        aActor.data.token.img,
        `Tokens/Monsters/Werewolf/Werewolf.png`,
        WOLF_IMG,
    ],
    sizes: [
        { name: "med", height: 1, width: 1 },
        { name: "med", height: 1, width: 1 },
        { name: "med", height: 1, width: 1 }
    ],
    acs: [
        { calc: "default" },
        { calc: "flat", flat: 12 },
        { calc: "flat", flat: 12 }
    ]
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Run the main procedures, choosing based on how the macro was invoked
//
if (args[0]?.tag === "OnUse") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use
if (TL > 1) jez.trace(`${TAG} === Finished ===`);
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***********************************************************************************************************************************
 * Post results to the chat card
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
function postResults(msg) {
    const FUNCNAME = "postResults(msg)";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 2) jez.trace("postResults Parameters", "msg", msg)
    //-------------------------------------------------------------------------------------------------------------------------------
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function doOnUse(options = {}) {
    const FUNCNAME = "doOnUse(options={})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, "options", options);
    await jez.wait(100)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Function Variables
    //
    let shapeLines = []
    const FILTERID = 'ShapeChange'
    function dummyFunction(itemSelected) { return } // RadioList requires a function...
    //-------------------------------------------------------------------------------------------------------------------------------
    // Build array containing: Index, Name, Description for each choice
    //
    for (let i = 0; i < values.names.length; i++) {
        if (TL > 1) jez.trace(`${TAG}  Building line ${i + 1} for ${values.names[i]}`);
        shapeLines.push(`${i + 1}. ${values.names[i]} - ${values.descs[i]}`)
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Ask for new form to be selected from a Radio dialog
    //
    const queryTitle = "Select New Appearance/Form"
    const queryText = "Pick one from the list (or I'll do it for you!)"
    let selection = await jez.pickRadioListArray(queryTitle, queryText, dummyFunction, shapeLines);
    const SEL = selection ? selection.match(/[0-9]+/) - 1 : Math.floor(Math.random() * values.names.length)
    if (TL > 1) jez.trace(`${TAG} Shape selected: ${SEL}`, values.names[SEL])
    //-------------------------------------------------------------------------------------------------------------------------------
    // Play VFX on the transforming token
    //
    await applyTokenMagic(aToken, FILTERID, {traceLvl: TL})
    await jez.wait(WAIT)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the token with new name and image file
    //
    let updates = [];
    updates.push({
        _id: aToken.id,
        name: values.names[SEL],
        img: values.images[SEL],
        height: values.sizes[SEL].height,
        width: values.sizes[SEL].width
    });
    if (TL > 1) jez.trace(`${TAG}  Updating Token to ${SEL}`, 'Name', values.names[SEL], 'Image', values.images[SEL]);
    await jez.updateEmbeddedDocs("Token", updates)
    //-------------------------------------------------------------------------------------------------------------------------------
    // Update the actor with new movement values
    //
    // updates = [];
    // updates.push({
    //     _id: aToken.id,
    //     name: SHAPE_NAMES[SEL],
    //     img: SHAPE_IMAGE[SEL],
    // });
    // if (TL > 1) jez.trace(`${TAG}  Updating Token to ${SEL}`, 'Name', SHAPE_NAMES[SEL], 'Image', SHAPE_IMAGE[SEL]);
    // await jez.updateEmbeddedDocs("Token", updates)


    await jez.actorUpdate(aToken, { 
        "data.attributes.movement": values.moves[SEL], 
        "data.traits.size": values.sizes[SEL].name,
        "data.attributes.ac": values.acs[SEL],
    })
    

    //-------------------------------------------------------------------------------------------------------------------------------
    // Remove VFX from the transforming token
    //
    await removeTokenMagic(aToken, FILTERID, {traceLvl: TL}) 
    //-------------------------------------------------------------------------------------------------------------------------------
    // Exit message
    //
    msg = `${OLD_NAME} has shifted into ${values.names[SEL]} form.`
    postResults(msg)
    if (TL > 0) jez.trace(`${TAG} --- Finished ---`);
    return true;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply VFX to token using TokenMagic
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function applyTokenMagic(TARGET, FILTERID, options = {}) {
    const FUNCNAME = "applyTokenMagic(TARGET, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'TARGET', TARGET, 'FILTERID', FILTERID, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the TokenMagic VFX Data object
    //
    let params =
        [{
            filterId: FILTERID,
            filterType: "distortion",
            maskPath: "modules/tokenmagic/fx/assets/waves-2.png",
            maskSpriteScaleX: 7,
            maskSpriteScaleY: 7,
            padding: 50,
            animated:
            {
                maskSpriteX: { active: true, speed: 0.05, animType: "move" },
                maskSpriteY: { active: true, speed: 0.07, animType: "move" }
            }
        },
        {
            filterId: FILTERID,
            filterType: "ray",
            time: 0,
            color: 0xEF9000,
            alpha: 0.25,
            divisor: 32,
            anchorY: 1,
            animated:
            {
                time:
                {
                    active: true,
                    speed: 0.0005,
                    animType: "move"
                }
            }
        },
        {
            filterId: FILTERID,
            filterType: "glow",
            distance: 10,
            outerStrength: 8,
            innerStrength: 0,
            color: 0xB03000,
            quality: 0.5,
            animated:
            {
                color:
                {
                    active: true,
                    loopDuration: 3000,
                    animType: "colorOscillation",
                    val1: 0xB03000,
                    val2: 0xFFD010
                }
            }
        }
        ];
    let result = await TokenMagic.addFilters(TARGET, params); // addFilters: async addFilters(placeable, paramsArray, replace = false)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return result;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Apply VFX to token using TokenMagic
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function removeTokenMagic(TARGET, FILTERID, options = {}) {
    const FUNCNAME = "removeTokenMagic(TARGET, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'TARGET', TARGET, 'FILTERID', FILTERID, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // Define the TokenMagic VFX Data object
    //
    await TokenMagic.deleteFilters(TARGET, FILTERID); // deleteFilters: async deleteFilters(placeable, filterId = null)
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);
    return;
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * Fetch a token from those passed, return null if no choice available
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
async function pickToken(DIR, IDEAL, options = {}) {
    const FUNCNAME = "pickToken(DIR, IDEAL, options = {})";
    const FNAME = FUNCNAME.split("(")[0]
    const TAG = `${MACRO} ${FNAME} |`
    const TL = options.traceLvl ?? 0
    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);
    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, 'DIR', DIR, 'IDEAL', IDEAL, "options", options);
    //-------------------------------------------------------------------------------------------------------------------------------
    // 
    //
    const FILE_LIST = await FilePicker.browse('data', `${DIR}*.png`,{ wildcard: true });
    // Step through file names, stripping directory and looking for a name that matches the IDEAL and eliminate any that contain 
    // Avatar as a word.
    let tokenImgNames = []
    for (let i = 0; i < FILE_LIST.files.length; i++) {
        if (TL > 3) jez.trace(`${TAG} Considering Image ${i}:`, FILE_LIST.files[i])
        const ATOMS = FILE_LIST.files[i].split('/')
        const NAME = ATOMS[ATOMS.length-1]
        //  filter our names that contain the name avatar
        if (NAME.toLowerCase().match(/\bavatar\b/)) continue
        if (TL > 2) jez.trace(`${TAG} File Name ${i}:`, NAME)
        // check for our IDEAL name, which will be returned if present, stripping file extension
        if (NAME.split('.')[0] === IDEAL) return FILE_LIST.files[i]
        tokenImgNames.push(FILE_LIST.files[i])
    }
    //-------------------------------------------------------------------------------------------------------------------------------
    // Pick one of the files and return it
    //
    if (TL > 1) jez.trace(`${TAG} --- Finishing ---`);
    if (tokenImgNames.length) return(tokenImgNames[Math.floor(Math.random() * tokenImgNames.length)])
    return null;
}