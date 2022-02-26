# Items
This repo holds item macros and such.  Mostly, but perhaps, not entirely magic items.

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

---

## Contents of this Repo

* **[Potion: Poison](#potion-poison)** A damage over time effect combined with application of the Poisoned condition. 
* **[Treebane](#treebane)**: An axe that does bonus damage

## Item Implementations

### **Potion: Poison**

This macro inflicts 3d6 of posion damage and applies a posion effect that does damage on each turn of the target (on failures).  Each round teh save may be repeated at the end of the trn. It does 3d6 the first round, then 2d6, then 1d6, then the effect terminates if still active. 

The setup of the DAE effect on the item is essential to this macro.  Of particular note, the save DC myst be the first token in te Effect Value field (see the included screen shot).

*[Back to the Table of Contents](#contents-of-this-repo)*

---

### **Treebane**

The Treebane axe macro does and extra 1d8 damage to targets that are of type *plant* on hits.  

This macro also fires off a VFX that chooses a random animation using the wildcard feature of sequencer. The VFX misses the intended target when the attack misses.

![Treebane/Treebane.gif](Weapons/Treebane/Treebane.gif)

*[Back to the Table of Contents](#contents-of-this-repo)*

---