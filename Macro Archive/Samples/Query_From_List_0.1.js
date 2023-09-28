/*
--- query-from-list ---
Will open a dialog for the user to select an option, and call a callback when it's complete.
args:
  0  - query title
  1  - query text
  2  - callback to be called with selected option or null:
  3+ - options
source:
https://github.com/itamarcu/foundry-macros/blob/master/query-from-list.js
suggested icon:
https://i.imgur.com/iw4sH39.png
*/

const queryTitle = args[0] ? args[0] : "Sample Title"
const queryText =  args[1] ? args[1] : "Sample Query Text"
const callback =   args[2] ? args[2] : "Sample Callback Function -- Non-functional"
const queryOptions = args.slice(3)

if (!queryTitle || !queryText || !callback || !queryOptions) {
  return ui.notifications.error(
    `query-from-list arguments should be (queryTitle, queryText, callback, ...queryOptions),` +
    `but yours are: ${queryTitle}, ${queryText}, ${callback}, ${queryOptions}`,
  )
}

let template = `
<div>
    <div class="form-group">
        <label>${queryText}</label>
        <select id="selectedOption">`
for (let option of queryOptions) {
  template += `<option value="${option}">${option}</option>`
}
template += `</select>
    </div>
</div>`

new Dialog({
  title: queryTitle,
  content: template,
  buttons: {
    ok: {
      icon: '<i class="fas fa-check"></i>',
      label: 'OK',
      callback: async (html) => {
        const selectedOption = html.find('#selectedOption')[0].value
        console.log('selected option', selectedOption)
        callback(selectedOption)
      },
    },
    cancel: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel',
      callback: async (html) => {
        console.log('canceled')
        callback(null)
      },
    },
  },
  default: 'cancel',
}).render(true)