# Paladin

Standard Paladin, specifically Oath of the Ancients Paladin abilities

* [Aura of Protection](#aura-of-protection)

[*Back to All Class Features*](../README.md)

## Feature Notes

### Aura of Protection

This item implements the RAW ability with VFX. It leverages [Active Auras](https://github.com/kandashi/Active-Auras) and [DAE](https://gitlab.com/tposney/dae).

It uses a world macro (**Aura_of_Protection)** that applies a twinkling stars effect on protected tokens.  Two things to be aware of:

1. The aura only works when combat is active on the scene.  This is a (minor?) performance protection.  There is an option in the Active Auras settings to make it always apply.
2. The VFX may play in the wrong location when a token is moved several spaces into the aura effect.  If this is the case, bouncing the token a space and back should correct the issue.
3. The aura depends on the token(s) being *friendly*.  This is a setting on the Token/Character dialog that may be an issue at times.

![Aura_of_Protection.gif](Aura_of_Protection/Aura_of_Protection.gif)

The DAE and Active Aura settings are key to this item. The DAE Effects provide the following:

1. Charisma modifier added to saving throws
2. An unused Token Magic call (I have Token Magic disabled as it conflicts with [ASE](https://github.com/Vauryx/AdvancedSpellEffects))
3. A macro.execute to my world macro that substitutes for Token Magic

![Aura_of_Protection_DAE_Effects.png](Aura_of_Protection/Aura_of_Protection_DAE_Effects.png)

[*Back to Warlock Feature List*](#feature-notes)

---
