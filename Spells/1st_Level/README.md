# 1st Level Spells
This repository will contain my automated 1st level spells as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Detect Magic](#detect-magic)
* [Entangle](#entangle)
* [Magic Missle](#magic-missile)
* [Protection from Evil and Good](#protection-from-evil-and-good)
* [Ray of Sickness](#ray-of-sickness)
* [Sleep](#sleep)
* [Shield](#shield)
* [Tasha's Caustic Brew](#tasha-caustic-brew)

[*Back to List of All Spells*](../README.md)

---

## Spell Notes

### Detect Magic

Simple macro that places a persistent VFX attached to the caster that indicates the existance and range of the detect magic effect.  It doesn't do any type of automated highlighting.

![Caustic Brew](Detect Magic/Detect_Magic.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Entangle

Key Highlights:

1. Applied CUB effect pops a dialog that allows a skill check,
1. Modified Concentration effect that cleans up when it is removed,
2. Manages a VFX in place of targeting template.

For a first level spell, this one was a doozy.  When invoked, this macro will create a VFX in place of the targeting template.  All tokens in the area of effect will roll saves and those that fail will have the **Restrained** condition added via CUB.  The Restrained condition is then modified to add a every turn dialog that allows for a skill check to be rolled for possible escape.  The concentrating effect is also modified to add code that will release restrained tokens and remove the VFX when concentration drops.

This macro uses three files, the main entangle.js that is used as a DAE OnUse ItemMacro and two helper macros that are called as *World Macros* by the modified effects.  The helper files (entangle_helper.js and entagle_helper2.js both need to be accessible in the macros repository as script macros.  The main macro (entangle.js) should be setup as am ItemMacro.

![Entangle/Entangle.gif](Entangle/Entangle.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Magic Missle

The macro implementing this one does nothing much more than figure out how many darts were cast and generates a VFX for each dart.  

This spell is sometimes misunderstood. It allows darts to be split across targets but specifies that all impacts are simultaneous.  THat simultaneous bit implies only one concentration check per dart per target. The standard Foundry implementation scales incorrectly (the extra +1 ignores the dart count) and doesn't allow for splitting darts across targets. 

I have implemented this spell by creating a "base" spell that dumps all darts into a single target and another that has a hard coded dart count ( a serious user of this spell may want multiple hard coded versions).  Either can be upcast.  If darts are being split, the hard coded version should be used once versus each target with only one of them deducting a spell slot. 

![Magic Missile](Magic Missile/Magic_Missile.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Protection from Evil and Good

This spell places a VFX on the recipient, who must be targeted before the spell is cast, giving a visual reminder that it is in place.  It does not automate the benefits, so they must be handled manually.

![Pro_Evil_Good_Video.gif](Protection_from_Evil_and_Good/Pro_Evil_Good_Video.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Ray of Sickness

This is closely based on Crymic's macro with the addition of a VFX and a message about the Poisoned effect including a link to the journal entry giving the details of the effect.

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Shield

Macro adds a DAE effect that boosts AC by 5 until the beginning of the actor's next round. This spell is configured to use reactions. It plays a VFX while active.

![Shield.gif](Shield/Shield.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Sleep

Applies sleep effect to targets in area considering various immunities and working with the hit point pools as described in RAW. A fairly nice VFX sequence is triggered on the target template.

The macro is derived from several found online.  More in the comments of the javascript file.

![Sleep.gif](Sleep/Sleep.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Tasha Caustic Brew

Creates an AOE effect that can apply a DoT effect to the targets.  Targets have an option to clean the debuff or take damage each turn.

This implementation ignores the ability to remove the debuff from nearby friendlies, that will need to be handled manually.

The macro underlying this was written by Crymic.  I've only added a bit of documention. 

![Caustic Brew](Tasha's Caustic Brew/Caustic_Brew_Vid.mov)

[*Back to 1st Level Spell List*](#1st-level-spells)

---
