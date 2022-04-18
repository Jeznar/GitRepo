// Run this macro with "Execute as GM" checked
//args[0] = actor ID
//args[1] = update data

if(!args[0] || !args[1]) return ui.notifications.error(`${this.name}'s arguments are invalid.`);
await canvas.tokens.get(args[0]).document.actor.update(args[1]);