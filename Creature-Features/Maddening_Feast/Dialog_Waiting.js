/***
 * Snippet that pops a custom dialog and waits for it to be resolved.  
 * lifted from thatLonelyBuBear's sample code.
 * 
 * https://discord.com/channels/170995199584108546/699750150674972743/1039935030052540506
 * 
 ***/

const myPromise = await new Promise((resolve, reject) => {
    let e = new Dialog({
        title: 'Title',
        content: 'Text',
        buttons: {
            go: {
                icon: "<i class='fas fa-chec'></i>",
                label: "Go for it!",
                callback: (html) => { 
                    console.log('Choosing to go')
                    console.log(html)
                    resolve("picked go")   // Returns value in promise
                }
            },
            no: {
                icon: "<i class='fas fa-times'></i>",
                label: "Had enough!",
                callback: () => { 
                    console.log('Opting to abort')
                    resolve("Picked no")  // Returns value in promise
                }
            },
        }
    }).render(true)
})
console.log(myPromise)
