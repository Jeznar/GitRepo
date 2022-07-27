// Target some token(s) and invoke this to exercise function
for ( let token of canvas.tokens.controlled ){
    console.log(`Process: ${token.name}`);
    console.log(await jez.getTokenObjFromUuid(token.actor.uuid, {traceLvl:0}))
}