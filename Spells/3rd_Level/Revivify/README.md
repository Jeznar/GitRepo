{
  "name": "Revivify",
  "type": "spell",
  "img": "/systems/dnd5e/icons/spells/heal-sky-2.jpg",
  "data": {
    "description": {
      "value": "<p>You touch a creature that has died within the last minute. That creature returns to life with 1 hit point. This spell can’t return to life a creature that has died of old age, nor can it restore any missing body parts.</p>\n<hr />\n<p><strong>FoundryVTT</strong>: Since this spell is such a special occasion spell, it is handled manually within the VTT.</p>",
      "chat": "",
      "unidentified": ""
    },
    "source": "",
    "activation": {
      "type": "action",
      "cost": 1,
      "condition": "Creature died within last minute"
    },
    "duration": {
      "value": null,
      "units": "inst"
    },
    "target": {
      "value": null,
      "width": null,
      "units": "touch",
      "type": "creature"
    },
    "range": {
      "value": null,
      "long": null,
      "units": "touch"
    },
    "uses": {
      "value": 0,
      "max": "0",
      "per": ""
    },
    "consume": {
      "type": "material",
      "target": "",
      "amount": 1
    },
    "ability": "",
    "actionType": "util",
    "attackBonus": 0,
    "chatFlavor": "Target restored to 1 point of health, if preconditions meet.",
    "critical": {
      "threshold": null,
      "damage": null
    },
    "damage": {
      "parts": [],
      "versatile": ""
    },
    "formula": "",
    "save": {
      "ability": "",
      "dc": null,
      "scaling": "spell"
    },
    "level": 3,
    "school": "nec",
    "components": {
      "value": "",
      "vocal": true,
      "somatic": true,
      "material": true,
      "ritual": false,
      "concentration": false
    },
    "materials": {
      "value": "Diamonds worth 300 gp, which the spell consumes",
      "consumed": false,
      "cost": null,
      "supply": null
    },
    "preparation": {
      "mode": "pact",
      "prepared": true
    },
    "scaling": {
      "mode": "none",
      "formula": ""
    },
    "attunement": null
  },
  "effects": [],
  "flags": {
    "enhancedcombathud": {
      "set1p": false,
      "set2p": false,
      "set3p": false
    },
    "midi-qol": {
      "onUseMacroName": "[postActiveEffects]ItemMacro",
      "effectActivation": false
    },
    "betterCurses": {
      "isCurse": false,
      "curseName": "",
      "formula": "",
      "mwak": false,
      "rwak": false,
      "msak": false,
      "rsak": false
    },
    "core": {
      "sourceId": "Item.NjUzNjdkNzQxZjRi"
    },
    "autoanimations": {
      "version": 4,
      "killAnim": false,
      "animLevel": false,
      "options": {
        "ammo": false,
        "staticType": "target",
        "staticOptions": "staticSpells",
        "variant": "",
        "enableCustom": true,
        "repeat": 2,
        "delay": null,
        "scale": null,
        "opacity": null,
        "persistent": false,
        "customPath": "modules/jb2a_patreon/Library/Generic/Template/Circle/Whirl_01_Regular_Blue_600x600.webm",
        "menuType": "spell"
      },
      "override": true,
      "sourceToken": {
        "enable": false
      },
      "targetToken": {
        "enable": false
      },
      "levels3d": {
        "type": ""
      },
      "macro": {
        "enable": false
      },
      "animType": "static",
      "animation": "a1",
      "color": "",
      "audio": {
        "a01": {
          "enable": false
        }
      },
      "preview": false,
      "explosions": {
        "enable": false
      }
    },
    "midiProperties": {
      "nodam": false,
      "fulldam": false,
      "halfdam": false,
      "rollOther": false,
      "critOther": false,
      "magicdam": false,
      "magiceffect": false,
      "concentration": false,
      "toggleEffect": false
    },
    "itemacro": {
      "macro": {
        "data": {
          "_id": null,
          "name": "Revivify",
          "type": "script",
          "author": "ZjFlOWYxZjM5ZTZj",
          "img": "icons/svg/dice-target.svg",
          "scope": "global",
          "command": "const MACRONAME = \"Revivify.0.1.js\"\n/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0\n * Check validity of cast (partially at least) and then boost HP of target by 1 point.\n * \n * 12/03/22 0.1 Creation of Macro\n *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/\nconst MACRO = MACRONAME.split(\".\")[0]       // Trim off the version number and extension\nconst TAG = `${MACRO} |`\nconst TL = 0;                               // Trace Level for this macro\nlet msg = \"\";                               // Global message string\n//---------------------------------------------------------------------------------------------------\nif (TL > 1) jez.trace(`${TAG} === Starting ===`);\nif (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);\nconst L_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents\n//---------------------------------------------------------------------------------------------------\n// Set standard variables\nlet aToken = (L_ARG.tokenId) ? canvas.tokens.get(L_ARG.tokenId) : game.actors.get(L_ARG.tokenId)\nlet aActor = aToken.actor;\nlet aItem = (args[0]?.item) ? args[0]?.item : L_ARG.efData?.flags?.dae?.itemData\nconst VERSION = Math.floor(game.VERSION);\nconst GAME_RND = game.combat ? game.combat.round : 0;\n//---------------------------------------------------------------------------------------------------\n// Set Macro specific globals\n//\n\n//---------------------------------------------------------------------------------------------------\n// Run the main procedures, choosing based on how the macro was invoked\n//\nif (args[0]?.tag === \"OnUse\") await doOnUse({ traceLvl: TL });          // Midi ItemMacro On Use\nif (TL > 1) jez.trace(`${TAG} === Finished ===`);\n/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0\n *    END_OF_MAIN_MACRO_BODY\n *                                END_OF_MAIN_MACRO_BODY\n *                                                             END_OF_MAIN_MACRO_BODY\n ****************************************************************************************************\n * Check the setup of things.  Post bad message and return false fr bad, true for ok!\n *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/\nasync function preCheck() {\n    if (args[0].targets.length !== 1) {      // If not exactly one target \n        msg = `Must target exactly one target.  ${args[0]?.targets?.length} were targeted.`\n        jez.refundSpellSlot(aToken, L_ARG.spellLevel, { traceLvl: 0, quiet: false, spellName: aItem.name })\n        postResults(msg)\n        return jez.badNews(msg, \"w\");\n    }\n    return (true)\n}\n/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0\n * Post results to the chat card\n *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/\nfunction postResults(msg) {\n    const FUNCNAME = \"postResults(msg)\";\n    const FNAME = FUNCNAME.split(\"(\")[0]\n    const TAG = `${MACRO} ${FNAME} |`\n    if (TL > 1) jez.trace(`${TAG} --- Starting ---`);\n    if (TL > 2) jez.trace(\"postResults Parameters\", \"msg\", msg)\n    //-----------------------------------------------------------------------------------------------\n    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);\n    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: \"saves\" });\n    if (TL > 1) jez.trace(`${TAG}--- Finished ---`);\n}\n/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0\n * Perform the code that runs when this macro is invoked as an ItemMacro \"OnUse\"\n *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/\nasync function doOnUse(options = {}) {\n    const FUNCNAME = \"doOnUse(options={})\";\n    const FNAME = FUNCNAME.split(\"(\")[0]\n    const TAG = `${MACRO} ${FNAME} |`\n    const TL = options.traceLvl ?? 0\n    if (TL === 1) jez.trace(`${TAG} --- Starting ---`);\n    if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`, \"options\", options);\n    await jez.wait(100)\n    //-----------------------------------------------------------------------------------------------\n    if (!await preCheck()) return (false);\n    let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any\n    let tActor = tToken?.actor;\n    //-----------------------------------------------------------------------------------------------\n    // Does the targeted actor have 0 HP at time of casting?\n    //\n    let curHP = tActor.data.data.attributes.hp.value\n    console.log(`curHP`,curHP)\n    if (curHP > 0) {\n        msg = `${tToken.name} has positive hit points. This spell has no benefit and has been \n        cancelled.`\n        postResults(msg)\n        jez.refundSpellSlot(aToken, L_ARG.spellLevel,{ spellName: aItem.name })\n        return\n    }\n    //-----------------------------------------------------------------------------------------------\n    // Ask player if preconditions are met with a simple dialog.\n    //\n    let confirmation = await Dialog.confirm({\n        title: `Preconditions for ${aItem.name} met?`,\n        content: `<p>Has ${tToken.name} died within the last minute?</p>`,\n      });\n    if (!confirmation) { // Clicked \"No\" on the dialog\n        msg = `${tToken.name} can not benefit from ${aItem.name} as they have beed dead too long.`\n        postResults(msg)\n        jez.refundSpellSlot(aToken, L_ARG.spellLevel,{ spellName: aItem.name })\n        return\n    }\n    //-----------------------------------------------------------------------------------------------\n    // Heal the target for 1 HP to restore it to life, using a runAsGM macro to dodge permission \n    // issue for players.\n    //\n    const ACTORUPDATEASGM = jez.getMacroRunAsGM(\"ActorUpdate\")\n    if (!ACTORUPDATEASGM) { return false }\n    let rc = ACTORUPDATEASGM.execute(tToken.id, { \"data.attributes.hp.value\": 1 }); // target equiv token.id?\n    console.log('rc',rc)\n    //-----------------------------------------------------------------------------------------------\n    // Add the prone condition to the newly breathing as it likely should be there.\n    //\n    await jezcon.addCondition(\"Prone\", L_ARG.targetUuids, \n        {allowDups: false, replaceEx: true, origin: tActor.uuid, overlay: false, traceLvl: TL }) \n    //-----------------------------------------------------------------------------------------------\n    // Thats all folks\n    //\n    msg = `${tToken.name} has been restored to life with 1 hit point.`\n    postResults(msg)\n    if (TL > 1) jez.trace(`${TAG} --- Finished ---`);\n    return true;\n}",
          "folder": null,
          "sort": 0,
          "permission": {
            "default": 0
          },
          "flags": {}
        }
      }
    },
    "exportSource": {
      "world": "travels-in-barovia-ce",
      "system": "dnd5e",
      "coreVersion": "9.280",
      "systemVersion": "1.6.2"
    }
  }
}