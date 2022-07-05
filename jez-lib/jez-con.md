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
* **[hasCE(effectName, uuid)](#hasceeffectname-uuid)** -- Checks for presence of a CE effect
* **[remove(effectName, uuid)](#removeeffectname-uuid)** -- Calls CE to remove an effect
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
* @returns {Promise} a promise that resolves when the GM socket function completes
 
#### Example 1

~~~javascript
const uuid = canvas.tokens.controlled[0].actor.uuid; 
const hasEffectApplied = await jezcon.hasCE('Bane', uuid);
 
if (!hasEffectApplied) {
    jezcon.add({ effectName: 'Bane', uuid });
}
~~~

#### Example 2

~~~javascript
jezcon.add({ effectName: 'Grappled', uuid: tToken.actor.uuid, origin: aActor.uuid })
~~~

[*Back to Functions list*](#functions-in-this-module)

--- 

### hasCE(effectName, uuid)

Checks to see if any of the current active effects applied to the actor with the given UUID match the effect name and are a convenient effect
 
* @param {string} **effectName** - the name of the effect to check
* @param {string} **uuid** - the uuid of the actor to see if the effect is applied to
* @returns {boolean} **true** if the effect is applied, false otherwise

~~~javascript
if (jezcon.hasCE("Hindered", targetD.actor.uuid))
    postResults(`${targetD.name} has already been hindered, no additional effect.`)
~~~

[*Back to Functions list*](#functions-in-this-module)

--- 

### remove(effectName, uuid)

This function is not super necessary, popping a .delete on the end of the effect data gets the job just as well. But it can be useful for more generic types of things.

Removes the effect from the provided actor UUID as the GM via sockets.
     
* @param {object} **params** - the effect params
* @param {string} **params.effectName** - the name of the effect to remove
* @param {string} **params.uuid** - the UUID of the actor to remove the effect from
* @returns {Promise} a promise that resolves when the GM socket function completes

~~~javascript
let uuids = await game.dfreds.effectInterface._foundryHelpers.getActorUuids()
if (uuids.length === 0) return jez.badNews(`Please select at least one token`, "warning")

for (const UUID of uuids) await jezcon.remove("Cover (Three-Quarters)", UUID)
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

