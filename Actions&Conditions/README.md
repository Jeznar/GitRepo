# Actions & Conditions

Abilities that are aimed at automating aactions and/or condition management.

[Link back to my Repo Listing](https://github.com/Jeznar/GitRepo)

## Listing of Items

* [Cover, Half](#cover-half)
* [Cover, Three-Quarters](#cover-three-quarters)
* [Dodging](#Dodging)
* [Flanking](#flanking)
* [Grapple](#grapple)
* [Help](#help)
* [Hinder](#hinder)
* [Jump](#jump)

---

## Cover, Half

Simple little macro that makes calls to Combat Utility Belt (CUB) module functions to:

Remove any existing 3/4 Cover Condition
Toggle 1/2 COver Condition on/off

The underlying CUB Condition is configured to last only a round, so this will need to be reaplied each round.

The code for this one is so short, I'll embed it in this document.

~~~javascript
if (game.cub.hasCondition("Cover, Three-Quarters")) {
    await game.cub.removeCondition("Cover, Three-Quarters");
}
if (game.cub.hasCondition("Cover, Half")) {
    game.cub.removeCondition("Cover, Half");
} else {
    game.cub.addCondition("Cover, Half");
}
~~~

BTW, using the *protective* wrapping of the values (e.g. +2+) doesn't work for AC.  It causes the condition to do nothing.

[*Back to Listing of Items*](#listing-of-items)

---

## Cover, Three-Quarters

Same thing as the Half version, just applies an effect good for 5 points of armor addition.

The underlying CUB Condition is configured to last only a round, so this will need to be reaplied each round.

[*Back to Listing of Items*](#listing-of-items)

---

## Dodging

Similar to the cover actions, this one toggles the **dodge** status forcing disadvantage on attackers.

The underlying CUB Condition is configured to last only a round, so this will need to be reaplied each round.

[*Back to Listing of Items*](#listing-of-items)

---

## Flanking

Similar to the cover actions, this one toggles the **Flanking** status granting +2 to MWAK rolls.

The underlying CUB Condition is configured to last only a round, so this will need to be reaplied each round.

[*Back to Listing of Items*](#listing-of-items)

---

## Grapple 

A set of three macros to implement Grapple:

Grapple Initiate
Grapple Escape
Grapple Release

These are imported from earlier work and could definitely be cleaned up and documented.

[*Back to Listing of Items*](#listing-of-items)

---

## Help 

Imported from earlier work and could definitely be cleaned up and documented.

[*Back to Listing of Items*](#listing-of-items)

---

## Hinder 

Imported from earlier work and could definitely be cleaned up and documented.

[*Back to Listing of Items*](#listing-of-items)

---

## Jump 

Displays the item description, containing a link to a Jump Calculator on an external web page (pretty nifty) by calling my utility macro **DisplayDescription**.

[*Back to Listing of Items*](#listing-of-items)

---