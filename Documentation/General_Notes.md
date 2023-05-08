# General Notes

Some of the things and commands that I have needed to learn and want to be able to find *next time.*

## My Modules

[Google Numbers](https://docs.google.com/spreadsheets/d/1UEMtONZpy9uf4XDEV_zU-Sj4Dxig4lHEUl6anAibU-g/edit#gid=0)

## grep

Command line grep, how I hate to love you...

To search my local repository, the following grep command, run from the root of the repository file tree is useful:

> grep -ri --include=\\*.js cool-thing .

Elements of that:

1. **-r** causes grep to descend the tree
2. **-i** makes the search case insensitive
1. **-include** limits the files that will be searched (to just .js in this case)
1. **'COOL-THING'** string that will be searched for
1. **.** is the location to begin the search

Sending the output through a pipe allows for additional filtering.  Something like the following can be useful:

> grep -ri --include=\\*.js 'COOL-THING' . | grep -i center

This will find just the lines that contain center and COOL-THING (or cool-thing, or any other mixed case variation)

[Additional grep info](https://www.cyberciti.biz/faq/howto-use-grep-command-in-linux-unix)

---

## Advanced Spell Effects

I just (2/25/22) ran across this module and I am blown away.  It does some awesome automation of spells, though it seems to toss a fair number of errors and has a hefty dependency list. I'm also a bit unnerved by the seemingly hidden changes it makes to spells, but for those that I haven't done, my gosh does it seem like easy mode to use and get a fancy result.

[Module Wiki (including dependencies)](https://github.com/Vauryx/AdvancedSpellEffects/wiki)

[Current Spells](https://github.com/Vauryx/AdvancedSpellEffects/wiki/Currently-Available-Spells)

---

## Creating GIF files

There are many ways to make a GIF file (appropriate for use here). I've found this site to be easy to use to convert my screen recordings (Cmd-Opt-5) to GIF with optional compression added:

[MOV To GIF Converter](https://image.online-convert.com/convert/mov-to-gif)

---

## Handling Data: Flags, Settings and Files

A useful bit of info [lives here](https://foundryvtt.wiki/en/development/guides/handling-data)

---

## Adding Rolls into Journal Articles

`[[1d6]]` will automatically roll every time you open the journal, `[[/roll 1d6]]` will give you a button to roll when you need it. `[[/r 1d20 + @abilities.wis.mod]]{Wisdom Check}` will display as "Wisdom Check" and roll a d20 and add the selected character's wisdom modifier

More info: [Reddit](https://www.reddit.com/r/FoundryVTT/comments/rgpt78/can_i_create_a_roll_command_directly_in_a_journal/)

Example poison roll:  `[[/roll 8d10[poison]]]{Poison Damage}`

### Skill Checks

Standard skill checks as follows:

~~~javascript
[[/r 1d20 + @skills.acr.total]]{Acrobatics (DEX) Check} 
[[/r 1d20 + @skills.ani.total]]{Animal Handling (WIS) Check} 
[[/r 1d20 + @skills.arc.total]]{Arcana (INT) Check} 
[[/r 1d20 + @skills.ath.total]]{Athletics (STR) Check} 
[[/r 1d20 + @skills.dec.total]]{Deception (CHA) Check} 
[[/r 1d20 + @skills.his.total]]{History (INT) Check} 
[[/r 1d20 + @skills.ins.total]]{Insight (WIS) Check} 
[[/r 1d20 + @skills.inv.total]]{Investigation (INT) Check} 
[[/r 1d20 + @skills.itm.total]]{Intimidation (CHA) Check} 
[[/r 1d20 + @skills.nat.total]]{Medicine (WIS) Check} 
[[/r 1d20 + @skills.nat.total]]{Nature (INT) Check} 
[[/r 1d20 + @skills.per.total]]{Perception (WIS) Check} 
[[/r 1d20 + @skills.prc.total]]{Persuasion (CHA) Check} 
[[/r 1d20 + @skills.prf.total]]{Performance (CHA) Check} 
[[/r 1d20 + @skills.rel.total]]{Religion (INT) Check} 
[[/r 1d20 + @skills.slt.total]]{Sleight of Hand (DEX) Check} 
[[/r 1d20 + @skills.ste.total]]{Stealth (DEX) Check}
[[/r 1d20 + @skills.sur.total]]{Survival (WIS) Check}
~~~

|Abr.|Ability (stat)|Roll Text (for Foundry)|
|---|---|---|
|acr|Acrobatics (Dex)|[[/r 1d20 + @skills.acr.total]]{Acrobatics Check}|
|ani|Animal Handling (Wis)|[[/r 1d20 + @skills.ani.total]]{Animal Handling Check}|
|arc|Arcana (Int)|[[/r 1d20 + @skills.arc.total]]{Arcana Check}|
|ath|Athletics (Str)|[[/r 1d20 + @skills.ath.total]]{Athletics Check}|
|dec|Deception (Cha)|[[/r 1d20 + @skills.dec.total]]{Deception Check}|
|his|History (Int)|[[/r 1d20 + @skills.his.total]]{History Check}|
|ins|Insight (Wis)|[[/r 1d20 + @skills.ins.total]]{Insight Check}|
|inv|Investigation (Int)|[[/r 1d20 + @skills.inv.total]]{Investigation Check}|
|itm|Intimidation (Cha)|[[/r 1d20 + @skills.itm.total]]{Intimidation Check}|
|med|Medicine (Wis)|[[/r 1d20 + @skills.med.total]]{Medicine Check}|
|nat|Nature (Int)|[[/r 1d20 + @skills.nat.total]]{Nature Check}|
|per|Perception (Wis)|[[/r 1d20 + @skills.per.total]]{Perception Check}|
|prc|Persuasion (Cha)|[[/r 1d20 + @skills.prc.total]]{Persuasion Check}|
|prf|Performance (Cha)|[[/r 1d20 + @skills.prf.total]]{Performance Check}|
|rel|Religion (Int)|[[/r 1d20 + @skills.rel.total]]{Religion Check}|
|slt|Sleight of Hand (Dex)|[[/r 1d20 + @skills.slt.total]]{Sleight of Hand Check}|
|ste|Stealth (Dex)|[[/r 1d20 + @skills.ste.total]]{Stealth Check}|
|sur|Survival (Wis)|[[/r 1d20 + @skills.sur.total]]{Survival Check}|

### Saving Throws

Six stat based saving throws as follows:

~~~
[[/r 1d20 + @abilities.str.save]]{STR Save}
[[/r 1d20 + @abilities.dex.save]]{DEX Save}
[[/r 1d20 + @abilities.con.save]]{CON Save}
[[/r 1d20 + @abilities.int.save]]{INT Save}
[[/r 1d20 + @abilities.wis.save]]{WIS Save}
[[/r 1d20 + @abilities.cha.save]]{CHA Save}
~~~

### Stat Checks

Six stat based checks as follows:

~~~
[[/r 1d20 + @abilities.str.mod]]{STR Check}
[[/r 1d20 + @abilities.dex.mod]]{DEX Check}
[[/r 1d20 + @abilities.con.mod]]{CON Check}
[[/r 1d20 + @abilities.int.mod]]{INT Check}
[[/r 1d20 + @abilities.wis.mod]]{WIS Check}
[[/r 1d20 + @abilities.cha.mod]]{CHA Check}
~~~

## Introduction to PIXI

A useful bit of info [lives here](https://foundryvtt.wiki/en/development/guides/pixi)

---


[Link back to my Documentation Listing](README.md) 

[Link back to my Repo Listing](https://github.com/Jeznar/Jeznar/blob/main/README.md) 