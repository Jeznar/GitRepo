# 5th Level Spells
This repository will contain my automated 5th level spells as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Contact Other Plane](#contact-other-plane)
* [Scrying](#scrying)
* [Steelwind Strike](#steelwind-strike) (ASE)
# * [Wall of Force](#wall-of-force) (ASE)

[*Back to List of All Spells*](../README.md)

## Spell Notes

### Contact Other Plane

Implmented via DAE and a CUB condition without a macro.

A few key elements:

1. The spell description must contain the *magic* phrase ***no damage on save*** to cause a save to do zero damage to the caster.
1. Insane condition is added by using *macro.CUB* as an attribute in the DAE conditions.
1. Insane condition remains till completion of next long rest.

The spell description must contain the *magic* phrase ***no damage on save*** to cause a save to do zero damage to the caster.

![Contact_Other_Plane_Condition_Lab.png](Contact_Other_Plane/Contact_Other_Plane_Condition_Lab.png)

[*Back to 5th Level Spell List*](#5th-level-spells)

---

### Scrying

This implementation does a few things:

1. Checks to make sure the target is actually targeted (presumably this will usually require the GM to drag a token to the current scene just for this spell),
2. Verifies that the caster has an item named "Scrying Focus" (exact name) in inventory,
3. Pops a dialog to obtain the modifiers that should be applied to the saving throw and then automates the saving throw, 
4. Performs the saving throw,
5. Displays the result.

![Scrying/Scrying_Dialog.png](Scrying/Scrying_Dialog.png)

[*Back to 5th Level Spell List*](#5th-level-spells)

---

### Steelwind Strike

This spell looks awesome as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#steel-wind-strike).

![steelwind-strike](https://user-images.githubusercontent.com/32877348/137191296-88113589-a903-46bb-bb72-03b781f8a4b2.gif)

As it seems unlikely to be used in my current game, I have simply loaded what the module offers and gave it a super quick spin...although, perhaps a certain Vampire may prep this spell after seeing this spell in action. 

[*Back to 5th Level Spell List*](#5th-level-spells)

---

### Wall of Force

This spell looks interseting as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#wall-of-force).

![steelwind-strike](https://user-images.githubusercontent.com/32877348/151714360-7656a4bc-fcbf-4c81-8d8b-b98b2f532a03.gif)

In my testing, some manual cleanup was needed when the spell completes, but on balance, it seems like a very useful implementation.

Here are the author's points from his wiki:

* There are options for premade shapes, as well as manual placement.
* When placing the panels manually, move the mouse around to see the eligible spots you can place the next panel at.
* There are template override settings in the module settings that apply to the templates set by this spell

[*Back to 5th Level Spell List*](#5th-level-spells)

---