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
  addMessage(chatMessage, msgParm) -- add text message to specified chat message.
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
     * addMessage to specified chatMessage.  This presumes it is a Midi-QoL style HTML chat card.
     * chatMessage frequently obtained like so:
     *  let chatMessage = game.messages.get(args[args.length - 1].itemCardId);
     *  
     * Example Calls:
     *  jez.addMessage(chatMessage, "Hi there!")
     *  jez.addMessage(chatMessage,{color:"purple",fSize:14,msg:"Bazinga, Sheldon Wins!",tag:"saves"})
     * 
     * If msgParm is provided as an object
     * @typedef  {Object} msgParm
     * @property {number} fSize   - Font Size, 12 matches typical Foundry font
     * @property {string} color   - Name or hex code, https://www.w3schools.com/tags/ref_colornames.asp
     * @property {string} msg     - Actual text to be posted into chat
     * @property {string} tag     - Tag mapping into HTML from: saves, attack, damage, hits, other   
     ***************************************************************************************************/
    static async addMessage(chatMessage, msgParm) {
        const FUNCNAME = "postChatMessage(chatMessage, msgParm)";
        jez.log(`-------------- Starting ${FUNCNAME} -----------`);
        const allowedTags = ["saves", "attack", "damage", "hits", "other"]
        //-----------------------------------------------------------------------------------------------
        // chatMessage must be a ChatMessage object
        //
        if (chatMessage?.constructor.name !== "ChatMessage") {
            let errMsg = `Coding error. Chat message passed (${chatMessage}) is a ${chatMessage?.constructor.name}, must be ChatMessage.`
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
        let content = await duplicate(chatMessage.data.content);
        content = await content.replace(regExp, replaceString);
        await chatMessage.update({ content: content });

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
        //----------------------------------------------------------------------------------------------
        // Tokens need to be Token5e not TokenDocument5e, so check and convert if needed.
        //
        let t1 = {}
        if (token1.constructor.name === "TokenDocument5e") t1 = token1._object
        else t1 = token1
        let t2 = {}
        if (token2.constructor.name === "TokenDocument5e") t2 = token2._object
        else t2 = token2
        //----------------------------------------------------------------------------------------------
        // Determine the 5e distance between tokens
        //
        let distance = jez.getDistance5e(t1, t2)
        //----------------------------------------------------------------------------------------------
        // Return result 
        //
        if (distance > maxRange) {
            let msg = `jez.inRange: Distance between ${token1.name} and ${token2.name} is ${distance}`
            jez.log(msg);
            return (false);
        }
        return (true);
    }
    /***************************************************************************************************
     * getDistance in the wierd D&D 5e alternate world where diagonals are 5-10-5 distances
     * 
     * Logic taken from Vance Cole's macro: https://github.com/VanceCole/macros/blob/master/distance.js
     *
     * Return distance between two placeables
     ***************************************************************************************************/
    static getDistance5e(one, two) {
        let gs = canvas.grid.size;
        let d1 = Math.abs((one.x - two.x) / gs);
        let d2 = Math.abs((one.y - two.y) / gs);
        let maxDim = Math.max(d1, d2);
        let minDim = Math.min(d1, d2);
        let dist = (maxDim + Math.floor(minDim / 2)) * canvas.scene.data.gridDistance;
        return dist;
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
            "RoyalBlue", "SaddleBrown", "SlateBlue", "SteelBlue", "Teal"];
        // Returns a random integer from 0 to (colorArray.length - 1):
        let index = Math.floor(Math.random() * colorArray.length);
        return (colorArray[index])
    }

    /***************************************************************************************************
     * Get token5e object based on ID passed
     ***************************************************************************************************/
     static getTokenById(tokenId) {
        if ((typeof (tokenId) != "string") || (tokenId.length !== 16)) {
            let msg = `Parameter passed to jez.getTokenById(tokenId) is not an ID: ${tokenId}`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
        return (canvas.tokens.placeables.find(ef => ef.id === tokenId));
    }
    /***************************************************************************************************
    * Return casting stat string based on input: Token5e, TokenID, Actor5e
    ***************************************************************************************************/
    static getCastStat(subject) {
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else {
                let msg = `Object passed to jez.getCastStat(subject) is type '${typeof (subject)}' must be a Token5e or Actor5e`
                ui.notifications.error(msg)
                console.log(msg)
                return (false)
            }
        } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else {
            let msg = `Parameter passed to jez.getCastStat(subject) is not a Token5e, Actor5e, or Token.id: ${subject}`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
        return (actor5e.data.data.attributes.spellcasting)
    }
    /***************************************************************************************************
     * Return spell save DC string based on input: Token5e, TokenID, Actor5e
     ***************************************************************************************************/
         static getSpellDC(subject) {
            let actor5e = null
            if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
                if (subject.constructor.name === "Token5e") actor5e = subject.actor
                else if (subject.constructor.name === "Actor5e") actor5e = subject
                else {
                    let msg = `Object passed to jez.getCastStat(subject) is type '${typeof (subject)}' must be a Token5e or Actor5e`
                    ui.notifications.error(msg)
                    console.log(msg)
                    return (false)
                }
            } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
            else {
                let msg = `Parameter passed to jez.getCastStat(subject) is not a Token5e, Actor5e, or Token.id: ${subject}`
                ui.notifications.error(msg)
                console.log(msg)
                return (false)
            }
            return (actor5e.data.data.attributes.spelldc)
        }
    /***************************************************************************************************
    * Return casting stat mod integer based on input: Token5e, TokenID, Actor5e and stat string
    ***************************************************************************************************/
    static getStatMod(subject, statParm) {
        let actor5e = null
        let stat = ""
        const STAT_ARRAY = ["str", "dex", "con", "int", "wis", "cha"]   // Allowed stat strings
        //----------------------------------------------------------------------------------------------
        // Validate the subject parameter, stashing it into "actor5e"
        //
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else {
                let msg = `Object passed to jez.getCastStat(subject,statParm) is type '${typeof (subject)}' must be a Token5e or Actor5e`
                ui.notifications.error(msg)
                console.log(msg)
                return (false)
            }
        } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else {
            let msg = `Subject parm passed to jez.getCastStat(subject,statParm) is not a Token5e, Actor5e, or Token.id: ${subject}`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
        //----------------------------------------------------------------------------------------------
        // Validate the statParm parameter and stash it into "stat"
        //
        if ((typeof (statParm) !== "string") || (statParm.length !== 3)) {
            let msg = `Stat parameter passed to jez.getCastStat(subject, statParm) is invalid: ${statParm}`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
        stat = statParm.toLowerCase();
        if (!STAT_ARRAY.includes(stat)) {
            let msg = `Stat parameter passed to jez.getCastStat(subject, statParm) is invalid: ${statParm}`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
        //----------------------------------------------------------------------------------------------
        // Fetch and return that modifier
        //
        return (actor5e.data.data.abilities[stat].mod)
    }
    /***************************************************************************************************
    * Return casting modifier integer based on input: Token5e, TokenID, Actor5e
    ***************************************************************************************************/
    static getCastMod(subject) {
        let stat = jez.getCastStat(subject)
        if (!stat) return (false)
        return (jez.getStatMod(subject, stat))
    }
    /***************************************************************************************************
    * Return proficency modifier
    ***************************************************************************************************/
    static getProfMod(subject) {
        let actor5e = null
        if (typeof (subject) === "object") { // Hopefully we have a Token5e or Actor5e
            if (subject.constructor.name === "Token5e") actor5e = subject.actor
            else if (subject.constructor.name === "Actor5e") actor5e = subject
            else {
                let msg = `Object passed to jez.getCastStat(subject) is type '${typeof (subject)}' must be a Token5e or Actor5e`
                ui.notifications.error(msg)
                console.log(msg)
                return (false)
            }
        } else if ((typeof (subject) === "string") && (subject.length === 16)) actor5e = jez.getTokenById(subject).actor
        else {
            let msg = `Parameter passed to jez.getCastStat(subject) is not a Token5e, Actor5e, or Token.id: ${subject}`
            ui.notifications.error(msg)
            console.log(msg)
            return (false)
        }
        return (actor5e.data.data.attributes.prof)
    }
    /***************************************************************************************************
     * Define static constants for use by other functions.  They are accessed like..
     * 
     * console.log(jez.ADD + jez.OVERRIDE) // 7
     ***************************************************************************************************/
     static get CUSTOM()     { return 0 }
     static get MULTIPLY()   { return 1 }
     static get ADD()        { return 2 }
     static get DOWNGRADE()  { return 3 }
     static get UPGRADE()    { return 4 }
     static get OVERRIDE()   { return 5 }
     static get DAEFLAG_FAMILIAR_NAME() { return "familiar_name" }
     /***************************************************************************************************
      * Set the Familiar name into the DAE Flag
      ***************************************************************************************************/
     static async familiarNameSet(actor5e, name) {
         return (await DAE.setFlag(actor5e, jez.DAEFLAG_FAMILIAR_NAME, name));
     }
     /***************************************************************************************************
      * Get the Familiar name from the DAE Flag, return empty string if not found
      ***************************************************************************************************/
     static async familiarNameGet(actor5e) {
         let currentName = await DAE.getFlag(actor5e, jez.DAEFLAG_FAMILIAR_NAME);
         console.log("currentName", currentName)
         if (!currentName) currentName = ""
         return (currentName)
     }
     /***************************************************************************************************
      * Get the Familiar name from the DAE Flag, return empty string if not found
      ***************************************************************************************************/
    static async familiarNameUnset(actor5e) {
        return (await DAE.unsetFlag(actor5e, jez.DAEFLAG_FAMILIAR_NAME));
    }
    /***************************************************************************************************
     * Retrieve and return the spell school string formatted for jb2a from the passed item or false if 
     * none found.
     ***************************************************************************************************/
    static getSpellSchool(item) {
        let school = item?.data?.school
        if (!school) return (false)
        switch (school) {
            case "abj": school = "abjuration"; break
            case "con": school = "conjuration"; break
            case "div": school = "divination"; break
            case "enc": school = "enchantment"; break
            case "evo": school = "evocation"; break
            case "ill": school = "illusion"; break
            case "nec": school = "necromancy"; break
            case "trs": school = "transmutation"; break
            default: school = false
        }
        return (school)
    }
    /***************************************************************************************************
     * Return a random supported color for spell rune
     ***************************************************************************************************/
    static getRandomRuneColor() {
        let allowedColorArray = ["blue", "green", "pink", "purple", "red", "yellow"];
        // Returns a random integer from 0 to (allowedColorArray.length):
        let index = Math.floor(Math.random() * (allowedColorArray.length));
        return (allowedColorArray[index])
    }
    /***************************************************************************************************
    * Run a 3 part spell rune VFX on indicated token  with indicated rune, Color, scale, and opacity
    * may be optionally specified.
    * 
    * If called with an array of target tokens, it will recursively apply the VFX to each token 
    * 
    * Typical calls: 
    *  jez.runRuneVFX(tToken, jez.getSpellSchool(aItem))
    *  jez.runRuneVFX(args[0].targets, jez.getSpellSchool(aItem), jez.getRandomRuneColor())
    ***************************************************************************************************/
    static async runRuneVFX(target, school, color, scale, opacity) {
        school = school || "enchantment"            // default school is enchantment \_(ツ)_/
        color = color || jez.getRandomRuneColor()   // If color not provided get a random one
        scale = scale || 1.2                        // If scale not provided use 1.0
        opacity = opacity || 1.0                    // If opacity not provided use 1.0
        //jez.log("runRuneVFX(target, school, color, scale, opacity)","target",target,"school",school,"scale",scale,"opacity",opacity)
        if (Array.isArray(target)) {                // If function called with array, do recursive calls
            for (let i = 0; i < target.length; i++) jez.runRuneVFX(target[i], school, color, scale, opacity);
            return (true)                           // Stop this invocation after recursive calls
        }
        //-----------------------------------------------------------------------------------------------
        // Build names of video files needed
        // 
        const INTRO = `jb2a.magic_signs.rune.${school}.intro.${color}`
        const BODY = `jb2a.magic_signs.rune.${school}.loop.${color}`
        const OUTRO = `jb2a.magic_signs.rune.${school}.outro.${color}`
        //-----------------------------------------------------------------------------------------------
        // Change TokenDocument5e to Token5e
        // 
        //let t1 = {}
        //if (token1.constructor.name === "TokenDocument5e") t1 = token1._object
        //else t1 = token1
        //-----------------------------------------------------------------------------------------------
        // Play the VFX
        // 
        new Sequence()
            .effect()
            .file(INTRO)
            .atLocation(target)
            .scaleToObject(scale)
            .opacity(opacity)
            .waitUntilFinished(-500)
            .effect()
            .file(BODY)
            .atLocation(target)
            .scaleToObject(scale)
            .opacity(opacity)
            .duration(3000)
            .waitUntilFinished(-500)
            .effect()
            .file(OUTRO)
            .atLocation(target)
            .scaleToObject(scale)
            .opacity(opacity)
            .play();
    }

    /***************************************************************************************************
     * Move the movingToken up to the number of spaces specified as move away from the amchorToken if 
     * move is a positive value, toward if negative, after a delay in milliseconds
     ***************************************************************************************************/
    static async moveToken(anchorToken, movingToken, move, delay) {
        const FUNCNAME = "moveToken(anchorToken, movingToken, move)";
        let moveArray = [-3, -2, -1, 0, 1, 2, 3]
        const GRID_UNIT = canvas.scene.data.grid;
        let distBetweenTokens = jez.getDistance5e(anchorToken, movingToken);
        delay = delay || 10
        //----------------------------------------------------------------------------------------------
        // Store the X & Y coordinates of the two tokens
        // 
        const X = movingToken.center.x;                                 // Nab the X coord for target token
        const Y = movingToken.center.y;                                 // Nab the Y coord for target token
        //----------------------------------------------------------------------------------------------
        // Adjust move distance if necessary because tokens are already too close.
        // 
        if (distBetweenTokens <= 5) return (true)                   // Don't do anything if adjacent
        if (move === -3 && distBetweenTokens < 20) move = -2        // 4 spaces apart, can move 3
        if (move === -2 && distBetweenTokens < 15) move = -1        // 3 spaces apart, can move 2
        if (move === -1 && distBetweenTokens < 10) move = 0        // 2 spaces apart, can move 1
        if (move === 0) return (true)                               // Move = 0 is the trivial case
        //----------------------------------------------------------------------------------------------
        // Validity check on move
        // 
        if (!moveArray.includes(move)) {
            msg = `Move distance requested, ${move} not supported by ${FUNCNAME}`;
            ui.notifications.error(msg);
            return (false);
        }
        let squareCorner = moveSpaces(move)
        await jez.wait(delay)
        await movingToken.document.update(squareCorner)
        return (true)
        //----------------------------------------------------------------------------------------------
        // Count of spaces to move 1, 2 or 3
        //----------------------------------------------------------------------------------------------
        function moveSpaces(count) {
            let dist = [];
            let minDist = 99999999999;
            let maxDist = 0;
            let minIdx = 0;
            let maxIdx = 0;
            let destSqrArray = buildSquareArray(Math.abs(count));

            for (let i = 1; i < destSqrArray.length; i++) {
                dist[i] = canvas.grid.measureDistance(destSqrArray[i], anchorToken.center);
                if (dist[i] < minDist) { minDist = dist[i]; minIdx = i; }
                if (dist[i] > maxDist) { maxDist = dist[i]; maxIdx = i; }
            }
            let index = minIdx                 // Assume pull, pick closest space
            if (count > 0) index = maxIdx       // Change to furthest if pushing
            let fudge = GRID_UNIT / 2;
            if (movingToken.data.width > 1)
                fudge = GRID_UNIT / 2 * movingToken.data.width;
            let squareCorner = {};
            squareCorner.x = destSqrArray[index].x - fudge;
            squareCorner.y = destSqrArray[index].y - fudge;
            return squareCorner;
        }
        function buildSquareArray(size) {
            let destSqrArray = [];     // destination Square array
            if (size === 0) return destSqrArray;
            //----------------------------------------------------------------------------------------------
            // Size = 1 is a one space move where 8 surrounding spaces will be considered.
            // The spaces considered are as shown in this "nifty" character graphics "drawing." 
            // 
            //       +---+---+---+
            //       | 1 | 2 | 3 |
            //       +---+---+---+
            //       | 4 | 5 | 6 |
            //       +---+---+---+
            //       | 7 | 8 | 9 |
            //       +---+---+---+
            //----------------------------------------------------------------------------------------------
            if (size === 1) {
                for (let i = 1; i < 10; i++) destSqrArray[i] = {};
                destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - GRID_UNIT;
                destSqrArray[4].y = destSqrArray[5].y = destSqrArray[6].y = Y;
                destSqrArray[7].y = destSqrArray[8].y = destSqrArray[9].y = Y + GRID_UNIT;
                destSqrArray[1].x = destSqrArray[4].x = destSqrArray[7].x = X - GRID_UNIT;
                destSqrArray[2].x = destSqrArray[5].x = destSqrArray[8].x = X;
                destSqrArray[3].x = destSqrArray[6].x = destSqrArray[9].x = X + GRID_UNIT;
                return destSqrArray;
            }
            //----------------------------------------------------------------------------------------------
            // Sie = 2 is a two space move where 12 spaces may be solution.
            // The spaces considered are as shown in this "nifty" character graphics "drawing."
            //
            //            +----+----+----+
            //            |  1 |  2 |  3 |    
            //       +----+----+----+----+----+
            //       | 12 |    |    |    |  4 | 
            //       +----+----+----+----+----+
            //       | 11 |    | xx |    |  5 |
            //       +----+----+----+----+----+
            //       | 10 |    |    |    |  6 |
            //       +----+----+----+----+----+
            //            |  9 |  8 |  7 |  
            //            +----+----+----+
            //----------------------------------------------------------------------------------------------
            if (size === 2) {
                for (let i = 1; i <= 12; i++) destSqrArray[i] = {};
                destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - 2 * GRID_UNIT;
                destSqrArray[4].y = destSqrArray[12].y = Y - GRID_UNIT;
                destSqrArray[5].y = destSqrArray[11].y = Y;
                destSqrArray[6].y = destSqrArray[10].y = Y + GRID_UNIT;
                destSqrArray[7].y = destSqrArray[8].y = destSqrArray[9].y = Y + 2 * GRID_UNIT;
                destSqrArray[10].x = destSqrArray[11].x = destSqrArray[12].x = X - 2 * GRID_UNIT;
                destSqrArray[1].x = destSqrArray[9].x = X - GRID_UNIT;
                destSqrArray[2].x = destSqrArray[8].x = X;
                destSqrArray[3].x = destSqrArray[7].x = X + GRID_UNIT;
                destSqrArray[4].x = destSqrArray[5].x = destSqrArray[6].x = X + 2 * GRID_UNIT;
                return destSqrArray;
            }
            //----------------------------------------------------------------------------------------------
            // Sie = 3 is a three space move where 16 spaces may be the solution.
            // The spaces considered are as shown in this "nifty" character graphics "drawing."
            // 
            //                 +----+----+----+
            //                 |  1 |  2 |  3 | 
            //            +----+----+----+----+----+
            //            |  4 |    |    |    |  5 | 
            //       +----+----+----+----+----+----+----+
            //       |  6 |    |    |    |    |    |  7 | 
            //       +----+----+----+----+----+----+----+
            //       |  8 |    |    | XX |    |    |  9 | 
            //       +----+----+----+----+----+----+----+
            //       | 10 |    |    |    |    |    | 11 | 
            //       +----+----+----+----+----+----+----+
            //            | 12 |    |    |    | 13 |    
            //            +----+----+----+----+----+
            //                 | 14 | 15 | 16 |   
            //                 +----+----+----+
            //----------------------------------------------------------------------------------------------
            if (size === 3) {
                for (let i = 1; i <= 16; i++) destSqrArray[i] = {};
                destSqrArray[1].y = destSqrArray[2].y = destSqrArray[3].y = Y - 3 * GRID_UNIT;
                destSqrArray[4].y = destSqrArray[5].y = Y - 2 * GRID_UNIT;
                destSqrArray[6].y = destSqrArray[7].y = Y - 1 * GRID_UNIT;
                destSqrArray[8].y = destSqrArray[9].y = Y - 0 * GRID_UNIT;
                destSqrArray[10].y = destSqrArray[11].y = Y + 1 * GRID_UNIT;
                destSqrArray[12].y = destSqrArray[13].y = Y + 2 * GRID_UNIT;
                destSqrArray[14].y = destSqrArray[15].y = destSqrArray[16].y = Y + 3 * GRID_UNIT;

                destSqrArray[6].x = destSqrArray[8].x = destSqrArray[10].x = X - 3 * GRID_UNIT;
                destSqrArray[4].x = destSqrArray[12].x = X - 2 * GRID_UNIT;
                destSqrArray[1].x = destSqrArray[14].x = X - 1 * GRID_UNIT;
                destSqrArray[2].x = destSqrArray[15].x = X - 0 * GRID_UNIT;
                destSqrArray[3].x = destSqrArray[16].x = X + 1 * GRID_UNIT;
                destSqrArray[5].x = destSqrArray[13].x = X + 2 * GRID_UNIT;
                destSqrArray[7].x = destSqrArray[9].x = destSqrArray[11].x = X + 3 * GRID_UNIT;
                return destSqrArray;
            }
        }
    }
} // END OF class jez
Object.freeze(jez);