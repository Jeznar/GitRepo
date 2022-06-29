const MACRONAME = "SummonCreatureMacro_0.1"
/***************************************************************************************
 * Run as GM Macro that Jon had put in place 
 * 
 * 11/29/21 0.1 Add header & debug
 ***************************************************************************************/
const minionName = args[0];
const X = args[1];
const Y = args[2];
const update = args[3] ?? {};
jez.log(`------Executing ${MACRONAME}-------`,`minion: ${minionName}`,
    `coords: ${X},${Y}`,`update:`, update);
await Summon(minionName, X, Y, update);
jez.log(`Ending ${MACRONAME}`);
return;

/***************************************************************************************
 * Summon passed token, inputs expected:
 *  actorName: string specifying the actor that should be summoned to the scene
 *  X,Y: x and y coordinates to place the token's center
 *  update: a list of attibutes to update, if any
 ***************************************************************************************/
async function Summon(actorName, X, Y, update = {}) {
    const viewedScene = game.scenes.viewed;
    const summonActor = game.actors.getName(actorName);
    const summonTokenData = await summonActor.getTokenData();
    const squareWidth = viewedScene.data.grid;
    jez.log(`-------------`,` summonActor:`,summonActor,` summonTokenData:`,summonTokenData,
        ` square: `,squareWidth,` update: `,update);
    /*************************************************************************************
    * Place the token at the X,Y coordinates passed adjusted by half the width of a grid 
    * on current scene. 
    *************************************************************************************/
    summonTokenData.update({
        x: X-squareWidth/2,
        y: Y-squareWidth/2
    });

    const placedTokenDocs = await viewedScene.createEmbeddedDocuments(Token.embeddedName, [summonTokenData]);
    placedTokenDocs.forEach(t => t.actor.update(update));
}