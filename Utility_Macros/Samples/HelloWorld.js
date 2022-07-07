const MACRONAME = "HelloWorld.js"
console.log("")
for (let i = 0; i < args.length; i++) console.log(`  args[${i}]`, args[i]);
let ending = "!"
if (args[1]) ending = args[1]
console.log(`Hello World ${ending}`)
if (args[0] === "off") console.log(`Goodbye World ${ending}`)