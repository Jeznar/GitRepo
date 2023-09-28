const DEBUG = true;
const MACRONAME = "Diff_Between_Objects.0.3"
const TOKEN1_NAME = "Spiteful Steel Bag Large"
const TOKEN2_NAME = "Exuberant Steel Bag Large"

let token1 = await findTokenByName(TOKEN1_NAME)
log(`${TOKEN1_NAME} data`, token1 )
let token2 = await findTokenByName(TOKEN2_NAME)
log(`${TOKEN2_NAME} data`, token2 )
log("Difference of 2nd to 1st")
log("------------------------")
log(diff(token1, token2))
log("")


/*!
 * Find the differences between two objects and push to a new object
 * (c) 2019 Chris Ferdinandi & Jascha Brinkmann, MIT License, https://gomakethings.com & https://twitter.com/jaschaio
 * @param  {Object} obj1 The original object
 * @param  {Object} obj2 The object to compare against it
 * @return {Object}      An object of differences between the two
 */
/*
var order1 = {
	sandwich: 'tuna',
	chips: true,
	drink: 'soda',
	order: 1,
	toppings: ['pickles', 'mayo', 'lettuce'],
	details: {
		name: 'Chris',
		phone: '555-555-5555',
		email: 'no@thankyou.com'
	},
	otherVal1: '1'
};

var order2 = {
	sandwich: 'turkey',
	chips: true,
	drink: 'soda',
	order: 2,
	toppings: ['pickles', 'lettuce'],
	details: {
		name: 'Jon',
		phone: '(555) 555-5555',
		email: 'yes@please.com'
	},
	otherVal2: '2'
};

log("")
log("Contents of first Object", order1)
log("Contents of second Object", order2)
log("")
log("Difference of 2nd to 1st")
log("------------------------")
log(diff(order1, order2))
log("")*/


/***************************************************************************************************
 * Perform the complex diff function
 ***************************************************************************************************/
function diff(obj1, obj2) {
    // Make sure an object to compare is provided
    if (!obj2 || Object.prototype.toString.call(obj2) !== '[object Object]') {
        return obj1;
    }
    //------------------------------------------------------------------------------------------
    // Variables
    //
    var diffs = {};
    var key;
    //------------------------------------------------------------------------------------------
    // Methods
    //
    /*******************************************************************************************
     * Check if two arrays are equal
     * @param  {Array}   arr1 The first array
     * @param  {Array}   arr2 The second array
     * @return {Boolean}      If true, both arrays are equal
     *******************************************************************************************/
    //var arraysMatch = function (arr1, arr2) {
    function arraysMatch(arr1, arr2) {

        // Check if the arrays are the same length
        if (arr1.length !== arr2.length) return false;
        // Check if all items exist and are in the same order
        for (var i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        // Otherwise, return true
        return true;
    };

     /*******************************************************************************************
     * Compare two items and push non-matches to object
     * @param  {*}      item1 The first item
     * @param  {*}      item2 The second item
     * @param  {String} key   The key in our object
     *******************************************************************************************/
    function compare(item1, item2, key) {
        // Get the object type
        var type1 = Object.prototype.toString.call(item1);
        var type2 = Object.prototype.toString.call(item2);
        // If type2 is undefined it has been removed
        if (type2 === '[object Undefined]') {
            diffs[key] = null;
            return;
        }
        // If items are different types
        if (type1 !== type2) {
            diffs[key] = item2;
            return;
        }
        // If an object, compare recursively
        if (type1 === '[object Object]') {
            var objDiff = diff(item1, item2);
            if (Object.keys(objDiff).length > 0) {
                diffs[key] = objDiff;
            }
            return;
        }
        // If an array, compare
        if (type1 === '[object Array]') {
            if (!arraysMatch(item1, item2)) {
                diffs[key] = item2;
            }
            return;
        }
        // Else if it's a function, convert to a string and compare
        // Otherwise, just compare
        if (type1 === '[object Function]') {
            if (item1.toString() !== item2.toString()) {
                diffs[key] = item2;
            }
        } else {
            if (item1 !== item2 ) {
                diffs[key] = item2;
            }
        }
    };

    //------------------------------------------------------------------------------------------
    // Compare our objects
    //
    // Loop through the first object
    for (key in obj1) {
        if (obj1.hasOwnProperty(key)) {
            compare(obj1[key], obj2[key], key);
        }
    }
    // Loop through the second object and find missing items
    for (key in obj2) {
        if (obj2.hasOwnProperty(key)) {
            if (!obj1[key] && obj1[key] !== obj2[key] ) {
                diffs[key] = obj2[key];
            }
        }
    }
    // Return the object of differences
    return diffs;
};

/***************************************************************************************************
 * Find an owned token by name on current scene.  Return the token or null if not found
 ***************************************************************************************************/
 async function findTokenByName(name) {
    const FUNCNAME = "findTokenByName(name)";
    log("-----------------------------------",
        "Starting", `${MACRONAME} ${FUNCNAME}`,
        "name", name)
    let targetToken = ""

    let ownedTokens = canvas.tokens.ownedTokens
    for (let i = 0; i < ownedTokens.length; i++) {
        log(`  ${i}) ${ownedTokens[i].name}`, ownedTokens[i]);
        if (name === ownedTokens[i].name) {
            log("Eureka I found it!")
            targetToken = ownedTokens[i]
            break;
        }
    }
    if (targetToken) log(`${TARGET_NAME}'s token has been found`, targetToken)
    else log(`${TARGET_NAME}'s token was not found :-(`)

    log("-----------------------------------", "Finished", `${MACRONAME} ${FUNCNAME}`);
    return (targetToken);
}



/***************************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************************/
 function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    } else {            // Even number of arguments
        console.log(parms[i],":",parms[i+1]);
        i = 2;
        for ( i; i<numParms; i=i+2) console.log(` ${lines++})`, parms[i],":",parms[i+1]);
    }
}
async function wait(ms) { return new Promise(resolve => { setTimeout(resolve, ms); }); }
