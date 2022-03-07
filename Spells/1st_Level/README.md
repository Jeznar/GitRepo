# 1st Level Spells
This repository will contain my automated 1st level spells as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Bless](#bless)
* [Detect Magic](#detect-magic)
* [Entangle](#entangle)
* [Fog Cloud](#fog-cloud) (ASE)
* [Magic Missle](#magic-missile) (ASE)
* [Protection from Evil and Good](#protection-from-evil-and-good)
* [Ray of Sickness](#ray-of-sickness)
* [Sleep](#sleep)
* [Shield](#shield)
* [Tasha's Caustic Brew](#tasha-caustic-brew)
* [Witch Bolt](#witch-bolt) (ASE)

[*Back to List of All Spells*](../README.md)

---

## Spell Notes

### Bless

This spell is implemented without a macro.  

The VFX is done with [Automated Animations](https://github.com/otigon/automated-jb2a-animations), I think I just kept the default setting for this mod.

The modifier, adding a d4 to many rolls is done with DAE.  It runs into an interesting *feature* where sometimes that 1d4 is string concatenated to other modifiers resulting in something like `11d4` instead of `1+1d4` or `+1d42` instead of `+1d4+2` being processed.  The *fix* for this appears to be wrapping the 1d4 with plus signs.  As shown in the PNG of DAE settings embedded below.

![Bless/Bless_DAE_Effects.png](Bless/Bless_DAE_Effects.png)

This does result in bit of ugly in the chat log, but at least it is correct mathematically.

![Bless/Bless_Chat.png](Bless/Bless_Chat.png)

This is a known issue with DAE, [Active effects concatenated with global bonus in special traits](https://gitlab.com/foundrynet/dnd5e/-/issues/1134).

![Bless](Bless/Bless.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Detect Magic

Simple macro that places a persistent VFX attached to the caster that indicates the existance and range of the detect magic effect.  It doesn't do any type of automated highlighting.

![Caustic Brew](Detect Magic/Detect_Magic.gif)

[*Back to 1st Level Spell List*](#1st-level-spells)

This spell is included in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#detect-magic) and it is rather awesome.  Unfortunately, it assumes all detectable things will be tagged which is too much effort for me, so I am sticking with my simplier visual only build.

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

### Fog Cloud

This spell is interesting as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#fog-cloud).  I have kept it as provided.

It uses a fog graphic and places walls to clock vision. 

![fog-cloud](https://user-images.githubusercontent.com/32877348/137189518-fbc8a6c7-a766-49cf-83cd-702562b3a8bd.gif)

As this spell is not normally attachable to an object it is a bit simpilier than its close cousin, [Darkness]
(../2nd_Level/#darkness)). 

I have kept my originial implementation in the repository in a subdirectory of this spell.

[*Back to 1st Level Spell List*](#1st-level-spells)

---

### Magic Missle

I just tossed my original implementaton in favor of the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#magic-missile)

This implmentation requires that all darts be targeted and then fires them all off in parallel.  This is correct per RAW and just a bit awesome.  

![Magic Missile](Magic_Missile/Magic_Missle.gif)

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

### Witch Bolt

This spell is amazing as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#witch-bolt).  I have kept it as provided.

![witch-bolt](https://user-images.githubusercontent.com/32877348/138227063-f86d210f-89c4-4fd1-8e9e-80470326529d.gif)

Here are notes from the author's Wiki:

* The continuous stream will break and the spell will end if the caster and target are more than 30ft away.
* Each turn, only the owner of the caster will get a prompt to activate the witch bolt. This will be the GM for NPC tokens, and only players for player owned tokens.

[*Back to 1st Level Spell List*](#1st-level-spells)

---