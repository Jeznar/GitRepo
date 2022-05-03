const MACRONAME = "Thunderwave.0.2"
/*****************************************************************************************
 * Slap a text message on the item card indicating Who and What should be moved by the 
 * spell.
 * 
 * Spell Description: A wave of thunderous force sweeps out from you. Each creature in a 
 *   15-foot cube originating from you must make a Constitution saving throw. On a failed 
 *   save, a creature takes 2d8 thunder damage and is pushed 10 feet away from you. On a 
 *   successful save, the creature takes half as much damage and isn't pushed.
 *  
 *   In addition, unsecured objects that are completely within the area of effect are 
 *   automatically pushed 10 feet away from you by the spell's effect, and the spell emits 
 *   a thunderous boom audible out to 300 feet.
 * 
 *   Higher Level.When you cast this spell using a spell slot of 2nd level or higher, the 
 *   damage increases by 1d8 for each slot level above 1st.
 * 
 * 12/11/21 0.1 Creation of Macro
 * 05/03/22 0.2 Updated for FoundryVTT 9.x
 *****************************************************************************************/
let msg = "";
let xtraMsg=`<br><br>
            Unsecured objects, completely in the area of effect are automatically 
            pushed 10 feet away from you by the spell's effect.<br><br>
            The spell emits a thunderous boom audible out to 300 feet.`
const MACRO = MACRONAME.split(".")[0]     // Trim of the version number and extension
jez.log("---------------------------------------------------------------------------",
    "Starting", `${MACRONAME}`);
for (let i = 0; i < args.length; i++) jez.log(`  args[${i}]`, args[i]);
const lastArg = args[args.length - 1];
let aActor;         // Acting actor, creature that invoked the macro
let aToken;         // Acting token, token for creature that invoked the macro
let aItem;          // Active Item information, item invoking this macro
if (lastArg.tokenId) aActor = canvas.tokens.get(lastArg.tokenId).actor; else aActor = game.actors.get(lastArg.actorId);
if (lastArg.tokenId) aToken = canvas.tokens.get(lastArg.tokenId); else aToken = game.actors.get(lastArg.tokenId);
if (args[0]?.item) aItem = args[0]?.item; else aItem = lastArg.efData?.flags?.dae?.itemData;
// ---------------------------------------------------------------------------------------
// If no target failed, post result and terminate 
//
let failCount = args[0].failedSaves.length 
jez.log(`${failCount} args[0].failedSaves: `,args[0].failedSaves)
if (failCount === 0) {
    msg = `No creatures failed their saving throw.` + xtraMsg;
    jez.log(` ${msg}`, args[0].saves); 
    postResults(msg);
    return;
}
// ---------------------------------------------------------------------------------------
// Loop through those that failed saving thow and knock them back
//
for (let i = 0; i < args[0].failedSaves.length; i++) {
    jez.log(`  ${i}) ${args[0].failedSaves[i].name}`, args[0].failedSaves);
    jez.log(`     args[0].failedSaves[i].id ${args[0].failedSaves[i].id}`)
    let tToken = canvas.tokens.get(args[0].failedSaves[i].id);
    knockback(aToken, tToken, 10);
}
// ---------------------------------------------------------------------------------------
// Post that the target failed and the consequences.
//
msg = `Creatures that failed their saving throw are pushed <b>10 feet</b> from the caster. 
       without provoking opportunity attacks.` + xtraMsg;
jez.log(` ${msg}`);
postResults(msg);
return;
/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************************
 * Knockback function lifted from Crymic's Thunderous Smite Macro which he borrowed from theripper93
 ***************************************************************************************************/
async function knockback(ptoken, ttoken, distance) {
    const FUNCNAME = "knockback(ptoken, ttoken, distance)";
    jez.log("------updateKB(center, originalcenter)-------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "ptoken", ptoken,
        "ttoken", ttoken,
        "distance", distance);

    const x1 = ptoken.center.x;
    jez.log(`x1, ${x1}`)
    const x2 = ttoken.center.x;
    jez.log(`x2, ${x2}`)
    const y1 = ptoken.center.y;
    jez.log(`y1, ${y1}`)
    const y2 = ttoken.center.y;
    jez.log(`y2, ${y2}`)

    let angcoeff = Math.abs((y2 - y1) / (x2 - x1));
    if (angcoeff > 1) angcoeff = 1 / angcoeff;
    const unitDistance = distance + (distance * Math.sqrt(2) - distance) * angcoeff;
    const gridUnit = canvas.scene.data.grid;
    jez.log("------","angcoeff", angcoeff, "unitDistance", unitDistance);
    distance = (distance * canvas.scene.data.grid) / canvas.scene.data.gridDistance;

    if (ptoken.center.x == ttoken.center.x) {
        if (ptoken.center.y - ttoken.center.y > 0) {
            await updateKB({ "y": ttoken.data.y - distance, "x": ttoken.data.x }, { "x": ttoken.center.x, "y": ttoken.center.y - distance })
        }
        else {
            await updateKB({ "y": ttoken.data.y + distance, "x": ttoken.data.x }, { "x": ttoken.center.x, "y": ttoken.center.y + distance })
        }
    }
    else if (ptoken.center.y == ttoken.center.y) {
        if (ptoken.center.x - ttoken.center.x > 0) {
            await updateKB({ "x": ttoken.data.x - distance, "y": ttoken.data.y }, { "x": ttoken.center.x - distance, "y": ttoken.center.y })
        }
        else {
            await updateKB({ "x": ttoken.data.x + distance, "y": ttoken.data.y }, { "x": ttoken.center.x + distance, "y": ttoken.center.y })
        }
    }
    else {
        let fdest = await findDestination();
        let coord = fdest.reduce(function (prev, curr) {
            return (Math.abs(curr.dist - unitDistance) < Math.abs(prev.dist - unitDistance) ? curr : prev);
        });
        fdest = await canvas.grid.getSnappedPosition(coord.x - gridUnit / 2, coord.y - gridUnit / 2, 1);
        await updateKB(fdest);
    }

    //-------------------------------------------------------------------------------
    // 
    //
    async function getXy(x) {
        return (y2 - y1) * (x - x1) / (x2 - x1) + y1;
    }
    //-------------------------------------------------------------------------------
    // 
    //
    async function findDestination() {
        const scenew = canvas.dimensions.width;
        const FUNCNAME = "findDestination()";
        jez.log("--------findDestination()----------",
            "Starting", `${MACRONAME} ${FUNCNAME}`,
            "scenew", scenew);

        let coordinatesArray = [];
        for (let i = 0; i <= scenew; i += 1) {
            let ty = await getXy(i);
            let snapCoord = await canvas.grid.getCenter(i, ty);
            let cdist = await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ttoken.center);
            if (await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ptoken.center) > await canvas.grid.measureDistance(ttoken.center, ptoken.center) && await canvas.grid.measureDistance({ "x": snapCoord[0], "y": snapCoord[1] }, ptoken.center) > unitDistance) {
                coordinatesArray.push({ "x": i, "y": ty, "dist": cdist });
            }
        }
        jez.log("--------findDestination()----------",
            "Ending", `${MACRONAME} ${FUNCNAME}`);
        return coordinatesArray;
    }
    //-------------------------------------------------------------------------------
    //
    //
    async function updateKB(center, originalcenter) {
        const FUNCNAME = "findDestination()";
        jez.log("------updateKB(center, originalcenter)-------",
            "Starting", `${MACRONAME} ${FUNCNAME}`,
            "center", center,
            "originalcenter", originalcenter);

        if (originalcenter) {
            if (await ttoken.checkCollision(originalcenter)) {
                if (knockDist <= 5) return;
                knockDist -= 5;
                await knockback(pusher, pushed, knockDist);
            }
            else {
                await ttoken.document.update(center);
            }
        }
        else {
            if (await ttoken.checkCollision(center)) {
                if (knockDist <= 5) return;
                knockDist -= 5;
                await knockback(pusher, pushed, knockDist);
            }
            else {
                await ttoken.document.update(center);
            }
        }
        jez.log("------updateKB(center, originalcenter)-------",
            "Ending", `${MACRONAME} ${FUNCNAME}`);
    }
}
/***************************************************************************************************
 * Post results to the chat card
 ***************************************************************************************************/
 function postResults(msg) {
    jez.log(msg);
    let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
    jez.addMessage(chatMsg, { color: jez.randomDarkColor(), fSize: 14, msg: msg, tag: "saves" });
}