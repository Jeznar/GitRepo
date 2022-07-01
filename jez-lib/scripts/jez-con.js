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
        console.log("====> targetUuid",targetUuid)
        console.log("====> aItem     ",aItem)

        let tokenDoc5e = await fromUuid(targetUuid)
        console.log("====> tokenDoc5e",tokenDoc5e)
        if (!tokenDoc5e) return badNews(`Could not find token data corresponding to ${targetUuid}`, "warn")
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
} // END OF class jezcon
Object.freeze(jezcon);