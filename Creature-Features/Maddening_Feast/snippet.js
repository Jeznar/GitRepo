let x = await Dialog.wait({
    title: "test",
    content: `<input>`,
    buttons: {
        test: {
            label: "Test",
            callback: (html) => {
                return html.find("input").val();
            }
        }
        
    }
});
console.log(x)