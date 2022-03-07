# Items and Things
This repo holds item macros and such.  Mostly, but perhaps, not entirely magic items.

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

---

## Contents of this Repo

Since there should eventually be a enourmous number of things in this repo, I have broken it up into subdirectories.  I'll keep all the README information in this file until and if there gets to be enough to warrent breaking them up like I have for spells.

* [Items](#items)
* [Potions](#potions)
* [Weapons](#weapons)

---

## Items

This is a generic catch all for things that don't fit into other categories.

* [Cloak of Protection](#cloak-of-protection)

---

### **Cloak of Protection**

This item simply adds a DAE passive, permanent effect to an actor who has it equipped boosting AC and saves by one.

It is implmented with a rather ugly `+1+` on the DAE effects sheet.  This seems to avoid the possibility of string concatenation which could result in something like `11d4` or `1d41` being added when a user of this item is blessed.

![Cloak_of_Protection_DAE_Effect.png](Items/Cloak_of_Protection/Cloak_of_Protection_DAE_Effect.png)

*[Back to the Contents of this Repo](#contents-of-this-repo)*

___


## Potions

Potion Items as they are created and added should be tagged into this listing.

* [Poison](#poison)

### **Poison**

This macro inflicts 3d6 of posion damage and applies a posion effect that does damage on each turn of the target (on failures).  Each round teh save may be repeated at the end of the trn. It does 3d6 the first round, then 2d6, then 1d6, then the effect terminates if still active. 

The setup of the DAE effect on the item is essential to this macro.  Of particular note, the save DC myst be the first token in te Effect Value field (see the included screen shot).

*[Back to the Contents of this Repo](#contents-of-this-repo)*

___


## Weapons

Weapon Items crafted for the game get listed here

* [Gulthias Staff](gulthias-staff)
* [Treebane](#treebane)

---

### **Gulthias Staff**

This is the implementation of a very campaign specific item (with a nasty curse).

![Gulthias_Staff_Desc.png](Weapons/Gulthias_Staff/Gulthias_Staff_Desc.png)

---

### **Treebane**

The Treebane axe macro does an extra 1d8 damage to targets that are of type *plant* on hits.  

This macro also fires off a VFX that chooses a random animation using the wildcard feature of sequencer. The VFX misses the intended target when the attack misses.

![Treebane/Treebane.gif](Weapons/Treebane/Treebane.gif)

*[Back to the Contents of this Repo](#contents-of-this-repo)*

___
