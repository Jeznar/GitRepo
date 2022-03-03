const MACRONAME = "Get_Entities"
console.log(MACRONAME)
/*****************************************************************************************
 * This macro exercises various ways to get information from the system.
 * 
 * Inspired by macro posted by Vance Cole on gitHub.
 *  https://github.com/VanceCole/macros/tree/master
 *
 * 02/01/22 0.1 Creation of Macro
 *****************************************************************************************/

//----------------------------------------------------------------------------------------
// Assumes a token with at least an item is selected,
//
let sToken = canvas.tokens.controlled[0]
let tokenID = sToken.id
let tokenName = sToken.name
console.log(`Token (${tokenName}) ID ${tokenID}`, sToken)

let actorID = sToken.data.actorId
let actorName = sToken.actor.name
console.log(`Actor (${actorName}) ID ${actorID}`, sToken.actor)

let itemID = sToken.actor.data.items.contents[0].id
let itemName = sToken.actor.data.items.contents[0].name
console.log(`Item 0 (${itemName}) ID ${itemID}`,sToken.actor.data.items.contents[0])

let sceneID = game.scenes.viewed.id
let sceneName = game.scenes.viewed.name
console.log(`Scene (${sceneName}), ID ${sceneID}`, game.scenes.viewed)

let journalID = game.journal.contents[0]?.id
let journalName = game.journal.contents[0]?.name
console.log(`Journal 0 (${journalName}), ID ${journalID}`, game.journal.contents[0])

//----------------------------------------------------------------------------------------
// Get token / actor / item / journal etc by ID
//
console.log('')
console.log('Fetch data from "known" ID')
console.log('--------------------------')
let fetchedTokenDoc = game.scenes.viewed.data.tokens.get(tokenID)
console.log('TokenDoc fetched by ID', fetchedTokenDoc)
let fetchedToken    = canvas.tokens.placeables.find(ef => ef.id === tokenID)
console.log('Token5e  fetched by ID', fetchedToken)
let fetchedActor    = game.actors.get(actorID)
console.log('Actor5E  fetched by ID', fetchedActor)
let fetchedActorItem = sToken.actor.data.items.get(itemID)
console.log('Item5E   fetched by ID', fetchedActorItem)
let fetchedScene    = game.scenes.get(sceneID)
console.log(`Scene    fetched by ID`, fetchedScene)
let fetchedJournal  = game.journal.get(journalID)
console.log(`JournalEntry     by ID`, fetchedJournal)
// Following line fetches a template from its ID
//let fetchedTemplate = canvas.templates.objects.children.find(i => i.data._id === templateID);
// following line fetches a tile from its ID
//  let fetchedTile = await canvas.scene.tiles.get(tileId)

//----------------------------------------------------------------------------------------
// Get token / actor / item / journal etc by Name
//
console.log('')
console.log('Fetch data from "known" Name')
console.log('----------------------------')

let nameTokenDoc = game.scenes.viewed.data.tokens.getName(tokenName)
console.log('TokenDoc fetched by Name', nameTokenDoc)

let nameToken    = canvas.tokens.placeables.find(ef => ef.name === tokenName)
console.log('Token5e  fetched by Name', nameToken)

let nameActor    = game.actors.getName(actorName)

console.log('Actor5E  fetched by Name', nameActor)
let nameActorItem = sToken.actor.data.items.getName(itemName)
console.log('Item5E   fetched by Name', nameActorItem)
let nameScene    = game.scenes.getName(sceneName)
console.log(`Scene    fetched by Name`, nameScene)
let nameJournal  = game.journal.getName(journalName)
console.log(`JournalEntry     by Name`, nameJournal)

//----------------------------------------------------------------------------------------
// Get bunches of actors
//
console.log('')
console.log('Bunches of Actors')
console.log('-----------------')
let pcs = game.actors.filter(actor => actor.type === "character")
console.log(`Game PCs`, pcs)
let npcs = game.actors.filter(actor => actor.type === "npc")
console.log(`Game NPCs`, npcs)
//----------------------------------------------------------------------------------------
// Dunp the actor and token name for each PC
//
console.log('')
console.log('Names of Character (PC) with same Actor & Token Names')
console.log('-----------------------------------------------------')
for (let i = 0; i < pcs.length; i++) {
    let cnt = ""
    if (i < 9) cnt = " " + (i + 1); else cnt = (i + 1)
    if (pcs[i].name === pcs[i].data.token.name) {   // Token and Actor have same name
        console.log(` ${cnt} actor/token ${pcs[i].data.token.name}`);
    }
}
console.log('')
console.log('Names of Character (PC) with different Actor & Token Names')
console.log('----------------------------------------------------------')
for (let i = 0; i < pcs.length; i++) {
    let cnt = ""
    if (i < 9) cnt = " " + (i + 1); else cnt = (i + 1)
    if (pcs[i].name !== pcs[i].data.token.name) {   // Token and Actor have same name
        console.log(` ${cnt} actor ${pcs[i].name}, token ${pcs[i].data.token.name}.`);
    }
}

return
