dialogSummonUndeads({maxSummons: 6})

/***************************************************************************************************
 * Dialog to obtain the number of skeltons and zombies to summon, returning an object containing:
 * 
 * @typedef  {Object} returnObj
 * @property {integer} numSkeletons - number of skeletons to summon
 * @property {integer} numZombies - number of zombies to summon
 * @property {integer} maxSummons - maximum number of summons allowed
 * @property {string} tryAgain - Message to display on subsequent attempts
 ***************************************************************************************************/
async function dialogSummonUndeads(args) {
    //---------------------------------------------------------------------------------------------------
    // Set function specific variables
    //
    let content = ""
    let numSkeletons = args?.numSkeletons ?? 0
    let numZombies = args?.numZombies ?? 0
    let maxSummons = args?.maxSummons ?? 5
    let tryAgain = args?.tryAgain ?? ""
    //---------------------------------------------------------------------------------------------------
    // Build the HTML string for the dialog
    //
    if (tryAgain) content += `
    <p style="color:Red;">${tryAgain}</p><p></p>
  `
    content += `
    <form class="flexcol">
      <p style="color:DarkSlateBlue;">You can animate up to ${maxSummons} small or medium corpses that 
    you can see within 60 feet. They can be a mix of skeletons and zombies as you prefer, but no more 
    than ${maxSummons} total.<br></p>
      <p></p>
      <div class="form-group">
        <label for="numSkeletons">Skeltons</label>
        <input type="text" name="numSkeletons" value=${numSkeletons}>
      </div>
      <div class="form-group">
      <label for="numZombies">Zombies</label>
      <input type="text" name="numZombies" value=${numZombies}>
    </div>
    <p></p>
    <p style="color:DarkRed;">This spell does not check for the existance/visibility of corpses to animate, 
    that is left to the players to handle.</p>
    </form>
    `
    //---------------------------------------------------------------------------------------------------
    // Define the dialog to be displayed
    //
    let d = await new Dialog({
        title: 'Danse Macabre Summoning',
        content: content,
        buttons: {
            //------------------------------------------------------------------------------------------
            // Define the "yes" button, the button on the left
            //
            yes: {
                icon: '<i class="fas fa-check"></i>',
                label: 'Continue',
                callback: (html) => {
                    numSkeletons = parseInt(html.find('[name="numSkeletons"]').val());
                    numZombies = parseInt(html.find('[name="numZombies"]').val());
                    jez.log("Summons Counts Entered","numSkeletons", numSkeletons, "numZombies  ", numZombies)
                    //-----------------------------------------------------------------------------------
                    // Build the object that will be passed to recursive call if required
                    //
                    let newArgs = {
                        numSkeletons: numSkeletons,
                        numZombies: numZombies,
                        maxSummons: maxSummons, 
                        tryAgain: "Please enter valid integers."
                    }
                    //-----------------------------------------------------------------------------------
                    // Validate the input calling this function recursively if it was bad
                    //
                    if (isNaN(numSkeletons) || isNaN(numZombies)) {
                        jez.log("Try again, entries were not parseable as integers")
                        newArgs.tryAgain = "Please enter valid integers in the quantity fields."
                        dialogSummonUndeads(newArgs)
                    } else if (numSkeletons === 0 && numZombies === 0) {
                            jez.log("Try again, since zero was entered for the total")
                            newArgs.tryAgain = `Did you really want to summon zero undeads?<br>If so 
                            Cancel this dialog.`
                            dialogSummonUndeads(newArgs)
                        } else if (numSkeletons < 0 || numZombies < 0) {
                            jez.log("Try again, a negative number of summons was entered")
                            newArgs.tryAgain = `Ok, really?  You can't summon a negative quantity of critters.
                            <br>Try again.`
                            dialogSummonUndeads(newArgs)
                        } else if (numSkeletons + numZombies > maxSummons) {
                            jez.log(`Try again, attempted to summon ${numSkeletons + numZombies}, max of 
                            ${maxSummons} allowed`)
                            newArgs.tryAgain = `Ambition is one thing, but that was too much. You attempted to 
                            summon ${numSkeletons + numZombies}, max of ${maxSummons} allowed.  Try again.`
                            dialogSummonUndeads(newArgs)
                        }                      
                        else {
                        jez.log("Call the next function as we have a valid input.")
                        doIt(newArgs)
                    }
                }
            },
            //------------------------------------------------------------------------------------------
            // Define the "no" button, the button on the right
            //
            no: {
                icon: '<i class="fas fa-times"></i>',
                label: 'Cancel',
                callback: (html) => {
                    console.log('Dialog Cancelled');
                }
            },
        },
        default: 'yes',
        close: () => {
            console.log('Dialog Closed');
        }
    }).render(true)
}

/***************************************************************************************************
 * Stubby Function to represent a callback
 ***************************************************************************************************/
function doIt(args) {
    let numSkeletons = args?.numSkeletons 
    let numZombies = args?.numZombies
    jez.log("Inputs to doIt(args)","numSkeletons",numSkeletons,"numZombies",numZombies)
}