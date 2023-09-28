const MACRONAME = "Spirit_Gurdians_Posney_0.1"
/*****************************************************************************************
 * Tim Posney's example implementation of Spirit Guardians
 * 
 * Source: https://gitlab.com/tposney/midi-qol#notes-for-macro-writers
 * 
 * 12/07/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
if (DEBUG) {
    console.log(`************* Starting ${MACRONAME}`);
	console.log(` tag ==>`, args[0].tag);
}

const lastArg = args[args.length -1];
// Check when applying the effect - if the token is not the caster and it IS the tokens turn they take damage
if (args[0] === "on" && args[1] !== lastArg.tokenId && lastArg.tokenId === game.combat?.current.tokenId) {
  const sourceItem = await fromUuid(lastArg.origin);
  let theActor = await fromUuid(lastArg.actorUuid);
  if (theActor.actor) theActor = theActor.actor;
  const itemData = mergeObject(duplicate(sourceItem.data), {
	  type: "weapon",
	  effects: [],
	  flags: {
		  "midi-qol": {
			  noProvokeReaction: true, // no reactions triggered
			  onUseMacroName: null // 
		  },
	  },
	  data: {
		  actionType: "save",
		  save: {dc: Number.parseInt(args[3]), ability: "wis", scaling: "flat"},
		  damage: { parts: [[`${args[2]}d8`, "radiant"]] },
		  "target.type": "self",
		  components: {concentration: false, material: false, ritual: false, somatic: false, value: "", vocal: false},
		  duration: {units: "inst", value: undefined},
		  weaponType: "improv"
	  }
  }, {overwrite: true, inlace: true, insertKeys: true, insertValues: true});
  itemData.data.target.type = "self";
  itemData.flags.autoanimations.killAnim = true;;
  const item = new CONFIG.Item.documentClass(itemData, { parent: theActor })
  const options = { showFullCard: false, createWorkflow: true, versatile: false, configureDialog: false };
  await MidiQOL.completeItemRoll(item, options);
}

if (DEBUG) console.log(`************* Ending ${MACRONAME}`);
