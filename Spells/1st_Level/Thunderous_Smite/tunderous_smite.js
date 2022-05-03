const MACRONAME = "Thunderous_Smite.0.2.js"
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(MACRONAME)
/*****************************************************************************************
 * Implment Thunderous Smite!
 * 
 * special thanks to theripper93
 * 
 * 01/25/22 0.1 Add headers and VFX
 * 05/03/22 0.2 Updated for FoundryVTT 9.x
 *****************************************************************************************/
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const actorD = game.actors.get(lastArg.actor._id);
const tokenD = canvas.tokens.get(lastArg.tokenId);
const gameRound = game.combat ? game.combat.round : 0;
const spellDC = tokenD.actor.data.data.attributes.spelldc;
// VFX Settings -------------------------------------------------------------------
const VFX_NAME = `${MACRO}-${tokenD.id}`
const VFX_TARGET = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Dark_Purple_Target_400x400.webm"
const VFX_CASTER = "modules/jb2a_patreon/Library/2nd_Level/Divine_Smite/DivineSmite_01_Dark_Purple_Caster_400x400.webm"
const VFX_OPACITY = 1.0;
const VFX_SCALE = 0.70;
/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "OnUse"
 ***************************************************************************************************/
if (args[0].tag === "OnUse") {
    //------------------------------------------------------------------------------------------------
    // Launch VFX on caster
    // 
    new Sequence()
        .effect()
        .file(VFX_CASTER)
        .attachTo(tokenD)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------
    // Define and apply the effect
    // 
    let itemD = lastArg.item;
    let effectData = [{
        changes: [
            { key: "flags.dnd5e.DamageBonusMacro", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `ItemMacro.${itemD.name}`, priority: 20 },
            { key: "flags.midi-qol.itemDetails", mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM, value: `${lastArg.uuid}`, priority: 20 }
        ],
        origin: lastArg.uuid,
        disabled: false,
        duration: { rounds: 1, seconds: 6, startRound: gameRound, startTime: game.time.worldTime },
        flags: { dae: { itemData: itemD, specialDuration: ["DamageDealt"] } },
        icon: itemD.img,
        label: itemD.name
    }];
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: tokenD.actor.uuid, effects: effectData });
}

/***************************************************************************************************
 * Perform the code that runs when this macro is invoked as an ItemMacro "doBonusDamage"
 ***************************************************************************************************/
if (args[0].tag === "DamageBonus") {
    if (!["mwak"].includes(lastArg.item.data.actionType)) return {};
    let target = canvas.tokens.get(lastArg.hitTargets[0].id);
    let itemUuid = getProperty(lastArg.actor.flags, "midi-qol.itemDetails");
    let itemN = await fromUuid(itemUuid);
    let itemD = lastArg.item;
    let saveType = "str";
    let actorType = target.actor.data.type === "character" ? { chatMessage: false, fastForward: false } : { chatMessage: false, fastForward: true };
    let save = await MidiQOL.socket().executeAsGM("rollAbility", { request: "save", targetUuid: target.actor.uuid, ability: saveType, options: actorType });
    let saveSuccess = "saves";
    //-------------------------------------------------------------------------------------------------------------
    // Launch VFX on target
    // 
    new Sequence()
        .effect()
        .file(VFX_TARGET)
        .attachTo(target)
        .scale(VFX_SCALE)
        .opacity(VFX_OPACITY)
        .belowTokens(false)
        .name(VFX_NAME)          // Give the effect a uniqueish name
        .play()
    //-------------------------------------------------------------------------------------------------------------
    // Perform save
    //
    if (save.total < spellDC) {
        saveSuccess = "fails";
        let effectData = [{
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: CONST.ACTIVE_EFFECT_MODES.ADD, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE, value: `${Math.floor(target.actor.data.data.attributes.movement.walk / 3)}`, priority: 20 }
            ],
            origin: "",
            disabled: false,
            duration: { rounds: 10, seconds: 60, startRound: gameRound, startTime: game.time.worldTime },
            icon: "icons/svg/falling.svg",
            label: "Prone"
        }];
        let prone = target.actor.effects.find(i => i.data.label === "Prone");
        if (!prone) await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: target.actor.uuid, effects: effectData });
        knockback(tokenD, target, 10);
    }
    await wait(500);
    let msgHistory = [];
    game.messages.reduce((list, message) => {
        if (message.data?.flags["midi-qol"]?.itemId === itemD._id && message.data.speaker.token === tokenD.id) list.push(message.id);
        return list;
    }, msgHistory);
    let numDice = lastArg.isCritical ? 4 : 2;
    let damageType = "thunder";
    let itemCard = msgHistory[msgHistory.length - 1];
    let saveResult = `<div class="midi-qol-flex-container"><div class="midi-qol-target-npc midi-qol-target-name" id="${target.id}">${target.name} ${saveSuccess} with a ${save.total}</div><img src="${target.data.img}" width="30" height="30" style="border:0px"></div>`;
    let saveMessage = `<div class="midi-qol-nobox midi-qol-bigger-text">${CONFIG.DND5E.abilities[saveType]} Saving Throw: DC ${spellDC}</div><div class="midi-qol-nobox">${saveResult}</div>`;
    let chatMessage = await game.messages.get(itemCard);
    let content = await duplicate(chatMessage.data.content);
    let searchString = /<div class="midi-qol-hits-display">[\s\S]*<div class="end-midi-qol-hits-display">/g;
    let replaceString = `<div class="midi-qol-hits-display"><div class="end-midi-qol-hits-display">${saveMessage}`;
    content = await content.replace(searchString, replaceString);
    await chatMessage.update({ content: content });
    let conc = tokenD.actor.effects.find(i => i.data.label === "Concentrating");
    if (conc) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: tokenD.actor.uuid, effects: [conc.id] });
    await wait(500);
    return { damageRoll: `${numDice}d6[${damageType}]`, flavor: `(${itemN.name} (${CONFIG.DND5E.damageTypes[damageType]}))` };
}

async function knockback(ptoken, ttoken, distance) {
    const x1 = ptoken.center.x;
    const x2 = ttoken.center.x;
    const y1 = ptoken.center.y;
    const y2 = ttoken.center.y;
    let angcoeff = Math.abs((y2 - y1) / (x2 - x1));
    if (angcoeff > 1) angcoeff = 1 / angcoeff;
    const unitDistance = distance + (distance * Math.sqrt(2) - distance) * angcoeff;
    const gridUnit = canvas.scene.data.grid;
    distance = (distance * canvas.scene.data.grid) / canvas.scene.data.gridDistance;

    async function getXy(x) {

        return (y2 - y1) * (x - x1) / (x2 - x1) + y1;

    }

    async function findDestination() {

        const scenew = canvas.dimensions.width;
        let coordinatesArray = [];
        for (let i = 0; i <= scenew; i += 1) {

            let ty = await getXy(i);
            let snapCoord = await canvas.grid.getCenter(i, ty);
            let cdist = await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ttoken.center);
            if (await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ptoken.center) > await canvas.grid.measureDistance(ttoken.center, ptoken.center) && await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ptoken.center) > unitDistance) {
                coordinatesArray.push({ "x": i, "y": ty, "dist": cdist });
            }

        }
        return coordinatesArray;

    }
    if (ptoken.center.x == ttoken.center.x) {

        if (ptoken.center.y - ttoken.center.y > 0) {
            await updateKB({ "y": ttoken.data.y - distance, "x": ttoken.data.x }, { "x": ttoken.center.x, "y": ttoken.center.y - distance })
        }
        else {
            await updateKB({ "y": ttoken.data.y + distance, "x": ttoken.data.x }, { "x": ttoken.center.x, "y": ttoken.center.y + distance })
        }

    }
    else if (ptoken.center.y == ttoken.center.y) {

        if (ptoken.center.x - ttoken.center.x > 0) {
            await updateKB({ "x": ttoken.data.x - distance, "y": ttoken.data.y }, { "x": ttoken.center.x - distance, "y": ttoken.center.y })
        }
        else {
            await updateKB({ "x": ttoken.data.x + distance, "y": ttoken.data.y }, { "x": ttoken.center.x + distance, "y": ttoken.center.y })
        }

    }
    else {

        let fdest = await findDestination();
        let coord = fdest.reduce(function (prev, curr) {
            return (Math.abs(curr.dist - unitDistance) < Math.abs(prev.dist - unitDistance) ? curr : prev);
        });
        fdest = await canvas.grid.getSnappedPosition(coord.x - gridUnit / 2, coord.y - gridUnit / 2, 1);
        await updateKB(fdest);


    }
    async function updateKB(center, originalcenter) {
        if (originalcenter) {
            if (await ttoken.checkCollision(originalcenter)) {
                if (knockDist <= 5) return;
                knockDist -= 5;
                await knockback(pusher, pushed, knockDist);
            }
            else {
                await ttoken.document.update(center);
            }
        }
        else {
            if (await ttoken.checkCollision(center)) {
                if (knockDist <= 5) return;
                knockDist -= 5;
                await knockback(pusher, pushed, knockDist);
            }
            else {
                await ttoken.document.update(center);
            }
        }
    }
}

