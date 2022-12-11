# Work Log

Trying to keep track of things as I add or make significant changes.

22.05.21 **Summon Demon (Vrock)** -- Created new ability

22.05.22 **[Oil of Sharpness](../Items#oil-of-sharpness)** -- Potion that applies a DAE effect granting +3 attack & damage.

22.05.22 **[Cure Wounds](../Spells/1st_Level#cure-wounds)** -- Added message about need to manually back-out ineligible heals.

22.05.22 **[Mass Cure Wounds](../Spells/5th_Level#mass-cure-wounds)** -- Implement this spell for first time.

22.05.22 **[Spell Scroll: Mass Cure Wounds](../Items#spell-scrolls)** -- Just what the name suggests

22.05.22 **[Spell Scroll: Revivify](../Items#spell-scrolls)** -- Just what the name suggests

22.05.22 **[Sling Bullet +1](../Items#ammunition)** -- Added as Ammunition.

22.05.22 **[Pipes of Haunting](../Items#pipes-of-haunting)** -- Added as Item.

22.05.22 **[Stone of Good Luck](../Items#stone-of-good-luck)** -- Added as Item.

22.05.23 **[Paralyzing Touch](../Creatures-Features#paralyzing-touch)** -- A Lich's primary attack, includes a DAE Overtime saving throw and a CUB Condition

22.05.23 **[Frightening Gaze](../Creatures-Features#frightening-gaze)** -- One of a Lich's legendary actions, includes a DAE Overtime saving throw and a CUB Condition.

22.05.23 **[Disrupt Life, Lich](../Creatures-Features#disrupt-life-lich)** -- run an ItemMacro that finds all in-range tokens, discards those of type *undead*, and rolls a save for each.  Those that save take half damage.  Those that fail take full damage. Posts a neat summary message.

22.05.25 **[Mage Hand](../Spells/Cantrip#mage-hand)** -- Handle conflict between TokenMold/Name and Warpgate renaming of token

22.05.25 **[Detect Magic](../Spells/Cantrip#detect-magic)** -- Added a note about how FoundryVTT handles this spell in the description (also added the JSON)

22.05.25 **[Shield](../Spells/1st_Level#shield)** -- Added a note about how FoundryVTT doesn't handle this spell vs Magic Missle in the description (also added the JSON)

22.05.25 **[Suggestion](../Spells/2nd_Level#suggestion)** -- Run a runeVFX on failed save and post a effect summary message.

22.05.25 **[Invisibility](../Spells/2nd_Level#invisibility)** -- Foundry 9.x compatibility update. target.update() ==> target.document.update()

22.05.25 **[Greater Invisibility](../Spells/2nd_Level#greater-invisibility)** -- Foundry 9.x compatibility update. target.update() ==> target.document.update()

22.05.26 **[Darkvision](../Spells/2nd_Level#darkvision)** -- Foundry 9.x compatibility update. target.update() ==> target.document.update() and update to spell description.

22.05.29 **[Ice Storm](../Spells/4th_Level#ice-storm)** -- Created spell, though it has an error at end of turn removal. (BUG)  

22.05.29 **[Cone of Cold](../Spells/5th_Level#cone-of-cold)** -- Updated spell description

22.05.29 **[Staggering Smite](../Spells/4th_Level#staggering-smite)** -- Implemented Staggering Smite from Blinding Smite.

22.05.31 **[Phantom Steed](../Spells/3rd_Level#phantom-steed)** -- Summons a steed using warpgate and dismisses it at end of spell duration. 

22.05.31 **[Magic Weapon](../Spells/2nd_Level#magic-weapon)** -- Slight mod to an example macro.  Interesting element: modifies an item on an actor to reflect the magic benefit.

22.05.31 **[Comprehend Languages](../Spells/1st_Level#comprehend-languages)** -- Runs a RuneVFX and places a DAE effect (no macro needed).

22.05.31 **[Gust of Wind](../Spells/2nd_Level#gust-of-wind)** -- Manages a VFX in a tile representing  the area affected by the gust.  The tile is removed on spell completion or concentration break.

22.06.01 **[Animate Dead](../Spells/3rd_Level#animate-dead)** -- Uses an ASE implementation to summon undead tokens to the scene replacing existing *dead* (0 health) tokens.

22.06.01 **[Steelwind Strike](../Spells/5th_Level#steelwind-strike)** -- Polished up the ASE implementation by adding a usage note: pre-target before using this spell.

22.06.01 **[Animate Objects](../Spells/5th_Level#animate-objects)** -- Uses warpgate and a menu that adjusts based on remaining summoning budget to add actors to scene.  Manages a watchdog to delete on end of spell.

22.06.01 **[Minor Illusion](../Spells/Cantrips#minor-illusion)** -- Places and deletes a tile containing a VFX marking the spell effect location.

22.06.02 **[Morning Amulet](../Items#morning-amulet)** -- Turns on/off a VFX and posts message about item effect.

22.06.02 **[Hideous Laughter](../Spells/1st_Level#hideous-laughter)** -- Loaded and debugged Crymic's macro.  This one uses a hook to take action on damage received.  It is a bit messy still, but works.

22.06.03 **[Black Tentacles](../Spells/4th_Level#black-tentacles)** -- Moved back to ItemMacro from a macro in the game folders that was causing cleanup issues.

22.06.03 **[Faithful Hound](../Spells/4th_Level#faithful-hound)** -- Summons a hound token with warpgate, scaling its attack ability and setting up a watchdog (haha!) effect.

22.06.04 **[Arcane Hand](../Spells/5th_Level#arcane-hand)** -- Complex warpgate implementation that needed 5 macros and abilities customized.  This includes a new method of handling grapple that implements a mutual watch dog to remove paired effects.

22.06.04 **[True Seeing](../Spells/6th_Level#true-seeing)** -- Just adds a DAE Effect marker, plays a runeVFX, and summarizes the effect to a chat card.

22.06.04 **[Magnificent Mansion](../Spells/7th_Level#magnificent-mansion)** -- Runs runeVFX and includes a spell component that can be added to inventories.

22.06.06 **WarpGate** -- Resolved issue with player summons failing because of lack of permission to browse files within Foundry.  See [WarpGate Issue 61](https://github.com/trioderegion/warpgate/issues/61)

22.06.06 **Incorrect Initiative** -- Bug in Dnd5e 1.6.0 that added dexterity to initiative rolls for tie breakers ([Issue 1500](https://gitlab.com/foundrynet/dnd5e/-/issues/1500)) resolved by upgrading to 1.6.2.

22.06.06 **Item Library Functions** -- Added four library functions to streamline adding, updating, finding, deleting items from actors.

22.06.06 **[Produce Flame](../Spells/Cantrips#produce-flame)** -- Imported and upgraded to work with FoundryVTT 9.x.  (Also uses the new Library Functions)

22.06.07 **[Heat Metal](../Spells/2nd_Level#heat-metal)** -- Updated to use Library and provide VFX

22.06.07 **Divine Smite** -- Added a lot of log statements to the macro trying to figure out why it was failing sometimes.  Have not seen another failure after adding logging code.

22.06.08 **Hex** -- Updated to use the library calls to manipulate the temporary item.

22.06.08 **[Dream](../Spells/5th_Level#dream)** -- Added with a simple RuneVFX on caster and target.  It is not automated.

22.06.08 **[Hypnotic Pattern](../Spells/4th_Level#hypnotic-pattern)** -- Plays a RuneVFX on caster and adds a simple message to chat card with a small macro.  Uses DAE and AA modules for the heavy lifting.

22.06.10 **Remove Paired Effect** -- Utility macro pulled out of Arcane_Hand and setup as independent utility macro.

22.06.10 **[Phantasmal Killer](../Spells/4th_Level#phantasmal-killer)** -- Link concentrate and spell effect with [jez.pairEffects(...)](../jez-lib#pairEffectssubject1-effectName1-subject2-effectName2) so they both go away together.

22.06.11 **Token/Actor Data from Actor** -- Learned how to obtain the token5e and actor5e data object from an actor id.  This enables finding the token associated with an actor. Following snippet has been added to Get_Entities.js and embedded here to improve retrieval. 

22.06.16 **Aura of Protection** -- Changed the macro to not display sparkles and set global setting for Active Auras to penetrate walls.

~~~javascript
let fetchedActor2 = canvas.tokens.placeables.find(ef => ef.data.actorId === args[1]).actor
console.log('Actor5E fetched by ID from canvas', fetchedActor2)
let fetchedToken2 = canvas.tokens.placeables.find(ef => ef.data.actorId === args[1])
console.log('Token5E fetched by Actor ID from canvas', fetchedToken2)
~~~

22.06.14 **Regeneration in DnD 5e Helpers** -- Modified file ```~/modules/dnd5e-helpers/scripts/modules/Regeneration.js``` to find identify regeneration ability as an item starting with, not exactly matching the *magic* name.  

Original line 35: 

~~~javascript
const regen = actor.items.find(i => i.name === regenName || i.name === selfRepairName);
~~~

Became:

~~~javascript
const regen = actor.items.find(i => i.name.startsWith(regenName) || i.name.startsWith(selfRepairName));
~~~

22.06.15 **[Update Item on Actors](../Utility_Macros/#update-item-on-actors)** Macro created to update sidebar and selected tokens to match a reference item

22.06.15 **Wail** fixed to drain temp hp if present and include that info in the summary.

22.06.14 **Guidance** fixed to expire on skill checks in addition to ability checks.

22.06.17 **[Refresh Item on Actors](../Utility_Macros/#refresh-item-on-actors)** Macro created to refresh (replace) sidebar and selected tokens to match a reference item

22.06.20 **[jez.itemMgmt_itemCount(array, name, type)](../jez-lib#itemMgmt_itemCountarray-name-type)** Searches the passed array of Item5e objects for items of a given name and type. Returning the number of matches.

22.06.21 **[selectItemOnActor(sToken, prompts, nextFunc)](../jez-lib#selectitemonactorstoken-prompts-nextfunc))** -- Creation that that runs a series of dialogs to return a list of actors who have an item selected from targeted actor.

22.06.22 Updated **Open_Actor_Sheets_With**, **Refresh_Item_On_Actors**, and **Update_Item_on_Actors** to use **jez.selectItemOnActor**

22.06.24 Added jez.vfxPreSummonEffects and jez.vfxPostSummonEffects to Jez-Lib and progress on Danse Macabre

22.06.26 Fairly large set of additions to **Refresh_Item_On_Actors** supporting additional fields for special treatment and allowing the user to choose what to retain.

22.06.27 Added **False Life** spell with temp HP

22.06.27 Implemented super simple **Gentle Repose** spell. It just places a marker DAE effect on its target and displays a chat card message.

22.06.28 **jez.badNews** now accepts optional second paramater that defines type of notice (info, warn error)

22.06.28 **getMacroRunAsGM(macroName)** has been added to jez-lib.

22.06.28 **Enlarge/Reduce** player permission issue addressed and calls moved to jez-lib.

22.06.29 **Minor Illusion** had several permission issues.  RunAsGM and jez-lib functions added to handle creation, modification, deletion of embedded documents.

22.06.29 Addressed player permission issue for game.scenes.current.createEmbeddedDocuments("Tile"... calls in **Earth_Tremor**

22.06.29 Addressed player permission issue for game.scenes.current.createEmbeddedDocuments("Tile"... and canvas.scene.deleteEmbeddedDocuments("Tile"... calls in **Gust_of_Wind**, **Black_Tentacles**, **Ice_Storm**, **Cloudkill**

22.06.30 Added **jez.tileCreate** and **jez.tileDelete** to the jez-lib.

22.06.30 Converted **Earth_Tremor** to use new ***Jez-Con** function to avoid CUB runAsGM issue driven by CUB

22.07.01 Converted several macros to use library calls to **jez.tileCreate** and **jez.tileDelete**: Gust_of_Wind, Black_Tentacles, Ice_Storm, Cloudkill, Minor_Illusion

22.07.01 Changes to **Hex**, **Radiant_Soul**, and **jez-lib** to resolve issues created on FoundryVTT 9.x upgrade with the location of subclass and levels moving within the data structures.

22.07.04 Created **jezcon.toggle** to toggle a convenient effect (CE) and rolled it into several macros, replacing cub calls: flanking, Dodge, Cover 3/4, Cover 1/2, Help, Hinder, Grapple, Escape and library functions for jezcon.

22.07.05 Working toward getting all of the "Grappling" condition macros to add an escape action.  Following is the list of identified issues:

* Constrict -- updated 7.5 and again 7.7
* Crocodile_Bite -- updated 7.6 and again 7.7
* Grasping_Hand -- updated 7.6 and again 7.7
* Grasping_Root -- updated 7.6 and again 7.7
* Vampire_Claw -- updated 7.7 

22.07.09 Replaced CUB.addCondition with CE calls in: Earth_Tremor, Entangle, Hideous_Laughter, Nauseating Poison, Timestop

22.07.09 Replaced CUB.remove with CE for: Healing_Touch (The Abbot) & Eyebite Helper

22.07.09 Update items that have CUB configured into DAE Effects

* **%%Black Tentacles Effect%%** effect Black Tentacles Effect: **Restrained** -- July 9
* **Black Tentacles** effect Black Tentacles: **Restrained** -- July 9
* **Charge (Sangzor)** effect Charge (Sangzor): **Prone** -- July 10
* **Contact Other Plane** effect Contact Other Plane: **Insane** -- July 10
* **Darkness (Active Auras)** effect Darkness: **Blinded** -- July 10
* **Falling....** effect Falling....: **Prone** -- July 10
* **Frightening Gaze (Lich)** effect Frightening Gaze (lich): **Frightened** -- July 10
* **Geas** effect Geas: **Charmed** -- July 10
* **Hideous Laughter** effect Hideous Laughter: **Incapacitated** -- July 8
* **Hold Person** effect Hold Person: **Paralyzed** -- July 10
* **Hold Person (Midi) 21.11.21** effect Hold Person: **Paralyzed** -- July 10
* **Howl of Death** effect Howl of Death: **Stunned** -- July 10
* **Hypnotic Pattern** effect Hypnotic Pattern: **Charmed** -- July 10
* **Hypnotic Pattern** effect Hypnotic Pattern: **Incapacitated** -- July 10
* **Modify Memory** effect Modify Memory: **Charmed** -- July 10
* **Paralyzing Touch (Lich)** effect Paralyzing Touch (Lich): **Paralyzed** -- July 10
* **Pipes of Haunting** effect Pipes of Haunting: **Frightened** -- July 10
* **Shocking Grasp** effect Shocking Grasp: **Reactions - None** -- July 10
* **Silence (Active Auras)** effect Silence: **Deafened** -- July 10
* **Spore Cloud** effect Spore Cloud: **Poisoned** -- July 10
* **Spores (Vrock)** effect Spores (Vrock): **Poisoned** -- July 10
* **Stunning Screech (Vrock)** effect Stunning Screech (Vrock): **Stunned** -- July 10
* **Tidal Wave** effect Tidal Wave: **Prone** -- July 10
* **Vengeful Glare** effect Vengeful Glare: **Paralyzed** -- July 10

22.07.10 Updated Hex_Move to pop a dialog and ask if a previous target that can't be found is actually dead. (Pretty sweet dialog actually).

22.07.13 Created Validate_Sidebar_Utility macro.  It contains an interesting call to: `game.actors.get(element.id).getTokenImages()` to resolve the tokens including handling wildcarding.

22.07.13 Created a Sword_Burst cantrip

22.07.14 Created dozens of rather stub like invocations, all of them listed on my DDB

22.07.15 jez.suppressTokenMoldRenaming added check to skip suppression if not GM and support for options argument with traceLvl

22.07.15 Arcane Eye created using new jez-lib function jez.warpCrosshairs which gives distance from caster while summoning.

22.07.15 Fix to Faithful_Hound to suppress tokenmold and to limit summoning distance with warpgate.spawnAt

22.07.15 Update more warpgate macros: Animate_Objects, Arcane_Hand, Create_Bonfire, Create_Specter, Dancing_Lights, Danse_Macabre, Find_Steed_Specific, Flaming_Sphere, Magehand

22.07.17 Updated jez-lib calls for summoning to make it a one function affair (with a bunch of support functions being hidden)

22.07.17 Updating to warpgate.spawnAt (v2): Phantom_Steed, Sacrificial_Summon, Summon_Demons

22.07.18 Updating to warpgate.spawnAt (v2): Summon_Swarm_of_Insects, Unseen_Servant

22.07.18 Updating to warpgate.spawnAt (v2): Animate_Objects, Arcane_Hand, Create_Bonfire, Dancing_Lights, Danse_Macabre, Find_Steed_Specific, Flaming_Sphere (skipped Create_Specter as it is special and Magehand as it already has new calls)

22.07.19 Created Jump spell and action that provide links to outside web page.  Jump spell conveniently applies a convenient effect. Updated Invocation: Otherworldly Leap to link to the new spell.

22.07.20 Created silent image which pops a link to D&DBeyond for description.  Generalized jezcon.remove to handle non-CE effects as well. 

22.07.22 Created Conjure Elemental which ended up being rather complex.

22.07.22 Created Water Breathing as a really simple CE spell.

22.07.22 Updated Sending spell and Invocation: Far Scribe

22.07.23 Created Confusion from a MIDI SRD example or the same name.  This one plays emoticons on the afflicted at the start of each of their affected turns.

22.07.23 Created utility macro Run_RuneVFX_bySaves

22.07.23 Created Hold Monster spell using DAE and configuration not a custom macro

22.07.26 Added getTokenObjFromUuid to jez.log and progress on compulsion

22.07.26 Created jez.inRangeTargets and associated demo function.

22.07.26 Created Compulsion and added it to Invocation: Bewitching Whispers

22.07.28 Updated Vrock's Stunning Screech to auto select targets based on range, creature type (demons are immune), and line of sound.  

22.07.28 Fix to Moonbeam, it was missing concentration

22.07.28 Fix to Phantasmal_Killer so it is removed on concentration drop by making Remove_Paired_Effect recognize UUID of active effect (likely also fixes many other macros). Also adds a Convenient Effect (CE) description and chat bubble.

22.07.28 Updated Threat_Display (Super Scary) to have a CE Description and VFX

22.07.29 Review usage of MidiQOL.socket().executeAsGM("createEffects"... calls.  Updating [status spreadsheet](https://docs.google.com/spreadsheets/d/1Fpo2mE5PAeSU-zoz5VxhHv8w8JwKVqQ1/edit#gid=34352724) as progress is made.  For each instance consider:

1. Replacing with a CE add call instead of custom crafted effect
2. Add a flags: {convenientDescription: "Text Here"} data line
3. Opt to leave unchanged

22.07.29 Fixing various smite spells.  They need to have jez.CUSTOM swapped to jez.OVERRIDE for two effects: `flags.midi-qol.spellLevel` and `flags.midi-qol.spellId`.  Fixed so far: 

* Searing Smite 7/29
* Ensnaring Strike 7/31

22.07.30 Opened [issue #161](https://github.com/DFreds/dfreds-convenient-effects/issues/161) against Convenient Effects Module.  The module's findEffectByName function is stacking Special Durations added as supposedly one time things.  Created macro **Convenient Effects Exercise** to tickle the apparent bug.

22.08.01 Major rewrite of Sleep

22.08.04 Rewrite of Spiritual Weapon to replace Automated Evocations

22.08.04 Implemented Beacon of Hope using a Convenient Effect and no macro.

22.08.04 Updated Stone Skin to use a Convenient Effect

22.08.04 Updated Freedom of Movement to use a Convenient Effect

22.08.04 Created Guardian of Faith which summons via jez.spawnAt and sets up automated removal when health reaches zero.

22.08.05 Created super simple Speak with Plants spell

22.08.05 Added Wall of Fire (ASE)

22.08.05 Created Locate Creature

22.08.09 Automated Dominate Beast, Person, Monster.  They share an ItemMacro, modify convenientEffects, post chat bubbles, use a hook to take action when the dominated critter is damaged.

22.08.20 Built Find Familiar with scan of actor directory for familiar options

22.08.29 Fix to invisibility self only and creation of Imp Shape Shift that changes token image and movement rates.  It scans a directory of the server to validate the image before attempting to use it.

22.09.02 Add support for CHAIN_MASTER_VOICE to Swap Senses and Find Familiar

22.09.15 Inspiring Leader: Eliminated assumption that the caster is selected before this item is used.  Problem was this line: ```let tokenD = canvas.tokens.controlled[0];```

22.09.23 Implement Ghast's Stench ability that manages an immunity effect and applies a modified Convenient Effect of Poisoned to those that fail saving throw.

22.09.23 Implement Quasit claw that includes a Poison DAE effect which allows saves OverTime.

22.09.23 Implement Quasit scare that includes a Frightened DAE effect which allows saves OverTime.

22.09.23 Implement Quasit shape shift, minor changes to a copy of Imp Shape Shift.

22.10.05 Wrote up documentation for Magic Item Configuration

22.10.05 Created largely manual Wall of Ice Spell

22.10.05 Bug fix for displayed message of Vampire Bite

22.10.08 Created **Regeneration, Vampire Initialize** that defines a hooked function that watches for radiant damage and places debuff when received.

22.10.14 Fix to scope for Hideous Laughter - Hook was triggering on any token taking damage

22.10.14 Fix to scope for Dominated (affects Beast, Person, Monster) - Hook was triggering on any token taking damage

22.10.14 Major rebuild to Decaying Touch including limitation of scope for hook (best yet!)

22.10.14 Added disguise self using Crymic's v10 macro.

22.10.15 Update Magic Weapon adding VFX and pairing effects so that concentration drops when effect ends

22.10.15 Update Magic Weapon again, fixing scaling and adding convenientDescriptions

22.10.18 Another update to Magic weapon, this time it uses jez.setCEDesc library calls to manage the convenientDescription previously set with direct code and CE_DESC

22.10.18 Created CESDescUpdate as a runAsGM macro that is used by new library function jez.setCEDescAsGM() which wraps jez.setCEDesc with GM Authority.

22.10.19 Converted Magic Weapon to use newly created jez.pairEffectsAsGM to fix player permission issue.  

22.10.19 Converted Shield of Faith to use jez.pairEffectsAsGM to fix player permission issue

22.10.20 Created Phantasmal Force with effect pairing and managed summon

22.10.21 Updated Fear: Add doEach for subsequent saving throws when out of Line of Sight (LoS)

22.10.21 Swap deleteEmbeddedEntity for deleteEmbeddedDocuments for Foundry 9.x compatibility in: Nature's Wrath, Horrifying_Visage, Retched_Spittle

22.10.25 Added Abominable Yeti's gaze attack (Chilling Gaze) with an OverTime save roll.

22.10.26 Added Abominable Yeti's cone of cold, charged ability.

22.10.26 Fear of Fire created.  It applies a debuff that lasts till the end of the user's next turn.

22.10.30 Gauth Fire Ray and fireRay library call created.

22.10.31 Implement Death Throes including setting of targeted tokens from the macro run as 'Called before the item is rolled (*)'.

22.11.01 Created library function 'deleteEffectAsGM' and used it in Hex-Move to eliminate permission issue.

22.11.01 Fixed permission issues and MSAK not triggering damage elements of Nauseating Poison

22.11.05 Created Bodak's aura using an active aura that inflicts selective damage.

22.11.05 Bodak's death gaze affecting all tokens who can see it and generating compact roll summary.

22.11.09 Changes to jez.pickCheckListArray to allow it to be effectively await'ed (synchronicity), remaining dialog functions were not updates, though jez.pickCheckListArray was documented where changed to help in future.

22.11.09 Created Maddening Feast which does some pre-target shenanigans to set the targets and then uses the item card to perform the rest of the spell.  Uses 'Called before the item is rolled' setting to force evaluation before the item card rolls.  It uses  args[0].macroPass !== 'preItemRoll' to validate the config.

22.11.12 Created Glaaar-Pat from Maddening Feast a bit streamlined

22.11.12 Created Rooooo-glog which grants temphp to creatures of subtype "bullywug". Cool bits: uses midi's ability to grant temphp taking into account the existing if any temphp to an array of tokens 

22.11.12 Created Croaked Decree as a variation of Glaaar-Pat

22.11.14 Created Utility script: Remove_Combatants. It removes tokens with certain hard coded names from the combat tracker.

22.11.14 Creation of TokenUpdate runAsGM now used by library call moveToken to address permissions problem.

22.11.14 Fix for Electrify.js: Saving throw for applied effect added (it just wasn't included before)

22.11.15 Created Legendary Action: Stolen_Shadow_in_Ravenloft.  This warpgates in a shadow, manipulates its token, adds it to combat and sets the inititative.

22.11.15 Created Shadow's Drain Strength ability.

22.11.16 Created Lair Actions, Strahd and updated the D&D Helpers regeneration.js script to not prompt for regeneration on non-wounded tokens.

22.11.16 Built several demons along with their (relatively) simple abilities: Abyssal Chicken, Cackler, Manes, Maw Demon

22.11.18 Built Summon Lesser Demon along with RunAsGM macros: ToggleCombatAsGM and RollInitiativeAsGM

22.11.19 Built jez.combatAddRemove(...) & jez.combatInitiative(...).  Integrated them into Summon Lesser Demon

22.11.19 Added two new library calls to Summon Greater Demon and Lair)Tracker_Strahd, later forcing a 20 initiative.

22.11.19 Created a quick Stunning Gaze for the Gauth, its not quite RAW but should be fine.

22.11.22 Fix Produce Flame to attach VFX to a token using .attachTo(target) not .atLocation(target) & Update the associated DAE effect to handle lighting

22.11.22 Fix to jez.moveToken to move adjacent token away

22.11.22 jez.moveToken changed to post a message when movement path is blocked. Tested in Gauth_Eye_Rays.js and test_moveToken.js

22.11.23 Imported Crymic's Channel Divinity: True Strike.  It manipulates the to hit roll before proceeding.  Pretty amazing.  Also does not work for NPCs.

22.11.23 Created jez.lib functions getItemUses and setItemUses

22.11.23 Updated Channel Divinity: True Strike, as of version 0.2 this works with NPCs, substituting item uses for Channel Divinity charges.

22.11.15 Prismatic Spray implemented with VFX that adjusts their play rates (speed) so that 7 different effects all take the same amount of time to complete.

22.11.26 Rod of the Pact Keeper revised to grant additional pact spell slot and do some other checks.

22.11.26 Changes to jez.pickRadioListArray copying those in jez.pickCheckListArray to allow it to be effectively await'ed (synchronicity).

22.11.27 Rewrote Summon_Fey.0.2.js to make it work without Automated Evocations which has been deactivated. It does all the steps of RAW including putting the summoned Fey into combat at correct spot.

22.11.27 Lesser Restoration moved into my format, now uses a radio dialog and finds effects that contain the substrings, not just exact matches

22.11.27 Rewrite of Lay On Hands to use item's Limited Uses as a fall back to a PC resource, enabling the use of this feature for NPCs

22.11.28 Created Octopus's Ink Cloud to place and manage an overhead tile representing the ink cloud.

22.11.28 Created Octopus Tentacle using cut down Grapple to apply the grappled/grappling and create an escape action.

22.11.28 Updated Prismatic spray to track the 3 saves before 3 failures aspects of Indigo and Violet Beams

22.12.01 Added library function jez.refundSpellSlot

22.12.02 Cure Wounds now refunds spell slot when cast with no targets selected.

22.12.02 Created Healing Word macro based on Cure wounds and added VFX to both using .playbackRate() and .repeats() calls to make them more impactful

22.12.03 Automated Revivify including refunding spell slot, healing target (runAsGM ActorUpdate), marking it prone.

22.12.05 Thunderstep rewritten to be a one step macro that allows picking of and relocation of a "buddy" and inflicts RAW damage.

22.12.06 Automated Fiert Teleportation to be a one step macro that selects *buddies*, moves them and handles damage.

22.12.06 Update to Light: Update log and chase player permission issue deleting/adding effect

22.12.06 Thunderstep & Fiery Teleport updated to display target destinations to help avoid collisions.

22.12.07 Updated jez.getActor5eDataObj() to accept actor.uuid and warn on actor.id

22.12.08 Updated Crown of Madness: Swapped effect.update to jez.setCEDescAsGM to fix permission issue

22.12.08 Updated a swarm of macros to use pairEffectsAsGM to resolve permission issues

22.12.09 Added getClassLevel to jez.lib and a bunch of player spell cleanup

22.12.10 Created Poison Spray macro that runs a VFX that handles saves as misses for the VFX bolt.  Also misc cleanups.

22.12.10 Created Purify Food and Drink macro to play a more complex VFX at a tile location

22.12.10 Thunderwave updated to handle movement of victims with jezlib function: jez.moveToken

22.12.10 Added Barkskin Macro that manages a VFX and use pairEffectsAsGM to link the effect back to concentrating

[Link back to my Documentation Listing](README.md) 

[Link back to my Repo Listing](https://github.com/Jeznar/Jeznar/blob/main/README.md) 