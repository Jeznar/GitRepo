const MACRONAME = "Healing_Spirit_0.3"
/*****************************************************************************************
 * Healing Spirit macro based upon something Jon found somewhere.  Original macro is 
 * tossing TypeError's on undefined objects.  My mission is to fix it.
 *
 * Comments from original macro: 
 * 
// Add as ItemMacro, on use macro ItemMacro - needs the companion macro RequestGmDelete 
// found below. Summons an actor from your actor directory named "Healing Spirit" - it 
// needs an item called "Heal" (set it to heal 1d6) also give "Healing Spirit" immunity to 
// all damage and give ownership to the player
 *
 * Spell Description: https://www.dndbeyond.com/spells/healing-spirit 
 * 
 * 11/30/21 0.1 Adding comments and debug
 * 12/02/21 0.2 Beginning Changes to use similar code as Summon Wildfire Spirit
 * 05/05/22 0.3 Change createEmbeddedEntity to createEmbeddedDocuments for 9.x
 *              Note: This macro seems to be unused in my world.  
 *****************************************************************************************/
const DEBUG = true;

let shownumberdialog = false;   //uses defaultnumber
let defaultnumber = 1;          //number of creatures to spawn if shownumberdialog = false
let creatures = ["Healing Spirit"];
let onlyonecreature = false;    //set to true to skip choose creature dialog and use creatures[0] as the creature
if (creatures.length === 1) onlyonecreature = true;
let usespelltemplate = true;
let filterforfolder = true;
let folderId = "Wild Companions";

if (DEBUG) {
    console.log(`STARTING: ${MACRONAME} *****************************************************`);
    console.log(` shownumberdialog: ${shownumberdialog} `);
    console.log(` defaultnumber: ${defaultnumber} `);
    console.log(` onlyonecreature: ${onlyonecreature} `);
    console.log(` creatures: ${creatures}`);
    console.log(` usespelltemplate: ${usespelltemplate} `);
    console.log(` filterforfolder: ${filterforfolder} `);
    console.log(` folderId: ${folderId} `);
    console.log(` args[0] `,args[0]);
}

if (args[0].tag === "OnUse") {
    if (DEBUG) console.log(` args[0].tag OnUse = ${args[0].tag}`,args[0]);

    (async () => {
        if (DEBUG) console.log(`==> start function anonymous`);

        if (usespelltemplate == false) {
            if (DEBUG) console.log(` usespelltemplate ${usespelltemplate}`);
            Hooks.once("createMeasuredTemplate", deleteTemplatesAndSpawn);
            let template = new game.dnd5e.canvas.AbilityTemplate({
                t: "circle",
                user: game.user._id,
                distance: 3.5,
                direction: 0,
                x: 0,
                y: 0,
                fillColor: game.user.color
            });
            let tactor = canvas.tokens.placeables.find(a => a.data._id == args[0].tokenId);
            let item = tactor.actor.items.find(i => i.data._id == args[0].item._id);
            template.actorSheet = item.options.actor.sheet;
            template.drawPreview();
        }
        else {
            if (DEBUG) console.log(` usespelltemplate ${usespelltemplate}`);
            let template = canvas.templates.placeables.find(t => t.data._id == args[0].templateId).data;
            deleteTemplatesAndSpawn(canvas.scene, template);
        }

        //create flag to delete summon
        const effectData = {
            changes: [
                { key: "macro.itemMacro", mode: 0, value: `ItemMacro.${args[0].item.name}`, priority: 20 },
                { key: "flags.midi-qol.concentration-data.targets", mode: 2, value: { "actorId": args[0].actor._id, "tokenId": args[0].tokenId }, priority: 20 }
            ],
            origin: args[0].uuid, // flag the effect as associated to the ability beeing applied
            disabled: false,
            duration: { rounds: null, seconds: 3600, startRound: null, startTime: null, startTurn: null, turns: null },
            icon: args[0].item.img,
            label: args[0].item.name,
            flags: { dae: { itemData: args[0].item } }
        }
        // await actor.createEmbeddedEntity("ActiveEffect", effectData); // Depricated 
        await actor.createEmbeddedDocuments("ActiveEffect", [effectData]);
        if (DEBUG) console.log(`==> end function anonymous`);
    })();
}
else if (args[0] === "off") {
    if (DEBUG) console.log(` args[0] off = ${args[0]}`,args[0]);
    let summonedCreatures = canvas.tokens.placeables.filter(i => i.data.flags.summoner == args.find(t => t.tokenId != undefined).tokenId);
    for (let i = 0; i < summonedCreatures.length; i++) {
        await game.macros.getName("RequestGmDelete").execute(summonedCreatures[i].data._id, game.userId);
    }
}

if (DEBUG) console.log(`ENDING: ${MACRONAME} *****************************************************`);
return; 

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/
async function deleteTemplatesAndSpawn(scene, template) {
    if (DEBUG) console.log(`==> start function deleteTemplatesAndSpawn`);

    // Extract coordinates from the template and then delete it
    const templateID = args[0].templateId
    // Set the x,y coordinates of the targeting template that was placed.
    const X = canvas.templates.get(templateID).data.x
    const Y = canvas.templates.get(templateID).data.y
    // Delete the template that had been placed
    canvas.templates.get(templateID).document.delete()
    if (DEBUG) console.log( Template Coords: ${X},${Y});

    let numbers = [];
    for (let i = 1; i < 11; i++) {
        numbers[i] = i;
    }

    let numbercreature = shownumberdialog ? await choose(numbers, "How many Creatures do you want to summon?") : defaultnumber;
    if (DEBUG) console.log(` numbercreature: `,numbercreature);

    for (let i = 0; i < parseInt(numbercreature); i++) {
        await spawnActor(scene, template);
    }
    const healing = `${args[0].spellLevel - 1}d6`;
    const updatehp = { "data.attributes.hp.max": [[WFShp]], "data.attributes.hp.value": [[WFShp]] };
    const updateft = { "data.damage.parts": [[`${healing}`, "healing"]] };

    let wildfirespirit = canvas.tokens.placeables.find(t => t.actor.data.name == "Healing Spirit");
    await wildfirespirit.actor.update(updatehp);
    await wildfirespirit.actor.items.getName("Heal").update(updateft);
    await canvas.templates.deleteMany([template._id]);

    if (DEBUG) console.log(`==> end function deleteTemplatesAndSpawn, returning nill`);
    return;
}

//--------------------------------------------------------------------------------------
async function spawnActor(scene, template) {
    if (DEBUG) console.log(`==> start function spawnActor`);

    let chosencreature = onlyonecreature ? creatures[0] : await choose(creatures, "Which Creature/s do you want to summon?");

    if (DEBUG) {
        console.log(` filterforfolder`,filterforfolder);
        console.log(` chosencreature: `,chosencreature);
        console.log(` folderId`,folderId);
        console.log(` actor`,actor);
        console.log(` actor.data.folder`,actor.data.folder);
        console.log(` actor.data.name`,actor.data.name);
    }

    let protoToken = filterforfolder 
        ? duplicate(game.actors.find(actor => actor.data.folder == folderId && actor.data.name == chosencreature).data.token) 
        : duplicate(game.actors.getName(chosencreature).data.token);
    if (DEBUG) console.log(` protoToken: `,protoToken);

    protoToken.x = template.x;
    protoToken.y = template.y;
    protoToken.flags.summoner = args[0].tokenId;
    // Increase this offset for larger summons
    protoToken.x -= (scene.data.grid / 2 + (protoToken.width - 1) * scene.data.grid);
    protoToken.y -= (scene.data.grid / 2 + (protoToken.height - 1) * scene.data.grid);

    if (DEBUG) console.log(`==> end function spawnActor, returning `,canvas.tokens.createMany(protoToken, {}));
    return canvas.tokens.createMany(protoToken, {});
}

//--------------------------------------------------------------------------------------
async function choose(options = [], prompt = ``) {
    if (DEBUG) console.log(`==> start function choose`);
    let value = await new Promise((resolve) => {
        let dialog_options = (options[0] instanceof Array)
            ? options.map(o => `<option value="${o[0]}">${o[1]}</option>`).join(``)
            : options.map(o => `<option value="${o}">${o}</option>`).join(``);
        let content = `<table style="width=100%">
                       <tr><th>${prompt}</th></tr>
                       <tr><td><select id="choice">${dialog_options}</select></td></tr>
                       </table>`;
        new Dialog({
            content,
            buttons: { OK: { label: `OK`, callback: async (html) => { resolve(html.find('#choice').val()); } } }
        }).render(true);
    });
    if (DEBUG) console.log(`==> end function choose, returning ${value} `,value);
    return value;
}