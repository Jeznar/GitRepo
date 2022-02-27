Below are my notes as of the day I retired my implmentation of this spell.

### Magic Missle

The macro implementing this one does nothing much more than figure out how many darts were cast and generates a VFX for each dart.  

This spell is sometimes misunderstood. It allows darts to be split across targets but specifies that all impacts are simultaneous.  THat simultaneous bit implies only one concentration check per dart per target. The standard Foundry implementation scales incorrectly (the extra +1 ignores the dart count) and doesn't allow for splitting darts across targets. 

I have implemented this spell by creating a "base" spell that dumps all darts into a single target and another that has a hard coded dart count ( a serious user of this spell may want multiple hard coded versions).  Either can be upcast.  If darts are being split, the hard coded version should be used once versus each target with only one of them deducting a spell slot. 

![Magic Missile](Magic_Missile.gif)

[*Back to 1st Level Spell List*](../README.md#1st-level-spells)