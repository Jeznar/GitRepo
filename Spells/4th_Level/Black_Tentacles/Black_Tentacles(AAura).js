const MACRONAME = "Black_Tentacles(AAura).js"
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log(`============== Starting === ${MACRO} =================`);
let saveRoll = 0    // JGB

if (!game.modules.get("advanced-macros")?.active) { ui.notifications.error("Advanced Macros is not enabled"); return }
if (!game.modules.get("combat-utility-belt")?.active) { ui.notifications.error("CUB is not enabled"); return }
if (!game.modules.get("times-up")?.active) { ui.notifications.error(" Times up is not enabled"); return }

for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);

if (args[0] === "on" || args[0] === "each") {
    const lastArg = args[args.length - 1];
    let tactor;
    if (lastArg.tokenId) tactor = canvas.tokens.get(lastArg.tokenId).actor;
    else tactor = game.actors.get(lastArg.actorId);
    const target = canvas.tokens.get(lastArg.tokenId)
    const flavor = `${CONFIG.DND5E.abilities["dex"]} DC${args[1]} "Black Tentacles"}`;
    let res = game.cub.hasCondition("Restrained", target)   // Bug Fixed: Original macro was missing 2nd Arg
    if (!res) {
        jez.log(`${target.name} was not Restrained`, res)
        saveRoll = (await tactor.rollAbilitySave("con", { flavor }))?.total;
        jez.log("==> saveRoll", saveRoll)
        if (!saveRoll) return;
    }
    else if (res) {
        jez.log(`${target.name} was not Restrained`, res)
        saveRoll = 0
        jez.log("--> saveRoll", saveRoll)
    }
    let damageRoll = new Roll(`3d6[bludgeoning]`).evaluate()
    damageRoll.toMessage({ flavor: "Black Tentacles Damage"})  // Intersting line COOL-THING?

    let targets = new Set();
    let saves = new Set();
    
    targets.add(target);
    jez.log("targets",targets)
    saves.add(target);
    jez.log("saves",saves)
    jez.log(`saveRoll ${saveRoll} args[1] ${args[1]}`)
    if (saveRoll <= args[1]) {  // JGB Comparison was >
        jez.log(`${target.name} failed save`, saveRoll)
        saves.add(target)
        MidiQOL.applyTokenDamage([{ damage: damageRoll.total / 2, type: "bludgeoning" }], damageRoll.total, targets, null, saves);
        if (!res) await game.cub.addCondition("Restrained", target) // JGB Added await
        await jez.wait(5000)
    }
    else {
        jez.log(`${target.name} made save`, saveRoll)
        MidiQOL.applyTokenDamage([{ damage: damageRoll.total, type: "bludgeoning" }], damageRoll.total, targets, null, saves);
    }
    jez.log(`============== Finished === ${MACRO} =================`)
    await jez.wait(2000)
}