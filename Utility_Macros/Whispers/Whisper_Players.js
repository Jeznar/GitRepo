const MACRONAME = "Whisper_Players.0.2.js"
/*********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*
 * This is a macro bar macro (in development) to whisper each player with a proposition from Strahd.
 * 
 * 04/24/23 0.1 Creation of Macro
 *********1*********2*********3*********4*********5*********6*********7*********8*********9*********0*********1*********2*********3*/
const MACRO = MACRONAME.split(".")[0]       // Trim off the version number and extension
const TAG = `${MACRO} |`
const TL = 5;                               // Trace Level for this macro
let msg = "";                               // Global message string
//-----------------------------------------------------------------------------------------------------------------------------------
if (TL > 0) jez.trace(`${TAG} === Starting ===`);
if (TL > 1) for (let i = 0; i < args.length; i++) jez.trace(`  args[${i}]`, args[i]);
//-----------------------------------------------------------------------------------------------------------------------------------
// Set Macro variables
//
const PLAYERS = [ "Jen M.", "Joe B.", "Joe M.", "Jon M.", "Lisa", "Shannon B." ]
const PREAMBLE = `<i>Strahd's voice sounds clearly within your mind.  You hear him say:</i><br><br>`
const MSG_JENM = `You have returned to me, my sweet! Please do stay.<br><br>
You alone hold the power to break this curse that afflicts us all. You need just stay with me in safety and comfort.  
I will always cherish and protect you as you are most precious to me. If you will but stay at my side, you will free us all from 
the curse.  The mists will no longer oppress us.  Your friends may return to their homes and loved ones.<br><br>
If you would choose to save us all, when the time comes, simply choose to toast with the <b>red</b> wine.`
const MSG_JOEB = `What are you doing in these lands?  I can not be certain.<br><br>
I can promise this, if you deliver the Tome back to me I shall grant you one boon.  Perhaps you would like to travel beyond these 
mists, or send someone else back to whence they came.<br><br>
If you wish to accept this offer, when the time comes, simply choose to toast with the <b>red</b> wine.`
const MSG_JOEM = `Chik Kalderash, son of Jibben and Tekla Czigany, born of Mortu, in a Vardo, in a foreign land. You seek 
redemption. You do not understand that you were the epitome of a noble Vistana.  For some reason, you seem hell bent on atoning 
for wrongs you did not commit. Let me help you. I can guide you to understand your righteous path. <br><br>
Commit yourself to what you are.  Stay with my Vistani, travel their path and I shall grant you more power than Akroma,  
Angel of Fury, Angel of Vengeance has ever dreamed of.<br><br>
All I ask of you is that you see this child Vistana back to her father and take your rightful place amongst my people. 
Renounce your association with these travelers.<br><br>
If you wish to accept this offer, when the time comes, simply choose to toast with the <b>red</b> wine.`
const MSG_JONM = `What a studious one are you.  I can see myself in you.  Your study of the arcane arts, curiosity about the 
legend of the fanes, building your power, delving into my history.<br><br>
I propose that we both benefit.  I can send you forth from my lands.  Obtain a fellowship for you at the great magic academy 
at Candlekeep.  You may study there, learn from their scholars, hone your skills.  All I ask is that you return and share a 
bit of your learnings, perhaps bring a few arcane texts when you have learned your fill.  Sadly, I have limited access to the 
fellowship and must send someone very soon or that opportunity will slip from our hands.<br><br>
If you wish to accept this offer, when the time comes, simply choose to toast with the <b>white</b> wine.`
const MSG_LISA = `We know each other, shall I say, intimately.  You have served me these past 10 years. Sadly, I must say your 
efforts of late have fallen short of what I know you can achieve.<br><br>
I ask that you devote yourself to my goals with determination.  I need my Tome returned post haste.  I want any of the other 
artifacts that these travelers obtain returned to my care.<br><br>
I would simply hate it, if you were to force me to imprison you for eternity below my castle.<br><br>
If you wish to accept this offer, when the time comes, simply choose to toast with the <b>red</b> wine.`
const MSG_SHAN = `Such a noble Paladin in such a dark place.  I do believe your masters in that so called church have asked too 
much of such a righteous soul.  This land has broken many a holy person, I do not wish you to be another.<br><br>
I propose you leave this realm, tomorrow.  Return to your superiors.  Tell them of the restoration of the Church of the Morning 
Lord.  How you reconsecrated the Cathedral of Saint Andral in the capital of the realm.   They shall thank you for your great 
service.  Laud your very name.<br><br>
You may then do more great deeds in the name of Lathander.<br><br>
If you wish to accept this offer, when the time comes, simply choose to toast with the <b>white</b> wine.`
const MSG_DATA = {
    "Jen M.": `${PREAMBLE} <b>${MSG_JENM}</b>`,
    "Joe B.": `${PREAMBLE} <b>${MSG_JOEB}</b>`,
    "Joe M.": `${PREAMBLE} <b>${MSG_JOEM}</b>`,
    "Jon M.": `${PREAMBLE} <b>${MSG_JONM}</b>`,
    "Lisa": `${PREAMBLE} <b>${MSG_LISA}</b>`,
    "Shannon B.": `${PREAMBLE} ${MSG_SHAN}</b>`
}
//-----------------------------------------------------------------------------------------------------------------------------------
// Build an array of the user names currently active in the game
//
// Get an object containing the user data for players active in the game
let users = game.users.filter(user => user.active);
if (TL > 1) jez.trace(`${TAG} users`,users)
// Get an array of the user names active in the game to use as targets of whispers
let userNames = users.map(u => u.data?.name).filter(name => name !== undefined);
if (TL > 1) jez.trace(`${TAG} userNames`,userNames)
//-----------------------------------------------------------------------------------------------------------------------------------
// Send a whisper to each of the active players
//
for (let i = 0; i < userNames.length; i++) {
    if (TL > 1) jez.trace(`${TAG} ---`)
    if (TL > 1) jez.trace(`${TAG} Processing ${i}. ${userNames[i]}`)
    if (userNames[i] === "GM") continue
    if (TL > 1) jez.trace(`${TAG} Whispering: `, MSG_DATA[userNames[i]])
    ChatMessage.create({
        user : game.user._id,
        content: MSG_DATA[userNames[i]],
        whisper: ChatMessage.getWhisperRecipients(userNames[i]),
    });
}