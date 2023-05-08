const TABLE = "Strahd's Minions"
console.log(`Rolling on ${TABLE} table`)
//Find your table
let attackTable = await game.tables.find(table => table.name === TABLE);
// Commented out access to the results of the roll
// const ROLL = await attackTable.roll();
// let msg = ROLL.results[0].data.text;
// console.log(msg)
//Draw from your table, this does the "roll"
attackTable.draw({rollMode: 'blindroll'});