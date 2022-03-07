/*********************************************************************************************
* Macro to toggle 3/4 Cover condition.  It also needs to clear any existing 1/2 cover.
* 
* Based on JoeBossi's macro to toggle specific effects.  
* https://www.reddit.com/r/FoundryVTT/comments/n5juhs/5e_macro_for_applyingremoving_specific/
*
* 12/09/21 0.1 JGB Creation from Toggle_Flanking_1.0
* 12/09/21 0.2 JGB Add Code to remove 3/4 cover, if present
* 03/07/22 1.1 Rewritten as a cleaner alternative to complex 0.2 version. Two major benefits 
               of using CUB conditions:
                1. Centralized place to add the silly +5+ wrapper (which didn't work),
                2. Makes the right click CUB menu useful for the condition.
**********************************************************************************************/
const macroName = "Toggle_Cover_Three-Quarters"
jez.log(macroName)
if (game.cub.hasCondition("Cover, Half")) {
    await game.cub.removeCondition("Cover, Half");
}
if (game.cub.hasCondition("Cover, Three-Quarters")) {
    game.cub.removeCondition("Cover, Three-Quarters");
} else {
    game.cub.addCondition("Cover, Three-Quarters");
}