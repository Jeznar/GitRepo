// Source: https://www.reddit.com/r/FoundryVTT/comments/lql1qw/spiritual_guardians_macro/
//Check if a token is selected. Warn user if not.
if (token === undefined) {
	ui.notifications.info("Please select a token first!");
	return false;
}

//Set owner to first owner of the token, if one doesn't exist, set to current user. Finally get the default colour of this user.
let owner = (Object.keys(token.actor.data.permission)[1]);
if (owner === undefined) {
	owner = game.user._id;
}

//Return grid size, this is used later to determine the center of a token.
let gridSize = (scene.data.grid);

//Provide a switch to allow users to backout during the dialog process.
let proceed = 0;

//Create new dialog which provides a means to colour the token and set radius.
let d = new Dialog({
	title: "Spiritual Guardians",
	content: `
		<p>Click to add aura or remove the aura</p>
    `,
	buttons: {
		addbutton: {
			icon: '<i class="fas fa-check"></i>',
			label: "Add",
			callback: () => proceed = 1
		},
		removebutton: {
			icon: '<i class="fas fa-times"></i>',
			label: "Remove",
			callback: () => proceed = 2
		},
		cancelbutton: {
			icon: '<i class="fas fa-times"></i>',
			label: "Cancel",
			callback: () => proceed = 0
		}
	},
	default: "Cancel",
	close: html => {
		if (proceed==1) {
			let dist = 15; //Distance of the Aura
			createTemplate(dist);
		} else if (proceed==2){
			removeTemplate()
		} else {
			//close window
		}
	}
});
d.render(true);


//Create a Measured Template, to do so we require the radius distance (dist) and the colour (colour) set in the dialog. Here we multiply the grid size by the token size and finally half that value, we finally add the x and y coordinates to this so we ensure we are placing the aura directly in the middle of the token. We also use the shadeColor function to make the border 20% darker.
async function createTemplate(dist) {

	let response = await MeasuredTemplate.create({
		t: "circle",
		user: owner,
		x: token.data.x + 0.5 * (token.data.width * gridSize),
		y: token.data.y + 0.5 * (token.data.height * gridSize),
		direction: 0,
		angle: 360,
		distance: dist,
		borderColor: "#000000",
		fillColor: "#000000",
        texture: "", //path to Texture file if needed
        tmfxPreset: "Fairy Fireflies : Excited", //Effect name is shown in manual setup dialog
        tmfxTint: 0xa5f3ea, 
        tmfxTextureAlpha: 0.2
	});
	
	await tokenAttacher.attachElementToToken(response, token, true);
}

async function removeTemplate() {
const all_attached = await tokenAttacher.getAllAttachedElementsOfToken(token);
const all_attached_tiles = await tokenAttacher.getAllAttachedElementsByTypeOfToken(token, "MeasuredTemplate");
  for (var i = 0; i < all_attached_tiles.length; i++) {
    canvas.templates.deleteMany(all_attached_tiles[i]);
  }
}