/* Modify all parameters */
let config = {
    size:2,
    icon: 'icons/svg/hazard.svg',
    label: 'good juice',
    labelOffset: {x:0, y:-canvas.grid.size*3},
    tag: 'chop power',
    drawIcon: false,
    drawOutline: true,
    interval: 1
}

/* Latch start time */
const startTime = game.time.serverTime;
const show = async (template) => {
    
    /* Print out duration as long as the template
     * is in flight (not placed)
     */
    do{
        const timeTaken = game.time.serverTime - startTime;
        await ChatMessage.create({
            content: `Placement has taken ${timeTaken} units of time`
        })
        await warpgate.wait(1000);
    }while(template.inFlight)
}

/* Purposely not awaiting in order to test retrieval */
warpgate.crosshairs.show(config, {show})
warpgate.crosshairs.show();

await warpgate.wait(200);

/* Get by tag and ensure we found the correct one */
const crosshairs = warpgate.crosshairs.getTag('chop power');

await ChatMessage.create({
    content: `getTag was ${crosshairs.label === 'good juice' ? 'successful' : 'NOT SUCCESSFUL'}` 
})

/* wait 3 seconds and simulate a cancel (right click) for the first crosshairs */
await warpgate.wait(3000);
crosshairs.cancelHandler()

/* get the second crosshairs w/default tag */
const finalCrosshairs = warpgate.crosshairs.getTag('crosshairs');

/* simulate a left click */
finalCrosshairs.activeLeftClickHandler();

/* ensure that the second crosshairs was ended by a left click */
ui.notifications.info(`Crosshairs was ${finalCrosshairs.cancelled ? '' : 'NOT'} canceled improperly at <${finalCrosshairs.x},${finalCrosshairs.y}>`)