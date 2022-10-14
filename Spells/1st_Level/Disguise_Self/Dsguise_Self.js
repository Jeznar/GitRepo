// Crymic's Disguise Self 22.10.13
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
const lastArg = args[args.length - 1];
const tokenD = canvas.tokens.get(lastArg.tokenId);
const itemD = lastArg.efData.flags.dae.itemData;
const transitionType = 6;
const transWait = 300;
const folderName = itemD.name;
const actorList = game.folders.contents.find(i=> i.name === folderName);
if(!actorList) return ui.notifications.error(`Cannot find folder named ${itemD.name}. Please create it and add actors.`);
let getactorImages = actorList.contents.reduce((list, target)=> {
    list += `<label class="radio-label"><input type="radio" name="disguiseForm" value="${target.data.token.img}"><img src="${target.data.token.img}" style="border:0px; width: 50px; height:50px;">${target.name}</label>`;
return list;
}, "");
let params;
if (args[0] === "on") {
    new Dialog({
        title: itemD.name,
        content: `
        <style>
    #disguiseSpell .form-group {
        display: flex;
        flex-wrap: wrap;
        width: 100%;
        align-items: flex-start;
      }
      
      #disguiseSpell .radio-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        justify-items: center;
        flex: 1 0 25%;
        line-height: normal;
      }
      
      #disguiseSpell .radio-label input {
        display: none;
      }
      
      #disguiseSpell img {
        border: 0px;
        width: 50px;
        height: 50px;
        flex: 0 0 50px;
        cursor: pointer;
      }
          
      /* CHECKED STYLES */
      #disguiseSpell [type=radio]:checked + img {
        outline: 2px solid #f00;
      }
    </style>
        <form id="disguiseSpell"><div class="form-group">${getactorImages}</div></form>`,
        buttons: {
            change: {
                label: "Change", callback: async (html) => {
                    let disguise = html.find("input[type='radio'][name='disguiseForm']:checked")[0];
                    let disguiseImage = disguise.value;
                    params = [{
                        filterType: "polymorph",
                        filterId: itemD.name,
                        type: transitionType,
                        padding: 70,
                        magnify: 1,
                        imagePath: disguiseImage,
                        animated:
                        {
                            progress:
                            {
                                active: true,
                                animType: "halfCosOscillation",
                                val1: 0,
                                val2: 100,
                                loops: 1,
                                loopDuration: 1000
                            }
                        }
                    }];
                    await wait(transWait);
                    if (tokenD.TMFXhasFilterId(itemD.name)) await TokenMagic.deleteFilters(tokenD, itemD.name);
                    await wait(transWait);
                    await TokenMagic.addUpdateFilters(tokenD, params);
                }
            }
        },
        default: "change:"
    }).render(true);
}
if (args[0] === "off") {
    params =
        [{
            filterType: "polymorph",
            filterId: itemD.name,
            type: transitionType,
            animated:
            {
                progress:
                {
                    active: true,
                    loops: 1
                }
            }
        }];
    await wait(transWait);
    await TokenMagic.addUpdateFilters(tokenD, params);
    await wait(transWait);
    await TokenMagic.deleteFilters(tokenD, itemD.name);
}