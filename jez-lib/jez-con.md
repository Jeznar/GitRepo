# Jez-Con -- Functions to Deal with Conditions / Effects

This module contains common functions that focus on managaging conditions and effects.  This is an extension of my [jez-lib module](#jez-lib) and is located in within it.  

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

## Genesis of these functions

I have begun creating this functions as a way to handle my migration from Combat Utility Belt (CUB) to [Convenient Effects (CE)](https://github.com/DFreds/dfreds-convenient-effects) for handling conditions.  CUB has been useful, but it requires more attention than seems needed by CE and has some key limitations, most notably no support for players manipulating effects on other actors -- something my macros need to do with some frequency.

My intent was to build wrapper functions for all of the key operations that I have been accessing in CUB so that I could flash migrate from CUB to CE by changing a global variable stashed within this library. As it turns out, the two modules are able to co-exist and I am migrating piece meal.  I still want some functions to standardize my calls.  Those that have been built are documented below.

## Key Operations

CE provides a bit of documentation for [Customizing Macros](https://github.com/DFreds/dfreds-convenient-effects/wiki/User-Guide#customizing-macros) on the web.  CUB offers much less so I will be dipping into various pieces of code to float up the information I need. 

## Functions in this Module

The functions currently included in this module are (all need to be proceeded by **jez.** when called):

* **[addProne(targetUuid, aItem)](#addpronetargetUuid-aitem))** -- Adds a Prone effect. Hopefully the last of the generalized midid created effects.
* **[add(...args)](#addargs)** -- Calls CE addEffect to add an effect
* **[addCondition(effectName, targets, options)](#addconditioneffectname-targets-options)**
* **[hasCE(effectName, uuid)](#hasceeffectname-uuid)** -- Checks for presence of a CE effect
* **[modAdd](#modadd)** -- Example of modifying and adding an effect
* **[remove(effectName, uuid)](#removeeffectname-uuid-options--)** -- Calls CE to remove an effect by name
* **[toggle(effectName, { overlay, uuids = [] } = {})](#toggleeffectname--overlay-uuids-----)** -- Uses CE to toggle an effect
                                     
More about each of these in the following sections. 

---

### addProne(targetUuid, aItem)

Hopefully this one isn't used and I can delete it as a tech experiment.

[*Back to Functions list*](#functions-in-this-module)

--- 

### add(...args)

Adds the effect to the provided actor UUID as the GM via sockets

* async addEffect({ effectName, uuid, origin, overlay, metadata })
* @param {object} params - the params for adding an effect
* @param {string} params.effectName - the name of the effect to add
* @param {string} params.uuid - the UUID of the actor to add the effect to
* @param {string} params.origin - the origin of the effect
* @param {boolean} params.overlay - if the effect is an overlay or not
* @param {object} params.metadata - additional contextual data for the application of the effect (likely provided by midi-qol) -- Seemingly unused in code
* @param {integer} traceLvl - Trace level
* @returns {Promise} a promise that resolves when the GM socket function completes
 
#### Example 1

~~~javascript
const uuid = canvas.tokens.controlled[0].actor.uuid; 
const hasEffectApplied = await jezcon.hasCE('Bane', uuid);
 
if (!hasEffectApplied) {
    jezcon.add({ effectName: 'Bane', uuid, traceLvl: 2 });
}
~~~

#### Example 2

~~~javascript
jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
~~~

[*Back to Functions list*](#functions-in-this-module)

--- 

### addCondition(effectName, targets, options)

This function wraps the CE add function, providing options that come close to duplicating game.cub.addCondition().  It does not allow application of an array of effects, that would need to be done with a call to this function for each effect.

#### Arguments expected

* **effectName** -- string naming an existant CE effect
* **targets** -- an array or single UUID of actor(s) (e.g. Scene.MzEyYTVkOTQ4NmZk.Token.pcAVMUbbnGZ1lz4h)
* **options** -- an object that can have several fields, table below shows those defined in this function

| Property  | Type       | Default | Description                                      |
|-----------|:----------:|:-------:|--------------------------------------------------|
| allowDups | boolean    | false   | Should this effect can be duplicated on target?  |
| replaceEx | boolean    | false   | Does this effect replace existing on target?     |
| origin    | actor.uuid | null    | Origin of the effect                             |
| overlay   | boolean    | false   | boolean, if true effect will be overlay on token |
| traceLvl  | integer    |  0      | Trace level to be used                           |

**Example Call**

~~~javascript
const TL = 4
await jezcon.addCondition("Prone", LAST_ARG.targetUuids, 
   {allowDups: false, replaceEx: true, origin: aActor.uuid, overlay: false, traveLvl: TL }) 
~~~

[*Back to Functions list*](#functions-in-this-module)

---  

### hasCE(effectName, uuid)

Checks to see if any of the current active effects applied to the actor with the given UUID match the effect name and are a convenient effect
 
* @param {string} **effectName** - the name of the effect to check
* @param {string} **uuid** - the uuid of the actor to see if the effect is applied to
* @param {object} options - may define the traceLvl
* @returns {boolean} **true** if the effect is applied, false otherwise

~~~javascript
if (jezcon.hasCE( "Hindered", targetD.actor.uuid), {traceLvl: 2} )
    postResults(`${targetD.name} has already been hindered, no additional effect.`)
~~~

[*Back to Functions list*](#functions-in-this-module)

--- 

### modAdd

No function for this one, as I don't see an obvious pattern to automate, but examples from my code.

Example from Grasping Root a Creature Feature:

~~~javascript
//----------------------------------------------------------------------------------
// Modify the GRAPPLING condition to include an Overtime DoT element and apply
//
let statMod = jez.getStatMod(aToken,"str")
let effectData = game.dfreds.effectInterface.findEffectByName(GRAPPLED_COND).convertToObject();
let overTimeVal=`turn=start,label="Grasping Root",damageRoll=1d6+${statMod},saveMagic=true,damageType=bludgeoning`
effectData.changes.push( { key: 'flags.midi-qol.OverTime', mode: jez.OVERRIDE, value:overTimeVal , priority: 20 })
game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: tToken.actor.uuid, origin: sToken.actor.uuid });
~~~

Example from Electrify, 1st level Occultist's spell that only applies effect till start of target's next turn.

~~~javascript
//-------------------------------------------------------------------------------------------------------------
// Apply Stunned condition with CV, modified to last until start of target's next turn
//   
let effectData = game.dfreds.effectInterface.findEffectByName(COND_APPLIED).convertToObject();
if (TL>3) jez.trace(`${FNAME} | effectData >`, effectData)  
// Conviently effectData.flags.dae.specialDuration already exists, just need to push data into it.
effectData.flags.dae.specialDuration.push("turnStart")
if (TL>3) jez.trace(`${FNAME} | updated ===>`, effectData)  
game.dfreds.effectInterface.addEffectWith({ effectData: effectData, uuid: tActor.uuid, origin: aActor.uuid });
~~~

[*Back to Functions list*](#functions-in-this-module)

---  

### remove(effectName, uuid, options = {})

Removes the effect from the provided actor UUID as the GM via sockets

@param {object} params - the effect params
@param {string} params.effectName - the name of the effect to remove
@param {string} params.uuid - the UUID of the actor to remove the effect from
@param {object} params.options - an object that can contain the property traceLvl
@returns {Promise} a promise that resolves when the GM socket function completes

~~~javascript
const TL = 2
for (const UUID of uuids) {
    if (jezcon.hasCE("Cover (Half)", UUID, {traceLvl: TL})) {
        await jezcon.remove("Cover (Half)", UUID, {traceLvl: TL);
    }
}
~~~

[*Back to Functions list*](#functions-in-this-module)

---  

### toggle(effectName, { overlay, uuids = [] } = {})

Toggles the effect on the provided actor UUIDS as the GM via sockets. If no actor UUIDs are provided, it finds one of these in this priority:

1. The targeted tokens (if prioritize targets is enabled)
1. The currently selected tokens on the canvas
1. The user configured character
    
* async toggleEffect(effectName, { overlay, uuids = [] } = {}) 
* @param {string} **effectName** - name of the effect to toggle
* @param {object} **params** - the effect parameters
* @param {boolean} **params.overlay** - if the effect is an overlay (full size) or not 
* @param {string[]} **params.uuids** - Array of UUIDS of the actors to toggle the effect on (ActorId, TokenId, ActorName)
* @returns {Promise} a promise that resolves when the GM socket function completes

Following is an example from Toggle_Cover_Three_Quarters.js 

~~~javascript
let uuids = await game.dfreds.effectInterface._foundryHelpers.getActorUuids()
if (uuids.length === 0) return jez.badNews(`Please select at least one token`, "warning")

for (const UUID of uuids) {
    if (jezcon.hasCE("Cover (Half)", UUID)) {
        await jezcon.remove("Cover (Half)", UUID);
    }
}
await jez.wait(150)     // Allow the removals to settle before 
for (const UUID of uuids) jezcon.toggle("Cover (Three-Quarters)",{uuids: [UUID]})
~~~

[*Back to Functions list*](#functions-in-this-module)

--- 

