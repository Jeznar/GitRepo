const macroName = "Inspiring-Leader-0.1"
const debug = true;
if (debug) console.log(`Starting: ${macroName} arguments passed: ${args.length}`);

// Add 10 temp hp to tokens within 10 units of selected 

//let thp = 10;
let tokenD = canvas.tokens.controlled[0];
let dist = 5;
let sel = canvas.tokens.controlled[0];
//let thp = canvas.tokens.controlled[0].actor.details.level + canvas.tokens.controlled[0].actors.abilities.cha.mod;
let level = tokenD.actor.data.data.details.level;
let chaMod = tokenD.actor.data.data.abilities.cha.mod;
let thp = level + chaMod;
canvas.tokens.placeables.forEach(token => {
  let d = canvas.grid.measureDistance(sel, token);
  if (d < dist && token.data.disposition === 1) {
    let curthp = token.actor.data.data.attributes.hp.temp;
    if (curthp < thp || curthp == "") {
      token.actor.update({"data.attributes.hp.temp" : thp});
      console.log(`Adding ${thp} temp hp to ${token.name}`);
    }
  }
});