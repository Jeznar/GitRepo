const MACRONAME = "Replace_Substring.0.1.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0
 * Exercise the replaceSubstring function for use in jez-lib.
 * 
 * 06/17/22 0.1 Creation
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********/
let testString1 = "Hey rocket RoCKEt hi Rocket This is a rocket. ROCKET's engine Rocketeer Sprocket"
let testString2 = "rocket RoCKEt hi Rocket This is a roc ket. ROCKET's engine Rocketeer Sprocket"
let testString3 = "inputStr with some sauce and no matches"

let result = jez.replaceSubString(testString1, "ROCKET", "%TOKENNAME%")
console.log(result.count, result.string)
// ==> 5 "inputStr %TOKENNAME% %TOKENNAME% hi %TOKENNAME% This is a %TOKENNAME%. %TOKENNAME%'s engine Rocketeer Sprocket"
result = jez.replaceSubString(testString2, "ROCKET", "%TOKENNAME%")
console.log(result.count, result.string)
// ==> 4 "%TOKENNAME% %TOKENNAME% hi %TOKENNAME% This is a roc ket. %TOKENNAME%'s engine Rocketeer Sprocket"
result = jez.replaceSubString(testString3, "ROCKET", "%TOKENNAME%")
console.log(result.count, result.string)
// ==> 0 'inputStr with some sauce and no matches'
let testString = "rocket RoCKEt hi Rocket This is a roc ket. ROCKET's engine Rocketeer Sprocket"
result = jez.replaceSubString(testString, "ROCKET", "%TOKENNAME%").string
console.log(result)

/*********1*********2*********3*********4*********5*********6*********7*********8*********9******
 * Accept a string and find the substring passed with it.  Return an object that has count and
 * an updated string with the substring replaced. 
 * 
 * Inputs
 * @param {String} string the string that will be searched and updated
 * @param {String} substring the substring that will be sought and replaced
 * @param {String} newSubstring the string that will replace occurances of substring
 * 
 * Return Object:
 * @typedef  {Object} replaceSubStr
 * @property {number} count  - Count of times substring appears in string
 * @property {string} string - Updated string with substring replaced by newSubstring
 * 
 * Example Calls:
 * 1. testString = "rocket RoCKEt hi Rocket This is a roc ket. ROCKET's engine Rocketeer Sprocket"
 *    result = replaceSubString(testString, "ROCKET", "%TOKENNAME%")
 *    console.log(result.count, result.string)
 *    ==> 4 "%TOKENNAME% %TOKENNAME% hi %TOKENNAME% This is a roc ket. %TOKENNAME%'s engine Rocketeer Sprocket"
 * 
 * 2. testString = "rocket RoCKEt hi Rocket This is a roc ket. ROCKET's engine Rocketeer Sprocket"
 *    result = replaceSubString(testString, "ROCKET", "%TOKENNAME%").string
 *    console.log(result)
 *    ==> %TOKENNAME% %TOKENNAME% hi %TOKENNAME% This is a roc ket. %TOKENNAME%'s engine Rocketeer Sprocket
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*****/
// function replaceSubString(string, substring, newSubstring) {
//     let returnObj = {}
//     let re = new RegExp(`\\b${substring}\\b`, 'gi');
//     returnObj.count = (string.match(re, newSubstring) || []).length
//     returnObj.string = string.replace(re, newSubstring)
//     return (returnObj)
// }