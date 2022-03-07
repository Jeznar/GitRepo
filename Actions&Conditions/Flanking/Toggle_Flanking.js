/*********************************************************************************************
* Macro to toggle Flanking condition.
* 
* Based on JoeBossi's macro to toggle specific effects.  
* https://www.reddit.com/r/FoundryVTT/comments/n5juhs/5e_macro_for_applyingremoving_specific/
*
* 11/05/21 0.1 Creation
* 03/07/22 1.1 Restored as a cleaner alternative to complex 1.0 version. Two major benefits 
               of using CUB conditions:
                1. Centralized place to add the silly +2+ wrapper,
                2. Makes the right click CUB menu useful for the condition.
**********************************************************************************************/
const macroName = "Toggle_Flanking_1.1"
jez.log(macroName)
if (game.cub.hasCondition("Flanking")) {
    game.cub.removeCondition("Flanking");
} else {
    game.cub.addCondition("Flanking");
}