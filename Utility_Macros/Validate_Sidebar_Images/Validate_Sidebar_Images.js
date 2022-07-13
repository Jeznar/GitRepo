const MACRONAME = "Validate_Sidebar_Images.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 * 07/13/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRONAME} =================`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1];
let msg = "";

let goodImageFiles = []
let badImageFiles = []
let brokenItem = []
let brokenActor = []
let brokenJournal = []
let actorItemCnt = 0

//----------------------------------------------------------------------------------------
// Search for borked image links in items located in item directory (sidebar)
//
jez.log("")
jez.log(`Searching Journal Entries for Bad Image links`)
jez.log("--------------------------------------------")
let journalCnt = 0
for (const element of game.journal.contents) {
    //if (element.name === "Test Dagger") { // Remove to check all items
    //---------------------------------------------------------------------------------
    // Check the image for the item
    //
    await checkJournal(element, ++journalCnt, "JOURNAL");
}
jez.log(`Checked ${journalCnt} Journal entries`)
//----------------------------------------------------------------------------------------
// Search for borked image links in items located in item directory (sidebar)
//
jez.log("")
jez.log(`Searching Items for Bad Image links effects`)
jez.log("-------------------------------------------")
let i = 1
for (const element of game.items.contents) {
    //if (element.name === "Test Dagger") { // Remove to check all items
    //---------------------------------------------------------------------------------
    // Check the image for the item
    //
    await checkItem(element, i++, "ITEM");
}
jez.log(`Checked ${i-1} ITEMS in the Item Directory`)
//----------------------------------------------------------------------------------------
// Search for borked image links in actors located in actor directory (sidebar)
//
jez.log("")
jez.log(`Searching Actors for Bad Image links`)
jez.log("------------------------------------")
let j = 0
for (const element of game.actors.contents) {
    await checkActor(element, ++j, "ACTOR")
}
jez.log(`Checked ${j} ACTORS in the Actor Directory with ${actorItemCnt} Items`)

//----------------------------------------------------------------------------------------
// Report findings
//
// jez.log("")
// for (let i = 0; i < goodImageFiles.length; i++) jez.log(` goodImageFiles[${i}]`, goodImageFiles[i]);
jez.log("")
jez.log("")
for (let i = 0; i < badImageFiles.length; i++) console.log(` badImageFiles[${i}]`, badImageFiles[i]);
console.log("")
console.log(`${brokenItem.length} Broken Image Links within Items`)
console.log("- --------------------------- -")
for (let i = 0; i < brokenItem.length; i++) console.log(` ${+1})`, brokenItem[i]);
console.log("")
console.log(`${brokenActor.length} Broken Image Links within Actors`)
console.log("- ---------------------------- -")
for (let i = 0; i < brokenActor.length; i++) console.log(` ${i + 1})`, brokenActor[i]);
console.log("")
console.log(`${brokenJournal.length} Broken Image Links within Journal entries`)
console.log("- ---------------------------- -")
for (let i = 0; i < brokenJournal.length; i++) console.log(` ${i + 1})`, brokenJournal[i]);

/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ****************************************************************************************************
 * Check an Item for bad image loinks
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function checkActor(element, iteration, label) {
    if (iteration % 50 === 0) jez.log(`${iteration} Actors so far...`)   // Print progress message every so many times
    // jez.log(``)
    // jez.log(`${iteration}) ******** "ACTOR ${element.name}" ********`)
    let findIt = await fetch(element.img);
    if (findIt.ok) {
        if (!goodImageFiles.includes(element.img)) goodImageFiles.push(element.img);
    }
    else {
        if (!badImageFiles.includes(element.img)) badImageFiles.push(element.img);
        // jez.log(`${element.name} item.img ${element.img}`)
        brokenActor.push(`${label} "${element.name}" actor.img: ${element.img}`);
        // jez.log("BrokenActor", brokenActor)
    }
    // jez.log("ACTOR", element)
    // ----------------------------------------------------------------------------------------------
    // Check the token images
    //
    const TOKEN_IMAGE = element.data.token.img
    // jez.log("Actor ID", element.id)
    let tokens = await game.actors.get(element.id).getTokenImages()
    // jez.log("Tokens",tokens)
    if (tokens.length === 0) {
        brokenActor.push(`${label} "${element.name}" broken token image(s): ${TOKEN_IMAGE}`);
        // jez.log("BrokenActor", brokenActor)
    }
    // ----------------------------------------------------------------------------------------------
    // Check the items contained on the actor (oh boy!)
    //
    // jez.log("element",element)
    // jez.log("element.items",element.items.contents)
    for (const ITEM of element.items.contents) {
        actorItemCnt++
        // jez.log("==> ",ITEM)
        await checkItem(ITEM,1,`ACTOR "${element.name}" ITEM`)
    }

}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Check an Item for bad image loinks
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function checkItem(element, iteration, label) {
    if (iteration % 200 === 0) jez.log(`${iteration} Items so far...`)   // Print progress message every so many times
    // jez.log(`${iteration} ${element.name}`)
    let findIt = await fetch(element.img);
    if (findIt.ok) {
        if (!goodImageFiles.includes(element.img)) goodImageFiles.push(element.img);
    }
    else {
        if (!badImageFiles.includes(element.img)) badImageFiles.push(element.img);
        // jez.log(`${element.name} item.img ${element.img}`)
        brokenItem.push(`${label} "${element.name}" item.img ${element.img}`);
    }
    //---------------------------------------------------------------------------------
    // Check image(s) for any active effects, that should have images of some sort
    //
    // jez.log("")
    // jez.log("************************")
    // jez.log("CHECKING Effect Icon.img")
    if (element.data?.effects?.contents.length > 0) {
        for (const ACTIVE_EFFECT of element.data.effects.contents) {
            let fileName = ACTIVE_EFFECT?.data?.icon;
            let findIt = await fetch(fileName);
            if (findIt.ok) {
                // jez.log(`${fileName} exists`)
                if (!goodImageFiles.includes(fileName))
                    goodImageFiles.push(fileName);
            }
            else {
                // jez.log(`${fileName} does not exist`)
                if (!badImageFiles.includes(fileName))
                    badImageFiles.push(fileName);
                // jez.log(`"${element.name}" active effect "${ACTIVE_EFFECT?.data?.label}": ${fileName}`)
                brokenItem.push(`${label} "${element.name}" effect "${ACTIVE_EFFECT?.data?.label}": ${fileName}`);
            }
        }
    }
    //---------------------------------------------------------------------------------
    // Check through the item's description for any images that can be validated
    //
    // jez.log("")
    // jez.log("*************************")
    // jez.log("CHECKING Item Description")
    //jez.log(element?.data?.data?.description?.value)
    let str = element?.data?.data?.description?.value;
    if (str) {
        const REGEX1 = new RegExp('<img src=\"[^"]+\"', 'g');
        let result = str.match(REGEX1);
        if (result) {
            for (const MATCH of result) {
                let fileName = MATCH.substring(10, MATCH.length - 1);
                let findIt = await fetch(fileName);
                if (findIt.ok) {
                    // jez.log(`${fileName} exists`)
                    if (!goodImageFiles.includes(fileName))
                        goodImageFiles.push(fileName);
                }
                else {
                    // jez.log(`${fileName} does not exist`);
                    if (!badImageFiles.includes(fileName))
                        badImageFiles.push(fileName);
                    // jez.log(`"${element.name}" item description: ${fileName}`)
                    brokenItem.push(`${label} "${element.name}" in description of ${fileName}`);
                }
            }
        }
    }
    //---------------------------------------------------------------------------------
    // Check through the item's GM notes description for any images
    //
    if (element?.data?.flags?.["gm-notes"]?.notes) {
        // jez.log("")
        // jez.log("*****************************")
        // jez.log("CHECKING GM Notes Description")
        //jez.log(element?.data?.data?.description?.value)
        let str = element?.data?.flags?.["gm-notes"]?.notes;
        if (str) {
            const REGEX1 = new RegExp('<img src=\"[^"]+\"', 'g');
            let result = str.match(REGEX1);
            if (result) {
                for (const MATCH of result) {
                    let fileName = MATCH.substring(10, MATCH.length - 1);
                    let findIt = await fetch(fileName);
                    if (findIt.ok) {
                        // jez.log(`${fileName} exists`)
                        if (!goodImageFiles.includes(fileName))
                            goodImageFiles.push(fileName);
                    }
                    else {
                        // jez.log(`${fileName} does not exist`);
                        if (!badImageFiles.includes(fileName))
                            badImageFiles.push(fileName);
                        // jez.log(`"${element.name}" GM Notes: ${fileName}`)
                        brokenItem.push(`${label} "${element.name}" in GM Notes of ${fileName}`);
                    }
                }
            }
        }
    }
}
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Check an Item for bad image loinks
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
async function checkJournal(element, iteration, label) {
    if (iteration % 100 === 0) jez.log(`${iteration} Journal Entries so far...`)  // Print progress message
    if (element.data.img) {                                             // Image defined 
        // jez.log(`${iteration} ${element.name}`, element)
        let image = element.data.img
        let findIt = await fetch(image);
        if (findIt.ok) {
            if (!goodImageFiles.includes(image)) goodImageFiles.push(image);
        }
        else {
            if (!badImageFiles.includes(image)) badImageFiles.push(image);
            // jez.log(`${element.name} item.img ${image}`)
            brokenJournal.push(`${label} "${element.name}" item.img ${image}`);
        }
    }
    // ----------------------------------------------------------------------------------------------
    // Search the text description, if any, for iamges to validate, e.g. <img src="icons/vtt-512.png"
    //
    if (element.data.content) {
        let str = element.data.content
        const REGEX1 = new RegExp('<img src=\"[^"]+\"', 'g');
        let result = str.match(REGEX1);
        if (result) {
            for (const MATCH of result) {
                let fileName = MATCH.substring(10, MATCH.length - 1);
                let findIt = await fetch(fileName);
                if (findIt.ok) {
                    // jez.log(`${fileName} exists`)
                    if (!goodImageFiles.includes(fileName))
                        goodImageFiles.push(fileName);
                }
                else {
                    // jez.log(`${fileName} does not exist`);
                    if (!badImageFiles.includes(fileName))
                        badImageFiles.push(fileName);
                    // jez.log(`"${element.name}" Description: ${fileName}`)
                    brokenJournal.push(`${label} "${element.name}" in Description: ${fileName}`);
                }
            }
        }
    }
}