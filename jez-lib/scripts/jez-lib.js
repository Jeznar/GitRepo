// https://hackmd.io/@akrigline/ByHFgUZ6u/%2FojFSOsrNTySh9HbzTE3Orw
console.log(`
██████████████████████████████████████████
███▄─▄█▄─▄▄─█░▄▄░▄█▀▀▀▀▀██▄─▄███▄─▄█▄─▄─▀█
█─▄█─███─▄█▀██▀▄█▀█████████─██▀██─███─▄─▀█
▀▄▄▄▀▀▀▄▄▄▄▄▀▄▄▄▄▄▀▀▀▀▀▀▀▀▄▄▄▄▄▀▄▄▄▀▄▄▄▄▀▀`)
/*************************************************************************************
 * Register the module with Developer Mode
 *************************************************************************************/
Hooks.once('devModeReady', ({ registerPackageDebugFlag }) => {
    registerPackageDebugFlag(jez.ID);
});

/*************************************************************************************
 * Create a Class for our Module to hold all my nifty functions
 *************************************************************************************/
class jez {
    static ID = 'jez-lib';
    static TEMPLATES = {
        TODOLIST: `modules/${this.ID}/templates/todo-list.hbs`
    }

    static contents() {
        let functions = `
  addMessage(chatMsg, msgParm) -- add text message to specified chat message.
  log(...parms) -- depending on developer mode debug flag writes messages to console.    
  postMessage(msgParm) -- post a new message to the game chat, optioanlly with parms.
  wait(ms) -- async call to waith for ms milliseconds`
        console.log("")
        console.log("Jez-lib includes a number of functions.")
        console.log(functions)
        console.log("")
    }

    /***************************************************************************************************
     * DEBUG Logging
     * 
     * If passed an odd number of arguments, put the first on a line by itself in the log,
     * otherwise print them to the log seperated by a colon.  
     * 
     * If more than two arguments, add numbered continuation lines. 
     * 
     * Ex: jez.log("Post this message to the console", variable)
     ***************************************************************************************************/
    static log(...parms) {
        if (game.modules.get('_dev-mode')?.api?.getPackageDebugValue(this.ID) === false) return (true)
        let numParms = parms.length;    // Number of parameters received
        let i = 0;                      // Loop counter
        let lines = 1;                  // Line counter 

        if (numParms % 2) {  // Odd number of arguments
            console.log(this.ID, '|', parms[i++])
            for (i; i < numParms; i = i + 2) console.log(this.ID, '|', ` (${lines++})`, parms[i], ":", parms[i + 1]);
        } else {            // Even number of arguments
            console.log(this.ID, '|', parms[i], ":", parms[i + 1]);
            i = 2;
            for (i; i < numParms; i = i + 2) console.log(this.ID, '|', ` (${lines++})`, parms[i], ":", parms[i + 1]);
        }
    }

    /***************************************************************************************************
     * Post a new chat message -- msgParm should be a string for a simple message or an object with 
     * some or all of these fields set below for the chat object.  
     * 
     * Example Calls:
     *  jez.postMessage("Hi there!")
     *  jez.postMessage({color:"purple", fSize:18, msg:"Bazinga", title:"Sheldon says..." })
     *  jez.PostMessage({color:"purple", fSize:18, msg:"Bazinga", title:"Sheldon says...", token:aToken})
     ***************************************************************************************************/
    static async postMessage(msgParm) {
        const FUNCNAME = "postMessage(msgParm)";
        jez.log(`-------------- Starting ${FUNCNAME} -----------`);
        let typeOfParm = typeof (msgParm)
        let chatCard = msgParm
        let speaker = null              // The speaking Token
        if (typeOfParm === "object") {
            if (msgParm?.token) {       // If a speaking token is defined it must be a Token5e
                jez.log("msgParm.token?.constructor.name", msgParm.token?.constructor.name)
                if (msgParm.token?.constructor.name !== "Token5e") {
                    let msg = `Coding error. Speaking Token (${msgParm?.token?.name}) is a 
                               ${msgParm.token?.constructor.name} must be a Token5e`
                    ui.notifications.error(msg)
                    jez.log(msg)
                    return (null)
                }
            }
            const CHAT = {
                title: msgParm?.title || "Generic Chat Message",
                fSize: msgParm?.fSize || 12,
                color: msgParm?.color || "black",
                icon: msgParm?.icon || "icons/vtt-512.png",
                msg: msgParm?.msg || "Maybe say something useful...",
                token: msgParm?.token || null       // Token5e that is speaking
            }
            speaker = CHAT.token
            jez.log("speaker", speaker)
            chatCard = `
            <div class="dnd5e chat-card item-card midi-qol-item-card">
                <header class="card-header flexrow">
                    <img src="${CHAT.icon}" title="${CHAT.title}" width="36" height="36">
                    <h3 class="item-name">${CHAT.title}</h3>
                </header>
                <div class="card-buttons">
                    <p style="color:${CHAT.color};font-size:${CHAT.fSize}px">
                        ${CHAT.msg}</p>
                </div>
            </div>`
        }
        //await ChatMessage.create({ content: chatCard });
        await ChatMessage.create({
            //speaker: ChatMessage.getSpeaker(controlledToken),
            speaker: speaker ? ChatMessage.getSpeaker(speaker) : null,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: chatCard
        });

        await jez.wait(100);
        await ui.chat.scrollBottom();
        jez.log(`-------------- Finished ${FUNCNAME}-----------`);
        return;
    }

    /***************************************************************************************************
     * addMessage to specified chatMsg.  This presumes it is a Midi-QoL style HTML chat card.
     * chatMsg frequently obtained like so:
     *  let chatMsg = game.messages.get(args[args.length - 1].itemCardId);
     *  
     * Example Calls:
     *  jez.addMessage(chatMsg, "Hi there!")
     *  jez.addMessage(chatMsg,{color:"purple",fSize:14,msg:"Bazinga, Sheldon Wins!",tag:"saves"})
     * 
     * If msgParm is provided as an object
     * @typedef  {Object} msgParm
     * @property {number} fSize   - Font Size, 12 matches typical Foundry font
     * @property {string} color   - Name or hex code, https://www.w3schools.com/tags/ref_colornames.asp
     * @property {string} msg     - Actual text to be posted into chat
     * @property {string} tag     - Tag mapping into HTML from: saves, attack, damage, hits, other   
     ***************************************************************************************************/
    static async addMessage(chatMsg, msgParm) {
        const FUNCNAME = "postChatMessage(chatMsg, msgParm)";
        jez.log(`-------------- Starting ${FUNCNAME} -----------`);
        const allowedTags = ["saves", "attack", "damage", "hits", "other"]
        //-----------------------------------------------------------------------------------------------
        // chatMsg must be a ChatMessage object
        //
        if (chatMsg?.constructor.name !== "ChatMessage") {
            let errMsg = `Coding error. Chat message passed (${chatMsg}) is a ${chatMsg?.constructor.name}, must be ChatMessage.`
            jez.log("--- ERROR ---", errMsg)
            ui.notifications.error(errMsg)
            return (false)
        }
        //-----------------------------------------------------------------------------------------------
        // chatMsg will be a simple string unless msgParm is an object
        //
        let chatTag = "saves"   // Default value
        let chatMsg = msgParm;
        if (typeof (msgParm) === "object") {
            const CHAT = {
                fSize: msgParm?.fSize || 14,
                color: msgParm?.color || "purple",
                msg: msgParm?.msg || "Maybe say something useful...",
                tag: msgParm?.tag || "saves-display"
            }
            chatMsg = `<div class="card-buttons"><p style="color:${CHAT.color};font-size:${CHAT.fSize}px">${CHAT.msg}</p></div>`
            if (!allowedTags.includes(CHAT.tag)) {
                ui.notifications.error(`Coding error. ${CHAT.tag} is not a defined anchor word`)
                return (false)
            }
            chatTag = CHAT.tag
        }
        jez.log("chatMsg", chatMsg)
        //-----------------------------------------------------------------------------------------------
        // Put correct suffix on the chatTag
        //
        switch (chatTag) {
            case "saves":
            case "hits": chatTag += "-display"; break;
            case "attack":
            case "damage":
            case "other": chatTag += "-roll"; break;
        }
        jez.log("chatTag", chatTag)
        //-----------------------------------------------------------------------------------------------
        // Add our new text to the HTML using a RegEx which needs to be built
        //
        const searchString = `<div class="end-midi-qol-${chatTag}">`;
        const regExp = new RegExp(searchString, "g");
        const replaceString = `<div class="end-midi-qol-${chatTag}">${chatMsg}`;
        let content = await duplicate(chatMsg.data.content);
        content = await content.replace(regExp, replaceString);
        await chatMsg.update({ content: content });

        await jez.wait(100);
        await ui.chat.scrollBottom();
        jez.log(`-------------- Finished ${FUNCNAME}-----------`);
        return;
    }
    /***************************************************************************************************
     * getRange
     * 
     * Obtain the range defined on specified item as long as the units are in allowed units
     ***************************************************************************************************/
    static getRange(itemD, allowedUnits) {
        let range = itemD.data.range?.value;
        let unit = itemD.data.range?.units;
        jez.log("range", range, "unit", unit);
        if (!allowedUnits.includes(unit)) {
            let msg = `Unit ${unit} not in allowed units`
            jez.log(msg, allowedUnits);
            ui.notifications.warn(msg);
            return (0);
        }
        return (range);
    }
    /***************************************************************************************************
     * inRange
     * 
     * Check to see if two entities are in range with 4 foot added
     * to allow for diagonal measurement to "corner" adjacancies
     ***************************************************************************************************/
    static inRange(token1, token2, maxRange) {
        let distance = canvas.grid.measureDistance(token1, token2).toFixed(1);
        if (distance > (maxRange + 4)) {
            let msg = `jez.inRange: Distance between ${token1.name} and ${token2.name} is ${distance}`
            jez.log(msg);
            //ui.notifications.warn(msg);
            return (false);
        }
        return (true);
    }
    /***************************************************************************************************
     * tokensInRange
     * 
     * Function that returns an array of the tokens that are within a specified range -or- null if no
     * tokens are in range from the specified token. Exclude the origin token.
     ***************************************************************************************************/
    static async tokensInRange(sel, range) {
        let inRangeTokens = [];
        let toFarCnt, inRangeCnt = 0
        let toFar = ""
        let fudge = 4 //fudge factor to allow diagonals to work better
        //----------------------------------------------------------------------------------------------
        // Check the types of parameters passed 
        //
        if (sel?.constructor.name !== "Token5e") {
            let msg = `Coding error. Selection (${sel}) is a ${sel?.constructor.name} must be a Token5e`
            ui.notifications.error(msg)
            jez.log(msg)
            return (null)
        }
        if (typeof (range) !== "number") {
            let msg = `Coding error. Range (${range}) is a ${typeof (range)} must be a number`
            ui.notifications.error(msg)
            jez.log(msg)
            return (null)
        }
        //----------------------------------------------------------------------------------------------
        // Perform the interesting bits
        //
        canvas.tokens.placeables.forEach(token => {
            let d = canvas.grid.measureDistance(sel, token);
            d = d.toFixed(1);
            if (sel === token) { // Skip the origin token
                jez.log(` Skipping the origin token, ${sel.name}`, "sel", sel, "token", token)
            } else {
                jez.log(` Considering ${token.name} at ${d} distance`);
                if (d > range + fudge) {
                    jez.log(`  ${token.name} is too far away`);
                    if (toFarCnt++) { toFar += ", " };
                    toFar += token.name;
                    jez.log(`  To Far #${toFarCnt} ${token.name} is ${d} feet. To Fars: ${toFar}`);
                } else {
                    jez.log(`  ${token.name} is in range`);
                    inRangeTokens.push(token);
                    jez.log(`  In Range #${++inRangeCnt} ${token.name} is ${d} feet. In Ranges:`, inRangeTokens);
                }
            }
        });
        if (!inRangeCnt) return (null)
        return (inRangeTokens)
    }
    /***************************************************************************************
     * Create and process check box dialog, passing array onto specified callback function
     * 
     * Font Awesome Icons: https://fontawesome.com/icons
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from following list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices, perhaps pre-sorted 
     * 
     * Sample Call:
     *   const queryTitle = "Select Item in Question"
     *   const queryText = "Pick one from the list" 
     *   pickCheckListArray(queryTitle, queryText, pickRadioCallBack, actorItems.sort());
     ***************************************************************************************/
    static async pickCheckListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
        jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
            `queryTitle`, queryTitle,
            `queryText`, queryText,
            `pickCallBack`, pickCallBack,
            `queryOptions`, queryOptions);
        let msg = ""
        if (typeof (pickCallBack) != "function") {
            msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
            ui.notifications.error(msg);
            console.log(msg);
            return
        }
        if (!queryTitle || !queryText || !queryOptions) {
            msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
   but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
            ui.notifications.error(msg);
            console.log(msg);
            return
        }
        let template = `
<div>
<label>${queryText}</label>
<div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
`   // Back tick on its on line to make the console output better formatted
        for (let option of queryOptions) {
            template += `<input type="checkbox" id="${option}" name="selectedLine" value="${option}"> <label for="${option}">${option}</label><br>
`   // Back tick on its on line to make the console output better formatted
        }
        template += `</div></div>`
        jez.log(template)

        let selections = []
        new Dialog({
            title: queryTitle,
            content: template,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'Selected Only',
                    callback: async (html) => {
                        jez.log("html contents", html)

                        html.find("[name=selectedLine]:checked").each(function () {
                            jez.log($(this).val());
                            selections.push($(this).val())
                        })
                        pickCallBack(selections)
                    },
                },
                all: {
                    icon: '<i class="fas fa-check-double"></i>',
                    label: 'All Displayed',
                    callback: async (html) => {
                        jez.log("Selected All", queryOptions)
                        pickCallBack(queryOptions)
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel',
                    callback: async (html) => {
                        jez.log('canceled')
                        pickCallBack(null)
                    },
                },
            },
            default: 'cancel',
        }).render(true)
        jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
        return;
    }
    /***************************************************************************************
     * Create and process selection dialog, passing it onto specified callback function
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from drop down list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices
     ***************************************************************************************/
    static async pickFromListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
        jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
            `queryTitle`, queryTitle,
            `queryText`, queryText,
            `pickCallBack`, pickCallBack,
            `queryOptions`, queryOptions);
        let msg = ""

        if (typeof (pickCallBack) != "function") {
            msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
            ui.notifications.error(msg);
            jez.log(msg);
            return
        }

        if (!queryTitle || !queryText || !queryOptions) {
            msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
               but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
            ui.notifications.error(msg);
            jez.log(msg);
            return
        }

        let template = `
    <div>
    <div class="form-group">
        <label>${queryText}</label>
        <select id="selectedOption">`
        for (let option of queryOptions) {
            template += `<option value="${option}">${option}</option>`
        }
        template += `</select>
    </div></div>`

        new Dialog({
            title: queryTitle,
            content: template,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'OK',
                    callback: async (html) => {
                        const selectedOption = html.find('#selectedOption')[0].value
                        jez.log('selected option', selectedOption)
                        pickCallBack(selectedOption)
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel',
                    callback: async (html) => {
                        jez.log('canceled')
                        pickCallBack(null)
                    },
                },
            },
            default: 'cancel',
        }).render(true)

        jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
        return;
    }
    /***************************************************************************************
     * Create and process radio button dialog, passing it onto specified callback function
     * 
     * const queryTitle = "Select Item in Question"
     * const queryText = "Pick one from following list"
     * pickCallBack = call back function
     * queryOptions array of strings to be offered as choices, perhaps pre-sorted
     * 
     * Sample Call:
     *   const queryTitle = "Select Item in Question"
     *   const queryText = "Pick one from the list" 
     *   pickRadioListArray(queryTitle, queryText, pickRadioCallBack, actorItems.sort());
     ***************************************************************************************/
    static async pickRadioListArray(queryTitle, queryText, pickCallBack, queryOptions) {
        const FUNCNAME = "jez.pickFromList(queryTitle, queryText, ...queryOptions)";
        jez.log("---------Starting ---${FUNCNAME}-------------------------------------------",
            `queryTitle`, queryTitle,
            `queryText`, queryText,
            `pickCallBack`, pickCallBack,
            `queryOptions`, queryOptions);
        let msg = ""
        if (typeof (pickCallBack) != "function") {
            msg = `pickFromList given invalid pickCallBack, it is a ${typeof (pickCallBack)}`
            ui.notifications.error(msg);
            console.log(msg);
            return
        }
        if (!queryTitle || !queryText || !queryOptions) {
            msg = `pickFromList arguments should be (queryTitle, queryText, pickCallBack, [queryOptions]),
           but yours are: ${queryTitle}, ${queryText}, ${pickCallBack}, ${queryOptions}`;
            ui.notifications.error(msg);
            console.log(msg);
            return
        }
        let template = `
    <div>
    <label>${queryText}</label>
    <div class="form-group" style="font-size: 14px; padding: 5px; border: 2px solid silver; margin: 5px;">
    `   // Back tick on its on line to make the console output better formatted
        for (let option of queryOptions) {
            template += `<input type="radio" id="${option}" name="selectedLine" value="${option}"> <label for="${option}">${option}</label><br>
    `   // Back tick on its on line to make the console output better formatted
        }
        template += `</div></div>`
        jez.log(template)

        new Dialog({
            title: queryTitle,
            content: template,
            buttons: {
                ok: {
                    icon: '<i class="fas fa-check"></i>',
                    label: 'OK',
                    callback: async (html) => {
                        jez.log("html contents", html)
                        const SELECTED_OPTION = html.find("[name=selectedLine]:checked").val();
                        jez.log("Radio Button Selection", SELECTED_OPTION)
                        jez.log('selected option', SELECTED_OPTION)
                        pickCallBack(SELECTED_OPTION)
                    },
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: 'Cancel',
                    callback: async (html) => {
                        jez.log('canceled')
                        pickCallBack(null)
                    },
                },
            },
            default: 'cancel',
        }).render(true)
        jez.log(`--------Finished ${FUNCNAME}----------------------------------------`)
        return;
    }
    /***************************************************************************************************
     * getSize of passed token and return an object with information about that token's size.   
     * If a problem occurs getting the size, false will be returned.  
     *  
     * Example Call:
     *  let sizeObj = jez.getSize(tToken)
     * 
     * The returned object will be composed of:
     * @typedef  {Object} CreatureSizes
     * @property {integer} value  - Numeric value of size: 1 is tiny to 6 gargantuan
     * @property {string}  str    - Short form for size generally used in FoundryVTT data 
     * @property {string}  string - Spelled out size all lower case
     * @property {string}  String - Spelled out size with the first letter capitalized   
     ***************************************************************************************************/
    static async getSize(token1) {
        class CreatureSizes {
            constructor(size) {
                this.str = size;
                switch (size) {
                    case "tiny": this.value = 1; this.string = "tiny"; this.String = "Tiny"; break;
                    case "sm": this.value = 2; this.string = "small"; this.String = "Small"; break;
                    case "med": this.value = 3; this.string = "medium"; this.String = "Medium"; break;
                    case "lg": this.value = 4; this.string = "large"; this.String = "Large"; break;
                    case "huge": this.value = 5; this.string = "huge"; this.String = "Huge"; break;
                    case "grg": this.value = 6; this.string = "gargantuan"; this.String = "Gargantuan"; break;
                    default: this.value = 0;  // Error Condition
                }
            }
        }
        let token1SizeString = token1.document._actor.data.data.traits.size;
        let token1SizeObject = new CreatureSizes(token1SizeString);
        let token1Size = token1SizeObject.value;  // Returns 0 on failure to match size string
        if (!token1Size) {
            let message = `Size of ${token1.name}, ${token1SizeString} failed to parse.<br>`;
            jez.console.log(message);
            ui.notifications.error(message);
            return (false);
        }
        jez.log(` Token1: ${token1SizeString} ${token1Size}`)
        return (token1SizeObject)
    }
    /*************************************************************************************
     * wait for parm milliseconds.
     * 
     * ex: await jez.wait(1000) // Wait for 1 second
     *************************************************************************************/
    static async wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
    /***************************************************************************************************
     * Return a random, darkish color name (string)
     ***************************************************************************************************/
    // COOL-THING: Pick a random (dark) color name 
    static randomDarkColor() {
        let colorArray = ["Blue", "BlueViolet", "Brown", "Crimson", "DarkBlue", "DarkMagenta", "DarkRed",
            "FireBrick", "ForestGreen", "Maroon", "MidnightBlue", "Olive", "Purple", "RebeccaPurple",
            "RoyalBlue", "SaddleBrown", "SlateBlue", "SteelBlue", "Teal", "YellowGreen"];
        // Returns a random integer from 0 to (colorArray.length - 1):
        let index = Math.floor(Math.random() * colorArray.length);
        return (colorArray[index])
    }

} // END OF class jez
