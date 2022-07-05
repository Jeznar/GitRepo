const macroName = "Toggle_Dodge0.3.js"
/*********************************************************************************************
 * Macro to toggle Dodge condition. 
 * This macro is intended to be used as an ItemMacro -or- from the hotbar. 
 *
 * 12/22/21 0.1 JGB Creation from Toggle_Flanking_1.0
 * 03/07/22 0.2 Restored as a cleaner alternative to complex 1.0 version. Two major benefits 
 *             of using CUB conditions:
 *               1. Centralized place to add the silly +2+ wrapper,
 *               2. Makes the right click CUB menu useful for the condition.
 * 07/04/22 1.2 Convert to use Convenient Effects via jezcon library functions
 **********************************************************************************************/
jezcon.toggle("Dodge")