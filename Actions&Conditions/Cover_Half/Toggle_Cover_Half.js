/*********************************************************************************************
* Macro to toggle One-Half Cover condition.  It also needs to clear any existing 3/4 cover.
* 
* Based on JoeBossi's macro to toggle specific effects.  
* https://www.reddit.com/r/FoundryVTT/comments/n5juhs/5e_macro_for_applyingremoving_specific/
*
* 12/09/21 0.1 JGB Creation from Toggle_Flanking_1.0
* 12/09/21 0.2 JGB Add Code to remove 3/4 cover, if present
* 03/07/22 1.1 Rewritten as a cleaner alternative to complex 0.2 version. Two major benefits 
               of using CUB conditions:
                1. Centralized place to add the silly +2+ wrapper,
                2. Makes the right click CUB menu useful for the condition.
**********************************************************************************************/
const macroName = "Toggle_Cover_Half"
jez.log(macroName)
if (game.cub.hasCondition("Cover, Three-Quarters")) {
    await game.cub.removeCondition("Cover, Three-Quarters");
}
if (game.cub.hasCondition("Cover, Half")) {
    game.cub.removeCondition("Cover, Half");
} else {
    game.cub.addCondition("Cover, Half");
}