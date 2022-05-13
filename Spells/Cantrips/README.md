# Cantrips
This repository will contain my automated Cantrips as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Acid Splash](#acid-splash)
* [Agonizing Blast](#agonizing-blast)
* [Chill Touch](#chill-touch)
* [Create Bonfire](#create-bonfire)
* [Dancing Lights](#dancing-lights)
* [Decaying Touch](#decaying-touch)
* [Druid Craft](#druid-craft)
* [Eldritch Blast](#eldritch-blast)
* [Fire Bolt](#fire-bolt)
* [Guided Strike](#guided-strike)
* [Infestation](#infestation)
* [Light](#light)
* [Mage Hand](#mage-hand)
* [Melf's Acid Arrow](#melfs-acid-arrow)
* [Mending](#mending)
* [Prestidigitation](#prestidigitation)
* [Shillelagh](#shillelagh)
* [Shocking Grasp](#shocking-grasp)
* [Thaumaturgy](#thaumaturgy)
* [Thorn Whip](#thorn-whip)
* [Vicious Mockery](#vicious-mockery)

[*Back to List of All Spells*](../README.md)

## Spell Notes

### Acid Splash

This spell is configured using Automated Animations to add a green explosion on the target(s).  No error checking or macro is provided.

**Reminder**: For NPC's cantrips need to be scaled manually as they have no level for automated scaling.

![acid-splash](Acid_Splash/Acid_Splash.gif)

### Agonizing Blast
 
This spell is *very* similar to [eldritch blast](#eldritch-blast).  The differences are adding the casters spell modifier to the damage roll and a different, darker, set of animations.

![Agonizing Blast](Agonizing_Blast/Agonizing_Blast.gif)

This spell is available through [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#eldritch-blast) and a configuartion check box to make [Eldritch Blast](#eldritch-blast) into Agonizing blast.  As discussed in my Eldritch Blast notes below, I am sticking with mu implementation.

[*Back to Cantrips List*](#cantrips)

---

### Chill Touch

Imported older implementation, appears compatible with FoundryVTT 9.x.

[*Back to Cantrips List*](#cantrips)

---

### Create Bonfire

This cantrip required quite a complex implementation.  Some highlights:

* Summon a actor (%Bonfire%) to the field,
* Modify a preexisting effect's aura to inflict cantrip scaling damage,
* Use a helper macro (Bonfire_Helper) to actually inflict the damage,
* Inflict damage (mostly) at the right times,
* Modify concentration effect to enable...
* Remove the summoned actor on a concentration break,

[*Back to Cantrips List*](#cantrips)

---

### Dancing Lights

This spell is implemented with a macro that leans on WarpGate for function.  It always summons four orbs, if less are desired, some can be manually deleted.  Some colored VFX are used.  The concentration effect is modified during the cast to delete the orbs when concentration drops.

![Dancing_Lights.gif](Dancing_Lights/Dancing_Lights.gif)

[*Back to Cantrips List*](#cantrips)

---
### Decaying Touch

Imported older implementation and updated for FoundryVTT 9.x.

[*Back to Cantrips List*](#cantrips)

---

### Druid Craft

This macro simply plays a VFX of a D12 over the casting token and spits out some text very briefly describing the spell.

![Druid_Craft.gif](Druid_Craft/Druid_Craft.gif)

[*Back to Cantrips List*](#cantrips)

---

### Eldritch Blast

Most of this spell is implemented by the configuratinn on the **Details** page. A screen shot of that configuration is included in the spells Repo data files. It is a copy of the Midi-SRD spell with scaling removed. 

It has an OnUse ItemMacro that implmenets a visual effect (VFX) by picking from a list of JB2A animations.  The animations selected are picked based on the distance between the two tokens involved in the casting. 

At higher caster levels (5+) this spell is supposed to have seperate beams that each have a to-hit roll, and I presume chance to break concentration.  I've chosen to implment this by making the spell itself not scale, the player simply needs to repeat the attack an appropriate number of times.

This spell is included in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#eldritch-blast) and works very similarly to the Magic Missle implementation with a targeting mode and then simultanous firing of bolts.  I'm less happy with that for this spell as I allow it to hit the same target multiple times possibly triggering multiple concentartion checks etc.  [RAW](https://www.dndbeyond.com/spells/eldritch-blast) states that the player should *Make a separate attack roll for each beam* which isn't what ASE is doing (I think). So I am sticking with my implmentation.

[*Back to Cantrips List*](#cantrips)

---

### Fire Bolt

Standard Fire Bolt setup plus a simple onuse ItemMacro to provide a bit of visual effects. The macro reads the item image icon and looks for a *magic* color name.  If it finds one, it adjusts the color of the VFX to match.  The colors defined are:

* blue
* dark_green
* dark_red
* green02 (a bluish green)
* green
* orange
* purple

The repo has corresponding colored icons.

**Reminder**: For NPC's cantrips need to be scaled manually as they have no level for automated scaling.

![fire-bolt](Fire_Bolt/Fire_Bolt.gif)

---

### Guided Bolt

Simple implementation using only DAE.  

[*Back to Cantrips List*](#cantrips)

---

### Infestation

Early macro cleaned up a bit and added to the GitRepo.

[*Back to Cantrips List*](#cantrips)

---

### Light

Pops a dialog that allows the target to attempt a save or accept the light effect.  If light is to be applied it is added into FoundryVTT's lighting system with an option to select a color for the light.

UPDATE 5.13.22: Now keeps track of the token ID of previous target and deletes the effect when cast again.

![Light.gif](Light/Light.gif)

[*Back to Cantrips List*](#cantrips)

---

### Mage Hand

Use warpgate to summon an actor named *magehand* to the scene and rename it for uniquness and to make ownership clear.  The new name is of the form: `Owner_Name's Magehand #`
Where # is the combat round of the summoning.

The summoner of the hand may move the token.  No effort is made to remove the hand at the end of spell duration as that is rarely an issue.

![Magehand.gif](Magehand/Magehand.gif)

[*Back to Cantrips List*](#cantrips)

---

### Melf's Acid Arrow

Transferred from older macro archive to GitRepo as part of migration to FoundryVTT 9.x.

![Acid_Arrow.gif](Melf's_Acid_Arrow/Acid_Arrow.gif)

[*Back to Cantrips List*](#cantrips)

---

### Mending

This macro simply plays a Rune VFX on the target. 

[*Back to Cantrips List*](#cantrips)

---

### Prestidigitation

This macro simply plays a VFX of a D12 over the casting token and spits out some text very briefly describing the spell.

![Prestidigitation_Video.gif](Prestidigitation/Prestidigitation_Video.gif)

[*Back to Cantrips List*](#cantrips)

---

### Shillelagh

Imported from previous work, no documentation at this time.

[*Back to Cantrips List*](#cantrips)

---

### Shocking Grasp

Implements the Cantrip using a VFX from Automated Animations and an effect from DAE.  The no reactions effect was added to CUB's condition lab.

![Shocking_Grasp.gif](Shocking_Grasp/Shocking_Grasp.gif)

[*Back to Cantrips List*](#cantrips)

---

### Thaumaturgy

This macro simply plays a Rune VFX on the caster. 

[*Back to Cantrips List*](#cantrips)

---

### Thorn Whip

Implements the Cantrip including a VFX from Automated Animations and an automated *pull* of target token using a *jez.moveToken(aToken, tToken, -2, 2500)* library call. 

![Thorn_Whip.gif](Thorn_Whip/Thorn_Whip.gif)

[*Back to Cantrips List*](#cantrips)

---

### Vicious Mockery

I added to [Crymic's Vicious Mockery](https://www.patreon.com/posts/vicious-mockery-47900003), 12/21/22 version, to make what I wanted.

My additions:

1. Rune VFX on the caster: `jez.runRuneVFX(tokenD, jez.getSpellSchool(itemD))`
2. Point to newly built table titled **Mockeries-All**
3. Built a large (571 entry) table of mockeries, see: [Vicious Mockery's README](Vicious_Mockery/README.md)
4. Added a new chat-card containing the mockery with [jez.postMessage(...)](../../jez-lib#postmessagemsgparm)
5. Finally, added a chat bubble for all clients containing the mockery text, see [World_Macro_Install.md](../../Documentation/World_Macro_Install.md) for how this was done.

I needed to modify Crymic's code just a bit to make it backward compatible with v8.9 of foundry.  The ItemMacro he used `[postActiveEffects]ItemMacro` was rewritten as `ItemMacro`  

![Thorn_Whip.gif](Vicious_Mockery/Vicious_Mockery.gif)

![Vicious_Mockery_chat.png](Vicious_Mockery/Vicious_Mockery_chat.png)

[*Back to Cantrips List*](#cantrips)

---