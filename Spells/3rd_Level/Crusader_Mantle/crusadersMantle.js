// Crymic Code 21.10.09 (October 9th, 2021, for calendar challenged)
if (args[0].tag === "DamageBonus") {
    if (!["mwak", "rwak"].includes(args[0].item.data.actionType)) return {};
    let damageType = "radiant";
    let numDice = args[0].isCritical ? 2 : 1;
    return { damageRoll: `${numDice}d4[${damageType}]`, flavor: `(Crusader's Mantle (${CONFIG.DND5E.damageTypes[damageType]}))` };
}