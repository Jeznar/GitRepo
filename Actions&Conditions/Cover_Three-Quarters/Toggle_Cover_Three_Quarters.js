const MACRONAME = "Toggle_Cover_Three-Quarters.1.2.js"
/*********************************************************************************************
 * Macro to toggle 3/4 Cover condition.  It also needs to clear any existing 1/2 cover.
 * 
 * 12/09/21 0.1 JGB Creation from Toggle_Flanking_1.0
 * 12/09/21 0.2 JGB Add Code to remove 3/4 cover, if present
 * 03/07/22 1.1 Rewritten as a cleaner alternative to complex 0.2 version. Two major benefits 
 *             of using CUB conditions:
 *               1. Centralized place to add the silly +2+ wrapper,
 *               2. Makes the right click CUB menu useful for the condition.
 * 07/04/22 1.2 Convert to use Convenient Effects via jezcon library functions
 **********************************************************************************************/
const TL = 0
if (TL > 0) jez.log(MACRONAME)
let uuids = await game.dfreds.effectInterface._foundryHelpers.getActorUuids()
if (TL > 1) jez.trace(`${MACRONAME} uuids`, uuids)
if (uuids.length === 0) return jez.badNews(`Please select at least one token`, "warning")

for (const UUID of uuids) {
    if (jezcon.hasCE("Cover (Half)", UUID, {traceLvl: TL})) {
        await jezcon.remove("Cover (Half)", UUID, {traceLvl: TL});
    }
}
await jez.wait(150)     // Allow the removals to settle before 
for (const UUID of uuids) jezcon.toggle("Cover (Three-Quarters)",{uuids: [UUID], traceLvl: TL})
