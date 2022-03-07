/*********************************************************************************************
* Macro to toggle Dodge condition. 
* This macro is intended to be used as an ItemMacro -or- from
* the hotbar.  If used on hotbar, multi-select is supported.
*
* 12/22/21 0.1 JGB Creation from Toggle_Flanking_1.0
* 03/07/22 0.2 Restored as a cleaner alternative to complex 1.0 version. Two major benefits 
               of using CUB conditions:
                1. Centralized place to add the silly +2+ wrapper,
                2. Makes the right click CUB menu useful for the condition.
**********************************************************************************************/
const macroName = "Toggle_Dodge"
jez.log(macroName)
if (game.cub.hasCondition("Dodge")) {
    game.cub.removeCondition("Dodge");
} else {
    game.cub.addCondition("Dodge");
}