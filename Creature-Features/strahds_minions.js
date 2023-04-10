const TABLE = "Strahd's Minions"
console.log(`Rolling on ${TABLE} table`)
//Find your table
let attackTable = await game.tables.find(table => table.name === TABLE);
console.log('attackTable',attackTable)
//Draw from your table, this does the "roll"
const ROLL = await attackTable.roll();
let msg = ROLL.results[0].data.text;
console.log(msg)

attackTable.draw();