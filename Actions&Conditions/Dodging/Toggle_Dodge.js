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
// COOL-THING: CUB AddCondition arguments
/** game.cub.addCondition(...)
 * Applies the named condition to the provided entities (Actors or Tokens)
 * @param {String[] | String} conditionName  the name of the condition to add
 * @param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens 
 *  to apply the Condition to
 * @param {Boolean} [options.warn=true]  raise warnings on errors
 * @param {Boolean} [options.allowDuplicates=false]  if one or more of the Conditions specified 
 *  is already active on the Entity, this will still add the Condition. Use in conjunction with 
 *  `replaceExisting` to determine how duplicates are handled
 * @param {Boolean} [options.replaceExisting=false]  whether or not to replace existing Conditions 
 *  with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and 
 *  `replaceExisting` is false then a duplicate condition is created. Has no effect is 
 *  `keepDuplicates` is `false`
 * @example
 * // Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
 * game.cub.addCondition("Blinded", game.actors.getName("Bob"));
 * @example
 * // Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
 * game.cub.addCondition("Charmed");
 * @example
 * // Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, 
 * // replacing any existing Conditions of the same names.
 * game.cub.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
 */
jez.log(macroName)
if (game.cub.hasCondition("Dodge")) {
    game.cub.removeCondition("Dodge");
} else {
    game.cub.addCondition("Dodge");
}