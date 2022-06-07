const LAST_ARG = args[args.length - 1];
let aActor = canvas.tokens.get(LAST_ARG.tokenId).actor;
let aToken = canvas.tokens.get(LAST_ARG.tokenId);
let aItem = args[0]?.item;
let myTarget = canvas.tokens.objects.children.find(e => e.data.actorId === '%ACTORID%');
let damageRoll = new Roll(`%NUMDICE%d8`).evaluate({ async: false });
runVFX(myTarget)
game.dice3d?.showForRoll(damageRoll);
new MidiQOL.DamageOnlyWorkflow(aActor, aToken, damageRoll.total, 'fire', [myTarget], damageRoll,
    { flavor: `${myTarget.name} burns from the heat!`, itemCardId: args[0].itemCardId });


/***************************************************************************************************
 * Run VFX
 ***************************************************************************************************/
 function runVFX(target) {
    let color = ""
    const IMAGE = aItem.img.toLowerCase()
    if (IMAGE.includes("blue")) color = "blue"
    else if (IMAGE.includes("green")) color = "green"
    else if (IMAGE.includes("orange")) color = "orange"
    else if (IMAGE.includes("purple")) color = "purple"
    else if (IMAGE.includes("magenta")) color = "purple"
    else if (IMAGE.includes("sky")) color = "blue"
    else if (IMAGE.includes("royal")) color = "green"
    if (!color) color = "orange"
  
    new Sequence()
        .effect()
        //.file("jb2a.fire_bolt.orange")
        .file(`jb2a.flames.01.${color}`)
        //.duration(10000)
        // .persist()
        .fadeIn(1000)
        .opacity(0.80)
        .fadeOut(1000)
        // .name(VFX_NAME)
        .atLocation(target)
        .play()
  }