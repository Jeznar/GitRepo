// https://hackmd.io/@akrigline/ByHFgUZ6u/%2FojFSOsrNTySh9HbzTE3Orw
//
console.log(`
      **                        ******                   
     /**                       **////**                  
     /**  *****  ******       **    //   ******  ******* 
     /** **///**////**  *****/**        **////**//**///**
     /**/*******   **  ///// /**       /**   /** /**  /**
 **  /**/**////   **         //**    **/**   /** /**  /**
//***** //****** ******       //****** //******  ***  /**
 /////   ////// //////         //////   //////  ///   // `)
                                                     
 // https://onlineasciitools.com/convert-text-to-ascii-art
/*************************************************************************************
 * Register the module with Developer Mode
 *************************************************************************************/
// Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
//     registerPackageDebugFlag(jez.ID);
// });

/*************************************************************************************
 * Create a Class for our Module to hold all my nifty functions
 *************************************************************************************/
class jezcon {
    static ID = 'jez-con';
    static TEMPLATES = {
        TODOLIST: `modules/${this.ID}/templates/todo-list.hbs`
    }
    static contents() {
        console.log("")
        console.log("More stuff")
        console.log(functions)
        console.log("")
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Add Prone effect to specified target (UUID), assuming it doesn't already have it
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async addProne(targetUuid, aItem) {
        const CONDITION = "Prone"
        console.log("====> targetUuid", targetUuid)
        console.log("====> aItem     ", aItem)

        let tokenDoc5e = await fromUuid(targetUuid)
        console.log("====> tokenDoc5e", tokenDoc5e)
        if (!tokenDoc5e) return jez.badNews(`Could not find token data corresponding to ${targetUuid}`, "warn")
        if (tokenDoc5e.data.actorData?.effects)
            if (tokenDoc5e.data.actorData.effects.find(ef => ef?.label === CONDITION))
                return jez.log(`${tokenDoc5e.name} already prone`)

        let specialDuration = ["newDay", "longRest", "shortRest"];
        let effectData = {
            label: CONDITION,
            icon: "modules/combat-utility-belt/icons/prone.svg",
            disabled: false,
            flags: {
                dae: {
                    itemData: aItem,
                    specialDuration: specialDuration
                },
                core: {
                    statusId: "Prone"
                }
            },
            changes: [
                { key: `flags.midi-qol.disadvantage.attack.all`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.mwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.advantage.attack.msak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rwak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `flags.midi-qol.grants.disadvantage.attack.rsak`, mode: jez.ADD, value: 1, priority: 20 },
                { key: `data.attributes.movement.walk`, mode: jez.MULTIPLY, value: 0.5, priority: 20 }
            ]
        };
        return await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: targetUuid, effects: [effectData] });
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Adds the effect to the provided actor UUID as the GM via sockets
     *
     * async addEffect({ effectName, uuid, origin, overlay, metadata })
     * @param {object} params - the params for adding an effect
     * @param {string} params.effectName - the name of the effect to add
     * @param {string} params.uuid - the UUID of the actor to add the effect to
     * @param {string} params.origin - the origin of the effect
     * @param {boolean} params.overlay - if the effect is an overlay or not
     * @param {object} params.metadata - additional contextual data for the application of the effect 
     *                                   (likely provided by midi-qol) -- Seemingly unused in code
     * @returns {Promise} a promise that resolves when the GM socket function completes
     * 
     * Example
     * -------
     * const uuid = canvas.tokens.controlled[0].actor.uuid; 
     * const hasEffectApplied = await game.dfreds.effectInterface.hasEffectApplied('Bane', uuid);
     * 
     * if (!hasEffectApplied) {
     *     game.dfreds.effectInterface.addEffect({ effectName: 'Bane', uuid });
     * }
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async add(...args) {
        let trcLvl = 4
        jez.trc(3, trcLvl, "Called jezcon.add(...args)")
        for (let i = 0; i < args.length; i++) jez.trc(4, trcLvl, `  args[${i}]`, args[i]);

        game.dfreds.effectInterface.addEffect(...args)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Toggles the effect on the provided actor UUIDS as the GM via sockets. If no actor
     * UUIDs are provided, it finds one of these in this priority:
     *
     * 1. The targeted tokens (if prioritize targets is enabled)
     * 2. The currently selected tokens on the canvas
     * 3. The user configured character
     * 
     * async toggleEffect(effectName, { overlay, uuids = [] } = {}) 
     * @param {string} effectName - name of the effect to toggle
     * @param {object} params - the effect parameters
     * @param {boolean} params.overlay - if the effect is an overlay (full size) or not 
     * @param {string[]} params.uuids - Array of UUIDS of the actors to toggle the effect on 
     *                                  (ActorId, TokenId, ActorName)
     * @returns {Promise} a promise that resolves when the GM socket function completes
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async toggle(effectName, { overlay, uuids = [] } = {}) {
        let trcLvl = 4
        const FUNCNAME = "jezcon.toggle(effectName, { overlay, uuids = [] } = {})";
        jez.trc(3, trcLvl, `--- Starting --- ${FUNCNAME} ---`);
        jez.trc(4, trcLvl, "Parameters", "effectName", effectName, "overlay", overlay, "uuids", uuids)
        jez.log(await game.dfreds.effectInterface.toggleEffect(effectName, { overlay: overlay, uuids: uuids }))
        jez.trc(3, trcLvl, `--- Finished --- ${FUNCNAME} ---`);
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is applied to
     * @returns {boolean} true if the effect is applied, false otherwise
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static hasCE(effectName, uuid) {
        let trcLvl = 4
        jez.trc(3, trcLvl, "--- Starting --- hasCE(effectName, uuid) ---");
        jez.trc(4, trcLvl, "Parameters", "effectName", effectName, "uuid", uuid)
        return game.dfreds.effectInterface.hasEffectApplied(effectName, uuid)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Removes the effect from the provided actor UUID as the GM via sockets
     *
     * @param {object} params - the effect params
     * @param {string} params.effectName - the name of the effect to remove
     * @param {string} params.uuid - the UUID of the actor to remove the effect from
     * @returns {Promise} a promise that resolves when the GM socket function completes
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async remove(effectName, uuid) {
        let trcLvl = 4
        const FUNCNAME = "remove(effectName, uuid)";
        jez.trc(3, trcLvl, `--- Starting --- ${FUNCNAME} ---`);
        jez.trc(4, trcLvl, "Parameters", "effectName", effectName, "uuid", uuid)
        game.dfreds.effectInterface.removeEffect({ effectName, uuid })
    }

} // END OF class jezcon
Object.freeze(jezcon);