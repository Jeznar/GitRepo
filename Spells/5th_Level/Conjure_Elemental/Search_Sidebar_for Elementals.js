const MACRONAME = "Search_Items_for_Elementals.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Generate an pbject with information on all unlinked, npc elementals defined in the game.
 * 
 * 07//22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";
const TL = 5
const MAX_CR = 5
let fractialCRs = [0.5, 0.25, 0.125]
let allowedSubTypes = ["air", "earth", "fire", "water"]
let elList                                              // Elemental list array
main()

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * main Function to get thihs going  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function main() {
    const FUNCNAME = "main()";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`);
    //----------------------------------------------------------------------------------------------
    // Items searched for are coded below
    //
    elList = buildElementalList(["Spiritual Weapon"])
    console.log(elList)
    const ELEMENTALS = Object.keys(elList);
    console.log(ELEMENTALS)
    let elementalArray = []
    //------------------------------------------------------------------------------------------------
    // Step down in integer CRs looking for matches at each value
    //
    for (let i = MAX_CR; i > 0; i--)
        for (let element of ELEMENTALS)
            if (i === elList[element].cr)
                elementalArray.push(`${element} (${elList[element].st})`)
    //------------------------------------------------------------------------------------------------
    // Step through fractional CRs looking for matches at each value
    //
    for (let i of fractialCRs)
        for (let element of ELEMENTALS)
            if (i === elList[element].cr)
                elementalArray.push(`${element} (${elList[element].st})`)
    //------------------------------------------------------------------------------------------------
    // Build and pop selection dialog
    //
    let title = `Select Desired Elemental to Summon`
    msg = `Elemental must be summoned near appropiate source of its elemental component (air, earth, fire, or water).`
    jez.pickRadioListArray(title, msg, pickEleCallBack, elementalArray);
}

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Call back function called after elemental is selected and then proceeds with execution.  
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
 async function pickEleCallBack(selection) {
    const FUNCNAME = "pickEleCallBack(selection)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FUNCNAME} ---`,"selection",selection);
    //----------------------------------------------------------------------------------------------
    if (!selection) return false;
    const SEL_ELE = selection.split(" ")[0]
    console.log(`${SEL_ELE}: ${elList[SEL_ELE].name} SubType ${elList[SEL_ELE].st}  CR ${elList[SEL_ELE].cr}`,
        elList[SEL_ELE].data)
    console.log("Token Width", elList[SEL_ELE].data.data.token.width)
}

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Build Object of elemenatals that are NPCs whose name doesn't start with a % and isn't excluded
 * 
 * Returned Object will have a property for each elemental that met the criteria, it will contain
 * 
 * key: String - Name of the actor with underscrores in place of spaces
 * cr: Real - Challenge Rating
 * st: String - Subtype, hopefully: air, earth, fire, or water otherwise will be forced to unknown
 * name: String - Name of the actor
 * data: Object - Actor's data object
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
function buildElementalList(exclusions) {
    const FUNCNAME = "buildElementalList(exclusions)";
    const FNAME = FUNCNAME.split("(")[0]
    if (TL === 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`);
    if (TL > 1) jez.trace(`--- Starting --- ${MACRO} ${FNAME} ---`,"exclusions",exclusions);
    //-----------------------------------------------------------------------------------------------
    let elementalObj = {}
    for (const element of game.actors.contents) {
        let ed = element.data
        if (ed.type !== "npc") continue;
        let type = ed.data.details.type.value
        if (type !== "elemental") continue;
        let name = element.name
        if (name[0] === "%") continue;
        if (exclusions.includes(name)) continue;
        //-------------------------------------------------------------------------------------------
        if (TL > 3) jez.trace(`${FNAME} | ${element.name}`, element);
        if (type === "elemental" && name[0] !== "%") {
            if (!ed.token.actorLink) {
                const CR = jez.getCharLevel(element)                    // Challenge Rating
                let st = ed.data.details.type.subtype.toLowerCase()     // Sub Type
                if (!allowedSubTypes.includes(st)) st = "unknown"
                const ST = st
                if (TL > 1) jez.trace(`${FNAME} | Elemental ${name} is CR ${CR} of subtype ${ST}`)
                const KEY = name.replace(/ /g, "_");
                elementalObj[KEY] = { cr: CR, st: ST, name: name, data: element }
            }
        }
    }
    return (elementalObj)
}