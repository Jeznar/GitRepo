// Values manually acquired by console digging
//   _token.id
//   _token.actor.effects.contents[0].uuid
let s1 = "fIz9MCqqqu6PRWFL"
let s2 = "TT7tOMHvlW1Lfm6g"
let e1 = "Effect 1"
let e2 = "Effect 2"
let u1 = 'Scene.MzEyYTVkOTQ4NmZk.Token.fIz9MCqqqu6PRWFL.ActiveEffect.dmikrtqx4i70piam'
let u2 = 'Scene.MzEyYTVkOTQ4NmZk.Token.TT7tOMHvlW1Lfm6g.ActiveEffect.pmp81ar2m5hex8jz'

// pairEffects(s1, e1, s2, e2)
jez.pairEffects(u1, u2)

/**************************************************************************************************************
 * Add a macro execute line calling the macro "Remove_Paired_Effect" which must exist in the macro folder to
 * named effect on the pair of tokens supplied.
 *
 * Note: This operates on effect by name which can result in unexpected results if multiple effects on a an
 * actor have the same name.  Not generally an issue, but it might be.
 *
 * subject1 & subject2 are types supported by jez.getActor5eDataObj (actor5e, token5e, token5e.id, actor5e.id)
 * effectName1 & effectName2 are strings that name effects on their respective token actors.
 * 
 * ***ALTERNATIVELY***
 * 
 * Can be called with just two arguments, UUID's for the effects to be paired.  This approach is recommended.
 **************************************************************************************************************/
// async function pairEffects(subject1, effectName1, subject2, effectName2) {
async function pairEffects(...args) {
    const FUNCNAME = "jez.pairEffects(...args)"
    let trcLvl = 5;
    for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
    if (args.length !== 2 && args.length !== 4)
        return jez.badNews(`Bad Argument count (${args.length}) provided to ${FUNCNAME}`)
    let subject1 = args[0]
    let effectName1 = args[1]
    let subject2 = args[2]
    let effectName2 = args[3]
    let effectUuid1 = args[0]
    let effectUuid2 = args[1]
    let effectData1 
    let effectData2
    let actor1 = null
    let actor2 = null
    let uuidMode = false                    // False indicates subject & effect pairs
    if (args.length === 2) uuidMode = true  // True indicates uuid call approach
    //---------------------------------------------------------------------------------------------------------
    // Make sure the macro that will be called later exists.  Throw an error and return if not
    //
    let pairingMacro = game.macros.find(i => i.name === "Remove_Paired_Effect");
    if (!pairingMacro) return ui.notifications.error("REQUIRED: Remove_Paired_Effect macro is missing.");
    //---------------------------------------------------------------------------------------------------------
    // Execute with two or four arguments
    //
    if (uuidMode) {
        //---------------------------------------------------------------------------------------------------------
        // Grab the effect data from the first token if we were handed a name and not a data object
        // UUID will be of the form: Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h.ActiveEffect.1u3e6c1os77qhwha
        jez.trc(3, trcLvl,"effectUuid1", effectUuid1)
        if (jez.isEffectUUID(effectUuid1)) {
            effectData1 = await fromUuid(effectUuid1)
            jez.trc(3, trcLvl, `effectData1 from UUID`, effectData1)
        } else return jez.badNews(`effectData1 must be a UUID`, "error")
        //---------------------------------------------------------------------------------------------------------
        // Grab the effect data from the second token
        //
        jez.trc(3, trcLvl,"effectUuid2", effectUuid2)
        if (jez.isEffectUUID(effectUuid2)) {
            effectData2 = await fromUuid(effectUuid2)
            jez.trc(2, trcLvl, `effectData2 from UUID`, effectData2)
        } else return jez.badNews(`effectData1 must be a UUID`, "error")
    }
    else {
        //---------------------------------------------------------------------------------------------------------
        // Convert subject1 and subject2 into actor objects, throw an error and return if conversion fails
        //
        actor1 = jez.getActor5eDataObj(subject1)
        if (!actor1) return (ui.notfications.error("First subject not a token, actor, tokenId or actorId"))
        actor2 = jez.getActor5eDataObj(subject2)
        if (!actor2) return (ui.notfications.error("Second subject not a token, actor, tokenId or actorId"))
        //---------------------------------------------------------------------------------------------------------
        // Grab the effect data from the first token if we were handed a name and not a data object
        //
        jez.trc(3, trcLvl,"effectName1", effectName1)
        effectData1 = effectName1
        if (effectName1?.constructor.name !== "ActiveEffect5e") {
            jez.trc(3, trcLvl, `Seeking ${effectName1} in actor1.effects`, actor1.effects)
            effectData1 = await actor1.effects.find(i => i.data.label === effectName1);
            jez.trc(3, trcLvl, `effectData1`, effectData1)
            if (!effectData1)
                return jez.badNews(`${effectName1} not found on ${actor1.name}.  Effects not paired.`, "warn")
        }
        //---------------------------------------------------------------------------------------------------------
        // Grab the effect data from the second token
        //
        jez.trc(3, trcLvl,"effectName2", effectName2)
        effectData2 = effectName2
        if (effectName2?.constructor.name !== "ActiveEffect5e") {
            jez.trc(3, trcLvl, `Seeking ${effectName2} in actor2.effects`, actor2.effects)
            effectData2 = await actor2.effects.find(i => i.data.label === effectName2);
            jez.trc(3, trcLvl, `effectData2`, effectData2)
            if (!effectData2)
                return jez.badNews(`${effectName2} not found on ${actor2.name}.  Effects not paired.`, "warn")
        }
    }
    //---------------------------------------------------------------------------------------------------------
    // Add the actual pairings
    //
    jez.trc(2, trcLvl, "*************", 'actor1', actor1, 'actor2', actor2, 'effectData1', effectData1, 'effectData2', effectData2)
    await addPairing(effectData2, actor1, effectData1)
    await addPairing(effectData1, actor2, effectData2)
    //---------------------------------------------------------------------------------------------------------
    // Define a function to do the actual pairing
    //
    async function addPairing(effectChanged, tokenPaired, effectPaired) {
        let trcLvl = 0
        jez.trc(2, trcLvl, `addPairing(effectChanged, tokenPaired, effectPaired)`)
        jez.trc(2, trcLvl, "------------", "effectChanged", effectChanged, "tokenPaired", tokenPaired, "effectPaired", effectPaired)
        let value = `Remove_Paired_Effect ${tokenPaired?.id} ${effectPaired.uuid}`
        if (uuidMode) value = `Remove_Paired_Effect ${effectPaired.uuid}`
        effectChanged.data.changes.push({ key: `macro.execute`, mode: jez.CUSTOM, value: value, priority: 20 })
        return (await effectChanged.update({ changes: effectChanged.data.changes }))
    }
    return (true)
}