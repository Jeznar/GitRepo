const MACRONAME = "Scope_Demo.0.1"
/*****************************************************************************************
 * Demonstrate teh scope of variables
 * 
 * 12/20/21 0.1 Creation of Macro
 *****************************************************************************************/
const DEBUG = true;
if (DEBUG) {
    log(` ---------------- Starting ${MACRONAME} ----------------------------------------`);
    for (let i = 0; i < args.length; i++) log(`    args[${i}]`, args[i]);
}
log(``);

let globalLetA = "Value of globalLetA"
log("globalLetA", globalLetA);

function1();

/***************************************************************************************
 *    END_OF_MAIN_MACRO_BODY
 *                                END_OF_MAIN_MACRO_BODY
 *                                                             END_OF_MAIN_MACRO_BODY
 ***************************************************************************************/

/****************************************************************************************
 * Execute code for function1
 ***************************************************************************************/
function function1() {
    const FUNCNAME = "function1()";
    log(`-------------------Starting ${MACRONAME} ${FUNCNAME}-------------------------`);
    log("globalLetA", globalLetA)

    let blockFunction1LetA = "Value of blockFunction1LetA";
    log("1 blockFunction1LetA", blockFunction1LetA);

    { // Another block
        log("2 blockFunction1LetA", blockFunction1LetA) 
        let blockFunction1LetB = "Value of blockFunction1LetB";
        log("blockFunction1LetB", blockFunction1LetB)
    }

    if (blockFunction1LetB) log("blockFunction1LetB is ",blockFunction1LetB)
    else log("blockFunction1LetB is falsy")
    function2();

}

/****************************************************************************************
 * Execute code for function2
 ***************************************************************************************/
function function2() {
    const FUNCNAME = "function2()";
    log(`-------------------Starting ${MACRONAME} ${FUNCNAME}-------------------------`);
    log("globalLetA", globalLetA);

    let blockFunction2LetB = "Value of blockFunction2LetB";
    log("blockFunction2LetB", blockFunction2LetB);

    log("blockFunction1LetA", blockFunction1LetA) // Fails: blockFunction1LetA is not defined


}

/****************************************************************************************
 * DEBUG Logging
 * 
 * If passed an odd number of arguments, put the first on a line by itself in the log,
 * otherwise print them to the log seperated by a colon.  
 * 
 * If more than two arguments, add numbered continuation lines. 
 ***************************************************************************************/
function log(...parms) {
    if (!DEBUG) return;             // If DEBUG is false or null, then simply return
    let numParms = parms.length;    // Number of parameters received
    let i = 0;                      // Loop counter
    let lines = 1;                  // Line counter 

    if (numParms % 2) {  // Odd number of arguments
        console.log(parms[i++])
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    } else {            // Even number of arguments
        console.log(parms[i], ":", parms[i + 1]);
        i = 2;
        for (i; i < numParms; i = i + 2) console.log(` ${lines++})`, parms[i], ":", parms[i + 1]);
    }
}
