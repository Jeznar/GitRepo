# 2nd Level Spells
This repository will contain my automated 2nd level spells as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Darkness](#darkness) (ASE)
* [Darkvision](#darkvision)
* [Hold Person](#hold-person) (ASE)
* [Invisibility](#invisibility)
* [Knock](#knock)
* [Locate Object](#locate-object)
* [Mirror Image](#mirror-image)
* [Ray of Enfeeblement](#ray-of-enfeeblement)

[*Back to List of All Spells*](../README.md)

## Spell Notes

### Darkness

This spell is interesting as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki).

![chain-lightning](https://user-images.githubusercontent.com/32877348/137188001-c6e00842-38d4-4f99-af21-38a5744c24e9.gif)

If the darkness is cast on a token, the Token Attacher UI must be used manually to attach the darkness overhead tile to the token.  This is a bit challenging, presumably it gets easier with practice.

![Darkness_ScreenGrab.png](Darkness/Darkness_ScreenGrab.png)

Operationally, this spell is similar to [Fog Cloud](../1st_Level/#fog-cloud)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Darkvision

Places a DAE effect on the beneficiary that provides dim light vision out to 60 feet.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Hold Person

This is *simply* a Midi-QoL OverTime effect.  There is no associated macro, rather it depends on two effects coded into the DAE panels:

> flags.midi-qol.OverTime OVERRIDE turn=end,saveAbility=wis,saveDC=@attributes.spelldc,saveMagic=true,label=Hold Person
> StatusEffect OVERRIDE Convenient Effect: Paralyzed

The first of these effects causes affected token(s) to roll a wisdom saving throw against the spell dc of the caster at the end of each turn.  On success both effects are ended.

The second effect places the CUB Paralyzed effect on the token.  This effect appears and can be managed by the *normal* CUB mechanisms.

![Hold_Person/Hold_Person_DAE_Effects.png](Hold_Person/Hold_Person_DAE_Effects.png)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Invisibility

This spell requires that the user target token(s) before using it.  It will apply an effect that grants attack advantage and forces disadvantage on inbound attacks.  It drops when the affected token attacks or casts a spell.

Note: concentration does not drop when one (or more of the invisible tokens lose their invisibility as others may still be invisible.  Concentration will need to be removed manually.

![Invisibility.gif](Invisibility/Invisibility.gif)

Basically the same macro is used by [Greater Invisibility](../4th_Level#greater-invisibility)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Knock

Nothing more than a tested SRD implmentation. It works.  Nothing special.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Locate Object

Nothing more than a tested SRD implmentation. It works.  Nothing special.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Mirror Image

I am implmenting this one by using [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki). I have added no value here beyond following the instructions provided by *Vauryx*.

![](https://user-images.githubusercontent.com/32877348/142118145-9c3edf81-fa9d-4d42-b5e1-cf54f73d486d.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Ray of Enfeeblement

Fairly infrequently used spell that places a debuff on the target to reduce their str based attacks by 50%.  Interestingly, there is no save for the first round so it might be used to 
great effect against particularly strong and threating opponents.

This implementation manages an effect marker, handles the per round save, and supplies a VFX.  It does not automate the damage reduction portion.  That will take quite a bit more effort and seems an unwise time investment at this point since the spell is rarely used.

![Ray_of_Enfeeblement/Ray_of_Enfeeblement.gif](Ray_of_Enfeeblement/Ray_of_Enfeeblement.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---
