# Creature Features


Creature Abilities that aren't exactly spells, but they may be close.

I'll try to document functions as I add them to the repository. 

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

## Abilities in this Repo

* **[Angelic Weapons](#angelic_weapons)** -- Bonus damage on all weapon hits.
* **[Brown Mold Freezing Wave](#brown-mold-freezing-wave)** -- Environmental damage component of Brown Mold.
* **[Change Shape, Deva](#change-shape-deva)** -- **[The Abbot's](https://www.dndbeyond.com/monsters/the-abbot)** shape change ability.
* **[Consuming Bite](#consuming-bite)** -- Ilya's ability per MandyMod in her Kresk extension.
* **[Constrict](#constrict)** -- Vine Blight's Constrict ability.
* **[Coven Casting](#coven-casting)** -- Night Hag's shared Casting
* **[Etherealness](#etherealness)** -- Transitions a token to etherl realm (sort of).
* **[Grasping Root](#grasping-root)** -- Tree Blight's (aka Wintersplinter) grasping root ability.
* **[Healing Touch](#healing-touch)** -- The Abbot's lay on hands like ability
* **[Horrifying Visage](#horrifying-visage)** -- Banshee's visage can terrify creatures that can see it and are within 60 feet.
* **[Magic Resistance](#magic-resistance)** -- Grants advantage on saves vs magic
* **[Nightmare Haunting](#nightmare-haunting)** -- Nighthag's haunting ability.
* **[Ravenous Tenacity](#ravenous-tenacity)** -- Ilya's ability per MandyMod in her Kresk extension.
* **[Retched Spittle](#retched-spittle)** -- Ilya's ability per MandyMod in her Kresk extension.
* **[Summon Swarm of Insects](#summon-swarm-of-insects)** -- Calls for 1d4 Swarms of Insects
* **[Standing Stone Lightning Strike](#standing-stone-lightning-strike)** -- Ability to use from journal to implement an effect on Yester Hill.
* **[Threat Display](#threat-display)** -- Potential Frightened Application  
* **[Wail](#wail)** -- Banshee's wail that can drop things in their tracks.
* **[Wooden Sword](#wooden-sword)** -- Arabelle's wooden sword debuffing machine.

## Additional Notes on Functions

### **Angelic Weapons**

This ability requires only a bit of DAE configuration to add 4d8 Radiant damage to all MWAK and RWAK actions for an actor.  It does not add the magical characteristic, I don't know how to do that easily, so I am leaving it for manual twiddling in the (presumably) rare situations where it would matter.  

![Angelic_Weapons/Angelic_Weapons_DAE.png](Angelic_Weapons/Angelic_Weapons_DAE.png)

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

### **Ethrealness**

This macro runs a VFX on the targeted token and flips the hidden status to true when it is run.  When the effect it applies is removed it runs the VFX in reverese and flips the hidden status to false.  

![Etherealness/Etherealness_Desc.gif](Etherealness/Etherealness_Desc.gif)

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

### **Nightmare Haunting**

This one implments the Nighthag haunting ability.  It relies on the GM to run it at the appropriate time, it does nothing to manage requirements of application.

What it does do is run a VFX and add a persistent debuff that reduces the maximum hit points.  The GM will likely want to remove the duration element of the effect so that it becomes *permanent*, well until explicitly removed which is allowed by Greater Restoration and similar abilities.  This should be done manually by the GM.

![Nightmare_Haunting/Nightmare_Haunting.gif](Nightmare_Haunting/Nightmare_Haunting.gif)

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

### **Summon Swarm of Insects**

This implments **Baba Lysaga**'s ability to call forth 1d4 swarms of insects.  This is implemented with warpgate and does a couple of interesting things:

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

### **Threat Display**

This is a homebrew freature I cooked up for Galahad (others might know him as Lancelot), a GSD my party of Travelers in Barovia befriended in Durst Manor. Following is my description of the ability:

> As a bonus action, force a creature within 15 feet make a wisdom saving throw vs Caster DC or become  Frightened until the end of the creature's next turn. The targeted creature must hear the treat for it to be effective.
> 
> If the target is smaller, the save is made with diadvantage.  If the target is two categories larger, it has advantage.  If it is three or more larger, it is immune.
> 
> Creatures affected by the unwavering loyalty trait automatically succed on this saving throw. Once a creature has saved against this effect it is immune for the combat.

The macro manages immunities cause by saves, checks size differences, performs the appropriate save. Finally, it places the appropriate effect on the target.

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Wail**

This ability (typically on a Banshee) hits like, well, harder than a Mac Truck. It is an AoE effect that drops targets that fail their saves to zero HP and a nominal amount to those that save.

Creatures that can't hear the **Wail** are supposed to be unaffected.  That's something I find unacceptably difficult to automate, so I'll fix those issues as they occur.  

Since I may need to do some manual fixing after the spell, I setup the chat log to show the amount of damage done to each target, making such fixes fairly easy.  

![Wail_Chat_Card.png](Wail/Wail_Chat_Card.png)

*[Back to the Table of Contents](#abilities-in-this-repo)*

---

### **Wooden Sword**

Home brewed ability for Arabelle that applies one or two debuffing affects for one round whne she hits. 

*[Back to the Table of Contents](#abilities-in-this-repo)*

---