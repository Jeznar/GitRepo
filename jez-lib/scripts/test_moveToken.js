const MACRONAME = "test_moveToken.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * 
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 4;                               // Trace Level for this macro
let msg = "";                               // Global message string
//---------------------------------------------------------------------------------------------------
if (TL > 1) jez.trace(`${TAG} === Starting ===`);
if (TL > 2) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
const LAST_ARG = args[args.length - 1]; // See https://gitlab.com/tposney/dae#lastarg for contents
//---------------------------------------------------------------------------------------------------
// Set the value for the Active Token (aToken)
let aToken;
if (LAST_ARG.tokenId) aToken = canvas.tokens.get(LAST_ARG.tokenId);
else aToken = game.actors.get(LAST_ARG.tokenId);
let aActor = aToken.actor;
//
// Set the value for the Active Item (aItem)
let aItem;
if (args[0]?.item) aItem = args[0]?.item;
else aItem = LAST_ARG.efData?.flags?.dae?.itemData;
//---------------------------------------------------------------------------------------------------
// Set Macro specific globals
//
let tToken = canvas.tokens.get(args[0]?.targets[0]?.id); // First Targeted Token, if any
//-----------------------------------------------------------------------------------------------
// Check that we have a token/actor targeted to be acted upon
//
jez.moveToken(aToken,tToken,3,750,{traceLvl: TL})
// /***************************************************************************************************
//  * Move the movingToken up to the number of spaces specified as move away from the amchorToken if 
//  * move is a positive value, toward if negative, after a delay in milliseconds.
//  * 
//  * If the path foro the movement is obstructed for movement, a message is posted to the chat log and '
//  * a false is returned.
//  ***************************************************************************************************/
// //  static async moveToken(anchorToken, movingToken, move, delay, options={} {
// async function moveToken(anchorToken, movingToken, move, delay, options={}) {
//     const FUNCNAME = "moveToken(anchorToken, movingToken, move, delay, options={})";
//     const FNAME = FUNCNAME.split("(")[0]
//     const TAG = `jez.lib ${FNAME} |`
//     const TL = options.traceLvl ?? 0
//     if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
//     if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
//         "anchorToken ==>", anchorToken,
//         'movingToken ==>', movingToken,
//         'move        ==>', move,
//         'delay       ==>', delay,
//         "options     ==>", options);
//     //---------------------------------------------------------------------------------------------------
//     // Set Function specific variables
//     //
//     let moveArray = [-3, -2, -1, 0, 1, 2, 3]
//     const GRID_UNIT = canvas.scene.data.grid;
//     let distBetweenTokens = jez.getDistance5e(anchorToken, movingToken);
//     delay = delay || 10
//     //----------------------------------------------------------------------------------------------
//     // Store the X & Y coordinates of the two tokens
//     // 
//     const X = movingToken.center.x;                                 // Nab the X coord for target token
//     const Y = movingToken.center.y;                                 // Nab the Y coord for target token
//     //----------------------------------------------------------------------------------------------
//     // Adjust move distance if necessary because tokens are already too close.
//     // 
//     if (distBetweenTokens <= 5 && move < 0) return (true)       // Bail if adjacent && Pull
//     if (move === -3 && distBetweenTokens < 20) move = -2        // 4 spaces apart, can move 3
//     if (move === -2 && distBetweenTokens < 15) move = -1        // 3 spaces apart, can move 2
//     if (move === -1 && distBetweenTokens < 10) move = 0         // 2 spaces apart, can move 1
//     if (move === 0) return (true)                               // Move = 0 is the trivial case
//     if (TL > 2) jez.trace(`${TAG} After adjusting distance, move ==>`,move)
//     //----------------------------------------------------------------------------------------------
//     // Validity check on move
//     // 
//     if (!moveArray.includes(move)) 
//         return jez.badNews(`Move distance requested, ${move} not supported by ${FUNCNAME}`);
//     let squareCorner = moveSpaces(move, {traceLvl: TL})
//     if (!squareCorner) {
//     jez.postMessage({color: jez.randomDarkColor(), fSize: 14, icon: movingToken.data.img, 
//         title: `${movingToken.name} path obstructed`, 
//         msg: `${movingToken.name} path obstructed for the intended movement of ${move} spaces.
//              GM needs to adjudicate the result.`, 
//         token: movingToken})
//         return(false)
//     }
//     if (TL > 2) jez.trace(`${TAG} Square Corner`, squareCorner)
//     await jez.wait(delay)
//     //----------------------------------------------------------------------------------------------
//     // Obtain the code for TokenUpdate which must be runAsGM enabled.
//     // 
//     const TokenUpdate = game.macros.find(i => i.name === "TokenUpdate");
//     if (!TokenUpdate) return jez.badNews(`REQUIRED: Missing TokenUpdate GM Macro!`, "e");
//     let AdvancedMacros = getProperty(TokenUpdate.data.flags, "advanced-macros");
//     if (!AdvancedMacros) return jez.badNews(`REQUIRED: Macro requires AdvancedMacros Module!`, 'e');
//     else if (!AdvancedMacros.runAsGM) return jez.badNews(`REQUIRED: TokenUpdate "Execute As GM" must be checked.`, 'e');
//     await TokenUpdate.execute(movingToken.id, squareCorner);
//     // Following line dies with a permission error for normal players.
//     // await movingToken.document.update(squareCorner)
//     return (true)
//     //----------------------------------------------------------------------------------------------
//     // Count of spaces to move 1, 2 or 3, return the squarecorner of destination or false if the 
//     // path was obstructed.
//     //----------------------------------------------------------------------------------------------
//     function moveSpaces(count, options={}) {
//         const FUNCNAME = "moveSpaces(count, options={})";
//         const FNAME = FUNCNAME.split("(")[0]
//         const TAG = `jez.lib ${FNAME} |`
//         const TL = options.traceLvl ?? 0
//         if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
//         if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
//             "count   ==>", count,
//             "options ==>", options);
//         //---------------------------------------------------------------------------------------------------
//         // Set Function specific variables
//         //
//         let dist = [];
//         let minDist = 99999999999;
//         let maxDist = 0;
//         let minIdx = 0;
//         let maxIdx = 0;
//         //---------------------------------------------------------------------------------------------------
//         // Build array of potential squares
//         //
//         let destSqrArray = buildSquareArray(Math.abs(count), {traceLvl: TL});
//         //---------------------------------------------------------------------------------------------------
//         // Add distance between the coords to array
//         //
//         for (let i = 1; i < destSqrArray.length; i++) 
//             destSqrArray[i].dist = canvas.grid.measureDistance(destSqrArray[i], anchorToken.center);
//         if (TL > 2) jez.trace(`${TAG} Destination Square Array`, destSqrArray);
//         //---------------------------------------------------------------------------------------------------
//         // Add path clear (or not) to the array
//         //
//         for (let i = 1; i < destSqrArray.length; i++) {
//             let ray = new Ray(movingToken.center, destSqrArray[i])
//             destSqrArray[i].clear = true
//             let badLoM = canvas.walls.checkCollision(ray)
//             if (TL > 2) jez.trace(`${TAG} badLoM`, badLoM);
//             if (badLoM) destSqrArray[i].clear = false
//         }
//         if (TL > 2) jez.trace(`${TAG} Destination Square Array`, destSqrArray);
//         //---------------------------------------------------------------------------------------------------
//         // Find the greatest move square
//         //
//         for (let i = 1; i < destSqrArray.length; i++) {
//             if (destSqrArray[i].dist < minDist) { minDist = destSqrArray[i].dist; minIdx = i; }
//             if (destSqrArray[i].dist > maxDist) { maxDist = destSqrArray[i].dist; maxIdx = i; }
//         }
//         if (TL > 2) jez.trace(`${TAG} Max & Min Distances`, 
//             "minDist ==>",minDist, "minIdx  ==>", minIdx,
//             "maxDist ==>",maxDist, "maxIdx  ==>", maxIdx);
//         //---------------------------------------------------------------------------------------------------
//         // Get index of maximum move in appropriate direction
//         //
//         let index = minIdx                  // Assume pull, pick closest space
//         if (count > 0) index = maxIdx       // Change to furthest if pushing
//         //---------------------------------------------------------------------------------------------------
//         // If path is obstructed, return false
//         //
//         if (!destSqrArray[index].clear) return(false)
//         //---------------------------------------------------------------------------------------------------
//         // Calculate and return the square corner
//         //
//         let fudge = GRID_UNIT / 2;
//         if (movingToken.data.width > 1) fudge = GRID_UNIT / 2 * movingToken.data.width;
//         let squareCorner = {};
//         squareCorner.x = destSqrArray[index].x - fudge;
//         squareCorner.y = destSqrArray[index].y - fudge;
//         return squareCorner;
//     }
//     function buildSquareArray(size, options={}) {
//         const FUNCNAME = "buildSquareArray(size, options={})";
//         const FNAME = FUNCNAME.split("(")[0]
//         const TAG = `jez.lib ${FNAME} |`
//         const TL = options.traceLvl ?? 0
//         if (TL > 0) jez.trace(`${TAG} --- Starting ---`);
//         if (TL > 1) jez.trace(`${TAG} --- Starting --- ${FUNCNAME} ---`,
//             'size    ==>', size,
//             "options ==>", options);
//         //---------------------------------------------------------------------------------------------------
//         // Set Function specific variables
//         //
//         let destSqrArray = [];     // destination Square array
//         if (size === 0) return destSqrArray;
//         //----------------------------------------------------------------------------------------------
//         // Size = 1 is a one space move where 8 surrounding spaces will be considered.
//         // The spaces considered are as shown in this "nifty" character graphics "drawing." 
//         // 
//         //       +---+---+---+
//         //       | 1 | 2 | 3 |
//         //       +---+---+---+
//         //       | 4 | 5 | 6 |
//         //       +---+---+---+
//         //       | 7 | 8 | 9 |
//         //       +---+---+---+
//         //----------------------------------------------------------------------------------------------
//         if (size === 1) {
//             for (let i = 1; i < 10; i++) destSqrArray[i] = {};
//             destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - GRID_UNIT;
//             destSqrArray[4].y = destSqrArray[5].y = destSqrArray[6].y = Y;
//             destSqrArray[7].y = destSqrArray[8].y = destSqrArray[9].y = Y + GRID_UNIT;
//             destSqrArray[1].x = destSqrArray[4].x = destSqrArray[7].x = X - GRID_UNIT;
//             destSqrArray[2].x = destSqrArray[5].x = destSqrArray[8].x = X;
//             destSqrArray[3].x = destSqrArray[6].x = destSqrArray[9].x = X + GRID_UNIT;
//             return destSqrArray;
//         }
//         //----------------------------------------------------------------------------------------------
//         // Sie = 2 is a two space move where 12 spaces may be solution.
//         // The spaces considered are as shown in this "nifty" character graphics "drawing."
//         //
//         //            +----+----+----+
//         //            |  1 |  2 |  3 |    
//         //       +----+----+----+----+----+
//         //       | 12 |    |    |    |  4 | 
//         //       +----+----+----+----+----+
//         //       | 11 |    | xx |    |  5 |
//         //       +----+----+----+----+----+
//         //       | 10 |    |    |    |  6 |
//         //       +----+----+----+----+----+
//         //            |  9 |  8 |  7 |  
//         //            +----+----+----+
//         //----------------------------------------------------------------------------------------------
//         if (size === 2) {
//             for (let i = 1; i <= 12; i++) destSqrArray[i] = {};
//             destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - 2 * GRID_UNIT;
//             destSqrArray[4].y = destSqrArray[12].y = Y - GRID_UNIT;
//             destSqrArray[5].y = destSqrArray[11].y = Y;
//             destSqrArray[6].y = destSqrArray[10].y = Y + GRID_UNIT;
//             destSqrArray[7].y = destSqrArray[8].y = destSqrArray[9].y = Y + 2 * GRID_UNIT;
//             destSqrArray[10].x = destSqrArray[11].x = destSqrArray[12].x = X - 2 * GRID_UNIT;
//             destSqrArray[1].x = destSqrArray[9].x = X - GRID_UNIT;
//             destSqrArray[2].x = destSqrArray[8].x = X;
//             destSqrArray[3].x = destSqrArray[7].x = X + GRID_UNIT;
//             destSqrArray[4].x = destSqrArray[5].x = destSqrArray[6].x = X + 2 * GRID_UNIT;
//             return destSqrArray;
//         }
//         //----------------------------------------------------------------------------------------------
//         // Sie = 3 is a three space move where 16 spaces may be the solution.
//         // The spaces considered are as shown in this "nifty" character graphics "drawing."
//         // 
//         //                 +----+----+----+
//         //                 |  1 |  2 |  3 | 
//         //            +----+----+----+----+----+
//         //            |  4 |    |    |    |  5 | 
//         //       +----+----+----+----+----+----+----+
//         //       |  6 |    |    |    |    |    |  7 | 
//         //       +----+----+----+----+----+----+----+
//         //       |  8 |    |    | XX |    |    |  9 | 
//         //       +----+----+----+----+----+----+----+
//         //       | 10 |    |    |    |    |    | 11 | 
//         //       +----+----+----+----+----+----+----+
//         //            | 12 |    |    |    | 13 |    
//         //            +----+----+----+----+----+
//         //                 | 14 | 15 | 16 |   
//         //                 +----+----+----+
//         //----------------------------------------------------------------------------------------------
//         if (size === 3) {
//             for (let i = 1; i <= 16; i++) destSqrArray[i] = {};
//             // Find y coords
//             destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - 3 * GRID_UNIT;
//             destSqrArray[4].y = destSqrArray[5].y = Y - 2 * GRID_UNIT;
//             destSqrArray[6].y = destSqrArray[7].y = Y - 1 * GRID_UNIT;
//             destSqrArray[8].y = destSqrArray[9].y = Y - 0 * GRID_UNIT;
//             destSqrArray[10].y = destSqrArray[11].y = Y + 1 * GRID_UNIT;
//             destSqrArray[12].y = destSqrArray[13].y = Y + 2 * GRID_UNIT;
//             destSqrArray[14].y = destSqrArray[15].y = destSqrArray[16].y = Y + 3 * GRID_UNIT;
//             // Find x coords
//             destSqrArray[6].x = destSqrArray[8].x = destSqrArray[10].x = X - 3 * GRID_UNIT;
//             destSqrArray[4].x = destSqrArray[12].x = X - 2 * GRID_UNIT;
//             destSqrArray[1].x = destSqrArray[14].x = X - 1 * GRID_UNIT;
//             destSqrArray[2].x = destSqrArray[15].x = X - 0 * GRID_UNIT;
//             destSqrArray[3].x = destSqrArray[16].x = X + 1 * GRID_UNIT;
//             destSqrArray[5].x = destSqrArray[13].x = X + 2 * GRID_UNIT;
//             destSqrArray[7].x = destSqrArray[9].x = destSqrArray[11].x = X + 3 * GRID_UNIT;
//             return destSqrArray;
//         }
//     }
//}