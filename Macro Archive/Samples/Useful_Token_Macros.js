const MACRONAME = "Useful_Token_Macros"
/*****************************************************************************************
 * Taken from the set of example and community macros
 * 
 * Errors out for undetermined reasons on first setting
 *****************************************************************************************/
const DEBUG = true;
log("------------------------------------------------------------------------------------",
    "Starting", MACRONAME);

// Get token from scene by name
let tokenMyActor = canvas.scene.data.tokens.find(tokenMyActor => tokenMyActor.name = 'My Actor')
log("Get token from scene by name", tokenMyActor, tokenMyActor.name);


// Get first controlled token
let token = canvas.tokens.controlled[0];

// Get all controlled tokens and do something with each
let tokens = canvas.tokens.controlled;
tokens.forEach(token => {
  console.log(token.name);
});

// Distance between 2 tokens
let d = canvas.grid.measureDistance(token1, token2);

// Select one random token from amongst all selected
let tks = canvas.tokens.controlled;
let r = Math.floor(Math.random()*tks.length);
canvas.tokens.selectObjects(tks[r]);

/*
 * Add token to scene
 * Options override (actor.data.token) or set properties
 */
let tk = game.actors.getName('MyActor').data.token;
tk.x = 100;
tk.y = 100;
Token.create(tk);

/*
 * Add multiple tokens to scene
 */
let tk = game.actors.getName('ActorOne').data.token;
let tk2 = game.actors.getName('ActorTwo').data.token;
tk.x = 100;
tk.y = 100;
tk2.x = 200;
tk2.y = 200;
Token.create([tk, tk2]);

// Select all tokens in scene
let tokens = canvas.tokens.placeables;
canvas.tokens.selectObjects(tokens)

// Select token by name
let token = canvas.tokens.placeables.find(t => t.name === 'Azimuth');
token.control();

// Select all NPC tokens
canvas.tokens.selectObjects(); // Drop existing selection
let tokens = canvas.tokens.placeables.filter(t => !t.actor.isPC); // Find NPCs
tokens.forEach(t => { t.control({ releaseOthers: false }); }); // Select them

// Select token while retaining control of existing selection
token.control({ releaseOthers: false });


/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
 function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
