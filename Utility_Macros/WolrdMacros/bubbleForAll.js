async function bubbleForAll(tokenId, message, emote, push=false){
    if ( push ) {
        game.socket.emit(`world.${game.world.id}`, { action: "displayBubble", tokenId, message, emote });
    }
    const token = canvas.tokens.get(tokenId);
    await canvas.hud.bubbles.say(token, message, emote);
}
Hooks.on("ready", () => {
    game.socket.on(`world.${game.world.id}`, request => {
        if ( request.action === "displayBubble") {
            bubbleForAll(request.tokenId, request.message, request.emote);
        }
    });
});