# Creature Features


Creature Abilities that aren't exactly spells, but they may be close.

I'll try to document functions as I add them to the repository. 

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

## Abilities in this Repo

* **[Angelic Weapons](#angelic-weapons)** -- Bonus damage on all weapon hits.
* **[Aura of Annihilation](#aura-of-anhillation)** -- Bodak's aura.
* **[Beyond Death](#beyond-death)** -- Ability to restore 1HP when dropped to zero
* **[Blessing of the Mother Night](#blessing-of-the-mother-night)** -- Baba Lysaga ability
* **[Brown Mold Freezing Wave](#brown-mold-freezing-wave)** -- Environmental damage component of Brown Mold.
* **[Change Shape, Deva](#change-shape-deva)** -- **[The Abbot's](https://www.dndbeyond.com/monsters/the-abbot)** shape change ability.
* **[Chilling Gaze](#chilling-gaze)** -- Abominable Yeti's gaze attack
* **[Charge, Sangzor](#charge-sangzor)** -- Implement Sangzor's charge
* **[Claw Quasit](#claw-quasit)** -- Quasit attack that forces a save or poisoned with followup save each turn
* **[Clay Golem Haste](#clay-golem-haste)** -- Applies a DAE Effect
* **[Clay Golem Slam](#clay-golem-slam)** -- Reduces targets hit points by amount of damage inflicted
* **[Cold Breath (Yeti)](#cold-breath-yeti)** -- Yeti's cold breath cone attack
* **[Consuming Bite](#consuming-bite)** -- Ilya's ability per MandyMod in her Kresk extension.
* **[Constrict](#constrict)** -- Vine Blight's Constrict ability.
* **[Coven Casting](#coven-casting)** -- Night Hag's shared Casting
* **[Create Specter](#create-specter)** -- Wraith's ability to convert corpse to a specter
* **[Crocodile Bite](#crocodile-bite)** -- Crocodile bite and grapple possibility
* **[Death Gaze](#death-gaze)** -- Bodak's ability, not quite RAW
* **[Death Throes](#death-throes)** -- PBAOE damage from the death of a Gauth
* **[Disrupt Life, Lich](#disrupt-life-lich)** -- Lich PBAOE ability to damage all non-undeads
* **[Etherealness](#ethrealness)** -- Transitions a token to ethereal realm (sort of).
* **[Fading Image](#fading-image)** -- Applies a turn-end dot to the possessor.
* **[Falling](#falling)** -- Applies 1d6 (by default) damage and the CUB Prone condition
* **[Fear of Fire](#fear-of-fire)** -- Fear of fire ability (Abominable Yeti)
* **[Frightening Gaze](#frightening-gaze)** -- One of a Lich's legendary actions
* **[Gauth Eye Rays](#gauth-eye-rays)** -- Gauth's Eye Beam ability
* **[Glaaar-Pat](#glaar-pat)** -- Bullywug Croaker ability
* **[Grasping Root](#grasping-root)** -- Tree Blight's (aka Wintersplinter) grasping root ability.
* **[Gray Ooze](#gray-ooze)** -- Gray Ooze Abilities
* **[Healing Touch](#healing-touch)** -- The Abbot's lay on hands like ability
* **[Horrifying Visage](#horrifying-visage)** -- Banshee's visage can terrify creatures that can see it and are within 60 feet.
* **[Howling Babble](#howling-babble)** -- Allip's special attack.
* **[Imp Shape Change](#imp-shape-change)** -- Imp's ability to change form and speed
* **Knock Down** -- Implements a dog/wolf's bite and knock down
* **[Life Drain](#life-drain)** -- Wraith's Life Drain Ability
* **[Maddening Touch](#maddening-touch)** -- Allip's main melee attack.
* **[Maddening Feast](#maddening-feast)** -- Implements Bheur Hag's ability
* **[Magic Resistance](#magic-resistance)** -- Grants advantage on saves vs magic
* **[Nightmare Haunting](#nightmare-haunting)** -- Nighthag's haunting ability.
* **[Paralyzing Touch](#paralyzing-touch)** -- A Lich's primary attack
* **[Pit](#pit)** -- Abilities for use by the pit *monster*
* **[Quasit Shape Change](#quasit-shape-change)** -- Quasit's ability to change form and speed
* **[Ravenous Tenacity](#ravenous-tenacity)** -- Ilya's ability per MandyMod in her Kresk extension.
* **[Retched Spittle](#retched-spittle)** -- Ilya's ability per MandyMod in her Kresk extension.
* **[Rooooo-glog](#Rooooo-glog)** -- Bullywug Croaker ability
* **[Scare Quasit](#scare-quasit)** -- Quasit special attack that forces a save or frightened with followup save each turn
* **[Shapechange, Baba Lysaga](#shapechange-baba-lysaga)** -- Simply states the ability
* **[Slow, Golem](#slow-golem)** -- Golem slow ability mimicing the spell effect
* **[Spore Cloud](#spore-cloud)** -- The damage effect of Yellow Mold
* **[Summon Demons, Vrock](#summon-demons-vrock)** -- Implment Vrock's summon
* **[Summon Swarm of Insects](#summon-swarm-of-insects)** -- Calls for 1d4 Swarms of Insects
* **[Standing Stone Lightning Strike](#standing-stone-lightning-strike)** -- Ability to use from journal to implement an effect on Yester Hill.
* **[Stench](#stench)** Ghast's Stench effect
* **[Stunning Screech](#stunning-screech)** -- Implements the Vrock's surprisingly complex ability
* **Portent (Arabelle)** -- Portent slightly modified for Arabelle
* **[Threat Display](#threat-display)** -- Potential Frightened Application
* **[Trampling Charge](#trampling-charge)** -- Equine charge / knockdown
* **[Undead Fortitude](#undead-fortitude)** -- Certain undead's (e.g. Zombie) ability to deny death  
* **[Undead Slayer](#undead-slayer)** -- Adds an extra 3d6 of damage to weapon attacks vs undead
* **[Wail](#wail)** -- Banshee's wail that can drop things in their tracks.
* **[Whispers of Madness](#whispers-of-madness)** -- Allip's ability
* **[Vampire Abilities](#vampire-abilities)** -- A number of vampire specific abilities.
* **[Wooden Sword](#wooden-sword)** -- Arabelle's wooden sword debuffing machine.

## Additional Notes on Functions

### **Angelic Weapons**

This ability requires only a bit of DAE configuration to add 4d8 Radiant damage to all MWAK and RWAK actions for an actor.  It does not add the magical characteristic, I don't know how to do that easily, so I am leaving it for manual twiddling in the (presumably) rare situations where it would matter.  

![Angelic_Weapons/Angelic_Weapons_DAE.png](Angelic_Weapons/Angelic_Weapons_DAE.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Aura of Anhillation**

Support thevBodak's damage aura which is defined as follows:

Bodak can activate or deactivate this feature as a bonus action. While active, the aura 
deals 5 necrotic damage to any creature that ends its turn within 30 feet of Bodak.
Undead and fiends ignore this effect.

This macro does a bunch of things.

* **OnUse**: Toggles the effect on/off. When it toggles on, it places an effect that includes an Active Effect that drives the rest of the process.  
* **doOn**: At one point deleted the effect on immune tokens, but this caused an issue with the effect being applied/removed in an infinite loop by active auras, so it now does nothing.
* **doOff**: If the active token is the origin, remove the persistent VFX
* **each**: Apply damage to those not immune along with a VFX.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Beyond Death**

This macro does a couple of things:

* Set current health to one if it was zero, 
* Run a simple VFX via [Automated Animations](https://github.com/otigon/automated-jb2a-animations),
* Decrement a usage count (allowed to be used twice).

Limitations:

* It does not check to see if the hit that reduced to zero was a critical 
* It does not automatically fire (manually invoked)
* It decrements the usage count even if it has no effect.

I've let the limitations stand as this is a *corner case* ability, only on one minor actor in my game.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Blessing of the Mother Night**

Simple ability, only needs a description set.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Brown Mold Freezing Wave**

This macro allows the damage component of Brown Mold's effects to be executed from a macro.  This one expects to be located in a journal article or the hot bar not to be used as an ItemMacro.  Description of Brown Mold can be found on DnDBeyond: [Brown Mold](https://www.dndbeyond.com/sources/dmg/adventure-environments#BrownMold).

To use this macro, select (not target, just select) the token to be affected and run the macro.  It should do everything from there including:

* VFX
* Saving Throw
* Damage Calulation and Application
* Post a Results Message. 

![Freezing_Wave.gif](Brown_Mold_Freezing_Wave/Freezing_Wave.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Change Shape, Deva**

The Abbot's ability to **change shape** from Curse of Strahd..

Essentially just the Druid Wild Shape ability reskinned.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Chilling Gaze**

Abominable Yeti's gaze attack that targets one token, forces a saving throw and inflicts damage and a paralyzed effect (via a Convienent Effect) that lasts for up to 1 minute.  The afflicted can make a save at the end of each of its turns that is implemented with a Midi OverTime invocation.

<details> <summary>DAE Effects Settings</summary>

![Chilling_Gaze_DAE_Effects.png](Chilling_Gaze/Chilling_Gaze_DAE_Effects.png)

Overtime effect value:

~~~javascript
turn=end,
label=Save against Yeti's Chilling Gaze,
saveDC=@attributes.spelldc,
saveAbility=con,
saveRemove=true,
saveMagic=true,
rollType=save
~~~
</details>

TODO: This item could be extended to automatically handle the immunity element that applies after effect removal.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Charge, Sangzor**

Sangor's charge that applies a CUB effect via DAE on a failed save in addition to the damage component.

![Charge_Details.png](Charge_Sangzor/Charge_Details.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Claw Quasit**

Implements a Quasit's claw with poison damage that places a one minute debuff that allows a save at the end of each turn.  This is accomplished with proper DAE configuration, no macro is needed.  

<details> <summary>The secret sauce is the OverTime effect that includes the following configuration.</summary>

The following is placed in the **Effect Value** field of a **flags.midi-qol.OverTime** entry set to **Override**.

~~~javascript
turn=end,
label=Save against Quasit's Poison,
saveDC=@attributes.spelldc,
saveAbility=con,
saveRemove=true,
saveMagic=true,
rollType=save
~~~
</details>

Configuration fields are included below.

<details> <summary>Configuration of basic item.</summary>

The damage and save elements must be set correctly.

![Claw_Quasit_Config.png](Claw_Quasit/Claw_Quasit_Config.png)

</details>

<details> <summary>DAE Duration configuration.</summary>

The duration needs to be set.

![Claw_Quasit_DAE_Duration.png](Claw_Quasit/Claw_Quasit_DAE_Duration.png)

</details>

<details> <summary>DAE Effect configuration.</summary>

The effect needs to be set, the magic is in that overtime coding.

![Claw_Quasit_DAE_Effects.png](Claw_Quasit/Claw_Quasit_DAE_Effects.png)

</details>

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Clay Golem Haste**

Simple macro that applies a DAE effect to implement Golem's haste ability.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Clay Golem Slam**

Simple macro that applies a DAE effect to reduce target's max hit points by same amount as damage inflicted.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Cold Breath (Yeti)**

No macro used, just configuration.  The VFX is implemented using automated animations in the same manner as the Cone of Cold spell. 

This ability is charged, refreshing on a roll of 6 and is working as of this writting.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Constrict**

Implements Vine Blight's ability to attack and automatically initiate a grapple of targets size large or smaller.

Cool Things in this macro (e.g. first time things for me):

1. Journal Entries are looked up by name and added to various chat cards generated.
2. The paired effects (Grappled and Grappling) are both removed if either is removed.
3. Information to enable paired removal passed as parameters to itemMacro.

It has a minor JB2A effect, not super appropriate, but it is something.

![Constrict_Chatcard.png](Constrict/Constrict_Chatcard.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Coven Casting**

This is a bit of a kludge solution...An extra *actor* named Coven has been added to my Actor's Directory that has the Coven Casting feature (which is nothing more than a spell description) with stats set to generate the RAW spell to hit and saving throws.  This synthetic creature has all of the spells it should and has the spell slots set.

The idea is add one (or more) of these to handle the special shared spell pool.  Concentration has to be handled carefully, but generally this synthetic character should never be targetted directly, rather the GM can bop it with damage for a concentration check when the actual hag is hit.

Its not an ideal solution, but this feels practical to me.

![Coven_Casting/Coven.png](Coven_Casting/Coven.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Consuming Bite**

This one implments one of Ilya Kreskov's ability as defined by MandyMod in her [Fleshing Out Curse of Strahd: Kresk](https://www.reddit.com/r/CurseofStrahd/comments/8w8488/fleshing_out_curse_of_strahd_kresk/) post on Reddit. 

This troublemaker can bite someone doing some damage and self healing **AND** creating a 30 foot radius fear effect.  The macro implements all elements of Mandy's write up including an immunity effect that occurs on save or fear expiration. 

It checks for LoS blockage by walls, as well as blinded, but nothing ore sophisticated on the "can see" bit of this ability.

![Consuming_Bite_Screen_Grab.png](Consuming_Bite/Consuming_Bite_Screen_Grab.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Create Specter**

Perform several checks before using WarpGate to bring in a Specter which will have a customized name marking as belong to summoning wrath (I'm assuming that wraiths have unique names).  No check is made to prevent multiple summonings from the same corpse.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Crocodile Bite**

Import of older macro.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Death Gaze**

Bodak's Death gaze, implemented as an explicit bonus action for the Bodak rather than as a start-of-turn effect for each token in range.

1. Generate a list of tokens that are with 30 feet that can see the the source token
2. Pop message reminding of the option to be voluntarily blinded with option to bail out
3. Roll saves for each affected, keeping track of failures and superFailures and play VFX on targets
4. Inflict damage to failures
5. Inflict damage to superfailures

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Death Throes**

Macro targets tokens in range (as defined by the item card), runs a VFX, and then allows the item card to handle damage in the normal way.

The interesting element of this item is that it runs **Called before the item is rolled (*)** and sets the targets that are subsequently used by the item card.  This is a new technique for me.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Disrupt Life, Lich**

Item runs an ItemMacro that finds all in-range tokens, discards those of type *undead*, and rolls a save for each.  Those that save take half damage.  Those that fail take full damage.  

TODO: Suppress the roll messages and attack list in the chat log.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Ethrealness**

This macro runs a VFX on the targeted token and flips the hidden status too true when it is run.  When the effect it applies is removed it runs the VFX in reverse and flips the hidden status to false.  

![Etherealness/Etherealness_Desc.gif](Etherealness/Etherealness_Desc.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Fading Image**

This feature applies a turn-end DoT via MidiQoL OverTime to a creature that has the ability, while they are in combat. I am using to represent a fading of *reality* for the mirror fight in MandyMod's Fidatov manor.  

The key element of this spell is the overtime effect that is defined as follows:

~~~javascript
flags.midi-qol.OverTime CUSTOM turn=end,label=Fading Image,damageRoll=1d6,damageType=psychic
~~~


*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Falling**

This item applies a d6 of damage and the prone condition.  It should be adjusted to make the number of dice *correct* for different height falls.

![Falling_Description.png](Falling/Falling_Description.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Fear of Fire**

Ability that when clicked applies a debuff that lasts until the end of the user's next turn that causes all actions to occur at disadvantage. This needs to be applied manually by fire this ability the first time fire damage is received (it can be repeated as desired but has no further effect if the debuff is already in place).

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Frightening Gaze**

One of a Lich's legendary actions.  It includes an effect that is only applied on a failed saving throw and that allows end of turn saves to terminate that effect.  This is done with a MIDI OverTime effect as follows:

~~~javascript
turn=end,label=Save against Lich's Fright,saveDC=18,saveAbility=wis,saveRemove=true,saveMagic=true,rollType=save
~~~

This item also applies the CUB Condition: Paralyzed via a DAE effect.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Gauth Eye Rays**

Implements Gauth Eye Rays using library function jez.fireRay() call.

This is a rather complex macro, with lots of possible results.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Glaaar-Pat**

Bullywug Croaker ability

Mimicking Maddening Feast, this macro is intended to be 'Called before the item is rolled' it:

1. Builds a list of in range targets
2. Presents that list in a dialog for the user to specify the actual targets
3. Sets the targets in accordance with the above
4. Terminates to allow the Item card configuration to perform the actual damage & apply effect

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Grasping Root**

This ability automates Wintersplinter (Tree Blight)'s grasping root.  It does the following:

1. Verify that one target has been hit
1. Summon a new token *Grasping Root* at location of the target
1. Rename the summoned root for uniqueness
1. Initiate a grapple between the root and target by placing appropriate paired debuffs
1. Setup a DoT on the target
1. Post appropriate summary information 

The summoned *Grasping Root* is taken from the *Actors Directory* with several key attributes set:

* 20 Strength - for the +5 to grapple on average matching RAW's DC15,
* 1 Hit Point - Combined with 5 points of damage reduction implments the single hit feature,
* 15 Armor Class - As defined in RAW,
* 0 ft of Movement - Root is supposed to be immoble.
* Immune to the following damage types: Bludgeoning, Force, Necrotic, Piercing, Psychic, Radiant,Thunder, Poison, and Healing.

If either the grappled or grappling effect is removed, the paired effect will be automatically removed.

**Note:** The grapple does not automatically drop when the root dies.  It should be removed manually.

![Grasping_Roots_Summoned_Creature.png](Grasping_Root/Grasping_Roots_Summoned_Creature.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Gray Ooze**

The Gray Ooze has a set of unique abilities.  Here is what is implemented:

1. Gray Ooze Pseudopod -- A conventional melee attack that applies a penalty to AC if it hits metal armor.  That's a bit beyond my ability to implement, so it just used the [DisplayDescription](../Utility_Macros#displaydescription) macro to echo the item's description to the chat card for the players to handle manually.
2. Gray Ooze Corrode Metal -- This ability needs to be handled manually as noted in the description.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Healing Touch**

The Abbot's lay on hands ability. To use it, target a token and fire it off.  It will heal for up to the defined anmount and then try to remove the CUB conditions: *Diseased*, *Poisoned*, *Blinded*, and *Deafened*.  It will also try to remove the *Cursed* condition, though that is very much a shot in the dark.  

The GM may well need to manually cleanup other lingering effects that can be cured by this ability but do not meet the narrow list of effects that are automatically removed. 

![Healing_Touch/Healing_Touch.gif](Healing_Touch/Healing_Touch.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Horrifying Visage**

I rather skipped documenting this as I wrote it, so, well...

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

This ability requires nothing more than being a feature name "Magic Resistance." Midi-QoL apparently treats this as a magic cookie and will roll saves vs magic for a creature that has this feature with advantage.

![Magic_Resistance/Magic_Resistance_Desc.png](Magic_Resistance/Magic_Resistance_Desc.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Howling Babble**

Special magic attack of the **[Allip](https://www.dndbeyond.com/monsters/93770-allip)** undead critter. It affects all creatures that can hear the cast within 30 feet.  The associated ItemMacro pops a dialog that allows for selection of all the tokens to be affected after eliminating any undead or constructs (they are immune). 

![Howling_Babble.gif](Howling_Babble/Howling_Babble.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Imp Shape Shift**

Automates the swapping of an Imp's token image to one of the allowed types.  This macro assumes that the allowed types are present in the same directory that contains the image of the imp used by the token and are named exactly:

* Imp, 
* Raven,
* Rat, 
* Spider.

All of the alternative images must have the same file extension as the base Imp file.

Movement of the ability are set per the RAW definition.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Life Drain**

The Wraith's life drain has an additional effect reducing the targets max hp on a failed save.  This item applies a DAE effect that implements this including being cleared by a long rest.  

The interesting element of this item is in the value of that DAE effect. The value is an "@parm" which is provided by DAE at time of execution.  In this case: `-@data.flags.dae.damageApplied` does the trick for me.

It does generate a warning on the console: `@data.key is deprecated, use @key instead -@data.flags.dae.damageApplied`

I tried using `-@flags.dae.damageApplied` but that ended up generating a zero which is wrong, so the warning remains for now.

![Life_Drain_DAE_Effects.png](Life_Drain/Life_Drain_DAE_Effects.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Maddening Feast**

This one includes a macro that has the user select targets from a dialog and then sets them before allowing the item card to complete.  
This is my second item that it runs **Called before the item is rolled (*)** and sets the targets that are subsequently used by the item card.  

Macro includes a check *args[0].macroPass !== "preItemRoll"* to assure the correct configuration.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Maddening Touch**

Basic melee attack for the **[Allip](https://www.dndbeyond.com/monsters/93770-allip)** undead critter.  Only *interesting* aspect is the use of Automated Animations to show an appropriate effect. 

![Maddening_Touch.gif](Maddening_Touch/Maddening_Touch.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Nightmare Haunting**

This one implments the Nighthag haunting ability.  It relies on the GM to run it at the appropriate time, it does nothing to manage requirements of application.

What it does do is run a VFX and add a persistent debuff that reduces the maximum hit points.  The GM will likely want to remove the duration element of the effect so that it becomes *permanent*, well until explicitly removed which is allowed by Greater Restoration and similar abilities.  This should be done manually by the GM.

![Nightmare_Haunting/Nightmare_Haunting.gif](Nightmare_Haunting/Nightmare_Haunting.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Paralyzing Touch**

A Lich's primary attack.  It includes an effect that is only applied on a failed saving throw and that allows end of turn saves to terminate that effect.  This is done with a MIDI OverTime effect as follows:

~~~javascript
turn=end,label=Save against Lich's Paralysis,saveDC=18,saveAbility=con,saveRemove=true,saveMagic=true,rollType=save
~~~

This item also applies the CUB Condition: Paralyzed via a DAE effect.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Pit**

Abilities to automate damage from a spiked pit and a poisoned spike pit.  Damage amounts may need to be adjusted for circumstances. 

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Quasit Shape Shift**

Automates the swapping of an Quasit's token image to one of the allowed types, very much like the Imp Shape Shift.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Ravenous Tenacity**

This one implments one of Ilya Kreskov's ability as defined by MandyMod in her [Fleshing Out Curse of Strahd: Kresk](https://www.reddit.com/r/CurseofStrahd/comments/8w8488/fleshing_out_curse_of_strahd_kresk/) post on Reddit. 

Ilya has advantage on all DEX and WIS saves.  This requires only a bit of DAE setup, no macro at all. DAE needs the following effects turned on:

* flags.midi-qol.advantage.ability.save.dex
* flags.midi-qol.advantage.ability.save.wis

I've added screen shots of the pages where I added config info for this ability.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Retched Spittle**

This one implments one of Ilya Kreskov's ability as defined by MandyMod in her [Fleshing Out Curse of Strahd: Kresk](https://www.reddit.com/r/CurseofStrahd/comments/8w8488/fleshing_out_curse_of_strahd_kresk/) post on Reddit. 

Here's the decription of the ability:

> Launch a glob of rancid spittle at a point within 60 feet. Each creature within a
> 10-foot radius of that point must succeed on a DC 13 Constitution saving throw or take
> 14 (4d6) poison damage and be poisoned for 1 minute.
>  
> On a success, a target takes only half damage and is not poisoned. At the end of each 
> of its turns, a target may attempt another saving throw, ending the poisoned condition 
> early on a success.

This ability has the user place a targeting, makes con checks for those in the area of effect (not necessarily DC13, it is calculated, so different stats and CR can change it). It also uses DAE's on each to make saving throws at appropriate times for those poisoned. 


*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Rooooo-glog**

Bullywug Croaker ability

Similar, but different from Glaaar-Pat, this macro runs as a normal "OnUse" macro (after effects), it ignores any preselected targets, in fact, it clears them, for clarity.

1. Builds a list of in range targets
2. Exclude non "bullywug" subtype tokens
3. Roll 4d4 for healing (This is a homebrew change)
4. Grant the remaining targets temp hit points
5. Play a randomly delayed VFX on the targets

This takes advantage of midi's ability to grant temphp taking into account the existing if any temphp to an array of tokens (that's pretty cool). Also runs VFX on an array of tokens.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Scare Quasit**

Implements a Quasit's scare ability that places a one minute debuff that allows a save at the end of each turn.  This is accomplished with proper DAE configuration, no macro is needed.  It is very similar to **[Claw Quasit](#claw_quasit)**, see that ability for additional documentation.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Shapechange, Baba Lysaga**

Simple configuration of the ability with reminder to use the drop to shift feature of FoundryVTT.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Slow, Golem**

This is an implementation of the Slow Spell for Golems (Stone and Amber).  The effects are set to match the spell not the Stone Golem's RAW description that missed some elements that just feel like they should have been included.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Spore Cloud**

An ability for the Yellow Mold *dungeon haard* that:

> Cloud of spores that fills a 10-foot cube originating from the mold. Any creature in the area must succeed on a DC 15  Constitution Save or take 11 (2d10)  Poison Damage and become  Poisoned for 1 minute. No damage on save.
> 
> While poisoned in this way, the creature takes 5 (1d10)   Poison Damage  at the start of each of its turns. The creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a successful save.

This is implemented with three DAE effects and an automated animation line (shown in repo files).  The DAE effects are:

~~~
flags.midi-qol.OverTime OVERIDE turn=start,label=Poison DoT,damageRoll=1d10,damageType=poison
macro.CUB CUSTOM Poisoned
flags.midi-qol.OverTime OVERIDE turn=end,label=Poison Save,saveDC=15,saveAbility=con
~~~

No macro required.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Summon Demons, Vrock**

Summons per the Vrock ability. This item uses an ItemMacro to:

1. Run a runeVFX on the summoner
2. Determine if the summon will work (30% chance)
3. Ask if a Vrock or some Dretches should be summoned
4. Walk player through placing the summons
5. Place a watch dog effect on the caster that dismisses the summons when it drops.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Summon Swarm of Insects**

This implements **Baba Lysaga**'s ability to call forth 1d4 swarms of insects.  This is implemented with warpgate and does a couple of interesting things:

1. It adds a suffix number on the end of each summoned swarm
2. It plays a pre and post VFX for each summon. 

![Summon_Swarms.gif](Summon_Swarms_of_Insects/Summon_Swarms.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Standing Stone Lightning Strike**

This one is intended to be run from the hot bar or more likely from a journal article outlining the standing stones at Yester Hill.

It (maybe) zaps the one and only selected token for a bunch of lightning damage.  The chance of zapping is set in a constant in the macro that can be easily adjusted.   

I wanted to use  MidiQOL.applyTokenDamage() for this, but I couldn't get it to actually apply damage to the token.  Discussions on discord suggested a possible bug in Midi, so I implemented the damage more directly.  This macro does consider damage immunity/resistance/vulnerability to lightning.  Not quite up to Midi's usual checking, but seemingly more than good enough for a one off ability. 

Damage is announced with a simple chat card like the following:

![Wail_Chat_Card.png](Standing_Stone_Lightning/Standing_Stone_Strike_Chat.png)

![Standing_Stone_Lightning/Standing_Stone_Strike.gif](Standing_Stone_Lightning/Standing_Stone_Strike.gif)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Stench**

Implements a Ghast's stench effect.

The macro is intended to be used as an ItemMacro invoked from an ability that triggers the appropriate saving throw.  It depends on that saving throw result and having a single token targeted. It does:

1. Runs a VFX on the originator,
2. Check to see if the target is immune, if so post message and return,
3. If the target failed save, apply a 1 turn POISONED effect from existing CE effect,
4. If the target saved, apply a 24 hour immunity effect,
5. Post results.

This was originally going-to be an aura, but I couldn't noodle out how to make it apply to each adjacent creature at the start of the creature's turn, so I implemented it as an active ability to be used as needed.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Stunning Screech**

This implements the Vrock's stunning speech.  It is rather complex,

1. Obtain the range of the effect from the item card, defaulting to 25 to allow for the size of the token.
2. Play a VFX on the area affected
3. Obtain a list of all the tokens that are in range, have an unobstructed Line of Sound, and do not have the deafened condition on them.
4. Prune out tokens that represent demons based on race (PC) and subtype (NPC)
5. Quietly roll saving throws for potential victims keeping lists of successes and failures
6. If any actor failed, build a Stunned condition that will be applied 
7. Apply Stunned condition built in previous step to all those that failed saving throws
8. Post a summary message of the effects

This one uses the information stored in CE's Stunned effect to build a custom effect.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Stunning Screech**

This is a homebrew freature I cooked up for Galahad (others might know him as Lancelot), a GSD my party of Travelers in Barovia befriended in Durst Manor. Following is my description of the ability:

> As a bonus action, force a creature within 15 feet make a wisdom saving throw vs Caster DC or become  Frightened until the end of the creature's next turn. The targeted creature must hear the treat for it to be effective.
> 
> If the target is smaller, the save is made with diadvantage.  If the target is two categories larger, it has advantage.  If it is three or more larger, it is immune.
> 
> Creatures affected by the unwavering loyalty trait automatically succed on this saving throw. Once a creature has saved against this effect it is immune for the combat.

The macro manages immunities cause by saves, checks size differences, performs the appropriate save. Finally, it places the appropriate effect on the target.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Threat Display**

Item that performs a WIS save on the target placing a Frightened condition for 1 turn on failures. If the actor is larger than the target it has advantage.  If it is 2 size categories smaller it has disadvantage.  If it is 3 or more smaller it auto-fails.

The frightened creature will speak a short phrase expressing its far taken from the table named in the *PHRASE_TABLE* constant in the code.  This is currently set to **Frightened_by_Dog**, which should exist as a table in the running world, if it doesn't a warning is issued and a default is used. 

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Trampling Charge**

Import from older work and update for FoundryVTT 9.x.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Undead Fortitude**

This ability is implemented through one of the ***annoying magic item names***, that is having a feature named **Undead Fortitude** causes the automation of this ability to trigger. 

The RAW ability for zombie describes this feature like this:

> If damage reduces the zombie to 0 hit points, it must make a Constitution saving throw with a DC of 5 + the damage taken, unless the damage is radiant or from a critical hit. On a success, the zombie drops to 1 hit point instead.

The [D&D 5E Helpers](https://foundryvtt.com/packages/dnd5e-helpers) module provides support for this ability and is discussed on [Reddit HERE](https://www.reddit.com/r/FoundryVTT/comments/nnd3pc/dd_5e_automating_zombies_undead_fortitude/). Here are the salient points from that thread:

#### D&D 5E Helpers Effects & Settings

* Automatically checks actors with the **Undead Fortitude** feature
* When they are reduced to 0hp it will prompt the GM to choose the type of damage that was applied
* Then prompts the GM for a Con save for that actor, and will auto heal the NPC if the roll beats the save needed

There are two settings for levels of checks:

* Quick saves will just measure the change in hp and will not measure "overkill"
* Advanced saves will query the GM for the amount of damage taken as a more complex system (I use this version)

![D_5E_Helper_Settings.png](Undead_Fortitude/D&D_5E_Helper_Settings.png)

![Undead-Fortitude.gif](Undead_Fortitude/Undead-Fortitude.gif)

![Undead_Fortitude_Chat.png](Undead_Fortitude/Undead_Fortitude_Chat.png)


*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Wail**

This ability (typically on a Banshee) hits like, well, harder than a Mac Truck. It is an AoE effect that drops targets that fail their saves to zero HP and a nominal amount to those that save.

Creatures that can't hear the **Wail** are supposed to be unaffected.  That's something I find unacceptably difficult to automate, so I'll fix those issues as they occur.  

Since I may need to do some manual fixing after the spell, I setup the chat log to show the amount of damage done to each target, making such fixes fairly easy.  

![Wail_Chat_Card.png](Wail/Wail_Chat_Card.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### Vampire Abilities

A number of abilities imported from older work.  Including:

- **Regeneration**: A now obsolete macro that implements regeneration is a painful manner.  This is now done with the D&D 5E helper module. 
- **Set No Regen**: Applies a one turn effect that works in concert with D&D 5E helper module to prevent regen for one turn. 
- **Vampire Bite**: Returns part of the necrotic damage from the bite as healing to the Vamp.
- **Vampire Charm**: Obsolete macro, now implemented entirely via DAE configuration.
- **Vampire Claw**: Inflict damage and grappling.
- **Regeneration, Vampire Initialize**: Define a hooked function that applies effect when vampire is hit with radiant damage.

**Regeneration, Vampire Initialize** also has a do nothing **Effect Macro** that fires at the start of the actor's turn.  It contains some code that is commented out but that could be used to implement a regen effect which may be useful since DnD5e Helpers is end of life with FoundryVTT 9 and no like-for-like replacement is on the horizon for FoundryVTT 10. That code is included below for potential future reference.

<details> <summary>Effect Macro that contains commented out regen logic</summary>

~~~javascript
console.log(`Fires at start of turn for "${token.name}" effectively a keyboard macro.`)
console.dir(actor)
console.dir(token)
//---------------------------------------------------------------------------------------
// From Discord
// https://discord.com/channels/170995199584108546/699750150674972743/1024326847980392449
//
// const noRegen = actor.effects.find(e => e.label === "No Regen");
// if ( noRegen ) return;
// const {total} = await new Roll("2d8").evaluate({async: true});
// await actor.applyDamage(-total);
~~~
</details>

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Undead Slayer**

Implements the [Rudolph van Richten/Rictavio's](https://www.dndbeyond.com/monsters/17371-rictavio) special ability to do 3d6 extra damage with weapons vs undead targets.  This ability uses a DAE DamageBonusMacro to work its magic (and triggers a macro).  The DAE effect config follows.  Note: no *ItemMacro* line is needed on the items sheet.

![Undead_Slayer_DAE_Effect.png](Undead_Slayer/Undead_Slayer_DAE_Effect.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Whispers of Madness**

Implements the [Allip](https://www.dndbeyond.com/monsters/93770-allip) ability that forces saving throws from up to three targets.  Undead and Constructs are immune.  Failed saves result in some damage and being forced to attack a target of the Allip's choice.

This item also runs a runeVFX on the affected tokens. 

![Whispers_of_Madness_Chat.png](Whispers_of_Madness/Whispers_of_Madness_Chat.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Wooden Sword**

Home brewed ability for Arabelle that applies one or two debuffing affects for one round when she hits. 

*[Back to the Table of Contents](#abilities-in-this-repo)*

---