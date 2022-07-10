const MACRONAME = "test_SimpleDialog.0.1.js"

let content = `<p style="color:DarkRed;">Your previously hex'ed target appears to be missing from the current scene.  
Your hex can be moved only if that creature is now dead.</p>
<p style="color:DarkSlateBlue;">Is that target actually dead?</p>`
let targetDead = await Dialog.confirm({
    title: 'Previous Hex Target is Missing!',
    content: content,
});
console.log("***** targetDead", targetDead)