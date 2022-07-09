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
     * @param {integer} traceLvl - Trace level
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
    // statis async add(...args) {
    static async add(param) {
        const FUNCNAME = 'jezcon.add(param)'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = param?.traceLvl ?? 1
        if (TL > 0) jez.trace(`${FUNCNAME} called with`, param)
        if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`${FNAME} | Argument args[${i}]`, args[i]);
        game.dfreds.effectInterface.addEffect(param)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * This function wraps the CE add function, providing options that come close to duplicating 
     * game.cub.addCondition().  It does not allow application of an array of effects, that would need 
     * to be done with a call to this function for each effect.
     * 
     * Arguments expected
     * ==================
     * effectName -- string naming an existant CE effect
     * targets -- an array or single UUID of actor(s) (e.g. Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h)
     * options -- an object that can have several fields, table below shows those defined in this function
     * 
     *  | Property  | Type       | Default | Description                                      |
     *  |-----------+:----------:+:-------:+--------------------------------------------------|
     *  | allowDups | boolean    | false   | Should this effect can be duplicated on target?  |
     *  | replaceEx | boolean    | false   | Does this effect replace existing on target?     |
     *  | origin    | actor.uuid | null    | Origin of the effect                             |
     *  | overlay   | boolean    | false   | boolean, if true effect will be overlay on token |
     *  | traceLvl  | integer    |  0      | Trace level to be used                           |
     * 
     * Example Call
     * ============
     * const TL = 4
     * await jezcon.addCondition("Prone", LAST_ARG.targetUuids, 
     *  {allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traveLvl: TL }) 
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async addCondition(effectName, targets, options) {
        const FUNCNAME = 'jezcon.addCondition(effectName, targets, options)'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 0
        if (TL > 1) jez.trace(`--- Starting --- ${FUNCNAME} ---`)
        if (TL > 2) jez.trace(` ${FNAME}(parameters)....`, "effectName", effectName, "targets", targets, "options", options)
        // ----------------------------------------------------------------------------------------------
        // Process the options object, setting default values as needed.
        //
        let allowDups = options?.allowDups ?? false
        let replaceEx = options?.replaceEx ?? false
        let origin = options?.origin ?? null
        let overlay = options?.overlay ?? false
        if (TL > 3) jez.trace(`${FNAME} | Options Set`, 'allowDups', allowDups, 'replaceEx', replaceEx,
            'origin', origin, 'overlay', overlay, 'TL', TL)
        // ----------------------------------------------------------------------------------------------
        // Validate first argument and validate it.
        //
        if (typeof effectName !== "string")
            return jez.badNews(`First argument needs to be a string naming an existant effect`, 'error')
        let effectObj = await game.dfreds.effectInterface.findEffectByName(effectName);
        if (!effectObj)
            return jez.badNews(`Could not find effect data for ${effectName}`, 'error')
        // ----------------------------------------------------------------------------------------------
        // Process the options object, setting default values as needed.
        //
        if (jez.typeOf(targets) === "array") {  // Process each element of array
            if (TL > 3) jez.trace(`${FNAME} | Targets is an array.`)
            for (const TARGET of targets) {
                if (TL > 3) jez.trace(`${FNAME} | Process ${TARGET}`)
                addEffect(TARGET)
            }
        }
        else {                                  // Presumably a single target's identifier
            if (TL > 3) jez.trace(`${FNAME} | Process ${targets}`)
            addEffect(targets)
        }
        // ----------------------------------------------------------------------------------------------
        // Function to add effect to a single target
        //
        function addEffect(targetUuid) {
            const FNAME = 'addEffect   '
            if (!jez.isActorUUID(targetUuid, { traceLvl: TL })) return false
            let hasEffect = false
            if (!allowDups || replaceEx) {  // Need to know if target currently has our effect 
                hasEffect = jezcon.hasCE(effectName, targetUuid)
                if (TL > 3) jez.trace(`${FNAME} | hasEffect?`, hasEffect)
                if (hasEffect) {
                    if (!allowDups) {        // Skip applying as duplicates not allowed
                        if (TL > 3) jez.trace(`${FNAME} | Has effect and duplicates not allowed.`)
                        return false
                    }
                    if (replaceEx) {        // Delete existing effect so new application can replace it        
                        if (TL > 3) jez.trace(`${FNAME} | Remove existing effect so new can replace it.`)
                        jezcon.remove(effectName, targetUuid)
                    }
                }
            }
            jezcon.add({ effectName: effectName, uuid: targetUuid, origin: origin, overlay: overlay })
        }
        return true
    }

    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Checks to see if any of the current active effects applied to the actor
     * with the given UUID match the effect name and are a convenient effect
     *
     * @param {string} effectName - the name of the effect to check
     * @param {string} uuid - the uuid of the actor to see if the effect is applied to
     * @param {object} options - may define the traceLvl
     * @returns {boolean} true if the effect is applied, false otherwise
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static hasCE(effectName, uuid, options = {}) {
        const FUNCNAME = 'jezcon.hasCE(effectName, uuid, options = {})'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 1
        if (TL > 0) jez.trace(`--- ${FUNCNAME} called for ${effectName} on ${uuid}`)
        if (TL > 2) jez.trace(`${FNAME} | effectName`, effectName);
        if (TL > 2) jez.trace(`${FNAME} | uuid`, uuid);
        if (TL > 2) jez.trace(`${FNAME} | options`, options);
        return game.dfreds.effectInterface.hasEffectApplied(effectName, uuid)
    }
    /*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
     * Removes the effect from the provided actor UUID as the GM via sockets
     *
     * @param {object} params - the effect params
     * @param {string} params.effectName - the name of the effect to remove
     * @param {string} params.uuid - the UUID of the actor to remove the effect from
     * @param {object} params.options - an object that can contain the property traceLvl
     * @returns {Promise} a promise that resolves when the GM socket function completes
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async remove(effectName, uuid, options = {}) {
        const FUNCNAME = 'jezcon.remove(effectName, uuid, options = {})'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = options?.traceLvl ?? 1
        if (TL > 0) jez.trace(`--- ${FUNCNAME} called for ${effectName} on ${uuid}`)
        if (TL > 2) jez.trace(`${FNAME} | effectName`, effectName);
        if (TL > 2) jez.trace(`${FNAME} | uuid`, uuid);
        if (TL > 2) jez.trace(`${FNAME} | options`, options);
        game.dfreds.effectInterface.removeEffect({ effectName, uuid })
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
     * @param {integer} params.TL - Trace level
     * @returns {Promise} a promise that resolves when the GM socket function completes
     *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
    static async toggle(effectName, { overlay, uuids = [], traceLvl } = {}) {
        const FUNCNAME = 'jezcon.toggle(effectName, { overlay, uuids = [], traceLevel } = {})'
        const FNAME = FUNCNAME.split("(")[0]
        const TL = traceLvl ?? 1
        if (TL > 0) jez.trace(`--- ${FUNCNAME} called for ${effectName}`)
        if (TL > 2) jez.trace(`${FNAME} | effectName`, effectName);
        if (TL > 2) jez.trace(`${FNAME} | uuids`, uuids);
        if (TL > 2) jez.trace(`${FNAME} | overlay`, overlay);
        if (TL > 2) jez.trace(`${FNAME} | TL`, TL);
        await game.dfreds.effectInterface.toggleEffect(effectName, { overlay: overlay, uuids: uuids })
    }


} // END OF class jezcon
Object.freeze(jezcon);