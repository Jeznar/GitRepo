# Jez-Con -- Functions Used by My Macros to Deal with Conditions / Effects

This module contains common functions that focus on managaging conditions and effects.  This is an extension of my [jez-lib module](#jez-lib) and is located in within it.  

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

## Genesis of these functions

I have begun creating this functions as a way to handle my migration from Combat Utility Belt (CUB) to [Convenient Effects (CE)](https://github.com/DFreds/dfreds-convenient-effects) for handling conditions.  CUB has been useful, but it requires more attention than seems needed by CE and has some key limitations, most notably no support for players manipulating effects on other actors -- something my macros need to do with some frequency.

My intent is to build wrapper functions for all of the key operations that I have been accessing in CUB so that I can flash migrate from CUB to CE by changing a global variable stashed within this library. 

## Key Operations

CE provides a bit of documentation for [Customizing Macros](https://github.com/DFreds/dfreds-convenient-effects/wiki/User-Guide#customizing-macros) on the web.  CUB offers much less so I will be dipping into various pieces of code to float up the information I need. 

### Add Effect

* CE: `game.dfreds.effectInterface.addEffect({ effectName, uuid, origin, overlay, metadata })`
* CUB: `game.cub.addCondition(["Grappled", "Restrained"], targetID, { allowDuplicates: true, replaceExisting: false, warn: true }`
* Midi: Directly done with javascript

#### CUB Add Condition documentation (from the code)

~~~javascript
game.cub.addCondition(...)
Applies the named condition to the provided entities (Actors or Tokens)
@param {String[] | String} conditionName  the name of the condition to add
@param {(Actor[] | Token[] | Actor | Token)} [entities=null] one or more Actors or Tokens to apply the Condition to
@param {Boolean} [options.warn=true]  raise warnings on errors
@param {Boolean} [options.allowDuplicates=false]  if one or more of the Conditions specified is already active on the Entity, this will still add the Condition. Use in conjunction with `replaceExisting` to determine how duplicates are handled
@param {Boolean} [options.replaceExisting=false]  whether or not to replace existing Conditions with any duplicates in the `conditionName` parameter. If `allowDuplicates` is true and `replaceExisting` is false then a duplicate condition is created. Has no effect is `keepDuplicates` is `false`

@example
// Add the Condition "Blinded" to an Actor named "Bob". Duplicates will not be created.
game.cub.addCondition("Blinded", game.actors.getName("Bob"));

@example
// Add the Condition "Charmed" to the currently controlled Token/s. Duplicates will not be created.
game.cub.addCondition("Charmed");

@example
// Add the Conditions "Blinded" and "Charmed" to the targeted Token/s and create duplicates, 
// replacing any existing Conditions of the same names.
game.cub.addCondition(["Blinded", "Charmed"], [...game.user.targets], {allowDuplicates: true, replaceExisting: true});
 ~~~


### Customize Effect

* CE: `game.dfreds.effectInterface.findEffectByName('Bane').convertToObject()` with other code
* CUB: Not supported
* Midi: Everything is custom

CE example:

~~~javascript
const uuid = canvas.tokens.controlled[0].actor.uuid;
const effectData = game.dfreds.effectInterface.findEffectByName('Bane').convertToObject();
effectData.name = 'Test';

game.dfreds.effectInterface.addEffectWith({ effectData, uuid });
~~~

### Fetch Effect

* CE:
* CUB: `let restrained = game.cub.hasCondition("Restrained", player, { warn: true });`
* Midi:

### Has Effect

* CE: `game.dfreds.effectInterface.hasEffectApplied(effectName, uuid)`
* CUB: `let restrained = game.cub.hasCondition("Restrained", player, { warn: true });`
* Midi: Same as Fetch

### Remove Effect

* CE: `game.dfreds.effectInterface.removeEffect({ effectName: 'Bane', uuid });`
* CUB: `await game.cub.removeCondition("Restrained", player, {warn:true})`
* Midi:

### Toggle Effect

* CE: `game.dfreds.effectInterface.toggleEffect('Bane', { uuids: actorUuids });`
* CUB: Requires use of Fetch, Remove, Add calls
* Midi: Requires use of Fetch, Remove, Add calls


## Functions in this Module

The functions currently included in this module are (all need to be proceeded by **jez.** when called):

* **[badNews(message, \<badness\>)](#badNewsmessage-badness)** -- Displays warning message on console and ui then returns false
                                     
More about each of these in the following sections. 

---

### badNews(message, \<badness\>)

Pop the passed string (message) onto the console and as ui notification and return false.

This function can accept one or two arguments

* message: required string that will be used as the error message
* badness: optional severity indicator.  It can be an integer (1, 2, or 3) or a string that begins with a i, w, or e (technically, the code is much more permissive but this is intent.)

```javascript
if (matches === 0) return jez.badNews(`"${nameOfItem}" of type "${typeOfItem}" not in Item Directory, can not continue.`)

jez.badNews("Info Message", 1)  // Information
jez.badNews("Warn Message", 2)  // Warning
jez.badNews("Error Message", 3) // Error
```

[*Back to Functions list*](#functions-in-this-module)

--- 
