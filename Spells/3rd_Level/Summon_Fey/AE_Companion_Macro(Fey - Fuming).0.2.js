/**********************************************************************************
 * MACRONAME = "AE_Companion_Macro(Fey - Fuming)"
 *
 * 12/13/22 0.1 Creation of Macro
 * 12/14/22 0.2 Add update to token & actor name on summon
 *********************************************************************************/
return {
    token: { "name": `${args[0].assignedActor?.name}'s Tricksy Fey` },
    actor: {
        "data.attributes.hp.max": (args[0]?.spellLevel || 3) * 10,
        "data.attributes.hp.value": (args[0]?.spellLevel || 3) * 10,
        "data.attributes.ac.flat": (args[0]?.spellLevel || 3) + 12,
        "name": (`${args[0].assignedActor?.name}'s Tricksy Fey`)
    },
    embedded: {
        Item: {
            "Multiattack": {
                "data.description.value": `<p>The summoned <b>fey</b> makes <b>${Math.floor(args[0].spellLevel / 2)}
                </b> attack(s) per attack action.</p>`
            },
            "Shortsword": {
                "data.attackBonus": args[0].assignedActor?.data.data.attributes.spelldc - 8,
                "data.damage.parts": [[`1d6+@mod+${(args[0].spellLevel || 3)}`, "piercing"]],
                "data.description.value":
                    `<p><b>Melee Weapon Attack:</b> ${args[0].assignedActor?.name}'s spell attack modifier to hit, 
                    reach 5 ft., one target. Hit: 1d6 + 3 (DEX Mod) + ${args[0].spellLevel} (spell's level) piercing damage
                    + 1d6 force damage.</p>`,
            }
        },
    }
}
//
//--------------------------------------------------------------------------------