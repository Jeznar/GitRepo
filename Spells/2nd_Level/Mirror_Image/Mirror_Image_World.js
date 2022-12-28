/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * World Macro to perform business end of Mirror Image, adapted from https://github.com/chrisk123999 macro
 * https://github.com/chrisk123999/foundry-macros/tree/main/Spells/Mirror%20Image
 * 
 * 12/27/22 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
Hooks.on('midi-qol.AttackRollComplete', async workflow => {
    console.log(`MIRROR IMAGE WORLD MACRO - Fired`)

    console.log(`workflow`, workflow)
    if (workflow.targets.size != 1) return;
    if (workflow.isFumble === true) return;
    let tToken = workflow.targets.first();
    if (!tToken) return console.log('No target Token');
    console.log('Target Token', tToken)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Set Macro specific globals
    //
    const VERSION = Math.floor(game.VERSION);
    let tActor = tToken.actor;
    if (!tActor) return  console.log('No target Actor');
    let targetEffect = tActor.effects.find(eff => eff.data.label === 'Mirror Image');
    if (!targetEffect) return console.log(`No Mirror Image Effect on ${tToken.name}`, targetEffect);
    const DUPLICATES = getProperty((VERSION > 9 ? tActor.flags : tActor.data.flags), "jez.mirrorImage.count");
    if (!DUPLICATES) return console.log('No DUPLICATES', DUPLICATES);
    console.log(`${tToken.name} DUPLICATES available`, DUPLICATES)
    const DEX_MOD = jez.getCastMod(tActor) 
    const MIRROR_ICON = `icons/magic/defensive/illusion-evasion-echo-purple.webp`
    let msg = ''
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Determine roll needed to direct the attack to a duplicate
    //
    let rollNeeded
    switch (DUPLICATES) {
        case '3': rollNeeded = 6; console.log('rollNeeded = 6+'); break;
        case '2': rollNeeded = 8;  console.log('rollNeeded = 8+'); break;
        case '1': rollNeeded = 11;  console.log('rollNeeded = 11+'); break;
        default: return jez.badNews(`Unreachable when correctly executed, ${DUPLICATES} ${typeof DUPLICATES}`,'e')
    }
    console.log(`rollNeeded ${rollNeeded}`, rollNeeded)
    //-----------------------------------------------------------------------------------------------------------------------------------
    // Roll to see if a duplicate is targeted
    //
    let roll = await new Roll('1d20').roll({async: true});
    game.dice3d?.showForRoll(roll);
    roll.toMessage({
        rollMode: 'roll',
        speaker: {alias: name},
        flavor: `Mirror Image, need ${rollNeeded}+ to intercede.`
    });
    if (roll.total < rollNeeded) { // Hit proceeds normally
        msg = `Image failed to intercept the blow.`
        title = `${tToken.name} Targeted`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: MIRROR_ICON, msg: msg, title: title, token: tToken})
        return;    
    }
    //-----------------------------------------------------------------------------------------------------------------------------------
    // If we haven't returned by here, an image was targeted
    //
    workflow.isFumble = true;
    let duplicateAC = 10 + DEX_MOD;
    if (workflow.attackTotal >= duplicateAC) {
        msg = `Image is struck and destroyed, leaving ${DUPLICATES - 1}.`
        title = `Mirror Image Hit`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: MIRROR_ICON, msg: msg, title: title, token: tToken})
        if (DUPLICATES === '1') {
            console.log(`REMOVE EFFECT ${targetEffect.id}`,targetEffect)
			await MidiQOL.socket().executeAsGM('removeEffects', { actorUuid: tActor.uuid, effects: [targetEffect.id]});
        } else {
            let updates = {
                '_id': targetEffect.id,
                'changes': [
			        {
				        'key': 'macro.tokenMagic',
				        'mode': jez.CUSTOM,
				        'value': 'images',
				        'priority': 20
			        },
			        {
				        'key': 'flags.jez.mirrorImage.count',
				        'mode': jez.OVERIDE,
				        'value': DUPLICATES - 1,
				        'priority': 20
			        }
		        ]
            };
            await MidiQOL.socket().executeAsGM('updateEffects', {'actorUuid': tToken.actor.uuid, 'updates': [updates]});
        }
    } else {
        msg = `Image interceded and managed to avoid the attack; ${DUPLICATES} images remain.`
        title = `Mirror Image Missed`
        jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: MIRROR_ICON, msg: msg, title: title, token: tToken})
    }
});