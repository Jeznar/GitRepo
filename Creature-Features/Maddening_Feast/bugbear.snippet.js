let content = currentCalendar.time
const mainDialog = new Promise((resolve, reject) => {
    let e = new Dialog({
        title:"Time is mysterious",
        content,
        render: async (html) => {
            
        }, 
        buttons: {
        a10: {
          label: `Add 10 min`,
          callback: () => {
            SimpleCalendar.api.changeDate({minute: +10});
            currentCalendar = SimpleCalendar.api.currentDateTimeDisplay();
            currentTime = currentCalendar.time;
            e.data.content = currentTime
            e.render(true);
          }
        },
        no:{
          icon: "<i class='fas fa-times'></i>",
          label: "Had enough!",
          callback: () => {
            resolve(false)
          }
        }
   }}).render(true)
}) 