NON-FUNCTIONAL!!!


const MACRONAME = "Update_spells"
console.log(MACRONAME)
/*****************************************************************************************
 * https://www.reddit.com/r/FoundryVTT/comments/rey7g3/is_there_a_way_to_editupdate_every_copy_of_an/
 * 
 * This macro can update the spells owned by an actor with a spell of the same name in a 
 * given compendium, but it only works on a selected actor. Just point to the compendium 
 * with the up to date spells and it will look in your selected actor's spellbook and 
 * update all of their spells to those in the compendium with a matching name.
 * 
 * Credit to Freeze in #Macro-Polo
 * 
 * Presents the user with an option to update the effects of a prexisting ALter Self spell
 * 
 * 02/02/22 0.1 Loaded Macro
 ******************************************************************************************/
 let sToken = canvas.tokens.controlled[0]
 let sActor = sToken.actor
jez.log(`sActor ${sActor.name}`, sActor)

const pack = game.packs.get("dnd5e.spells"); // fill in correct compendium key.
jez.log("pack", pack)
//jez.log("actor", actor)
const itemIds = pack.index.reduce((acc, e) => {
    jez.log(`e ${e.name}`,e)
    //if (actor.items.find(i => i.name === e.name && i.type === "spell")) {
    //if (actor.items.find(i => { i.name === e.name && i.type === "spell"})) {

    if (sActor.items.find(i => i.type === "spell")) {
        jez.log(`e ${e.name}`, e)
        acc.push(e._id);
    }
    return acc;
}, []);
jez.log("itemIDs", itemIds)
const packItemData = (await pack.getDocuments()).filter(i => itemIds.includes(i.id)).map(i => i.toObject());
jez.log("packItemData", packItemData)
const ownedItemIds = sActor.items.filter(i => i.type === "spell" && pack.index.map(e => e.name).includes(i.name)).map(i => i.id);
jez.log("ownedItemIds", ownedItemIds)

const ownedItemIds2 = sActor.items.filter(i => i.type === "spell");
jez.log("ownedItemIds2", ownedItemIds2)


jez.log("sActor before", sActor)
//await actor.deleteEmbeddedDocuments("Item", ownedItemIds);
jez.log("sActor after ", sActor)
//await actor.createEmbeddedDocuments("Item", packItemData);
//Credit to Freeze in #Macro-Polo
