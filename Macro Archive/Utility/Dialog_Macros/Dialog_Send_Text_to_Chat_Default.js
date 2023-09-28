const MACRONAME = "Dialog_Send_Text_to_Chat";

let dialogContent = `<div><h2>Type the text you want to add to the chat message below.</h2><div>
                     <div>Text: <input name="TEXT_SUPPLIED" style="width:350px"/></div>`;
let d = new Dialog({
    title: "Text to Chat",
    content: dialogContent,
    buttons: {
        done: {
            label: "Send to Chat!",
            callback: (html) => {
                textMessage(html, "chat");
            }
        },
        show: {
            label: "Just Cancel",
        }
    },
    default: "done"
})
d.render(true)

//----------------------------------------------------------------------------------
// 
//
async function textMessage(html, mode) {
    const TEXT_SUPPLIED = html.find("[name=TEXT_SUPPLIED]")[0].value;
    if (TEXT_SUPPLIED === "") {
        const messageContent = `Someone was lazy and didn't provide input.`;
        await ChatMessage.create({ content: messageContent });
        return;
    }
    if (mode == "chat") {
        const messageContent = `Here is a textey message with the following input.<br><br>${TEXT_SUPPLIED}`;
        await ChatMessage.create({ content: messageContent });
        return;
    }
}
