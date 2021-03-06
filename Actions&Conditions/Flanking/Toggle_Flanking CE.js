const MACRONAME = "Toggle_Flanking.1.2.js"
/*********************************************************************************************
 * Macro to toggle Flanking condition.
 *
 * 11/05/21 0.1 Creation
 * 03/07/22 1.1 Restored as a cleaner alternative to complex 1.0 version. Two major benefits 
 *              of using CUB conditions:
 *               1. Centralized place to add the silly +2+ wrapper,
 *               2. Makes the right click CUB menu useful for the condition.
 * 07/04/22 1.2 Convert to use Convenient Effects via jezcon library functions
 **********************************************************************************************/
let trcLvl = 0;
jez.trc(1, trcLvl, `=== Starting === ${MACRONAME} ===`);
for (let i = 0; i < args.length; i++) jez.trc(2, trcLvl, `  args[${i}]`, args[i]);
jezcon.toggle("Flanking")