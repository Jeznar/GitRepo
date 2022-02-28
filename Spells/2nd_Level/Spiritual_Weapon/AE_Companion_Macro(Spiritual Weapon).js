/**********************************************************************************
 * MACRONAME = "AE_Companion_Macro(Spiritual Weapon)"
 *
 * 12/14/22 0.1 Creation of Macro
 * 01/23/22 0.2 Added lines to rename the token with first word of summoner's name
 *********************************************************************************/
 return {
    embedded: {
        Item: {
            "Slash": {
                "data.attackBonus": args[0].assignedActor?.data.data.attributes.spelldc - 8 + args[0].assignedActor?.data.data.bonuses.msak.attack,
                "data.damage.parts": [[`${1 + Math.floor((args[0].spellLevel - 2) / 2)}d8 + ${args[0].assignedActor?.data.data.abilities[args[0].assignedActor?.data.data.attributes.spellcasting]?.mod || ""}`, "force"]]
            }
        }
    },
    token: { "name": `${args[0].assignedActor?.name.split(" ")[0]}'s Spiritual Weapon` },
    actor: { "name": (`${args[0].assignedActor?.name.split(" ")[0]}'s Spiritual Weapon`) },
}