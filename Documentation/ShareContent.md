# Share Content Between Worlds

A task that hasn't been, but is likely to become important to me is sharing content between worlds.  My current method is via an exported JSON of a specific element that then gets imported in the target world.  That's an inefficient path.  My understanding is that I could do that via *shared* compendiums.  This document will contain my notes for how I go about building such a creature.

My starting point is a Reddit post by [u/solfolango](https://www.reddit.com/user/solfolango/): [How to create a tiny module for shared content between worlds](https://www.reddit.com/r/FoundryVTT/comments/fvw3c7/how_to_create_a_tiny_module_for_shared_content/?utm_source=share&utm_medium=ios_app&utm_name=iossmf)

As it turns out, I've already done a fair bit of the above tutorial, 

## First Try With Many Compendia

My first attempt, I created many (MANY!) different compendia in an attempt to encourage myself to be organized.  I'll document what I did here (in hidden sections), but after discovering what the [Compendium Folders](https://github.com/earlSt1/vtt-compendium-folders) module does, I realized this was not a great approach.

<details>
  <summary>Listing of the various compendia</summary>
  
| Name               | Type         | Intended Content                                |
|--------------------|:------------:|-------------------------------------------------|
| My Actors Linked   | Actor        | Significant NPCs that get their own entry.      |
| My Actors Unlinked | Actor        | Generic NPCs, e.g. Villager.                    |
| My Actor PCs       | Actor        | Player Characters check-pointed to compendium.  |
| My Monsters        | Actor        | Monsters (Duh!)                                 |
| My Classes         | Item         | Class abilities and features.                   |
| My Feats           | Item         | Feats that had items created for them.          |
| My Items           | Item         | Items that aren't one of the other types.       | 
| My Journal Entrys  | JournalEntry | Journal Entries.                                |
| My Macros          | Macro        | Macros that can be potentially usefully shared. |
| My Playlist        | Playlist     | Playlists, though I have yet to create/use one. |
| My Races           | Item         | Races that I have defined beyond standard.      |
| My Racial Traits   | Item         | Items to flesh out races.                       |
| My Roll Tables     | RollTable    | Roll tables for whatever.                       |
| My Scenes          | Scene        | The various scenes created.                     |
| My Spells          | Item         | Spells, lots and lots of spells.                |
</details>

This approach generates a bunch (15!) of compendia that allow a bit of organization; however, the [Compendium Folders](https://github.com/earlSt1/vtt-compendium-folders) module does a much better job of this and its become apparent that I'd be better off with a much smaller number, just one per type, and depend on compendium folders for organizational structure. 

I did learn, while playing with this, that having the compendia start with a keyword of some sort helps a lot with sorting and searching, so I'll be keeping that. 

<details>
  <summary>JSON to Implement the Many Compendia Approach!</summary>
  
~~~json
{
  "name": "My-Shared-Compendia",
  "title": "My Shared Compendia",
  "description": "Sharing data across worlds via Compendia as explained by u/solfolango on r/FoundryVTT",
  "author": "Joe Barrett",
  "version": "1.1.0",
  "minimumCoreVersion": "9.0",
  "compatibleCoreVersion": "9.269",
  "packs": [
    {
      "name": "actors-linked",
      "label": "My Actors Linked",
      "path": "packs/actorsLinked.db",
      "module": "My-Shared-Compendia",
      "entity": "Actor"
    },
    {
      "name": "actors-unlinked",
      "label": "My Actors Unlinked",
      "path": "packs/actorsUnlinked.db",
      "module": "My-Shared-Compendia",
      "entity": "Actor"
    },
    {
      "name": "actors-PCs",
      "label": "My Actor PCs",
      "path": "packs/actorsPC.db",
      "module": "My-Shared-Compendia",
      "entity": "Actor"
    },
    {
      "name": "monsters",
      "label": "My Monsters",
      "path": "packs/monsters.db",
      "module": "My-Shared-Compendia",
      "entity": "Actor"
    },
    {
      "name": "classfeatures",
      "label": "My Class Features",
      "path": "packs/classFeatures.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    },
    {
      "name": "classes",
      "label": "My Classes",
      "path": "packs/classes.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    },
    {
      "name": "feats",
      "label": "My Feats",
      "path": "packs/feats.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    },
    {
      "name": "items",
      "label": "My Items",
      "path": "packs/items.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    },
    {
      "name": "JournalEntrys",
      "label": "My Journal Entrys",
      "path": "packs/journalentry.db",
      "module": "My-Shared-Compendia",
      "entity": "JournalEntry"
    },
    {
      "name": "macros",
      "label": "My Macros",
      "path": "packs/macro.db",
      "module": "My-Shared-Compendia",
      "entity": "Macro"
    },
    {
      "name": "playlist",
      "label": "My Playlist",
      "path": "packs/playlist.db",
      "module": "My-Shared-Compendia",
      "entity": "Playlist"
    },
    {
      "name": "races",
      "label": "My Races",
      "path": "packs/races.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    },
    {
      "name": "racialtraits",
      "label": "My Racial Traits",
      "path": "packs/racialtraits.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    },
    {
      "name": "rolltable",
      "label": "My Roll Tables",
      "path": "packs/rolltable.db",
      "module": "My-Shared-Compendia",
      "entity": "RollTable"
    },
    {
      "name": "scenes",
      "label": "My Scenes",
      "path": "packs/scenes.db",
      "module": "My-Shared-Compendia",
      "entity": "Scene"
    },
    {
      "name": "spells",
      "label": "My Spells",
      "path": "packs/spells.db",
      "module": "My-Shared-Compendia",
      "entity": "Item"
    }
  ],

  "url": "https://github.com/stschoelzel/My-Shared-Compendia"
}
~~~
</details>

## Digression: Compendium Folders

As I have mentioned, the module [__Compendium Folders__](https://github.com/earlSt1/vtt-compendium-folders) does a great job of enabling organization within compendia.  I highly recommend using this one.  While I am at it, the [__MoarFolders__](https://foundryvtt.com/packages/moar-folders/) module makes it even better allowing more depth in the folder structure. 

Those modules have solid readme documentation, so I'll not delve deeper into them here. That is beyond snagging a nifty demo graphic from compendium folders.

|Export             | Import |
:-------------------------:|:-------------------------:
<img src="https://github.com/earlSt1/vtt-compendium-folders/raw/09x-update/cf_export1.gif" width="700" /> |  <img src="https://github.com/earlSt1/vtt-compendium-folders/raw/09x-update/cf_import1.gif" width="700" />

## Try Two: Module to Share Content

With that learning under my belt, I took a second swing at creating a set of compendia for sharing content, with a two new principals:

1. Minimize the number of compendia (Compendium Folders is better for organization)
2. Have a unique prefix (I choose *Jez* in place of My as it is less likely to collide for other people)

This lead me to the following set of compendia:

| Name          | Type         | Intended Content                         |
|---------------|:------------:|------------------------------------------|
| Jez Actors    | Actor        | All shared Actors, Monsters, etc.        |
| Jez Items     | Item         | All shared Items (Spells, Weapons, etc.) |
| Jez Journal   | JournalEntry | All shared Journal Entries               |
| Jez Macros    | Macro        | All shared Macros.                       |
| Jez Playlists | Playlist     | All shared Playlists.                    |
| Jez Tables    | RollTable    | All shared Roll Tables.                  |
| Jez Scenes    | Scene        | All shared scenes.                       |




[Link back to my Documentation Listing](README.md) 

[Link back to my Repo Listing](https://github.com/Jeznar/Jeznar/blob/main/README.md) 