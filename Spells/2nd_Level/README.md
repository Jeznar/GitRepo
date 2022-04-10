# 2nd Level Spells
This repository will contain my automated 2nd level spells as I create new or update existing (there are many) that currently reside only in my game data (which is regularly backed up) I'll add them here.

Spells will have notes on elemnts that I think are interesting.  In some cases differences from RAW, notes on how to use the spell in game, or coding notes.

* [Augury](#augury)
* [Crown of Madness](#crown-of-madness)
* [Darkness](#darkness) (ASE)
* [Darkvision](#darkvision)
* [Detect Thoughts](#detect-thoughts)
* [Enlarge/Reduce](#enlargereduce)
* [Find Steed](#find-steed)
* [Flaming Sphere](#flaming-sphere)
* [Hold Person](#hold-person)
* [Invisibility](#invisibility)
* [Knock](#knock)
* [Levitate](#levitate)
* [Locate Object](#locate-object)
* [Mirror Image](#mirror-image) (ASE)
* [Misty Step](#misty-step)
* [Moonbeam](#moonbeam) (ASE)
* [Protection from Poison](#protection-from-poison)
* [Ray of Enfeeblement](#ray-of-enfeeblement)
* [Scorching Ray](#scorching-ray) (ASE)
* [Spiritual Weapon](#spiritual-weapon)

[*Back to List of All Spells*](../README.md)

## Spell Notes

### Augury

This spell simply plays a Rune based VFX on the caster using the world macro: [Run_RuneVFX_onSelf](../../Utility_Macros#run-runevfx-onself) which is simply added to the OnUse Macro field of the item.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Crown of Madness

[Crown of Madness](https://www.dndbeyond.com/spells/crown-of-madness) this one was very interesting. Here's what it basically does:

1. Performs a save for the tarted token, with standard spell setup,
2. If the save succeeds, don't do anything further, if not, continue,
3. Put a DAE effect on the target that includes 
 	* ItemMacro that runs at start of every turn reminding of effect on target (doEach)
 	* ItemMacro terminates the VFX when it is removed (doOff)
 	* Midi Overtime effect that performs a save at end of each turn 
4. Attach a VFX stars effect to the token marking it as *mad*
5. Add an effect that uses macro.execute to lauch a world macro that asks if the spell should be maintained.

Unfortunately, the dialogs are all pointed at the GM.  I considered having the code whisper the user with a message including a link to a macro to make things flow but it seems mre work than it is worth to me for this spell -- also a whispered macro doesn't have. the impact of a modal dialog which is what I wanted. A kernal of how to do this is included below in a code snippet.

~~~javascript
ChatMessage.create({
     speaker: ChatMessage.getSpeaker({actor: "Lizzie McWizard"}),
     content: 'test @Macro[SCnWv1sSIKkwp1xZ]{Shove}',
     whisper: ChatMessage.getWhisperRecipients("Cai'Lee")
});
~~~

The magic to this macro are the values passed to the DAE effect calls.

~~~javascript
macro.itemMacro Custom WIS DC16
flags.midi-qol.OverTime Override turn=end,saveDC=16,label=Save vs Crown of Madness,saveAbility=wis,saveRemove=true,saveMagic=true,rollType=save
~~~

Its quite the complex critter for a spell that is rarely if ever used.

![Crown_of_madness.gif](Crown_of_Madness/Crown_of_Mad.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

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

### Detect Thoughts

Places a DAE effect and concentration on the caster.  The automation does nothing to implement the actual effects which are left to the players.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Enlarge/Reduce

This spell uses an OnUse ItemMacro to pop a dialog and ask if the target wants to make a save.  An acceptance of the effect or a failed save the effect is applied and the token size is adjusted in the scene.  When the spell expires, the size returns to normal -- or at least it should. ;-)

![enlarge-reduce](Enlarge_Reduce/Enlarge-Reduce.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Find Steed

This spell is actually set up to-find a specific steed constantly, the macro is named thus: **find_steed_specific.**. It does the following:

1. Parse the aItem.name to find the name of the creature to be summoned.  The name needs to be of the form: Find Steed: <Actor Name> - <Steed Name>.  It must contain one and only one colon (:) and dash (-)
2. Verify the Actor named in the aItem.name exists 
3. Define warpgate updates (change token name), options (hide character sheet) and callbacks (VFX) 
4. Fire off warpgate to place steed and run the VFX
5. Post a completion message

As implemented for my *Travelers in Barovia* game, this spell is named: **Find Steed: Warhorse - Rogue** and an actor named **Warhorse - Rogue** is configured in my **Actors Directory**.

![Find_Steed.gif](Find_Steed_Specific/Find_Steed.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Flaming Sphere

This item does a number of things:

1. Summons a copy of the **\*Flaming_Sphere\*** actor (via *warpgate*) from the **Items Directory** and allows the caster to place it on the scene. 
2. The token is renamed to indicate ownership and 
3. May be moved by the summoning player.  
4. It creates a temporary *Innate Spellcasting* ability that may be used to perform the damage portion of this spell.
5. The token is set to emit a flicker orangish light reasonably appropriate for such a fire (this is not specified in RAW but made sense to me).
5. It deletes the summoned token and temporary ability when the spell terminates.
6. It also plays some pretty nice VFX.

![Flaming Sphere.gif](Flaming_Sphere/Flaming_Sphere2.gif)

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

### Levitate

Applies a DAE effect to indicate levitate's presence and runs a VFX on the target.  This implementation does not perform the saving throw for an unwilling target or check to make sure only one token was targeted.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Locate Object

Nothing more than a tested SRD implmentation. It works.  Nothing special.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Mirror Image

I am implmenting this one by using [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki). I have added no value here beyond following the instructions provided by *Vauryx*.

![mirror-image](https://user-images.githubusercontent.com/32877348/142118145-9c3edf81-fa9d-4d42-b5e1-cf54f73d486d.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Misty Step

This spell is implemented via global settings in [Automated Animations](https://github.com/otigon/automated-jb2a-animations).  

When used, it shows a maximum range and allows the user to click the desired destination.  It then moves the token with some nice visual effects.

![misty-step](Misty_Step/Misty_Step.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Moonbeam

This spell appears to be great as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#moonbeam). Other than leaving what seem like persistent ghost images of the beam -- they can be cleared by a reload.

![moonbeam](Moonbeam(ASE)/Moonbeam.gif)

Notes from the author's wiki:

* Adds an 'At-Will' spell to the caster's spellbook called "Move Moonbeam" that can be used to move the beam.
* If a 'Loop' Sound is set in the settings, the sound will follow the beam
* The beam will automatically roll saving throws and damage when a token enters its space for the first time until it has a turn again, or if it starts its turn in its space

I have kept my original implementation of moonbeam in a subdirectory for possible future reference as it does a pretty extensive job of summoning and managing actors and effects.

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Protection from Poison

Attempts to remove one effect named *Poison* from the target (there could be multiple or name variations), and places a DAE effect on the target to grant resistance to poison.  Advantage on saves versus poison are to be adjudicated manually. 

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Ray of Enfeeblement

Fairly infrequently used spell that places a debuff on the target to reduce their str based attacks by 50%.  Interestingly, there is no save for the first round so it might be used to 
great effect against particularly strong and threating opponents.

This implementation manages an effect marker, handles the per round save, and supplies a VFX.  It does not automate the damage reduction portion.  That will take quite a bit more effort and seems an unwise time investment at this point since the spell is rarely used.

![Ray_of_Enfeeblement/Ray_of_Enfeeblement.gif](Ray_of_Enfeeblement/Ray_of_Enfeeblement.gif)

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Scorching Ray

This spell is awesome as built in the [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#scorching-ray).

![scorching-ray](https://user-images.githubusercontent.com/32877348/139939004-1d55e877-89a7-486b-bdd8-c0660a3cfe15.gif)

Notes from the author's wiki:

* The caster will enter a special 'Targeting' mode as long as the target selection dialog is open.
* In Targeting mode, left-click on a token to assign a ray to it.
* alt+left-click to add ray with advantage, ctrl+left-click to add it with disadvantage
* Right-click on a token, or click the '-' button next to it in the dialog to remove a ray
* Click 'Done' to launch all rays at the assigned targets

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---

### Spiritual Weapon

This spell is implmented using [Automated Evocations](https://github.com/theripper93/automated-evocations), while not ideal it gets the job done.

AE's implementation requires an acror named **Spiritual Weapon** to exist which will be summoned by a world macro named **AE_Companion_Macro(Spiritual Weapon)**.  I have modified the macro to rename the summoned token, prefixing the standard name with the name of the owner.  The summoned weapon can then be used to *attack* having had its modifiers adjusted to the summoner. 

The part I don't like is the appearance of a selection dialog with exactly one choice.  I expect I can fix that to not appear, but I haven't invested the time. 

![spiritual-weapon](Spiritual_Weapon/Spiritual_Weapon.gif)

There is an [Advanced Spell Effects Module](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells#spiritual-weapon) implmentation, but I'm happy enough with what I have to just let it stand. 

[*Back to 2nd Level Spell List*](#2nd-level-spells)

---