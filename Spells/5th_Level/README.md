# 5th Level Spells
This repository will contain my automated 5th level spells as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Contact Other Plane](#contact-other-plane)
* [Scrying](#scrying)

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




/Users/barrettjg/Games/DnD/Foundry_VTT/My Code Thingies/Git_Archive/Spells/5th_Level/Scrying/Scrying_Dialog.png