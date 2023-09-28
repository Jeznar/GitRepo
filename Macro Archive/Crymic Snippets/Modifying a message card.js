
/* Does anyone happen to have any suggestions on where to start 
* with modifing item cards with results from macros?  
* I have seen examples in Crymic's code that I can try to ape, 
*just wondering if anyone knows of a tutorial on such things?
*/

// Below from Crymic in answer to my question
// getting chat message
let chatMessage = await game.messages.get(lastArgs.itemCardId);

// duplicating chat message to copy over
let content = await duplicate(chatMessage.data.content);
let searchString = "text you are looking for to replace";
let replaceString = "replacement text";

// creating the object
content = await content.replace(searchString, replaceString);

// passing the update to the chat message
await chatMessage.update({ content: content });
await ui.chat.scrollBottom();