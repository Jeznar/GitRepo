/**
 * Example dialog that requests user input, then uses the value
 */
let d = new Dialog({
  title: 'Example',
  content: `
    <form class="flexcol">
      <div class="form-group">
        <label for="exampleInput">Example Input</label>
        <input type="text" name="exampleInput" placeholder="Enter Value">
      </div>
      <div class="form-group">
        <label for="exampleSelect">Example Select</label>
        <select name="exampleSelect">
          <option value="option1">Option One</option>
          <option value="option2">Option Two</option>
          <option value="option3">Option Three</option>
        </select>
      </div>
      <div class="form-group">
        <label for="exampleColor">Example Color</label>
        <input class="color" type="text" name="exampleColor" value="#ff6400">
        <input type="color" value="#ff6400" data-edit="exampleColor">
      </div>
      <div class="form-group">
        <textarea name="exampleText" placeholder="Enter Text"></textarea>
      </div>
    </form>
  `,
  buttons: {
    no: {
      icon: '<i class="fas fa-times"></i>',
      label: 'Cancel'
    },
    yes: {
      icon: '<i class="fas fa-check"></i>',
      label: 'Yes',
      callback: (html) => {
        let input = html.find('[name="exampleInput"]').val();
        let select = html.find('[name="exampleSelect"]').val();
        let color = html.find('[name="exampleColor"]').val();
        let text = html.find('[name="exampleText"]').val();
        console.log(input, select, color, text);
      }
    },
  },
  default: 'yes',
  close: () => {
    console.log('Example Dialog Closed');
  }
}).render(true)