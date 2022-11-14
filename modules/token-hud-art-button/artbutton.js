/**
 * This class is used as a namespace for Show Art
 * static methods. It has no constructor.
 *
 * @namespace ShowArt
 */
class ShowArt {
	/**
	 * Registers keybindings to show art for tokens and tiles.
	 *
	 * The default binding is Shift+Z to show the artwork, and
	 * Shift+X to share the alternative artwork (e.g. Token Actor).
	 *
	 * Holding Alt will suppress showing the art to everyone.
	 *
	 * @static
	 * @memberof ShowArt
	 */
	static registerBindings() {
		game.keybindings.register("token-hud-art-button", "token-open", {
			name: "TKNHAB.kebind.tokenImage.name",
			//hint: "TKNHAB.kebind.tokenImage.hint",
			hint: "Shows the art of the currently selected Token or Tile to everyone. Hold alt to show only to yourself.",
			editable: [
				{
					key: "KeyZ",				
					modifiers: ["Shift"]
				}
			],
			onDown: keybind => this.handleShowArt(keybind, false),
			reservedModifiers: ["Alt"]
		});
		game.keybindings.register("token-hud-art-button", "actor-open", {
			name: "TKNHAB.kebind.actorImage.name",
			//hint: "TKNHAB.kebind.actorImage.hint",
			hint: "Shows the art of the Actor for the currently selected Token to everyone. Hold alt to show only to yourself.",
			editable: [
				{
					key: "KeyX",
					modifiers: ["Shift"]
				}
			],
			onDown: keybind => this.handleShowArt(keybind, true),
			reservedModifiers: ["Alt"]
		});
	}

	
	/**
	 * Displays an image popup with the image and title from the 
	 * currently controlled objects.
	 *
	 * For each object, if the image is not null, displays the popup.
	 * If the alt key is not held, share the popup with all users.
	 *
	 * Optionally, an altenative image and title can be used for 
	 * applicable objects.
	 *
	 * @static
	 * @param {object} keybind - The keybinding data object
	 * @param {boolean} altImage - Whether or not to use the alternative image and title.
	 * @memberof ShowArt
	 */
	static handleShowArt(keybind, altImage) {
		game.canvas.activeLayer.controlled.forEach(object => {
			const { image, title } = this.getObjectData(object, altImage);
			if (!image) return;

			const pop = this.createImagePopup(image, title);
			if (!keybind.isAlt && game.user.isGM) pop.shareImage();
		});
	}

	/**
	 * Return the apprpriate image and title for the given object
	 * depending on the type of document it is.
	 * 
	 * If the document isn't supported, the image is null.
	 *
	 * When altImage is true, the alternative image and title will 
	 * be used for applicable objects.
	 *
	 * @static
	 * @param {Placeable} token                      - The object to get the data for.
	 * @param {boolean} altImage                     - Whether to use the alternative image and title.
	 * @return {{image: string|null, title: string}}   The image path and title. Image is null for incompatible objects.
	 * @memberof ShowArt
	 */
	static getObjectData(object, altImage) {
		switch (object.document.documentName) {
			case "Token": return this.getTokenData(object, altImage);
			case "Tile": return this.getTileData(object);
			default: return { image: null, title: "" };
		}
	}

	/**
	 * Return the apprpriate image and title for a token.
	 *
	 * When altImage is true, the image and title of the Actor
	 * the token represents is used. Otherwise, the image and title
	 * are the token image and name.
	 *
	 * @static
	 * @param {Token} token                       - The Token to get the data for.
	 * @param {boolean} altImage                  - Whether to use the Actor image.
	 * @return {{image: string, title: string}}     The image path and title.
	 * @memberof ShowArt
	 */
	static getTokenData(token, altImage) {
		const actor = this.getTokenActor(token.data);
		const images = this.getTokenImages(token.data, actor);
		const titles = this.getTokenTitles(token.data, actor);

		return {
			image: altImage ? images.actor : images.token,
			title: altImage ? titles.actor : titles.token
		};
	}


	/**
	 * Return the apprpriate image and title for a tile.
	 *
	 * @static
	 * @param {Tile} tile                       - The Tile to get the data for.
	 * @return {{image: string, title: string}}   The image path and title.
	 * @memberof ShowArt
	 */
	static getTileData(tile) {
		return {
			image: tile.data.img,
			title: game.i18n.localize("TKNHAB.TileImg")
		};
	}

	/**
	 * Handles the keydown events for tile and token keybindings
	 *
	 * @static
	 * @param {Event} event - The triggering event.
	 * @param {string} image - The file path of the image to display.
	 * @param {string} title - The name to display in the popup title bar.
	 * @memberof ShowArt
	 */
	static keyEventHandler(event, image, title) {
		if (event.target.id == "chat-message") return;
		if (event.shiftKey && (event.key == "Z" || event.key == "X")) {
			const pop = this.createImagePopup(image, title);
			if (!event.altKey && game.user.isGM) pop.shareImage();
		}
	}
	/**
	 * Handles the click or contextmenu events for tile/token art buttons
	 *
	 * @static
	 * @param {Event} event - The triggering event.
	 * @param {string} image - The file path of the image to display.
	 * @param {string} title - The name to display in the popup title bar.
	 * @memberof ShowArt
	 */
	static buttonEventHandler(event, image, title) {
		const pop = this.createImagePopup(image, title);
		if (event.shiftKey && game.user.isGM) pop.shareImage();
	}
	/**
	 * Creates and renders and ImagePopout
	 * with a specific image and title.
	 * the image is set to sharable.
	 *
	 * @static
	 * @param {string} image - The file path of the image to display.
	 * @param {string} title - The name to display in the popup title bar.
	 * @return {ImagePopout} The instance of the ImagePopout.
	 * @memberof ShowArt
	 */
	static createImagePopup(image, title) {
		return new MultiMediaPopout(image, {
			title, shareable: true,
		}).render(true);
	}
	/**
	 * Retrieves the Actor associated with a given token.
	 *
	 * @static
	 * @param {Token} token - The Token to look for the Actor of.
	 * @return {Actor} The associated Actor.
	 * @memberof ShowArt
	 */
	static getTokenActor(token) {
		return game.actors.get(token.actorId); 
	}
	/**
	 * @typedef {Object} titles
	 * @property {string} actor - The title for the Actor
	 * @property {string} token - The title for the Token
	 *
	 * Determin the correct image titles for either the token,
	 * or the associated Actor.
	 *
	 * @static
	 * @param {Token} token - The Token to get the title of.
	 * @param {Actor} actor - The Actor to get the title of.
	 * @return {titles} The titles for actor and token.
	 * @memberof ShowArt
	 */
	static getTokenTitles(token, actor) {
		const	M = CONST.TOKEN_DISPLAY_MODES,
				dn = token.displayName;

		if (dn == M.ALWAYS || dn == M.HOVER) return {
			actor: token.actorData.name || actor.name,
			token: token.name,
		}

		return { 
			actor: game.i18n.localize("TKNHAB.ActorImg"),
			token: game.i18n.localize("TKNHAB.TokenImg")
		}
	}
	/**
	 * @typedef {Object} images
	 * @property {string} actor - The image for the Actor
	 * @property {string} token - The image for the Token
	 *
 	 * Determin the correct image paths for either the token,
	 * or the associated Actor.
	 *
	 * @static
	 * @param {Token} token - The Token to get the path of.
	 * @param {Actor} actor - The Actor to get the path of.
	 * @return {images} The paths of the actor and token images. 
	 * @memberof ShowArt
	 */
	static getTokenImages(token, actor) {
		const mystery = "icons/svg/mystery-man.svg";
		const synthActor = token.actorData;

		let actorImg = synthActor.img || actor.data.img;
		let tokenImg = token.img;

		const am = actorImg === mystery;
		const tm = tokenImg === mystery;

		if (!(am && tm)) {
			actorImg = am ? tokenImg : actorImg;
			tokenImg = tm ? actorImg : tokenImg;
		}

		return { actor: actorImg, token: tokenImg };
	}
	/**
	 * Create the HTML elements for the HUD button
	 * including the Font Awesome icon and tooltop.
	 *
	 * @static
	 * @return {Element} The `<div>` element that is used as the HUD button.
	 * @memberof ShowArt
	 */
	static createButton() {
		let button = document.createElement("div");

		button.classList.add("control-icon");
		button.classList.add("artwork-open");
		button.innerHTML = `<i class="fas fa-image fa-fw"></i>`
		button.title = game.i18n.localize("TKNHAB.TooltipText");

		return button;
	}

	/**
	 * Adds the button to the Token HUD,
	 * and attaches event listeners.
	 *
	 * @static
	 * @param {TokenHUD} hud - The HUD object, not used.
	 * @param {jQuery} html - The jQuery reference to the HUD HTML.
	 * @param {Token} token - The data for the Token.
	 * @memberof ShowArt
	 */
	static prepTokenHUD(hud, html, token) {
		const actor = this.getTokenActor(token);
		const images = this.getTokenImages(token, actor);
		const titles = this.getTokenTitles(token, actor);
		const artButton = this.createButton();

		$(artButton)
			.click((event) =>
				this.buttonEventHandler(event, images.actor, titles.actor)
			)
			.contextmenu((event) =>
				this.buttonEventHandler(event, images.token, titles.token)
			);

		html.find("div.left").append(artButton);
	}
	/**
	 * Adds the button to the Tile HUD,
	 * and attaches event listeners.
	 *
	 * @static
	 * @param {TileHUD} hud - The HUD object, not used.
	 * @param {jQuery} html - The jQuery reference to the HUD HTML.
	 * @param {Tile} token - The data for the Tile.
	 * @memberof ShowArt
	 */
	static prepTileHUD(hud, html, tile) {
		const artButton = this.createButton();

		$(artButton)
			.click((event) =>
				this.buttonEventHandler(
					event, tile.img,
					game.i18n.localize("TKNHAB.TileImg")
				)
			)
		html.find("div.left").append(artButton);
	}
}

/**
 * Capable of handling images, as well as .mp4 and .webm video
 * not very sophisticated.
 *
 * @class MultiMediaPopout
 * @extends {ImagePopout}
 */
class MultiMediaPopout extends ImagePopout {
	/**
	 * Creates an instance of MultiMediaPopout.
	 *
	 * @param {string} src
	 * @param {object} [options={}]
	 * @memberof MultiMediaPopout
	 */
	constructor(src, options = {}) {
		super(src, options);

		this.video = [".mp4", "webm"].includes(
			src.slice(-4).toLowerCase()
		);

		this.options.template = "modules/token-hud-art-button/media-popout.html";
	}

	/** @override */
	async getData(options) {
		let data = await super.getData();
		data.isVideo = this.video;
		return data;
	}
	/**
	* Share the displayed image with other connected Users
	*/
	shareImage() {
		game.socket.emit("module.token-hud-art-button", {
			image: this.object,
			title: this.options.title,
			uuid: this.options.uuid
		});
	}

	/**
	 * Handle a received request to display media.
	 *
	 * @override
	 * @param {string} image - The path to the image/media resource.
	 * @param {string} title - The title for the popout title bar.
	 * @param {string} uuid
	 * @return {MultiMediaPopout}
	 * @private
	 */
	static _handleShareMedia({ image, title, uuid } = {}) {
		return new MultiMediaPopout(image, {
			title: title,
			uuid: uuid,
			shareable: false,
			editable: false
		}).render(true);
	}
}

// Hooks.once("init", ShowArt.registerBindings.bind(ShowArt)); // Jez commented out to disable keybinds

Hooks.once("ready", () => {
	game.socket.on("module.token-hud-art-button", MultiMediaPopout._handleShareMedia);
});

Hooks.on("renderTileHUD", (...args) => ShowArt.prepTileHUD(...args));
Hooks.on("renderTokenHUD", (...args) => ShowArt.prepTokenHUD(...args));