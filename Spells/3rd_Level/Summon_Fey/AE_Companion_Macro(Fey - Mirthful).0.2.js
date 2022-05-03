/**********************************************************************************
 * MACRONAME = "AE_Companion_Macro(Fey - Mirthful)"
 * 
 * 12//21 0.1 Creation of Macro
 * 12/14/22 0.2 Add update to token & actor name on summon
 *********************************************************************************/
return {
    token: { "name": `${args[0].assignedActor?.name}'s Mirthful Fey` },
    actor: {
        "data.attributes.hp.max": (args[0]?.spellLevel || 3) * 10,
        "data.attributes.hp.value": (args[0]?.spellLevel || 3) * 10,
        "data.attributes.ac.flat": (args[0]?.spellLevel || 3) + 12,
        "name": (`${args[0].assignedActor?.name}'s Mirthful Fey`)
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
            },
            "Mirthful Fey Charm": {
                "data.save.dc": (args[0].assignedActor?.data.data.attributes.spelldc || 8),
                "data.description.value":
                    `Immediately after a <b>@Item[4ZDtnbKJV5y6jjW5]{Fey Step}</b>, the fey can attempt to charm 
                    one creature it can see within 10 feet of it, The creature must make a 
                    DC${args[0].assignedActor?.data.data.attributes.spelldc} wisdom save or be 
                    @JournalEntry[i3AsMG5XwVIvE8TK]{charmed} by the fey and ${args[0].assignedActor?.name} for 
                    1 minute or until the target takes any damage.` 
            }
        },
    }
}
//
//--------------------------------------------------------------------------------